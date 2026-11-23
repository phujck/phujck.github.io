/* From a simulation to a manuscript figure. The plot is drawn from the run's own table (costs.csv), round by round,
   and the chain beneath shows what the figure rests on. Adding one newline to the table changes its fingerprint,
   which is computed here from the real bytes, and marks the figure and its place in the manuscript for review. */
(() => {
  'use strict';
  const I = window.IFC, EM = window.EigenMotion, M = window.EG_MOTION; if (!I || !EM) return;
  const NS = 'http://www.w3.org/2000/svg', $ = I.$, $$ = I.$$;
  const sv = (tag, cls, attrs, parent) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const plot = $('#sim-plot'), rows = $$('#sim-table tbody tr'), nodes = Object.fromEntries($$('.ifc-node').map(n => [n.dataset.node, n])), finger = $('#sim-finger'), hash = $('#sim-hash');
  const change = $('#sim-change'), restore = $('#sim-restore'), replay = $('#sim-replay');
  if (!plot) return;

  /* the plot: the same numbers as the table, with room for the two labels */
  const AREA = [0, 1, 2, 3, 4], WALL = [0, 1, 3, 7, 15], X = i => 46 + i * 96, Y = v => 292 - v * 17.6;
  [0, 5, 10, 15].forEach(v => { sv('path', 'ifc-grid', { d: `M46 ${Y(v)}H438` }, plot); const t = sv('text', '', { x: 38, y: Y(v) + 5, 'text-anchor': 'end' }, plot); t.textContent = v; });
  [0, 1, 2, 3, 4].forEach(i => { const t = sv('text', '', { x: X(i), y: 311, 'text-anchor': 'middle' }, plot); t.textContent = i; });
  sv('path', 'ifc-axis', { d: `M46 14V292H438` }, plot);
  const ax = sv('text', '', { x: 242, y: 327, 'text-anchor': 'middle' }, plot); ax.textContent = 'rounds of subdivision';
  const cw = sv('path', 'ifc-c-wall', {}, plot), ca = sv('path', 'ifc-c-area', {}, plot);
  const dw = WALL.map((v, i) => sv('circle', 'ifc-d-wall', { cx: X(i), cy: Y(v), r: 4.2 }, plot)), da = AREA.map((v, i) => sv('circle', 'ifc-d-area', { cx: X(i), cy: Y(v), r: 4.2 }, plot));
  const la = sv('text', 'ifc-k-area', { 'text-anchor': 'end' }, plot), lw = sv('text', 'ifc-k-wall', { 'text-anchor': 'end' }, plot); la.textContent = 'priced by area'; lw.textContent = 'priced by wall length';
  const at = (S, u) => { const i = Math.min(3, Math.floor(u)), f = u - i; return [X(i) + (X(i + 1) - X(i)) * f, Y(S[i] + (S[i + 1] - S[i]) * f)]; };
  const line = (S, u) => { let d = `M${X(0)} ${Y(S[0])}`; for (let i = 1; i <= Math.floor(u); i++) d += `L${X(i)} ${Y(S[i])}`; if (u % 1 > 1e-3) { const p = at(S, u); d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`; } return d; };

  const round = new EM.Spring(0, 26, 10.4), stale = new EM.Spring(0, 120, 22); let shownRound = -1;
  const draw = () => {
    const u = EM.clamp(round.v, 0, 4); ca.setAttribute('d', line(AREA, u)); cw.setAttribute('d', line(WALL, u));
    [da, dw].forEach(set => set.forEach((d, i) => { const k = EM.clamp((u - i + .12) * 6); d.setAttribute('r', (4.2 * k).toFixed(2)); }));
    const pa = at(AREA, Math.min(u, 3.999)), pw = at(WALL, Math.min(u, 3.999)); la.setAttribute('x', Math.max(170, pa[0] - 6)); la.setAttribute('y', pa[1] + 30); lw.setAttribute('x', Math.max(200, pw[0] - 14)); lw.setAttribute('y', pw[1] - 9);
    la.style.opacity = lw.style.opacity = EM.clamp(u * 1.5 - .4).toFixed(2);
    plot.style.opacity = (1 - .45 * EM.clamp(stale.v)).toFixed(3);
    const r = Math.round(u - .08); if (r !== shownRound) { shownRound = r; rows.forEach((tr, i) => { tr.classList.toggle('is-in', i <= r); tr.classList.toggle('is-now', i === r); }); }
  };
  I.tickers.add(dt => { const moving = I.stepAll([round, stale], dt); draw(); return moving; });
  const run = () => { round.snap(0); shownRound = -1; round.to(4); I.wake(); };

  /* the fingerprint, from the bytes of the table itself */
  let bytes = null, isStale = false;
  const digest = async extra => { const b = new Uint8Array(bytes.length + extra); b.set(bytes); for (let i = 0; i < extra; i++) b[bytes.length + i] = 10; const h = await crypto.subtle.digest('SHA-256', b); return [...new Uint8Array(h)].slice(0, 6).map(x => x.toString(16).padStart(2, '0')).join(' '); };
  const setNode = (k, cls, text) => { const n = nodes[k]; n.classList.toggle('is-stale', cls === 'stale'); $('em', n).textContent = text; };
  const show = async () => {
    if (bytes && crypto.subtle) hash.textContent = await digest(isStale ? 1 : 0); else hash.textContent = isStale ? 'changed' : 'as recorded';
    finger.classList.toggle('is-stale', isStale); stale.to(isStale ? 1 : 0);
    setNode('table', isStale ? 'stale' : '', isStale ? 'one newline added' : 'current'); setNode('figure', isStale ? 'stale' : '', isStale ? 'needs review' : 'current'); setNode('page', isStale ? 'stale' : '', isStale ? 'needs review' : 'current'); setNode('run', '', isStale ? 'intact' : 'recorded');
    change.disabled = isStale; restore.disabled = !isStale; I.wake();
  };
  fetch('./costs.csv').then(r => r.arrayBuffer()).then(b => { bytes = new Uint8Array(b); show(); }).catch(() => show());
  [change, restore, replay].forEach(b => b.hidden = false);
  const tour = $('.ifc-tour').tour, goStale = () => { const i = tour ? tour.has('simulation-stale') : -1; if (i >= 0 && tour.i !== i) tour.go(i); };
  change.addEventListener('click', () => { isStale = true; show(); goStale(); });
  restore.addEventListener('click', () => { isStale = false; show(); });
  replay.addEventListener('click', run);

  /* each stop lights the part of the chain it is about */
  if (tour) tour.opts.onGo = (i, st) => { const k = st.dataset.node; Object.entries(nodes).forEach(([id, n]) => n.classList.toggle('is-on', id === k || (k === 'stale' && id === 'table'))); if (k === 'run') run(); };
  let started = false; const start = () => { if (started) return; started = true; if (M.off) { round.snap(4); draw(); } else run(); };
  requestAnimationFrame(() => requestAnimationFrame(start));
})();
