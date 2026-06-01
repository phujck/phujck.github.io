#!/usr/bin/env node
// Headless verification for the two-level-phenomenology applet.
//
//   node tools/verify-phenomenology.mjs
//
// Loads public/viz/two-level-phenomenology.html directly (file://) at a 16:9
// viewport (1280x720 @2x DPR), exactly as it will sit in the deck iframe, and
// checks the standard: no console/page errors, the canvas paints (not blank),
// no scroll overflow (fits the frame), and the N/tau sliders drive the
// settle -> ring transition. Screenshots the settling state and the ringing
// state for the eye check. Prints PASS/FAIL and the PNG paths.

import { resolve, join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync, statSync } from 'node:fs'

const DECK = resolve(fileURLToPath(import.meta.url), '..', '..')
const HTML = join(DECK, 'public', 'viz', 'two-level-phenomenology.html')
const OUT = join(DECK, '.shoot')
mkdirSync(OUT, { recursive: true })

const W = 1280, H = 720

function letRun(page, ms) { return page.waitForTimeout(ms) }

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

    // --- fits the frame: no scroll overflow on body ---
    const overflow = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
    }))
    if (overflow.sw > overflow.cw + 1 || overflow.sh > overflow.ch + 1) {
      problems.push(`scroll overflow: content ${overflow.sw}x${overflow.sh} vs frame ${overflow.cw}x${overflow.ch}`)
    }

    // --- canvas paints (not a blank/black frame): sample non-background pixels ---
    const painted = await page.evaluate(() => {
      const cv = document.getElementById('cv')
      const ctx = cv.getContext('2d')
      const { width, height } = cv
      const data = ctx.getImageData(0, 0, width, height).data
      let nonbg = 0
      // background is ~#0a0d12 / #0e1116; count pixels clearly brighter
      for (let i = 0; i < data.length; i += 4 * 37) { // sparse sample
        if (data[i] > 40 || data[i + 1] > 45 || data[i + 2] > 55) nonbg++
      }
      return nonbg
    })
    if (painted < 50) problems.push(`canvas looks blank (only ${painted} lit sample pixels)`)

    // --- the model: verdict at the default (low N) state should be 'settles' ---
    // Read the live regime() and verdict text the page computes.
    const lowState = await page.evaluate(() => ({
      verdict: document.getElementById('verdict').textContent.trim(),
      n: document.getElementById('nN').value,
      tau: document.getElementById('tau').value,
    }))

    await letRun(page, 2600) // let the series build several rungs at the settling state
    const settleShot = join(OUT, 'phenom-settle.png')
    await page.screenshot({ path: settleShot })

    // --- drive N above threshold: crank the slider to the top and dispatch input ---
    await page.evaluate(() => {
      const el = document.getElementById('nN')
      el.value = '900'
      el.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const highState = await page.evaluate(() => ({
      verdict: document.getElementById('verdict').textContent.trim(),
      n: document.getElementById('nN').value,
    }))
    await letRun(page, 3200) // let the orbit lock onto the period-2 ring
    const ringShot = join(OUT, 'phenom-ring.png')
    await page.screenshot({ path: ringShot })

    // --- also confirm tau moves the boundary: at high N, a very stale loop (large tau)
    //     has a higher N_c, but N=900 should still ring; drop N to 250 and check tau
    //     flips the verdict (250 settles at small tau? boundary ~294 at tau=1 => settles). ---
    const midProbe = await page.evaluate(() => {
      const setN = (v) => { const el = document.getElementById('nN'); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
      const setTau = (v) => { const el = document.getElementById('tau'); el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })) }
      setN(250); setTau(0.3)
      const a = document.getElementById('verdict').textContent.trim() // N=250, tau=0.3 -> N_c~169 -> rings
      setTau(6.0)
      const b = document.getElementById('verdict').textContent.trim() // N=250, tau=6 -> N_c~535 -> settles
      return { hotTau: a, coldTau: b }
    })

    // --- assemble verdicts ---
    const transitionWorks = /SETTLE/i.test(lowState.verdict) && /RING/i.test(highState.verdict)
    if (!transitionWorks) {
      problems.push(`N slider did not drive settle->ring: low(N=${lowState.n})="${lowState.verdict}", high(N=${highState.n})="${highState.verdict}"`)
    }
    const tauWorks = /RING/i.test(midProbe.hotTau) && /SETTLE/i.test(midProbe.coldTau)
    if (!tauWorks) {
      problems.push(`tau slider did not move the boundary at N=250: tau=0.3="${midProbe.hotTau}", tau=6.0="${midProbe.coldTau}"`)
    }
    if (consoleErrors.length) problems.push(`console errors: ${consoleErrors.join(' | ')}`)

    // --- report ---
    console.log(JSON.stringify({
      pass: problems.length === 0,
      problems,
      lowState, highState, midProbe,
      paintedSamplePixels: painted,
      overflow,
      settleShot, settleBytes: statSync(settleShot).size,
      ringShot, ringBytes: statSync(ringShot).size,
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
