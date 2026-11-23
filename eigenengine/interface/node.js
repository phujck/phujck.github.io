/* The node "How does a person work on it?" (id `interface`), written to dispatch/CONTRACT.md.
   One object is shown in two forms: the manuscript an author reads, and the linked records an agent works on.
   A change made in either form is seen to arrive in the other. Colours come from the shared tokens only. */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const EM = window.EigenMotion, M = window.EG_MOTION || (EM && EM.M) || { off: false };
  const sv = (tag, cls, attrs, parent) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const h = (tag, cls, html, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const cubic = (p, a, b, q, t) => { const u = 1 - t; return u * u * u * p + 3 * u * u * t * a + 3 * u * t * t * b + t * t * t * q; };
  const MEDIA = '/demo/writing/media/';

  /* ------------------------------------------------------------------------------------------------------------
     The card art: a page of lines on the left, records on the right, and one tracer that writes a line, crosses to
     its record, passes through the links and returns to another line. No text. The loop closes on itself. */
  function art(svg) {
    const g = sv('g', 'egi-art', {}, svg);
    const LINES = [[46, 32, 92], [46, 50, 84], [46, 68, 96], [46, 86, 58], [46, 104, 90], [46, 122, 96], [46, 140, 66]];   // x, y, length
    const RECS = [[236, 20], [322, 42], [254, 76], [334, 98], [244, 128]], RW = 46, RH = 22;                                 // x, y of the top left
    sv('rect', 'egi-a-page', { x: 30, y: 12, width: 128, height: 146, rx: 8 }, g);
    const mid = i => [RECS[i][0], RECS[i][1] + RH / 2], ctr = i => [RECS[i][0] + RW / 2, RECS[i][1] + RH / 2];
    const still = [[0, 2], [2, 3]].map(([a, b]) => sv('path', 'egi-a-link', { d: `M${ctr(a)}L${ctr(b)}` }, g));
    const live = [[0, 1], [1, 3], [3, 4]].map(([a, b]) => sv('path', 'egi-a-link', { d: `M${ctr(a)}L${ctr(b)}` }, g));
    const thread = (li, ri) => { const [x, y, l] = LINES[li], [rx, ry] = mid(ri), x0 = x + l + 6, c = (rx - x0) * .5; return [[x0, y], [x0 + c, y], [rx - c, ry], [rx, ry]]; };
    const T = [thread(1, 0), thread(3, 2), thread(5, 4)];
    const tEl = T.map(b => sv('path', 'egi-a-thread', { d: `M${b[0]}C${b[1]} ${b[2]} ${b[3]}` }, g));
    const lEl = LINES.map(([x, y, l]) => sv('path', 'egi-a-line', { d: `M${x} ${y}h${l}` }, g));
    const rEl = RECS.map(([x, y]) => { const r = sv('g', 'egi-a-rec', {}, g); sv('rect', '', { x, y, width: RW, height: RH, rx: 5 }, r); sv('path', '', { d: `M${x + 8} ${y + 8}h14M${x + 8} ${y + 15}h26` }, r); return r; });
    const wake = [sv('path', 'egi-a-wake w3', {}, g), sv('path', 'egi-a-wake w2', {}, g), sv('path', 'egi-a-wake w1', {}, g)], tip = sv('circle', 'egi-a-tip', { r: 3.4 }, g);

    /* The closed route, sampled once. Marks record where along it each line and record is passed. */
    const pts = [], marks = {}; let len = 0;
    const push = (x, y) => { if (pts.length) { const p = pts[pts.length - 1]; len += Math.hypot(x - p[0], y - p[1]); } pts.push([x, y, len]); };
    const seg = (a, b, n = 14) => { for (let i = 1; i <= n; i++) push(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n); };
    const bez = (b, n = 22, back) => { for (let i = 1; i <= n; i++) { const t = back ? 1 - i / n : i / n; push(cubic(b[0][0], b[1][0], b[2][0], b[3][0], t), cubic(b[0][1], b[1][1], b[2][1], b[3][1], t)); } };
    const L1 = LINES[1], L5 = LINES[5];
    push(L1[0], L1[1]); marks.l1 = len; seg([L1[0], L1[1]], [L1[0] + L1[2] + 6, L1[1]]); bez(T[0]); marks.r0 = len;
    seg(mid(0), ctr(0), 6); seg(ctr(0), ctr(1)); marks.r1 = len; seg(ctr(1), ctr(3)); marks.r3 = len; seg(ctr(3), ctr(4)); marks.r4 = len; seg(ctr(4), mid(4), 6);
    bez(T[2], 22, true); marks.l5 = len; seg([L5[0] + L5[2] + 6, L5[1]], [L5[0], L5[1]]); seg([L5[0], L5[1]], [38, L5[1]], 4); seg([38, L5[1]], [38, L1[1]], 18); seg([38, L1[1]], [L1[0], L1[1]], 4);
    const at = d => { d = ((d % len) + len) % len; let lo = 0, hi = pts.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (pts[m][2] <= d) lo = m; else hi = m; } const a = pts[lo], b = pts[hi], f = (d - a[2]) / Math.max(1e-6, b[2] - a[2]); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
    const since = (d, m) => (((d - m) % len) + len) % len / len;                    // how long ago the tracer passed mark m, as a fraction of the loop
    const lit = x => x < .012 ? x / .012 : Math.max(0, 1 - (x - .012) / .3);         // quick rise, slow fall
    const PERIOD = 10;
    return {
      tick(t) {
        const d = (t / PERIOD % 1) * len, p = at(d);
        tip.setAttribute('cx', p[0].toFixed(1)); tip.setAttribute('cy', p[1].toFixed(1));
        wake.forEach((w, k) => { const n = 5 + k * 4, span = 16 + k * 20; let s = ''; for (let i = 0; i <= n; i++) { const q = at(d - span * i / n); s += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); } w.setAttribute('d', s); });
        const gl = { l1: lit(since(d, marks.l1 + 40)), l5: lit(since(d, marks.l5 + 40)), r0: lit(since(d, marks.r0)), r1: lit(since(d, marks.r1)), r3: lit(since(d, marks.r3)), r4: lit(since(d, marks.r4)) };
        /* the written line grows; a moment later its record brightens, and on the way back the record leads the line */
        lEl[1].setAttribute('d', `M${L1[0]} ${L1[1]}h${(L1[2] - 14 + 14 * smooth(since(d, marks.l1) * 9)).toFixed(1)}`);
        lEl[5].setAttribute('d', `M${L5[0]} ${L5[1]}h${(L5[2] - 16 + 16 * smooth(since(d, marks.l5) * 9)).toFixed(1)}`);
        lEl[1].style.opacity = (.55 + .45 * gl.l1).toFixed(2); lEl[5].style.opacity = (.55 + .45 * gl.l5).toFixed(2);
        [['r0', 0], ['r1', 1], ['r3', 3], ['r4', 4]].forEach(([k, i]) => rEl[i].style.setProperty('--lit', gl[k].toFixed(2)));
        rEl[2].style.setProperty('--lit', (.5 * Math.max(gl.r0, gl.r3)).toFixed(2));
        tEl[0].style.opacity = (.34 + .6 * gl.r0).toFixed(2); tEl[2].style.opacity = (.34 + .6 * gl.l5).toFixed(2); tEl[1].style.opacity = (.34 + .3 * Math.max(gl.r0, gl.r3)).toFixed(2);
        live.forEach((l, k) => l.style.opacity = (.4 + .6 * [gl.r1, gl.r3, gl.r4][k]).toFixed(2));
      },
      destroy() { g.remove(); }
    };
  }

  /* ------------------------------------------------------------------------------------------------------------
     The exhibit. The example is the staged edit shown in the interface's own screens: a sentence of
     The Cost of Complexity that leaves out the assumption which makes the cost of every round equal. */
  const PREMISE = {
    area: 'Each round divides every register into four, and we price a split by the area it divides.',
    wall: 'Each round divides every register into four, and we price a split by the length of wall it draws.'
  };
  const CLAIM = {
    base: 'The total cost of dividing the registers stays the same at every refinement depth.',
    agent: 'When division is priced by area, the total cost of dividing the registers stays the same at every refinement depth.',
    author: 'When the cost of a split is proportional to its area, the total cost of dividing the registers stays the same at every refinement depth.',
    doubles: 'When the cost of a split is proportional to its wall length, the total cost of dividing the registers doubles at every refinement depth.'
  };
  const REC_CLAIM = { base: 'the same at every depth', agent: 'the same at every depth, if priced by area', author: 'the same at every depth, if cost follows area', doubles: 'doubles at every depth, if cost follows wall' };
  const REC_PREMISE = { area: 'by the area it divides', wall: 'by the wall it draws' };
  const FAMILY = { base: 'area', agent: 'area', author: 'area', doubles: 'wall' };
  const RECORDS = [
    { id: 'premise', kind: 'Premise', title: 'Price of a split', at: [.22, .09], f: 1, rel: 'required by: Cost per round' },
    { id: 'step', kind: 'Step', title: 'Cost of a round', text: 'm<sup>α</sup> times the first', at: [.78, .25], f: 1, rel: 'required by: Cost per round' },
    { id: 'claim', kind: 'Claim', title: 'Cost per round', at: [.40, .54], f: 1.2, rel: 'requires: 2 · shown by: Figure 3' },
    { id: 'fig', kind: 'Figure', title: 'Figure 3', text: 'cost after each round', at: [.20, .93], f: 1, rel: 'computed by: Recorded run' },
    { id: 'run', kind: 'Recorded run', title: '85 splits', text: '4 by area, 15 by wall', at: [.80, .86], f: 1, rel: 'computes: Figure 3' }
  ];
  const LINKS = [['claim', 'premise', 'requires'], ['claim', 'step', 'requires'], ['claim', 'fig', 'shown by'], ['fig', 'run', 'computed by']];
  const START = { premise: 'area', claim: 'base', v: { premise: 2, step: 1, claim: 3, fig: 5, run: 1 }, proposal: null, review: [], last: 'none' };

  /* Every description exists at two levels (dispatch/CONTRACT.md, "Two levels"). With the site's level switch loaded
     a field prints both readings; without it the plain reading stands. */
  const two = (plain, expert) => window.EigenLevel ? window.EigenLevel.two(plain, expert) : Object.assign(new String(plain), { plain, expert });   // eslint-disable-line no-new-wrappers
  const steps = [
    { label: 'In the interface', caption: two('This is the interface during a revision of <i>The Cost of Complexity</i>. The author reads a manuscript, and a change proposed by the agent is marked in the sentence it would replace.',
      'The screen shows a sealed proposal, whose content and the revision it read are both fixed. It is drawn as a word-by-word difference against the sentence it would replace.') },
    { label: 'One object, two forms', caption: two('The same paragraph is held in two forms. On the left is the manuscript, as its author reads it, and on the right are the linked records on which an agent works.',
      'Each block of the manuscript is bound to one record, which carries a kind, a statement, a revision and its named relations. The manuscript shows only the order in which a reader meets them.') },
    { label: 'The agent proposes', caption: two('The agent changes the record of the claim, which travels to the manuscript as a marked change. It alters nothing until the author accepts it, rewords it or dismisses it.',
      'The proposal is written against revision 3 of the claim and changes nothing by itself. Were the claim to move first, the proposal would be out of date and could only be dismissed.') },
    { label: 'The author decides', caption: two('The author rewords the proposal before accepting it. The record takes the author’s wording, and both forms move to a new version together.',
      'The author’s wording replaces the proposed words before the decision is recorded. The claim then moves to revision 4, and its record takes the author’s statement.') },
    { label: 'The author rewrites', caption: two('An author’s own edit waits for no approval. The record of the premise changes at once, and every record that requires it is marked for review.',
      'The premise moves to revision 3 with no proposal, since an author’s writes are authoritative. Its dependants are found along <i>requires</i> and <i>shown by</i>, and each is marked for review.') },
    { label: 'Agreement again', caption: two('The agent proposes what the new premise implies, and the author accepts it. The figure now reads from the other curve of the same recorded run.',
      'With a split priced as \\(w^{\\gamma}\\), a round costs \\(m^{\\alpha}\\) times the first, where \\(\\alpha = 1 - \\gamma/2\\). Wall length has \\(\\gamma = 1\\), so each depth costs twice the last, and the figure is redrawn from that series of the same recorded run.') }
  ];

  function mount(el, opts = {}) {
    el.classList.add('egn-interface');
    const root = h('div', 'egi', '', el), onStep = opts.onStep;
    let W = 0, H = 0, tier = 'compact', S = JSON.parse(JSON.stringify(START)), view = 'shot', zoom = 0, sel = null, stepAt = -1, dead = false, raf = 0, last = 0, seq = [], pulses = [], visible = true;
    const emit = i => { stepAt = i; if (onStep) try { onStep(i); } catch (e) {} el.dispatchEvent(new CustomEvent('eg-step', { bubbles: true, detail: { node: 'interface', i } })); };

    /* ---- the pieces ---- */
    const shot = h('button', 'egi-shot', `<img class="egi-shot-a" src="${MEDIA}full-project.webp" alt="The interface during a revision of The Cost of Complexity: the outline, the manuscript and the conversation with the agent." draggable="false"><img class="egi-shot-b" src="${MEDIA}proposal-changes.webp" alt="A proposed rewording, marked in green inside the sentence it would replace, with Accept, Edit and Dismiss beside it." draggable="false">`, root);
    shot.type = 'button'; shot.setAttribute('aria-label', 'The interface during a revision. Press to look closer.');
    const shotNote = h('p', 'egi-shotnote', '', root), shotB = shot.querySelector('.egi-shot-b');
    const wires = sv('svg', 'egi-wires', { 'aria-hidden': 'true' }, root), gThreads = sv('g', '', {}, wires), gLinks = sv('g', '', {}, wires), gPulse = sv('g', '', {}, wires);
    const tagA = h('p', 'egi-tag egi-tag-a', 'The manuscript <span>as its author reads it</span>', root), tagB = h('p', 'egi-tag egi-tag-b', 'The records <span>as an agent works on them</span>', root);
    const sheet = h('div', 'egi-sheet', '', root);
    h('h4', '', 'What makes the cost constant?', sheet);
    const B = {};
    B.premise = h('p', 'egi-b', '', sheet); B.step = h('p', 'egi-b egi-eq', 'The cost of a round is then <i>m</i><sup>α</sup> times the cost of the first, where α = 1 − γ/2.', sheet); B.claim = h('p', 'egi-b', '', sheet);
    const acts = h('div', 'egi-acts', '<span class="egi-acts-note"></span><button type="button" data-do="accept">Accept</button><button type="button" data-do="edit">Edit</button><button type="button" data-do="dismiss">Dismiss</button>', sheet);
    B.fig = h('figure', 'egi-b egi-fig', '', sheet);
    const plot = sv('svg', 'egi-plot', { viewBox: '0 0 220 56', 'aria-hidden': 'true' }, B.fig); h('figcaption', '', '<b>Figure 3.</b> Total cost after each round, by area and by wall length.', B.fig);
    Object.keys(B).forEach(id => { B[id].dataset.id = id; B[id].tabIndex = 0; B[id].setAttribute('role', 'button'); h('span', 'egi-flag', 'needs review', B[id]); });
    const R = {};
    RECORDS.forEach(r => {
      const e = h('button', 'egi-rec', `<small>${r.kind}</small><strong>${r.title}</strong><span class="egi-rec-t">${r.text || ''}</span><span class="egi-rel">${r.rel}</span><em></em>`, root); e.type = 'button'; e.dataset.id = r.id;
      R[r.id] = { ...r, el: e, t: e.querySelector('.egi-rec-t'), st: e.querySelector('em'), x: new EM.Spring(0), y: new EM.Spring(0), o: new EM.Spring(0), s: new EM.Spring(.86), w: 0, hh: 0 };
    });
    const bar = h('div', 'egi-bar', '<button type="button" class="egi-go egi-go-author" data-do="author"></button><p class="egi-status" aria-live="polite"></p><button type="button" class="egi-go egi-go-agent" data-do="agent"></button><button type="button" class="egi-again" data-do="again">Start again</button>', root);
    const goAuthor = bar.querySelector('.egi-go-author'), goAgent = bar.querySelector('.egi-go-agent'), status = bar.querySelector('.egi-status');
    const threads = {}, links = [];
    ['premise', 'step', 'claim', 'fig'].forEach(id => threads[id] = { p: sv('path', 'egi-thread', {}, gThreads), a: sv('circle', 'egi-knot', { r: 2.6 }, gThreads), b: sv('circle', 'egi-knot', { r: 2.6 }, gThreads), c: null });
    LINKS.forEach(([a, b, kind]) => links.push({ a, b, kind, p: sv('path', 'egi-link', {}, gLinks), head: sv('circle', 'egi-knot', { r: 2.4 }, gLinks), lab: sv('text', 'egi-linklab', {}, gLinks), c: null }));
    links.forEach(l => l.lab.textContent = l.kind);

    /* the little figure: two curves from the recorded run, 0 1 2 3 4 by area and 0 1 3 7 15 by wall length */
    const PX = i => 14 + i * 48, PY = v => 50 - v * 2.9, AREA = [0, 1, 2, 3, 4], WALL = [0, 1, 3, 7, 15];
    sv('path', 'egi-axis', { d: `M14 3V50H214` }, plot);
    const cWall = sv('path', 'egi-curve', { d: WALL.map((v, i) => (i ? 'L' : 'M') + PX(i) + ' ' + PY(v)).join('') }, plot), cArea = sv('path', 'egi-curve', { d: AREA.map((v, i) => (i ? 'L' : 'M') + PX(i) + ' ' + PY(v)).join('') }, plot);
    const dots = [...AREA.map((v, i) => sv('circle', 'egi-dot a', { cx: PX(i), cy: PY(v), r: 2.3 }, plot)), ...WALL.map((v, i) => sv('circle', 'egi-dot w', { cx: PX(i), cy: PY(v), r: 2.3 }, plot))];
    const tA = sv('text', 'egi-plotlab', { x: 210, y: PY(4) - 7, 'text-anchor': 'end' }, plot), tW = sv('text', 'egi-plotlab', { x: 150, y: PY(7) - 5, 'text-anchor': 'end' }, plot); tA.textContent = 'by area'; tW.textContent = 'by wall length';
    const emph = new EM.Spring(0, 120, 22);                                              // 0: the area curve is the one read, 1: the wall curve

    /* ---- springs for the large pieces ---- */
    const sp = { shx: new EM.Spring(0, 60, 15.5), shy: new EM.Spring(0, 60, 15.5), shs: new EM.Spring(1, 60, 15.5), sho: new EM.Spring(1, 90, 19), x: new EM.Spring(0, 90, 19), y: new EM.Spring(0, 90, 19), s: new EM.Spring(.9, 90, 19), o: new EM.Spring(0, 90, 19), wires: new EM.Spring(0, 70, 17) };
    let G = null;                                                                        // the current geometry

    /* ---- text that is typed and untyped, so a change is seen being made ---- */
    const texts = {};                                                                     // id -> { el, segs:[{k,text,n}], hand, caret }
    const toks = s => s.match(/\S+\s*/g) || [];
    const diff = (a, b) => {                                                              // word by word, as the interface itself marks a change
      const A = toks(a), Z = toks(b), n = A.length, m = Z.length, L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === Z[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      const out = [], add = (k, t) => { const l = out[out.length - 1]; if (l && l.k === k) l.text += t; else out.push({ k, text: t }); };
      for (let i = 0, j = 0; i < n || j < m;) { if (i < n && j < m && A[i] === Z[j]) { add('same', A[i]); i++; j++; } else if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) add('del', A[i++]); else add('ins', Z[j++]); }
      return out;
    };
    const paint = id => { const T = texts[id]; T.el.innerHTML = T.segs.map(s => s.n > 0 ? `<span class="egi-${s.k}${s.k === 'ins' && T.hand ? ' egi-' + T.hand : ''}">${esc(s.text.slice(0, Math.ceil(s.n)))}</span>${s === T.caret ? '<i class="egi-caret"></i>' : ''}` : (s === T.caret ? '<i class="egi-caret"></i>' : '')).join(''); };
    const setText = (id, el, text) => { el.classList.remove('egi-settle'); texts[id] = { el, segs: [{ k: 'same', text, n: text.length }], hand: '', caret: null }; paint(id); };
    const plain = id => texts[id].segs.filter(s => s.k !== 'del' && s.k !== 'out').map(s => s.text.slice(0, Math.ceil(s.n))).join('');
    const original = id => texts[id].segs.filter(s => s.k !== 'ins').map(s => s.text).join('');
    const RATE = 86;                                                                      // characters a second
    const lazy = build => { let sub = null; return dt => { if (!sub) sub = build() || []; while (sub.length && sub[0](dt)) { sub.shift(); dt = 0; } return !sub.length; }; };
    const typing = (id, seg, to) => dt => { const T = texts[id]; if (to == null) to = seg.text.length; if (M.off) seg.n = to; else seg.n += Math.sign(to - seg.n) * Math.min(Math.abs(to - seg.n), RATE * dt); T.caret = seg.n !== to ? seg : null; paint(id); return seg.n === to; };
    const wait = ms => { let t = 0; return dt => (t += dt * 1000) >= (M.off ? 0 : ms); };
    const call = fn => () => { fn(); return true; };
    const settle = (id, to) => lazy(() => { const T = texts[id]; T.el.classList.add('egi-settle'); return [wait(420), call(() => setText(id, T.el, to))]; });
    /* show `to` as a marked change against what stands: removed words struck, new words typed in */
    const markTo = (id, to, hand) => lazy(() => { const T = texts[id]; T.hand = hand; T.segs = diff(plain(id), to).map(s => ({ ...s, n: s.k === 'ins' ? 0 : s.text.length })); paint(id); return T.segs.filter(s => s.k === 'ins').map(s => typing(id, s)); });
    /* make `to` the text: what goes is untyped, what comes is typed, and the marks then fade */
    const editTo = (id, to, hand) => lazy(() => {
      const T = texts[id], gone = T.segs.filter(s => s.k === 'del' && s.n > 0).map(s => typing(id, s, 0));
      return [...gone, lazy(() => {
        if (plain(id) === to) return [settle(id, to)];
        T.hand = hand; T.segs = diff(plain(id), to).map(s => ({ k: s.k === 'del' ? 'out' : s.k, text: s.text, n: s.k === 'ins' ? 0 : s.text.length })); paint(id);
        return [...T.segs.filter(s => s.k !== 'same').map(s => typing(id, s, s.k === 'out' ? 0 : null)), wait(200), settle(id, to)];
      })];
    });
    /* the author rewords a proposal that is still marked: the proposed words are untyped back to what is shared, and the author's are typed */
    const retypeIns = (id, to, hand) => lazy(() => {
      const T = texts[id], cur = T.segs.find(s => s.k === 'ins'), next = diff(original(id), to).find(s => s.k === 'ins'); if (!cur || !next) return [markTo(id, to, hand)];
      let p = 0; while (p < cur.text.length && p < next.text.length && cur.text[p] === next.text[p]) p++; while (p > 0 && cur.text[p - 1] !== ' ') p--;
      return [typing(id, cur, p), call(() => { cur.text = next.text; T.hand = hand; paint(id); }), typing(id, cur)];
    });
    const unmark = id => lazy(() => { const T = texts[id], to = original(id); return [...T.segs.filter(s => s.k === 'ins').reverse().map(s => typing(id, s, 0)), settle(id, to)]; });
    const mkTx = b => b.querySelector('.egi-tx') || b.insertBefore(h('span', 'egi-tx', ''), b.firstChild);
    const settleText = () => {
      setText('premise', mkTx(B.premise), PREMISE[S.premise]); setText('r-premise', R.premise.t, REC_PREMISE[S.premise]); setText('r-claim', R.claim.t, REC_CLAIM[S.proposal ? S.proposal.text : S.claim]); setText('claim', mkTx(B.claim), CLAIM[S.claim]);
      if (S.proposal) { S.proposal.shown = true; texts.claim.hand = 'agent'; texts.claim.segs = diff(CLAIM[S.claim], CLAIM[S.proposal.text]).map(s => ({ ...s, n: s.text.length })); paint('claim'); }
    };

    /* ---- what follows from the state ---- */
    const consistent = () => FAMILY[S.claim] === S.premise;
    let aliveUntil = 0;
    const refresh = () => {
      const open = S.proposal && S.proposal.shown;
      RECORDS.forEach(r => { const need = S.review.includes(r.id), prop = S.proposal && r.id === 'claim'; R[r.id].el.dataset.state = prop ? (S.proposal.stale ? 'stale' : 'proposal') : need ? 'review' : 'current'; R[r.id].st.textContent = prop ? (S.proposal.stale ? 'proposal, out of date' : `proposal on version ${S.v.claim}`) : need ? 'needs review' : `version ${S.v[r.id]} · current`; });
      ['claim', 'fig'].forEach(id => B[id].classList.toggle('egi-review', S.review.includes(id)));
      root.dataset.view = view; root.dataset.proposal = open ? (S.proposal.stale ? 'stale' : 'open') : 'none'; root.dataset.canedit = open && S.proposal.text === 'agent' ? '1' : '0';
      acts.querySelector('.egi-acts-note').textContent = S.proposal && S.proposal.stale ? 'Written against the earlier premise' : 'Proposed by the agent';
      const full = tier === 'full';
      goAuthor.textContent = S.premise === 'area' ? (full ? 'Author: price a split by the length of its wall' : 'Author: price by wall') : (full ? 'Author: price a split by its area' : 'Author: price by area');
      const ag = S.proposal ? '' : S.review.length ? (consistent() ? (full ? 'Agent: read the claim again' : 'Agent: read again') : (full ? 'Agent: propose the consequence' : 'Agent: propose')) : (S.claim === 'base' && S.premise === 'area' ? (full ? 'Agent: propose a change' : 'Agent: propose') : '');
      goAgent.textContent = ag; goAgent.hidden = !ag;
      status.textContent = view === 'shot' ? '' : S.proposal ? (S.proposal.stale ? 'Written against the earlier premise, so it can only be dismissed.' : 'A proposal from the agent is waiting for the author.')
        : S.review.length ? 'The premise changed, and what requires it needs review.'
        : sel ? { premise: 'This sentence and this record are one premise.', step: 'This line and this record are one step of the argument.', claim: 'This sentence and this record are one claim.', fig: 'The figure on the page and its record are one figure.', run: 'The run is kept with the records, and the page shows only its figure.' }[sel]
        : S.last === 'dismissed' ? 'The proposal was dismissed, and it is kept in the history of the claim.'
        : S.last === 'checked' ? 'The agent read the premise again, and the claim stands as written.'
        : S.last === 'author' ? `The author’s wording stands in both forms, at version ${S.v.claim}.`
        : 'The two forms agree, and every record is current.';
      emph.to(FAMILY[S.claim] === 'wall' ? 1 : 0);
      Object.keys(B).forEach(id => B[id].classList.toggle('egi-sel', sel === id)); RECORDS.forEach(r => R[r.id].el.classList.toggle('egi-sel', sel === r.id));
      Object.keys(threads).forEach(id => threads[id].p.classList.toggle('egi-sel', sel === id));
      aliveUntil = performance.now() + 900;
    };

    /* ---- geometry ---- */
    const measure = () => {
      W = el.clientWidth; H = el.clientHeight; if (!W || !H) return false;
      tier = W >= 900 ? 'full' : W >= 520 ? 'compact' : 'narrow'; const tiny = tier === 'narrow' && H < 320;
      const expert = document.documentElement.dataset.level === 'expert'; root.dataset.level = expert ? 'expert' : 'plain'; const k = tier === 'full' ? clamp(Math.min(W / 1100, H / 640), 1, 2) : 1; root.style.setProperty('--k', k.toFixed(3)); root.dataset.tier = tier; root.dataset.tiny = tiny ? '1' : '0'; root.dataset.short = tier !== 'full' && H < 430 ? '1' : '0'; root.dataset.cap = tier === 'full' && H / k >= 600 ? '1' : '0'; wires.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const pad = tier === 'full' ? 24 * k : tier === 'compact' ? 14 : 8, barH = tiny ? 0 : tier === 'full' ? 52 * k : 42, tagH = tiny ? 0 : tier === 'full' ? 28 * k : 22;
      const top = pad + tagH, bottom = H - pad - barH, sw = Math.round(tier === 'full' ? W * .43 : tier === 'compact' ? W * .44 : W * .5), gap = tier === 'full' ? 62 * k : tier === 'compact' ? 34 : 20;
      const px = pad + sw + gap, pw = W - pad - px - (tier === 'narrow' ? 12 : 0), ph = bottom - top;
      const rw = tier === 'full' ? clamp(pw * .4, 170 * k, 214 * k) : tier === 'compact' ? clamp(pw * .46, 124, 172) : pw, rh = tier === 'narrow' ? clamp(ph / (tiny ? 3.3 : 5.5), 30, 46) : clamp(ph * .215, 62 * k, 92 * k);
      G = { pad, top, bottom, sw, sh: ph, px, pw, ph, rw, rh, tiny, k };
      sheet.style.width = sw + 'px'; sheet.style.height = ph + 'px';
      const order = tiny ? ['premise', 'claim', 'fig'] : ['premise', 'step', 'claim', 'fig', 'run'];
      RECORDS.forEach(r => {
        const q = R[r.id], on = order.includes(r.id), k = order.indexOf(r.id); const hh = Math.round(tier === 'narrow' ? rh : rh * (r.f > 1 ? (tier === 'compact' ? 1.34 : 1.2) : r.id === 'premise' ? 1 : .9) + (expert && tier === 'full' ? 14 * k : 0)); q.on = on; q.w = rw; q.hh = hh; q.el.style.width = rw + 'px'; q.el.style.height = hh + 'px';
        q.gx = tier === 'narrow' ? px : px + clamp(r.at[0] * pw - rw / 2, 0, pw - rw); q.gy = tier === 'narrow' ? top + (ph - rh) * (order.length > 1 ? k / (order.length - 1) : 0) : top + clamp((expert && tier === 'full' && r.id === 'claim' ? .47 : expert && tier === 'full' && r.id === 'step' ? .15 : r.at[1]) * ph - hh / 2, 0, ph - hh);
      });
      tagA.style.left = pad + 'px'; tagA.style.top = pad - 2 + 'px'; tagB.style.left = px + 'px'; tagB.style.top = pad - 2 + 'px';
      /* the real screen: whole, or drawn in on the proposed change */
      const iw = 1440, ih = 900, fit = Math.min((W - 2 * pad) / iw, (H - 2 * pad - (tiny ? 0 : 34)) / ih);
      const region = { x: .168, y: .46, w: .66, h: .36 }, zs = Math.min((W - 2 * pad) / (iw * region.w), (H - 2 * pad - (tiny ? 0 : 34)) / (ih * region.h)) * .96;
      G.shot = [{ s: fit, x: (W - iw * fit) / 2, y: pad + (H - 2 * pad - (tiny ? 0 : 34) - ih * fit) / 2 }, { s: zs, x: W / 2 - (region.x + region.w / 2) * iw * zs, y: pad + (H - 2 * pad - (tiny ? 0 : 34)) / 2 - (region.y + region.h / 2) * ih * zs }];
      G.from = { x: G.shot[1].x + region.x * iw * zs, y: G.shot[1].y + region.y * ih * zs, s: (region.w * iw * zs) / sw };
      return true;
    };
    const aim = snap => {
      if (!G) return; const forms = view === 'forms', z = G.shot[zoom ? 1 : 0], go = (s, v) => snap ? s.snap(v) : s.to(v);
      go(sp.shx, z.x); go(sp.shy, z.y); go(sp.shs, z.s); go(sp.sho, forms ? 0 : 1);
      go(sp.x, forms ? G.pad : G.from.x); go(sp.y, forms ? G.top : G.from.y); go(sp.s, forms ? 1 : clamp(G.from.s, .4, 1.6)); go(sp.o, forms ? 1 : 0); go(sp.wires, forms ? 1 : 0);
      RECORDS.forEach(r => { const q = R[r.id], show = forms && q.on; go(q.x, show ? q.gx : q.gx + 60); go(q.y, q.gy); go(q.o, show ? 1 : 0); go(q.s, show ? 1 : .86); });
      shotNote.textContent = zoom ? 'A change proposed by the agent, marked in the sentence it would replace.' : 'The interface, with the manuscript of The Cost of Complexity open beside the conversation.';
    };

    /* ---- drawing, every frame ---- */
    const thPts = id => { const b = B[id], q = R[id]; if (!b.offsetHeight) return null; const s = sp.s.v, x0 = sp.x.v + G.sw * s, y0 = sp.y.v + clamp(b.offsetTop + b.offsetHeight / 2, 8, G.sh - 8) * s, x1 = q.x.v + q.w * (1 - q.s.v) / 2, y1 = q.y.v + q.hh / 2, c = Math.max(14, (x1 - x0) * .5); return [[x0, y0], [x0 + c, y0], [x1 - c, y1], [x1, y1]]; };
    const edge = (q, tx, ty) => { const cx = q.x.v + q.w / 2, cy = q.y.v + q.hh / 2, dx = tx - cx, dy = ty - cy, k = Math.min(Math.abs((q.w / 2 + 3) / (dx || 1e-6)), Math.abs((q.hh / 2 + 3) / (dy || 1e-6))); return [cx + dx * k, cy + dy * k]; };
    const draw = () => {
      shot.style.transform = `translate(${sp.shx.v.toFixed(2)}px,${sp.shy.v.toFixed(2)}px) scale(${sp.shs.v.toFixed(4)})`; shot.style.opacity = clamp(sp.sho.v).toFixed(3); shot.style.visibility = sp.sho.v < .01 ? 'hidden' : 'visible'; if (G) { const zk = clamp((sp.shs.v - G.shot[0].s) / Math.max(1e-6, G.shot[1].s - G.shot[0].s)); shot.style.clipPath = `inset(${(45.3 * zk).toFixed(2)}% 0 ${(15 * zk).toFixed(2)}% 0 round 10px)`; shotB.style.opacity = smooth(zk * 1.6).toFixed(3); }
      shotNote.style.opacity = clamp(sp.sho.v * 1.4 - .4).toFixed(3);
      sheet.style.transform = `translate(${sp.x.v.toFixed(2)}px,${sp.y.v.toFixed(2)}px) scale(${sp.s.v.toFixed(4)})`; sheet.style.opacity = clamp(sp.o.v).toFixed(3); sheet.style.visibility = sp.o.v < .01 ? 'hidden' : 'visible';
      const fo = clamp(sp.o.v).toFixed(3); tagA.style.opacity = tagB.style.opacity = bar.style.opacity = fo; bar.style.visibility = sp.o.v < .01 ? 'hidden' : 'visible';
      RECORDS.forEach(r => { const q = R[r.id]; q.el.style.transform = `translate(${q.x.v.toFixed(2)}px,${q.y.v.toFixed(2)}px) scale(${q.s.v.toFixed(4)})`; q.el.style.opacity = clamp(q.o.v).toFixed(3); q.el.style.visibility = q.o.v < .01 ? 'hidden' : 'visible'; });
      const wo = clamp(sp.wires.v);
      Object.keys(threads).forEach(id => { const t = threads[id], q = R[id], c = q.on && wo > .01 ? thPts(id) : null; t.c = c; const o = c ? (wo * clamp(q.o.v)).toFixed(3) : 0; t.p.style.opacity = t.a.style.opacity = t.b.style.opacity = o; if (!c) return; t.p.setAttribute('d', `M${c[0][0].toFixed(1)} ${c[0][1].toFixed(1)}C${c[1][0].toFixed(1)} ${c[1][1].toFixed(1)} ${c[2][0].toFixed(1)} ${c[2][1].toFixed(1)} ${c[3][0].toFixed(1)} ${c[3][1].toFixed(1)}`); t.a.setAttribute('cx', c[0][0].toFixed(1)); t.a.setAttribute('cy', c[0][1].toFixed(1)); t.b.setAttribute('cx', c[3][0].toFixed(1)); t.b.setAttribute('cy', c[3][1].toFixed(1)); });
      links.forEach(l => {
        const a = R[l.a], b = R[l.b], on = a.on && b.on && wo > .01 && tier !== 'narrow', o = on ? (wo * Math.min(clamp(a.o.v), clamp(b.o.v))).toFixed(3) : 0; l.p.style.opacity = l.head.style.opacity = o; l.lab.style.opacity = on ? o : 0; if (!on) { l.c = null; return; }
        const p = edge(a, b.x.v + b.w / 2, b.y.v + b.hh / 2), q = edge(b, a.x.v + a.w / 2, a.y.v + a.hh / 2), mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = -(q[1] - p[1]), ny = q[0] - p[0], nl = Math.hypot(nx, ny) || 1, up = ny > 0 ? -1 : 1, bend = 10, c1 = [mx + nx / nl * bend, my + ny / nl * bend];
        l.c = [p, [p[0] + (c1[0] - p[0]) * .66, p[1] + (c1[1] - p[1]) * .66], [q[0] + (c1[0] - q[0]) * .66, q[1] + (c1[1] - q[1]) * .66], q];
        l.p.setAttribute('d', `M${p[0].toFixed(1)} ${p[1].toFixed(1)}Q${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`); l.head.setAttribute('cx', q[0].toFixed(1)); l.head.setAttribute('cy', q[1].toFixed(1));
        let lx, ly, anchor = 'middle'; const fs = tier === 'full' ? 12.5 * (G.k || 1) : 11, lw = l.kind.length * fs * .54; if (Math.abs(q[0] - p[0]) > 1.6 * Math.abs(q[1] - p[1])) { const room = Math.hypot(q[0] - p[0], q[1] - p[1]) >= lw + 10; lx = room ? mx : Math.max(p[0], q[0]) + lw / 2 + 6; ly = room ? my - 7 : Math.min(a.y.v, b.y.v) - 6; } else { const side = [1, -1].map(sg => { const x = mx + sg * (10 + lw / 2), d = Math.min(...RECORDS.filter(r => R[r.id].on).map(r => Math.hypot(x - (R[r.id].x.v + R[r.id].w / 2), (my - (R[r.id].y.v + R[r.id].hh / 2)) * 2.4))); return [d, x]; }).sort((u, v) => v[0] - u[0])[0]; lx = side[1]; ly = my + 4; } l.lab.setAttribute('text-anchor', anchor); void up; l.lab.setAttribute('x', lx.toFixed(1)); l.lab.setAttribute('y', ly.toFixed(1));
      });
      const e = clamp(emph.v); cArea.style.strokeWidth = (1.1 + 2.1 * (1 - e)).toFixed(2); cWall.style.strokeWidth = (1.1 + 2.1 * e).toFixed(2); cArea.style.opacity = (.45 + .55 * (1 - e)).toFixed(2); cWall.style.opacity = (.45 + .55 * e).toFixed(2); tA.style.opacity = (.5 + .5 * (1 - e)).toFixed(2); tW.style.opacity = (.5 + .5 * e).toFixed(2);
      dots.forEach((d, i) => d.style.opacity = (i < 5 ? .35 + .65 * (1 - e) : .35 + .65 * e).toFixed(2));
      /* pulses: a point and its wake, running along a thread or a link that is itself moving */
      pulses = pulses.filter(p => {
        const c = p.kind === 't' ? threads[p.id].c : (links.find(l => l.a === p.a && l.b === p.b) || {}).c; if (!c || p.t >= 1) { p.g.remove(); return false; }
        const at = t => { t = p.back ? 1 - t : t; return [cubic(c[0][0], c[1][0], c[2][0], c[3][0], t), cubic(c[0][1], c[1][1], c[2][1], c[3][1], t)]; }, u = smooth(p.t), head = at(u);
        let d = ''; for (let i = 0; i <= 8; i++) { const q = at(Math.max(0, u - .22 * i / 8)); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
        p.w.setAttribute('d', d); p.h.setAttribute('cx', head[0].toFixed(1)); p.h.setAttribute('cy', head[1].toFixed(1)); p.g.style.opacity = (Math.min(1, p.t * 8) * Math.min(1, (1 - p.t) * 6)).toFixed(2); return true;
      });
    };
    const pulse = (spec, tone) => lazy(() => { const p = { ...spec, t: 0, g: sv('g', 'egi-pulse ' + (tone || ''), {}, gPulse) }; p.w = sv('path', '', {}, p.g); p.h = sv('circle', '', { r: 4 }, p.g); pulses.push(p); return [dt => { if (M.off) p.t = 1; else p.t += dt / .56; return p.t >= 1; }]; });
    const both = (...tasks) => { let live = tasks.slice(); return dt => { live = live.filter(t => !t(dt)); return !live.length; }; };
    const flash = e => call(() => { e.classList.remove('egi-flash'); void e.offsetWidth; e.classList.add('egi-flash'); });

    const frame = now => {
      raf = 0; if (dead) return; if (!(now > last)) { raf = requestAnimationFrame(frame); return; } let dt = Math.min(.064, (now - last) / 1000), moving = false; last = now;
      const all = [...Object.values(sp), emph]; RECORDS.forEach(r => { const q = R[r.id]; all.push(q.x, q.y, q.o, q.s); });
      for (let left = dt; left > 1e-5; left -= .008) { const st = Math.min(.008, left); moving = false; all.forEach(s => { if (s.step(st)) moving = true; }); }
      let ran = false; while (seq.length && seq[0](dt)) { seq.shift(); dt = 0; ran = true; }
      draw(); if (visible && (moving || ran || seq.length || pulses.length || now < aliveUntil)) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const run = tasks => { seq = seq.concat(tasks); kick(); };
    const finish = () => { seq = []; pulses.forEach(p => p.g.remove()); pulses = []; settleText(); refresh(); };       // an interrupted change is completed at once

    /* ---- the moves: each changes the one object, and is then seen in both of its forms ---- */
    const TH = (id, back) => ({ kind: 't', id, back }), LK = (a, b, back) => ({ kind: 'l', a, b, back });
    const toForms = () => { if (view !== 'forms') { view = 'forms'; zoom = 1; aim(); refresh(); } };
    const propose = text => lazy(() => { S.proposal = { text, read: S.v.premise }; S.last = 'proposal'; refresh(); return [editTo('r-claim', REC_CLAIM[text], 'agent'), flash(R.claim.el), pulse(TH('claim', true), 'agent'), markTo('claim', CLAIM[text], 'agent'), call(() => { S.proposal.shown = true; refresh(); })]; });
    const resolve = text => lazy(() => {                                                   // the author accepts `text`
      const was = S.proposal; S.proposal = null; S.claim = text; S.v.claim++; S.last = text === 'author' ? 'author' : 'accepted'; root.dataset.proposal = 'none';
      const tasks = [editTo('claim', CLAIM[text], 'author'), pulse(TH('claim'), 'author')];
      if (was && was.text !== text) tasks.push(editTo('r-claim', REC_CLAIM[text], 'author'));
      tasks.push(flash(R.claim.el), call(refresh));
      if (S.review.length && consistent()) tasks.push(call(() => { S.review = ['fig']; refresh(); }), pulse(LK('claim', 'fig'), 'author'), call(() => { S.review = []; S.v.fig++; refresh(); }), flash(R.fig.el), pulse(TH('fig', true), 'author'));
      return tasks;
    });
    const dismiss = () => lazy(() => { S.proposal = null; S.last = 'dismissed'; root.dataset.proposal = 'none'; return [unmark('claim'), pulse(TH('claim'), 'author'), editTo('r-claim', REC_CLAIM[S.claim], 'author'), call(refresh)]; });
    const authorEdit = to => lazy(() => {
      S.premise = to; S.v.premise++; S.last = 'premise'; if (S.proposal) S.proposal.stale = true;
      return [editTo('premise', PREMISE[to], 'author'), pulse(TH('premise'), 'author'), editTo('r-premise', REC_PREMISE[to], 'author'), flash(R.premise.el), call(refresh),
        pulse(LK('claim', 'premise', true), 'review'), call(() => { S.review = ['claim']; refresh(); }), flash(R.claim.el), both(pulse(LK('claim', 'fig'), 'review'), pulse(TH('claim', true), 'review')), call(() => { S.review = ['claim', 'fig']; refresh(); }), flash(R.fig.el), pulse(TH('fig', true), 'review')];
    });
    const check = () => lazy(() => [pulse(LK('claim', 'premise'), 'agent'), call(() => { S.review = ['fig']; S.last = 'checked'; refresh(); }), flash(R.claim.el), pulse(LK('claim', 'fig'), 'agent'), call(() => { S.review = []; refresh(); }), flash(R.fig.el)]);
    const reset = () => { S = JSON.parse(JSON.stringify(START)); sel = null; settleText(); refresh(); };
    const put = o => { reset(); Object.assign(S, o.S || {}); Object.assign(S.v, o.v || {}); settleText(); refresh(); };

    /* the states the six steps stand for, reached from wherever the reader left things */
    const step = i => {
      finish();
      if (i === 0) { reset(); view = 'shot'; zoom = 0; aim(); refresh(); run([wait(1500), call(() => { if (view === 'shot') { zoom = 1; aim(); } })]); }
      else if (i === 1) { reset(); toForms(); }
      else if (i === 2) { const late = view !== 'forms'; reset(); toForms(); run([wait(late ? 900 : 250), propose('agent')]); }
      else if (i === 3) { if (!(S.proposal && S.proposal.text === 'agent' && !S.proposal.stale)) put({ S: { proposal: { text: 'agent', read: 2 } } }); toForms(); run([wait(350), retypeIns('claim', CLAIM.author, 'author'), wait(300), resolve('author')]); }
      else if (i === 4) { if (!(S.premise === 'area' && !S.proposal && !S.review.length && S.claim !== 'base')) put({ S: { claim: 'author', last: 'author' }, v: { claim: 4 } }); toForms(); run([wait(300), authorEdit('wall')]); }
      else if (i === 5) { if (!(S.premise === 'wall' && S.review.length && !S.proposal)) put({ S: { claim: 'author', premise: 'wall', review: ['claim', 'fig'], last: 'premise' }, v: { claim: 4, premise: 3 } }); toForms(); run([wait(400), propose('doubles'), wait(800), resolve('doubles')]); }
      stepAt = i; kick();
    };
    /* the reader's own hand */
    const act = what => {
      finish();
      if (what === 'again') { reset(); toForms(); emit(1); }
      else if (what === 'author') { run([authorEdit(S.premise === 'area' ? 'wall' : 'area')]); emit(4); }
      else if (what === 'agent') { if (S.review.length) { if (consistent()) run([check()]); else { const t = S.premise === 'wall' ? 'doubles' : 'author'; run([propose(t)]); if (t === 'doubles') emit(5); } } else if (S.claim === 'base') { run([propose('agent')]); emit(2); } }
      else if (what === 'accept' && S.proposal && !S.proposal.stale) { const t = S.proposal.text; run([resolve(t)]); emit(t === 'doubles' ? 5 : 3); }
      else if (what === 'edit' && S.proposal && S.proposal.text === 'agent' && !S.proposal.stale) { run([retypeIns('claim', CLAIM.author, 'author'), wait(300), resolve('author')]); emit(3); }
      else if (what === 'dismiss' && S.proposal) run([dismiss()]);
      kick();
    };
    root.addEventListener('click', ev => {
      const b = ev.target.closest('[data-do]'); if (b) { act(b.dataset.do); return; }
      if (ev.target.closest('.egi-shot')) { if (zoom) { finish(); reset(); toForms(); emit(1); } else { seq = []; zoom = 1; aim(); } kick(); return; }
      const it = ev.target.closest('[data-id]'); if (it && view === 'forms') { sel = sel === it.dataset.id ? null : it.dataset.id; refresh(); if (sel && threads[sel] && !seq.length) run([pulse(TH(sel, !!it.closest('.egi-rec')), 'pick')]); kick(); }
    });
    root.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('.egi-b')) { ev.preventDefault(); ev.target.click(); } });

    let fitted = false; const fit = () => { if (!measure()) return; aim(!fitted); fitted = true; draw(); refresh(); };
    const ro = new ResizeObserver(() => { const w = el.clientWidth, hh = el.clientHeight; if (w !== W || hh !== H) fit(); kick(); }); ro.observe(el);
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }); io.observe(el);
    const onLevel = () => { if (measure()) { aim(); refresh(); kick(); } }; window.addEventListener('eigen-level', onLevel);
    settleText(); fit(); refresh(); kick();
    el.__egi = { state: () => ({ S, view, zoom, stepAt, busy: seq.length + pulses.length, tier }), geometry: () => ({ threads: Object.fromEntries(Object.entries(threads).map(([k, t]) => [k, t.c])), recs: Object.fromEntries(RECORDS.map(r => [r.id, { x: R[r.id].x.v, y: R[r.id].y.v, w: R[r.id].w, h: R[r.id].hh, o: R[r.id].o.v }])), sheet: { x: sp.x.v, y: sp.y.v, s: sp.s.v, o: sp.o.v }, shot: { x: sp.shx.v, y: sp.shy.v, s: sp.shs.v, o: sp.sho.v } }) };
    return { step, destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener('eigen-level', onLevel); root.remove(); delete el.__egi; } };
  }

  /* ------------------------------------------------------------------------------------------------------------
     The node's own page carries three doors onto the interface at work: the film of a session, a recorded run
     becoming a figure, and the count of what was done. Each is a card with something of the thing itself in it. */
  function doors(el) {
    el.classList.add('egn-interface');
    const wrap = h('div', 'egi-doors', '', el), arts = [];
    const door = (href, kicker, title, line) => { const a = h('a', 'egi-door', `<span class="egi-door-art"></span><span class="egi-door-t"><small>${kicker}</small><strong>${title}</strong><em>${line}</em></span>`, wrap); a.href = href; return a.querySelector('.egi-door-art'); };
    const film = door('/demo/writing/', 'Film · 1 min 37 s', 'A session, filmed', 'A saved revision of the paper, reopened and followed as far as its arXiv package.');
    film.innerHTML = `<img src="${MEDIA}full-changes.webp" alt="" loading="lazy"><i class="egi-play"></i>`;
    const sim = door('/demo/writing/simulation/', 'Worked example', 'From a run to a figure', 'A recorded calculation supplies a figure, which is marked for review when its input changes.');
    const s = sv('svg', '', { viewBox: '0 0 220 96', 'aria-hidden': 'true' }, sim), PX = i => 24 + i * 46, PY = v => 84 - v * 5;
    sv('path', 'egi-axis', { d: 'M24 8V84H212' }, s); const ca = sv('path', 'egi-curve', { pathLength: 1 }, s), cw = sv('path', 'egi-curve w', { pathLength: 1 }, s);
    ca.setAttribute('d', [0, 1, 2, 3, 4].map((v, i) => (i ? 'L' : 'M') + PX(i) + ' ' + PY(v)).join('')); cw.setAttribute('d', [0, 1, 3, 7, 15].map((v, i) => (i ? 'L' : 'M') + PX(i) + ' ' + PY(v)).join(''));
    const rec = door('/demo/writing/project-record/', 'The record', 'The work behind the paper', 'Thirty-nine turns and a hundred decisions, counted from the receipts of the session itself.');
    rec.innerHTML = '<span class="egi-bars">' + [[260, 5], [192, 1], [149, 4], [137, 8], [103, 5]].map(([r, f], i) => `<i style="--w:${((r + f) / 265 * 100).toFixed(1)}%;--f:${(f / (r + f) * 100).toFixed(1)}%;--d:${i * .12}s"></i>`).join('') + '</span>';
    let raf = 0, t0 = performance.now(), dead = false;
    const loop = now => { if (dead) return; const t = ((now - t0) / 1000) % 9, u = M.off ? 1 : smooth(t / 2.6); ca.style.strokeDasharray = cw.style.strokeDasharray = `${u} 1`; s.style.opacity = M.off ? 1 : (1 - smooth((t - 8.2) / .8)).toFixed(2); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
    return { destroy() { dead = true; cancelAnimationFrame(raf); wrap.remove(); } };
  }

  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.interface = {
    title: 'The human interface',
    question: 'How does a person work on it?',
    line: two('The side of EigenEngine which faces a person, where the object is read as a manuscript.', 'One set of guarded operations serves the author’s editor and the agent’s tools alike.'),
    text: two('No author should have to think in graphs. <i>The interface</i> is the side of EigenEngine which faces a person, and it reads as a manuscript: prose, equations and figures. An agent works on the same object as linked records. These are conjugate representations, meaning that each can be rebuilt from the other. A change made in either arrives in the other, and the author decides which changes stand.',
      'A person and an agent act on a project through the same operations. <i>The interface</i> is the side which faces the person and presents the object as a manuscript, while the agent’s tools present it as typed records joined by named relations. Every write names the revision it read, so one made against a superseded revision is refused and returned for review. An agent’s edit is a sealed proposal, which only the author’s decision applies.'),
    ground: 'interface',
    out: [{ href: '/demo/writing/', label: 'Watch a session, filmed →' }, { href: '/demo/writing/simulation/', label: 'From a run to a figure →' }, { href: '/demo/writing/project-record/', label: 'The work behind the paper →' }],
    art,
    exhibit: { steps, mount },
    sections: [{ title: 'The interface at work', mount: doors }]
  };
})();
