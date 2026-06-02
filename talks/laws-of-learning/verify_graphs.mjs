// Headless verification of the static graph snapshots.
// For each: load via file:// (server-free), assert it renders, assert no console
// errors, programmatically click a graph node, assert the detail panel updates.
import { chromium } from 'playwright-chromium';
import { pathToFileURL } from 'url';
import path from 'path';

const FIGS = path.resolve('public/figs');
const TARGETS = [
  { name: 'talk-graph', file: path.join(FIGS, 'talk-graph.html') },
  { name: 'wiki-graph', file: path.join(FIGS, 'wiki-graph.html') },
];

const VIEWPORT = { width: 1280, height: 720 }; // 16:9

function ringLog(name, ok, msg) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  [${name}] ${msg}`);
}

const browser = await chromium.launch();
let allOk = true;

for (const t of TARGETS) {
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));

  const url = pathToFileURL(t.file).href;
  await page.goto(url, { waitUntil: 'load' });
  // give KaTeX (deferred) + the force layout a beat to settle and re-render
  await page.waitForTimeout(900);

  // 1) renders: canvas present and non-zero, macro nodes laid out
  const meta = await page.evaluate(() => {
    const cv = document.getElementById('cv');
    return {
      cvW: cv ? cv.width : 0, cvH: cv ? cv.height : 0,
      macroCount: (typeof MACRO !== 'undefined') ? MACRO.length : -1,
      edgeCount: (typeof MACRO_EDGES !== 'undefined') ? MACRO_EDGES.length : -1,
      hasPos: (typeof pos !== 'undefined') ? Object.keys(pos).length : -1,
      sel: (typeof sel !== 'undefined') ? sel : null,
    };
  });
  const rendered = meta.cvW > 0 && meta.cvH > 0 && meta.macroCount > 0 && meta.hasPos > 0;
  ringLog(t.name, rendered, `render: canvas ${meta.cvW}x${meta.cvH}, ${meta.macroCount} macro nodes, ${meta.edgeCount} edges, initial sel=${meta.sel}`);
  if (!rendered) allOk = false;

  // screenshot the initial state
  const shotInit = path.join(FIGS, `_verify_${t.name}_initial.png`);
  await page.screenshot({ path: shotInit });

  // detail panel h2 before the click (boot() selects a node on load)
  const h2Before = await page.evaluate(() => {
    const h = document.querySelector('#body h2'); return h ? h.textContent : null;
  });

  // 2) click a node: pick a macro node DIFFERENT from the current selection,
  // compute its screen pixel from the in-page transform, click there.
  const clickTarget = await page.evaluate(() => {
    // choose a node that is not the current selection and ideally a coarse/result one
    const candidates = MACRO.filter(n => n.id !== sel);
    // prefer a result (talk) or domain (wiki) for a meaningful panel
    const pref = candidates.find(n => n.kind === 'result' || n.kind === 'domain') || candidates[0];
    const p = pos[pref.id];
    const d = window.devicePixelRatio || 1;
    // screen coords in CSS pixels (sx/sy use the ctx transform set with d)
    return { id: pref.id, label: pref.label, x: T.ox + p.x * T.s, y: T.oy + p.y * T.s };
  });
  const r = await page.evaluate(() => {
    const cv = document.getElementById('cv'); const b = cv.getBoundingClientRect();
    return { left: b.left, top: b.top };
  });
  await page.mouse.click(r.left + clickTarget.x, r.top + clickTarget.y);
  await page.waitForTimeout(350);

  const after = await page.evaluate(() => {
    const h = document.querySelector('#body h2');
    const rows = document.querySelectorAll('#body .row').length;
    const chips = document.querySelectorAll('#body .chip').length;
    const math = document.querySelectorAll('#body .math .katex, #body .math code').length;
    return { sel, h2: h ? h.textContent : null, rows, chips, math };
  });
  const clickWorked = after.sel === clickTarget.id && after.h2 && after.rows >= 1;
  ringLog(t.name, clickWorked,
    `click: node ${clickTarget.id} -> sel=${after.sel}, h2="${(after.h2||'').slice(0,42)}", rows=${after.rows}, chips=${after.chips}, math=${after.math}`);
  if (!clickWorked) allOk = false;

  // 2b) chip navigation: click the first neighbour chip, assert selection changes again
  const chipNav = await page.evaluate(async () => {
    const c = document.querySelector('#body [data-go]');
    if (!c) return { ok: false, reason: 'no chip' };
    const before = sel;
    c.click();
    await new Promise(r => setTimeout(r, 150));
    return { ok: sel !== before && !!document.querySelector('#body h2'), before, after: sel };
  });
  ringLog(t.name, chipNav.ok, `chip-nav: ${chipNav.before} -> ${chipNav.after}`);
  if (!chipNav.ok) allOk = false;

  // screenshot after interaction
  const shotClick = path.join(FIGS, `_verify_${t.name}_clicked.png`);
  await page.screenshot({ path: shotClick });

  // 3) no console / page errors
  const noErr = consoleErrors.length === 0 && pageErrors.length === 0;
  ringLog(t.name, noErr, `errors: ${consoleErrors.length} console, ${pageErrors.length} page` +
    (noErr ? '' : `\n   console: ${consoleErrors.join(' | ')}\n   page: ${pageErrors.join(' | ')}`));
  if (!noErr) allOk = false;

  // 4) no-scroll at 16:9: document does not overflow the viewport
  const overflow = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
    sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight,
  }));
  const noScroll = overflow.sw <= overflow.cw + 1 && overflow.sh <= overflow.ch + 1;
  ringLog(t.name, noScroll, `no-scroll: doc ${overflow.sw}x${overflow.sh} vs view ${overflow.cw}x${overflow.ch}`);
  if (!noScroll) allOk = false;

  await ctx.close();
  console.log('');
}

await browser.close();
console.log(allOk ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
process.exit(allOk ? 0 : 1);
