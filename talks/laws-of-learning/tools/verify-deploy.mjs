#!/usr/bin/env node
// Verify the DEPLOYED deck the way GitHub Pages actually serves it: static files,
// and the site's ROOT 404.html (NOT a nested SPA fallback) for any unknown path.
//
// The deck uses hash routing, so a refresh on a deep slide requests only BASE/
// (the hash never reaches the server) and must always load. This catches a
// regression to history mode (which 404s on a static host) and any broken
// applet/iframe request, and confirms each live applet (viz + figs html) loads.
//
//   node tools/verify-deploy.mjs            # defaults to v3
//   node tools/verify-deploy.mjs v2         # any version dir under talks/
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOT = 'C:/Users/gerar/VScodeProjects/phujck.github.io'
const VER = process.argv[2] || 'v3'
const BASE = `/talks/laws-of-learning-${VER}`
const ROOT_404 = join(ROOT, '404.html')
const OUT = join(ROOT, 'talks/laws-of-learning/.shoot'); mkdirSync(OUT, { recursive: true })
const MIME = { '.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml',
  '.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon' }

const server = createServer((req, resp) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0])
    let file = join(ROOT, url)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    if (!existsSync(file)) {            // GitHub Pages: ROOT 404.html, 404 status
      resp.statusCode = 404; resp.setHeader('Content-Type', 'text/html')
      return resp.end(existsSync(ROOT_404) ? readFileSync(ROOT_404) : 'not found')
    }
    resp.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
    resp.end(readFileSync(file))
  } catch (e) { resp.statusCode = 500; resp.end(String(e)) }
})

async function main() {
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const port = server.address().port, origin = `http://127.0.0.1:${port}`
  const { chromium } = await import('playwright-chromium')
  const b = await chromium.launch({ headless: true })
  const consoleErrors = [], badRequests = [], appletOK = new Set()
  const benign = (t) => /wake lock/i.test(t)
  try {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
    const p = await ctx.newPage()
    p.on('console', (m) => { if (m.type() === 'error' && !benign(m.text())) consoleErrors.push(m.text()) })
    p.on('pageerror', (e) => { const t = String(e?.message || e); if (!benign(t)) consoleErrors.push('pageerror: ' + t) })
    p.on('response', (r) => {
      const s = r.status(), u = r.url()
      if (!u.startsWith(origin)) return
      const rel = u.replace(origin, '')
      if (s >= 400) badRequests.push(`${s} ${rel}`)
      if (s < 400 && /\/(viz|figs)\/[^/]+\.html/.test(rel)) appletOK.add(rel)
    })
    // Each entry is a refresh on a deep slide: with hash routing the server only
    // sees BASE/, so every one must mount the deck. Applet/graph slides advance
    // clicks so the eager iframes load.
    const slides = [["title",1,0],["manyfaces",4,2],["modelloop",14,2],["viable",24,2],
                    ["talkgraph",28,2],["wikigraph",29,2],["surprise",33,6]]
    for (const [name, n, clicks] of slides) {
      await p.goto(`${origin}${BASE}/#/${n}`, { waitUntil: 'commit', timeout: 60000 })
      await p.reload({ waitUntil: 'networkidle', timeout: 60000 })   // a true refresh on this deep slide
      const mounted = await p.waitForSelector('[class*="slidev-page"]', { timeout: 20000 }).then(() => true).catch(() => false)
      if (!mounted) consoleErrors.push(`slide ${n} (${name}): deck did not mount on hash refresh`)
      for (let i = 0; i < clicks; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(140) }
      await p.waitForTimeout(700)
    }
    await p.screenshot({ path: join(OUT, `${VER}-deploy-final.png`) })
    const pass = consoleErrors.length === 0 && badRequests.length === 0
    console.log(JSON.stringify({ version: VER, pass, consoleErrors, badRequests, appletsLoaded: [...appletOK].sort() }, null, 2))
    process.exitCode = pass ? 0 : 1
  } catch (e) {
    console.log(JSON.stringify({ pass: false, fatal: String(e?.stack || e) }, null, 2)); process.exitCode = 1
  } finally { await b.close(); server.close() }
}
main()
