#!/usr/bin/env node
// Headless verification for the model-loop applet (the central derivation slide).
//
//   node tools/verify-model-loop.mjs
//
// Loads public/viz/model-loop.html (file://) at a 16:9 viewport (1280x720 @2x
// DPR), exactly as it will sit in the deck iframe, and checks the deck applet
// standard:
//   - no console / page errors
//   - the canvas paints (not a blank/black frame) at every step
//   - no scroll overflow (fits the frame, no-scroll)
//   - the stepper walks all 8 steps; the loop lights the right node per step
//   - each step's equation panel actually reveals (the `appear` settle completes)
//   - the ASSEMBLE steps run the live return-map cobweb (orbit advances)
// Screenshots each of the 8 states + the final assembled return map for the eye
// check. Prints PASS/FAIL and the PNG paths.

import { resolve, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { mkdirSync, statSync } from 'node:fs'

const DECK = resolve(fileURLToPath(import.meta.url), '..', '..')
const HTML = join(DECK, 'public', 'viz', 'model-loop.html')
const OUT = join(DECK, '.shoot')
mkdirSync(OUT, { recursive: true })

const W = 1280, H = 720

function letRun(page, ms) { return page.waitForTimeout(ms) }

// expected focus node per step (mirrors STEPS[].focus in the page)
const EXPECT_FOCUS = ['theta', 'h', 'state', 'm', 'theta', 'all', 'all', 'all']
const EXPECT_KEY = ['theta', 'h', 'state', 'm', 'feedback', 'fp2', 'linearise', 'returnmap']

// drive the page's own stepper directly, then read its live state
function gotoStep(page, i) {
  return page.evaluate((n) => { setPlaying(false); gotoStep(n); }, i)
}
function readState(page) {
  return page.evaluate(() => ({
    step, key: STEPS[step].key, focus: STEPS[step].focus,
    nsteps: STEPS.length, appear,
    cobLen: (STEPS[step].focus === 'all') ? cob.hist.length : -1,
  }))
}
// count lit (non-background) pixels so we can confirm the canvas painted
function painted(page) {
  return page.evaluate(() => {
    const cv = document.getElementById('cv'); const c = cv.getContext('2d')
    const d = c.getImageData(0, 0, cv.width, cv.height).data
    let n = 0
    for (let i = 0; i < d.length; i += 4 * 37) { if (d[i] > 40 || d[i + 1] > 45 || d[i + 2] > 55) n++ }
    return n
  })
}

async function main() {
  const { chromium } = await import('playwright-chromium')
  const browser = await chromium.launch({ headless: true })
  const problems = []
  const consoleErrors = []
  const shots = {}
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

    // --- step count sanity ---
    const meta = await page.evaluate(() => ({ nsteps: STEPS.length }))
    if (meta.nsteps !== EXPECT_FOCUS.length) {
      problems.push(`expected ${EXPECT_FOCUS.length} steps, page has ${meta.nsteps}`)
    }

    // --- walk every step: light the right node, reveal the panel, paint ---
    const stepReports = []
    for (let i = 0; i < meta.nsteps; i++) {
      await gotoStep(page, i)
      await letRun(page, 1300)            // let `appear` settle + cobweb advance
      const st = await readState(page)
      const lit = await painted(page)
      const shot = join(OUT, `model-loop-${i + 1}-${EXPECT_KEY[i] || st.key}.png`)
      await page.screenshot({ path: shot })
      shots[`step${i + 1}_${st.key}`] = shot

      if (EXPECT_FOCUS[i] && st.focus !== EXPECT_FOCUS[i]) {
        problems.push(`step ${i + 1}: focus="${st.focus}", expected "${EXPECT_FOCUS[i]}"`)
      }
      if (EXPECT_KEY[i] && st.key !== EXPECT_KEY[i]) {
        problems.push(`step ${i + 1}: key="${st.key}", expected "${EXPECT_KEY[i]}"`)
      }
      if (lit < 80) problems.push(`step ${i + 1}: canvas looks blank (${lit} lit pixels)`)
      if (st.appear < 0.95) problems.push(`step ${i + 1}: panel did not finish revealing (appear=${st.appear.toFixed(2)})`)
      if (st.focus === 'all' && st.cobLen < 2) problems.push(`step ${i + 1}: cobweb orbit did not advance (len=${st.cobLen})`)
      stepReports.push({ step: i + 1, key: st.key, focus: st.focus, appear: +st.appear.toFixed(2), cobLen: st.cobLen, lit })
    }

    // --- the live cobweb on the final step actually iterates (orbit grows over time) ---
    await gotoStep(page, meta.nsteps - 1)
    await letRun(page, 600)
    const cobA = await page.evaluate(() => cob.hist.length)
    await letRun(page, 1400)
    const cobB = await page.evaluate(() => cob.hist.length)
    if (!(cobB > cobA || cobB >= 70)) problems.push(`final return-map cobweb not iterating: len ${cobA} -> ${cobB}`)

    // --- the back/step buttons + keyboard drive the stepper ---
    await gotoStep(page, 0)
    await page.evaluate(() => document.getElementById('nextBtn').click())
    const afterNext = await page.evaluate(() => step)
    await page.evaluate(() => document.getElementById('prevBtn').click())
    const afterPrev = await page.evaluate(() => step)
    if (afterNext !== 1 || afterPrev !== 0) problems.push(`stepper buttons broken: next->${afterNext}, prev->${afterPrev}`)

    if (consoleErrors.length) problems.push(`console errors: ${consoleErrors.join(' | ')}`)

    console.log(JSON.stringify({
      pass: problems.length === 0,
      problems,
      overflow,
      stepReports,
      cobwebGrowth: { before: cobA, after: cobB },
      shots: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, { path: v, bytes: statSync(v).size }])),
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
