/* The Phases of Hierarchy: the node (card art, live exhibit, sections, words).
   Every number drawn here is computed in the page from the paper's own model (tex_v4): a population of N voters holds a
   mandate, sees the outcome one review later, and corrects it by majority vote; static stages of fidelity a sit between
   the vote and the mandate; a change crosses one stage per review. Parameters are the paper's. */
(() => {
  'use strict';
  const EM = window.EigenMotion || {}, MO = window.EG_MOTION || (window.EG_MOTION = { off: false });
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), smooth = x => x * x * (3 - 2 * x), mix = (a, b, u) => a + (b - a) * u;
  const NS = 'http://www.w3.org/2000/svg', TAU = 2 * Math.PI;

  /* ---------- the paper's model ---------- */
  const P = { beta: .6, b: 1.2, s: .4, alpha: .35, a: .8, H: 4, kick: .15 };
  const lf = (() => { const c = [0]; return n => { for (let i = c.length; i <= n; i++) c[i] = c[i - 1] + Math.log(i); return c[n]; }; })();   // ln n!
  const aN = n => { const h = (n - 1) / 2; return Math.exp(Math.log(n) + lf(n - 1) - 2 * lf(h) - (n - 1) * Math.LN2); };                // slope of a majority of n at a tie
  function majority(n, m) {                         // expected sign of a majority of n voters, each leaning m in [-1, 1]
    if (m < 0) return -majority(n, -m);
    if (m >= 1) return 1;
    const p = (1 + m) / 2, lp = Math.log(p), lq = Math.log(1 - p), top = lf(n); let low = 0;
    for (let j = 0; j <= (n - 1) / 2; j++) low += Math.exp(top - lf(j) - lf(n - j) + j * lp + (n - j) * lq);
    return 1 - 2 * low;
  }
  const g3 = m => (3 * m - m * m * m) / 2;          // a majority of three
  const Kc = (T = 1) => 2 / (P.b - P.s * Math.tanh(T / 2));
  const Kflat = n => P.alpha * P.beta * aN(n);
  function multipliers(K, T = 1) {                  // the two factors by which a small disturbance is scaled at each review
    const r = Math.exp(-T), tr = 1 + r - K * (P.b - (1 - r) * P.s), det = r * (1 - K * P.b), d = Math.sqrt(Math.max(0, tr * tr - 4 * det));
    return [(tr - d) / 2, (tr + d) / 2];
  }
  function review(st, respond, T = 1) {             // one review: the held state relaxes, the mismatch is read, the mandate is corrected
    const r = Math.exp(-T); st.x = r * st.x + (1 - r) * P.s * st.th;
    st.th += P.alpha * respond(Math.tanh(P.beta * (st.x - P.b * st.th)));
    return st.th;
  }
  const odd = v => Math.max(3, 2 * Math.round((v - 1) / 2) + 1);
  function firstUnstable(L, T = 1) { const k = Kc(T); for (let n = 3; n < 4001; n += 2) if (Kflat(n) * Math.pow(P.a, L - 1) >= k) return n; return Infinity; }
  const model = { P, aN, majority, g3, Kc, Kflat, multipliers, review, firstUnstable, odd };

  /* ---------- small drawing helpers ---------- */
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  function cut(pts, d0, d1) {                       // the piece of a polyline between two distances along it
    const out = []; let run = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay), s = run, e = run + len; run = e;
      if (!len || e < d0 || s > d1) continue;
      const u0 = clamp((d0 - s) / len), u1 = clamp((d1 - s) / len);
      if (!out.length) out.push([mix(ax, bx, u0), mix(ay, by, u0)]);
      out.push([mix(ax, bx, u1), mix(ay, by, u1)]);
    }
    return out;
  }
  const lengthOf = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  const dOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');

  /* ---------- the card: 243 voters report to one centre, flat and then through more and more layers ---------- */
  function art(svg) {
    const CX = 284, CY = 118, R = 136, NL = 243, GAP = .9, RJ = [0, .8 * R, .6 * R, .4 * R, .2 * R];   // RJ[j]: ring of the joints that gather 3^j voters
    const ink = 'var(--eg-phases-line, #d98a7c)';
    const g = el('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const leaves = Array.from({ length: NL }, (_, i) => {
      const at = k => Math.PI + GAP / 2 + k / NL * (TAU - GAP), a = at(i + .5);
      return { a, b: [0, 1, 2, 3, 4].map(j => { const size = 3 ** j, first = Math.floor(i / size) * size; return at(first + size / 2); }) };
    });
    const arc = r => { const a0 = Math.PI + GAP / 2, a1 = Math.PI - GAP / 2 + TAU, p = pol(CX, CY, r, a0), q = pol(CX, CY, r, a1); return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}A${r} ${r} 0 1 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}`; };
    el('path', { d: RJ.slice(1).map(arc).join(''), stroke: ink, 'stroke-width': .6, opacity: .2 }, g);
    el('path', { d: arc(R), stroke: ink, 'stroke-width': 2.1, 'stroke-dasharray': `0.01 ${(R * (TAU - GAP) / NL).toFixed(3)}`, 'stroke-dashoffset': (-R * (TAU - GAP) / NL / 2).toFixed(3), opacity: .85 }, g);
    const guide = el('path', { stroke: ink, 'stroke-width': .5, opacity: .14 }, g);
    const routes = el('path', { stroke: ink, 'stroke-width': .62, opacity: .52 }, g);
    const base = el('path', { d: `M${CX - 14} ${CY}H6`, stroke: ink, 'stroke-width': .6, opacity: .22, 'stroke-dasharray': '2 5' }, g);
    const fade = el('linearGradient', { id: 'egp-fade-' + Math.random().toString(36).slice(2), gradientUnits: 'userSpaceOnUse', x1: 6, y1: 0, x2: CX, y2: 0 }, svg);
    el('stop', { offset: 0, 'stop-color': '#f3b6a8', 'stop-opacity': 0 }, fade); el('stop', { offset: .3, 'stop-color': '#f3b6a8', 'stop-opacity': .75 }, fade); el('stop', { offset: 1, 'stop-color': '#fff1e8', 'stop-opacity': 1 }, fade);
    const tape = el('path', { stroke: `url(#${fade.id})`, 'stroke-width': 1.5 }, g);
    const glow = el('g', { style: 'filter: drop-shadow(0 0 3px #ff9c86)' }, g);
    const tracers = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(m => ({ leaf: leaves[13 + 27 * m], off: (m * 5 % 9) / 9, wake: el('path', { stroke: '#ffd9c9', 'stroke-width': 1.5 }, glow), tip: el('circle', { r: 1.9, fill: '#fff6ee' }, glow) }));
    const halo = el('circle', { cx: CX, cy: CY, fill: '#ff9c86' }, g), core = el('circle', { cx: CX, r: 3.6, fill: '#fff3ea' }, glow);
    base.setAttribute('pointer-events', 'none');

    function route(leaf, u) {                        // the centre, four joints, the voter; u in [0, 4] is how many layers are in use
      const pts = [[CX, CY]];
      for (let j = 4; j >= 1; j--) pts.push(pol(CX, CY, RJ[j], mix(leaf.a, leaf.b[j], clamp(u - (4 - j)))));
      pts.push(pol(CX, CY, R, leaf.a)); return pts;
    }
    const all = u => leaves.map(l => dOf(route(l, u))).join('');
    guide.setAttribute('d', all(4));

    const seq = [0, 1, 2, 3, 4, 3, 2, 1], REV = .38, STEP = 8 * REV, SP = 9, SCALE = 150, NT = 30;
    const st = { x: 0, th: 0 }, hist = Array(NT + 2).fill(0);
    let last = null, clock = 0, phase = 0, drawnU = -1, side = 1, shown = 0, vel = 0, bump = 0, u = 0, sw = 0, bm = 0;
    function respond(m) {                            // the same 243 voters: one flat vote, or blocks whose verdicts vote again
      const k = Math.min(3, Math.floor(u)), w = u - k, f = j => { let v = majority(3 ** (5 - j), m); for (let i = 0; i < j; i++) v = g3(v); return v; };
      return w > 0 ? mix(f(k), f(k + 1), w) : f(k);
    }
    function tick(t) {
      const dt = last === null ? 0 : clamp(t - last, 0, .1); last = t;
      if (MO.off && drawnU >= 0) return;
      clock += dt;
      const pos = clock / STEP, i = Math.floor(pos) % seq.length, e = smooth(clamp((pos - Math.floor(pos) - .23) / .6));
      u = seq[i] + (seq[(i + 1) % seq.length] - seq[i]) * e;
      if (Math.abs(u - drawnU) > 1e-4) { routes.setAttribute('d', all(u)); drawnU = u; guide.setAttribute('opacity', (.05 + .1 * (1 - u / 4)).toFixed(3)); }
      phase += dt / REV;
      while (phase >= 1) {                           // a review; when all is quiet a change arrives and disturbs the mandate
        phase -= 1;
        if (Math.max(Math.abs(hist[0]), Math.abs(hist[1]), Math.abs(hist[2])) < .014) { st.th += P.kick * side; side = -side; bump = 1; }
        hist.unshift(review(st, respond)); hist.length = NT + 2;
      }
      for (let h = dt; h > 0; h -= .008) { const q = Math.min(.008, h); vel += (324 * (hist[0] - shown) - 36 * vel) * q; shown += vel * q; } bump *= Math.exp(-dt * 3);   // the centre follows each new value on a critically damped spring
      const y = v => CY - clamp(v, -.21, .21) * SCALE, pts = [[CX, y(shown)]];
      for (let k = 1; k <= NT; k++) pts.push([CX - (k - 1 + phase) * SP, y(hist[k])]);
      tape.setAttribute('d', dOf(pts));
      core.setAttribute('cy', y(shown).toFixed(2));
      sw += (Math.min(1, Math.abs(hist[0] - hist[1]) / .3) - sw) * Math.min(1, dt * 5); bm += (bump - bm) * Math.min(1, dt * 7);
      halo.setAttribute('cy', y(shown).toFixed(2)); halo.setAttribute('r', (6 + 15 * sw + 6 * bm).toFixed(2)); halo.setAttribute('opacity', (.1 + .3 * sw + .2 * bm).toFixed(3));
      tracers.forEach(tr => {                        // a vote on its way in: a short light that follows the drawn route
        const pts = route(tr.leaf, u).reverse(), len = lengthOf(pts), p = ((clock / 3.6 + tr.off) % 1), head = p * (len + 30), a = Math.sin(Math.PI * p) ** .6;
        const w = cut(pts, Math.max(0, head - 30), Math.min(len, head));
        tr.wake.setAttribute('d', w.length ? dOf(w) : ''); tr.wake.setAttribute('opacity', (.85 * a).toFixed(3));
        const tipAt = w.length ? w[w.length - 1] : pts[0]; tr.tip.setAttribute('cx', tipAt[0].toFixed(2)); tr.tip.setAttribute('cy', tipAt[1].toFixed(2)); tr.tip.setAttribute('opacity', (head <= len ? a : 0).toFixed(3));
      });
    }
    tick(0);
    return { tick, destroy() { g.remove(); fade.remove(); }, _state: () => ({ u, th: hist[0], shown }) };
  }

  /* ---------- canvas plumbing shared by the exhibit and the sections ---------- */
  function surface(host, draw) {                     // a canvas that fills host, redrawn every frame while on screen
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); host.appendChild(cv);
    const ctx = cv.getContext('2d'), css = getComputedStyle(host), tok = (n, f) => css.getPropertyValue(n).trim() || f;
    const col = { ink: tok('--eg-ink', '#f2eee6'), muted: tok('--eg-muted', '#b4bccb'), faint: tok('--eg-faint', '#7f8aa0'), gold: tok('--eg-gold', '#e4bf7d'), teal: tok('--eg-teal', '#7fd1b9'), coral: tok('--eg-coral', '#ef8f6b'), line: tok('--eg-phases-line', '#d98a7c'), edge: tok('--eg-phases-edge', '#8a4a44'), label: tok('--eg-label', "'Outfit', system-ui, sans-serif") };
    let W = 0, H = 0, raf = 0, last = null, seen = true, dead = false;
    const fit = () => { const r = window.devicePixelRatio || 1; W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * r); cv.height = Math.round(H * r); ctx.setTransform(r, 0, 0, r, 0, 0); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(fit) : null; ro && ro.observe(cv); fit();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { seen = en.isIntersecting; }) : null; io && io.observe(cv);
    const font = (px, wt = 500) => { ctx.font = `${wt} ${px}px ${col.label}`; };
    const text = (s, x, y, { px = 12, wt = 500, c = col.muted, al = 'left', a = 1, base = 'alphabetic', halo = 0 } = {}) => { if (a <= .01) return; font(px, wt); ctx.globalAlpha = a; ctx.textAlign = al; ctx.textBaseline = base; if (halo) { ctx.lineWidth = halo; ctx.lineJoin = 'round'; ctx.strokeStyle = '#231619'; ctx.strokeText(s, x, y); } ctx.fillStyle = c; ctx.fillText(s, x, y); ctx.globalAlpha = 1; };
    const frame = now => { if (dead) return; raf = requestAnimationFrame(frame); const dt = last === null ? 0 : Math.min(.05, (now - last) / 1000); last = now; if (!seen || document.hidden || !W || !H) return; ctx.clearRect(0, 0, W, H); draw(ctx, dt, W, H); };
    raf = requestAnimationFrame(frame);
    if (document.fonts && document.fonts.load) document.fonts.load(`500 12px ${col.label}`);
    return { cv, ctx, col, text, font, size: () => [W, H], destroy() { dead = true; cancelAnimationFrame(raf); ro && ro.disconnect(); io && io.disconnect(); cv.remove(); } };
  }
  const spring = (v, k, c) => EM.Spring ? new EM.Spring(v, k, c) : { v, g: v, to(g) { this.g = this.v = g; return this; }, snap(g) { this.v = this.g = g; return this; }, step() { return false; } };
  const NS_LIST = [9, 27, 51, 81, 121, 151, 181, 251, 301, 401, 601, 701, 1001], LMAX = 6, NMIN = 9, NMAX = 1100;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  /* ---------- the exhibit: the hierarchy, the mandate it holds, and the map of where it works ---------- */
  const steps = [
    { label: 'A small group', N: 51, L: 1, caption: 'A population holds a <i>mandate</i>, the setting under which a larger system runs, and at each review it votes on whether the outcome fell above or below what was expected. In a small group the verdict is mild. Each correction is smaller than the last, and a disturbance dies away.' },
    { label: 'The group grows', N: 301, L: 1, caption: 'Each voter leans only slightly, yet a majority counted over many voters turns that lean into a near-certain verdict, which is what makes a large group a good judge. Fed back into the mandate it is overcorrection, and past a critical size the mandate reverses at every review without end.' },
    { label: 'Layers steady it', N: 301, L: 4, caption: 'We now pass the vote upwards through layers, each handing on only a fraction of what it receives. Every layer weakens the verdict by the same factor, so the depth needed grows only as the logarithm of the population, and the mandate settles again.' },
    { label: 'Too deep', N: 301, L: 6, caption: 'A genuine change must climb the same layers, and at each it loses strength and one review of time. A deep enough hierarchy is perfectly steady and cannot be moved before its deadline. The paper calls this the <i>inertial</i> phase.' },
    { label: 'Three phases', N: 301, L: 3, win: 1, caption: 'Depth therefore sorts a hierarchy into three phases. A shallow one is unstable and a deep one inert, and only in a band of depths between them do corrections both settle and arrive in time. The band rises as the population grows, and under a fixed deadline it closes.' },
    { label: 'In EigenEngine', N: 301, L: 4, win: 1, design: 1, caption: 'A research object is corrected in the same way. A change to one passage climbs a level of nesting per review - passage, claim, section, paper - until the shared term is revised. The nesting is deep enough that many records correcting one term cannot overshoot, and no deeper than a correction can travel in time.' }
  ];
  function mount(host, opts = {}) {
    const root = document.createElement('div'); root.className = 'egp' + (opts.compact ? ' egp-compact' : ''); host.appendChild(root);
    root.innerHTML = `<div class="egp-stage"></div><div class="egp-bar">
      <div class="egp-ctl" role="group" aria-label="Number of voters"><button type="button" data-dn="-1" aria-label="Fewer voters">&minus;</button><span data-out="n"></span><button type="button" data-dn="1" aria-label="More voters">+</button></div>
      <div class="egp-ctl" role="group" aria-label="Number of layers"><button type="button" data-dl="-1" aria-label="Fewer layers">&minus;</button><span data-out="l"></span><button type="button" data-dl="1" aria-label="More layers">+</button></div>
      <button type="button" class="egp-kick">Send a change</button><p class="egp-say" aria-live="polite"></p></div>`;
    const stage = root.querySelector('.egp-stage'), say = root.querySelector('.egp-say'), outN = root.querySelector('[data-out=n]'), outL = root.querySelector('[data-out=l]');
    const edge = Array.from({ length: LMAX + 1 }, (_, L) => L ? firstUnstable(L) : 0), kc = Kc();
    const sN = spring(Math.log(51)), sL = spring(1), sWin = spring(0), sDes = spring(0), sTh = spring(0, 260, 30);
    let N = 51, L = 1, design = 0, sw = 0, phase = 0, count = 0, quiet = 0, side = 1, fronts = [], lastArrival = null, drag = false;
    const st = { x: 0, th: 0 }, hist = Array(40).fill(null).map(() => ({ th: 0, hit: 0, un: 0 })), REV = .44;
    const GOLD = (i => { const f = (i + 1) * .6180339887; return f - Math.floor(f); });
    const leaf = Array.from({ length: 1001 }, (_, i) => { const f = GOLD(i); return { a: -Math.PI / 2 + f * TAU, b: [0, 1, 2, 3, 4, 5].map(l => -Math.PI / 2 + (Math.floor(f * 3 ** l) + .5) / 3 ** l * TAU) }; });
    const unstable = (n, l) => Kflat(n) * Math.pow(P.a, l - 1) >= kc;

    function verdict() {
      const who = design ? `${plural(N, 'record')} under ${plural(L, 'level')} of nesting` : `${plural(N, 'voter')} through ${plural(L, 'layer')}`, what = design ? 'the term' : 'the mandate';
      const un = unstable(N, L), late = L > P.H;
      say.dataset.state = un ? 'swing' : late ? 'late' : 'ok';
      say.textContent = un ? `${who}: each correction overshoots the last, and ${what} swings${late ? `; no change reaches it before review ${L}` : ''}.`
        : late ? `${who}: ${what} is steady, but no change reaches it before review ${L}, though it is needed by review ${P.H}.`
          : `${who}: a disturbance dies away, and a change reaches ${what} at review ${L}.`;
      outN.textContent = design ? plural(N, 'record') : plural(N, 'voter'); outL.textContent = design ? plural(L, 'level') : plural(L, 'layer');
      root.querySelector('[data-dn="-1"]').disabled = N <= NS_LIST[0]; root.querySelector('[data-dn="1"]').disabled = N >= NS_LIST[NS_LIST.length - 1];
      root.querySelector('[data-dl="-1"]').disabled = L <= 1; root.querySelector('[data-dl="1"]').disabled = L >= LMAX;
    }
    function set(n, l, o = {}) {
      N = odd(clamp(n, NMIN, 1001)); L = clamp(Math.round(l), 1, LMAX);
      if ('design' in o) design = o.design ? 1 : 0; if ('win' in o) sWin.to(o.win ? 1 : 0);
      sN.to(Math.log(N)); sL.to(L); sDes.to(design); verdict();
      if (MO.off) settle();
    }
    const byHand = () => host.dispatchEvent(new CustomEvent('eigen-exhibit-change', { bubbles: true, detail: { text: say.textContent } }));
    function send(marked = true) { fronts.push({ age: 0, marked, done: false, sign: side }); if (marked) { side = -side; quiet = 0; } }
    function tickReview() {
      count++;
      const depth = Math.max(1, sL.v), n = odd(Math.exp(sN.v)), gain = Math.pow(P.a, depth - 1);
      let hit = 0;
      fronts.forEach(f => { f.age++; if (!f.done && f.age >= Math.round(depth)) { f.done = true; if (f.marked) { st.th += f.sign * P.kick * gain; hit = 1; lastArrival = f.age; } } });
      fronts = fronts.filter(f => f.age < depth + 1.5);
      const th = review(st, m => gain * majority(n, m));
      hist.unshift({ th, hit, un: Kflat(n) * gain >= kc ? 1 : 0 }); hist.length = 40;
      quiet = Math.max(Math.abs(hist[0].th), Math.abs(hist[1].th), Math.abs(hist[2].th)) < .008 ? quiet + 1 : 0;
      send(false);
      if (quiet >= 4 && !fronts.some(f => f.marked && !f.done)) send(true);
    }
    function settle() { [sN, sL, sWin, sDes].forEach(s => s.snap(s.g)); for (let i = 0; i < 60; i++) tickReview(); sTh.snap(hist[0].th); phase = 0; }

    const S = surface(stage, (ctx, dt, W, H) => {
      const { col, text } = S, off = MO.off;
      if (!off) { [sN, sL, sWin, sDes].forEach(s => s.step(dt)); phase += dt / REV; while (phase >= 1) { phase -= 1; tickReview(); } sTh.to(hist[0].th).step(dt); }
      const Nc = Math.exp(sN.v), Lc = Math.max(1, sL.v), des = clamp(sDes.v), win = clamp(sWin.v), pad = W < 520 ? 8 : 14, wide = W >= 520;
      let T, Mp, Tr;                                   // tree, map, trace rectangles
      if (wide) { const s = Math.min(H - 2 * pad, W * .5 - pad), rx = pad + s + pad * 1.4, rw = W - rx - pad, mh = (H - 2 * pad) * .57; T = { x: pad, y: (H - s) / 2, s }; Mp = { x: rx, y: pad, w: rw, h: mh }; Tr = { x: rx, y: pad + mh + 12, w: rw, h: H - 2 * pad - mh - 12 }; }
      else { const s = Math.min(W * .52, H * .44); T = { x: 2, y: 2, s }; Tr = { x: s + 8, y: pad, w: W - s - 8 - pad, h: s - pad }; Mp = { x: pad, y: s + 10, w: W - 2 * pad, h: H - s - 10 - pad }; }

      /* the hierarchy */
      const cx = T.x + T.s / 2, cy = T.y + T.s / 2, R = T.s / 2 - (wide ? 24 : 12), rad = l => (l < Lc ? R * l / Lc : R);
      ctx.lineWidth = 1; ctx.strokeStyle = col.line;
      for (let l = 1; l < LMAX; l++) { const a = clamp(Lc - l) * .32; if (a > .01) { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(cx, cy, rad(l), 0, TAU); ctx.stroke(); } }
      const shownN = Math.min(1001, Math.ceil(Nc)), w = [0, 1, 2, 3, 4, 5].map(l => smooth(clamp(Lc - l)));
      ctx.globalAlpha = clamp(26 / Math.sqrt(Nc) * .2, .1, .5); ctx.lineWidth = wide ? .9 : .7; ctx.beginPath();
      for (let i = 0; i < shownN; i++) {
        const lf_ = leaf[i]; ctx.moveTo(cx, cy);
        for (let l = 1; l < LMAX; l++) { if (w[l] <= 0) break; const a = mix(lf_.a, lf_.b[l], w[l]), r = rad(l); ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
        ctx.lineTo(cx + R * Math.cos(lf_.a), cy + R * Math.sin(lf_.a));
      }
      ctx.stroke();
      ctx.fillStyle = col.line; const dotR = clamp(TAU * R / Nc * .3, .8, 3.2);
      for (let i = 0; i < shownN; i++) { ctx.globalAlpha = .95 * clamp(Nc - i); ctx.beginPath(); ctx.arc(cx + R * Math.cos(leaf[i].a), cy + R * Math.sin(leaf[i].a), dotR, 0, TAU); ctx.fill(); }
      fronts.forEach(f => {                           // a review's votes on their way in: one layer per review, weaker at each
        const age = f.age + (off ? 0 : phase), s = clamp(1 - age / Lc, 0, 1), r = R * s, a = Math.pow(P.a, Math.min(age, Lc)) * clamp((Lc + .6 - age) * 2) * clamp(age * 4);
        if (a <= .01 || r < 2) return;
        ctx.globalAlpha = (f.marked ? .95 : .2) * a; ctx.strokeStyle = f.marked ? col.gold : col.ink; ctx.lineWidth = f.marked ? 2.4 : 1; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
        if (f.marked && r > 26) text('a change on its way in', cx + r * .72 + 6, cy - r * .7 - 4, { px: wide ? 11 : 10, c: col.gold, a: a * clamp((r - 26) / 20), halo: 3 });
      });
      sw += (Math.min(1, Math.abs(hist[0].th - hist[1].th) / .3) - sw) * Math.min(1, dt * 5);
      const my = cy - clamp(sTh.v, -.24, .24) * R * .9, swing = sw;
      ctx.globalAlpha = .35; ctx.strokeStyle = col.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy - R * .24); ctx.lineTo(cx, cy + R * .24); ctx.stroke();
      ctx.globalAlpha = .16 + .3 * swing; ctx.fillStyle = col.gold; ctx.beginPath(); ctx.arc(cx, my, 9 + 12 * swing, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff6ee'; ctx.beginPath(); ctx.arc(cx, my, wide ? 4.6 : 3.6, 0, TAU); ctx.fill();
      {
        const lx = T.x + (wide ? 2 : 6), ly = T.y + (wide ? 12 : 14), nn = N, ll = L, fp = wide ? 13 : 11.5;
        text(plural(nn, 'voter'), lx, ly, { px: fp, wt: 600, c: col.ink, a: 1 - des, halo: 3 }); text(plural(nn, 'record') + ' that share a term', lx, ly, { px: fp, wt: 600, c: col.ink, a: des, halo: 3 });
        text(plural(ll, 'layer'), lx, ly + 16, { px: fp - 1.5, a: 1 - des, halo: 3 }); text(plural(ll, 'level') + ' of nesting', lx, ly + 16, { px: fp - 1.5, a: des, halo: 3 });
        text('the mandate', cx + 11, cy + R * .24 + 5, { px: 11, c: col.ink, a: (1 - des) * .85, halo: 3 }); text('the term they share', cx + 11, cy + R * .24 + 5, { px: 11, c: col.ink, a: des * .85, halo: 3 });
        if (des > .01 && wide) ['passages', 'claims', 'sections', 'papers', 'projects', 'fields'].slice(0, ll).forEach((nm, i) => text(nm, cx + 7, cy - (i ? rad(ll - i) : R) + 14, { px: 10.5, c: col.gold, a: des * clamp(Lc - ll + 1.5), halo: 3 }));
      }

      /* the mandate, review by review */
      const tx = Tr.x + 4, tw = Tr.w - 8, mid = Tr.y + Tr.h / 2 + 8, amp = Math.max(18, Tr.h / 2 - 22), sp = tw / 30, yv = v => mid - clamp(v, -.22, .22) / .22 * amp, x1 = tx + tw - 6;
      text(design ? 'the shared term, review by review' : 'the mandate, review by review', Tr.x + 2, Tr.y + 11, { px: 11.5, c: col.muted });
      ctx.globalAlpha = .3; ctx.strokeStyle = col.muted; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(tx, mid); ctx.lineTo(x1, mid); ctx.stroke(); ctx.setLineDash([]);
      const ph = off ? 0 : phase, tone = k => (hist[k].un ? col.coral : col.teal), xs = k => (k ? x1 - (k - 1 + ph) * sp : x1), ys = k => yv(k ? hist[k].th : sTh.v);
      ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      for (let k = 1; k < 34 && xs(k) >= tx; k++) { ctx.globalAlpha = .95 * clamp((xs(k) - tx) / 30); ctx.strokeStyle = tone(k - 1); ctx.beginPath(); ctx.moveTo(xs(k - 1), ys(k - 1)); ctx.lineTo(xs(k), ys(k)); ctx.stroke(); }
      for (let k = 1; k < 34 && xs(k) >= tx; k++) { ctx.globalAlpha = clamp((xs(k) - tx) / 30); ctx.fillStyle = hist[k].hit ? col.gold : tone(k); ctx.beginPath(); ctx.arc(xs(k), ys(k), hist[k].hit ? 3.6 : 2, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff6ee'; ctx.beginPath(); ctx.arc(x1, yv(sTh.v), 3.4, 0, TAU); ctx.fill();
      if (lastArrival !== null) text(`the last change arrived at review ${lastArrival}`, x1, Tr.y + Tr.h - 3, { px: 11, c: col.gold, al: 'right', a: .95 });

      /* the map: voters across, layers up */
      const px = Mp.x + 26, pw = Mp.w - 30, py = Mp.y + 20, phh = Mp.h - 20 - 30, rh = phh / LMAX, X = n => px + pw * (Math.log(n) - Math.log(NMIN)) / (Math.log(NMAX) - Math.log(NMIN)), Yc = l => py + phh - (l - .5) * rh;
      for (let l = 1; l <= LMAX; l++) {
        const y0 = py + phh - l * rh, xe = Math.min(px + pw, X(edge[l])), late = l > P.H;
        ctx.globalAlpha = late ? .13 : .2 + .14 * win; ctx.fillStyle = late ? col.faint : col.teal; ctx.fillRect(px, y0 + 1, xe - px, rh - 2);
        ctx.globalAlpha = .26; ctx.fillStyle = col.coral; ctx.fillRect(xe, y0 + 1, px + pw - xe, rh - 2);
      }
      if (win > .01) { ctx.globalAlpha = win; ctx.strokeStyle = col.teal; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(px, py + phh - P.H * rh); for (let l = P.H; l >= 1; l--) { const xe = X(edge[l]); ctx.lineTo(xe, py + phh - l * rh); ctx.lineTo(xe, py + phh - (l - 1) * rh); } ctx.lineTo(px, py + phh); ctx.closePath(); ctx.stroke(); }
      ctx.globalAlpha = .7; ctx.strokeStyle = col.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(px, py + phh - P.H * rh); ctx.lineTo(px + pw, py + phh - P.H * rh); ctx.stroke(); ctx.setLineDash([]);
      const small = pw < 300, fs = small ? 10.5 : 11.5;
      text('settles in time', px + 8, Yc(2) + 4, { px: fs + .5, wt: 600, c: col.teal }); text('swings', px + pw - 8, Yc(1) + 4, { px: fs + .5, wt: 600, c: col.coral, al: 'right' });
      text('arrives late', px + 8, Yc(6) + 4, { px: fs + .5, wt: 600, c: col.muted }); text(`deadline: ${P.H} reviews`, px + pw - 6, py + phh - P.H * rh - 5, { px: fs - .5, c: col.ink, al: 'right', a: .8 });
      for (let l = 1; l <= LMAX; l++) text(String(l), px - 8, Yc(l) + 4, { px: fs, al: 'right', c: Math.round(Lc) === l ? col.gold : col.faint });
      [10, 30, 100, 300, 1000].forEach(n => text(String(n), X(n), py + phh + 14, { px: fs, al: 'center', c: col.faint }));
      text('voters', px + pw, py + phh + 27, { px: fs, al: 'right', a: 1 - des }); text('records that share a term', px + pw, py + phh + 27, { px: fs, al: 'right', a: des });
      text('layers', Mp.x, Mp.y + 11, { px: fs, a: 1 - des }); text('levels of nesting', Mp.x, Mp.y + 11, { px: fs, a: des });
      const dx = X(clamp(Nc, NMIN, NMAX)), dy = Yc(Lc);
      ctx.globalAlpha = .4; ctx.strokeStyle = col.gold; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx, py + phh); ctx.moveTo(dx, dy); ctx.lineTo(px, dy); ctx.stroke();
      ctx.globalAlpha = .25; ctx.fillStyle = col.gold; ctx.beginPath(); ctx.arc(dx, dy, 11, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(dx, dy, 5, 0, TAU); ctx.fill();
      geo = { px, pw, py, phh, rh, cx, cy, my, dx, dy };
    });
    let geo = null;
    const pick = e => { if (!geo) return false; const b = S.cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; if (x < geo.px - 4 || x > geo.px + geo.pw + 4 || y < geo.py - 4 || y > geo.py + geo.phh + 4) return false; { const l = Math.ceil(clamp((geo.py + geo.phh - y) / geo.rh, .01, LMAX)); set(offEdge(Math.exp(Math.log(NMIN) + clamp((x - geo.px) / geo.pw) * (Math.log(NMAX) - Math.log(NMIN))), l), l); } byHand(); return true; };
    const offEdge = (n, l) => { const e = edge[clamp(Math.round(l), 1, LMAX)]; return Math.abs(n - e) < e * .08 ? (n < e ? e * .9 : e * 1.1) : n; };   // a pick never lands on a boundary, where the map and the trace would disagree for a while
    S.cv.addEventListener('pointerdown', e => { if (pick(e)) { drag = true; try { S.cv.setPointerCapture(e.pointerId); } catch (_) { } e.preventDefault(); } });
    S.cv.addEventListener('pointermove', e => { if (drag) pick(e); else if (geo) { const b = S.cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; S.cv.style.cursor = x >= geo.px && x <= geo.px + geo.pw && y >= geo.py && y <= geo.py + geo.phh ? 'crosshair' : ''; } });
    ['pointerup', 'pointercancel'].forEach(t => S.cv.addEventListener(t, () => { drag = false; }));
    root.querySelector('.egp-bar').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.dn) { const i = NS_LIST.reduce((best, v, k) => Math.abs(v - N) < Math.abs(NS_LIST[best] - N) ? k : best, 0); set(NS_LIST[clamp(i + +b.dataset.dn, 0, NS_LIST.length - 1)], L); }
      else if (b.dataset.dl) set(N, L + +b.dataset.dl);
      else { send(true); if (MO.off) settle(); }
      byHand();
    });
    verdict(); for (let i = 0; i < 3; i++) tickReview(); send(true);
    return {
      step(i) { const s = steps[i]; if (!s) return; const same = s.N === N && s.L === L && !!s.design === !!design; set(s.N, s.L, { design: s.design, win: s.win }); if (same) send(true); },
      destroy() { S.destroy(); root.remove(); },
      _state: () => ({ N, L, Nc: Math.exp(sN.v), Lc: sL.v, th: hist[0].th, shown: sTh.v, geo, count, fronts: fronts.length, lastArrival })
    };
  }

  /* ---------- further sections for the node's own page ---------- */
  const slider = (label, min, max, step, value) => `<label class="egp-range"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}"><output></output></label>`;
  function section(host, html, build) {
    const root = document.createElement('div'); root.className = 'egp egp-sec'; host.appendChild(root);
    root.innerHTML = `<div class="egp-stage"></div><div class="egp-bar">${html}<p class="egp-say" aria-live="polite"></p></div>`;
    const api = build(root, root.querySelector('.egp-stage'), root.querySelector('.egp-say'), [...root.querySelectorAll('input')], [...root.querySelectorAll('output')]);
    return { destroy() { api.destroy(); root.remove(); } };
  }
  const logN = v => odd(Math.exp(v));

  function voteSection(host) {                        // why a larger vote overshoots: the same lean, counted among more voters
    return section(host, slider('voters', Math.log(3).toFixed(3), Math.log(1001).toFixed(3), .01, Math.log(51).toFixed(3)), (root, stage, say, [inN], [outN]) => {
      const sN = spring(Math.log(51)), sE = spring(.25); let e = .25, clock = 9, now = [], was = [], verdicts = [], geo = null, down = false;
      const vote = n => { const p = (1 + Math.tanh(P.beta * e)) / 2; let yes = 0; was = now; now = Array.from({ length: n }, () => { const v = Math.random() < p; yes += v; return v; }); verdicts.unshift(yes > n / 2); verdicts.length = Math.min(verdicts.length, 30); clock = 0; };
      const S = surface(stage, (ctx, dt, W, H) => {
        const { col, text } = S; sN.step(dt); sE.step(dt); clock += dt;
        const n = logN(sN.v), wide = W >= 620; if (now.length !== n || (!MO.off && clock > .62)) vote(n);
        const px = 46, py = 26, bw = wide ? Math.min(330, W * .34) : W - px - 18, pw = wide ? W - px - 44 - bw : W - px - 18, ph = wide ? H - py - 40 : (H - py - 40) * .5, X = v => px + pw * (v + .6) / 1.2, Y = v => py + ph * (1 - v) / 2;
        ctx.globalAlpha = .3; ctx.strokeStyle = col.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, Y(0)); ctx.lineTo(px + pw, Y(0)); ctx.moveTo(X(0), py); ctx.lineTo(X(0), py + ph); ctx.stroke();
        const curve = (f, c, a, lw) => { ctx.globalAlpha = a; ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const v = -.6 + 1.2 * i / 120, y = Y(f(v)); i ? ctx.lineTo(X(v), y) : ctx.moveTo(X(v), y); } ctx.stroke(); };
        curve(v => Math.tanh(P.beta * v), col.muted, .7, 1.4); [9, 51, 301].forEach(k => k !== n && curve(v => majority(k, Math.tanh(P.beta * v)), col.line, .22, 1));
        curve(v => majority(n, Math.tanh(P.beta * v)), col.line, 1, 2.4);
        const ev = sE.v, one = Math.tanh(P.beta * ev), grp = majority(n, one);
        ctx.globalAlpha = .5; ctx.strokeStyle = col.gold; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(X(ev), py); ctx.lineTo(X(ev), py + ph); ctx.stroke(); ctx.setLineDash([]);
        [[one, col.muted], [grp, col.gold]].forEach(([v, c]) => { ctx.globalAlpha = 1; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X(ev), Y(v), 5, 0, TAU); ctx.fill(); });
        text('the group corrects upward', X(0) - 8, py + 12, { px: 11.5, al: 'right' }); text('downward', X(0) + 8, py + ph - 6, { px: 11.5 });
        text('outcome below what was expected', px, py + ph + 18, { px: 11.5, c: col.faint }); text('above', px + pw, py + ph + 18, { px: 11.5, c: col.faint, al: 'right' });
        text('one voter', X(.6) - 4, Y(Math.tanh(P.beta * .6)) + 16, { px: 11.5, al: 'right', halo: 3 }); text(plural(n, 'voter'), X(.6), py - 8, { px: 12, wt: 600, c: col.line, al: 'right' });
        /* one vote after another: every ballot, and the verdicts they add up to */
        const bx = wide ? px + pw + 36 : px, by = wide ? py + 22 : py + ph + 52, bH = (wide ? ph : H - by - 8) - 62, cols = Math.max(1, Math.ceil(Math.sqrt(n * bw / bH))), cell = Math.min(bw / cols, bH / Math.ceil(n / cols)), r = clamp(cell * .36, .9, 7), t = clamp(clock / .22);
        text(`${plural(n, 'ballot')}, cast again and again; gold backs the correction`, bx, by - 10, { px: 11.5 });
        for (let i = 0; i < n; i++) { const x = bx + (i % cols + .5) * cell, y = by + (Math.floor(i / cols) + .5) * cell, g = mix(was[i] ? 1 : 0, now[i] ? 1 : 0, t); ctx.globalAlpha = .3; ctx.fillStyle = col.faint; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); if (g > .01) { ctx.globalAlpha = .95 * g; ctx.fillStyle = col.gold; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
        const vy = by + bH + 30, vs = Math.min(11, bw / 30); text('the verdicts so far', bx, vy - 12, { px: 11.5 });
        verdicts.forEach((v, i) => { ctx.globalAlpha = i ? .9 : .9 * t; ctx.fillStyle = v ? col.gold : col.faint; ctx.beginPath(); ctx.arc(bx + 5 + (i ? i - (1 - t) : 0) * vs, vy + 4, i ? 3.4 : 3.4 + 2 * (1 - t), 0, TAU); ctx.fill(); });
        geo = { px, pw, py, ph };
        const pc = v => Math.round(50 * (1 + v)), msg = `With the outcome this far ${ev >= 0 ? 'above' : 'below'} what was expected, one voter backs a correction ${pc(Math.abs(one))} times in 100. A majority of ${n} backs it ${pc(Math.abs(grp))} times in 100.`;
        if (say.textContent !== msg) say.textContent = msg; outN.textContent = n;
      });
      const move = ev => { if (!geo) return; const b = S.cv.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top; if (x < geo.px || x > geo.px + geo.pw || y > geo.py + geo.ph + 22) return; e = clamp(((x - geo.px) / geo.pw) * 1.2 - .6, -.6, .6); sE.to(e); };
      const up = () => { down = false; };
      S.cv.style.cursor = 'ew-resize';
      S.cv.addEventListener('pointerdown', ev => { down = true; move(ev); }); S.cv.addEventListener('pointermove', ev => { if (down || ev.pointerType === 'mouse') move(ev); }); window.addEventListener('pointerup', up);
      inN.addEventListener('input', () => sN.to(+inN.value));
      return { destroy() { window.removeEventListener('pointerup', up); S.destroy(); } };
    });
  }

  function discSection(host) {                        // where the swing begins: the factor leaves the circle
    return section(host, slider('voters', Math.log(3).toFixed(3), Math.log(1001).toFixed(3), .01, Math.log(201).toFixed(3)) + slider('time between reviews', .2, 3, .01, 1), (root, stage, say, [inN, inT], [outN, outT]) => {
      const sN = spring(Math.log(201)), sT = spring(1); let clock = 0;
      const S = surface(stage, (ctx, dt, W, H) => {
        const { col, text } = S; sN.step(dt); sT.step(dt); if (!MO.off) clock += dt;
        const n = logN(sN.v), T = sT.v, K = Kflat(n), [z1, z2] = multipliers(K, T), wide = W >= 620;
        const dw = wide ? W * .62 : W, dh = wide ? H : H * .62, u = Math.min((dw - 30) / 4.1, (dh - 92) / 2), ox = 16 + 2.72 * u, oy = Math.max(30 + u, dh / 2 - 18), X = z => ox + z * u, rail = oy + u + 34;
        ctx.globalAlpha = .08; ctx.fillStyle = col.coral; ctx.fillRect(X(-2.65), oy - u, X(-1) - X(-2.65), 2 * u);
        ctx.globalAlpha = .1; ctx.fillStyle = col.teal; ctx.beginPath(); ctx.arc(ox, oy, u, 0, TAU); ctx.fill();
        ctx.globalAlpha = .85; ctx.strokeStyle = col.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ox, oy, u, 0, TAU); ctx.stroke();
        ctx.globalAlpha = .35; ctx.strokeStyle = col.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(-2.65), oy); ctx.lineTo(X(1.3), oy); ctx.stroke();
        [-2, -1, 0, 1].forEach(v => { ctx.globalAlpha = .5; ctx.strokeStyle = col.muted; ctx.beginPath(); ctx.moveTo(X(v), oy - 4); ctx.lineTo(X(v), oy + 4); ctx.stroke(); text(String(v).replace('-', '−'), X(v) + (v === 1 ? -9 : v === -1 ? 11 : 0), oy + 19, { px: 11, al: 'center', c: col.muted, halo: 3 }); });
        text('inside, corrections shrink', ox, oy - u * .5, { px: 12, al: 'center', c: col.teal }); text('outside, they grow', X(-1.85), oy - u * .5, { px: 12, al: 'center', c: col.coral });
        /* a rail of group sizes under the disc: where the factor sits for each */
        ctx.globalAlpha = .5; ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(Math.max(-2.65, multipliers(Kflat(1001), T)[0])), rail); ctx.lineTo(X(multipliers(Kflat(3), T)[0]), rail); ctx.stroke();
        let lastX = 1e9; [3, 51, 151, 301, 501, 1001].forEach(k => { const z = multipliers(Kflat(k), T)[0], x = X(z); if (z < -2.6 || lastX - x < 26) return; lastX = x; ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(x, rail - 4); ctx.lineTo(x, rail + 4); ctx.stroke(); text(String(k), x, rail + 18, { px: 10.5, al: 'center', c: col.line }); });
        text('voters', X(multipliers(Kflat(3), T)[0]) + 12, rail + 4, { px: 10.5, c: col.line });
        const out = z1 <= -1, zx = X(Math.max(-2.62, z1));
        ctx.globalAlpha = .45; ctx.strokeStyle = out ? col.coral : col.gold; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(zx, oy); ctx.lineTo(zx, rail); ctx.stroke(); ctx.setLineDash([]);
        ctx.globalAlpha = .3; ctx.fillStyle = out ? col.coral : col.gold; ctx.beginPath(); ctx.arc(zx, oy, 13, 0, TAU); ctx.fill();
        ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(zx, oy, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(zx, rail, 3.5, 0, TAU); ctx.fill(); ctx.fillStyle = col.muted; ctx.beginPath(); ctx.arc(X(z2), oy, 4.5, 0, TAU); ctx.fill();
        /* the mandate after one disturbance, drawn review by review */
        const tx = wide ? dw + 14 : 16, ty = wide ? 44 : dh + 14, tw = W - tx - 20, th = (wide ? H - 30 : H - dh) - 44, mid = ty + th / 2, s = { x: .1, th: .15 }, sp = tw / 27, tr = [], upTo = (clock * 5) % 36;
        for (let k = 0; k < 28; k++) { tr.push(mid - clamp(s.th, -.24, .24) / .24 * (th / 2 - 4)); review(s, m => majority(n, m), T); }
        text('the mandate after one disturbance, review by review', tx, ty - 14, { px: 11.5 });
        ctx.globalAlpha = .3; ctx.strokeStyle = col.muted; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(tx, mid); ctx.lineTo(tx + tw, mid); ctx.stroke(); ctx.setLineDash([]);
        const tc = out ? col.coral : col.teal; ctx.lineJoin = 'round'; ctx.strokeStyle = tc; ctx.lineWidth = 1.2; ctx.globalAlpha = .3; ctx.beginPath(); tr.forEach((y, k) => k ? ctx.lineTo(tx + k * sp, y) : ctx.moveTo(tx, y)); ctx.stroke();
        const head = MO.off ? 27 : Math.min(27, upTo), k0 = Math.floor(head), hy = k0 >= 27 ? tr[27] : mix(tr[k0], tr[k0 + 1], head - k0);
        ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.beginPath(); for (let k = 0; k <= k0; k++) k ? ctx.lineTo(tx + k * sp, tr[k]) : ctx.moveTo(tx, tr[0]); ctx.lineTo(tx + head * sp, hy); ctx.stroke();
        ctx.fillStyle = '#fff6ee'; ctx.beginPath(); ctx.arc(tx + head * sp, hy, 3.6, 0, TAU); ctx.fill();
        const nc = firstUnstable(1, T), tt = +T.toFixed(1), msg = `With reviews ${tt === 1 ? 'one settling time' : tt + ' settling times'} apart - the time the system takes to settle under a held mandate - the swing begins at ${nc} voters, so these ${n} ${n < nc ? 'settle' : 'swing'}. A longer wait between reviews allows a larger group.`;
        if (say.textContent !== msg) say.textContent = msg; outN.textContent = n; outT.textContent = T.toFixed(1);
      });
      inN.addEventListener('input', () => sN.to(+inN.value)); inT.addEventListener('input', () => sT.to(+inT.value));
      return S;
    });
  }

  function layerSection(host) {                       // what a layer costs: a review at each, a fifth of the change at each handover
    return section(host, slider('layers', 1, 8, 1, 4) + slider('reviews allowed', 2, 8, 1, P.H), (root, stage, say, [inL, inH], [outL, outH]) => {
      const sL = spring(4), sH = spring(P.H); let clock = 0;
      const S = surface(stage, (ctx, dt, W, H) => {
        const { col, text } = S; sL.step(dt); sH.step(dt); if (!MO.off) clock += dt;
        const Lc = clamp(sL.v, 1, 8), L = Math.round(sL.g), Hd = Math.round(sH.g), px = 28, pw = W - 2 * px, pitch = Math.min(150, pw / Math.max(Lc, 3.2)), bw = pitch - 14, top = 40, bh = clamp(H * .26, 62, 120), bx = k => px + (pw - pitch * Lc) / 2 + (k - 1) * pitch + 7;
        text('one change, review by review', px, 22, { px: 11.5 });
        for (let k = 1; k <= 8; k++) {                 // the layers, left to right: where the change is at review k and how much of it is left
          const a = clamp(Lc - k + 1); if (a <= .01) continue; const x = bx(k), late = k > sH.v + .5, size = Math.pow(P.a, k - 1);
          ctx.globalAlpha = .16 * a; ctx.fillStyle = late ? col.faint : col.line; ctx.fillRect(x, top, bw, bh);
          ctx.globalAlpha = .75 * a; ctx.strokeStyle = late ? col.faint : col.line; ctx.lineWidth = 1; ctx.strokeRect(x + .5, top + .5, bw - 1, bh - 1);
          ctx.globalAlpha = .34 * a; ctx.fillStyle = late ? col.faint : col.gold; ctx.fillRect(x + 5, top + bh - 5 - (bh - 10) * size, bw - 10, (bh - 10) * size);
          text('review ' + k, x + bw / 2, top + bh + 17, { px: 11, al: 'center', c: late ? col.faint : col.muted, a }); if (bw > 58) text(Math.round(100 * size) + ' in 100', x + bw / 2, top + bh - 10, { px: 10.5, al: 'center', c: col.ink, a: a * .85 });
          text(k === 1 ? 'voters' : k === L ? 'mandate' : '', x + bw / 2, top - 7, { px: 10.5, al: 'center', c: col.ink, a: a * .8 });
        }
        const dl = bx(sH.v + 1) - 7; if (sH.v < Lc - .02) { ctx.globalAlpha = .8; ctx.strokeStyle = col.ink; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(dl, top - 14); ctx.lineTo(dl, top + bh + 24); ctx.stroke(); ctx.setLineDash([]); text('deadline', dl + 6, top + bh + 34, { px: 11, c: col.ink }); }
        const beat = (clock / .62) % (L + 2.2), at = Math.min(L - 1, beat), k0 = Math.floor(at), f = smooth(clamp((at - k0 - .35) / .6)), gx = bx(1) + bw / 2 + (k0 + f) * pitch, gs = Math.pow(P.a, k0 + f);
        ctx.globalAlpha = clamp(beat * 4) * clamp((L + 2.2 - beat) * 3) * (MO.off ? 0 : 1); ctx.fillStyle = col.gold; ctx.beginPath(); ctx.arc(gx, top + bh / 2 - 6, 4 + 11 * gs, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        /* the effort it takes to move the mandate through that many layers */
        const cy0 = top + bh + 62, ch = H - cy0 - 34, cw = Math.min(pw, 760), cx0 = px + (pw - cw) / 2, bar = cw / 8, max = Math.pow(P.a, -14);
        text('effort needed to move the mandate as far as one direct vote does', cx0, cy0 - 12, { px: 11.5 });
        for (let l = 1; l <= 8; l++) {
          const v = Math.pow(P.a, -2 * (l - 1)), h = Math.max(3, ch * v / max), x = cx0 + (l - 1) * bar + 6, late = l > Hd, on = 1 - clamp(Math.abs(Lc - l));
          ctx.globalAlpha = late ? .22 : .32 + .6 * on; ctx.fillStyle = late ? col.faint : on > .5 ? col.gold : col.line; ctx.fillRect(x, cy0 + ch - h, bar - 12, h);
          if (late) { ctx.globalAlpha = .7; ctx.strokeStyle = col.coral; ctx.setLineDash([3, 3]); ctx.strokeRect(x + .5, cy0 + .5, bar - 13, ch - 1); ctx.setLineDash([]); }
          text(late ? 'too late' : '×' + (v < 10 ? v.toFixed(1) : Math.round(v)), x + (bar - 12) / 2, late ? cy0 + ch / 2 : cy0 + ch - h - 6, { px: 11, al: 'center', c: late ? col.coral : on > .5 ? col.gold : col.muted });
          text(plural(l, 'layer'), x + (bar - 12) / 2, cy0 + ch + 16, { px: bar > 70 ? 11 : 10, al: 'center', c: on > .5 ? col.ink : col.faint });
        }
        const eff = Math.pow(P.a, -2 * (L - 1)), msg = `Through ${plural(L, 'layer')} a change reaches the mandate at review ${L}, at ${Math.round(100 * Math.pow(P.a, L - 1))} parts in 100 of its size. ` + (L > Hd ? `Only ${Hd} reviews are allowed, so no effort delivers it in time.` : L === 1 ? 'Nothing is lost, and nothing steadies the vote.' : `Moving the mandate as far as one direct vote does takes ${eff < 10 ? eff.toFixed(1) : Math.round(eff)} times the effort.`);
        if (say.textContent !== msg) say.textContent = msg; outL.textContent = L; outH.textContent = Hd;
      });
      inL.addEventListener('input', () => sL.to(+inL.value)); inH.addEventListener('input', () => sH.to(+inH.value));
      return S;
    });
  }

  /* ---------- the node ---------- */
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.phases = {
    title: 'The Phases of Hierarchy',
    line: 'What does a layer of hierarchy do to the feedback between a population and the system it steers?',
    text: 'Hierarchies appear wherever many parts steer one whole, and they are usually taken as a fixed fact of architecture. We ask instead what a layer does to a feedback loop. Suppose a population sets a <i>mandate</i> for a larger system and revises it whenever the outcome departs from what was expected. A larger population gives a sharper verdict, which is why large groups judge well, and in a loop that sharpness is overcorrection. Layers weaken the verdict until the loop settles, though each also delays a genuine change. Depth therefore has three phases, which the paper calls unstable, modular and inertial, and EigenEngine nests its records in the second.',
    tag: 'Pre-pre-print · an early example',
    pdf: '/assets/docs/the-phases-of-hierarchy.pdf',
    art,
    exhibit: { steps: steps.map(({ label, caption }) => ({ label, caption })), mount },
    sections: [
      { title: 'Why does a larger group overshoot?', line: 'A slight lean in each voter becomes a near-certain verdict once enough voters are counted. These are the statistics that make a jury reliable, and in a feedback loop they act as a gain which grows with the square root of the number of voters.', mount: voteSection },
      { title: 'Where does the swing begin?', line: 'Each review multiplies a disturbance by a fixed factor, and once the collective response is strong enough every correction reverses the last and outgrows it. A rule that is sensible for each voter has become pathological in the sum, which the paper names the ultraepistemic catastrophe. A longer wait between reviews lets the system settle and admits a larger group.', mount: discSection },
      { title: 'What does a layer cost?', line: 'Every layer hands on a fraction of a change and holds it for one review. The effort needed to move the top therefore grows geometrically with depth, and within a fixed number of reviews a deep enough hierarchy cannot be moved at all.', mount: layerSection }
    ],
    model
  };
})();
