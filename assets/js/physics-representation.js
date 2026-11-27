/* The figure at the top of the physics page: The Phases of Hierarchy steering The Cost of Complexity. Many parts on
   a ring steer one whole at the centre, directly at first and then through more and more layers, with their joint
   response computed by the Phases paper's own model (taken from its node). The whole they steer is a description,
   drawn as the register of the Cost card: it grows finer as the hierarchy deepens, the response moves it up and down,
   and its history runs out through the ring as the tape. One clock drives all of it. Mount: [data-rep-figure] holding an <svg>, a [data-rep-caption]
   and a [data-rep-motion] button. */
(() => {
  'use strict';
  const fig = document.querySelector('[data-rep-figure]'); if (!fig) return;
  const svg = fig.querySelector('svg'); if (!svg) return;
  const cap = fig.querySelector('[data-rep-caption]'), button = fig.querySelector('[data-rep-motion]');
  const M = window.EG_MOTION = window.EG_MOTION || { off: false, rate: 1 };
  const NS = 'http://www.w3.org/2000/svg', TAU = 2 * Math.PI;
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), smooth = x => x * x * (3 - 2 * x), mix = (a, b, t) => a + (b - a) * t;
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const dOf = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
  const lengthOf = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
  function cut(pts, d0, d1) {                                   // the piece of a polyline between two distances along it
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
  /* the register's curve: a Hilbert cell of a rank on a side x side grid, as on the Cost card */
  const hpt = (side, rank) => {
    let x = 0, y = 0;
    for (let size = 1; size < side; size *= 2) {
      const right = 1 & (rank >> 1), up = 1 & (rank ^ right);
      if (!up) { if (right) { x = size - 1 - x; y = size - 1 - y; } [x, y] = [y, x]; }
      x += size * right; y += size * up; rank >>= 2;
    }
    return [x, y];
  };
  function curve(vertices) {                                    // a polyline measured by arclength, skipping coincident vertices
    const points = [vertices[0]], distances = [0]; let length = 0;
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
  function wake(c, head, tail) {                                // the lit stretch between two arclength fractions, and its tip
    let left = Math.min(head.f, tail.f), right = Math.max(head.f, tail.f);
    if (Math.floor(head.t) !== Math.floor(tail.t)) { if (Math.floor(head.t) % 2 === 1) right = 1; else left = 0; }
    const a = atDistance(c, left * c.length), b = atDistance(c, right * c.length);
    return { d: dOf([a.point, ...c.points.slice(a.segment + 1, b.segment + 1), b.point]), tip: atDistance(c, head.f * c.length).point };
  }

  const hasModel = () => !!(((window.EIGEN_NODES || {}).phases || {}).model);
  const load = src => new Promise((ok, fail) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
  (hasModel() ? Promise.resolve() : load('/eigenengine/phases-of-hierarchy/node.js')).then(start, start);

  function start() {
    const model = hasModel() ? window.EIGEN_NODES.phases.model : null;   // the paper's model; without it the crowd still gathers, but the verdict is a plain relaxation
    const KICK = model ? model.P.kick : .15;
    /* ---- geometry: the ring of voters, the joint rings between them and the register, the register itself ---- */
    const CX = 376, CY = 232, R = 212, NL = 243, GAP = .95, RJ = [0, .85 * R, .7 * R, .55 * R, .44 * R];
    const SIDE = 120, HS = SIDE / 2 + 5, K = SIDE / 320, SCALE = 90, NT = 34, SP = 9, REV = .38, STEP = 8 * REV;
    const red = '#d98a7c', gold = '#b69961';
    const g = el('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);

    const leaves = Array.from({ length: NL }, (_, i) => {
      const at = k => Math.PI + GAP / 2 + k / NL * (TAU - GAP), a = at(i + .5);
      return { a, b: [0, 1, 2, 3, 4].map(j => { const size = 3 ** j, first = Math.floor(i / size) * size; return at(first + size / 2); }) };
    });
    const arc = r => { const a0 = Math.PI + GAP / 2, a1 = Math.PI - GAP / 2 + TAU, p = pol(CX, CY, r, a0), q = pol(CX, CY, r, a1); return `M${p[0].toFixed(1)} ${p[1].toFixed(1)}A${r} ${r} 0 1 1 ${q[0].toFixed(1)} ${q[1].toFixed(1)}`; };
    el('path', { d: RJ.slice(1).map(arc).join(''), stroke: red, 'stroke-width': .6, opacity: .2 }, g);
    el('path', { d: arc(R), stroke: red, 'stroke-width': 2.1, 'stroke-dasharray': `0.01 ${(R * (TAU - GAP) / NL).toFixed(3)}`, 'stroke-dashoffset': (-R * (TAU - GAP) / NL / 2).toFixed(3), opacity: .85 }, g);
    const guide = el('path', { stroke: red, 'stroke-width': .5, opacity: .14 }, g);
    const routes = el('path', { stroke: red, 'stroke-width': .62, opacity: .5 }, g), routesIn = el('path', { stroke: red, 'stroke-width': .62, opacity: .5 }, g);
    const fade = el('linearGradient', { id: 'rep-fade-' + Math.random().toString(36).slice(2), gradientUnits: 'userSpaceOnUse', x1: 6, y1: 0, x2: CX - SIDE / 2, y2: 0 }, svg);
    el('stop', { offset: 0, 'stop-color': '#f3b6a8', 'stop-opacity': 0 }, fade); el('stop', { offset: .3, 'stop-color': '#f3b6a8', 'stop-opacity': .7 }, fade); el('stop', { offset: 1, 'stop-color': '#fff1e8', 'stop-opacity': 1 }, fade);
    const tape = el('path', { stroke: `url(#${fade.id})`, 'stroke-width': 1.5 }, g);

    /* the register: the Cost card's curve, drawn at a quarter of its size and moved by the verdict */
    const reg = el('g', {}, g);
    const halo = el('circle', { cx: 0, cy: 0, fill: '#ff9c86', opacity: 0 }, reg);
    const regIn = el('g', { transform: `translate(${-SIDE / 2} ${-SIDE / 2}) scale(${K.toFixed(5)})` }, reg);
    el('path', { d: 'M0 0H320V320H0Z M160 0V320 M0 160H320', stroke: '#d9c48e', 'stroke-opacity': .28, 'stroke-width': (.9 / K).toFixed(2) }, regIn);
    const rguide = el('path', { stroke: '#e1bb72', 'stroke-width': (1.6 / K).toFixed(2), opacity: .22 }, regIn);
    const ink = el('path', { stroke: gold, 'stroke-width': (2 / K).toFixed(2) }, regIn);
    const tracer = el('g', { style: 'filter: drop-shadow(0 0 3px #ffd58b)' }, regIn);
    const trail = el('path', { stroke: '#ffe3a8', 'stroke-width': (4 / K).toFixed(2) }, tracer);
    const tip = el('circle', { r: (4 / K).toFixed(2), fill: '#fff9e9', stroke: '#f7ce7e', 'stroke-width': (1.3 / K).toFixed(2) }, tracer);
    const LEVELS = [2, 4, 8, 16].map(side => Array.from({ length: 256 }, (_, i) => { const [x, y] = hpt(side, Math.floor(i * side * side / 256)); return [(x + .5) * 320 / side, 320 - (y + .5) * 320 / side]; }));
    const SHAPES = LEVELS.map(curve);

    /* votes on their way in: short lights that follow the drawn routes */
    const glow = el('g', { style: 'filter: drop-shadow(0 0 3px #ff9c86)' }, g);
    const tracers = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(m => ({ leaf: leaves[13 + 27 * m], off: (m * 5 % 9) / 9, wake: el('path', { stroke: '#ffd9c9', 'stroke-width': 1.5 }, glow), tip: el('circle', { r: 1.9, fill: '#fff6ee' }, glow) }));

    const joints = (leaf, u) => { const pts = []; for (let j = 4; j >= 1; j--) pts.push(pol(CX, CY, RJ[j], mix(leaf.a, leaf.b[j], clamp(u - (4 - j))))); pts.push(pol(CX, CY, R, leaf.a)); return pts; };   // four joints and the voter; u in [0, 4] is how many layers are in use
    const edge = (jx, jy, ry) => { const dx = jx - CX, dy = jy - ry, t = HS / Math.max(Math.abs(dx), Math.abs(dy)); return [CX + dx * t, ry + dy * t]; };   // where a route meets the register, wherever the verdict has moved it
    function route(leaf, u, ry) { const pts = joints(leaf, u); pts.unshift(edge(pts[0][0], pts[0][1], ry)); return pts; }
    const outer = u => leaves.map(l => dOf(joints(l, u))).join('');
    const inner = (u, ry) => leaves.map(l => { const j = joints(l, u)[0], e = edge(j[0], j[1], ry); return 'M' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + 'L' + j[0].toFixed(1) + ' ' + j[1].toFixed(1); }).join('');
    guide.setAttribute('d', outer(4) + inner(4, CY));

    /* the joint response: the paper's review step, aggregated flat or through blocks that aggregate again */
    const seq = [0, 1, 2, 3, 4, 3, 2, 1];
    const st = { x: 0, th: 0 }, hist = Array(NT + 2).fill(0);
    let last = null, clock = 0, phase = 0, drawnU = -1, side = 1, shown = 0, vel = 0, bump = 0, u = 0, sw = 0, bm = 0;
    function respond(m) {
      if (!model) return m;
      const k = Math.min(3, Math.floor(u)), w = u - k, f = j => { let v = model.majority(3 ** (5 - j), m); for (let i = 0; i < j; i++) v = model.g3(v); return v; };
      return w > 0 ? mix(f(k), f(k + 1), w) : f(k);
    }
    function review() {
      if (model) return model.review(st, respond);
      const r = Math.exp(-1); st.x = r * st.x + (1 - r) * .4 * st.th; st.th += .35 * respond(Math.tanh(.6 * (st.x - 1.2 * st.th))); return st.th;
    }

    /* the register's light, and the level it is drawn at: the level follows the depth of the hierarchy */
    let travel = .43, painted = null, paintedGuide = -1, drawnL = -1, active = SHAPES[0];
    function drawRegister(dt) {
      const l = u * .75, from = Math.min(3, Math.floor(l)), to = Math.min(3, from + 1), e = smooth(l - from);
      if (Math.abs(l - drawnL) > 1e-4) {
        active = e <= 0 ? SHAPES[from] : e >= 1 ? SHAPES[to] : curve(LEVELS[from].map(([x, y], i) => [x + (LEVELS[to][i][0] - x) * e, y + (LEVELS[to][i][1] - y) * e]));
        if (active !== painted) { ink.setAttribute('d', active.d); painted = active; }
        if (from !== paintedGuide) { rguide.setAttribute('d', SHAPES[from].d); paintedGuide = from; }
        rguide.style.opacity = String(.1 + .14 * (1 - e)); drawnL = l;
      }
      const slow = 1 - .62 * smooth(clamp(u - 3));          // deep enough, and the light is nearly too slow to move
      travel += dt * 1000 * slow * Math.max(.000062, Math.min(.00019, .185 / active.length));
      const tailTime = travel - Math.min(.16, 108 / active.length);
      const w = wake(active, { t: travel, f: reflected(travel) }, { t: tailTime, f: reflected(tailTime) });
      trail.setAttribute('d', w.d); tip.setAttribute('cx', w.tip[0].toFixed(2)); tip.setAttribute('cy', w.tip[1].toFixed(2));
    }

    const WORDS = [
      'Many parts steer one whole, with nothing between them and it. The more parts there are, the sharper their joint response, and a sharp response to a small error overshoots.',
      'Layers between the parts and the whole. Each one damps the response and delays the correction by a step, and the description at the centre grows finer as the hierarchy deepens.',
      'Deep enough, the description is finely resolved and the whole is steady, and a correction can barely reach it in time.'];
    let said = -1;
    function tick(t) {
      const dt = last === null ? 0 : clamp(t - last, 0, .1); last = t;
      if (M.off && drawnU >= 0) return;
      clock += dt;
      const pos = clock / STEP, i = Math.floor(pos) % seq.length, e = smooth(clamp((pos - Math.floor(pos) - .23) / .6));
      u = seq[i] + (seq[(i + 1) % seq.length] - seq[i]) * e;
      if (Math.abs(u - drawnU) > 1e-4) { routes.setAttribute('d', outer(u)); drawnU = u; guide.setAttribute('opacity', (.05 + .1 * (1 - u / 4)).toFixed(3)); }
      phase += dt / REV;
      while (phase >= 1) {                                      // a review; when all is quiet a change arrives and disturbs the mandate
        phase -= 1;
        if (Math.max(Math.abs(hist[0]), Math.abs(hist[1]), Math.abs(hist[2])) < .014) { st.th += KICK * side; side = -side; bump = 1; }
        hist.unshift(review()); hist.length = NT + 2;
      }
      for (let h = dt; h > 0; h -= .008) { const q = Math.min(.008, h); vel += (324 * (hist[0] - shown) - 36 * vel) * q; shown += vel * q; } bump *= Math.exp(-dt * 3);
      const y = v => CY - clamp(v, -.21, .21) * SCALE, ry = y(shown);
      reg.setAttribute('transform', `translate(${CX} ${ry.toFixed(2)})`); routesIn.setAttribute('d', inner(u, ry));
      const x0 = CX - SIDE / 2 - 6, pts = [[x0, ry]];
      for (let k = 1; k <= NT; k++) pts.push([x0 - (k - 1 + phase) * SP, y(hist[k])]);
      tape.setAttribute('d', dOf(pts));
      sw += (Math.min(1, Math.abs(hist[0] - hist[1]) / .3) - sw) * Math.min(1, dt * 5); bm += (bump - bm) * Math.min(1, dt * 7);
      halo.setAttribute('r', (SIDE * .6 + 10 * sw + 6 * bm).toFixed(2)); halo.setAttribute('opacity', (.04 + .15 * sw + .1 * bm).toFixed(3));
      tracers.forEach(tr => {
        const p = route(tr.leaf, u, ry).reverse(), len = lengthOf(p), q = ((clock / 3.6 + tr.off) % 1), head = q * (len + 30), a = Math.sin(Math.PI * q) ** .6;
        const w = cut(p, Math.max(0, head - 30), Math.min(len, head));
        tr.wake.setAttribute('d', w.length ? dOf(w) : ''); tr.wake.setAttribute('opacity', (.85 * a).toFixed(3));
        const tipAt = w.length ? w[w.length - 1] : p[0]; tr.tip.setAttribute('cx', tipAt[0].toFixed(2)); tr.tip.setAttribute('cy', tipAt[1].toFixed(2)); tr.tip.setAttribute('opacity', (head <= len ? a : 0).toFixed(3));
      });
      drawRegister(dt);
      const say = u < .5 ? 0 : u < 3.5 ? 1 : 2;
      if (cap && say !== said) { cap.textContent = WORDS[say]; said = say; }
    }
    tick(0);
    fig._rep = { state: () => ({ u, shown, level: u * .75 }) };   // for checking the figure from the console

    /* run while on screen; the page's own control pauses it */
    let tt = 0, lastNow = null, handle = null, visible = !('IntersectionObserver' in window), paused = false;
    const frame = now => { tt += lastNow === null ? 0 : Math.min(.1, (now - lastNow) / 1000); lastNow = now; tick(tt); handle = requestAnimationFrame(frame); };
    function update() {
      const running = visible && !paused && !M.off && !document.hidden;
      if (running && handle === null) { lastNow = null; handle = requestAnimationFrame(frame); }
      if (!running && handle !== null) { cancelAnimationFrame(handle); handle = null; }
      if (button) { button.hidden = false; const off = paused || M.off; button.textContent = off ? 'Resume the figure' : 'Pause the figure'; button.setAttribute('aria-pressed', String(off)); }
    }
    if (button) button.addEventListener('click', () => { paused = !(paused || M.off); M.off = false; update(); });
    document.addEventListener('visibilitychange', update);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries.some(en => en.isIntersecting); update(); }).observe(fig);
    update();
  }
})();
