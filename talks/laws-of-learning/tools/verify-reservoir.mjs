#!/usr/bin/env node
// Headless verification for the reservoir-schematic applet.
//
//   node tools/verify-reservoir.mjs
//
// Loads public/viz/reservoir-schematic.html (file://) at a 16:9 viewport
// (1280x720 @2x DPR), exactly as it will sit in the deck iframe, and checks the
// deck applet standard:
//   - no console / page errors
//   - the canvas paints (not a blank/black frame)
//   - no scroll overflow (fits the frame, no-scroll)
//   - the rho(W) slider drives contract -> edge -> grow, both in the regime the
//     page reports AND in the internal-signal activity (rms): activity must rise
//     monotonically from contract to grow.
//   - rho(W) is rescaled to the slider value (the real governing quantity)
// Screenshots all three regimes for the eye check. Prints PASS/FAIL + PNG paths.

import { resolve, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync, statSync } from 'node:fs'

const DECK = resolve(fileURLToPath(import.meta.url), '..', '..')
const HTML = join(DECK, 'public', 'viz', 'reservoir-schematic.html')
const OUT = join(DECK, '.shoot')
mkdirSync(OUT, { recursive: true })

const W = 1280, H = 720

function letRun(page, ms) { return page.waitForTimeout(ms) }
function setRho(page, v) {
  return page.evaluate((val) => {
    const el = document.getElementById('rho')
    el.value = String(val)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, v)
}
// read the page's own live model: the rescaled spectral radius, the regime it
// reports, and a short-window mean of the rms activity it computes.
async function probe(page) {
  return page.evaluate(async () => {
    function spec(W) { // recompute spectral radius of the live matrix, independently
      const N = W.length
      let x = new Float64Array(N); for (let i = 0; i < N; i++) x[i] = Math.sin(i + 1)
      const nrm = (v) => { let s = 0; for (let i = 0; i < N; i++) s += v[i] * v[i]; return Math.sqrt(s) }
      let nx = nrm(x) || 1; for (let i = 0; i < N; i++) x[i] /= nx
      let lam = 0
      for (let k = 0; k < 500; k++) {
        const y = new Float64Array(N)
        for (let i = 0; i < N; i++) { let s = 0; for (let j = 0; j < N; j++) s += W[i][j] * x[j]; y[i] = s }
        const ny = nrm(y); if (ny < 1e-300) return 0; lam = ny
        for (let i = 0; i < N; i++) x[i] = y[i] / ny
      }
      return lam
    }
    // sample rms over ~30 frames so the smoothed activity settles
    const samples = []
    for (let k = 0; k < 30; k++) { samples.push(window.rms ?? rms); await new Promise(r => requestAnimationFrame(r)) }
    samples.sort((a, b) => a - b)
    const med = samples[Math.floor(samples.length / 2)]
    return { rho: (window.rho ?? rho), regime: regime(), rmsMed: med, specLive: spec(W) }
  })
}

async function main() {
  const { chromium } = await import('playwright-chromium')
  const browser = await chromium.launch({ headless: true })
  const problems = []
  const consoleErrors = []
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + (e?.message || e)))

    await page.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle', timeout: 30000 })
    await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve())).catch(() => {})
    await letRun(page, 400)

    // --- fits the frame: no scroll overflow ---
    const overflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
    }))
    if (overflow.sw > overflow.cw + 1 || overflow.sh > overflow.ch + 1) {
      problems.push(`scroll overflow: content ${overflow.sw}x${overflow.sh} vs frame ${overflow.cw}x${overflow.ch}`)
    }

    // --- canvas paints (not blank) ---
    const painted = await page.evaluate(() => {
      const cv = document.getElementById('cv'); const c = cv.getContext('2d')
      const d = c.getImageData(0, 0, cv.width, cv.height).data
      let nonbg = 0
      for (let i = 0; i < d.length; i += 4 * 37) { if (d[i] > 40 || d[i + 1] > 45 || d[i + 2] > 55) nonbg++ }
      return nonbg
    })
    if (painted < 50) problems.push(`canvas looks blank (only ${painted} lit sample pixels)`)

    // --- drive rho across the three regimes; read regime + activity at each ---
    await setRho(page, 0.50); await letRun(page, 1500)
    const contract = await probe(page)
    const contractShot = join(OUT, 'reservoir-contract.png'); await page.screenshot({ path: contractShot })

    await setRho(page, 1.00); await letRun(page, 1500)
    const edge = await probe(page)
    const edgeShot = join(OUT, 'reservoir-edge.png'); await page.screenshot({ path: edgeShot })

    await setRho(page, 1.45); await letRun(page, 1500)
    const grow = await probe(page)
    const growShot = join(OUT, 'reservoir-grow.png'); await page.screenshot({ path: growShot })

    // --- assert the regimes are what the slider says ---
    if (contract.regime !== 'contract') problems.push(`rho=0.50 should be contract, got "${contract.regime}"`)
    if (edge.regime !== 'edge') problems.push(`rho=1.00 should be edge, got "${edge.regime}"`)
    if (grow.regime !== 'grow') problems.push(`rho=1.45 should be grow, got "${grow.regime}"`)

    // --- assert rho(W) is REALLY rescaled to the slider value (the governing quantity) ---
    const specOk = (set, want) => Math.abs(set.specLive - want) < 0.02
    if (!specOk(contract, 0.50)) problems.push(`spectral radius not rescaled at 0.50: live=${contract.specLive.toFixed(4)}`)
    if (!specOk(edge, 1.00)) problems.push(`spectral radius not rescaled at 1.00: live=${edge.specLive.toFixed(4)}`)
    if (!specOk(grow, 1.45)) problems.push(`spectral radius not rescaled at 1.45: live=${grow.specLive.toFixed(4)}`)

    // --- assert the internal signal contracts < edge < grows (monotone activity) ---
    const mono = contract.rmsMed < edge.rmsMed && edge.rmsMed < grow.rmsMed
    if (!mono) problems.push(`internal activity not monotone contract<edge<grow: ${contract.rmsMed.toFixed(3)} / ${edge.rmsMed.toFixed(3)} / ${grow.rmsMed.toFixed(3)}`)

    if (consoleErrors.length) problems.push(`console errors: ${consoleErrors.join(' | ')}`)

    console.log(JSON.stringify({
      pass: problems.length === 0,
      problems,
      contract, edge, grow,
      paintedSamplePixels: painted,
      overflow,
      shots: {
        contract: contractShot, contractBytes: statSync(contractShot).size,
        edge: edgeShot, edgeBytes: statSync(edgeShot).size,
        grow: growShot, growBytes: statSync(growShot).size,
      },
    }, null, 2))
    process.exitCode = problems.length === 0 ? 0 : 1
  } catch (e) {
    console.log(JSON.stringify({ pass: false, fatal: String(e?.stack || e) }, null, 2))
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}
main()
