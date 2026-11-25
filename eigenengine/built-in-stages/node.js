/* Node "build": What does it build?
   A research object built in stages on one worked example, the law of word frequencies from The Cost of Complexity
   (Theorem 5): an idea, its claims, the premises and the step that give one claim, the sources they are tied to,
   a recorded run and the figure drawn from it. The literature is drawn as bedrock. A record stands only when every
   link beneath it reaches that bedrock, so taking one out shows at once what was standing on it.
   Contract: dispatch/CONTRACT.md. Everything here is scoped to the root this file creates (.egb.egn-build). */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const EM = window.EigenMotion || (() => {                       // the shared spring; a copy only if the page forgot to load it
    const M = window.EG_MOTION = window.EG_MOTION || { off: false, rate: 1 };
    class Spring {
      constructor(v = 0, k = 170, c = 26.5) { this.v = v; this.t = v; this.g = v; this.s = 0; this.k = k; this.c = c; }
      to(g) { this.g = g; return this; }
      snap(g) { this.v = this.t = this.g = g; this.s = 0; return this; }
      step(dt) {
        if (M.off) { this.v = this.t = this.g; this.s = 0; return false; }
        this.t += (this.g - this.t) * Math.min(1, dt / .075);
        this.s += (this.k * (this.t - this.v) - this.c * this.s) * dt; this.v += this.s * dt;
        return Math.abs(this.g - this.v) > 2e-4 || Math.abs(this.s) > 2e-3;
      }
    }
    return { M, Spring, smooth: x => x * x * (3 - 2 * x), clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)) };
  })();
  const { Spring, smooth, clamp, M } = EM;
  const mix = (a, b, t) => a + (b - a) * t;
  const fract = x => x - Math.floor(x);
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const ht = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  /* ---- the object -------------------------------------------------------------------------------------------
     x, y: where a record sits, in hundredths of the exhibit. from: the record it grows out of.
     depth: how many links lie between it and what stands by itself (a premise, a source that was read). */
  const REC = {
    I:  { kind: 'idea',    stage: 0, label: 'telling things apart has a cost', x: 38,   y: 8,  depth: 4 },
    C3: { kind: 'claim',   stage: 1, label: 'forgetting costs energy',         x: 13,   y: 24, depth: 1, from: 'I' },
    C1: { kind: 'claim',   stage: 1, label: 'cost grows as log of rank',       x: 38,   y: 24, depth: 1, from: 'I', brief: 'cost grows as log rank' },
    C2: { kind: 'claim',   stage: 1, label: 'word frequency law',              x: 63,   y: 24, depth: 3, from: 'I' },
    O:  { kind: 'step',    stage: 2, label: 'least-biased guess',              x: 63,   y: 47, depth: 2, from: 'C2' },
    P2: { kind: 'premise', stage: 2, label: 'every rank counted alike',        x: 51,   y: 66, depth: 0, from: 'O' },
    P3: { kind: 'premise', stage: 2, label: 'known average cost',              x: 77.5, y: 66, depth: 0, from: 'O' },
    SL: { kind: 'source',  stage: 3, label: 'Landauer 1961',                   x: 13,   y: 85, depth: 0 },
    SM: { kind: 'source',  stage: 3, label: 'Mandelbrot 1953',                 x: 38,   y: 85, depth: 0 },
    SJ: { kind: 'source',  stage: 3, label: 'Jaynes 1957',                     x: 63.5, y: 85, depth: 0 },
    Rn: { kind: 'run',     stage: 4, label: 'recorded run',                    x: 87,   y: 32, depth: 4, from: 'C2' },
    F:  { kind: 'figure',  stage: 5, label: 'Figure 6',                        x: 87,   y: 9,  depth: 5, from: 'Rn' },
  };
  const ORDER = Object.keys(REC);                                  // parents come before what grows out of them
  const KIND = { idea: 'Idea', claim: 'Claim', step: 'Step', premise: 'Premise', source: 'Source', run: 'Run', figure: 'Figure' };
  /* [the record that stands, what it stands on, the name of the link, bow of the drawn line].
     A link's name is read from the claim outwards (the claim is computed by the run, shown by the figure); what stands on
     what runs the other way for those two: a run stands on the claim it computes, a figure on its run and on the claim it shows. */
  const LINKS = [
    ['I', 'C3', 'requires', -.10], ['I', 'C1', 'requires', 0], ['I', 'C2', 'requires', .10],
    ['C2', 'O', 'requires', 0], ['O', 'C1', 'requires', -.12], ['O', 'P2', 'requires', .08], ['O', 'P3', 'requires', -.08],
    ['C3', 'SL', 'supported by', 0], ['C1', 'SM', 'supported by', 0], ['O', 'SJ', 'supported by', 0, .8],
    ['Rn', 'C2', 'computed by', -.12], ['F', 'Rn', 'computed by', 0], ['F', 'C2', 'shown by', .1],
  ];
  const STAGES = ['An idea', 'Claims', 'Premises and steps', 'Sources', 'Calculations', 'Figures', 'A paper'];
  const READ = ['I', 'C1', 'SM', 'P2', 'P3', 'O', 'SJ', 'C2', 'Rn', 'F', 'C3', 'SL'];   // the order a reader of the paper meets the records in
  const COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const GROUNDS = {}, STANDS = {};
  ORDER.forEach(id => { GROUNDS[id] = []; STANDS[id] = []; });
  LINKS.forEach(([a, b]) => { GROUNDS[a].push(b); STANDS[b].push(a); });

  /* which records stand, given the stage reached and the records taken out */
  function standing(stage, out) {
    const here = id => REC[id].stage <= stage, firm = {};
    const visit = id => {
      if (id in firm) return firm[id];
      firm[id] = false;
      if (!here(id) || out.has(id)) return false;
      const k = REC[id].kind;
      if (k === 'premise' || k === 'source') return firm[id] = true;
      const g = GROUNDS[id].filter(here);
      return firm[id] = g.length > 0 && g.every(visit);
    };
    ORDER.forEach(visit);
    return firm;
  }

  /* ---- drawings inside the records ---------------------------------------------------------------------------- */
  const BARS = [1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8];   // the law itself: p(r) proportional to 1/r
  function glyph(kind) {
    if (kind === 'idea') return '<svg class="egb-g" viewBox="0 0 24 24" aria-hidden="true"><circle class="egb-halo" cx="12" cy="12" r="11.6"/><circle cx="12" cy="12" r="7.6" stroke-width="1.5"/><circle class="f" cx="12" cy="12" r="3.2"/></svg>';
    if (kind === 'claim') return '<svg class="egb-g" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2" stroke-width="1.2" opacity=".5"/><circle class="f" cx="12" cy="12" r="5.2"/></svg>';
    if (kind === 'step') return '<svg class="egb-g" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4 21.6 12 12 21.6 2.4 12Z" stroke-width="1.6" stroke-linejoin="round"/><circle class="f" cx="12" cy="12" r="2.1"/></svg>';
    if (kind === 'premise') return '<svg class="egb-g" viewBox="0 0 24 24" aria-hidden="true"><rect x="4.4" y="4.4" width="15.2" height="15.2" rx="2.4" stroke-width="1.6"/></svg>';
    if (kind === 'source') return '<svg class="egb-g" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.6 2.6h8.6l4.6 4.6v14.2H5.6Z" stroke-width="1.5" stroke-linejoin="round"/><path d="M14 2.8v4.6h4.6" stroke-width="1.2"/><path d="M8.4 11h7.4M8.4 17.2h5.4" stroke-width="1.2" opacity=".5"/><path class="egb-read" d="M8.4 14.1h7.4" stroke-width="2.2" stroke-linecap="round"/></svg>';
    if (kind === 'run') return '<svg class="egb-viz" viewBox="0 0 64 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M4 27.5H60" stroke-width="1" opacity=".55"/>' +
      BARS.map((_, i) => `<rect class="egb-bar f" x="${6.5 + i * 6.7}" y="27" width="4.6" height="0" rx="1"/>`).join('') + '</svg>';
    return '<svg class="egb-viz" viewBox="0 0 64 30" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="M7 2.5V26.5H61" stroke-width="1" opacity=".55"/><path class="egb-plot" d="M11 6 57 23.4" pathLength="1" stroke-width="1.7" stroke-linecap="round"/>' +
      [0, .2, .38, .54, .68, .8, .9, 1].map(f => `<circle class="egb-dot f" cx="${(11 + 46 * f).toFixed(1)}" cy="${(6 + 17.4 * f).toFixed(1)}" r="0"/>`).join('') + '</svg>';
  }

  /* What a record says, drawn small. Read in order they are the argument: every word alike (no word favoured),
     a cost that climbs with rank and whose average is known, and the guess that turns the first into the law. */
  const FLAT = [9, 9, 9, 9, 9, 9], LAW = [19, 9.5, 6.3, 4.8, 3.8, 3.2], COST = [4.5, 10, 13.2, 15.5, 17.2, 18.6];
  const bars = (h, cls = '') => h.map((v, i) => `<rect class="f ${cls}" x="${(3.4 + i * 4.5).toFixed(1)}" y="${(21.5 - v).toFixed(1)}" width="3" height="${v}" rx=".8"/>`).join('');
  function thumb(id) {
    const open = '<svg class="egb-th" viewBox="0 0 32 24" aria-hidden="true">', base = '<path d="M2 22.4H30" stroke-width="1" opacity=".45"/>';
    if (id === 'C1') return open + base + bars(COST) + '</svg>';
    if (id === 'C2') return open + base + bars(LAW) + '</svg>';
    if (id === 'C3') return open + '<rect x="9.5" y="11.5" width="13" height="10" rx="2" stroke-width="1.5"/><path class="egb-heat" d="M12 8.2c-1.6-1.6 1.6-2.6 0-4.4M16 8.2c-1.6-1.6 1.6-2.6 0-4.4M20 8.2c-1.6-1.6 1.6-2.6 0-4.4" stroke-width="1.3" stroke-linecap="round"/></svg>';
    if (id === 'O') return open + base + bars(FLAT, 'egb-guess') + '</svg>';
    if (id === 'P2') return open + base + bars(FLAT) + '</svg>';
    if (id === 'P3') return open + base + bars(COST) + '<path d="M1.5 9.2H30.5" stroke="var(--eg-gold)" stroke-width="1.3" stroke-dasharray="2.4 2.2"/></svg>';
    return '';
  }

  /* point where the line from the middle of a box towards (tx, ty) leaves the box */
  function edge(cx, cy, hw, hh, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    if (!dx && !dy) return [cx, cy];
    const k = Math.min(hw / (Math.abs(dx) || 1e-9), hh / (Math.abs(dy) || 1e-9), 1);
    return [cx + dx * k, cy + dy * k];
  }
  const quad = (p0, c, p1, s) => { const u = 1 - s; return [u * u * p0[0] + 2 * u * s * c[0] + s * s * p1[0], u * u * p0[1] + 2 * u * s * c[1] + s * s * p1[1]]; };

  let mounts = 0;
  /* ================================================================================================================
     The exhibit
     ================================================================================================================ */
  function mount(host, opts = {}) {
    const root = ht('div', 'egb egn-build', host), rockId = 'egb-rock-' + (++mounts);
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'A research object built in stages. Each record is a button that takes it out or puts it back.');
    root.innerHTML =
      `<svg class="egb-ground" aria-hidden="true"><defs><linearGradient id="${rockId}" x1="0" y1="0" x2="0" y2="1">` + '<stop offset="0" stop-color="var(--eg-blue)" stop-opacity=".16"/><stop offset="1" stop-color="var(--eg-blue)" stop-opacity="0"/></linearGradient></defs><g class="egb-plan"></g><path class="egb-rock"/><g class="egb-strata"></g><g class="egb-roots"></g></svg>' +
      '<svg class="egb-wires" aria-hidden="true"><g class="egb-links"></g><g class="egb-pulses"></g></svg>' +
      '<div class="egb-recs"></div>' +
      '<div class="egb-page" aria-hidden="true">' +
        '<h4 data-r="I">Telling things apart has a cost</h4>' +
        '<p><span data-r="C1">The cost of naming a word grows as the logarithm of its rank</span><span class="egb-cite" data-r="SM"> [1]</span><span data-w="C1">.</span></p>' +
        '<p><span data-w="P2">Suppose </span><span data-r="P2">every rank is counted alike</span><span data-w="P3"> and </span><span data-r="P3">only the average cost is known</span><span data-w="P3">. </span><span data-r="O">The least-biased guess</span><span class="egb-cite" data-r="SJ"> [2]</span><span data-w="C2"> at how often each word is used is then </span><span data-r="C2">the word frequency law</span><span data-w="C2">.</span></p>' +
        '<figure data-r="F"><svg viewBox="0 0 132 50" aria-hidden="true"><path d="M16 3V43H128" fill="none" stroke-width="1"/><path class="egb-pline" d="M22 9 122 39" pathLength="1" fill="none" stroke-width="1.6" stroke-linecap="round"/><g data-r="Rn">' +
          [0, .2, .38, .54, .68, .8, .9, 1].map(f => `<circle cx="${(22 + 100 * f).toFixed(1)}" cy="${(9 + 30 * f).toFixed(1)}" r="2.2"/>`).join('') + '</g></svg><figcaption>Figure 6</figcaption></figure>' +
        '<p><span data-r="C3">Forgetting costs energy</span><span class="egb-cite" data-r="SL"> [3]</span><span data-w="C3">.</span></p>' +
        '<p class="egb-refs"><span data-r="SM">[1] Mandelbrot 1953</span> <span data-r="SJ">[2] Jaynes 1957</span> <span data-r="SL">[3] Landauer 1961</span></p>' +
      '</div>' +
      '<svg class="egb-over" aria-hidden="true"><g class="egb-threads"></g></svg>' +
      '<div class="egb-names" aria-hidden="true"></div><span class="egb-who" aria-hidden="true"></span>' +
      '<p class="egb-stage" aria-hidden="true"><span></span><b></b></p>' +
      '<p class="egb-lit" aria-hidden="true">the literature</p>' +
      '<p class="egb-note"><span role="status" aria-live="polite"></span><button type="button" class="egb-back" hidden></button></p>';
    const q = s => root.querySelector(s);
    const gLinks = q('.egb-links'), gPulses = q('.egb-pulses'), gThreads = q('.egb-threads'), gStrata = q('.egb-strata'), gRoots = q('.egb-roots');
    const rock = q('.egb-rock'), page = q('.egb-page'), names = q('.egb-names'), recsEl = q('.egb-recs'), who = q('.egb-who'), gPlan = q('.egb-plan');
    rock.style.fill = `url(#${rockId})`;
    const stageNo = q('.egb-stage span'), stageName = q('.egb-stage b'), noteText = q('.egb-note span'), back = q('.egb-back');

    /* state */
    let W = 0, H = 0, U = 1, mode = 'compact', tok = 40, alive = true, raf = 0, last = 0, T = 0, visible = true;
    let cur = -1, hotId = null, pressed = false, autoTimer = 0, autoOn = false, halo = 0;
    const out = new Set();
    const paper = new Spring(0, 60, 15.5), sheet = new Spring(0, 60, 15.5);
    let touch = false, touchTimer = 0, cleared = true;
    let paperAt = null;                                              // {v, at}: the paper view waits for the object to finish arriving
    const flights = [];                                              // sentences being written onto the sheet
    let spots = null;                                                // where each record's words sit on the sheet

    /* records */
    const recs = {};
    ORDER.forEach((id, i) => {
      const d = REC[id], b = ht('button', 'egb-rec egb-k-' + d.kind, recsEl);
      b.type = 'button'; b.dataset.id = id; b.tabIndex = -1;
      const viz = d.kind === 'run' || d.kind === 'figure';
      b.innerHTML = '<i class="egb-l egb-bg"></i><i class="egb-l egb-loose"></i><i class="egb-l egb-firm"></i><i class="egb-l egb-coral"></i><i class="egb-l egb-hot"></i>' +
        `<span class="egb-in${viz ? ' egb-col' : ''}${thumb(id) ? ' egb-has-th' : ''}">${glyph(d.kind)}${thumb(id)}<span class="egb-t"><small>${KIND[d.kind]}</small><b>${d.label}</b></span></span><i class="egb-n">${READ.indexOf(id) + 1}</i>`;
      const r = recs[id] = {
        id, d, el: b, i, ph: i * 1.93 + .4, want: 0, dx: 0, dy: 0, w: 0, h: 0, cw: 0, ch: 0,
        s: new Spring(0, 96, 19.6), num: new Spring(0, 150, 24.5), plan: null, firm: new Spring(0, 60, 15.5), coral: new Spring(0, 90, 19), out: new Spring(0, 150, 24.5),
        hot: new Spring(0, 220, 30), ping: new Spring(0, 26, 10.2), live: new Spring(0, 70, 17),
        at: {}, css: {}, bars: [...b.querySelectorAll('.egb-bar')], guess: [...b.querySelectorAll('.egb-guess')], dots: [...b.querySelectorAll('.egb-dot')], plot: b.querySelector('.egb-plot'),
      };
      b.addEventListener('pointerdown', e => { touch = e.pointerType === 'touch'; });
      b.addEventListener('click', e => { e.stopPropagation(); toggle(id); if (touch) { setHot(id); clearTimeout(touchTimer); touchTimer = setTimeout(() => { if (hotId === id) setHot(null); }, 2800); } });
      r.plan = sv('rect', { class: 'egb-ghost', rx: 10 }, gPlan);
      b.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') setHot(id); });
      b.addEventListener('pointerleave', () => { if (hotId === id) setHot(null); });
      b.addEventListener('focus', () => setHot(id));
      b.addEventListener('blur', () => { if (hotId === id) setHot(null); });
      return r;
    });
    page.querySelectorAll('[data-r]').forEach(n => {
      n.addEventListener('pointerenter', () => setHot(n.dataset.r));
      n.addEventListener('pointerleave', () => setHot(null));
    });

    /* links: a quiet line, a broken line for when an end is out, a gold line for the record under the pointer, a pulse */
    const links = LINKS.map(([a, b, kind, bow, at = .5], i) => {
      const cls = kind === 'supported by' ? 'sup' : kind === 'computed by' || kind === 'shown by' ? 'run' : 'req';
      const l = { a: recs[a], b: recs[b], kind, bow, cls, i, at,
        line: sv('path', { class: 'egb-link egb-' + cls }, gLinks), cut: sv('path', { class: 'egb-link egb-cut' }, gLinks), glow: sv('path', { class: 'egb-link egb-glow' }, gLinks),
        wake: sv('path', { class: 'egb-wake egb-w-' + cls }, gPulses), tip: sv('circle', { class: 'egb-tip egb-w-' + cls, r: 2.6 }, gPulses),
        name: ht('span', 'egb-name', names), plan: sv('path', { class: 'egb-ghost' }, gPlan), o: {} };
      l.name.textContent = kind;
      return l;
    });
    const roots = ['SL', 'SM', 'SJ'].map(id => ({ r: recs[id], p: sv('path', { class: 'egb-root' }, gRoots) }));
    const strata = [0, 1, 2, 3].map(i => sv('path', { class: 'egb-stratum', 'data-i': i }, gStrata));
    const threads = ORDER.map(id => ({ r: recs[id], p: sv('path', { class: 'egb-thread' }, gThreads), c: sv('circle', { class: 'egb-fly', r: 3.1 }, gThreads) }));

    /* ---- sizes -------------------------------------------------------------------------------------------- */
    function measure() {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return false;
      const first = !W; W = w; H = h;
      mode = W < 480 ? 'narrow' : W < 860 ? 'compact' : 'full';
      root.classList.toggle('egb-narrow', mode === 'narrow'); root.classList.toggle('egb-full', mode === 'full');
      const short = clamp(H / (mode === 'full' ? 640 : 460), .72, 1.25);
      U = mode === 'full' ? Math.min(1.25, W / 1100) * Math.min(1, short) : mode === 'narrow' ? 1 : Math.min(1.12, W / 620, short);
      const font = mode === 'full' ? 14 * Math.max(.88, U) : mode === 'narrow' ? 11 : 12.2 * Math.max(.92, U);
      const cw = mode === 'full' ? clamp(W * .205, 168, 226) : mode === 'narrow' ? clamp(W * .228, 72, 104) : clamp(W * .21, 100, 152);
      const ch = (mode === 'full' ? 60 : mode === 'narrow' ? 40 : 48) * Math.min(1, short + .06);
      const gs = mode === 'full' ? 30 : mode === 'narrow' ? 12 : 18;
      tok = mode === 'full' ? 48 : mode === 'narrow' ? 26 : 38;
      root.style.fontSize = font.toFixed(2) + 'px';
      root.style.setProperty('--gs', gs + 'px'); root.style.setProperty('--tok', tok + 'px');
      root.style.setProperty('--tw', (mode === 'full' ? 40 : 25) + 'px'); root.style.setProperty('--thp', ((tok - (mode === 'full' ? 40 : 25)) / 2) + 'px');
      root.style.setProperty('--pad', (mode === 'full' ? 12 : 7) + 'px'); root.style.setProperty('--tp', ((tok - gs) / 2) + 'px');
      ORDER.forEach(id => {
        const r = recs[id], k = r.d.kind, text = mode === 'narrow' && r.d.brief || r.d.label, bEl = r.el.querySelector('.egb-t b');
        if (bEl.textContent !== text) bEl.textContent = text;
        r.cw = k === 'idea' ? (mode === 'narrow' ? W * .46 : cw * (mode === 'full' ? 1.5 : 1.72)) : k === 'run' || k === 'figure' ? (mode === 'full' ? Math.min(cw, 178) : cw * .88) : cw;
        r.ch = k === 'run' || k === 'figure' ? ch * (mode === 'full' ? 1.52 : 1.36) : ch;
      });
      /* the bedrock: four strata across the foot of the exhibit */
      const top = H * .876;
      const wave = (y, amp, ph) => { let d = ''; for (let x = -10; x <= W + 10; x += 14) d += (d ? 'L' : 'M') + x + ' ' + (y + Math.sin(x * .011 + ph) * amp + Math.sin(x * .031 + ph * 2.1) * amp * .4).toFixed(1); return d; };
      strata.forEach((p, i) => p.setAttribute('d', wave(top + i * H * .033, 2.6 - i * .4, i * 1.7)));
      rock.setAttribute('d', wave(top, 2.6, 0) + `V${H}H-10Z`);
      ORDER.forEach(id => { const r = recs[id], [x, y] = slot(r, 0); r.plan.setAttribute('x', (x - r.cw / 2).toFixed(1)); r.plan.setAttribute('y', (y - r.ch / 2).toFixed(1)); r.plan.setAttribute('width', r.cw.toFixed(1)); r.plan.setAttribute('height', r.ch.toFixed(1)); });
      links.forEach(l => {
        const [ax, ay] = slot(l.a, 0), [bx, by] = slot(l.b, 0), p0 = edge(ax, ay, l.a.cw / 2 + 2, l.a.ch / 2 + 2, bx, by), p1 = edge(bx, by, l.b.cw / 2 + 2, l.b.ch / 2 + 2, ax, ay);
        const c = [(p0[0] + p1[0]) / 2 - (p1[1] - p0[1]) * l.bow, (p0[1] + p1[1]) / 2 + (p1[0] - p0[0]) * l.bow];
        l.plan.setAttribute('d', `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);
      });
      spots = null; place(first); spot('I');
      return true;
    }
    const slot = (r, pv) => {                                        // where a record sits: in the object, or small beside the sheet
      const nx = r.d.x / 100 * W, ny = r.d.y * (mode === 'narrow' ? .962 : 1) / 100 * H;
      return [mix(nx, (3.6 + r.d.x * .47) / 100 * W, pv), mix(ny, (2 + r.d.y * .985) / 100 * H, pv)];
    };

    /* ---- one frame ---------------------------------------------------------------------------------------- */
    function setVar(r, k, v, digits = 3) { const s = v.toFixed(digits); if (r.css[k] !== s) { r.css[k] = s; r.el.style.setProperty(k, s); } }
    function place(snap) {
      if (snap) ORDER.forEach(id => { const r = recs[id]; ['s', 'firm', 'coral', 'out', 'hot', 'live'].forEach(k => r[k].snap(r[k].g)); });
      draw(0);
    }
    function draw(dt) {
      const now = performance.now(), still = M.off;
      if (paperAt && (still || now >= paperAt.at)) { paper.to(paperAt.v); sheet.to(paperAt.v); if (paperAt.v) write(now); else flights.length = 0; paperAt = null; }
      paper.step(dt); sheet.step(dt);
      const pv = clamp(paper.v, 0, 1);
      if (!paper.g && !sheet.g) ORDER.forEach(id => recs[id].num.to(0));
      if (root._p !== pv) { root._p = pv; root.style.setProperty('--p', pv.toFixed(3)); }
      halo = Math.max(0, halo - dt * 1.5);

      ORDER.forEach(id => {
        const r = recs[id], d = r.d;
        for (const k in r.at) { const p = r.at[k]; if (still || now >= p.at) { r[k].to(p.v); if (k === 's' && p.v) r.ping.snap(1).to(0); delete r.at[k]; } }
        r.s.step(dt); r.firm.step(dt); r.coral.step(dt); r.out.step(dt); r.hot.step(dt); r.ping.step(dt); r.live.step(dt); r.num.step(dt);
        const sv_ = r.s.v, A = clamp(sv_ * 1.6), [sx, sy] = slot(r, pv);
        let ax = sx, ay = sy;
        if (d.from) { ax = recs[d.from].dx; ay = recs[d.from].dy; } else if (d.kind === 'source') ay = H + r.ch;
        let x = ax + (sx - ax) * sv_, y = ay + (sy - ay) * sv_;
        const loose = (1 - clamp(r.firm.v)) * (1 - clamp(r.out.v)) * A * (still ? 0 : 1);
        x += Math.sin(T * .83 + r.ph) * 4.4 * U * loose;
        y += (-8 + Math.cos(T * .61 + r.ph * 1.3) * 5.2) * U * loose;
        r.dx = x; r.dy = y; r.a = A;
        const w = mix(r.cw, tok, pv), h = mix(r.ch, tok, pv), sc = .7 + .3 * clamp(sv_, 0, 1.04) + .045 * Math.sin(Math.PI * clamp(r.ping.v));
        r.w = w * sc; r.h = h * sc;
        const ws = w.toFixed(1) + 'px', hs = h.toFixed(1) + 'px';
        if (r.css.w !== ws) { r.css.w = ws; r.el.style.width = ws; }
        if (r.css.h !== hs) { r.css.h = hs; r.el.style.height = hs; }
        const tf = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px) scale(${sc.toFixed(4)})`;
        if (r.css.tf !== tf) { r.css.tf = tf; r.el.style.transform = tf; }
        setVar(r, '--a', A); setVar(r, '--firm', clamp(r.firm.v)); setVar(r, '--coral', clamp(r.coral.v)); setVar(r, '--out', clamp(r.out.v));
        setVar(r, '--hot', clamp(Math.max(r.hot.v, r.ping.v * .85)));
        setVar(r, '--n', clamp(r.num.v) * pv);
        const pl = ((1 - clamp(sv_ * 1.2)) * (1 - pv) * .6).toFixed(3); if (r.css.pl !== pl) { r.css.pl = pl; r.plan.style.opacity = pl; }
        if (id === 'I') setVar(r, '--halo', clamp(halo));
        /* the run computes while the claim it realises stands; the figure is drawn while the run does */
        if (r.guess.length && A > .05 && mode !== 'narrow') {       // the step at work: the flat guess bends into the law, and back
          const g = still ? 1 : .5 - .5 * Math.cos(T * 1.25 + .6), e = smooth(clamp(g * 1.5 - .25));
          r.guess.forEach((b, i) => { const hgt = mix(FLAT[i], LAW[i], e).toFixed(2); if (b._h !== hgt) { b._h = hgt; b.setAttribute('height', hgt); b.setAttribute('y', (21.5 - hgt).toFixed(2)); } });
        }
        if (d.kind === 'run') r.bars.forEach((b, i) => { const hgt = (24 * BARS[i] * clamp(r.live.v * 1.25 - i * .03)).toFixed(2); if (b._h !== hgt) { b._h = hgt; b.setAttribute('height', hgt); b.setAttribute('y', (27 - hgt).toFixed(2)); } });
        if (d.kind === 'figure') {
          const f = clamp(r.live.v), off = (1 - f).toFixed(3);
          if (r.plot._o !== off) { r.plot._o = off; r.plot.style.strokeDashoffset = off; r.dots.forEach((c, i) => c.setAttribute('r', (1.9 * clamp(f * 9 - i)).toFixed(2))); }
        }
      });

      /* links follow the boxes every frame, edge to edge */
      links.forEach(l => {
        const a = l.a, b = l.b, al = Math.min(a.a, b.a);
        const pl = ((1 - clamp(Math.min(a.s.v, b.s.v) * 1.2)) * (1 - pv) * .5).toFixed(3); if (l.o.pl !== pl) { l.o.pl = pl; l.plan.style.opacity = pl; }
        const show = al > .02;
        if (l.o.show !== show) { l.o.show = show; const v = show ? '' : 'none'; l.line.style.display = l.cut.style.display = l.glow.style.display = v; }
        if (!show) { hide(l.wake, l.tip); l.name.style.opacity = 0; return; }
        const p0 = edge(a.dx, a.dy, a.w / 2 + 2, a.h / 2 + 2, b.dx, b.dy), p1 = edge(b.dx, b.dy, b.w / 2 + 2, b.h / 2 + 2, a.dx, a.dy);
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, ddx = p1[0] - p0[0], ddy = p1[1] - p0[1];
        const c = [mx - ddy * l.bow, my + ddx * l.bow];
        const dstr = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
        if (l.o.d !== dstr) { l.o.d = dstr; l.line.setAttribute('d', dstr); l.cut.setAttribute('d', dstr); l.glow.setAttribute('d', dstr); }
        const gone = clamp(Math.max(a.out.v, b.out.v)), hot = clamp(Math.max(a.hot.v, b.hot.v));
        const flow = Math.min(clamp(a.firm.v), clamp(b.firm.v));
        l.line.style.opacity = (al * (1 - gone) * (.5 + .4 * flow)).toFixed(3);
        l.cut.style.opacity = (al * gone * .75).toFixed(3);
        l.glow.style.opacity = (al * hot * .95).toFixed(3);
        const named = Math.max(hot, mode === 'full' && Math.hypot(ddx, ddy) > 84 ? .78 * (1 - gone) * clamp(Math.min(a.s.v, b.s.v)) : 0);
        l.name.style.opacity = (al * named * (1 - pv)).toFixed(3);
        if (l.o.hot !== (hot > .4)) { l.o.hot = hot > .4; l.name.classList.toggle('is-hot', l.o.hot); }
        if (named > .01) { const m = quad(p0, c, p1, l.at); l.name.style.transform = `translate(${m[0].toFixed(1)}px,${m[1].toFixed(1)}px) translate(-50%,-50%)`; }
        /* a pulse climbs from the bedrock: each link carries it for 1.1 s, one depth after another */
        const live = flow * (still ? 0 : 1);
        const ph = fract(T / 4.4 - b.d.depth * .25) / .25;
        if (live < .03 || ph >= 1) { hide(l.wake, l.tip); return; }
        const s = smooth(ph), e = Math.sin(Math.PI * ph), tip = quad(p1, c, p0, s);
        if (a.id === 'I' && ph > .86) halo = Math.max(halo, (ph - .86) / .14);
        let wd = '';
        for (let k = 0; k <= 6; k++) { const pt = quad(p1, c, p0, Math.max(0, s - k * .045)); wd += (k ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }
        l.wake.style.display = l.tip.style.display = '';
        l.wake.setAttribute('d', wd); l.wake.style.opacity = (live * e * .8).toFixed(3);
        l.tip.setAttribute('cx', tip[0].toFixed(1)); l.tip.setAttribute('cy', tip[1].toFixed(1)); l.tip.style.opacity = (live * Math.min(1, e * 1.6)).toFixed(3);
      });
      const tied = clamp(Math.min(recs.SL.firm.v, recs.SM.firm.v, recs.SJ.firm.v) * recs.I.firm.v);
      if (root._tied !== tied) { root._tied = tied; strata[0].style.opacity = (.42 + .5 * tied).toFixed(3); }
      roots.forEach(({ r, p }) => {                                   // a source keeps its hold on the page it was read from
        const y0 = r.dy + r.h / 2, a = r.a * (1 - clamp(r.out.v));
        p.setAttribute('d', `M${(r.dx - r.w * .22).toFixed(1)} ${y0.toFixed(1)}V${(H + 4).toFixed(1)}M${(r.dx + r.w * .22).toFixed(1)} ${y0.toFixed(1)}V${(H + 4).toFixed(1)}`);
        p.style.opacity = (a * .55).toFixed(3);
      });

      /* the sheet, and the sentences written onto it */
      const sh = clamp(sheet.v);
      if (root._sh !== sh) {
        root._sh = sh; page.style.opacity = smooth(clamp(sh * 2 - .9)).toFixed(3); page.style.transform = `translateX(${((1 - sh) * 26).toFixed(1)}px)`;
        page.style.visibility = sh < .46 ? 'hidden' : 'visible';
        if (sh < .02 && !cleared && sheet.g === 0) { cleared = true; page.querySelectorAll('.on').forEach(n => n.classList.remove('on')); ORDER.forEach(id => recs[id].num.snap(0)); }
      }
      const hr = hotId && recs[hotId], wa = hr ? clamp(hr.hot.v) * pv : 0;       // in the paper view a record under the pointer gives its name
      if (root._wa !== wa.toFixed(2)) { root._wa = wa.toFixed(2); who.style.opacity = wa.toFixed(2); }
      if (hr && wa > .01) { if (who._id !== hotId) { who._id = hotId; who.textContent = hr.d.label; } who.style.transform = `translate(${hr.dx.toFixed(1)}px,${(hr.dy - hr.h / 2 - 9).toFixed(1)}px) translate(-50%,-100%)`; }
      threads.forEach(th => {
        const r = th.r, fl = flights.find(x => x.id === r.id), f = fl && now >= fl.t0 ? fl : null, tgt = sh > .6 && (f || r.hot.v > .02) ? spot(r.id) : null;
        if (!tgt) { hide(th.p, th.c); return; }
        const from = [r.dx + r.w / 2 - 2, r.dy], c = [mix(from[0], tgt[0], .5), Math.min(from[1], tgt[1]) - 26 * U];
        let k = 1, a = r.hot.v;
        if (f) { const u = clamp((now - f.t0) / f.dur); k = smooth(u); a = Math.max(a, 1 - clamp((now - f.t0 - f.dur) / 380)); if (u >= 1 && !f.done) { f.done = true; land(r.id); } }
        let d = '';
        for (let j = 0; j <= 14; j++) { const pt = quad(from, c, tgt, k * j / 14); d += (j ? 'L' : 'M') + pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }
        const end = quad(from, c, tgt, k);
        th.p.style.display = th.c.style.display = '';
        th.p.setAttribute('d', d); th.p.style.opacity = (a * .75).toFixed(3);
        th.c.setAttribute('cx', end[0].toFixed(1)); th.c.setAttribute('cy', end[1].toFixed(1)); th.c.style.opacity = (f && !f.done ? 1 : a * .9).toFixed(3);
      });
      for (let i = flights.length - 1; i >= 0; i--) if (flights[i].done && now - flights[i].t0 > flights[i].dur + 400) flights.splice(i, 1);
    }
    const hide = (...els) => els.forEach(e => { if (e.style.display !== 'none') e.style.display = 'none'; });

    /* ---- the sheet ---------------------------------------------------------------------------------------- */
    function spot(id) {
      if (!spots) {
        spots = {};
        const base = root.getBoundingClientRect(), shift = (1 - clamp(root._sh === undefined ? 0 : root._sh)) * 26;
        ORDER.forEach(k => { const n = page.querySelector(`[data-r="${k}"]`); if (!n) return; const b = n.getClientRects()[0] || n.getBoundingClientRect(); spots[k] = [b.left - base.left - shift + Math.min(b.width / 2, 34), b.top - base.top + b.height / 2]; });
      }
      return spots[id];
    }
    function land(id) { page.querySelectorAll(`[data-r="${id}"],[data-w="${id}"]`).forEach(n => n.classList.add('on')); recs[id].num.to(1); }
    function write(now) {
      flights.length = 0; cleared = false;
      if (M.off) { READ.forEach(land); return; }
      READ.forEach((id, i) => flights.push({ id, t0: now + 900 + i * 210, dur: 560, done: false }));
    }
    function marks() {                                               // a sentence drawn from a record that no longer stands is marked
      const full = standing(5, out);
      ORDER.forEach(id => page.querySelectorAll(`[data-r="${id}"]`).forEach(n => { n.classList.toggle('out', out.has(id)); n.classList.toggle('loose', !out.has(id) && !full[id]); n.classList.toggle('hot', hotId === id); }));
    }

    /* ---- state -------------------------------------------------------------------------------------------- */
    const objectStage = () => Math.min(cur, 5);
    function settle(cause, base = 0) {
      const st = objectStage(), firm = standing(st, out), whole = standing(st, new Set()), now = performance.now();
      let dist = null;
      if (cause && cause.out) {                                      // how far each record is from the one just taken out
        dist = { [cause.out]: 0 }; const todo = [cause.out];
        while (todo.length) { const k = todo.shift(); STANDS[k].forEach(n => { if (!(n in dist)) { dist[n] = dist[k] + 1; todo.push(n); } }); }
      }
      ORDER.forEach(id => {
        const r = recs[id], here = REC[id].stage <= st, gone = out.has(id);
        const delay = base + (dist ? (dist[id] || 0) * 120 : firm[id] ? REC[id].depth * 150 : 0);
        r.at.firm = { v: firm[id] ? 1 : 0, at: now + delay };
        r.at.coral = { v: here && !gone && !firm[id] && whole[id] ? 1 : 0, at: now + delay };
        r.out.to(gone ? 1 : 0);
        const feeds = id === 'Rn' ? firm.Rn : id === 'F' ? firm.F : false;
        r.at.live = { v: feeds ? 1 : 0, at: now + delay + (feeds ? 260 : 0) };
        r.el.setAttribute('aria-pressed', gone ? 'true' : 'false');
        r.el.setAttribute('aria-label', `${KIND[r.d.kind]}: ${r.d.label}. ${gone ? 'Taken out. Press to put it back.' : firm[id] ? 'Standing. Press to take it out.' : 'Nothing under it yet. Press to take it out.'}`);
      });
      marks(); say(firm, whole);
    }
    function say(firm, whole) {
      const st = objectStage(), n = ORDER.filter(id => REC[id].stage <= st && !out.has(id) && !firm[id] && whole[id]).length;
      const gone = [...out].filter(id => REC[id].stage <= st);
      let text;
      if (!gone.length) text = st < 1 ? 'One record so far. Press it to take it out.' : 'Take any record out to see what stands on it.';
      else if (st < 3) text = `${gone.length === 1 ? '“' + cap(REC[gone[0]].label) + '” is' : cap(COUNT[gone.length]) + ' records are'} out. Nothing here is tied down yet, so nothing else moves.`;
      else if (gone.length === 1) text = n ? `Without “${REC[gone[0]].label}”, ${n === 1 ? 'one record has' : COUNT[n] + ' records have'} nothing to stand on.` : `Nothing stood on “${REC[gone[0]].label}”.`;
      else text = `With ${COUNT[gone.length]} records out, ${n === 0 ? 'none of the rest has lost its footing' : n === 1 ? 'one more has nothing to stand on' : COUNT[n] + ' more have nothing to stand on'}.`;
      if (noteText.textContent !== text) noteText.textContent = text;
      back.hidden = !gone.length; back.textContent = gone.length > 1 ? 'Put them back' : 'Put it back';
    }
    function toggle(id) {
      stopAuto(); pressed = true;
      if (recs[id].want < 1) return;
      if (out.has(id)) { out.delete(id); settle({ back: id }); } else { out.add(id); settle({ out: id }); }
      wake();
    }
    back.addEventListener('click', e => { e.stopPropagation(); stopAuto(); out.clear(); settle({ back: 1 }); wake(); });
    function setHot(id) {
      if (id && recs[id] && recs[id].want < 1) id = null;
      hotId = id; ORDER.forEach(k => recs[k].hot.to(k === id ? 1 : 0)); marks(); wake();
    }
    function setStage(i, quiet) {
      i = clamp(Math.round(i), 0, 6);
      const was = cur, wasObj = Math.max(-1, Math.min(was, 5)); cur = i;
      const st = objectStage(), now = performance.now(), fwd = st > wasObj;
      let lastIn = 0;
      ORDER.forEach(id => {
        const r = recs[id], want = REC[id].stage <= st ? 1 : 0;
        if (want === r.want) return;
        const gap = fwd ? Math.max(0, REC[id].stage - (wasObj + 1)) : Math.max(0, wasObj - REC[id].stage);
        const within = ORDER.filter(k => REC[k].stage === REC[id].stage).indexOf(id);
        const delay = gap * (fwd ? 430 : 150) + (want ? within * 90 : 0) + (was === 6 && !want ? 560 : 0);   // leaving the paper: first the object is whole again, then it is taken apart
        r.want = want; r.at.s = { v: want, at: now + delay };
        if (want) lastIn = Math.max(lastIn, delay);
        r.el.tabIndex = want ? 0 : -1; r.el.style.pointerEvents = want ? '' : 'none';
        if (!want) { out.delete(id); if (hotId === id) hotId = null; }
      });
      paperAt = { v: i === 6 ? 1 : 0, at: now + (i === 6 ? lastIn + (fwd && lastIn ? 700 : 0) : 0) };
      settle(null, fwd ? lastIn + 420 : 0);
      stageNo.textContent = `${i + 1} of ${STAGES.length}`; stageName.textContent = STAGES[i];
      if (!quiet) {
        if (typeof opts.onStep === 'function') opts.onStep(i);
        host.dispatchEvent(new CustomEvent('eg-step', { bubbles: true, detail: { node: 'build', i } }));
      }
      wake();
    }
    function again() {                                               // the stage asked for is the one showing: let its records answer
      const st = objectStage();
      if (cur === 6) write(performance.now());
      else ORDER.forEach(id => { if (REC[id].stage === st) recs[id].ping.snap(1).to(0); });
      wake();
    }

    /* ---- running ------------------------------------------------------------------------------------------ */
    function frame(now) {
      raf = 0; if (!alive) return;
      const dt = Math.min(.05, last ? (now - last) / 1000 : 0); last = now;
      if (!M.off) T += dt;
      if (W) draw(dt);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame); else last = 0;
    }
    function wake() { if (!raf && alive && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function stopAuto() { autoOn = false; clearTimeout(autoTimer); }
    function auto() {                                                // built once in front of the reader, a stage at a time
      if (!autoOn) return;
      if (cur >= 6) { autoOn = false; return; }
      autoTimer = setTimeout(() => { if (!autoOn) return; setStage(cur + 1); auto(); }, cur < 0 ? 250 : cur === 5 ? 4400 : 2700);
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { if (measure()) wake(); }) : null;
    if (ro) ro.observe(host); else window.addEventListener('resize', measure);
    let io = null, started = false;
    const begin = () => {
      if (started) return; started = true;
      if (opts.autoplay === false || M.off) { if (cur < 0) setStage(M.off ? 5 : 0); return; }
      if (cur < 0) { autoOn = true; setStage(0); auto(); }
    };
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { if (en.intersectionRatio > .25) begin(); wake(); } }, { threshold: [0, .25, .5] });
      io.observe(host);
    } else begin();
    const onVis = () => wake();
    document.addEventListener('visibilitychange', onVis);
    measure();
    wake();

    return {
      step(i) { stopAuto(); started = true; pressed = true; if (i === cur) again(); else setStage(i); },
      get stage() { return cur; },
      state() { return { stage: cur, out: [...out], firm: standing(objectStage(), out), recs: Object.fromEntries(ORDER.map(id => [id, { x: recs[id].dx, y: recs[id].dy, w: recs[id].w, h: recs[id].h, a: recs[id].a }])), links: links.map(l => ({ a: l.a.id, b: l.b.id, d: l.o.d, show: l.o.show })) }; },
      destroy() { alive = false; stopAuto(); clearTimeout(touchTimer); cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', onVis); root.remove(); },
    };
  }

  /* ================================================================================================================
     The card art: the same object as a line drawing. It grows from the idea down to the bedrock, a pulse climbs back
     up once it stands, and it is taken apart again in the order it was built. No text. One loop of 14 seconds.
     ================================================================================================================ */
  function art(svg) {
    const PERIOD = 14, X = x => 26 + x * 3.48, Y = y => 17 + y * 1.3, Z = .86;
    const RAD = { idea: 10.5, claim: 7.6, step: 9.2, premise: 7.6, source: 8.6, run: 11, figure: 12 };
    const TONE = { source: 'var(--eg-blue)', run: 'var(--eg-teal)', figure: 'var(--eg-teal)' };
    const DEPTH = { C3: 1, C1: 1, C2: 1, O: 2, P2: 3, P3: 3, SL: 4, SM: 4, SJ: 4, Rn: 5, F: 6 };       // the order of building
    const LDEPTH = l => l[0] === 'O' && l[1] === 'C1' ? 3 : Math.max(DEPTH[l[0]] || 0, DEPTH[l[1]] || 0);
    const g = sv('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const P = {}; ORDER.forEach(id => P[id] = [X(REC[id].x), Y(REC[id].y)]);
    const shape = (id, parent, attrs) => {
      const [x, y] = P[id], k = REC[id].kind, e = sv('g', attrs, parent), inner = sv('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${Z}) translate(${(-x).toFixed(1)} ${(-y).toFixed(1)})` }, e), put = (tag, a) => sv(tag, a, inner);
      if (k === 'idea') { put('circle', { cx: x, cy: y, r: 9 }); put('circle', { cx: x, cy: y, r: 3.3, style: 'fill:currentColor;stroke:none' }); }
      else if (k === 'claim') { put('circle', { cx: x, cy: y, r: 6.2 }); put('circle', { cx: x, cy: y, r: 2.1, style: 'fill:currentColor;stroke:none' }); }
      else if (k === 'step') put('path', { d: `M${x} ${y - 8.6}L${x + 8.6} ${y}L${x} ${y + 8.6}L${x - 8.6} ${y}Z` });
      else if (k === 'premise') put('rect', { x: x - 6, y: y - 6, width: 12, height: 12, rx: 2 });
      else if (k === 'source') { put('path', { d: `M${x - 5.6} ${y - 7.4}h7.2l4 4v10.8h-11.2Z` }); put('path', { d: `M${x - 2.8} ${y - .4}h5.8M${x - 2.8} ${y + 2.8}h4` }); }
      else if (k === 'run') { put('path', { d: `M${x - 10} ${y + 7}h20` }); [8, 4.6, 3.2, 2.4, 1.9].forEach((h, i) => put('path', { d: `M${x - 7.4 + i * 3.7} ${y + 6}v${-h * 1.35}`, 'stroke-width': 2.3 })); }
      else { put('path', { d: `M${x - 10} ${y - 8}v15h21` }); put('path', { d: `M${x - 6.6} ${y - 5}L${x + 8.6} ${y + 3.6}` }); }
      return e;
    };
    /* bedrock */
    const rockY = [Y(85) + 10, Y(85) + 18, Y(85) + 27];
    const rockLines = rockY.map((y, i) => { let d = ''; for (let x = -8; x <= 408; x += 12) d += (d ? 'L' : 'M') + x + ' ' + (y + Math.sin(x * .016 + i * 1.9) * (2.4 - i * .5)).toFixed(1); if (!i) sv('path', { d: d + 'V300H-8Z', style: 'fill:var(--eg-blue);stroke:none;opacity:.07' }, g); return sv('path', { d, style: `stroke:var(--eg-blue);opacity:${[.42, .24, .13][i]}`, 'stroke-width': 1.1 }, g); });
    /* blueprint: the whole object, faintly, so the card is never empty */
    const guide = sv('g', { style: 'stroke:var(--eg-faint);color:var(--eg-faint);opacity:.42', 'stroke-width': 1.1 }, g);
    const paths = LINKS.map(l => {
      const [a, b, kind, bow] = l, early = (a === 'O' && b === 'C1') || (DEPTH[a] || 0) <= (DEPTH[b] || 0) ? a : b, late = early === a ? b : a;   // the end it grows from
      const A = P[early], B = P[late], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy);
      const p0 = [A[0] + dx / len * RAD[REC[early].kind], A[1] + dy / len * RAD[REC[early].kind]], p1 = [B[0] - dx / len * RAD[REC[late].kind], B[1] - dy / len * RAD[REC[late].kind]];
      const s = early === a ? 1 : -1, c = [(p0[0] + p1[0]) / 2 - (p1[1] - p0[1]) * bow * s, (p0[1] + p1[1]) / 2 + (p1[0] - p0[0]) * bow * s];
      const d = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
      sv('path', { d }, guide);
      return { l, kind, depth: LDEPTH(l), p0, c, p1, d, early, late };
    });
    ORDER.forEach(id => shape(id, guide, {}));
    /* ink */
    const ink = sv('g', { 'stroke-width': 2.1 }, g);
    paths.forEach(p => { p.lum = sv('path', { d: p.d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, 'stroke-width': 7, style: `opacity:.11;stroke:${p.kind === 'supported by' ? 'var(--eg-blue)' : p.kind === 'requires' ? 'var(--eg-ink)' : 'var(--eg-teal)'}` }, ink); });
    paths.forEach(p => { p.el = sv('path', { d: p.d, pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1, style: `stroke:${p.kind === 'supported by' ? 'var(--eg-blue)' : p.kind === 'requires' ? 'var(--eg-muted)' : 'var(--eg-teal)'}` }, ink); p.pen = sv('circle', { r: 2.5, style: 'fill:var(--eg-gold);stroke:none;opacity:0' }, ink); });
    const nodes = {}; ORDER.forEach(id => nodes[id] = shape(id, ink, { style: `stroke:${TONE[REC[id].kind] || 'var(--eg-ink)'};color:${TONE[REC[id].kind] || 'var(--eg-ink)'};opacity:${id === 'I' ? 1 : 0}` }));
    const haloEl = sv('circle', { cx: P.I[0], cy: P.I[1], r: 14, style: 'fill:var(--eg-gold);stroke:none;opacity:0' }, g);
    /* the routes a pulse climbs once the object stands, and the one the numbers take to the figure */
    const route = ids => { const pts = []; for (let i = 0; i < ids.length - 1; i++) { const p = paths.find(q => (q.early === ids[i] && q.late === ids[i + 1]) || (q.early === ids[i + 1] && q.late === ids[i])), rev = p.early !== ids[i]; for (let k = 0; k <= 12; k++) pts.push(quad(p.p0, p.c, p.p1, rev ? 1 - k / 12 : k / 12)); } const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; };
    const at = (r, dist) => { const d = clamp(dist, 0, r.len); let i = 1; while (i < r.cum.length - 1 && r.cum[i] < d) i++; const f = (d - r.cum[i - 1]) / ((r.cum[i] - r.cum[i - 1]) || 1); return [mix(r.pts[i - 1][0], r.pts[i][0], f), mix(r.pts[i - 1][1], r.pts[i][1], f)]; };
    const ROUTES = [['SM', 'C1', 'I'], ['SJ', 'O', 'C2', 'I'], ['SL', 'C3', 'I'], ['C2', 'Rn', 'F']].map((ids, i) => ({ r: route(ids), teal: i === 3, lag: i / 4,
      wake: sv('path', { 'stroke-width': 2.4, style: `stroke:${i === 3 ? 'var(--eg-teal)' : 'var(--eg-gold)'};opacity:0` }, g), tip: sv('circle', { r: 3.1, style: `fill:${i === 3 ? 'var(--eg-teal)' : 'var(--eg-ink)'};stroke:none;opacity:0` }, g) }));
    const G0 = .04, GD = .058, R0 = .70, RD = .042;
    const grown = (u, depth) => depth ? smooth(clamp((u - G0 - (depth - 1) * GD) / GD)) * (1 - smooth(clamp((u - R0 - (6 - depth) * RD) / RD))) : 1;

    function tick(t) {
      const u = M.off ? .5 : fract(t / PERIOD);
      paths.forEach(p => {
        const f = grown(u, p.depth);
        p.el.setAttribute('stroke-dashoffset', (1 - f).toFixed(4)); p.lum.setAttribute('stroke-dashoffset', (1 - f).toFixed(4));
        const moving = f > .015 && f < .985, tip = quad(p.p0, p.c, p.p1, f);
        p.pen.setAttribute('cx', tip[0].toFixed(1)); p.pen.setAttribute('cy', tip[1].toFixed(1)); p.pen.style.opacity = moving ? Math.sin(Math.PI * f).toFixed(3) : 0;
      });
      ORDER.forEach(id => { if (id !== 'I') nodes[id].style.opacity = smooth(clamp(grown(u, DEPTH[id]) * 2.4 - 1.2)).toFixed(3); });
      const stands = smooth(clamp((u - .30) / .05)) * (1 - smooth(clamp((u - .655) / .045)));
      let lit = 0;
      ROUTES.forEach(R => {
        const gate = R.teal ? Math.min(stands, grown(u, 6)) : stands, ph = clamp(fract(t / 4.2 - R.lag) * 4 / 1.1), e = Math.sin(Math.PI * ph), head = smooth(ph) * R.r.len;   // one at a time, as on the Hilbert card
        const a = gate * Math.min(1, e * 2.2) * (M.off ? 0 : 1);
        const p = at(R.r, head); let d = '';
        for (let k = 0; k <= 7; k++) { const q = at(R.r, head - k * 5.5); d += (k ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
        R.wake.setAttribute('d', d); R.wake.style.opacity = (a * .7).toFixed(3);
        R.tip.setAttribute('cx', p[0].toFixed(1)); R.tip.setAttribute('cy', p[1].toFixed(1)); R.tip.style.opacity = a.toFixed(3);
        if (!R.teal && ph > .8 && ph < 1) lit = Math.max(lit, gate * (ph - .8) / .2);
      });
      rockLines[0].style.opacity = (.42 + .34 * stands).toFixed(3);
      const breath = .5 + .5 * Math.sin(2 * Math.PI * t / 3.5);
      haloEl.setAttribute('r', (13 + 4 * lit + 1.2 * breath).toFixed(2)); haloEl.style.opacity = (.07 + .05 * breath + .22 * lit + .06 * stands).toFixed(3);
    }
    tick(0);
    return { tick, destroy() { g.remove(); } };
  }

  /* ---- the node --------------------------------------------------------------------------------------------- */
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.build = {
    title: 'Built in stages',
    question: 'What does it build?',
    line: 'EigenEngine builds the argument behind a paper as one linked object, and draws the paper from it.',
    text: 'A paper records where an argument arrived, and little of the route. Behind it lies an idea, sharpened into claims; the premises and steps which turn each claim into a result; and the passages in the literature which let that result be trusted. Calculations realise a result and figures show it. EigenEngine builds this as one linked <i>research object</i>, of which a paper or a talk is just a projection.',
    art,
    exhibit: {
      steps: [
        { label: 'An idea', caption: 'We begin with the one sentence a project sets out to make precise: that telling things apart has a cost. As yet nothing holds it up.' },
        { label: 'Claims', caption: 'The idea is sharpened into three claims, each of which can be argued and cited alone. The third is the word frequency law: a few words are used constantly, and most hardly at all.' },
        { label: 'Premises and steps', caption: 'If the cost of naming a word grows as the logarithm of its rank, and only the average cost is known, then the least-biased guess at how often each word is used is the word frequency law. The claim now rests on that step.' },
        { label: 'Sources', caption: 'Claims and steps are then tied to the passages in the literature that were read for them. With that the object stops drifting, since a result can be trusted only when its links reach accepted fact.' },
        { label: 'Calculations', caption: 'A recorded run computes the law for a vocabulary of five hundred words. Its output is kept with the claim it realises.' },
        { label: 'Figures', caption: 'The figure is drawn from that run, so that claim, run and figure form one chain. Take any record out and whatever stood on it comes loose.' },
        { label: 'A paper', caption: 'A paper is a projection of this object, in which its records are put in the order a reader needs and written out. The object remains, and the next paper or talk is drawn from the same records.' },
      ],
      mount,
    },
    sections: [{
      title: 'Where the example comes from',
      mount(el) {
        el.innerHTML = '<div class="egb-src egn-build"><a class="egb-src-fig" href="/assets/docs/the-cost-of-complexity.pdf?v=3f99bae5#page=14" target="_blank" rel="noopener"><img src="/eigenengine/cost-of-complexity/reading/cost/figure-6.webp" width="533" height="505" alt="Figure 6 of The Cost of Complexity: the family of rank distributions, with the word frequency law in red" loading="lazy"></a>' +
          '<div><p>The example is Theorem 5 of <a href="/eigenengine/cost-of-complexity/"><i>The Cost of Complexity</i></a>. Given a cost which grows as the logarithm of rank, and no knowledge beyond its average, maximum entropy returns a power law in rank. With exponent one this is Zipf’s law, the red line of the paper’s Figure 6.</p>' +
          '<p class="egb-src-links"><a href="/assets/docs/the-cost-of-complexity.pdf?v=3f99bae5#page=13" target="_blank" rel="noopener">Theorem 5, p. 13 ↗</a><a href="/assets/docs/the-cost-of-complexity.pdf?v=3f99bae5#page=14" target="_blank" rel="noopener">Figure 6, p. 14 ↗</a></p></div></div>';
        return { destroy() { el.innerHTML = ''; } };
      },
    }],
  };
})();
