#!/usr/bin/env node
// Render-on-demand harness for this Slidev deck.
//
//   node tools/shoot.mjs <slide-number> [outPath] [--width N] [--height N] [--rebuild]
//
// Renders a single slide to a PNG, HEADLESSLY, and prints the PNG's absolute
// path. No long-running dev server: it does a one-shot `slidev build` into a
// cached temp dir (rebuilt only when slides.md / theme / components / public
// change), serves that static build on an ephemeral localhost port, drives
// the already-installed playwright-chromium to slide N, screenshots, and exits.
//
// Why build-and-shoot instead of the dev server: the dev server is unreliable
// on Windows with a local theme (see setup/vite-plugins.ts) and a long-running
// server is a flake/hang trap for an agent loop. `slidev build` is solid and
// deterministic; one command in, one PNG out.
//
// The agent loop: edit slides.md -> `node tools/shoot.mjs 7` -> Read the PNG.
// The author's LIVE interactive view: see README / the notes printed by
// `node tools/shoot.mjs --serve` (a static-serve of the same build with HMR-
// free but stable rendering), or run the now-fixed `npm run dev`.

import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import {
  mkdirSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync,
} from 'node:fs'
import { join, extname, dirname, resolve, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const DECK = resolve(fileURLToPath(import.meta.url), '..', '..')
const OUT_DIR = join(DECK, '.shoot', 'build')        // cached static build (gitignored: .slidev/ sibling pattern; add .shoot/ to .gitignore)
const STAMP = join(DECK, '.shoot', 'build.stamp')    // source-fingerprint of the cached build
const SLIDEV_BIN = join(DECK, 'node_modules', '@slidev', 'cli', 'bin', 'slidev.mjs')

// ---- args -----------------------------------------------------------------
const args = process.argv.slice(2)
const flags = new Set(args.filter(a => a.startsWith('--')))
const positional = args.filter(a => !a.startsWith('--'))
const getOpt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : def
}
const serveOnly = flags.has('--serve')
// First positional is the slide, optionally with a click index as `<slide>.<clicks>`
// (e.g. `11.3` = slide 11 after 3 clicks). `--clicks N` overrides.
const [slidePart, clickPart] = String(positional[0] ?? '1').split('.')
const slideNo = Number.parseInt(slidePart, 10)
const clicks = Number.parseInt(getOpt('--clicks', clickPart ?? '0'), 10) || 0
const width = Number.parseInt(getOpt('--width', '1280'), 10)
const height = Number.parseInt(getOpt('--height', '720'), 10)
let outPath = positional[1] && !positional[1].startsWith('--')
  ? positional[1]
  : join(DECK, '.shoot', `slide-${String(slideNo).padStart(2, '0')}${clicks ? `-c${clicks}` : ''}.png`)
outPath = isAbsolute(outPath) ? outPath : resolve(process.cwd(), outPath)

if (!serveOnly && (!Number.isInteger(slideNo) || slideNo < 1)) {
  console.error('Usage: node tools/shoot.mjs <slide-number>[.<clicks>] [outPath] [--clicks N] [--width N] [--height N] [--rebuild]')
  process.exit(2)
}

// ---- source fingerprint (decide whether to rebuild) ------------------------
function fingerprintSources() {
  const h = createHash('sha1')
  const walk = (dir) => {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) }
    catch { return }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name === 'node_modules' || e.name === '.shoot' || e.name === 'dist'
        || e.name === 'assets' || e.name === '.slidev' || e.name === '.git') continue
      const p = join(dir, e.name)
      if (e.isDirectory()) walk(p)
      else h.update(p).update(String(statSync(p).mtimeMs))
    }
  }
  // Watch only the authored inputs.
  for (const f of ['slides.md', 'package.json']) {
    const p = join(DECK, f)
    if (existsSync(p)) h.update(p).update(String(statSync(p).mtimeMs))
  }
  for (const d of ['theme', 'components', 'public', 'figs', 'viz', 'setup']) {
    const p = join(DECK, d)
    if (existsSync(p)) walk(p)
  }
  return h.digest('hex')
}

function buildIfStale() {
  const want = fingerprintSources()
  const have = existsSync(STAMP) ? readFileSync(STAMP, 'utf-8').trim() : ''
  const upToDate = !flags.has('--rebuild')
    && have === want
    && existsSync(join(OUT_DIR, 'index.html'))
  if (upToDate) {
    console.error('[shoot] cached build is current')
    return Promise.resolve()
  }
  mkdirSync(dirname(STAMP), { recursive: true })
  console.error('[shoot] building deck (slidev build) ...')
  return new Promise((res, rej) => {
    const cp = spawn(
      process.execPath,
      [SLIDEV_BIN, 'build', join(DECK, 'slides.md'), '--out', OUT_DIR, '--base', '/'],
      { cwd: DECK, stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, NO_COLOR: '1' } },
    )
    cp.on('exit', (code) => {
      if (code === 0) { writeFileSync(STAMP, want); res() }
      else rej(new Error(`slidev build failed (exit ${code})`))
    })
    cp.on('error', rej)
  })
}

// ---- tiny static server ----------------------------------------------------
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon',
}
function startStaticServer(rootDir) {
  return new Promise((res) => {
    const server = createServer((req, resp) => {
      try {
        const url = decodeURIComponent((req.url || '/').split('?')[0])
        let file = join(rootDir, url)
        if (!file.startsWith(rootDir)) { resp.statusCode = 403; return resp.end('forbidden') }
        if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
        if (!existsSync(file)) file = join(rootDir, 'index.html') // SPA fallback
        const body = readFileSync(file)
        resp.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
        resp.end(body)
      }
      catch (e) { resp.statusCode = 500; resp.end(String(e)) }
    })
    server.listen(0, '127.0.0.1', () => res({ server, port: server.address().port }))
  })
}

// ---- main ------------------------------------------------------------------
async function main() {
  await buildIfStale()
  const { server, port } = await startStaticServer(OUT_DIR)
  const base = `http://127.0.0.1:${port}`

  if (serveOnly) {
    console.log(`[shoot] static build served at ${base}/  (Ctrl-C to stop)`) // live view
    console.log(`[shoot] open ${base}/1 for slide 1; routes are /<n>`)
    return // keep the server up
  }

  // playwright-chromium is in devDependencies.
  const { chromium } = await import('playwright-chromium')
  const browser = await chromium.launch({ headless: true })
  try {
    const pageCtx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2, // crisp text for the agent to read
    })
    const page = await pageCtx.newPage()
    // Slidev SPA route for a single slide is /<n>; the click state is honored
    // via the ?clicks=<c> query, so v-click build-up steps are reproducible.
    const target = `${base}/${slideNo}${clicks ? `?clicks=${clicks}` : ''}`
    await page.goto(target, { waitUntil: 'networkidle', timeout: 60000 })
    // Wait for the slide surface, then let fonts + KaTeX settle.
    await page.waitForSelector('.slidev-page, #slide-content, [class*="slidev-page"]', { timeout: 30000 })
      .catch(() => {})
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {})
    await page.waitForTimeout(clicks ? 900 : 700) // a touch longer to let click reveals transition in
    mkdirSync(dirname(outPath), { recursive: true })
    await page.screenshot({ path: outPath })
  }
  finally {
    await browser.close()
    server.close()
  }
  const sz = statSync(outPath).size
  console.error(`[shoot] slide ${slideNo} -> ${outPath} (${sz} bytes)`)
  console.log(outPath) // stdout: just the path, for easy capture
}

main().catch((e) => { console.error('[shoot] ERROR:', e?.message || e); process.exit(1) })
