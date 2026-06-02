#!/usr/bin/env node
// Verify the DEPLOYED v2 build under its real base path. Serves the repo root
// (so /talks/laws-of-learning-v2/* resolves exactly as on the live site), loads
// the deck in headless chromium, walks key slides, and fails on any console
// error or broken SAME-ORIGIN request (a wrong --base or a missing asset). An
// external font 404 is noted, not failed - it is not a deploy defect.
//
//   node tools/verify-deploy.mjs
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = 'C:/Users/gerar/VScodeProjects/phujck.github.io'
const BASE = '/talks/laws-of-learning-v2'
const DECK_INDEX = join(ROOT, 'talks/laws-of-learning-v2/index.html')
const OUT = join(ROOT, 'talks/laws-of-learning/.shoot')
mkdirSync(OUT, { recursive: true })
const MIME = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml',
  '.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.webmanifest':'application/manifest+json' }

const server = createServer((req, resp) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0])
    let file = join(ROOT, url)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) {
      if (url.startsWith(BASE)) file = DECK_INDEX          // deck SPA fallback
      else { resp.statusCode = 404; return resp.end('not found') }
    }
    resp.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
    resp.end(readFileSync(file))
  } catch (e) { resp.statusCode = 500; resp.end(String(e)) }
})

async function main() {
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const port = server.address().port
  const origin = `http://127.0.0.1:${port}`
  const { chromium } = await import('playwright-chromium')
  const browser = await chromium.launch({ headless: true })
  const consoleErrors = [], badRequests = [], external = []
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    // Wake Lock is a benign Slidev presentation feature: headless chromium denies
    // the permission and throws, but it is not a deploy defect (a real browser
    // grants it or degrades silently). Filter it so the verdict reflects real bugs.
    const benign = (t) => /wake lock/i.test(t)
    page.on('console', (m) => { if (m.type() === 'error' && !benign(m.text())) consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => { const t = String(e?.message || e); if (!benign(t)) consoleErrors.push('pageerror: ' + t) })
    page.on('response', (r) => {
      const s = r.status()
      if (s >= 400) (r.url().startsWith(origin) ? badRequests : external).push(`${s} ${r.url()}`)
    })

    const slides = { title: 1, manyfaces: 4, modelloop: 14, viable: 24, surprise: 33 }
    for (const [name, n] of Object.entries(slides)) {
      const clicks = name === 'surprise' ? 6 : 0
      await page.goto(`${origin}${BASE}/${n}${clicks ? `?clicks=${clicks}` : ''}`, { waitUntil: 'networkidle', timeout: 60000 })
      await page.waitForSelector('[class*="slidev-page"]', { timeout: 20000 }).catch(() => {})
      await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {})
      await page.waitForTimeout(clicks ? 900 : 500)
    }
    // capture the deployed surprise slide as final proof
    await page.screenshot({ path: join(OUT, 'deploy-surprise.png') })

    const pass = consoleErrors.length === 0 && badRequests.length === 0
    console.log(JSON.stringify({ pass, consoleErrors, badRequests, externalFailures: external }, null, 2))
    process.exitCode = pass ? 0 : 1
  } catch (e) {
    console.log(JSON.stringify({ pass: false, fatal: String(e?.stack || e) }, null, 2)); process.exitCode = 1
  } finally { await browser.close(); server.close() }
}
main()
