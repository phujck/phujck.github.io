/* "What has it made?": the timeline of things made with EigenEngine, in the order they were made.
   Registers EIGEN_NODES.made and its nine children (made-learning … made-film), each to the node contract:
   words at two levels, a looping drawing taken from the thing itself, and a live exhibit of its real material.
   The item exhibits (applets, slides, pages, the film, the computed figures) are in items.js and data.js beside
   this file and are fetched only when an item is first opened. Dates were checked against the site's history. */
(() => {
  'use strict';
  const BASE = (() => { const s = document.currentScript && document.currentScript.src || ''; const m = s.match(/^(.*\/)node\.js/); return m ? m[1] : '/eigenengine/made/'; })();
  const NS = 'http://www.w3.org/2000/svg';
  const MOT = () => window.EG_MOTION || { off: false };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); }, mix = (a, b, u) => a + (b - a) * u;
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const h = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const C = { gold: 'var(--eg-gold)', blue: 'var(--eg-blue)', teal: 'var(--eg-teal)', coral: 'var(--eg-coral)', ink: 'var(--eg-ink)', muted: 'var(--eg-muted)', faint: 'var(--eg-faint)', line: 'var(--eg-line)', red: 'var(--eg-phases-line)', green: 'var(--eg-interface-line)', cost: 'var(--eg-cost-line)' };
  const P = pts => pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  /* Two levels of one text: a String that reads as the plain level wherever a plain string is expected, and
     carries .plain and .expert for a host that knows the technicality switch (CONTRACT.md, "Two levels"). */
  const two = (plain, expert) => Object.assign(new String(plain), { plain, expert: expert || plain });
  const level = () => document.documentElement.dataset.level === 'expert' ? 'expert' : 'plain';
  const say = v => v == null ? '' : (v[level()] != null ? v[level()] : String(v));

  // ---- geometry shared by the drawings ---------------------------------------------------------------------
  const track = pts => {                               // a polyline that can be walked by distance
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const T = L[L.length - 1] || 1;
    const seg = d => { let a = 0, b = L.length - 1; while (b - a > 1) { const m = (a + b) >> 1; if (L[m] <= d) a = m; else b = m; } return a; };
    const at = d => { d = clamp(d, 0, T); const i = seg(d), u = (d - L[i]) / ((L[i + 1] - L[i]) || 1); return [mix(pts[i][0], pts[i + 1][0], u), mix(pts[i][1], pts[i + 1][1], u)]; };
    const cut = (a, b) => { a = clamp(a, 0, T); b = clamp(b, 0, T); const out = [at(a)]; for (let i = seg(a) + 1; i < L.length && L[i] < b; i++) out.push(pts[i]); out.push(at(b)); return out; };
    return { T, at, cut, pts, L };
  };
  const spline = (p, n = 10) => {                      // Catmull-Rom through the points, sampled
    const out = [], g = i => p[clamp(i, 0, p.length - 1)];
    for (let i = 0; i < p.length - 1; i++) for (let k = 0; k < n; k++) {
      const t = k / n, a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2), q = j => .5 * (2 * b[j] + (c[j] - a[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * t * t * t);
      out.push([q(0), q(1)]);
    }
    out.push(p[p.length - 1].slice()); return out;
  };
  const arc = (cx, cy, r, a0, a1, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const a = mix(a0, a1, i / n); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const rnd = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const tracer = (g, col, r = 3) => {                  // the travelling light: a soft halo and a bright point
    const halo = sv('circle', { r: r * 3, style: `fill:${col};opacity:.2` }, g), dot = sv('circle', { r, style: `fill:${C.ink}` }, g);
    return (x, y, a = 1) => { halo.setAttribute('cx', x.toFixed(1)); halo.setAttribute('cy', y.toFixed(1)); dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); halo.style.opacity = (.2 * a).toFixed(3); dot.style.opacity = a.toFixed(3); };
  };
  const line = (g, pts, col, w, o, extra) => sv('polyline', Object.assign({ points: P(pts), style: `fill:none;stroke:${col};stroke-width:${w};opacity:${o};stroke-linecap:round;stroke-linejoin:round` }, extra || {}), g);
  const hilbert = (side, d) => { let x = 0, y = 0, t = d; for (let s = 1; s < side; s *= 2) { const rx = 1 & (t >> 1), ry = 1 & (t ^ rx); if (!ry) { if (rx) { x = s - 1 - x; y = s - 1 - y; } const q = x; x = y; y = q; } x += s * rx; y += s * ry; t >>= 2; } return [x, y]; };
  const hilbertLevels = (n = 256) => [2, 4, 8, 16].map(side => {      // each order of the curve as n samples along it, in the unit square
    const m = side * side, c = Array.from({ length: m }, (_, j) => { const [x, y] = hilbert(side, j); return [(x + .5) / side, (y + .5) / side]; });
    return Array.from({ length: n }, (_, i) => { const u = i / (n - 1) * (m - 1), j = Math.min(m - 2, Math.floor(u)), f = u - j; return [mix(c[j][0], c[j + 1][0], f), mix(c[j][1], c[j + 1][1], f)]; });
  });

  // ---- the ten drawings (viewBox 0 0 400 300; line art, a travelling light, no words) -------------------------
  const GLYPH = [
    (g, x, y, s) => { sv('circle', { cx: x, cy: y, r: 3.2, style: s }, g); sv('circle', { cx: x, cy: y, r: 7.4, style: s }, g); },
    (g, x, y, s) => { [[-7, 5], [0, -7], [7, 5]].forEach(p => sv('line', { x1: x, y1: y, x2: x + p[0], y2: y + p[1], style: s }, g)); sv('circle', { cx: x, cy: y, r: 2.2, style: s }, g); },
    (g, x, y, s) => { sv('circle', { cx: x - 5, cy: y, r: 4.2, style: s }, g); sv('circle', { cx: x + 5, cy: y, r: 4.2, style: s }, g); },
    (g, x, y, s) => { for (let i = 0; i < 9; i++) sv('rect', { x: x - 8 + (i % 3) * 6, y: y - 8 + Math.floor(i / 3) * 6, width: 4, height: 4, style: s }, g); },
    (g, x, y, s) => { sv('path', { d: `M${x - 8},${y + 3}C${x - 9},${y - 9} ${x + 9},${y - 9} ${x + 8},${y}S${x - 2},${y + 9} ${x - 8},${y + 3}`, style: s }, g); },
    (g, x, y, s) => { sv('path', { d: `M${x - 9},${y - 6}L${x - 1},${y}L${x - 3},${y + 8}M${x - 1},${y}L${x + 9},${y - 3}`, style: s }, g); },
    (g, x, y, s) => { sv('path', { d: `M${x - 6},${y + 6}V${y - 6}H${x + 6}V${y + 6}`, style: s }, g); },
    (g, x, y, s) => { for (let i = 0; i < 8; i++) sv('circle', { cx: x - 7.5 + (i % 4) * 5, cy: y - 3 + Math.floor(i / 4) * 6, r: 1.2, style: s }, g); },
    (g, x, y, s) => { sv('rect', { x: x - 9, y: y - 6.5, width: 18, height: 13, rx: 2, style: s }, g); sv('path', { d: `M${x - 2.5},${y - 3.5}L${x + 4},${y}L${x - 2.5},${y + 3.5}Z`, style: s }, g); }
  ];
  const ART = {};
  ART.made = svg => {                                  // nine pieces on one thread, lit in the order they were made
    const g = sv('g', {}, svg), S = Array.from({ length: 9 }, (_, i) => [40 + i * 40, i % 2 ? 152 : 62]), cur = track(spline(S, 10));
    sv('line', { x1: 10, y1: 107, x2: 390, y2: 107, style: `stroke:${C.line};stroke-width:1.2` }, g);
    for (let i = 0; i < 7; i++) sv('line', { x1: 26 + i * 58, y1: 101, x2: 26 + i * 58, y2: 113, style: `stroke:${C.faint};stroke-width:1;opacity:.7` }, g);
    line(g, cur.pts, C.gold, 1.3, .34);
    const wake = line(g, [[0, 0]], C.gold, 2.6, .95), pen = (col, o) => `fill:none;stroke:${col};stroke-width:1.5;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round;opacity:${o}`;
    const box = S.map((p, i) => {
      sv('line', { x1: p[0], y1: p[1] + (i % 2 ? -17 : 17), x2: p[0], y2: 107, style: `stroke:${C.gold};stroke-width:1;opacity:.3;stroke-dasharray:2 3` }, g); sv('circle', { cx: p[0], cy: 107, r: 2.4, style: `fill:${C.gold};opacity:.7` }, g);
      const r = sv('rect', { x: p[0] - 24, y: p[1] - 17, width: 48, height: 34, rx: 7, style: `fill:var(--eg-surface);stroke:${C.gold};stroke-width:1.1` }, g), k = sv('g', { transform: `translate(${p[0]} ${p[1]}) scale(1.5)` }, g), lit = sv('g', { transform: `translate(${p[0]} ${p[1]}) scale(1.5)` }, g);
      GLYPH[i](k, 0, 0, pen(C.muted, .9)); GLYPH[i](lit, 0, 0, pen(C.gold, 1)); return { r, lit };
    });
    const at = S.map((p, i) => cur.L[i * 10] / cur.T * .84), tip = tracer(g, C.gold, 3.4);
    return { tick(t) {
      const u = (t % 12) / 12, d = Math.min(1, u / .84) * cur.T, a = clamp(u / .04) * clamp((1 - u) / .12), q = cur.at(d);
      wake.setAttribute('points', P(cur.cut(d - 60, d))); wake.style.opacity = (.95 * a).toFixed(3); tip(q[0], q[1], a);
      box.forEach((b, i) => { const age = ((u - at[i] + 1) % 1) * 12, glow = Math.exp(-age / 3.4); b.r.style.strokeOpacity = (.32 + .68 * glow).toFixed(3); b.r.style.strokeWidth = (1.1 + 1.3 * glow).toFixed(2); b.lit.style.opacity = glow.toFixed(3); });
    }, destroy() { g.remove(); } };
  };
  ART['made-learning'] = svg => {                      // the talk's title figure: orbits about a centre, and one trajectory finding it
    const g = sv('g', {}, svg), cx = 272, cy = 108, R = [15, 27, 41, 57, 75], B = [];
    sv('circle', { cx, cy, r: 96, style: `fill:none;stroke:${C.blue};stroke-width:1;opacity:.35;stroke-dasharray:3 6` }, g);
    R.forEach((r, i) => { sv('circle', { cx, cy, r, style: `fill:none;stroke:${C.blue};stroke-width:${i % 2 ? 1 : 1.5};opacity:${.3 + .09 * i}` }, g); for (let k = 0; k <= i % 2; k++) B.push({ r, w: .5 * Math.pow(15 / r, 1.15) * (i % 2 ? -1 : 1), p: i * 1.7 + k * 3.1, el: sv('circle', { r: 2, style: `fill:${C.teal}` }, g) }); });
    const sp = track(Array.from({ length: 140 }, (_, i) => { const s = i / 139, r = 96 * Math.pow(1 - s, 1.25) + 2.5, a = -.7 + s * 15.2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }));
    line(g, sp.pts, C.gold, 1, .16);
    const wake = line(g, [[0, 0]], C.gold, 2, .95), core = sv('circle', { cx, cy, r: 3.6, style: `fill:${C.gold}` }, g), tip = tracer(g, C.gold);
    return { tick(t) {
      B.forEach(b => { const a = b.p + b.w * t; b.el.setAttribute('cx', (cx + b.r * Math.cos(a)).toFixed(1)); b.el.setAttribute('cy', (cy + b.r * Math.sin(a)).toFixed(1)); });
      const ph = (t / 15) % 1, f = ph < .5 ? ph * 2 : 2 - ph * 2, d = smooth(f) * sp.T, q = sp.at(d), back = ph >= .5;
      wake.setAttribute('points', P(back ? sp.cut(d, d + 60) : sp.cut(d - 60, d))); tip(q[0], q[1]); core.setAttribute('r', (3.4 + 1.6 * Math.exp(-Math.pow((f - 1) * 9, 2))).toFixed(2));
    }, destroy() { g.remove(); } };
  };
  ART['made-phases'] = svg => {                        // voters on a rim report to one centre through layers of three
    const g = sv('g', {}, svg), cx = 270, cy = 110, rot = sv('g', {}, g), pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)], routes = [];
    const V = Array.from({ length: 27 }, (_, i) => pt(94, i / 27 * 6.2832)), G1 = Array.from({ length: 9 }, (_, i) => pt(62, (i * 3 + 1) / 27 * 6.2832)), G2 = Array.from({ length: 3 }, (_, i) => pt(30, (i * 9 + 4) / 27 * 6.2832));
    const l = (a, b, o) => sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], style: `stroke:${C.red};stroke-width:1;opacity:${o}` }, rot);
    V.forEach((v, i) => { l(v, G1[Math.floor(i / 3)], .3); routes.push(track([v, G1[Math.floor(i / 3)], G2[Math.floor(i / 9)], [cx, cy]])); });
    G1.forEach((p, i) => l(p, G2[Math.floor(i / 3)], .42)); G2.forEach(p => l(p, [cx, cy], .6));
    sv('circle', { cx, cy, r: 94, style: `fill:none;stroke:${C.red};stroke-width:1;opacity:.22` }, rot);
    V.forEach(p => sv('circle', { cx: p[0], cy: p[1], r: 2.2, style: `fill:${C.red};opacity:.85` }, rot)); G1.forEach(p => sv('circle', { cx: p[0], cy: p[1], r: 3, style: `fill:var(--eg-phases-c);stroke:${C.red};stroke-width:1.3` }, rot)); G2.forEach(p => sv('circle', { cx: p[0], cy: p[1], r: 4, style: `fill:var(--eg-phases-c);stroke:${C.red};stroke-width:1.5` }, rot));
    const ring = sv('circle', { cx, cy, r: 8, style: `fill:none;stroke:${C.gold};stroke-width:1.4` }, rot); sv('circle', { cx, cy, r: 4.4, style: `fill:${C.gold}` }, rot);
    const L = Array.from({ length: 6 }, (_, k) => ({ k, tip: tracer(rot, C.gold, 2.4) }));
    return { tick(t) {
      rot.setAttribute('transform', `rotate(${(t * 2.2 % 360).toFixed(2)} ${cx} ${cy})`); let pulse = 0;
      L.forEach(o => { const c = t / 3.4 + o.k * .37, n = Math.floor(c), u = c - n, r = routes[(n * 7 + o.k * 5) % 27], q = r.at(smooth(u) * r.T); o.tip(q[0], q[1], Math.sin(Math.PI * u) ** .6); pulse = Math.max(pulse, Math.exp(-Math.pow((1 - u) * 7, 2))); });
      ring.setAttribute('r', (8 + 6 * pulse).toFixed(2)); ring.style.opacity = (.35 + .6 * pulse).toFixed(3);
    }, destroy() { g.remove(); } };
  };
  ART['made-twinning'] = svg => {                      // one field drives two materials; their difference is fed back until it vanishes
    const g = sv('g', {}, svg), y0 = 92, arm = s => track(spline([[198, y0], [216, y0 + s * 28], [234, y0 + s * 44], [246, y0 + s * 44]], 6).concat(arc(268, y0 + s * 44, 22, Math.PI, s < 0 ? 2 * Math.PI : 0, 16), spline([[290, y0 + s * 44], [308, y0 + s * 40], [326, y0 + s * 19], [340, y0]], 6)));
    const up = arm(-1), dn = arm(1), inn = track([[170, y0], [198, y0]]), out = track([[340, y0], [366, y0]]), fb = track(spline([[366, y0], [384, y0 + 8], [386, y0 + 58], [366, y0 + 88], [268, y0 + 96], [176, y0 + 88], [160, y0 + 56], [170, y0]], 10));
    sv('line', { x1: 144, y1: y0, x2: 170, y2: y0, style: `stroke:${C.ink};stroke-width:1.2;opacity:.4` }, g);
    line(g, inn.pts, C.ink, 1.4, .5); line(g, up.pts, C.blue, 1.5, .55); line(g, dn.pts, C.coral, 1.5, .55); line(g, out.pts, C.ink, 1.4, .5); line(g, fb.pts, C.gold, 1.4, .42, { 'stroke-dasharray': '2 5' });
    const spin = [[-1, C.blue], [1, C.coral]].map(([s, c]) => { sv('circle', { cx: 268, cy: y0 + s * 44, r: 22, style: `fill:none;stroke:${c};stroke-width:1.8;opacity:.9` }, g); return sv('circle', { cx: 268, cy: y0 + s * 44, r: 13, style: `fill:none;stroke:${c};stroke-width:1.2;opacity:.6;stroke-dasharray:4 5` }, g); });
    sv('rect', { x: 161, y: y0 - 10, width: 18, height: 20, rx: 3, style: `fill:var(--eg-surface);stroke:${C.gold};stroke-width:1.4` }, g);
    sv('path', { d: `M198,${y0 - 9}L207,${y0}L198,${y0 + 9}L189,${y0}Z`, style: `fill:var(--eg-surface);stroke:${C.ink};stroke-width:1.3;opacity:.8` }, g);
    const det = sv('circle', { cx: 340, cy: y0, r: 9, style: `fill:var(--eg-surface);stroke:${C.ink};stroke-width:1.3` }, g); sv('path', { d: `M334,${y0 - 6}L346,${y0 + 6}M346,${y0 - 6}L334,${y0 + 6}`, style: `stroke:${C.ink};stroke-width:1.2;opacity:.7` }, g);
    sv('path', { d: `M366,${y0 - 11}A11,11 0 0 1 366,${y0 + 11}Z`, style: `fill:var(--eg-surface);stroke:${C.gold};stroke-width:1.4` }, g);
    const a = tracer(g, C.blue, 2.8), b = tracer(g, C.coral, 2.8), c = tracer(g, C.gold, 2.8);
    return { tick(t) {
      const u = (t / 6.4) % 1, w = (lo, hi) => clamp((u - lo) / (hi - lo)); let q;
      spin[0].style.strokeDashoffset = (-t * 9).toFixed(1); spin[1].style.strokeDashoffset = (t * 9).toFixed(1);
      if (u < .12) { q = inn.at(w(0, .12) * inn.T); a(q[0], q[1]); b(q[0], q[1], 0); c(0, 0, 0); }
      else if (u < .58) { q = up.at(w(.12, .58) * up.T); a(q[0], q[1]); q = dn.at(w(.12, .58) * dn.T); b(q[0], q[1]); c(0, 0, 0); }
      else if (u < .66) { q = out.at(w(.58, .66) * out.T); a(q[0], q[1]); b(q[0], q[1], 0); c(0, 0, 0); }
      else { q = fb.at(w(.66, 1) * fb.T); c(q[0], q[1]); a(0, 0, 0); b(0, 0, 0); }
      det.style.strokeWidth = (1.3 + 2 * Math.exp(-Math.pow((u - .58) * 22, 2))).toFixed(2);
    }, destroy() { g.remove(); } };
  };
  const SA_LOOP = 'rrrrrrrrrrrrrrrrrlrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrcrcrcrrrrrrrrrrrrrrr', SA_BARE = 'cccccccrccccccccrcccccccccccrccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
  ART['made-superarc'] = svg => {                      // the hundred answers: copies when the model answers alone, rules once each candidate is run
    const g = sv('g', {}, svg), pos = i => { const r = Math.floor(i / 10), c = r % 2 ? 9 - i % 10 : i % 10; return [198 + c * 17.6, 14 + r * 17.6]; }, look = { r: [.9, 0], l: [.5, 0], c: [0, .5] };
    const cell = Array.from({ length: 100 }, (_, i) => { const p = pos(i); return { m: -1, el: sv('rect', { x: p[0], y: p[1], width: 13.6, height: 13.6, rx: 2.6, style: `fill:${SA_LOOP[i] === 'l' ? C.blue : C.gold};stroke:${C.faint};stroke-width:1` }, g) }; });
    const cur = sv('rect', { width: 17.6, height: 17.6, rx: 4, style: `fill:none;stroke:${C.ink};stroke-width:1.5` }, g);
    return { tick(t) {
      const s = (t % 12) / 12, k = clamp(s / .52) * 100, back = 1 - clamp((s - .84) / .14);
      cell.forEach((c, i) => { const m = clamp(k - i) * back; if (Math.abs(m - c.m) < .012) return; c.m = m; const a = look[SA_BARE[i]], b = look[SA_LOOP[i]]; c.el.style.fillOpacity = mix(a[0], b[0], m).toFixed(3); c.el.style.strokeOpacity = mix(a[1], b[1], m).toFixed(3); });
      const j = Math.min(99, Math.floor(k)), f = k - j, p = pos(j), q = pos(Math.min(99, j + 1)); cur.setAttribute('x', (mix(p[0], q[0], f) - 2).toFixed(1)); cur.setAttribute('y', (mix(p[1], q[1], f) - 2).toFixed(1)); cur.style.opacity = (clamp(s / .03) * clamp((.56 - s) / .04)).toFixed(3);
    }, destroy() { g.remove(); } };
  };
  const US_PATH = 'M299.7,108.8 310.3,108.9 313.2,126.3 312.7,134.4 302.7,138.9 298.9,138.4 299.7,108.8ZM191.8,123.4 191.7,101.8 214.9,96 214.9,132.3 191.8,123.4ZM214.9,70.4 243.4,70.4 240.4,96 214.9,96 214.9,70.4ZM312.7,134.4 327.3,136.3 332.5,168.5 328.4,171.8 324.7,160.3 317.7,140.9 302.5,139 312.7,134.4ZM310.3,108.9 320.4,108.8 329.7,127.9 327.2,136.3 313.3,136.3 310.3,108.9ZM302.5,65.9 313.5,65.5 313.5,84.5 305.2,89.7 300.1,90.2 302.5,65.9ZM243.4,76.8 272.3,80.7 273.6,96 243.4,96.1 243.4,76.8ZM370.9,57.2 369.4,42.8 376.9,29.1 384.1,41 386,46 370.9,57.2ZM263,19.2 288.9,28.4 280.8,40.2 287.4,54.4 266.2,54.4 263,19.2ZM351.1,79.2 354.4,68.2 356.4,73.6 354,83.6 351.1,79.2ZM326.2,98.6 349.9,98.9 345.4,108.4 341.4,116.2 315.5,108.9 326.2,98.6ZM235.2,19.2 263,19.2 265.7,38.8 235.3,38.7 235.2,19.2ZM239.5,96 273.6,96 274.1,117.5 263.1,115.7 251.7,111.6 251.7,99.2 239.5,96ZM331,64.1 353.3,70.1 351.7,78.1 331,78.6 331,64.1ZM235.2,44.8 235.3,38.7 265.7,38.8 266.2,56.8 235.2,57.6 235.2,44.8ZM239.5,99.2 251.7,99.2 252.9,112.7 276,118.1 276.8,142.8 264.4,153.4 263.3,165.9 264.2,153 263.3,166.7 258.8,166 246,142.3 237.8,146.9 224.7,128.8 239.2,128 239.5,99.2ZM235.2,44.8 235.2,70.4 206.8,70.4 206.8,53.2 206.8,44.8 235.2,44.8ZM359.6,63.7 366.4,63.9 361.9,68.5 359.6,63.7ZM269,73 285.4,72.9 294.2,98.8 273.6,99.2 269,73ZM322.5,86.9 330.5,72.8 335.2,81.9 341.9,79.4 328.1,94.5 322.5,86.9ZM286.6,74.4 289.8,60.7 301.3,60.9 300.2,93 294.9,95.7 286.6,74.4ZM214.9,96 239.5,96 239.2,128 225.1,129.4 214.9,132.3 214.9,96ZM273.6,99.2 291.8,99.2 289,113.5 287.6,121.6 276,121.5 273.6,99.2ZM153.2,64 170.3,64 170.3,83.2 194.2,113.3 192.6,123.1 182.1,124.6 166.8,107.5 155.1,83.5 153.2,64ZM266.2,54.4 287.4,54.4 291.7,63.2 285.4,72.9 269,73 266.2,54.4ZM295.9,96.1 313.5,84.5 322.5,86.7 320.3,97.7 295.9,96.1ZM335.2,78.6 350.2,78.6 349.8,90.1 349.5,79.6 348,89.3 335.2,78.6ZM305.3,65.5 308.5,45.3 319.8,44.7 317,52.8 323.2,57.8 319.2,65.7 305.3,65.5ZM290.7,34.8 301.3,29 298.5,33.5 314.1,38.1 302.2,44.2 290.7,34.8ZM287.6,121.6 291.1,108.8 300.1,109.5 295.7,138.7 285.7,134.4 287.6,121.6ZM186.4,19.2 235.2,19.2 235.3,44.8 199.4,48.9 195,40.4 186.4,19.2ZM367.7,44.7 368.5,59.5 363.8,59.3 367.7,44.7ZM334.1,62.3 360.2,44.7 359.5,63.4 358.4,71.7 366.2,70 357.4,73.2 352,64 334.1,62.3ZM313.5,65.9 331,64.1 324.8,83 313.5,82.5 313.5,65.9ZM155.9,36.7 182.9,38.4 181.7,49.3 182.4,64 153.2,64 155.9,36.7ZM293.5,102.4 320.9,103.9 291.1,108.8 293.5,102.4ZM194.6,64.1 214.9,70.4 214.9,92.6 194.5,96 194.6,64.1ZM325.1,92.5 339.8,80.2 348,89.9 349.9,98.9 318.1,98.6 325.1,92.5ZM182.4,19.2 182.9,38.4 159.6,40.9 151.1,24.6 159.1,24.7 159.4,31.4 159.1,19.2 182.4,19.2ZM284.2,33.9 300.1,38.9 300.4,47.6 304.4,42.9 301.3,60.9 289.8,60.7 281,46.3 284.2,33.9ZM235.2,57.6 262.7,58.4 268.6,69.3 270.8,76.8 243.4,76.8 235.2,70.4 235.2,57.6ZM320.4,108.8 339,116.2 331.2,124.8 320.4,108.8ZM182.9,38.4 182.4,19.2 186.4,19.2 195,40.4 206.8,48.2 206.8,64 182.4,64 182.9,38.4ZM170.3,64.1 194.6,64.1 191.7,101.8 170.3,83.2 170.3,64.1ZM360.2,44.7 367.7,44.7 363.8,59.3 360.2,44.7ZM276,121.5 288,121.7 285.7,134.4 293.4,134.4 296.5,146 276.8,142.8 276,121.5Z', ROUTE = '291.9,141.1 276,141.5 272.6,145.4 267.8,140.2 256.6,139.4 253.9,135.2 245.9,135 232.1,128.7 234.5,125.7 233.3,118.4 226.8,101.8 229.3,91.3 227.8,91.8 226.8,84.4 231.7,78.1 228.6,74.1 231.4,73.1 226.5,64.7 226,58.6 208.1,53.4 209,46.5 211.3,44.7 208.2,44.9 207.7,48.3 205.7,47 201.1,58.1 202.9,60 203.3,73.9 213.9,74 216.2,77.7 215.8,82.1 211.8,83.8 205.6,76.9 211.8,84 211.6,87.7 213.1,84.9 210.3,83.3 204.3,87 208.7,85.6 208.5,89 211.5,92.5 210,97.9 216.8,93.8 222.8,94.5 224.7,91.7 229.6,93.3 239.3,88.9 249.8,89.2 249.8,85.7 258.1,79.9 258.3,71.6 264.9,71.8 269.7,67.2 277.6,66.6 286.2,70.5 287,78.8 299.5,75.8 316.8,78.3 327.6,69.4 328.3,65.3 337.1,60 336.8,57 346.8,64 357.8,62.7 358.6,59.7 366.6,62.8 368.4,67.5 368.1,65.2 360.8,69.2 359.5,73 356.3,72.2 349.2,83.1 340.4,83.7 339.4,89.6 335.5,90.9 328.5,89.3 328.7,96.2 324.8,104.3 319.7,105.8 318.4,102.5 315.8,103.2 306.3,118.1 297.4,125.8 293.4,139.2 291.8,141.4 292,138.4 292,141.3 300.4,136.4 317.2,137.8 323.7,150.3 323.1,158.5 326.2,166 331.1,167.9 330.8,173 325.7,175.7 330.8,173 331.9,167.7'.split(' ').map(p => p.split(',').map(Number));
  ART['made-trip'] = svg => {                          // the route itself, from the phone's own record, drawn as it was driven
    const g = sv('g', {}, svg), r = track(ROUTE);
    sv('path', { d: US_PATH, style: `fill:var(--eg-raise);fill-opacity:.35;stroke:${C.faint};stroke-width:.7;stroke-opacity:.55;stroke-linejoin:round` }, g);
    line(g, r.pts, C.gold, 1, .22);
    const done = sv('polyline', { points: P(r.pts), pathLength: 1, style: `fill:none;stroke:${C.gold};stroke-width:1.5;opacity:.8;stroke-linejoin:round;stroke-dasharray:1 1` }, g), wake = line(g, [[0, 0]], C.ink, 2.2, .9), tip = tracer(g, C.gold);
    sv('circle', { cx: ROUTE[0][0], cy: ROUTE[0][1], r: 3.4, style: `fill:none;stroke:${C.ink};stroke-width:1.2;opacity:.8` }, g);
    return { tick(t) {
      const u = (t % 18) / 18, f = Math.min(1, u / .86), d = f * r.T, a = clamp(u / .03) * clamp((1 - u) / .1), q = r.at(d);
      done.style.strokeDashoffset = (1 - f).toFixed(4); done.style.opacity = (.8 * clamp((1 - u) / .1)).toFixed(3); wake.setAttribute('points', P(r.cut(d - 26, d))); wake.style.opacity = (.9 * a).toFixed(3); tip(q[0], q[1], a);
    }, destroy() { g.remove(); } };
  };
  ART['made-synthetics'] = svg => {                    // the talk's title figure: a field of events cut into cells
    const g = sv('g', {}, svg), X0 = 150, Y0 = 8, X1 = 392, Y1 = 196, R = rnd(41), sites = [[196, 52], [286, 34], [356, 78], [222, 126], [306, 118], [364, 166], [174, 176], [262, 180]];
    const clip = (poly, a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = b[0] - a[0], ny = b[1] - a[1], side = p => (p[0] - mx) * nx + (p[1] - my) * ny, out = []; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q); if (sp <= 0) out.push(p); if (sp * sq < 0) { const u = sp / (sp - sq); out.push([mix(p[0], q[0], u), mix(p[1], q[1], u)]); } }); return out; };
    const cells = sites.map((s, i) => sites.reduce((poly, o, j) => j === i ? poly : clip(poly, s, o), [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]]));
    const fill = cells.map(c => sv('polygon', { points: P(c), style: `fill:${C.blue};fill-opacity:0;stroke:${C.blue};stroke-width:1;stroke-opacity:.42;stroke-linejoin:round` }, g));
    for (let i = 0; i < 110; i++) { const x = mix(X0, X1, R()), y = mix(Y0, Y1, R()), b = R(); sv('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (.7 + b * 1.1).toFixed(2), style: `fill:${C.ink};opacity:${(.25 + .6 * b * b).toFixed(2)}` }, g); }
    const rim = cells.map(c => track(c.concat([c[0]]))), wake = line(g, [[0, 0]], C.gold, 2, .95), tip = tracer(g, C.gold), ORD = [0, 3, 4, 1, 2, 5, 7, 6];
    return { tick(t) {
      const c = t / 3.1, n = Math.floor(c), u = c - n, k = ORD[n % 8], a = Math.sin(Math.PI * u) ** .5, r = rim[k], d = smooth(u) * r.T, q = r.at(d);
      fill.forEach((f, i) => { f.style.fillOpacity = (i === k ? .2 * Math.sin(Math.PI * u) : 0).toFixed(3); });
      wake.setAttribute('points', P(r.cut(d - 40, d))); wake.style.opacity = (.95 * a).toFixed(3); tip(q[0], q[1], a);
    }, destroy() { g.remove(); } };
  };
  const HL = hilbertLevels(256);
  ART['made-cost'] = svg => {                          // the paper's own construction: the Hilbert curve, order by order
    const g = sv('g', { transform: 'rotate(-6 284 104)' }, svg), X = 196, Y = 12, S = 180, to = p => [X + p[0] * S, Y + p[1] * S], SEQ = [0, 1, 2, 3, 2, 1];
    sv('rect', { x: X, y: Y, width: S, height: S, style: `fill:none;stroke:${C.cost};stroke-width:1;opacity:.4` }, g);
    sv('path', { d: `M${X + S / 2},${Y}V${Y + S}M${X},${Y + S / 2}H${X + S}`, style: `stroke:${C.cost};stroke-width:1;opacity:.22` }, g);
    line(g, HL[3].map(to), C.cost, .8, .2);
    const ink = line(g, [[0, 0]], C.gold, 2, .9), wake = line(g, [[0, 0]], C.ink, 2.6, .95), tip = tracer(g, C.gold, 3.2);
    return { tick(t) {
      const ph = t / 1.66, n = Math.floor(ph), f = smooth((ph - n - .23) / .6), A = HL[SEQ[n % 6]], B = HL[SEQ[(n + 1) % 6]], pts = A.map((p, i) => to([mix(p[0], B[i][0], f), mix(p[1], B[i][1], f)]));
      ink.setAttribute('points', P(pts));
      const w = (t * .052) % 2, q = (w < 1 ? w : 2 - w) * 255, i = Math.min(254, Math.floor(q)), u = q - i, head = [mix(pts[i][0], pts[i + 1][0], u), mix(pts[i][1], pts[i + 1][1], u)], dir = w < 1 ? -1 : 1, tail = [head];
      for (let k = 0; k < 14; k++) { const j = (dir < 0 ? i : i + 1) + dir * k; if (j < 0 || j > 255) break; tail.push(pts[j]); }
      wake.setAttribute('points', P(tail)); tip(head[0], head[1]);
    }, destroy() { g.remove(); } };
  };
  ART['made-kalmar'] = svg => {                        // the same sixteen symbols in three of their eight layouts
    const g = sv('g', {}, svg), pos = [
      i => [200 + (i % 8) * 23, 62 + Math.floor(i / 8) * 64],
      i => { const q = Math.floor(i / 4); return [198 + (q % 2) * 98 + (i % 4) * 22, 62 + Math.floor(q / 2) * 64]; },
      i => { const q = Math.floor(i / 2); return [200 + (q % 4) * 47 + (i % 2) * 18, 62 + Math.floor(q / 4) * 64]; }], per = [8, 4, 2];
    const frames = per.map((n, L) => Array.from({ length: 16 / n }, (_, q) => { const a = pos[L](q * n), b = pos[L](q * n + n - 1); return sv('rect', { x: a[0] - 9, y: a[1] - 11, width: b[0] - a[0] + 18, height: 22, rx: 7, style: `fill:none;stroke:${C.cost};stroke-width:1.2;opacity:0` }, g); }));
    const trail = line(g, [[0, 0]], C.gold, 2, .8), dots = Array.from({ length: 16 }, (_, i) => sv('circle', { r: i === 10 ? 4.4 : 3.2, style: `fill:${i === 10 ? C.gold : C.ink};opacity:${i === 10 ? 1 : .7}` }, g));
    const where = (i, t) => { const c = Math.max(0, t) / 3.6, n = Math.floor(c), f = smooth((c - n - .64) / .36), a = pos[n % 3](i), b = pos[(n + 1) % 3](i), lift = Math.sin(Math.PI * f) * (i % 2 ? 9 : -9); return [mix(a[0], b[0], f), mix(a[1], b[1], f) + lift]; };
    return { tick(t) {
      const c = t / 3.6, n = Math.floor(c), f = smooth((c - n - .64) / .36);
      dots.forEach((d, i) => { const p = where(i, t); d.setAttribute('cx', p[0].toFixed(1)); d.setAttribute('cy', p[1].toFixed(1)); });
      frames.forEach((F, L) => { const o = L === n % 3 ? 1 - clamp(f * 2.2) : L === (n + 1) % 3 ? clamp(f * 2.2 - 1.2) : 0; F.forEach(r => { r.style.opacity = (.75 * o).toFixed(3); }); });
      trail.setAttribute('points', P(Array.from({ length: 9 }, (_, k) => where(10, t - k * .035))));
    }, destroy() { g.remove(); } };
  };
  ART['made-film'] = svg => {                          // the interface: a manuscript, the conversation beside it, and one proposed line taken up
    const g = sv('g', {}, svg), X = 170, Y = 14, W = 214, H = 176, R = rnd(7), col = C.green;
    sv('rect', { x: X, y: Y, width: W, height: H, rx: 9, style: `fill:var(--eg-surface);fill-opacity:.35;stroke:${col};stroke-width:1.3;opacity:.9` }, g);
    sv('line', { x1: X, y1: Y + 17, x2: X + W, y2: Y + 17, style: `stroke:${col};stroke-width:1;opacity:.45` }, g); [0, 1, 2].forEach(i => sv('circle', { cx: X + 11 + i * 8, cy: Y + 8.5, r: 2, style: `fill:${col};opacity:.6` }, g));
    sv('line', { x1: X + 132, y1: Y + 17, x2: X + 132, y2: Y + H - 22, style: `stroke:${col};stroke-width:1;opacity:.3` }, g);
    const rows = Array.from({ length: 11 }, (_, i) => { const y = Y + 30 + i * 11.6, w = i === 4 ? 86 : 58 + R() * 56; if (i !== 4) sv('line', { x1: X + 12, y1: y, x2: X + 12 + w, y2: y, style: `stroke:${C.ink};stroke-width:1.5;opacity:.3;stroke-linecap:round` }, g); return [y, w]; });
    const y4 = rows[4][0], old = sv('line', { x1: X + 12, y1: y4, x2: X + 98, y2: y4, style: `stroke:${C.ink};stroke-width:1.5;opacity:.3;stroke-linecap:round` }, g), neu = sv('line', { x1: X + 12, y1: y4, x2: X + 114, y2: y4, pathLength: 1, style: `stroke:${col};stroke-width:2.2;stroke-linecap:round;stroke-dasharray:1 1;stroke-dashoffset:1` }, g);
    const msg = [0, 1, 2, 3].map(i => sv('rect', { x: X + 140 + (i % 2) * 8, y: Y + 26 + i * 30, width: 58, height: 22, rx: 5, style: `fill:none;stroke:${i === 1 ? col : C.ink};stroke-width:1.1;opacity:${i === 1 ? .9 : .32}` }, g));
    const hop = track(spline([[X + 148, Y + 67], [X + 126, Y + 60], [X + 118, y4]], 10)), bar = [X + 12, X + W - 12], yb = Y + H - 11;
    sv('line', { x1: bar[0], y1: yb, x2: bar[1], y2: yb, style: `stroke:${col};stroke-width:1.2;opacity:.4;stroke-linecap:round` }, g); [0, 9, 42, 55, 77, 85].forEach(s => sv('line', { x1: mix(bar[0], bar[1], s / 96), y1: yb - 4, x2: mix(bar[0], bar[1], s / 96), y2: yb + 4, style: `stroke:${col};stroke-width:1.2;opacity:.7` }, g));
    const played = sv('line', { x1: bar[0], y1: yb, x2: bar[0], y2: yb, style: `stroke:${col};stroke-width:2.2;stroke-linecap:round` }, g), head = tracer(g, col, 3.2), bead = tracer(g, C.gold, 2.6);
    return { tick(t) {
      const u = (t % 13) / 13, a = clamp(u / .03) * clamp((1 - u) / .06), x = mix(bar[0], bar[1], u), b = clamp((u - .14) / .2), w = clamp((u - .34) / .16) * (1 - clamp((u - .9) / .08)), q = hop.at(smooth(b) * hop.T);
      played.setAttribute('x2', x.toFixed(1)); played.style.opacity = a.toFixed(3); head(x, yb, a);
      bead(q[0], q[1], Math.sin(Math.PI * b) ** .5); neu.style.strokeDashoffset = (1 - w).toFixed(3); old.style.opacity = (.3 * (1 - w)).toFixed(3); msg[1].style.strokeWidth = (1.1 + 1.2 * Math.sin(Math.PI * b)).toFixed(2);
    }, destroy() { g.remove(); } };
  };

  /* a host's clock may start a frame early; no drawing is ever asked for a time before zero, and one that fails is skipped */
  Object.keys(ART).forEach(k => { const draw = ART[k]; ART[k] = svg => { const a = draw(svg); return { tick(t) { try { a.tick(Math.max(0, t)); } catch (e) {} }, destroy() { try { a.destroy(); } catch (e) {} } }; }; });

  // ---- the words ---------------------------------------------------------------------------------------------
  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ITEMS = [
    { id: 'made-learning', title: 'The Laws of Learning', what: 'A talk', date: [2026, 6, 1], ex: 'learning', out: [{ href: '/talks/laws-of-learning-v3/', label: 'Open the talk ↗' }],
      line: 'Made first, with its paper: an hour’s talk on when a learning system fades, computes or runs away.',
      text: two('<i>The Laws of Learning</i> was made first, together with its paper. It is an hour’s talk for physicists who build computers out of driven materials, and asks what decides whether a system that learns will fade, compute or run away.',
        '<i>The Laws of Learning</i> went up on 1 June 2026: an hour’s talk for reservoir physicists, with ten figures that are simulations running inside the slides. Its argument is that a learning system of size \\(N\\) is stable only inside a window of depth, whose floor grows as \\(L_{\\min}\\sim\\log N\\).'),
      steps: [
        { label: 'One loop', caption: 'Evolution, gradient descent, a market and a reservoir, each drawn as the same loop of measurement and control.' },
        { label: 'The viable window', caption: 'A system that is too flat flips, and one that is too deep freezes. The buttons in the figure set it stable, bring it to the edge of chaos, or kick it.' },
        { label: 'Depth', caption: 'One level of a hierarchy is one step of coarse-graining. Coarse-grain ▸ in the figure takes one, and the staircase on its right records it.' }] },
    { id: 'made-phases', title: 'The Phases of Hierarchy', what: 'A paper', date: [2026, 5, 29], until: [2026, 11, 24], ground: 'phases', ex: 'phases', out: [{ href: '/eigenengine/phases-of-hierarchy/', label: 'The paper, as a picture →' }, { href: '/assets/docs/the-phases-of-hierarchy.pdf', label: 'Read the PDF ↗' }],
      line: 'The paper behind that talk: the depth of a hierarchy decides whether a group that corrects itself cycles, settles or freezes.',
      text: two('The talk was drawn from this paper. A large flat group that corrects its own course overcorrects, because counting more heads sharpens the verdict, and layers placed in between weaken that verdict until the loop settles. Too many layers leave it steady and unable to respond. The band of depths between the two decides how deep a conceptric should nest.',
        'The first draft went up on 29 May 2026 and the present one, of thirty-one pages, on 24 November. A flat majority of \\(N\\) independent voters feeds back with a gain \\(K_N\\sim\\alpha\\beta\\sqrt{2N/\\pi}\\), and the loop enters a two-cycle once \\(K_N\\) exceeds a critical gain \\(K_c(T)\\) set by the interval between reviews. Stages of fixed attenuation restore stability at a depth of order \\(\\log N\\), while delay and control effort bound the depth from above. The modular phase between these bounds decides how deep a conceptric should nest.'),
      steps: [
        { label: 'The model, running', caption: 'Voters on the rim report to one centre, first directly and then through layers of three. A flat vote is the sharpest, and the centre overcorrects until it swings. Staged through layers the same vote arrives weakened, and the centre settles.' },
        { label: 'The paper', caption: 'The present draft, of thirty-one pages. Its first figure, on the right, sets out the model.' }] },
    { id: 'made-twinning', title: 'Optical twinning trees', what: 'A paper and a talk', date: [2026, 7, 24], ex: 'twinning', out: [{ href: '/unlisted/eigenengine/twinning/', label: 'Open the record ↗' }],
      line: 'One question from a physicist became a paper, a review of it, a second paper and a talk.',
      text: two('A physicist, Denys Bondar, sent one question: can two different materials be driven by feedback until they answer light alike, and can that compute? In two days Eigen, the agent in EigenEngine, wrote a paper, reviewed it, found four weak steps and wrote it again.',
        'Denys Bondar sent one question: can feedback on the difference of two materials’ optical responses drive that difference to zero, and can the loop compute? On 24 and 25 July 2026 Eigen searched the literature, ran the experiments and wrote a first paper of twelve pages. It reviewed that draft, found four weak steps, and wrote a second of fourteen pages. The fifteen slides were generated from it.'),
      steps: [
        { label: 'The talk', caption: 'Fifteen slides, generated from the paper and shown here a few seconds each. Pressing the slide moves to the next.' },
        { label: 'The first paper', caption: 'The first version, written with its numerical experiments in a day.' },
        { label: 'After its review', caption: 'Eigen reviewed its own draft and found four weak steps in the argument. The second version, of fourteen pages, answers them.' }] },
    { id: 'made-superarc', title: 'SuperARC', what: 'A benchmark and a paper', date: [2026, 8, 5], ex: 'superarc', out: [{ href: '/unlisted/eigenengine/superarc/', label: 'Inspect the answers ↗' }, { href: '/unlisted/eigenengine/superarc/checking-your-work.pdf', label: 'Read the paper ↗' }],
      line: 'A benchmark of a hundred binary sequences: Eigen found the generating rule for ninety-six of them.',
      text: two('SuperARC gives a model a hundred sequences of twelve binary digits and asks for the rule behind each. Eigen ran every candidate rule before submitting it, and ninety-six of its answers were rules. The same model answering alone gave three.',
        'SuperARC (Hernández-Espinosa, Ozelim, Abrahão and Zenil, 2026) scores a hundred answers by kind with weights 1, 0.1 and 0.01, each scaled by how short the answer is. The run of 5 August 2026 was preregistered. With up to four attempts Eigen scored \\(\\varphi = 0.485\\), and 0.430 with one; the same model without a sandbox scored 0.017, and the best published model, re-scored by the same rule, 0.042.'),
      steps: [
        { label: 'A hundred sequences', caption: 'Each square is one sequence of twelve binary digits, and the task is to give the rule that generates it. Pressing a square shows its sequence and Eigen’s answer.' },
        { label: 'Answering alone', caption: 'The model answering alone copies the sequence back ninety-seven times in a hundred. A copy counts a hundredth of a rule.' },
        { label: 'With Eigen', caption: 'Eigen runs each candidate rule before it is submitted, and tries again when the output is wrong. Ninety-six of the answers are now rules.' },
        { label: 'The score', caption: 'The score runs from 0 to 1. The best published model answered every sequence with a list.' }] },
    { id: 'made-trip', title: 'The Long Way Round', what: 'A map', date: [2026, 9, 2], ex: 'trip', out: [{ href: '/trip.html', label: 'Open the map ↗' }],
      line: 'Ninety-five days around the United States, rebuilt from a phone’s location history into a map.',
      text: two('A phone recorded where it was for ninety-five days, from October 2023 to January 2024. From that record alone Eigen rebuilt the journey of 16,858 kilometres around the United States. Its days and places are linked and searched exactly as the claims and sources of a paper are.',
        'A phone’s location history from 9 October 2023 to 11 January 2024 holds ten thousand fixes. From that record alone Eigen rebuilt the journey: 16,858 kilometres in 286 legs, with sixty-one stops, nineteen parks and the nights spent in each of twenty-seven states. Its days and places are linked and searched exactly as the claims and sources of a paper are.'),
      steps: [
        { label: 'The route', caption: 'The line is the phone’s own record. It leaves New Orleans in October 2023 and runs anticlockwise; pressing the map moves the light to that day.' },
        { label: 'Day by day', caption: 'The same ninety-five days as distance driven. The longest, on 7 January, is 1,363 kilometres through Florida.' },
        { label: 'Where the nights went', caption: 'Nights in each state, counted from the same record. Pressing a state lights the days spent in it.' }] },
    { id: 'made-synthetics', title: 'Synthetics', what: 'A talk', date: [2026, 10, 21], ex: 'synthetics', out: [{ href: '/talks/synthetics/', label: 'Open the talk ↗' }],
      line: 'A talk that connects the cost of a distinction to the design of a memory and an agent.',
      text: two('<i>Synthetics</i> is the talk that sets the theory beside the system. It begins from what it costs to hold one distinction in a physical register, and follows that cost through to a memory built by diffusion and an agent that works inside it.',
        '<i>Synthetics</i> went up on 21 October 2026: thirty-nine slides and twenty running figures, generated from one written outline. It begins from the cost of a register, shows that only a cost of the form \\(f(r)=\\ln r\\) satisfies \\(f(rs)=f(r)+f(s)\\) for a pair of ranks, and follows that to a memory built by diffusion, \\(p(\\tau)=e^{\\tau G}p(0)\\), whose coarse objects become the next level up.'),
      steps: [
        { label: 'A register', caption: 'A field of events is cut into cells, and each cell is given a slot in a register. Reading, writing and erasing a slot each have a cost.' },
        { label: 'Why a logarithm', caption: 'The rank of a pair is the product of two ranks, and its cost should be the sum of two costs. Of the three candidates only the logarithm passes.' },
        { label: 'A memory', caption: 'Thirty-six cards are linked to their neighbours and weight is spread along the links. The groups it settles into become the next level up.' }] },
    { id: 'made-cost', title: 'The Cost of Complexity', what: 'A paper', date: [2026, 11, 19], ground: 'cost', ex: 'cost', out: [{ href: '/eigenengine/cost-of-complexity/', label: 'Explore the paper →' }, { href: '/assets/docs/the-cost-of-complexity.pdf', label: 'Read the PDF ↗' }],
      line: 'What does a representation have to carry, and what does it cost to carry it?',
      text: two('Every representation has to be held in something, and so does whatever organises it. The paper prices that organisation level by level, and finds that reaching one item among many need cost only the logarithm of their number. This is why a conceptric nests.',
        'A register holds distinctions at one level and is itself selected by a distinction at the next, which brings the organisation of a representation into the same cost account as its contents. When registers compose positionally at additive cost, the efficient budget for \\(N\\) symbols grows as \\(\\kappa_\\infty\\ln N\\). The present twenty-one pages went up on 19 November 2026.'),
      steps: [
        { label: 'The construction', caption: 'A square is cut in four, each quarter in four again, and one path visits every cell in turn. This is the picture whose cost the paper counts.' },
        { label: 'What a level costs', caption: 'The paper’s Figure 3, on the right. If a cut is priced by the area it divides, every level of the construction costs the same.' },
        { label: 'The word law', caption: 'From a cost that grows as the logarithm of rank, the paper derives the law of word frequencies. Figure 6 is computed from it.' }] },
    { id: 'made-kalmar', title: 'The Kalmár constant', what: 'A draft', date: [2026, 11, 19], ground: 'cost', ex: 'kalmar', out: [{ href: '/eigenengine/kalmar-constant/', label: 'Explore the draft →' }, { href: '/assets/docs/physical-origins-of-the-kalmar-constant.pdf', label: 'Read the PDF ↗' }],
      line: 'A follow-on draft written in one conversation: what does it cost to store the layout itself?',
      text: two('Four bits pick one of sixteen symbols. The sixteen can however be arranged in eight ways, and the arrangement in use has to be stored as well. This draft of eight pages, which Eigen produced in one conversation, counts what that costs.',
        'The ordered factorisations of \\(N\\) count the layouts of \\(N\\) symbols, and their number up to \\(N\\) grows as \\(N^{\\rho}\\) with \\(\\zeta(\\rho)=2\\), \\(\\rho\\approx 1.72865\\), which is Kalmár’s constant. The draft of eight pages charges for the layout itself: sixteen symbols take four bits and ten once every choice of layout above them is stored. Eigen produced it in one conversation on 19 November 2026.'),
      steps: [
        { label: 'Sixteen symbols', caption: 'Four bits pick one symbol of sixteen. Here they sit in a single register, with the eleventh in gold.' },
        { label: 'Eight layouts', caption: 'The same sixteen can be held as two registers of eight, as eight of two, and so on. There are eight such layouts, so three more bits say which is in use.' },
        { label: 'Storing the choice', caption: 'Those three bits have four layouts of their own, which take two bits, which take one. Ten bits hold the symbol and every choice above it.' }] },
    { id: 'made-film', title: 'The interface at work', what: 'A film', date: [2026, 11, 19], ground: 'interface', ex: 'film', out: [{ href: '/demo/writing/', label: 'Watch the whole film →' }],
      line: 'A film of the interface during a real revision of The Cost of Complexity.',
      text: two('The interface is where a person works on the object. This film reopens a saved session on <i>The Cost of Complexity</i>, in which the author and Eigen exchanged thirty-nine turns and eighty-five versions of proposed edits.',
        'The film reopens a saved session on <i>The Cost of Complexity</i>: thirty-nine turns, eighty-five versions of proposed edits, and one proposal that covers eight TeX files. Each proposal names the version of the source the agent read, so that an edit against a changed passage is reviewed before it is applied. The film ends with the eleven-file arXiv package compiled in an empty folder and its twenty-one pages reproduced.'),
      steps: [
        { label: 'The workspace', caption: 'A saved session on the paper, reopened as the author left it.' },
        { label: 'A rewrite', caption: 'One section of the paper is rewritten: the argument, the derivation and the drawing that goes with them.' },
        { label: 'A precise edit', caption: 'A single passage is changed, and the proposal is kept beside the version it was made against.' },
        { label: 'To a figure', caption: 'One simulation supplies the numbers, and the figure stays linked to the run that produced them.' },
        { label: 'The package', caption: 'The paper is compiled in an empty folder and checked page for page before the package is offered.' }] }
  ];
  const LINKS = [['made-phases', 'made-learning', 'shown by'], ['made-cost', 'made-synthetics', 'shown by'], ['made-cost', 'made-film', 'shown by'], ['made-kalmar', 'made-cost', 'cites']];
  const dateText = it => { const f = (d, full) => (full ? d[2] + ' ' : '') + MONTH[d[1] - 1] + (full === 'bare' ? '' : ' ' + d[0]); const x = level() === 'expert'; return it.until ? (x ? `${it.date[2]} ${MONTH[it.date[1] - 1]} to ${f(it.until, true)}` : `${MONTH[it.date[1] - 1]} to ${f(it.until)}`) : f(it.date, x); };

  // ---- fetching the item exhibits only when one is opened ------------------------------------------------------
  const loaded = {};
  const need = file => loaded[file] || (loaded[file] = new Promise((res, rej) => { const s = document.createElement('script'); s.src = BASE + file; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
  const lazy = it => ({ steps: it.steps, mount(el, opts) {
    let real = null, dead = false, want = 0; el.classList.add('egmd-item');
    const ph = h('div', 'egmd-wait', '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"></svg>', el), art = ART[it.id](ph.firstChild), t0 = performance.now(); let raf = requestAnimationFrame(function loop(now) { art.tick((now - t0) / 1000); raf = requestAnimationFrame(loop); });
    Promise.all([need('data.js'), need('items.js')]).then(() => { cancelAnimationFrame(raf); if (dead) return; ph.remove(); real = window.EIGEN_MADE_ITEMS[it.ex](el, opts || {}, { it, BASE, ART, kit: KIT }); real.step(want); }, () => {});
    return { step(i) { want = i; if (real) real.step(i); }, destroy() { dead = true; cancelAnimationFrame(raf); if (real) real.destroy(); el.classList.remove('egmd-item'); el.innerHTML = ''; } };
  } });
  const KIT = { sv, h, C, P, clamp, smooth, mix, track, spline, tracer, line, hilbertLevels, HL, say, level, two, MOT, rnd };

  // ---- the timeline: the nine as cards on one thread, re-hung three ways, each opening where it sits -----------
  const T0 = Date.UTC(2026, 4, 14), T1 = Date.UTC(2026, 11, 3), when = d => (Date.UTC(d[0], d[1] - 1, d[2]) - T0) / (T1 - T0);
  const MODES = ['order', 'calendar', 'links'];
  const SAY = {
    order: two('Nine pieces in the order they were made. Any of them opens where it sits.', 'Nine pieces in the order they were made, each with its date. Any of them opens where it sits.'),
    calendar: two('The same nine on the calendar: two at the start of June and three on one day in November.', 'The same nine on the calendar: two within three days of each other at the start and three on 19 November.'),
    links: two('The same nine hung by what they share. Two of them show The Cost of Complexity, one cites it, and the first talk shows the paper beside it.', 'The same nine hung where one shows or cites another. The citation is of Figure 2 of The Cost of Complexity, at a fixed version.')
  };
  function timeline(el, opts) {
    const Spring = window.EigenMotion.Spring, compact = !!(opts && opts.compact), quiet = !!(opts && opts.say === false);
    el.classList.add('egmd'); const root = h('div', 'egmd-tl' + (compact ? ' is-compact' : ''), '', el);
    const wires = sv('svg', { class: 'egmd-wires', 'aria-hidden': 'true' }, root), gAxis = sv('g', {}, wires), gStem = sv('g', {}, wires), gLink = sv('g', {}, wires);
    const thread = sv('polyline', { class: 'egmd-thread' }, wires), wake = sv('polyline', { class: 'egmd-wake' }, wires), glow = sv('circle', { class: 'egmd-glow', r: 7 }, wires), spark = sv('circle', { class: 'egmd-spark', r: 2.6 }, wires);
    const axis = sv('line', { class: 'egmd-axis' }, gAxis), ticks = [5, 6, 7, 8, 9, 10, 11].map(m => ({ f: when([2026, m + (m === 5 ? 0 : 0), m === 5 ? 15 : 1]), m, line: sv('line', { class: 'egmd-tick' }, gAxis), text: sv('text', { class: 'egmd-month' }, gAxis) }));
    const names = short => ticks.forEach(k => { const t = k.m === 5 ? '2026' : short ? MONTH[k.m - 1].slice(0, 3) : MONTH[k.m - 1]; if (k.text.textContent !== t) k.text.textContent = t; }); names(false);
    const sayEl = h('p', 'egmd-say', '', root); sayEl.setAttribute('aria-live', 'polite'); if (quiet) sayEl.hidden = true;
    const cards = ITEMS.map((it, i) => {
      const b = h('button', 'egmd-card' + (it.ground ? ' egmd-g-' + it.ground : ''), `<span class="egmd-art"><svg viewBox="0 0 400 300" preserveAspectRatio="xMaxYMin slice" aria-hidden="true"></svg></span><span class="egmd-cap"><b class="egmd-n">${i + 1}</b><span class="egmd-t">${it.title}</span><span class="egmd-d"></span><span class="egmd-l"></span></span>`, root);
      b.type = 'button'; b.dataset.id = it.id; b.setAttribute('aria-expanded', 'false');
      const c = { it, i, el: b, d: b.querySelector('.egmd-d'), art: ART[it.id](b.querySelector('svg')), x: new Spring(0), y: new Spring(0), w: new Spring(10), h: new Spring(10), R: { x: 0, y: 0, w: 10, h: 10 }, tile: false,
        stem: sv('line', { class: 'egmd-stem' }, gStem), pin: sv('circle', { class: 'egmd-pin', r: 3 }, gStem), sa: new Spring(0), px: new Spring(0), py: new Spring(0) };
      b.addEventListener('click', ev => { ev.stopPropagation(); open(st.open === i ? -1 : i); });
      return c;
    });
    const byId = {}; cards.forEach(c => { byId[c.it.id] = c; });
    const links = LINKS.map(([a, b, kind]) => ({ a: byId[a], b: byId[b], kind, path: sv('path', { class: 'egmd-link' }, gLink), lab: sv('text', { class: 'egmd-linklab' }, gLink), o: new Spring(0) }));
    links.forEach(l => { l.lab.textContent = l.kind; });
    const panels = [0, 1].map(() => {
      const p = h('section', 'egmd-panel', '<header><b class="egmd-pn"></b><div class="egmd-ph"><h3></h3><p class="egmd-pd"></p></div><span class="egmd-walk"><button type="button" class="egmd-prev" aria-label="The piece made before this one">‹</button><button type="button" class="egmd-next" aria-label="The piece made after this one">›</button></span><button type="button" class="egmd-x" aria-label="Close">×</button></header><div class="egmd-body"><div class="egmd-main"><div class="egmd-ex"></div><div class="egmd-steps" role="group" aria-label="Steps"></div><p class="egmd-pcap" aria-live="polite"></p></div><aside class="egmd-side"><p class="egmd-text"></p><p class="egmd-out"></p></aside></div>', root);
      const o = { el: p, i: -1, x: new Spring(0), y: new Spring(0), w: new Spring(10), h: new Spring(10), o: new Spring(0), ex: null, at: 0, auto: 0, kill: 0 };
      p.addEventListener('click', ev => ev.stopPropagation());
      p.querySelector('.egmd-x').addEventListener('click', () => open(-1));
      p.querySelector('.egmd-prev').addEventListener('click', () => open((o.i + 8) % 9)); p.querySelector('.egmd-next').addEventListener('click', () => open((o.i + 1) % 9));
      p.querySelector('.egmd-ex').addEventListener('pointerdown', () => stopAuto(o), true);
      p.querySelector('.egmd-ex').addEventListener('eg-step', ev => { if (ev.detail && ev.detail.i != null) mark(o, ev.detail.i); });
      return o;
    });
    const st = { mode: 'order', open: -1, W: 0, H: 0, vert: false, active: 0 };
    let dead = false, raf = 0, last = 0, t0 = performance.now(), sayT = 0, frame = 0;

    const speak = v => { clearTimeout(sayT); const html = say(v); if (MOT().off) { sayEl.innerHTML = html; sayEl.style.opacity = html ? 1 : 0; return; } sayEl.style.opacity = 0; sayT = setTimeout(() => { sayEl.innerHTML = html; sayEl.style.opacity = html ? 1 : 0; }, 180); };
    const dates = () => cards.forEach(c => { c.d.textContent = c.it.what + ' · ' + dateText(c.it); const l = c.el.querySelector('.egmd-l'); if (l) l.innerHTML = say(c.it.line); });
    const stopAuto = p => { clearInterval(p.auto); p.auto = 0; };
    const mark = (p, i) => { const S = ITEMS[p.i] && ITEMS[p.i].steps || []; if (!S[i]) return; p.at = i; p.el.querySelectorAll('.egmd-steps button').forEach((b, j) => { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); }); const cap = p.el.querySelector('.egmd-pcap'); cap.style.opacity = 0; clearTimeout(p.capT); p.capT = setTimeout(() => { cap.innerHTML = say(S[i].caption); cap.style.opacity = 1; typeset(cap); }, MOT().off ? 0 : 170); };
    const stepItem = (p, i) => { mark(p, i); try { p.ex && p.ex.step(i); } catch (e) {} };
    const typeset = node => { if (window.EigenLevel && window.EigenLevel.typeset) { if (/\\\(/.test(node.innerHTML)) { node.innerHTML = '<span data-eg-math>' + node.innerHTML + '</span>'; window.EigenLevel.typeset(node); } } else if (window.renderMathInElement) window.renderMathInElement(node, { delimiters: [{ left: '\\(', right: '\\)', display: false }] }); else node.querySelectorAll && (node.innerHTML = node.innerHTML.replace(/\\\((.+?)\\\)/g, (m, x) => '<i class="egmd-math">' + x.replace(/\\(?:sim|approx)/g, m => m === '\\sim' ? '∼' : '≈').replace(/\\(ln|log|min|zeta|rho|tau|varphi|kappa|infty|sqrt)/g, (m, w) => ({ ln: 'ln ', log: 'log ', min: 'min', zeta: 'ζ', rho: 'ρ', tau: 'τ', varphi: 'φ', kappa: 'κ', infty: '∞', sqrt: '√' })[w]).replace(/[{}]/g, '').replace(/_(\w+)/g, '<sub>$1</sub>').replace(/\^(\w+)/g, '<sup>$1</sup>') + '</i>')); };
    const fill = p => {
      const it = ITEMS[p.i], e = p.el; e.className = 'egmd-panel' + (it.ground ? ' egmd-g-' + it.ground : '');
      e.querySelector('.egmd-pn').textContent = p.i + 1; e.querySelector('h3').textContent = it.title; e.querySelector('.egmd-pd').textContent = it.what + ' · ' + dateText(it);
      const tx = e.querySelector('.egmd-text'); tx.innerHTML = say(it.text); typeset(tx);
      e.querySelector('.egmd-out').innerHTML = it.out.map(o => `<a href="${o.href}"${/↗/.test(o.label) ? ' target="_blank" rel="noopener"' : ''}>${o.label}</a>`).join('');
      const bar = e.querySelector('.egmd-steps'); bar.innerHTML = ''; it.steps.forEach((s, j) => { const b = h('button', '', s.label, bar); b.type = 'button'; b.addEventListener('click', () => { stopAuto(p); stepItem(p, j); }); });
      e.querySelector('.egmd-x').setAttribute('aria-label', 'Close ' + it.title);
    };
    const unmount = p => { stopAuto(p); clearTimeout(p.mountT); if (p.ex) { try { p.ex.destroy(); } catch (e) {} p.ex = null; } p.el.querySelector('.egmd-ex').innerHTML = ''; };
    const mountItem = p => { const host = p.el.querySelector('.egmd-ex'), it = ITEMS[p.i]; if (p.ex || p.i < 0 || dead) return; p.ex = N[it.id].exhibit.mount(host, { compact: host.clientWidth < 900, onStep: j => mark(p, j) }) || {}; stepItem(p, 0); if (!MOT().off && it.steps.length > 1) p.auto = setInterval(() => { if (p.at >= it.steps.length - 1) return stopAuto(p); stepItem(p, p.at + 1); }, 4200); };

    function open(i) {
      if (i === st.open) return; const was = st.open; st.open = i;
      cards.forEach(c => c.el.setAttribute('aria-expanded', c.i === i ? 'true' : 'false'));
      if (was >= 0) { const p = panels[st.active]; p.closing = true; clearTimeout(p.kill); p.kill = setTimeout(() => { if (p.closing) { unmount(p); p.i = -1; p.el.classList.remove('is-open'); } }, MOT().off ? 0 : 520); p.el.inert = true; }
      if (i >= 0) {
        st.active = 1 - st.active; const p = panels[st.active], c = cards[i]; clearTimeout(p.kill); unmount(p); p.closing = false; p.i = i; fill(p);
        p.x.snap(c.x.v); p.y.snap(c.y.v); p.w.snap(c.w.v); p.h.snap(c.h.v); p.o.snap(0); p.el.classList.add('is-open'); p.el.inert = false;
        place(); p.mountT = setTimeout(() => mountItem(p), MOT().off ? 0 : 460);
        speak('');
      } else { place(); speak(SAY[st.mode]); }
      el.dispatchEvent(new CustomEvent('egmd-open', { bubbles: true, detail: { id: i >= 0 ? ITEMS[i].id : null } }));
    }

    // where everything goes: sets the goals; the frame loop does the moving
    function place(snap) {
      const W = st.W, H = st.H, pad = compact ? 12 : 22, top = quiet ? pad : compact ? 34 : 44, vert = st.vert = W / H < .95, T = {}, u = clamp(parseFloat(getComputedStyle(document.documentElement).fontSize) / 16, 1, 1.6);
      const railH = st.open >= 0 ? (vert ? Math.min(46, (W - 2 * pad) / 9 * .7) : clamp((W - 2 * pad) / 9 * .62, 30, 64 * u)) : 0;
      let ax = null;                                    // the axis as a segment [x1, y1, x2, y2], or none
      if (st.open >= 0) {
        const tw = Math.min((W - 2 * pad) / 9 - 6, railH / .62), y = H - pad - railH / 2, x0 = pad + tw / 2, dx = (W - 2 * pad - tw) / 8;
        cards.forEach((c, i) => { T[i] = { x: x0 + i * dx, y, w: tw, h: railH, tile: true }; });
        ax = [pad, y, W - pad, y];
        const p = panels[st.active]; p.x.to(W / 2); p.y.to(pad + (H - 2 * pad - railH - 12) / 2); p.w.to(W - 2 * pad); p.h.to(H - 2 * pad - railH - 12); p.o.to(1);
      } else if (st.mode === 'order') {
        if (!vert) { const half = (H - top - pad) / 2 - 12, cw = Math.min((W - 2 * pad - 32) / 5.06, half / .92), ch = Math.min(cw * (compact ? 1.12 : 1.08), half), mid = top + (H - top - pad) / 2, dx = (W - 2 * pad - cw) / 8, off = Math.min(ch / 2 + (compact ? 10 : 22), (H - top - pad) / 2 - ch / 2);
          cards.forEach((c, i) => { T[i] = { x: pad + cw / 2 + i * dx, y: mid + (i % 2 ? off : -off), w: cw, h: ch }; }); ax = [pad, mid, W - pad, mid]; }
        else { const ch = Math.min((H - top - pad) / 5.2, 132), cw = Math.min(W / 2 - pad - 10, ch / .7), dy = (H - top - pad - ch) / 8, off = cw / 2 + 9;
          cards.forEach((c, i) => { T[i] = { x: W / 2 + (i % 2 ? off : -off), y: top + ch / 2 + i * dy, w: cw, h: ch }; }); ax = [W / 2, top, W / 2, H - pad]; }
      } else if (st.mode === 'calendar') {
        if (!vert) {                                    // the largest cards whose lanes still fit: pack, measure, shrink, repeat
          const ratio = compact ? .96 : .84, avail = H - top - pad, gap = compact ? 8 : 14, under = (compact ? 20 : 24) * u, lanes = [-1, 1, -2, 2]; let fit = null;
          for (let cw = Math.min((W - 2 * pad) / 4.6, avail / 2 / ratio); cw > 50 && !fit; cw *= .95) {
            const ch = cw * ratio, x0 = pad + cw * .55, x1 = W - pad - cw * .55, edge = {}, rows = cards.map(c => { const px = mix(x0, x1, when(c.it.date)); let L = lanes.find(l => (edge[l] == null ? -1e9 : edge[l]) + 8 <= px - cw / 2); if (L == null) L = 2; const x = Math.abs(L) === 2 ? clamp(px - cw * .56, pad + cw / 2, W - pad - cw / 2) : px; edge[L] = x + cw / 2; return { L, x, px }; });
            const nA = Math.max(0, ...rows.map(r => -r.L)), nB = Math.max(0, ...rows.map(r => r.L)), need = (nA + nB) * (ch + gap) + under;
            if (need <= avail || cw < 56) { const more = Math.max(0, Math.min(cw * 1.1 - ch, (avail - need) / (nA + nB))); fit = { cw, ch: ch + more, rows, nA, need: need + more * (nA + nB), x0, x1 }; }
          }
          const mid = top + Math.max(0, (avail - fit.need) / 2) + fit.nA * (fit.ch + gap);
          fit.rows.forEach((r, i) => { const k = Math.abs(r.L) - 1; T[i] = { x: r.x, y: r.L < 0 ? mid - gap - fit.ch / 2 - k * (fit.ch + gap) : mid + under + fit.ch / 2 + k * (fit.ch + gap), w: fit.cw, h: fit.ch, pin: [r.px, mid] }; });
          ax = [pad, mid, W - pad, mid]; st.cal = [fit.x0, fit.x1]; }
        else { const axx = pad + 34, cw = (W - axx - pad - 14) / 3 - 6, ch = cw * .74, y0 = top + ch / 2, y1 = H - pad - ch / 2, edge = [-1e9, -1e9, -1e9];
          cards.forEach((c, i) => { const py = mix(y0, y1, when(c.it.date)); let y = py, L = edge.findIndex(e => e + 6 <= py - ch / 2); if (L < 0) { L = edge.indexOf(Math.min(...edge)); y = Math.min(H - pad - ch / 2, edge[L] + 6 + ch / 2); } edge[L] = y + ch / 2; T[i] = { x: axx + 14 + cw / 2 + L * (cw + 6), y, w: cw, h: ch, pin: [axx, py] }; });
          ax = [axx, top, axx, H - pad]; }
      } else {
        const F = vert ? [[.73, .12], [.27, .12], [.17, .86], [.5, .86], [.83, .86], [.17, .37], [.5, .37], [.5, .62], [.83, .37]] : [[.15, .68], [.15, .27], [.36, .86], [.86, .87], [.66, .87], [.83, .2], [.53, .36], [.5, .82], [.85, .55]];
        const cw = vert ? Math.min(W * .29, 150) : Math.min((W - 2 * pad) / 6, 190 * u, (H - top - pad) / 3.7 / (compact ? .96 : .84)), ch = cw * (compact ? .96 : .84), by = top + ch / 2 + 2, hy = H - pad - ch / 2 - by;
        cards.forEach((c, i) => { const big = i === 6 ? 1.16 : 1; T[i] = { x: clamp(F[i][0] * W, pad + cw / 2, W - pad - cw / 2), y: by + clamp((F[i][1] - .12) / .76) * hy, w: cw * big, h: ch * big }; });
        if (!vert) { T[7].y = Math.min(T[7].y, H - pad - ch / 2); }
      }
      st.ax = ax; st.T = T;
      cards.forEach((c, i) => { const t = T[i]; c.x.to(t.x); c.y.to(t.y); c.w.to(t.w); c.h.to(t.h); c.sa.to(t.pin ? 1 : 0); if (t.pin) { c.px.to(t.pin[0]); c.py.to(t.pin[1]); } else { c.px.to(t.x); c.py.to(ax ? (ax[1] === ax[3] ? ax[1] : t.y) : t.y); if (ax && ax[0] === ax[2]) c.px.to(ax[0]); }
        if (c.tile !== !!t.tile) { c.tile = !!t.tile; c.el.classList.toggle('is-tile', c.tile); }
        c.el.classList.toggle('is-here', st.open === i); c.el.style.zIndex = st.open === i ? 3 : 2;
        if (snap) [c.x, c.y, c.w, c.h, c.sa, c.px, c.py].forEach(s => s.snap(s.g)); });
      links.forEach(l => { l.o.to(st.open >= 0 ? 0 : st.mode === 'links' ? 1 : .28); if (snap) l.o.snap(l.o.g); });
      root.dataset.mode = st.open >= 0 ? 'open' : st.mode; root.classList.toggle('is-vert', vert);
      if (snap) panels.forEach(p => [p.x, p.y, p.w, p.h, p.o].forEach(s => s.snap(s.g)));
      if (!raf) raf = requestAnimationFrame(loop);
    }

    const edgePoint = (R, tx, ty) => { const cx = R.x + R.w / 2, cy = R.y + R.h / 2, dx = tx - cx, dy = ty - cy, k = Math.min(dx ? (R.w / 2 + 4) / Math.abs(dx) : 9, dy ? (R.h / 2 + 4) / Math.abs(dy) : 9, 1); return [cx + dx * k, cy + dy * k]; };
    function loop(now) {
      raf = 0; if (dead) return;
      const off = MOT().off, dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; frame++;
      let moving = false; const all = [];
      cards.forEach(c => all.push(c.x, c.y, c.w, c.h, c.sa, c.px, c.py)); links.forEach(l => all.push(l.o)); panels.forEach(p => all.push(p.x, p.y, p.w, p.h, p.o));
      for (let k = Math.ceil(dt / .008), i = 0; i < k; i++) all.forEach(s => { if (s.step(dt / k)) moving = true; });
      const t = (now - t0) / 1000;
      cards.forEach(c => {
        const w = c.w.v, hh = c.h.v, x = c.x.v - w / 2, y = c.y.v - hh / 2; c.R.x = x; c.R.y = y; c.R.w = w; c.R.h = hh;
        c.el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`; c.el.style.width = w.toFixed(2) + 'px'; c.el.style.height = hh.toFixed(2) + 'px'; c.el.style.fontSize = clamp(w / 15.5, 11.5, 30).toFixed(1) + 'px'; const sm = w < 128; if (sm !== c.small) { c.small = sm; c.el.classList.toggle('is-small', sm); }
        if (!off && (w > 110 || (frame + c.i) % 3 === 0)) c.art.tick(t);
        const a = c.sa.v; c.stem.style.opacity = (a * .8).toFixed(3); c.pin.style.opacity = a.toFixed(3);
        if (a > .01) { const e = edgePoint(c.R, c.px.v, c.py.v); c.stem.setAttribute('x1', e[0].toFixed(1)); c.stem.setAttribute('y1', e[1].toFixed(1)); c.stem.setAttribute('x2', c.px.v.toFixed(1)); c.stem.setAttribute('y2', c.py.v.toFixed(1)); c.pin.setAttribute('cx', c.px.v.toFixed(1)); c.pin.setAttribute('cy', c.py.v.toFixed(1)); }
      });
      const pts = spline(cards.map(c => [c.x.v, c.y.v]), 8), tr = track(pts); thread.setAttribute('points', P(pts));
      if (!off) { const u = (t % 9) / 9, d = Math.min(1, u / .9) * tr.T, a = clamp(u / .04) * clamp((1 - u) / .1), q = tr.at(d); wake.setAttribute('points', P(tr.cut(d - 70, d))); wake.style.opacity = (.9 * a).toFixed(3); glow.setAttribute('cx', q[0].toFixed(1)); glow.setAttribute('cy', q[1].toFixed(1)); spark.setAttribute('cx', q[0].toFixed(1)); spark.setAttribute('cy', q[1].toFixed(1)); glow.style.opacity = (.25 * a).toFixed(3); spark.style.opacity = a.toFixed(3); moving = true; }
      else { wake.style.opacity = 0; glow.style.opacity = 0; spark.style.opacity = 0; }
      links.forEach(l => {
        const A = l.a.R, B = l.b.R, a = edgePoint(A, B.x + B.w / 2, B.y + B.h / 2), b = edgePoint(B, A.x + A.w / 2, A.y + A.h / 2), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1, k = Math.min(26, n * .16), cx = mx - dy / n * k, cy = my + dx / n * k;
        l.path.setAttribute('d', `M${a[0].toFixed(1)},${a[1].toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`); l.path.style.opacity = l.o.v.toFixed(3);
        l.lab.setAttribute('x', ((mx + cx) / 2).toFixed(1)); l.lab.setAttribute('y', ((my + cy) / 2 - 5).toFixed(1)); l.lab.style.opacity = clamp((l.o.v - .5) * 2.4).toFixed(3); l.ends = [a, b];
      });
      panels.forEach(p => { if (p.i < 0) return; const c = cards[p.i]; if (p.closing) { p.x.to(c.x.g); p.y.to(c.y.g); p.w.to(c.w.g); p.h.to(c.h.g); p.o.to(0); }
        const w = p.w.v, hh = p.h.v; p.el.style.transform = `translate(${(p.x.v - w / 2).toFixed(2)}px,${(p.y.v - hh / 2).toFixed(2)}px)`; p.el.style.width = w.toFixed(2) + 'px'; p.el.style.height = hh.toFixed(2) + 'px'; p.el.style.opacity = clamp(p.o.v * 1.6).toFixed(3); p.el.style.setProperty('--in', clamp((p.o.v - .55) * 2.6).toFixed(3)); });
      el.__egm.moving = moving;
      raf = requestAnimationFrame(loop);
    }
    function measure() {
      const W = root.clientWidth, H = root.clientHeight; if (!W || !H) return false; const first = !st.W; st.W = W; st.H = H; wires.setAttribute('viewBox', `0 0 ${W} ${H}`);
      place(first); drawAxis(); return true;
    }
    function drawAxis() {
      const a = st.ax, cal = st.mode === 'calendar' && st.open < 0; if (!a) { axis.style.opacity = 0; ticks.forEach(k => { k.line.style.opacity = 0; k.text.style.opacity = 0; }); return; }
      axis.setAttribute('x1', a[0]); axis.setAttribute('y1', a[1]); axis.setAttribute('x2', a[2]); axis.setAttribute('y2', a[3]); axis.style.opacity = cal ? .9 : st.open >= 0 ? .5 : .4;
      const T = st.T, c0 = cards[0], horiz = a[1] === a[3], W = st.W, pad = compact ? 12 : 22, cw = T[0].w, x0 = pad + cw * .55, x1 = W - pad - cw * .55, top = quiet ? pad : compact ? 34 : 44, ch = T[0].h;
      names(!horiz); ticks.forEach(k => { const o = cal ? 1 : 0; k.line.style.opacity = o * .8; k.text.style.opacity = o;
        if (!cal) return;
        if (horiz) { const x = mix(st.cal ? st.cal[0] : x0, st.cal ? st.cal[1] : x1, k.f); k.line.setAttribute('x1', x); k.line.setAttribute('x2', x); k.line.setAttribute('y1', a[1] - 5); k.line.setAttribute('y2', a[1] + 5); k.text.setAttribute('x', x + 5); k.text.setAttribute('y', a[1] + 5 + 10 * (parseFloat(getComputedStyle(document.documentElement).fontSize) / 16)); k.text.setAttribute('text-anchor', 'start'); }
        else { const y = mix(top + ch / 2, st.H - pad - ch / 2, k.f); k.line.setAttribute('y1', y); k.line.setAttribute('y2', y); k.line.setAttribute('x1', a[0] - 5); k.line.setAttribute('x2', a[0] + 5); k.text.setAttribute('x', a[0] - 8); k.text.setAttribute('y', y + 4); k.text.setAttribute('text-anchor', 'end'); } });
    }
    const setMode = i => { const m = MODES[clamp(i | 0, 0, 2)]; st.mode = m; if (st.open >= 0) open(-1); else place(); drawAxis(); speak(SAY[m]); };
    const onLevel = () => { dates(); if (st.open < 0) speak(SAY[st.mode]); panels.forEach(p => { if (p.i >= 0 && !p.closing) { const it = ITEMS[p.i]; p.el.querySelector('.egmd-pd').textContent = it.what + ' · ' + dateText(it); const tx = p.el.querySelector('.egmd-text'); tx.innerHTML = say(it.text); typeset(tx); mark(p, p.at); } }); };
    const onKey = ev => { if (ev.key === 'Escape' && st.open >= 0) { const i = st.open; open(-1); cards[i].el.focus({ preventScroll: true }); } else if (st.open >= 0 && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') && !ev.target.closest('.egmd-ex')) { open((st.open + (ev.key === 'ArrowRight' ? 1 : 8)) % 9); } };
    root.addEventListener('click', () => { if (st.open >= 0) open(-1); }); root.addEventListener('keydown', onKey); window.addEventListener('eigen-level', onLevel);
    const ro = new ResizeObserver(() => { if (measure()) drawAxis(); }); ro.observe(root);
    el.__egm = { st, cards, links, panels, open, moving: false, snapshot: () => ({ cards: cards.map(c => [c.x.v, c.y.v, c.w.v, c.h.v]), links: links.map(l => ({ o: l.o.v, a: l.ends && l.ends[0], b: l.ends && l.ends[1], A: Object.assign({}, l.a.R), B: Object.assign({}, l.b.R) })), panel: panels.map(p => [p.x.v, p.y.v, p.w.v, p.h.v, p.o.v]) }) };
    dates(); measure(); speak(SAY.order);
    return { step: setMode, open: id => open(ITEMS.findIndex(it => it.id === id)), close: () => open(-1),
      destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('eigen-level', onLevel); panels.forEach(unmount); cards.forEach(c => c.art.destroy()); root.remove(); el.classList.remove('egmd'); delete el.__egm; } };
  }

  // ---- register ------------------------------------------------------------------------------------------------
  const N = window.EIGEN_NODES = window.EIGEN_NODES || {};
  ITEMS.forEach(it => { N[it.id] = { title: it.title, line: it.line, text: it.text, date: it.date, until: it.until, what: it.what, ground: it.ground || '', out: it.out, art: ART[it.id], exhibit: lazy(it) }; });
  N.made = {
    title: 'What it has made',
    line: two('Nine pieces in the order they were made, from a talk in June to a film in November.', 'Nine pieces in the order they were made, each with its date.'),
    text: two('The clearest record of EigenEngine is what it has been used to make. There are nine pieces: talks, papers, a benchmark, a map of a journey and a film, set out here in the order they were made. Each opens onto the thing itself, with its own figures running.',
      'Nine pieces, set out in the order they were made: talks, papers, a benchmark, a map of a journey and a film. Each is dated from this site’s history and its own records, and they are joined where one shows or cites another. Each opens onto the thing itself, with its own figures running.'),
    children: ITEMS.map(it => it.id),
    links: ITEMS.slice(1).map((it, i) => [ITEMS[i].id, it.id, 'then']).concat(LINKS),
    home: { thread: ITEMS.map(it => it.id), when: ITEMS.reduce((o, it) => (o[it.id] = when(it.date), o), {}) },
    art: ART.made,
    exhibit: {
      steps: [
        { label: 'In the order made', caption: two('Nine pieces, evenly spaced, with a thread that runs from the first to the latest. Pressing any of them opens it where it sits.', 'Nine pieces in the order made, evenly spaced. The fainter arcs mark where one piece shows or cites another.') },
        { label: 'On the calendar', caption: two('The same nine at their dates. The first two arrived within three days of each other, and the last three on one day in November.', 'The same nine at their dates, to the day. SuperARC stands at the day of its run, 5 August.') },
        { label: 'By their links', caption: two('The nine hung by what they share. Two talks and the film show a paper, and one draft cites a figure in another.', 'The thread is set aside and the nine hang where one shows or cites another. Three pieces stand alone.') }],
      mount: timeline
    }
  };
  window.EIGEN_MADE = { ITEMS, LINKS, ART, KIT, BASE, need, dateText };
})();
