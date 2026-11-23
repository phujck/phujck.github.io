/* Card art for the EigenEngine pattern. Each drawing is line art with a travelling light, in the manner of the
   Hilbert card: a dim guide, an inked figure that changes shape, and a tracer that follows the inked path.
   art(svg) draws into a 400 x 300 viewBox and returns { tick(t), destroy() }; t is seconds and every loop closes
   on itself. A node session's own art replaces the drawing here. No text is drawn. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (p, tag, cls, at) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); for (const k in at || {}) e.setAttribute(k, at[k]); p.appendChild(e); return e; };
  const sm = x => x * x * (3 - 2 * x), cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), mix = (a, b, u) => a + (b - a) * u;
  const mixP = (p, q, u) => [mix(p[0], q[0], u), mix(p[1], q[1], u)];
  const dPath = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  const ping = (t, hold, move) => { const T = 2 * (hold + move), u = ((t % T) + T) % T; return u < hold ? 0 : u < hold + move ? sm((u - hold) / move) : u < 2 * hold + move ? 1 : 1 - sm((u - 2 * hold - move) / move); };
  const tri = x => { const u = ((x % 2) + 2) % 2; return u <= 1 ? u : 2 - u; };
  function poly(pts) { const P = [pts[0]], D = [0]; let L = 0; for (const p of pts.slice(1)) { const q = P[P.length - 1], s = Math.hypot(p[0] - q[0], p[1] - q[1]); if (!s) continue; L += s; D.push(L); P.push(p); } return { P, D, L }; }
  function at(c, d) { d = cl(d, 0, c.L); let lo = 0, hi = c.P.length - 1; while (lo + 1 < hi) { const m = (lo + hi) >> 1; if (c.D[m] < d) lo = m; else hi = m; } const u = (d - c.D[lo]) / ((c.D[hi] - c.D[lo]) || 1); return { p: mixP(c.P[lo], c.P[hi], u), i: lo }; }
  function wake(c, d0, d1) { const a = at(c, Math.min(d0, d1)), b = at(c, Math.max(d0, d1)); return dPath([a.p, ...c.P.slice(a.i + 1, b.i + 1), b.p]); }
  function tracer(g) { const t = mk(g, 'g', 'ea-tracer'), gl = mk(t, 'path', 'ea-glow'), w = mk(t, 'path', 'ea-wake'), tip = mk(t, 'circle', 'ea-tip', { r: 4.4 }); return { set(c, d, len = 60) { const dd = wake(c, d - len, d); w.setAttribute('d', dd); gl.setAttribute('d', dd); const p = at(c, d).p; tip.setAttribute('cx', p[0].toFixed(1)); tip.setAttribute('cy', p[1].toFixed(1)); }, hide(o) { t.style.opacity = o; } }; }
  const A = {};

  /* The Hilbert curve of the Cost card, unchanged in its construction: four orders of one curve, each turn of the
     coarse curve opening into its own sub-curve, and a light that travels the painted path and turns back at its ends. */
  A.hilbert = svg => {
    const g = mk(svg, 'g', '', { transform: 'translate(112 -4) rotate(-6 160 160) scale(.86)' });
    function point(side, rank) { let x = 0, y = 0; for (let size = 1; size < side; size *= 2) { const right = 1 & (rank >> 1), up = 1 & (rank ^ right); if (!up) { if (right) { x = size - 1 - x; y = size - 1 - y; } [x, y] = [y, x]; } x += size * right; y += size * up; rank >>= 2; } return [(x + .5) * 320 / side, 320 - (y + .5) * 320 / side]; }
    const levels = [2, 4, 8, 16].map(side => Array.from({ length: 256 }, (_, i) => point(side, Math.floor(i * side * side / 256)))), shapes = levels.map(poly);
    mk(g, 'path', 'ea-frame', { d: 'M0 0H320V320H0Z M160 0V320 M0 160H320' });
    const guide = mk(g, 'path', 'ea-guide'), ink = mk(g, 'path', 'ea-ink'), tr = tracer(g), seq = [0, 1, 2, 3, 2, 1], step = 1.66;
    let travel = .43, last = null, painted = null, pg = -1;
    return { tick(t) {
      const dt = last == null ? 0 : Math.min(.1, t - last); last = t;
      const c = t % (step * seq.length), i = Math.floor(c / step), from = seq[i], to = seq[(i + 1) % seq.length], u = sm(cl(((c % step) / step - .23) / .6));
      const act = u === 0 ? shapes[from] : u === 1 ? shapes[to] : poly(levels[from].map((p, k) => mixP(p, levels[to][k], u)));
      if (act !== painted) { ink.setAttribute('d', dPath(act.P)); painted = act; }
      if (from !== pg) { guide.setAttribute('d', dPath(shapes[from].P)); pg = from; }
      guide.style.opacity = (.12 + .16 * (1 - u)).toFixed(3);
      travel += dt * 1000 * cl(.185 / act.L, .000062, .00019);
      const head = tri(travel) * act.L; tr.set(act, head, Math.min(.16 * act.L, 108) * (Math.floor(travel) % 2 ? -1 : 1));
    }, destroy() {} };
  };

  /* A small graph of typed records, used by the object and by its building. */
  const REC = [[200, 40, 'idea'], [112, 92, 'claim'], [200, 98, 'claim'], [288, 92, 'claim'], [66, 158, 'prem'], [146, 164, 'prem'], [226, 158, 'step'], [318, 150, 'src'], [196, 222, 'run'], [292, 216, 'fig']];
  const RL = [[0, 1], [0, 2], [0, 3], [1, 4], [1, 5], [2, 6], [6, 5], [6, 7], [6, 8], [8, 9], [3, 9]], RLEV = [0, 1, 1, 1, 2, 2, 2, 3, 4, 5];
  function glyph(g, x, y, k, cls = 'ea-node') {
    const s = 8;
    if (k === 'prem') return mk(g, 'rect', cls, { x: x - s, y: y - s, width: 2 * s, height: 2 * s, rx: 2.5 });
    if (k === 'step') return mk(g, 'path', cls, { d: `M${x} ${y - s - 3}L${x + s + 3} ${y}L${x} ${y + s + 3}L${x - s - 3} ${y}Z` });
    if (k === 'src') return mk(g, 'path', cls, { d: `M${x - 8} ${y - 11}h10l6 6v16h-16Z M${x + 2} ${y - 11}v6h6` });
    if (k === 'run') return mk(g, 'path', cls, { d: `M${x - 12} ${y - 9}h24v18h-24Z M${x - 7} ${y + 4}v-5 M${x - 1} ${y + 4}v-9 M${x + 5} ${y + 4}v-3` });
    if (k === 'fig') return mk(g, 'path', cls, { d: `M${x - 13} ${y - 10}h26v20h-26Z M${x - 9} ${y - 5}q5 11 18 12` });
    return mk(g, 'circle', cls + (k === 'idea' ? ' ea-big' : ''), { cx: x, cy: y, r: k === 'idea' ? 11 : 8 });
  }
  A.object = svg => {                                // the whole object, with a light that follows one chain of support round it
    mk(svg, 'rect', 'ea-frame', { x: 26, y: 12, width: 348, height: 250, rx: 28 }); mk(svg, 'rect', 'ea-frame ea-dash', { x: 40, y: 128, width: 320, height: 122, rx: 20 });
    RL.forEach(([a, b]) => mk(svg, 'path', 'ea-guide ea-on', { d: dPath([REC[a], REC[b]]) }));
    const loop = poly([0, 2, 6, 8, 9, 3, 0].map(i => REC[i])), ink = mk(svg, 'path', 'ea-ink', { d: dPath(loop.P) }), nodes = REC.map(r => glyph(svg, r[0], r[1], r[2])), tr = tracer(svg);
    return { tick(t) { const d = (t * 46) % loop.L; tr.set(loop, d, 70); nodes.forEach((n, i) => { const r = REC[i], p = at(loop, d).p, near = Math.hypot(p[0] - r[0], p[1] - r[1]); n.style.setProperty('--lit', cl(1 - near / 46).toFixed(2)); }); ink.style.opacity = .55; }, destroy() {} };
  };
  A.build = svg => {                                 // the same records arriving in stages, and taken away again
    const P = [[46, 118], [118, 56], [118, 122], [118, 190], [192, 40], [192, 96], [192, 160], [262, 92], [308, 164], [354, 222]];
    const guides = RL.map(([a, b]) => mk(svg, 'path', 'ea-guide', { d: dPath([P[a], P[b]]) })), inks = RL.map(([a, b]) => mk(svg, 'path', 'ea-ink', { d: dPath([P[a], P[b]]), pathLength: 1, 'stroke-dasharray': 1 }));
    const nodes = P.map((p, i) => glyph(svg, p[0], p[1], REC[i][2])), chain = poly([0, 2, 6, 8, 9].map(i => P[i])), tr = tracer(svg);
    return { tick(t) { const g = 6.4 * ping(t, 1.3, 5.2);
      nodes.forEach((n, i) => { const v = sm(cl(g - RLEV[i] + .2)); n.style.opacity = (.14 + .86 * v).toFixed(3); n.style.setProperty('--lit', (v * (1 - cl(g - RLEV[i] - .9))).toFixed(2)); });
      inks.forEach((e, k) => { const v = sm(cl(g - RLEV[RL[k][1]] + .55)); e.style.strokeDashoffset = (1 - v).toFixed(3); e.style.opacity = v > .01 ? 1 : 0; });
      tr.set(chain, chain.L * cl(g / 5.6), 50); }, destroy() {} };
  };
  A.conceptric = svg => {                            // one set of nested records, hung first from its container and then from one of its parts
    const X = { r: [[200, 44], [214, 166]], a: [[118, 104], [150, 104]], b: [[282, 104], [280, 224]], a1: [[72, 166], [86, 166]], a2: [[164, 166], [200, 44]], b1: [[238, 166], [236, 276]], b2: [[326, 166], [326, 276]] };
    const E = [['r', 'a'], ['r', 'b'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1'], ['b', 'b2']], ids = Object.keys(X);
    const env = [['a', 'a1', 'a2'], ['b', 'b1', 'b2']].map(m => ({ m, e: mk(svg, 'rect', 'ea-frame ea-dash', { rx: 16 }) }));
    const edges = E.map(() => mk(svg, 'path', 'ea-ink')), nodes = ids.map(() => { const g = mk(svg, 'g'); mk(g, 'rect', 'ea-node', { x: -11, y: -11, width: 22, height: 22, rx: 6 }); mk(g, 'rect', 'ea-inner', { x: -5.5, y: -5.5, width: 11, height: 11, rx: 3 }); return g; }), tr = tracer(svg);
    return { tick(t) { const u = ping(t, 2.3, 1.7), pos = {}; ids.forEach((id, i) => { const p = pos[id] = mixP(X[id][0], X[id][1], u); nodes[i].setAttribute('transform', `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`); nodes[i].style.setProperty('--lit', (id === 'r' ? 1 - u : id === 'a2' ? u : 0).toFixed(2)); });
      E.forEach(([a, b], k) => edges[k].setAttribute('d', dPath([pos[a], pos[b]])));
      env.forEach(({ m, e }) => { const xs = m.map(i => pos[i][0]), ys = m.map(i => pos[i][1]); e.setAttribute('x', Math.min(...xs) - 24); e.setAttribute('y', Math.min(...ys) - 24); e.setAttribute('width', Math.max(...xs) - Math.min(...xs) + 48); e.setAttribute('height', Math.max(...ys) - Math.min(...ys) + 48); });
      const top = u < .5 ? ['r', 'a', 'a1'] : ['a2', 'a', 'r', 'b'], c = poly(top.map(i => pos[i])); tr.set(c, tri(t * .42) * c.L, 44); }, destroy() {} };
  };
  A.search = svg => {                                // a question's weight landing at the top and finding its own way down
    const root = [200, 36], C = [[96, 100], [200, 100], [304, 100]], L = C.map(c => [-34, 0, 34].map(dx => [c[0] + dx, 168]));
    const W = [[.2, .62, .18, 1, 2], [.58, .26, .16, 0, 0], [.14, .22, .64, 2, 1]];      // per question: weight of each container, the heaviest, the leaf it ends on
    C.forEach(c => mk(svg, 'path', 'ea-guide ea-on', { d: dPath([root, c]) })); L.forEach((ls, i) => ls.forEach(l => mk(svg, 'path', 'ea-guide ea-on', { d: dPath([C[i], l]) })));
    const hot = C.map(c => mk(svg, 'path', 'ea-heat', { d: dPath([root, c]) })), hot2 = L.map((ls, i) => ls.map(l => mk(svg, 'path', 'ea-heat', { d: dPath([C[i], l]) })));
    C.forEach(c => mk(svg, 'rect', 'ea-frame', { x: c[0] - 50, y: 78, width: 100, height: 112, rx: 14 }));
    const nr = mk(svg, 'circle', 'ea-node ea-big', { cx: root[0], cy: root[1], r: 9 }), nc = C.map(c => mk(svg, 'circle', 'ea-node', { cx: c[0], cy: c[1], r: 7 })), nl = L.map(ls => ls.map(l => mk(svg, 'rect', 'ea-node', { x: l[0] - 6, y: l[1] - 6, width: 12, height: 12, rx: 3 })));
    const blob = mk(svg, 'circle', 'ea-blob', { cx: root[0], cy: root[1] }), blobs = C.map(c => mk(svg, 'circle', 'ea-blob', { cx: c[0], cy: c[1] })), tr = tracer(svg);
    return { tick(t) { const T = 5.4, q = W[Math.floor(t / T) % 3], u = (t % T) / T, env = sm(cl(u / .08)) * (1 - sm(cl((u - .9) / .1))), s1 = sm(cl((u - .12) / .22)), s2 = sm(cl((u - .42) / .22));
      blob.setAttribute('r', (4 + 11 * env * (1 - .55 * s1)).toFixed(1)); blob.style.opacity = (.75 * env).toFixed(2); nr.style.setProperty('--lit', env.toFixed(2));
      C.forEach((c, i) => { const w = q[i] * s1 * env; hot[i].style.opacity = w.toFixed(2); hot[i].style.strokeWidth = (1 + 7 * w).toFixed(1); blobs[i].setAttribute('r', (3 + 15 * w * (i === q[3] ? 1 - .5 * s2 : 1)).toFixed(1)); blobs[i].style.opacity = (.7 * w + .001).toFixed(2); nc[i].style.setProperty('--lit', w.toFixed(2));
        L[i].forEach((l, j) => { const w2 = i === q[3] ? (j === q[4] ? .9 : .22) * s2 * env : 0; hot2[i][j].style.opacity = w2.toFixed(2); hot2[i][j].style.strokeWidth = (1 + 5 * w2).toFixed(1); nl[i][j].style.setProperty('--lit', w2.toFixed(2)); }); });
      const c = poly([root, C[q[3]], L[q[3]][q[4]]]); tr.set(c, c.L * cl((u - .1) / .58), 40); tr.hide((env * (u < .72 ? 1 : 1 - sm((u - .72) / .15))).toFixed(2)); }, destroy() {} };
  };
  A.reading = svg => {                               // a graph with no first page, straightened into the line one reader will follow
    const Gp = [[70, 60], [150, 36], [236, 70], [330, 44], [110, 132], [206, 150], [308, 128]], ord = [0, 4, 1, 5, 2, 6, 3], Lp = ord.map((_, k) => [44 + k * 52, 96]), E = [[0, 1], [0, 4], [1, 2], [4, 5], [1, 5], [2, 3], [5, 6], [2, 6]];
    const edges = E.map(() => mk(svg, 'path', 'ea-guide ea-on')), thread = mk(svg, 'path', 'ea-ink'), bar = mk(svg, 'rect', 'ea-frame', { x: 44, y: 168, width: 312, height: 12, rx: 6 }), fill = mk(svg, 'rect', 'ea-fill', { x: 44, y: 168, height: 12, rx: 6 });
    const nodes = Gp.map(() => mk(svg, 'circle', 'ea-node', { r: 9 })), tr = tracer(svg);
    return { tick(t) { const u = ping(t, 2.2, 1.8), pos = Gp.map((p, i) => mixP(p, Lp[ord.indexOf(i)], u)); nodes.forEach((n, i) => { n.setAttribute('cx', pos[i][0].toFixed(1)); n.setAttribute('cy', pos[i][1].toFixed(1)); });
      E.forEach(([a, b], k) => { edges[k].setAttribute('d', dPath([pos[a], pos[b]])); edges[k].style.opacity = (.5 * (1 - .8 * u)).toFixed(2); });
      const c = poly(ord.map(i => pos[i])); thread.setAttribute('d', dPath(c.P)); thread.style.opacity = (.25 + .75 * u).toFixed(2);
      const T = 2 * (2.2 + 1.8), ph = (t % T) / T, f = u > .98 ? cl((ph - .225) / .26) : 0; tr.set(c, c.L * (u > .98 ? f : tri(t * .3)), 46);
      fill.setAttribute('width', (312 * (u > .98 ? f : u < .02 ? 0 : cl(f))).toFixed(1)); fill.style.opacity = u.toFixed(2); bar.style.opacity = (.3 + .5 * u).toFixed(2);
      nodes.forEach((n, i) => n.style.setProperty('--lit', (u > .98 && ord.indexOf(i) / 6 <= f + .02 ? 1 : 0).toFixed(2))); }, destroy() {} };
  };
  A.change = svg => {                                // one record changes; each neighbour is marked, looked at, and either stops the change or passes it on
    const P = [[52, 104], [136, 58], [136, 150], [224, 36], [224, 104], [224, 176], [318, 70], [318, 146]], E = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [4, 6], [4, 7]], when = [0, 1, 1, 2, 2, 9, 3, 3];   // record 5 is never reached: the change stopped at 2
    const edges = E.map(([a, b]) => mk(svg, 'path', 'ea-guide ea-on', { d: dPath([P[a], P[b]]) })), hot = E.map(([a, b]) => mk(svg, 'path', 'ea-heat ea-coral', { d: dPath([P[a], P[b]]), pathLength: 1, 'stroke-dasharray': 1 }));
    const nodes = P.map((p, i) => mk(svg, i ? 'circle' : 'path', 'ea-node ea-state', i ? { cx: p[0], cy: p[1], r: 10 } : { d: `M${p[0] - 9} ${p[1] - 12}h11l7 7v17h-18Z` }));
    return { tick(t) { const T = 7.2, u = (t % T), fade = 1 - sm(cl((u - 5.9) / 1.1));
      nodes.forEach((n, i) => { const s = u - when[i] * 1.15 - .3, mark = sm(cl(s / .3)) * (1 - sm(cl((s - 1.15) / .35))), done = sm(cl((s - 1.15) / .35)); n.style.setProperty('--rev', (mark * fade).toFixed(2)); n.style.setProperty('--ok', (done * fade).toFixed(2)); });
      E.forEach(([a, b], k) => { const s = u - when[a] * 1.15 - 1.1, v = when[b] > 5 ? 0 : sm(cl(s / .5)); hot[k].style.strokeDashoffset = (1 - v).toFixed(3); hot[k].style.opacity = (v * (1 - sm(cl((s - .9) / .5))) * fade).toFixed(2); }); }, destroy() {} };
  };
  A.interface = svg => {                             // one object seen twice: a page of prose and a set of records, an edit in either appearing in the other
    const len = [112, 96, 118, 84, 106, 70], ly = i => 54 + i * 22, R = [[262, 52], [336, 84], [262, 120], [336, 156], [270, 184]], RE = [[0, 1], [0, 2], [2, 3], [2, 4]];
    mk(svg, 'rect', 'ea-frame', { x: 30, y: 26, width: 156, height: 170, rx: 10 }); mk(svg, 'rect', 'ea-frame ea-dash', { x: 226, y: 26, width: 148, height: 184, rx: 18 });
    const lines = len.map((l, i) => mk(svg, 'path', 'ea-ink ea-text', { d: `M48 ${ly(i)}h${l}` })); RE.forEach(([a, b]) => mk(svg, 'path', 'ea-guide ea-on', { d: dPath([R[a], R[b]]) }));
    const nodes = R.map(r => mk(svg, 'rect', 'ea-node', { x: r[0] - 10, y: r[1] - 8, width: 20, height: 16, rx: 4 })), wires = [[2, 2], [4, 3]].map(([li, ri]) => poly([[48 + len[li] + 8, ly(li)], [206, ly(li)], [206, R[ri][1]], [R[ri][0] - 14, R[ri][1]]]));
    const wEl = wires.map(w => mk(svg, 'path', 'ea-guide', { d: dPath(w.P) })), caret = mk(svg, 'path', 'ea-caret'), tr = tracer(svg);
    return { tick(t) { const T = 9, u = (t % T) / T, half = u < .5 ? 0 : 1, v = (u * 2) % 1, li = half ? 4 : 2, ri = half ? 3 : 2, w = wires[half];
      const edit = sm(cl(v / .25)), go = cl((v - .28) / .32), land = sm(cl((v - .6) / .12)) * (1 - sm(cl((v - .82) / .16)));
      lines.forEach((e, i) => { const mine = i === li, grow = mine ? (half ? 1 : .72 + .28 * edit) : 1; e.setAttribute('d', `M48 ${ly(i)}h${(len[i] * grow).toFixed(1)}`); e.style.setProperty('--lit', (mine ? (half ? land : edit * (1 - land)) : 0).toFixed(2)); });
      nodes.forEach((n, i) => n.style.setProperty('--lit', (i === ri ? (half ? (1 - sm(cl((v - .3) / .2))) * sm(cl(v / .1)) : land) : 0).toFixed(2)));
      caret.setAttribute('d', half ? '' : `M${(48 + len[li] * (.72 + .28 * edit)).toFixed(1)} ${ly(li) - 7}v14`); caret.style.opacity = half ? 0 : (1 - go).toFixed(2);
      tr.set(w, w.L * (half ? 1 - go : go), 34); tr.hide(go > 0 && go < 1 ? 1 : 0); wEl.forEach((e, i) => e.style.opacity = i === half ? .5 : .16); }, destroy() {} };
  };
  A.network = svg => {                               // projects that are one node from far away and a graph from close by, joined by what they cite
    const C = [[86, 78], [212, 124], [322, 62], [116, 186], [300, 188]], S = [[-20, -14], [18, -16], [22, 14], [-16, 16], [0, 0]], IE = [[0, 4], [1, 4], [2, 4], [3, 4], [0, 1]], XE = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 4]];
    const arcs = XE.map(() => mk(svg, 'path', 'ea-guide ea-on')), groups = C.map(() => { const g = mk(svg, 'g'); return { g, box: mk(g, 'rect', 'ea-frame', { rx: 14 }), e: IE.map(() => mk(g, 'path', 'ea-ink ea-thin')), n: S.map((_, i) => mk(g, 'circle', i === 4 ? 'ea-node' : 'ea-dot', { r: i === 4 ? 6 : 3.4 })) }; });
    const ring = poly([0, 1, 2, 4, 1, 3, 1, 0].map(i => C[i])), tr = tracer(svg);
    return { tick(t) { groups.forEach((G, k) => { const z = .28 + .72 * sm(.5 + .5 * Math.sin(t * .55 + k * 1.7)), c = C[k], pts = S.map(s => [c[0] + s[0] * z * 1.25, c[1] + s[1] * z * 1.25]);
        G.n.forEach((n, i) => { n.setAttribute('cx', pts[i][0].toFixed(1)); n.setAttribute('cy', pts[i][1].toFixed(1)); n.style.opacity = i === 4 ? 1 : z.toFixed(2); }); IE.forEach(([a, b], i) => { G.e[i].setAttribute('d', dPath([pts[a], pts[b]])); G.e[i].style.opacity = (z * .9).toFixed(2); });
        const hw = 14 + 26 * z, hh = 12 + 20 * z; G.box.setAttribute('x', c[0] - hw); G.box.setAttribute('y', c[1] - hh); G.box.setAttribute('width', 2 * hw); G.box.setAttribute('height', 2 * hh); });
      XE.forEach(([a, b], k) => arcs[k].setAttribute('d', `M${C[a][0]} ${C[a][1]}Q${(C[a][0] + C[b][0]) / 2} ${(C[a][1] + C[b][1]) / 2 - 26} ${C[b][0]} ${C[b][1]}`));
      tr.set(ring, (t * 44) % ring.L, 52); }, destroy() {} };
  };
  A.made = svg => {                                  // a thread through nine things in the order they were made
    const pts = []; for (let i = 0; i < 9; i++) { const r = i < 5 ? 0 : 1, j = r ? 8 - i : i; pts.push([44 + (r ? j + .5 : j) * 78, 196 + r * 52]); }
    const c = poly([[10, 196], ...pts.slice(0, 5), [392, 196], [392, 248], ...pts.slice(5), [10, 248]]);
    mk(svg, 'path', 'ea-guide ea-on', { d: dPath(c.P) }); const ink = mk(svg, 'path', 'ea-ink', { d: dPath(c.P), pathLength: 1, 'stroke-dasharray': 1 }), nodes = pts.map(p => mk(svg, 'rect', 'ea-node', { x: p[0] - 7, y: p[1] - 7, width: 14, height: 14, rx: 3 })), tr = tracer(svg);
    return { tick(t) { const u = tri(t * .11), d = u * c.L; ink.style.strokeDashoffset = (1 - u).toFixed(3); tr.set(c, d, 60); nodes.forEach((n, i) => n.style.setProperty('--lit', cl(1 - Math.abs(at(c, d).p[0] - pts[i][0]) / 30 - Math.abs(at(c, d).p[1] - pts[i][1]) / 12).toFixed(2))); }, destroy() {} };
  };
  A.phases = svg => {                                // voters reporting to one centre: all at once, then through groups, then through groups of groups
    const g = mk(svg, 'g', '', { transform: 'translate(86 -22) scale(.74)' }), Cc = 160, R = 150, R1 = 56, R2 = 103, N = 27, pol = (r, a) => [Cc + r * Math.cos(a), Cc + r * Math.sin(a)], ang = i => -Math.PI / 2 + (i + .5) / N * 2 * Math.PI, mid = (i, j) => (ang(i) + ang(j)) / 2;
    const leaves = Array.from({ length: N }, (_, i) => ({ a: ang(i), hub: mid(Math.floor(i / 9) * 9, Math.floor(i / 9) * 9 + 8), sub: mid(Math.floor(i / 3) * 3, Math.floor(i / 3) * 3 + 2) }));
    const route = (l, depth) => { const u1 = sm(cl(depth)), u2 = sm(cl(depth - 1)), end = pol(R, l.a), p1 = mixP(pol(R1, l.a), pol(R1, l.hub), u1), p2 = mixP(mixP(p1, end, (R2 - R1) / (R - R1)), pol(R2, l.sub), u2); return [end, p2, p1, [Cc, Cc]]; };
    mk(g, 'path', 'ea-frame', { d: [R1, R2, R].map(r => `M${Cc + r} ${Cc}A${r} ${r} 0 1 0 ${Cc - r} ${Cc}A${r} ${r} 0 1 0 ${Cc + r} ${Cc}`).join('') });
    const ink = leaves.map(() => mk(g, 'path', 'ea-ink ea-thin')); leaves.forEach(l => { const p = pol(R, l.a); mk(g, 'circle', 'ea-dot', { cx: p[0], cy: p[1], r: 2.8 }); });
    const halo = mk(g, 'circle', 'ea-blob', { cx: Cc, cy: Cc }), core = mk(g, 'circle', 'ea-node ea-big', { cx: Cc, cy: Cc, r: 6 }), sig = leaves.filter((_, i) => i % 3 === 1).map(l => ({ l, c: mk(g, 'circle', 'ea-tip', { r: 3.6 }) })), seq = [0, 1, 2, 1], step = 2.3, beat = 1.7;
    return { tick(t) { const pos = t / step, i = Math.floor(pos) % 4, u = sm(cl((pos - Math.floor(pos) - .23) / .6)), depth = seq[i] + (seq[(i + 1) % 4] - seq[i]) * u;
      leaves.forEach((l, k) => ink[k].setAttribute('d', dPath(route(l, depth))));
      const ph = (t % beat) / beat, reach = .5 + .17 * depth, f = cl(ph / reach); sig.forEach(s => { const c = poly(route(s.l, depth)), p = at(c, sm(f) * c.L).p; s.c.setAttribute('cx', p[0].toFixed(1)); s.c.setAttribute('cy', p[1].toFixed(1)); s.c.style.opacity = (Math.sin(Math.PI * Math.min(1, f)) * .9).toFixed(2); });
      const aft = (ph - reach) / (1 - reach), hit = aft >= 0 ? Math.exp(-aft * 3.2) * Math.sin(Math.PI * Math.min(1, aft * 6)) : 0, sw = hit * (1 - .42 * depth);
      halo.setAttribute('r', (8 + 30 * sw).toFixed(1)); halo.style.opacity = (.12 + .5 * sw).toFixed(2); core.setAttribute('r', (6 + 4 * sw).toFixed(1)); }, destroy() {} };
  };
  A.memory = svg => {                                // a question passing through a few shared states; a correction touching one path among them
    const col = [56, 152, 248, 344], S = [[110], [62, 158], [62, 158], [110]], P = S.map((ys, i) => ys.map(y => [col[i], y])), E = [];
    for (let i = 0; i < 3; i++) P[i].forEach(a => P[i + 1].forEach(b => E.push([a, b])));
    E.forEach(e => mk(svg, 'path', 'ea-guide ea-on', { d: dPath(e) })); const flow = E.map(e => mk(svg, 'path', 'ea-heat', { d: dPath(e), pathLength: 1, 'stroke-dasharray': '.3 1' }));
    const fix = poly([P[0][0], P[1][1], P[2][0], P[3][0]]), fixEl = mk(svg, 'path', 'ea-heat ea-coral', { d: dPath(fix.P), pathLength: 1, 'stroke-dasharray': 1 }); P.forEach(c => c.forEach(p => mk(svg, 'circle', 'ea-node', { cx: p[0], cy: p[1], r: 10 }))); const tr = tracer(svg);
    return { tick(t) { const T = 8, u = (t % T) / T, q = u < .55 ? u / .55 : 0, c = u >= .6 ? (u - .6) / .4 : 0;
      flow.forEach((e, k) => { const stage = Math.floor(k / (k < 2 ? 2 : k < 6 ? 4 : 2)), s = k < 2 ? 0 : k < 6 ? 1 : 2, v = cl(q * 3.4 - s); e.style.strokeDashoffset = (1.3 - 1.3 * v).toFixed(3); e.style.opacity = (q > 0 ? Math.sin(Math.PI * cl(v)) * .9 : 0).toFixed(2); });
      const v = sm(cl(c / .45)); fixEl.style.strokeDashoffset = (1 - v).toFixed(3); fixEl.style.opacity = (c > 0 ? 1 - sm(cl((c - .7) / .3)) : 0).toFixed(2); tr.set(fix, fix.L * v, 40); tr.hide(c > 0 && c < .6 ? 1 : 0); }, destroy() {} };
  };
  A.cover = (href, crop) => svg => {                         // a thing that was made, shown by its own cover, with a light going round its frame
    const id = 'eac' + Math.random().toString(36).slice(2, 8); mk(svg, 'clipPath', '', { id }).appendChild(document.createElementNS(NS, 'rect')).setAttribute('width', 400); svg.querySelector('#' + id + ' rect').setAttribute('height', 300);
    const z = crop ? crop[0] : 1, w = 428 * z, h = 320 * z, im = mk(svg, 'image', 'ea-cover', { href, x: crop ? -14 - (w - 428) * crop[1] : -14, y: crop ? -10 - (h - 320) * crop[2] : -10, width: w, height: h, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${id})` });
    const c = poly([[10, 10], [390, 10], [390, 290], [10, 290], [10, 10]]); mk(svg, 'path', 'ea-frame', { d: dPath(c.P) }); const tr = tracer(svg);
    return { tick(t) { im.setAttribute('transform', `translate(${(6 * Math.sin(t * .23)).toFixed(2)} ${(4 * Math.cos(t * .19)).toFixed(2)})`); tr.set(c, (t * 70) % c.L, 90); }, destroy() {} };
  };
  A._ = A.object; A.theory = A.hilbert; A.cost = A.hilbert;
  window.EIGEN_ART = A;
})();
