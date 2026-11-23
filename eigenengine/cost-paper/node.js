/* The Cost of Complexity: node `cost`, on its gold ground.
   Outside: the Hilbert construction of the existing card, kept as it was (assets/js/eigenengine-paper.js).
   Inside: one exhibit. The same symbols are held in one register, split, nested and priced, along a path of
   seven reader states that ends in what the paper gives EigenEngine: why a conceptric nests, how far to split.
   Contract: evidence/EIGENENGINE_PAGES_2026-11-23/dispatch/CONTRACT.md. Styles: node.css, under .egn-cost. */
(() => {
  'use strict';
  const EM = window.EigenMotion || (() => {           // the pages load eigen-motion.js; this only keeps a bare load alive
    const M = window.EG_MOTION = window.EG_MOTION || { off: false, rate: 1 };
    class Spring { constructor(v = 0) { this.v = this.g = v; } to(g) { this.g = this.v = g; return this; } snap(g) { return this.to(g); } step() { return false; } }
    return { M, Spring, clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), smooth: x => x * x * (3 - 2 * x) };
  })();
  const { M, Spring, clamp } = EM;
  const NS = 'http://www.w3.org/2000/svg';
  const S = (parent, name, attrs, css) => { const e = document.createElementNS(NS, name); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (css) e.style.cssText = css; parent.appendChild(e); return e; };
  const H = (parent, tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };
  const mix = (a, b, t) => 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')';
  const fmt = v => Math.abs(v - Math.round(v)) < .005 ? String(Math.round(v)) : (Math.abs(v * 2 - Math.round(v * 2)) < .01 ? v.toFixed(1) : v.toFixed(2));

  /* Hilbert cell of a rank on a side x side grid. Four consecutive ranks share a parent cell at every order. */
  const hpt = (side, rank) => {
    let x = 0, y = 0;
    for (let size = 1; size < side; size *= 2) {
      const right = 1 & (rank >> 1), up = 1 & (rank ^ right);
      if (!up) { if (right) { x = size - 1 - x; y = size - 1 - y; } [x, y] = [y, x]; }
      x += size * right; y += size * up; rank >>= 2;
    }
    return [x, y];
  };
  const dOf = pts => pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2)).join('');
  function curve(vertices) {                          // a polyline measured by arclength, skipping coincident vertices
    const points = [vertices[0]], distances = [0];
    let length = 0;
    for (let i = 1; i < vertices.length; i++) {
      const [x, y] = points[points.length - 1], v = vertices[i], seg = Math.hypot(v[0] - x, v[1] - y);
      if (seg < 1e-6) continue;
      length += seg; distances.push(length); points.push(v);
    }
    return { points, distances, length, d: dOf(points) };
  }
  function atDistance(c, distance) {
    if (c.points.length < 2) return { point: c.points[0], segment: 0 };
    let low = 0, high = c.points.length - 1;
    while (low + 1 < high) { const mid = (low + high) >> 1; if (c.distances[mid] < distance) low = mid; else high = mid; }
    const ratio = (distance - c.distances[low]) / (c.distances[high] - c.distances[low]);
    const [x, y] = c.points[low], [ex, ey] = c.points[high];
    return { point: [x + (ex - x) * ratio, y + (ey - y) * ratio], segment: low };
  }
  const reflected = v => { const lap = (v % 2 + 2) % 2; return lap <= 1 ? lap : 2 - lap; };
  function wake(c, head, tail) {                      // the lit stretch between two arclength fractions, and its tip
    let left = Math.min(head.f, tail.f), right = Math.max(head.f, tail.f);
    if (Math.floor(head.t) !== Math.floor(tail.t)) { if (Math.floor(head.t) % 2 === 1) right = 1; else left = 0; }
    const a = atDistance(c, left * c.length), b = atDistance(c, right * c.length);
    return { d: dOf([a.point, ...c.points.slice(a.segment + 1, b.segment + 1), b.point]), tip: atDistance(c, head.f * c.length).point };
  }

  /* ---------- outside: the card art ----------
     The Hilbert curve opens from order 1 to order 4 and closes again while a light travels along it.
     Geometry, timing, strokes and colours are those of the existing card. */
  let LEVELS = null, SHAPES = null;
  function art(svg) {
    if (!LEVELS) {
      LEVELS = [2, 4, 8, 16].map(side => Array.from({ length: 256 }, (_, i) => {
        const [x, y] = hpt(side, Math.floor(i * side * side / 256));
        return [(x + .5) * 320 / side, 320 - (y + .5) * 320 / side];
      }));
      SHAPES = LEVELS.map(curve);
    }
    const SIDE = 292, X = 400 * (1 - .012) - SIDE, Y = 4.5;      // as on the existing card: 73% of the width, 1.2% from the right, 1.5% from the top, turned six degrees
    const g = S(svg, 'g', { transform: `rotate(-6 ${X + SIDE / 2} ${Y + SIDE / 2}) translate(${X} ${Y}) scale(${SIDE / 346}) translate(13 13)`, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    S(g, 'path', { d: 'M0 0H320V320H0Z M160 0V320 M0 160H320' }, 'stroke:#d9c48e;stroke-opacity:.25;stroke-width:.9');
    const guide = S(g, 'path', {}, 'stroke:#e1bb72;stroke-width:2;opacity:.25');
    const ink = S(g, 'path', {}, 'stroke:var(--eg-cost-line,#b69961);stroke-width:2.35');
    const tracer = S(g, 'g', {}, 'filter:drop-shadow(0 0 3px #ffd58b)');
    const trail = S(tracer, 'path', {}, 'stroke:#ffe3a8;stroke-width:4.6');
    const tip = S(tracer, 'circle', { r: 4.7 }, 'fill:#fff9e9;stroke:#f7ce7e;stroke-width:1.5');
    const sequence = [0, 1, 2, 3, 2, 1], stepTime = 1660;
    let clock = 0, travel = .43, last = null, painted = null, paintedGuide = -1, drawn = false;
    function draw(dt) {
      const index = Math.floor(clock / stepTime) % sequence.length;
      const from = sequence[index], to = sequence[(index + 1) % sequence.length];
      const t = clamp(((clock % stepTime) / stepTime - .23) / .6);
      const ease = t * t * (3 - 2 * t);
      let active = SHAPES[from];
      if (t === 1) active = SHAPES[to];
      else if (t > 0) active = curve(LEVELS[from].map(([x, y], i) => [x + (LEVELS[to][i][0] - x) * ease, y + (LEVELS[to][i][1] - y) * ease]));
      if (active !== painted) { ink.setAttribute('d', active.d); painted = active; }
      if (from !== paintedGuide) { guide.setAttribute('d', SHAPES[from].d); paintedGuide = from; }
      guide.style.opacity = String(.12 + .16 * (1 - ease));
      // The head and its short wake follow the arclength of the path painted above, and turn back at either end.
      travel += dt * Math.max(.000062, Math.min(.00019, .185 / active.length));
      const tailTime = travel - Math.min(.16, 108 / active.length);
      const w = wake(active, { t: travel, f: reflected(travel) }, { t: tailTime, f: reflected(tailTime) });
      trail.setAttribute('d', w.d);
      tip.setAttribute('cx', w.tip[0].toFixed(2)); tip.setAttribute('cy', w.tip[1].toFixed(2));
      drawn = true;
    }
    draw(0);
    return {
      tick(t) {
        const now = t * 1000;
        let dt = last === null ? 0 : Math.min(100, Math.max(0, now - last));
        last = now;
        if (M.off) dt = 0;
        if (dt === 0 && drawn) return;
        clock = (clock + dt) % (stepTime * sequence.length);
        draw(dt);
      },
      destroy() { g.remove(); }
    };
  }

  /* ---------- inside: the exhibit ---------- */
  const PDF = '/assets/docs/the-cost-of-complexity.pdf';
  const STEPS = [
    { label: 'One register', holds: 'A register holds alternatives', source: { text: 'Figure 2, p. 5', page: 5, region: 'cost-fig-2' },
      caption: 'A <i>register</i> is any physical system whose distinguishable states stand for alternatives. Here it holds sixteen symbols, ranked from the most typical to the least, and we suppose it needs one element for every alternative it must tell apart.' },
    { label: 'Split it', holds: 'Choosing a register costs too', source: { text: 'Figure 2, p. 5', page: 5, region: 'cost-fig-2bc' },
      caption: 'Four registers of four make each choice smaller. The choice of register is itself a distinction that must be held somewhere, and the selector that holds it is a register too.' },
    { label: 'Move the boundary', holds: 'Neither extreme is free', source: { text: 'Figure 2 and Equation 8, p. 5', page: 5, region: 'cost-fig-2' },
      caption: 'Suppose we give every symbol a register of its own, so that nothing is left to choose inside it. The selector now holds all sixteen alternatives, and the original problem has reappeared one level up.' },
    { label: 'Nest it', holds: 'A level multiplies the range', source: { text: 'Theorem 3, p. 7', page: 7, region: 'cost-theorem-3' },
      caption: 'The same move can be repeated, so that every symbol becomes a register of four finer ones, and the row folds into a square. Each square is then a register for the four it contains and one symbol of the square above, so every level multiplies the range by four while adding four elements to the cost.' },
    { label: 'Price a level', holds: 'A level costs what it divides', source: { text: 'Figure 3, p. 10', page: 10, region: 'cost-fig-3' },
      caption: 'What does another level cost? Priced by the area it divides, every level adds the same amount and the total grows as a logarithm, while priced by the length of wall it builds each level costs twice the last.' },
    { label: 'How far to split', holds: 'A fixed cost sets the split', source: { text: 'The economy of digits, p. 8', page: 8 },
      caption: 'Suppose a register also costs something merely to exist, before it holds anything. When that cost is small the cheapest design is deep with small registers, and as it grows the registers widen.' },
    { label: 'In EigenEngine', holds: 'A conceptric is a register',
      caption: 'A <i>conceptric</i> is a register in this double role, one object to whatever holds it and a container for what lies inside, which is why reaching one record opens only the containers on its path. How wide each level should be is then set by what a container costs to keep.' }
  ];
  const RULES = { area: { label: 'Area', gamma: 2, law: 'the total grows as the logarithm of the number of cells' }, wall: { label: 'Wall length', gamma: 1, law: 'the total grows as the square root of the number of cells' }, cubic: { label: 'Width cubed', gamma: 3, law: 'the total never reaches 2' } };
  const LAYOUTS = [{ b: 2, levels: 6, name: 'Twos' }, { b: 4, levels: 3, name: 'Fours' }, { b: 8, levels: 2, name: 'Eights' }, { b: 64, levels: 1, name: 'Whole' }];
  const total = (b, k0) => (Math.log(64) / Math.log(b)) * (k0 + b);
  const cheapest = k0 => LAYOUTS.reduce((best, l) => total(l.b, k0) < total(best.b, k0) - 1e-9 ? l : best, LAYOUTS[0]).b;
  const ties = (b, k0) => total(b, k0) < total(cheapest(k0), k0) + 1e-9;      // at no fixed cost, twos and fours cost the same
  const N = 64, SIZES = [64, 32, 16, 8, 4, 2];
  const BASE = (() => {                                // unit cells of every rank, and the box of every run of ranks
    const cell = { row: i => { const s = i >> 2; return [s / 16, 0, (s + 1) / 16, 1]; }, sq: i => { const [x, y] = hpt(8, i); return [x / 8, (7 - y) / 8, (x + 1) / 8, (8 - y) / 8]; } };
    const out = {};
    for (const g of ['row', 'sq']) {
      const B = out[g] = { leaf: Array.from({ length: N }, (_, i) => cell[g](i)) };
      for (const s of SIZES) for (let a = 0; a < N; a += s) {
        const b = [1, 1, 0, 0];
        for (let i = a; i < a + s; i++) { const c = B.leaf[i]; b[0] = Math.min(b[0], c[0]); b[1] = Math.min(b[1], c[1]); b[2] = Math.max(b[2], c[2]); b[3] = Math.max(b[3], c[3]); }
        B[s + ':' + a] = b;
      }
    }
    return out;
  })();
  const INK = [233, 226, 208], GOLD = [255, 217, 138], LINE = [182, 153, 97], LIT = [255, 227, 168];

  function mount(host, opts = {}) {
    const compact = !!opts.compact;
    const root = H(host, 'div', 'egn-cost egc-x' + (compact ? ' egc-compact' : ''));
    const figBox = H(root, 'div', 'egc-figbox');
    const svg = S(figBox, 'svg', { class: 'egc-fig', role: 'group', 'aria-label': 'Sixty-four ranked symbols held in registers. The steps split, nest and price the registers. The arrow keys move the selection from one symbol to the next.' });
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', e => {
      const unit = st.geo === 'row' ? 4 : st.step === 3 || st.step === 4 ? 64 / 4 ** st.depth : 1;
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault(); e.stopPropagation();
      const g = Math.floor(st.sel / unit), n = N / unit, to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : clamp(g + d, 0, n - 1);
      select(to * unit + (st.sel % unit));
    });
    const ctl = H(figBox, 'div', 'egc-ctl');
    const side = H(root, 'div', 'egc-side');

    const st = { step: 0, geo: 'row', n: 16, selector: false, depth: 3, rule: 'area', cuts: false, k0: 0, b: 4, sel: 42, pathOnly: false };
    let W = 0, Ht = 0, dead = false, raf = 0, lastT = 0, clockMs = 0, beat = 0, seen = true;
    const timers = [];

    /* things drawn */
    const gFrames = S(svg, 'g'), gCuts = S(svg, 'g'), rankPath = S(svg, 'path', { class: 'egc-rank' });
    const gLinks = S(svg, 'g'), gRays = S(svg, 'g'), selBox = S(svg, 'rect', { class: 'egc-selbox', rx: 13 }), gHandles = S(svg, 'g');
    const pivot = S(svg, 'circle', { class: 'egc-pivot', r: 5.5 });
    const gLeaves = S(svg, 'g'), ring = S(svg, 'circle', { class: 'egc-ring' }), gNums = S(svg, 'g');
    const tracerG = S(svg, 'g', { class: 'egc-tracer' }), trail = S(tracerG, 'path'), tip = S(tracerG, 'circle', { r: 3 });
    const sp = v => new Spring(v);
    const frames = [], F = {}, handles = [];
    SIZES.forEach(s => { for (let a = 0; a < N; a += s) {
      const f = F[s + ':' + a] = { s, a, key: s + ':' + a, x: sp(0), y: sp(0), w: sp(2), h: sp(2), o: sp(0), hot: sp(0), on: false, hid: true, last: '',
        el: S(gFrames, 'rect', { class: 'egc-frame', rx: 5 }) };
      f.el.addEventListener('click', () => frameClick(f));
      frames.push(f);
      if (s >= 4) {
        const h = f.handle = { f, x: sp(0), y: sp(0), o: sp(0), hot: sp(0), last: '', link: S(gLinks, 'line', { class: 'egc-link' }), el: S(gHandles, 'circle', { class: 'egc-handle', r: 5 }) };
        h.el.addEventListener('click', () => select(f.a + (st.sel % Math.max(1, f.s))));
        handles.push(h);
      }
    } });
    const cuts = [64, 16, 4].map(s => ({ s, w: sp(0), o: sp(0), el: S(gCuts, 'path', { class: 'egc-cut' }), last: '' }));
    const leaves = Array.from({ length: N }, (_, i) => {
      const L = { i, x: sp(0), y: sp(0), r: sp(3), sel: sp(0), last: '', el: S(gLeaves, 'circle', { class: 'egc-leaf' }) };
      L.el.addEventListener('click', () => select(i));
      return L;
    });
    const nums = Array.from({ length: 16 }, (_, s) => ({ s, o: sp(1), el: S(gNums, 'text', { class: 'egc-num', 'text-anchor': 'middle' }), last: '' }));
    nums.forEach(n => { n.el.textContent = n.s + 1; });
    const sbox = { x: sp(0), y: sp(0), w: sp(10), o: sp(0), last: '' };
    // one ray for each symbol, from the handle of the register that holds it: the rays of a fan are its alternatives
    const rays = Array.from({ length: 16 }, (_, s) => ({ s, x: sp(0), y: sp(0), o: sp(0), hot: sp(0), last: '', el: S(gRays, 'line', { class: 'egc-ray' }) }));
    const piv = { x: sp(0), y: sp(0), o: sp(0), last: '' };
    const numO = sp(1), rankO = sp(.5), labO = sp(0), flash = sp(0);
    const gLab = S(svg, 'g'), labs = [0, 1, 2, 3].map(() => S(gLab, 'text', { class: 'egc-flab' }));
    const sr = H(figBox, 'p', 'egc-sr'); sr.setAttribute('aria-live', 'polite');

    /* the side: the reader's state, then a meter for the step in hand */
    const rail = H(side, 'div', 'egc-rail');
    H(rail, 'p', 'egc-lab', 'The reader now holds');
    const railBody = H(rail, 'div', 'egc-railbody');
    const fill = H(H(railBody, 'div', 'egc-fillwrap'), 'i', 'egc-fill');
    const ol = H(railBody, 'ol', 'egc-states');
    const stateEls = STEPS.map((s, i) => {
      const b = H(H(ol, 'li'), opts.onStep ? 'button' : 'span', 'egc-state', `<i>${i + 1}</i><span>${s.holds}</span><em class="egc-got"></em>`);
      if (opts.onStep) { b.type = 'button'; b.addEventListener('click', () => step(i, true)); }
      return b;
    });
    const now1 = H(rail, 'p', 'egc-now');                 // the one line a narrow screen has room for
    const got = STEPS.map(() => '');                     // what the reader arrived at in each state, kept as they move on
    const meter = H(side, 'div', 'egc-meter');
    const ui = [];                                       // springs that drive plain DOM
    const U = (v0, f) => { const u = { s: sp(v0), f, last: NaN }; ui.push(u); return u.s; };
    const pane = (parent, cls, html) => { const e = H(parent, 'div', 'egc-pane ' + cls, html); const o = U(0, v => { e.style.opacity = v.toFixed(3); e.style.visibility = v < .02 ? 'hidden' : 'visible'; }); return { e, o }; };
    const barOf = (e, max) => U(0, v => { e.style.transform = `scaleX(${clamp(v / max, 0, 1).toFixed(4)})`; });
    const numOf = (e, dec) => U(0, v => { const t = dec ? fmt(Math.round(v * 4) / 4) : String(Math.round(v)); if (e.textContent !== t) e.textContent = t; });
    const q = (p, s) => p.e.querySelector(s);

    const mA = pane(meter, 'egc-mA', `<p class="egc-lab">Elements needed to reach one symbol</p>
      <div class="egc-stack"><i class="egc-seg-a"></i><i class="egc-seg-b"></i></div>
      <p class="egc-sum"><span data-ml><span class="egc-key egc-key-a"></span><b data-m>0</b> to choose the register</span><br><span class="egc-key egc-key-b"></span><b data-n>16</b> to choose inside it<br><strong data-t>16</strong> in all</p>
      <div class="egc-profile" aria-hidden="true">${[[1, 16], [2, 8], [4, 4], [8, 2], [16, 1]].map(([m, n]) => `<span data-n="${n}"><i style="height:${((m > 1 ? m : 0) + (n > 1 ? n : 0)) * 2.4}px"></i>${m} × ${n}</span>`).join('')}</div>`);
    const aM = numOf(q(mA, '[data-m]')), aN = numOf(q(mA, '[data-n]')), aT = numOf(q(mA, '[data-t]'));
    const segA = U(0, v => { q(mA, '.egc-seg-a').style.width = (v / 16 * 50).toFixed(2) + '%'; }), segB = U(16, v => { q(mA, '.egc-seg-b').style.width = (v / 16 * 50).toFixed(2) + '%'; });
    const profO = U(0, v => { q(mA, '.egc-profile').style.opacity = v.toFixed(3); q(mA, '[data-ml]').style.opacity = v.toFixed(3); });

    const mB = pane(meter, 'egc-mB', `<p class="egc-lab">Elements needed as the range grows</p>
      <div class="egc-row"><span>One register of <b data-N>64</b></span><div class="egc-bar"><i data-flat></i></div><b class="egc-v" data-fv>64</b></div>
      <div class="egc-row"><span>Nested in fours, <b data-d>3</b> deep</span><div class="egc-bar"><i class="egc-gold" data-nest></i></div><b class="egc-v" data-nv>12</b></div>
      <p class="egc-note">Each level multiplies the range by four and adds four elements.</p>`);
    const bFlat = barOf(q(mB, '[data-flat]'), 64), bNest = barOf(q(mB, '[data-nest]'), 64), bFv = numOf(q(mB, '[data-fv]')), bNv = numOf(q(mB, '[data-nv]')), bN = numOf(q(mB, '[data-N]')), bD = numOf(q(mB, '[data-d]'));

    const mC = pane(meter, 'egc-mC', `<p class="egc-lab">Cost added by each level</p>
      ${[1, 2, 3].map(l => `<div class="egc-row" data-lv="${l}"><span>Level ${l} · ${4 ** (l - 1)} ${l === 1 ? 'split' : 'splits'}</span><div class="egc-bar"><i class="egc-gold"></i></div><b class="egc-v">0</b></div>`).join('')}
      <p class="egc-sum">Total <strong data-tot>3</strong><br><span data-law></span></p>
      <p class="egc-note">The gold ink drawn at a level is what that level costs.</p>`);
    const cBars = [1, 2, 3].map(l => ({ b: barOf(q(mC, `[data-lv="${l}"] i`), 4), v: numOf(q(mC, `[data-lv="${l}"] .egc-v`), true) })), cTot = numOf(q(mC, '[data-tot]'), true);

    const mD = pane(meter, 'egc-mD', `<p class="egc-lab">Cost of reaching one of 64 symbols</p>
      <svg class="egc-curve" viewBox="0 -8 220 112" aria-hidden="true"><path class="egc-axis" d="M10 6V78H216"/><text class="egc-mt" x="6" y="0">cost</text><text class="egc-mt" x="113" y="102" text-anchor="middle">symbols in each register</text><path class="egc-plot"/><g class="egc-marks"></g></svg>
      <div class="egc-chips"></div>`);
    const plot = q(mD, '.egc-plot'), marks = q(mD, '.egc-marks'), chips = q(mD, '.egc-chips');
    const dMarks = LAYOUTS.map(l => ({ l, el: S(marks, 'circle', { r: 3.4 }), tx: S(marks, 'text', { class: 'egc-mt', 'text-anchor': 'middle', y: 90 }) }));
    dMarks.forEach(m => { m.tx.textContent = m.l.b; });
    const dChips = LAYOUTS.map(l => {
      const b = H(chips, 'button', 'egc-chip', `<span>${l.name}</span><small>${l.levels === 1 ? 'one level' : l.levels + ' levels'}</small><b>0</b><em>cheapest</em>`);
      b.type = 'button'; b.addEventListener('click', () => { hush(); st.b = l.b; refresh(); });
      return { l, b, v: numOf(b.querySelector('b'), true) };
    });
    const k0S = U(0, v => {                              // the curve follows the slider through a spring, so it bends and never jumps
      let low = Infinity;
      const pts = []; for (let i = 0; i <= 64; i++) { const b = 2 * Math.pow(32, i / 64), t = total(b, v); pts.push([b, t]); low = Math.min(low, t); }
      const top = low * 2.18, X = b => 16 + 196 * Math.log(b / 2) / Math.log(32), Y = t => 74 - 62 * clamp((t - low * .93) / (low * 1.25));
      let d = '', pen = false;                            // the window follows the dip; the curve is drawn only where it lies inside
      for (let i = 0; i < pts.length; i++) {
        const [b, t] = pts[i], inside = t <= top;
        if (i && inside !== (pts[i - 1][1] <= top)) { const [b0, t0] = pts[i - 1], k = (top - t0) / (t - t0), bx = b0 * Math.pow(b / b0, k); d += (pen ? 'L' : 'M') + X(bx).toFixed(1) + ' ' + Y(top).toFixed(1); pen = inside; }
        if (inside) { d += (pen ? 'L' : 'M') + X(b).toFixed(1) + ' ' + Y(t).toFixed(1); pen = true; }
      }
      plot.setAttribute('d', d);
      dMarks.forEach(m => { const t = total(m.l.b, v); m.el.setAttribute('cx', X(m.l.b).toFixed(1)); m.el.setAttribute('cy', Y(Math.min(t, top)).toFixed(1)); m.el.style.opacity = t > top ? 0 : 1; m.tx.setAttribute('x', X(m.l.b).toFixed(1)); });
    });

    const mE = pane(meter, 'egc-mE', `<p class="egc-lab">The address of one record</p>
      <ol class="egc-ladder"></ol>
      <div class="egc-row"><span data-wl>Elements opened on its path</span><div class="egc-bar"><i class="egc-gold" data-way></i></div><b class="egc-v" data-wv>12</b></div>
      <div class="egc-row"><span>One flat register would need</span><div class="egc-bar"><i data-all></i></div><b class="egc-v">64</b></div>
      <p class="egc-note" data-lv></p>`);
    const eWay = barOf(q(mE, '[data-way]'), 84), eAll = barOf(q(mE, '[data-all]'), 84), eWv = numOf(q(mE, '[data-wv]'));
    const ladder = q(mE, '.egc-ladder'); let hover = 0;
    ladder.addEventListener('pointerover', e => { const li = e.target.closest('li'); hover = li ? +li.dataset.s : 0; });
    ladder.addEventListener('pointerleave', () => { hover = 0; });

    /* the controls under the figure: one small set for each step */
    const seg = (parent, items, on) => { const g = H(parent, 'div', 'egc-seg'); g.setAttribute('role', 'group'); return items.map(([v, t]) => { const b = H(g, 'button', '', t); b.type = 'button'; b.addEventListener('click', () => { hush(); on(v); }); return { v, b }; }); };
    const c0 = pane(ctl, 'egc-c0', '<p class="egc-hint">Click any symbol to select it.</p>');
    const c1 = pane(ctl, 'egc-c1', '<span class="egc-cl">Registers × symbols in each</span>');
    const segN = seg(c1.e, [[16, '1 × 16'], [8, '2 × 8'], [4, '4 × 4'], [2, '8 × 2'], [1, '16 × 1']], n => { st.n = n; refresh(); });
    const c2 = pane(ctl, 'egc-c2', '');
    H(c2.e, 'p', 'egc-hint egc-hint-r', 'Click a symbol to follow its address.');
    const depthBtn = (parent) => seg(parent, [[-1, 'Close a level'], [1, 'Open a level']], d => { st.depth = clamp(st.depth + d, 1, 3); refresh(); });
    const segD2 = depthBtn(c2.e);
    const c3 = pane(ctl, 'egc-c3', '<span class="egc-cl">Price one split by</span>');
    const segR = seg(c3.e, Object.keys(RULES).map(k => [k, RULES[k].label]), r => { if (r !== st.rule && !M.off) { flash.snap(1); flash.to(0); } st.rule = r; refresh(); });
    const segD3 = depthBtn(c3.e);
    const c4 = pane(ctl, 'egc-c4', '<label class="egc-slide"><span>What a register costs merely to exist: <b data-k>0</b></span><input type="range" min="0" max="1" step="0.005" value="0" aria-label="What a register costs merely to exist"></label>');
    const slider = q(c4, 'input'), kOut = q(c4, '[data-k]');
    slider.addEventListener('input', () => { hush(); st.k0 = Math.round(60 * slider.value * slider.value); st.b = cheapest(st.k0); refresh(); });
    const c5 = pane(ctl, 'egc-c5', '<span class="egc-cl">Click any dot or box to reach it</span>');
    const segP = seg(c5.e, [[true, 'Open only its path'], [false, 'Open everything']], p => { st.pathOnly = p; refresh(); });
    const ctlPanes = [c0, c1, c2, c3, c4, c5], meterPanes = [mA, mB, mC, mD, mE];

    /* ---------- state to targets ---------- */
    const levelsOf = () => st.b === 8 ? [[64, 'The paper'], [8, 'Section'], [1, 'Record']] : [[64, 'The paper'], [16, 'Section'], [4, 'Claim'], [1, 'Record']];
    const pathCost = () => (st.b === 8 ? 2 : 3) * st.b, allCost = () => st.b === 8 ? 72 : 84;      // elements on one path; elements in every register
    const hush = () => { while (timers.length) clearTimeout(timers.pop()); };
    const later = (fn, ms) => { if (M.off) fn(); else timers.push(setTimeout(fn, ms)); };
    const aim = (s, v, delay) => { if (delay && !M.off) { s.pv = v; s.pt = clockMs + delay; } else { s.pt = null; s.to(v); } };
    const tick = (s, dt) => { if (s.pt != null && clockMs >= s.pt) { s.to(s.pv); s.pt = null; } return s.step(dt); };
    const activeSizes = () => st.geo === 'row' ? (st.n === 16 ? [64] : [4 * st.n])
      : st.step === 3 || st.step === 4 ? [64, 16, 4].slice(0, st.depth)
      : { 64: [64], 8: [64, 8], 4: [64, 16, 4], 2: [64, 32, 16, 8, 4, 2] }[st.b];
    const inset = (r, d) => { const dx = Math.min(d, r[2] / 2 - .5), dy = Math.min(d, r[3] / 2 - .5); return [r[0] + dx, r[1] + dy, r[2] - 2 * dx, r[3] - 2 * dy]; };
    const mapper = (b, r) => { const kx = r[2] / (b[2] - b[0]), ky = r[3] / (b[3] - b[1]); return c => [r[0] + (c[0] - b[0]) * kx, r[1] + (c[1] - b[1]) * ky, (c[2] - c[0]) * kx, (c[3] - c[1]) * ky]; };
    const holds = (f, i) => i >= f.a && i < f.a + f.s;
    let selY = 0;

    function layout(snap, stagger) {
      if (!W || !Ht) return;
      const act = new Set(activeSizes()), B = BASE[st.geo], row = st.geo === 'row';
      // the fold between the row and the square carries marks a long way, so it runs on a softer spring
      const K = stagger ? 92 : 170, C = stagger ? 19.4 : 26.5;
      const go = (s, v, delay) => { s.k = K; s.c = C; if (snap) { s.pt = null; s.snap(v); } else aim(s, v, delay); };
      const slot = (W - 28) / 16;
      let R, gap, pad;
      if (row) {
        const h = clamp(slot * 2.3, 40, 150), yc = Ht * .74;
        R = [14, yc - h / 2, W - 28, h]; gap = clamp(slot * .16, 2, 10); pad = clamp(slot * .12, 2, 8);
        selY = Ht * (st.selector ? .36 : .2);
      } else {
        const sd = Math.min(W - 16, Ht - 12);
        R = [(W - sd) / 2, (Ht - sd) / 2, sd, sd]; gap = clamp(sd * .008, 1.6, 8); pad = clamp(sd * .013, 2.4, 14);
      }
      const cs = row ? 0 : (st.step === 3 || st.step === 4) ? 64 / 4 ** st.depth : 0;
      const padT = st.step === 6 ? clamp(R[2] * .036, 14, 26) : 0;           // in the last step every box keeps a strip for its name
      const u = clamp(Math.min(W, Ht) / 560, .75, 2.4);       // marks keep their proportion to the figure on a large screen
      const rad = (r, big) => clamp((big ? .2 : .27) * Math.min(r[2], r[3]), 1.7, (big ? 17 : 12) * u);
      const place = (s, a, map, cc) => {
        if (s === 1) {
          const r = cc || map(B.leaf[a]), big = !!cc && !row;
          placed[a] = [r[0] + r[2] / 2, r[1] + r[3] / 2, rad(r, big), big];
          if (!big) small = Math.min(small, placed[a][2]);
          return;
        }
        const f = F[s + ':' + a], on = act.has(s);
        let r = map(B[f.key]), m2 = map, c2 = cc;
        if (cc) {                                        // inside something closed: it rests as a point at that centre
          r = [cc[0] + cc[2] / 2 - 1, cc[1] + cc[3] / 2 - 1, 2, 2];
          f.on = false; f.hid = true;
        } else {
          let inner = r;
          if (on) { r = inset(r, gap); inner = inset(r, pad); if (padT) inner = [inner[0], r[1] + padT, inner[2], Math.max(2, r[3] - padT - pad)]; m2 = mapper(B[f.key], inner); }
          f.on = on; f.hid = false;
          if (s === cs || (st.pathOnly && on && s < 64 && !holds(f, st.sel))) c2 = inner;
        }
        f.t = r;
        go(f.x, r[0]); go(f.y, r[1]); go(f.w, r[2]); go(f.h, r[3]); go(f.o, f.on ? 1 : 0);
        const lit = f.on && holds(f, st.sel) && (row ? st.selector : true);
        go(f.hot, lit ? 1 : 0);
        place(s / 2, a, m2, c2); place(s / 2, a + s / 2, m2, c2);
      };
      const placed = []; let small = Infinity;
      place(64, 0, mapper(B['64:0'], R), null);
      placed.forEach((q, a) => { const L = leaves[a], d = stagger ? a * stagger : 0; go(L.x, q[0], d); go(L.y, q[1], d); go(L.r, q[3] ? q[2] : small, d); });
      let x0 = Infinity, x1 = -Infinity;
      for (const h of handles) {                         // a register's handle is its symbol one level up: it rises into the selector
        const f = h.f, up = row && f.on;
        const cx = f.t[0] + f.t[2] / 2;
        go(h.x, cx); go(h.y, up ? selY : f.t[1]); go(h.o, up ? 1 : 0); go(h.hot, up && holds(f, st.sel) ? 1 : 0);
        if (up) { x0 = Math.min(x0, cx); x1 = Math.max(x1, cx); }
      }
      if (x0 <= x1) { go(sbox.x, x0 - 15); go(sbox.w, x1 - x0 + 30); go(sbox.y, selY - 13); }
      go(sbox.o, row && st.selector ? 1 : 0);
      go(piv.x, W / 2); go(piv.y, Ht * .1); go(piv.o, row && st.selector ? 1 : 0);
      for (const r of rays) {                            // each symbol hangs from the handle of whichever register holds it now
        const f = F[(st.n === 16 ? 64 : 4 * st.n) + ':' + Math.floor(r.s / st.n) * 4 * st.n], mine = (st.sel >> 2) === r.s;
        go(r.x, row ? f.t[0] + f.t[2] / 2 : W / 2); go(r.y, row ? selY + 7 : Ht / 2); go(r.o, row ? 1 : 0);
        go(r.hot, mine ? 1 : holds(f, st.sel) ? .42 : .14);
      }
      go(numO, row ? 1 : 0); go(rankO, row ? .28 : st.step === 6 ? 0 : st.step === 3 ? .8 : .46); go(labO, st.step === 6 ? 1 : 0);
      const g = RULES[st.rule].gamma, w1 = clamp(R[2] * .017, 4, 11);
      cuts.forEach((c, l) => { go(c.o, st.cuts && !row && st.depth > l ? 1 : 0); go(c.w, w1 * Math.pow(2, -(g - 1) * l)); });
      leaves.forEach(L => go(L.sel, L.i === st.sel || (row && (L.i >> 2) === (st.sel >> 2)) ? 1 : 0));
    }

    /* everything that is not geometry: bars, numbers, which controls are lit */
    function readout() {
      const s = st.step, row = st.geo === 'row';
      const m0 = 16 / st.n, half = v => v === .5 ? '½' : v === .25 ? '¼' : String(v);
      got[s] = [ () => '16', () => `${m0} × ${st.n} costs ${(m0 > 1 ? m0 : 0) + (st.n > 1 ? st.n : 0)}`, () => `${m0} × ${st.n} costs ${(m0 > 1 ? m0 : 0) + (st.n > 1 ? st.n : 0)}`,
        () => `${4 ** st.depth} symbols for ${4 * st.depth}`, () => [0, 1, 2].slice(0, st.depth).map(l => half(Math.pow(2, (2 - RULES[st.rule].gamma) * l))).join(', '),
        () => LAYOUTS.find(l => l.b === st.b).name.toLowerCase(), () => `${st.pathOnly ? pathCost() : allCost()} against 64` ][s]();
      stateEls.forEach((e, i) => { e.classList.toggle('egc-done', i < s); e.classList.toggle('egc-nowst', i === s); const g = e.lastChild; if (g.textContent !== got[i]) g.textContent = got[i]; g.classList.toggle('egc-has', !!got[i]); });
      fillS.to(s / (STEPS.length - 1));
      now1.innerHTML = `<i>${s + 1}</i>${STEPS[s].holds}`;
      const mp = s <= 2 ? 0 : s - 2, cp = s === 0 ? 0 : s <= 2 ? 1 : s - 1;
      meterPanes.forEach((p, i) => { p.o.to(i === mp ? 1 : 0); p.e.classList.toggle('egc-live', i === mp); });
      ctlPanes.forEach((p, i) => { p.o.to(i === cp ? 1 : 0); p.e.classList.toggle('egc-live', i === cp); });
      const m = 16 / st.n, cm = st.selector && m > 1 ? m : 0, cn = st.n > 1 ? st.n : 0;
      aM.to(cm); aN.to(cn); aT.to(cm + cn); segA.to(cm); segB.to(cn); profO.to(st.selector ? 1 : 0);
      mA.e.querySelectorAll('.egc-profile span').forEach(e => e.classList.toggle('egc-on', +e.dataset.n === st.n));
      segN.forEach(o => o.b.classList.toggle('egc-on', o.v === st.n));
      const Nn = 4 ** st.depth;
      bFlat.to(Nn); bNest.to(4 * st.depth); bFv.to(Nn); bNv.to(4 * st.depth); bN.to(Nn); bD.to(st.depth);
      [segD2, segD3].forEach(g => { g[0].b.disabled = st.depth <= 1; g[1].b.disabled = st.depth >= 3; });
      const g = RULES[st.rule].gamma; let tot = 0;
      cBars.forEach((c, l) => { const v = st.depth > l ? Math.pow(2, (2 - g) * l) : 0; tot += v; c.b.to(v); c.v.to(v); });
      cTot.to(tot); q(mC, '[data-law]').textContent = 'With this price ' + RULES[st.rule].law + '.';
      segR.forEach(o => o.b.classList.toggle('egc-on', o.v === st.rule));
      k0S.to(st.k0); kOut.textContent = st.k0 + (st.k0 === 1 ? ' element' : ' elements');
      dChips.forEach(c => { c.v.to(total(c.l.b, st.k0)); c.b.classList.toggle('egc-on', c.l.b === st.b); c.b.classList.toggle('egc-best', ties(c.l.b, st.k0)); });
      dMarks.forEach(mk => { mk.el.setAttribute('class', (ties(mk.l.b, st.k0) ? 'egc-best ' : '') + (mk.l.b === st.b ? 'egc-on' : '')); });
      segP.forEach(o => o.b.classList.toggle('egc-on', o.v === st.pathOnly));
      const lv = levelsOf(), html = lv.map(([sz, name], k) => `<li data-s="${sz}"><i></i><span>${k ? `${name} <b>${Math.floor((st.sel % lv[k - 1][0]) / sz) + 1}</b> of ${st.b}` : name}</span></li>`).join('');
      if (ladder.dataset.h !== html) { ladder.dataset.h = html; ladder.innerHTML = html; }
      const way = st.pathOnly ? pathCost() : allCost();
      eWay.to(s === 6 ? way : 0); eWv.to(s === 6 ? way : 0); eAll.to(s === 6 ? 64 : 0);
      q(mE, '[data-wl]').textContent = st.pathOnly ? 'Elements opened on its path' : 'Elements opened in all';
      q(mE, '[data-lv]').textContent = !st.pathOnly ? 'Opening everything costs more than one flat register. The saving comes from opening one path.'
        : st.b === 8 ? 'Each container holds eight, as the last step left it.' : st.left === 2 ? 'Each container holds four here. Twos would make six levels to name.'
        : st.left === 64 ? 'Each container holds four here. One whole register has nothing to open.' : 'Each container holds four.';
      sr.textContent = row ? `Symbol ${(st.sel >> 2) + 1} of 16 is selected.` : `Symbol ${st.sel + 1} of 64 is selected.`;
      root.dataset.step = s; root.dataset.geo = st.geo;
      svg.classList.toggle('egc-pick', s === 6);
    }
    const fillS = U(0, v => { fill.style.transform = `scaleY(${v.toFixed(4)})`; });
    function refresh(stagger) { layout(false, stagger); readout(); }
    function select(i) { hush(); st.sel = i; refresh(); }
    function frameClick(f) { if (st.step === 6 && f.on && f.s < 64) select(f.a + (st.sel % f.s)); }

    function step(i, fromInside) {
      i = clamp(i | 0, 0, STEPS.length - 1);
      hush();
      const was = st.geo;
      Object.assign(st, { step: i, cuts: false, pathOnly: false });
      if (i <= 2) Object.assign(st, { geo: 'row', n: [16, 4, 1][i], selector: i > 0 });
      else if (i === 3) { Object.assign(st, { geo: 'sq', depth: was === 'row' ? 2 : 3 }); if (st.depth === 2) later(() => { st.depth = 3; refresh(); }, 1500); }
      else if (i === 4) Object.assign(st, { geo: 'sq', depth: 3, cuts: true });
      else if (i === 5) { Object.assign(st, { geo: 'sq', k0: 0, b: cheapest(0) }); slider.value = 0; }
      else Object.assign(st, { geo: 'sq', left: st.b, b: st.b === 8 ? 8 : 4, pathOnly: true });      // the width the reader left in the last step, if it nests
      refresh(was !== st.geo ? 5 : 0);
      if (fromInside) { if (opts.onStep) opts.onStep(i); host.dispatchEvent(new CustomEvent('eg-step', { detail: { step: i }, bubbles: true })); }
    }

    /* ---------- one loop: springs to attributes, written only when they change ---------- */
    const set = (o, key, str, f) => { if (o[key] !== str) { o[key] = str; f(); } };
    function frame(now) {
      raf = 0; if (dead) return;
      const dt = Math.min(.05, lastT ? (now - lastT) / 1000 : .016); lastT = now; clockMs += dt * 1000;
      root.classList.toggle('egc-still', !!M.off);
      for (const u of ui) { tick(u.s, dt); if (u.s.v !== u.last) { u.last = u.s.v; u.f(u.s.v); } }
      tick(numO, dt); tick(rankO, dt);
      let moved = false;
      for (const f of frames) {
        tick(f.x, dt); tick(f.y, dt); tick(f.w, dt); tick(f.h, dt); tick(f.o, dt); tick(f.hot, dt);
        const o = f.o.v, w = Math.max(.1, f.w.v), h = Math.max(.1, f.h.v), hot = clamp(f.hot.v + (hover === f.s && f.on && holds(f, st.sel) ? .6 : 0));
        set(f, 'last', `${f.x.v.toFixed(1)}|${f.y.v.toFixed(1)}|${w.toFixed(1)}|${h.toFixed(1)}|${o.toFixed(2)}|${hot.toFixed(2)}`, () => {
          moved = true;
          const e = f.el;
          if (o < .015) { e.style.display = 'none'; return; }
          e.style.display = '';
          e.setAttribute('x', f.x.v.toFixed(1)); e.setAttribute('y', f.y.v.toFixed(1)); e.setAttribute('width', w.toFixed(1)); e.setAttribute('height', h.toFixed(1));
          e.setAttribute('rx', Math.min(7, Math.min(w, h) * .16).toFixed(1));
          e.style.stroke = mix(LINE, LIT, hot); e.style.strokeOpacity = (o * (.46 + .54 * hot)).toFixed(3); e.style.strokeWidth = (1.1 + 1.1 * hot).toFixed(2);
          e.style.fillOpacity = (o * (.035 + .05 * hot)).toFixed(3);
          e.style.pointerEvents = st.step === 6 && f.on && f.s < 64 ? 'all' : 'none';
        });
      }
      for (const h of handles) {
        tick(h.x, dt); tick(h.y, dt); tick(h.o, dt); tick(h.hot, dt);
        const f = h.f, o = h.o.v;
        set(h, 'last', `${h.x.v.toFixed(1)}|${h.y.v.toFixed(1)}|${o.toFixed(2)}|${h.hot.v.toFixed(2)}|${piv.x.v.toFixed(1)}|${piv.y.v.toFixed(1)}|${piv.o.v.toFixed(2)}`, () => {
          if (o < .015) { h.el.style.display = h.link.style.display = 'none'; return; }
          h.el.style.display = h.link.style.display = '';
          h.el.setAttribute('cx', h.x.v.toFixed(1)); h.el.setAttribute('cy', h.y.v.toFixed(1));
          h.el.style.opacity = o.toFixed(3); h.el.style.fill = mix(LINE, GOLD, h.hot.v); h.el.setAttribute('r', (4.4 + 1.6 * h.hot.v).toFixed(2));
          const l = h.link;                               // every link is drawn from where both of its ends are now, so it cannot come loose
          l.setAttribute('x1', piv.x.v.toFixed(1)); l.setAttribute('y1', (piv.y.v + 6).toFixed(1)); l.setAttribute('x2', h.x.v.toFixed(1)); l.setAttribute('y2', (h.y.v - 6).toFixed(1));
          l.style.stroke = mix(LINE, LIT, h.hot.v); l.style.strokeOpacity = (o * piv.o.v * (.34 + .66 * h.hot.v)).toFixed(3); l.style.strokeWidth = (1.1 + .9 * h.hot.v).toFixed(2);
        });
      }
      tick(piv.x, dt); tick(piv.y, dt); tick(piv.o, dt);
      set(piv, 'last', `${piv.x.v.toFixed(1)}|${piv.y.v.toFixed(1)}|${piv.o.v.toFixed(2)}`, () => {
        pivot.setAttribute('cx', piv.x.v.toFixed(1)); pivot.setAttribute('cy', piv.y.v.toFixed(1)); pivot.style.opacity = piv.o.v.toFixed(3); pivot.style.display = piv.o.v < .015 ? 'none' : '';
      });
      tick(sbox.x, dt); tick(sbox.y, dt); tick(sbox.w, dt); tick(sbox.o, dt);
      set(sbox, 'last', `${sbox.x.v.toFixed(1)}|${sbox.y.v.toFixed(1)}|${sbox.w.v.toFixed(1)}|${sbox.o.v.toFixed(2)}`, () => {
        selBox.setAttribute('x', sbox.x.v.toFixed(1)); selBox.setAttribute('y', sbox.y.v.toFixed(1)); selBox.setAttribute('width', Math.max(1, sbox.w.v).toFixed(1)); selBox.setAttribute('height', 26);
        selBox.style.opacity = sbox.o.v.toFixed(3);
      });
      let leafMoved = false;
      for (const L of leaves) {
        tick(L.x, dt); tick(L.y, dt); tick(L.r, dt); tick(L.sel, dt);
        set(L, 'last', `${L.x.v.toFixed(1)}|${L.y.v.toFixed(1)}|${L.r.v.toFixed(2)}|${L.sel.v.toFixed(2)}`, () => {
          leafMoved = true;
          L.el.setAttribute('cx', L.x.v.toFixed(1)); L.el.setAttribute('cy', L.y.v.toFixed(1)); L.el.setAttribute('r', Math.max(.5, L.r.v * (1 + .16 * L.sel.v)).toFixed(2));
          L.el.style.fill = mix(INK, GOLD, L.sel.v);
        });
      }
      for (const r of rays) {
        tick(r.x, dt); tick(r.y, dt); tick(r.o, dt); tick(r.hot, dt);
        const L = leaves[r.s * 4], top = L.y.v - Math.max(.5, L.r.v * (1 + .16 * L.sel.v)) - 3;   // the ray ends on the dot as it is drawn
        set(r, 'last', `${r.x.v.toFixed(1)}|${r.y.v.toFixed(1)}|${r.o.v.toFixed(2)}|${r.hot.v.toFixed(2)}|${L.x.v.toFixed(1)}|${top.toFixed(1)}`, () => {
          const e = r.el;
          if (r.o.v < .015) { e.style.display = 'none'; return; }
          e.style.display = '';
          e.setAttribute('x1', r.x.v.toFixed(1)); e.setAttribute('y1', r.y.v.toFixed(1)); e.setAttribute('x2', L.x.v.toFixed(1)); e.setAttribute('y2', top.toFixed(1));
          e.style.stroke = mix(LINE, LIT, r.hot.v); e.style.strokeOpacity = (r.o.v * (.16 + .84 * r.hot.v)).toFixed(3); e.style.strokeWidth = (1 + 1.1 * r.hot.v).toFixed(2);
        });
      }
      tick(labO, dt);
      if (labO.v > .015) {                               // the names ride on the boxes of the path, wherever those are now
        const lv = levelsOf(), fs = clamp(Math.min(W, Ht) * .023, 10, 17);
        labs.forEach((e, k) => {
          const d = lv[k]; if (!d || d[0] === 1) { e.style.display = 'none'; return; }    // the record is the gold dot; its name is in the address beside the figure
          e.style.display = ''; e.style.opacity = labO.v.toFixed(3); e.style.fontSize = fs.toFixed(1) + 'px';
          const idx = k ? Math.floor((st.sel % lv[k - 1][0]) / d[0]) + 1 : 0, text = k ? `${d[1]} ${idx}` : 'Paper';
          if (e.textContent !== text) e.textContent = text;
          if (d[0] > 1) { const f = F[d[0] + ':' + Math.floor(st.sel / d[0]) * d[0]]; e.setAttribute('text-anchor', 'start'); e.setAttribute('x', (f.x.v + 7).toFixed(1)); e.setAttribute('y', (f.y.v + fs + 1).toFixed(1)); }
          else { const L = leaves[st.sel]; e.setAttribute('text-anchor', 'middle'); e.setAttribute('x', L.x.v.toFixed(1)); e.setAttribute('y', (L.y.v + L.r.v + fs + 6).toFixed(1)); }
        });
      } else labs.forEach(e => { e.style.display = 'none'; });
      const Ls = leaves[st.sel];
      ring.setAttribute('cx', Ls.x.v.toFixed(1)); ring.setAttribute('cy', Ls.y.v.toFixed(1)); ring.setAttribute('r', (Ls.r.v + 4.6 + (M.off ? 0 : .9 * Math.sin(clockMs * .0029))).toFixed(2));
      for (const n of nums) {
        const L = leaves[n.s * 4];
        set(n, 'last', `${L.x.v.toFixed(1)}|${(L.y.v + L.r.v).toFixed(1)}|${numO.v.toFixed(2)}`, () => {
          n.el.setAttribute('x', L.x.v.toFixed(1)); n.el.setAttribute('y', (L.y.v + L.r.v + 15).toFixed(1));
          n.el.style.opacity = (numO.v * ((st.sel >> 2) === n.s ? 1 : .62)).toFixed(3); n.el.style.display = numO.v < .02 ? 'none' : '';
        });
      }
      const line = curve(leaves.map(L => [L.x.v, L.y.v]));
      if (leafMoved) rankPath.setAttribute('d', line.d);
      rankPath.style.strokeOpacity = rankO.v.toFixed(3); tracerG.style.opacity = clamp(rankO.v / .28).toFixed(3);
      tick(flash, dt);
      for (const c of cuts) {
        tick(c.w, dt); tick(c.o, dt);
        if (c.o.v < .015) { set(c, 'last', 'off', () => { c.el.style.display = 'none'; }); continue; }
        let d = '';
        if (moved || c.last === 'off' || !c.d) {
          for (const f of frames) if (f.s === c.s) { const x = f.x.v, y = f.y.v, w = f.w.v, h = f.h.v, p = Math.min(w, h) * .07; d += `M${(x + p).toFixed(1)} ${(y + h / 2).toFixed(1)}H${(x + w - p).toFixed(1)}M${(x + w / 2).toFixed(1)} ${(y + p).toFixed(1)}V${(y + h - p).toFixed(1)}`; }
          c.d = d;
        }
        set(c, 'last', `${c.d.length}|${c.d.slice(0, 40)}|${c.w.v.toFixed(2)}|${c.o.v.toFixed(2)}|${flash.v.toFixed(2)}`, () => {
          c.el.style.display = ''; c.el.setAttribute('d', c.d); c.el.style.strokeWidth = Math.max(.3, c.w.v).toFixed(2); c.el.style.opacity = (c.o.v * .9).toFixed(3); c.el.style.stroke = mix([228, 191, 125], [255, 244, 214], flash.v);
        });
      }
      // a light travels the ranks in order, as on the card: the same line whether it lies flat or folded
      if (line.length > 4) {
        if (!M.off) beat += dt * 1000 * Math.max(.00005, Math.min(.00017, .16 / line.length));
        const tailT = beat - Math.min(.14, 90 / line.length);
        const w = wake(line, { t: beat, f: reflected(beat) }, { t: tailT, f: reflected(tailT) });
        trail.setAttribute('d', w.d); tip.setAttribute('cx', w.tip[0].toFixed(1)); tip.setAttribute('cy', w.tip[1].toFixed(1));
      }
      if (seen && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const run = () => { if (!raf && !dead && seen && !document.hidden) { lastT = 0; raf = requestAnimationFrame(frame); } };

    const measure = first => {
      const w = svg.clientWidth, h = svg.clientHeight;
      if (!w || !h || (w === W && h === Ht)) return;
      W = w; Ht = h; svg.setAttribute('viewBox', `0 0 ${W} ${Ht}`);
      root.classList.toggle('egc-narrow', root.clientWidth < 560);
      layout(!!first);                                  // the first size is simply taken; a later one is glided to, so nothing in flight is cut short
    };
    const ro = new ResizeObserver(() => measure()); ro.observe(svg);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); }) : null;
    if (io) io.observe(root);
    const vis = () => run(); document.addEventListener('visibilitychange', vis);
    root.classList.toggle('egc-narrow', root.clientWidth < 560);
    measure(true); readout();
    ui.forEach(u => { u.s.snap(u.s.g); });               // the first paint is the state itself, with nothing arriving
    run();
    return {
      step: i => step(i, false),
      destroy() { dead = true; hush(); cancelAnimationFrame(raf); ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', vis); root.remove(); }
    };
  }

  /* ---------- further sections, for the node's own page ---------- */
  function threeQuestions(host) {
    const root = H(host, 'div', 'egn-cost egc-three');
    const R = 16, panels = H(root, 'div', 'egc-panels');
    const mk = (title, text) => { const p = H(panels, 'figure', 'egc-q'); const s = S(p, 'svg', { viewBox: '0 0 240 150', 'aria-hidden': 'true' }); H(p, 'figcaption', '', `<b>${title}</b> ${text}`); return s; };
    const sA = mk('Capacity.', 'How many distinctions does a budget support? When registers are combined the way digits are, the budget grows as the logarithm of the range.');
    const sB = mk('Occupation.', 'How often is each symbol used? When only the mean cost is known, the least biased answer is a power law in rank, and <i>λ</i> = 1 is Zipf’s law.');
    const sC = mk('Erasure.', 'How much uncertainty does a reset remove? A machine that guesses, tests and discards its failures must give up heat for the uncertainty it erases, and the mean logarithm of rank sets a floor on that heat.');
    // capacity: the budget against the range, with a light running the curve
    S(sA, 'path', { class: 'egc-axis', d: 'M26 12V126H228' });
    const cx = n => 26 + 200 * (n - 1) / 255, cy = n => 126 - 104 * Math.log(n) / Math.log(256);
    const cap = curve(Array.from({ length: 80 }, (_, i) => { const n = 1 + 255 * Math.pow(i / 79, 2.2); return [cx(n), cy(n)]; }));
    S(sA, 'path', { class: 'egc-plot', d: cap.d });
    [4, 16, 64, 256].forEach(n => { S(sA, 'circle', { class: 'egc-dot', cx: cx(n), cy: cy(n), r: 3 }); const t = S(sA, 'text', { class: 'egc-mt', x: cx(n) + (n === 256 ? -6 : 6), y: cy(n) + 13, 'text-anchor': n === 256 ? 'end' : 'start' }); t.textContent = n; });
    const tA = S(sA, 'text', { class: 'egc-mt', x: 30, y: 20 }); tA.textContent = 'budget';
    const tA2 = S(sA, 'text', { class: 'egc-mt', x: 228, y: 142, 'text-anchor': 'end' }); tA2.textContent = 'range';
    const capTip = S(sA, 'circle', { class: 'egc-tipdot', r: 3.4 });
    // occupation: sixteen ranks
    S(sB, 'path', { class: 'egc-axis', d: 'M20 12V126H228' });
    const bars = Array.from({ length: R }, (_, r) => ({ s: new Spring(0), el: S(sB, 'rect', { class: 'egc-zbar', x: 24 + r * 12.6, width: 9, rx: 2 }) }));
    const tB = S(sB, 'text', { class: 'egc-mt', x: 228, y: 142, 'text-anchor': 'end' }); tB.textContent = 'rank';
    // erasure: guess, test, erase, and the two bounds
    const pts = [[52, 44], [124, 44], [88, 104]], names = ['guess', 'test', 'erase'];
    S(sC, 'path', { class: 'egc-loop', d: `M${pts[0]}L${pts[1]}L${pts[2]}Z` });
    const runner = S(sC, 'circle', { class: 'egc-tipdot', r: 3.4 });
    pts.forEach((p, i) => { S(sC, 'circle', { class: 'egc-stage', cx: p[0], cy: p[1], r: 17 }); const t = S(sC, 'text', { class: 'egc-mt egc-in', x: p[0], y: p[1] + 3.5, 'text-anchor': 'middle' }); t.textContent = names[i]; });
    const loopC = curve([...pts, pts[0]]);
    const hB = S(sC, 'rect', { class: 'egc-zbar', x: 156, width: 20, rx: 3 }), lB = S(sC, 'rect', { class: 'egc-zbar egc-pale', x: 200, width: 20, rx: 3 });
    S(sC, 'path', { class: 'egc-axis', d: 'M146 122H232' });
    const th = S(sC, 'text', { class: 'egc-mt', x: 166, y: 134, 'text-anchor': 'middle' }), tl = S(sC, 'text', { class: 'egc-mt', x: 208, y: 145, 'text-anchor': 'middle' });
    th.textContent = 'heat floor'; tl.textContent = 'mean log rank';
    const hS = new Spring(0), lS = new Spring(0);
    const lab = H(root, 'label', 'egc-slide', '<span>The exponent <i>λ</i> of the rank law: <b data-l>1</b></span><input type="range" min="0.4" max="2.2" step="0.01" value="1" aria-label="The exponent of the rank law">');
    const inp = lab.querySelector('input'), out = lab.querySelector('[data-l]');
    const apply = () => {
      const lam = +inp.value; let Z = 0; const p = [];
      for (let r = 1; r <= R; r++) { p.push(Math.pow(r, -lam)); Z += p[r - 1]; }
      let Hn = 0, ell = 0;
      p.forEach((v, i) => { const pr = v / Z; bars[i].s.to(pr); Hn -= pr * Math.log(pr); ell += pr * Math.log(i + 1); });
      hS.to(Hn); lS.to(ell); out.textContent = lam.toFixed(2);
    };
    inp.addEventListener('input', apply); apply();
    let raf = 0, last = 0, t = 0, dead = false;
    (function loop(now) {
      if (dead) return;
      const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; if (!M.off) t += dt;
      bars.forEach(b => { b.s.step(dt); const h = 110 * b.s.v / .5; b.el.setAttribute('y', (126 - Math.min(112, h)).toFixed(1)); b.el.setAttribute('height', Math.max(.5, Math.min(112, h)).toFixed(1)); });
      hS.step(dt); lS.step(dt);
      const top = Math.log(R);
      [[hB, hS.v], [lB, lS.v]].forEach(([e, v]) => { const h = 104 * v / top; e.setAttribute('y', (122 - h).toFixed(1)); e.setAttribute('height', Math.max(.5, h).toFixed(1)); });
      const a = atDistance(cap, reflected(t * .22) * cap.length).point; capTip.setAttribute('cx', a[0].toFixed(1)); capTip.setAttribute('cy', a[1].toFixed(1));
      const b = atDistance(loopC, ((t * .3) % 1) * loopC.length).point; runner.setAttribute('cx', b[0].toFixed(1)); runner.setAttribute('cy', b[1].toFixed(1));
      raf = requestAnimationFrame(loop);
    })(0);
    return { destroy() { dead = true; cancelAnimationFrame(raf); root.remove(); } };
  }

  function thePaper(host) {
    const root = H(host, 'div', 'egn-cost egc-paper', `
      <figure class="egc-fig1"><a href="/assets/docs/the-cost-of-complexity.pdf#page=3" target="_blank" rel="noopener"><img src="/eigenengine/cost-of-complexity/reading/cost/figure-1.webp" alt="Figure 1 of the paper. Sixteen symbols are followed from their microscopic realisations to four registers of four, above three panels on capacity, occupation and erasure." loading="lazy"></a><figcaption>Figure 1 of the paper, which follows sixteen symbols from their microscopic realisations to an organised register.</figcaption></figure>
      <div class="egc-read">
        <p class="egc-lab">Pre-pre-print · an early example of what EigenEngine makes</p>
        <p class="egc-ttl"><i>The Cost of Complexity: A Physical Theory of Representation</i><br><span>Gerard McCaul · 21 pages</span></p>
        <ul>
          <li><a href="/assets/docs/the-cost-of-complexity.pdf" target="_blank" rel="noopener">Read the paper <span>PDF ↗</span></a></li>
          <li><a href="/eigenengine/cost-of-complexity/">Work through its results one at a time <span>→</span></a></li>
          <li><a href="/eigenengine/cost-of-complexity/#agent-reading">Have a language model explain it <span>→</span></a></li>
          <li><a href="/eigenengine/kalmar-constant/">What if the layout itself has to be stored? The Kalmár companion <span>→</span></a></li>
        </ul>
        <p class="egc-ack">Formal derivations, figures and manuscript drafting were assisted by EigenEngine, using ChatGPT and Claude. The author remains responsible for the ideas, interpretation and correctness of the results.</p>
      </div>`);
    return { destroy() { root.remove(); } };
  }

  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.cost = {
    title: 'The Cost of Complexity',
    line: 'What does a representation have to carry, and what does it cost to carry it?',
    text: 'Every representation must be held in matter, and so must the apparatus that organises it. A <i>register</i> holds distinctions at one level and is itself selected by a distinction at the next. The paper prices each level, and shows when nesting makes the total grow as the logarithm of the number of items. EigenEngine nests its conceptrics for this reason, and the same account sets how far each should split.',
    kicker: 'Pre-pre-print · an early example',
    art,
    exhibit: { steps: STEPS.map(({ label, caption, source }) => ({ label, caption, source: source && { text: source.text, href: PDF + '#page=' + source.page, region: source.region } })), mount },
    sections: [
      { title: 'The paper’s three questions', mount: threeQuestions },
      { title: 'The paper', mount: thePaper }
    ]
  };
})();
