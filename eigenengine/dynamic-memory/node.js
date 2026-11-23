/* Dynamic Memory (id `memory`, blue ground). One node of the EigenEngine graph, written to dispatch/CONTRACT.md.

   1. the memory itself: the paper's construction, computed exactly in whole numbers
   2. the words, at two levels
   3. the card art: a tree of records folding into shared states, with a light running through it
   4. the exhibit: a notebook, the memory built from it, a question, a correction
   5. one further section for the node's own page: why whole records are kept

   Nothing on screen is drawn by hand. Every count, state, answer and "links touched" is read from section 1. */
(() => {
  'use strict';
  const EM = window.EigenMotion || {}, M = window.EG_MOTION || (window.EG_MOTION = { off: false, rate: 1 });
  const Spring = EM.Spring || class { constructor(v = 0) { this.v = this.g = v; } to(g) { this.g = g; return this; } snap(g) { this.v = this.g = g; return this; } step(dt) { this.v += (this.g - this.v) * Math.min(1, dt * 9); return true; } };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), smooth = x => x * x * (3 - 2 * x), mix = (a, b, t) => a + (b - a) * t;
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const H = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const two = (plain, expert) => Object.assign(new String(plain), { plain, expert });   // a field at two levels; projection/level.js adopts it
  const expert = () => document.documentElement.dataset.level === 'expert';
  const bez = (x1, y1, ax, ay, bx, by, x2, y2, u) => { const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u; return [a * x1 + b * ax + c * bx + d * x2, a * y1 + b * ay + c * by + d * y2]; };

  /* ================= 1. the memory ================================================================================
     An observation is a record of three labels with a whole-number count and the line of the notebook it was read from.
     The records are kept whole, as the paths of a prefix tree in a fixed order of labels. Two prefixes share a state
     when everything still to be read follows the same proportions (the paper's continuation state). */
  const FIELDS = [{ name: 'batch', values: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }, { name: 'treatment', values: ['heated', 'unheated'] }, { name: 'outcome', values: ['cracked', 'intact'] }];
  const NOTEBOOK = [[1, 'A', 'heated', 3, 1], [2, 'A', 'unheated', 1, 3], [3, 'B', 'heated', 6, 2], [4, 'B', 'unheated', 2, 6],
    [5, 'C', 'heated', 3, 1], [6, 'C', 'unheated', 1, 3], [7, 'D', 'heated', 2, 2], [8, 'D', 'unheated', 2, 6]];
  const MORE = [[10, 'E'], [12, 'F'], [14, 'G']];   // three further batches, each reported as batch A is: lines 10 to 15
  const EDITS = { correct: { line: 3, label: 'Correct line 3' },
    add: { line: 9, label: 'Add a line' }, withdraw: { line: 1, label: 'Withdraw line 1' } };
  function notebook(ed) {
    const L = NOTEBOOK.map(([id, batch, treat, cracked, intact]) => ({ id, batch, treat, cracked, intact }));
    if (ed.correct) { L[2].was = L[2].cracked; L[2].cracked = 4; }
    if (ed.withdraw) L[0].off = true;
    L.push({ id: 9, batch: 'A', treat: 'heated', cracked: 0, intact: 1, second: true, off: !ed.add });
    if (ed.grow) MORE.forEach(([id, batch]) => L.push({ id, batch, treat: 'heated', cracked: 3, intact: 1, more: true }, { id: id + 1, batch, treat: 'unheated', cracked: 1, intact: 3, more: true }));
    return L;
  }
  const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a || 1; };
  const frac = (a, b) => { const g = gcd(a, b); return [a / g, b / g]; };
  function remember(lines) {
    const nodes = new Map();
    const node = vals => { const key = vals.join('|'); let n = nodes.get(key); if (!n) { n = { key, d: vals.length, vals, n: 0, kids: [], parent: null, src: new Set(), by: {} }; nodes.set(key, n); if (n.d) { n.parent = node(vals.slice(0, -1)); n.parent.kids.push(n); } } return n; };
    node([]);
    lines.forEach(l => { if (l.off) return; FIELDS[2].values.forEach(o => { const w = l[o]; if (!w) return; const v = [l.batch, l.treat, o]; for (let d = 0; d <= 3; d++) { const n = node(v.slice(0, d)); n.n += w; n.src.add(l.id); } node(v).by[l.id] = w; }); });
    nodes.forEach(n => { if (n.d < 3) n.kids.sort((a, b) => FIELDS[n.d].values.indexOf(a.vals[n.d]) - FIELDS[n.d].values.indexOf(b.vals[n.d])); });
    const sig = n => n.sig || (n.sig = n.kids.length ? n.kids.map(k => { const [p, q] = frac(k.n, n.n); return k.vals[n.d] + ':' + p + '/' + q + '>' + sig(k); }).join(' ') : 'T');
    const states = new Map();
    nodes.forEach(n => { const key = n.d + '#' + sig(n); let s = states.get(key); if (!s) states.set(key, s = { key, d: n.d, members: [], n: 0 }); s.members.push(n); s.n += n.n; n.state = s; });
    const root = nodes.get(''), leaves = []; (function walk(n) { if (n.d === 3) leaves.push(n); n.kids.forEach(walk); })(root);
    return { nodes, states, root, leaves, W: root.n };
  }
  /* A question is a test on some labels (the event) asked of the records that pass another (the population).
     One unit of weight enters at the root and divides in the recorded proportions; a test stops what fails it. */
  const QUESTIONS = [
    { chip: 'What share of the heated cracked?', ask: 'Of the heated samples, what fraction cracked?', brief: 'Heated: what share cracked?', cond: [null, 'heated', null], event: [null, 'heated', 'cracked'], unit: 'heated samples', verb: 'cracked' },
    { chip: 'What share of batch A cracked?', ask: 'Of the samples in batch A, what fraction cracked?', brief: 'Batch A: what share cracked?', cond: ['A', null, null], event: ['A', null, 'cracked'], unit: 'samples in batch A', verb: 'cracked' },
    { chip: 'What share was heated?', ask: 'What fraction of all the samples were heated?', brief: 'What share was heated?', cond: [null, null, null], event: [null, 'heated', null], unit: 'samples', verb: 'were heated' }];
  const passes = (n, test) => n.vals.every((v, g) => test[g] == null || test[g] === v);
  function answer(mem, q, folded) {
    let num = 0, den = 0; const rest = new Set();
    mem.leaves.forEach(l => { if (!passes(l, q.cond)) return; den += l.n; l.src.forEach(s => rest.add(s)); if (passes(l, q.event)) num += l.n; });
    const last = Math.max(...q.event.map((v, g) => v == null ? -1 : g)), seen = new Set(); let links = 0;
    mem.nodes.forEach(n => { if (n.d > last || !passes(n, q.cond)) return; if (folded) { if (seen.has(n.state.key)) return; seen.add(n.state.key); } links += n.kids.length; });
    return { num, den, rest: [...rest].sort((a, b) => a - b), last, links };
  }
  const Cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const said = (num, den) => { if (!den) return 'undefined'; const [a, b] = frac(num, den); return expert() ? a + '/' + b : a === 0 ? 'none' : a === b ? 'all' : a + ' in ' + b; };
  const listed = a => a.length < 2 ? String(a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];

  /* ================= 2. the words ================================================================================= */
  const STEPS = [
    { label: 'What a source says', holds: 'An answer can name the lines it rests on',
      caption: two('Each line of a laboratory notebook reports how many samples of a batch cracked and how many stayed intact. The memory keeps every count beside the words it was read from, which we call its <i>witness</i>.',
        'An admitted observation is a tuple \\(x_s\\) of categorical fields with a positive integer weight \\(w_s\\) and a <i>witness</i>: the source revision and the span of characters that support it. The memory keeps the joint counts \\(n(x)=\\sum_s w_s\\,\\mathbf{1}[x_s=x]\\) and the law \\(p(x)=n(x)/W\\).') },
    { label: 'Whole records', holds: 'Counts are kept as whole records',
      caption: two('We read the labels of each record in a fixed order - batch, then treatment, then outcome - so that the records become the paths of a tree. They are kept whole because a relation between two labels disappears once each label is tallied separately.',
        'Fix an order for the fields, so that a <i>prefix</i> \\(u\\) holds the fields already read and the <i>suffix</i> those still to come, and let the tree store the count \\(n(u)\\) of every prefix. The joint law is retained because relations between fields do not survive in the separate marginals.') },
    { label: 'Shared futures', holds: 'Records with one future share a calculation',
      caption: two('In batches A, B and C half the samples were heated, three in four of the heated cracked and one in four of the rest, so nothing still to be read can tell these batches apart. We let such paths share a single <i>state</i>, and the tree folds into far fewer states than it has records.',
        'Two prefixes share a <i>continuation state</i> when their normalised suffix laws \\(p(v\\mid u)=n(uv)/n(u)\\) agree. Each state \\(a\\) at cut \\(g\\) carries transition probabilities \\(t_g(a,x)\\) to successors \\(\\delta_g(a,x)\\), and the largest number of states at any cut is the continuation width.') },
    { label: 'A question', holds: 'The cost of a question is counted in shared states',
      caption: two('One unit of weight enters at the left and divides in the recorded proportions, each test stops the branches that fail it, and the answer is the share of the heated samples that arrives as cracked. The work is counted in links between states, and a state reached by many paths is worked through once.',
        'A query is a product of field tests \\(f_g\\in[0,1]\\), and pushing unit mass through the states gives \\(Z(f)=\\mathbf{1}^{\\top}M^{f}_{D-1}\\cdots M^{f}_{0}\\,v_0=\\sum_x p(x)\\prod_g f_g(x_g)\\). The answer is the ratio \\(Z(f)/Z(h)\\), at a cost \\(O(\\sum_g A_g S_g c_g)\\) set by the width \\(S_g\\) and not by the number of records.') },
    { label: 'A correction', holds: 'A correction disturbs one path',
      caption: two('A line of the notebook is corrected: six cracked samples become four. Only the path through that record is rewritten, the states that batch B shared with A and C split away from them, and every other state keeps the work already done in it.',
        'We retract the old weight and admit the new one. At most \\(D+1\\) raw prefixes on one path from root to leaf are copied and their signatures rebuilt upwards; identical signatures are reused, so the messages \\(m_g(a)=\\sum_x t_g(a,x)\\,f_g(x)\\,m_{g+1}(\\delta_g(a,x))\\) cached on unchanged states remain valid.') },
    { label: 'In EigenEngine', holds: 'EigenEngine keeps its sources in this form',
      caption: two('EigenEngine keeps what its sources say in this form, with passages of the literature and the output of calculations standing where the notebook stood. A question weighs shared structure before it opens any record, and a corrected source marks for review the records on its path, from which the change travels on.',
        'In EigenEngine the witnesses are passages of the literature and recorded runs, and a container\u2019s count answers for everything beneath it, as an untested suffix has message \\(1\\), so a question can weigh a container before opening it. The copied path is the set of records whose state changes to <i>needs review</i> when a source is revised.') }];
  const TEXT = two('A memory makes an earlier observation available to a new question. Suppose however that a laboratory notebook is corrected after an answer was given. The answer must change, and we should be able to say which lines it rested on. <i>Dynamic Memory</i> keeps every count beside the words that support it, and lets records with the same future share one calculation. A correction then disturbs a single path.',
    'A memory here is a finite joint law of admitted observations, each kept with its source revision and located span. Prefixes with equal conditional futures share a continuation state, without losing the source identities needed to revise them. A query is then answered exactly by propagation through those states, forwards or backwards, and a changed source rewrites at most \\(D+1\\) prefixes of one path.');

  /* ================= 3. the card art ==============================================================================
     Sixteen records as the paths of a tree. The tree folds into the two shared states of each cut and opens again, and
     a light runs out along one path and back, then out along another. Every position is a function of t alone. */
  function art(svg) {
    const D = 4, X0 = 62, DX = 70, Y0 = 18, YH = 176, CY = Y0 + YH / 2, RAIL = 38, LEG = 2.7;
    const g = S('g', { transform: 'rotate(-3 202 ' + CY + ')' }, svg), layers = [], edges = [];
    const ge = S('g', { fill: 'none', style: 'stroke:var(--eg-memory-line);stroke-width:1.5;stroke-linecap:round' }, g), gn = S('g', { style: 'fill:var(--eg-memory-line)' }, g);
    for (let d = 0; d <= D; d++) {
      layers.push([]);
      for (let i = 0; i < 1 << d; i++) {
        let par = 0, b = i; while (b) { par ^= b & 1; b >>= 1; }
        const n = { ty: Y0 + (i + .5) / (1 << d) * YH, fy: d === 0 || d === D ? CY : CY + (par ? RAIL : -RAIL), y: 0, x: X0 + d * DX, el: S('circle', { r: d === 0 ? 4.4 : d === D ? 2.1 : 3, opacity: d === D ? .7 : .95 }, gn) };
        layers[d].push(n);
        if (d) edges.push({ a: layers[d - 1][i >> 1], b: n, el: S('path', { opacity: .44 }, ge) });
      }
    }
    const back = S('path', { fill: 'none', style: 'stroke:var(--eg-ink);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round', opacity: .62 }, g), backTip = S('circle', { r: 2.2, style: 'fill:var(--eg-ink)', opacity: .9 }, g);
    const glow = S('circle', { r: 13, style: 'fill:var(--eg-gold)', opacity: .26 }, g), wake = S('path', { fill: 'none', style: 'stroke:var(--eg-gold);stroke-width:4;stroke-linecap:round;stroke-linejoin:round', opacity: .95 }, g), tip = S('circle', { r: 3.3, style: 'fill:var(--eg-ink)' }, g);
    const at = (tau, mul = 7, add = 3) => {
      const k = Math.floor(tau / (2 * LEG)), ph = tau / (2 * LEG) - k, s = smooth(ph < .5 ? ph * 2 : 2 - ph * 2) * D, leaf = ((k * mul + add) % 16 + 16) % 16, j = Math.min(D - 1, Math.floor(s)), u = s - j;
      const a = layers[j][leaf >> (D - j)], b = layers[j + 1][leaf >> (D - j - 1)];
      return bez(a.x, a.y, a.x + DX * .5, a.y, b.x - DX * .5, b.y, b.x, b.y, u);
    };
    function tick(t) {
      const tri = 1 - Math.abs((t / 12 % 1) * 2 - 1), m = smooth(clamp((tri - .2) / .6));
      for (let d = 0; d <= D; d++) { const md = smooth(clamp(m * 1.5 - (D - d) * .125)); layers[d].forEach(n => { n.y = mix(n.ty, n.fy, md); n.el.setAttribute('cx', n.x); n.el.setAttribute('cy', n.y.toFixed(2)); }); }
      edges.forEach(e => e.el.setAttribute('d', `M${e.a.x},${e.a.y.toFixed(2)}C${e.a.x + DX * .5},${e.a.y.toFixed(2)} ${e.b.x - DX * .5},${e.b.y.toFixed(2)} ${e.b.x},${e.b.y.toFixed(2)}`));
      let d = '', e = ''; for (let k = 0; k <= 30; k++) { const p = at(t - k * .026), r = at(t + LEG - k * .022, 5, 9); d += (k ? 'L' : 'M') + p[0].toFixed(2) + ',' + p[1].toFixed(2); if (k <= 20) e += (k ? 'L' : 'M') + r[0].toFixed(2) + ',' + r[1].toFixed(2); }
      const p = at(t), r = at(t + LEG, 5, 9); wake.setAttribute('d', d); back.setAttribute('d', e); backTip.setAttribute('cx', r[0].toFixed(2)); backTip.setAttribute('cy', r[1].toFixed(2));   // one light goes out as the other comes back: the paper's two directions of the same calculation
      tip.setAttribute('cx', p[0].toFixed(2)); tip.setAttribute('cy', p[1].toFixed(2)); glow.setAttribute('cx', p[0].toFixed(2)); glow.setAttribute('cy', p[1].toFixed(2));
    }
    tick(0);
    return { tick, destroy() { g.remove(); } };
  }

  /* ================= 4. the exhibit =============================================================================== */
  const SPR = ['x', 'y', 'r', 'o', 'bow', 'wh', 'wf', 'blk', 'hot', 'kept', 'sel', 'lab', 'leaf', 'rec', 'cnt', 'fold'];
  function mount(el, opts = {}) {
    el.classList.add('egn-memory'); if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const box = H('div', 'egm', el);
    box.innerHTML = `<svg class="egm-svg" aria-hidden="true"></svg>
      <p class="egm-heads" aria-hidden="true"></p>
      <aside class="egm-side"><div class="egm-ans" aria-live="polite"><p class="egm-q"></p><p class="egm-val"></p><p class="egm-rest"></p><div class="egm-cost"><p><i></i><span></span></p><p><i></i><span></span></p></div><p class="egm-moved"></p></div>
        <p class="egm-h"><span class="egm-h-lab">The notebook</span><span class="egm-h-eig">Sources, each with its address</span></p><ol class="egm-lines"></ol>
        <p class="egm-out">This paper supports <a data-to="search"></a> and <a data-to="change"></a></p></aside>
      <p class="egm-status" aria-live="polite"></p>
      <div class="egm-bar"><div class="egm-grp" role="group" aria-label="Ask a question"><span>Ask</span></div><div class="egm-grp" role="group" aria-label="Change the notebook"><span>Change</span></div><div class="egm-grp"><button type="button" class="egm-grow">Add three batches like A</button><button type="button" class="egm-fold"></button></div></div>`;
    const svg = box.querySelector('svg'), side = box.querySelector('.egm-side'), ol = box.querySelector('.egm-lines'), bar = box.querySelector('.egm-bar'), status = box.querySelector('.egm-status'), heads = box.querySelector('.egm-heads');
    const $q = box.querySelector('.egm-q'), $val = box.querySelector('.egm-val'), $rest = box.querySelector('.egm-rest'), $moved = box.querySelector('.egm-moved'), foldBtn = box.querySelector('.egm-fold'), growBtn = box.querySelector('.egm-grow'), $cost = [...box.querySelectorAll('.egm-cost p')];
    const G = {}; ['thr', 'edge', 'flow', 'node', 'lab', 'call'].forEach(k => G[k] = S('g', { class: 'egm-g-' + k }, svg));
    const GR = window.EIGEN_GRAPH; box.querySelectorAll('.egm-out a').forEach(a => { const n = GR && GR.nodes[a.dataset.to]; a.textContent = n ? n.title : a.dataset.to; a.href = n ? (n.page || `/eigenengine/${n.slug || a.dataset.to}/`) : '#'; });
    FIELDS.forEach(f => H('span', '', heads, f.name));

    const st = { mode: 'records', q: -1, ed: { correct: false, add: false, withdraw: false }, grow: false, sel: 0, skin: 'lab' };
    const V = new Map(), T = new Map(), lineEl = {}, lineY = {}, calls = [];
    let base = remember(notebook({})), handed = false;
    let mem = base, edKey = '', ans = null, geo = null, dead = false, raf = 0, last = 0, clock = 0, flowP = 9, flowTo = 0, measureFor = 0, timers = [], W = 0, Hh = 0, first = true, skinO = new Spring(0), said0 = '';

    /* ---- the notebook, as words ---- */
    notebook({ add: true }).forEach(l => {
      const li = H('li', '', ol), b = H('button', '', li); b.type = 'button'; lineEl[l.id] = li;
      b.onclick = () => { const to = st.sel === l.id ? 0 : l.id; byHand(); st.sel = to; retarget(); announce(); };
    });
    lineEl.m = H('li', 'more gone', ol, '<p><i>10\u201315</i><span>Batches E, F and G: each as batch A.</span></p>');
    function writeLines() {
      const L = notebook(st.ed), rest = ans ? ans.rest : [];
      lineEl.m.classList.toggle('gone', !st.grow); lineEl.m.classList.toggle('rest', st.grow && rest.some(id => id > 9));
      L.forEach(l => {
        if (l.more) return; const li = lineEl[l.id], b = li.firstChild;
        const small = geo.size !== 'full', html = `<i>${l.id}</i><span>${l.second ? (small ? 'Second notebook, ' : 'Second notebook, batch ') : small ? '' : 'Batch '}${l.batch}${small ? '' : ','} ${l.treat}: ` + (l.second ? `<mark>1 more intact</mark>` : `<mark>${l.was ? `<s>${l.was}</s> ` : ''}${l.cracked} cracked</mark>, <mark>${l.intact} intact</mark>`) + `.</span>`;
        if (b.dataset.h !== html) { b.innerHTML = html; b.dataset.h = html; }
        li.classList.toggle('off', !!l.off && !l.second); li.classList.toggle('gone', !!l.off && !!l.second); li.classList.toggle('new', !!l.was || (!!l.second && !l.off));
        li.classList.toggle('rest', !l.off && rest.includes(l.id)); li.classList.toggle('sel', st.sel === l.id); b.setAttribute('aria-pressed', st.sel === l.id);
        b.setAttribute('aria-label', `Line ${l.id}${l.off ? ', withdrawn' : ''}: trace it through the memory`);
      });
      measureFor = 50;
    }
    function measure() { const r0 = box.getBoundingClientRect(); for (const id in lineEl) { const r = lineEl[id].getBoundingClientRect(); lineY[id] = r.height > 2 ? r.top + r.height / 2 - r0.top : null; } for (let id = 10; id <= 15; id++) lineY[id] = lineY.m; }

    /* ---- controls ---- */
    const qBtns = QUESTIONS.map((q, i) => { const b = H('button', '', bar.children[0], q.chip); b.type = 'button'; b.onclick = () => { byHand(); st.q = st.q === i ? -1 : i; if (st.mode === 'records') st.mode = 'tree'; retarget('ask'); announce(); }; return b; });
    const eBtns = Object.keys(EDITS).map(k => { const b = H('button', '', bar.children[1], EDITS[k].label); b.type = 'button'; b.onclick = () => { byHand(); st.ed[k] = !st.ed[k]; if (st.mode === 'records') st.mode = 'tree'; retarget('edit'); announce(k); }; b.dataset.e = k; return b; });
    foldBtn.onclick = () => { byHand(); st.mode = st.mode === 'fold' ? 'tree' : 'fold'; retarget('mode'); announce(); };
    growBtn.onclick = () => { byHand(); st.grow = !st.grow; if (st.mode === 'records') st.mode = 'tree'; retarget('edit'); announce(); };
    function byHand() { timers = []; handed = true; st.sel = 0; }
    function announce() { el.dispatchEvent(new CustomEvent('eigen-exhibit-change', { bubbles: true, detail: { node: 'memory', text: said0 } })); }
    function sync() {
      qBtns.forEach((b, i) => b.setAttribute('aria-pressed', st.q === i)); eBtns.forEach(b => b.setAttribute('aria-pressed', st.ed[b.dataset.e]));
      foldBtn.textContent = st.mode === 'fold' ? 'Unfold the states' : 'Fold shared states'; foldBtn.setAttribute('aria-pressed', st.mode === 'fold'); growBtn.setAttribute('aria-pressed', st.grow);
      box.dataset.mode = st.mode; box.dataset.skin = st.skin; box.dataset.asked = st.q >= 0 ? 1 : 0;
    }

    /* ---- geometry ---- */
    function geometry() {
      W = el.clientWidth; Hh = el.clientHeight;
      const stack = W < 470 && Hh >= 520, size = stack ? 'compact' : W < 470 || Hh < 290 ? 'tiny' : W < 900 || Hh < 540 ? 'compact' : 'full'; box.dataset.size = size; box.dataset.stack = stack ? 1 : 0; box.dataset.short = size === 'compact' && !stack && Hh < 420 ? 1 : 0;
      const big = size === 'full' ? clamp(Math.min(W / 1100, Hh / 640), 1, 1.9) : 1, pad = size === 'full' ? Math.round(22 * big) : size === 'compact' ? 12 : 8, k = size === 'full' ? big : size === 'compact' ? .8 : .62;
      const sideW = stack || size === 'tiny' ? 0 : size === 'compact' ? clamp(W * .37, 208, 262) : clamp(W * .31, 290, 360 * big);
      const barH = size === 'tiny' ? 0 : bar.offsetHeight, cutY = stack ? 310 : 0;
      side.style.width = stack ? (W - pad * 2) + 'px' : sideW + 'px'; side.style.top = stack ? cutY + 'px' : ''; side.style.left = stack ? pad + 'px' : '';
      side.style.bottom = (barH + pad) + 'px'; status.style.bottom = (barH + 7) + 'px'; status.style.maxWidth = (W - sideW - pad * 2 - 14) + 'px';
      const room = size === 'tiny' ? 12 : stack ? 62 : size === 'compact' ? 88 : 132 * big, rootR = 17 * k;
      const gx0 = pad + rootR + 4, gx1 = W - sideW - pad - room - (size === 'tiny' ? 0 : 14), gy0 = pad + (size === 'tiny' ? 10 : 34 * big), gy1 = stack ? cutY - 16 : Hh - barH - (size === 'tiny' ? 30 : 44 * big);
      geo = { size, stack, pad, k, sideW, barH, gx0, gx1, gy0, gy1, X: [0, .3, .64, 1].map(u => gx0 + (gx1 - gx0) * u), XF: [0, .3, .64, 1].map(u => gx0 + (gx1 + room * (size === 'tiny' ? 0 : .52) - gx0) * u), bow: size === 'full' ? 30 * big : size === 'compact' ? 21 : 13, sideX: W - sideW - pad - 8, xRec: gx0 + (gx1 - gx0) * (stack ? 1 : size === 'full' ? .5 : .62), fs: size === 'full' ? 12.5 * big : 11.5, big };
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.style.fontSize = geo.fs + 'px';
      [...heads.children].forEach((s, i) => { s.style.left = ((geo.X[i] + geo.X[i + 1]) / 2) + 'px'; }); heads.style.top = (pad - 2) + 'px';
    }
    const rad = n => (3 + 2.15 * Math.sqrt(n)) * geo.k;

    /* ---- one view per prefix of the tree; a view outlives its prefix long enough to fade ---- */
    function view(n) {
      let v = V.get(n.key); if (v) { v.n = n; return v; }
      const p = n.parent && V.get(n.parent.key);
      v = { key: n.key, d: n.d, n, born: true }; SPR.forEach(k => v[k] = k === 'x' || k === 'y' || k === 'r' || k === 'bow' ? new Spring(0, 62, 15.8) : new Spring(0));
      v.x.snap(p && !first ? p.x.v : geo.X[n.d]); v.y.snap(p && !first ? p.y.v : n.ty);
      if (n.d) { v.e = S('path', { class: 'egm-e' }, G.edge); v.eh = S('path', { class: 'egm-eh', pathLength: 1, 'stroke-dasharray': 1 }, G.flow); v.ef = S('path', { class: 'egm-ef', pathLength: 1, 'stroke-dasharray': 1 }, G.flow);
        v.stop = S('path', { class: 'egm-stop' }, G.flow); v.dot = S('circle', { class: 'egm-dot' }, G.flow); v.tl = S('text', { class: 'egm-t', 'text-anchor': 'middle' }, G.lab); }
      v.ring = S('circle', { class: 'egm-ring' }, G.node); v.c = S('circle', { class: 'egm-n' + (n.d === 3 ? ' leaf' : '') }, G.node);
      if (n.d === 3) { v.ll = S('text', { class: 'egm-t egm-ll' }, G.lab); v.rl = S('text', { class: 'egm-t egm-rl', 'text-anchor': 'end' }, G.lab); } else v.cn = S('text', { class: 'egm-t egm-cn', 'text-anchor': 'middle' }, G.lab);
      V.set(n.key, v); return v;
    }
    const drop = v => ['e', 'eh', 'ef', 'stop', 'dot', 'tl', 'ring', 'c', 'll', 'rl', 'cn'].forEach(k => v[k] && v[k].remove());

    /* ---- everything on screen follows from the state: where each prefix should be, what it carries, what is said ---- */
    function retarget(why) {
      const fold = st.mode === 'fold', rec = st.mode === 'records', tiny = geo.size === 'tiny', ex = expert(), anyEdit = st.ed.correct || st.ed.add || st.ed.withdraw;
      const edNow = JSON.stringify([st.ed, st.grow]); if (edNow !== edKey) { mem = remember(notebook(Object.assign({ grow: st.grow }, st.ed))); base = remember(notebook({ grow: st.grow })); edKey = edNow; }
      let ix = 0; (function number(n) { n.ix = ix++; n.kids.forEach(number); })(mem.root);
      const hotOf = n => { if (n.hot !== undefined) return n.hot; const b = base.nodes.get(n.key); let h = !b || b.n !== n.n || (n.d === 3 && JSON.stringify(b.by) !== JSON.stringify(n.by)); n.kids.forEach(k => { if (hotOf(k)) h = true; }); return n.hot = !!(anyEdit && h); }; hotOf(mem.root);   // a prefix is rewritten when its count or its sources change, or anything beneath it does
      const q = QUESTIONS[st.q]; ans = q ? answer(mem, q, fold) : null;
      // the tree: leaves evenly down the stage with a little air between batches; a prefix sits amid its children
      const { X, gy0, gy1 } = geo; let slots = 0, prev = null; const pos = [];
      mem.leaves.forEach(l => { if (prev !== null && l.vals[0] !== prev) slots += .5; prev = l.vals[0]; pos.push(slots); slots += 1; });
      mem.leaves.forEach((l, i) => l.ty = gy0 + (gy1 - gy0) * (slots > 1 ? pos[i] / (slots - 1) : .5));
      (function up(n) { if (n.d < 3) { n.kids.forEach(up); n.ty = n.kids.reduce((a, c) => a + c.ty, 0) / n.kids.length; } })(mem.root);
      // the folded graph: the states of each cut, in the order of the paths that reach them
      const cy = (gy0 + gy1) / 2, cut = [[], [], [], []];
      mem.states.forEach(s => { s.my = s.members.reduce((a, m) => a + m.ty, 0) / s.members.length; s.ord = Math.min(...s.members.map(m => m.ix)); cut[s.d].push(s); });
      const dense = (gy1 - gy0) / Math.max(1, slots - 1) < geo.fs * 1.04;   // too many records for their labels: the discs stay, the words go
      cut.forEach(a => { a.sort((p, r) => p.ord - r.ord); const gap = Math.min((gy1 - gy0) * .66 / Math.max(1, a.length - 1), (gy1 - gy0) * .34); a.forEach((s, i) => s.sy = cy + (i - (a.length - 1) / 2) * gap); });
      const par = new Map(), firstOf = new Set(), sumH = new Map(), sumF = new Map();
      mem.nodes.forEach(n => { if (!n.parent) return; const key = n.parent.state.key + '>' + n.state.key, sym = n.vals[n.d - 1]; let a = par.get(key); if (!a) par.set(key, a = []); if (!a.includes(sym)) a.push(sym); });
      par.forEach((a, key) => { const f = FIELDS[+key[0]].values; a.sort((p, r) => f.indexOf(p) - f.indexOf(r)); });
      const mass = n => { if (!q || n.d > ans.last + 1) return [0, 0, 0]; const h = passes(n, q.cond), f = passes(n, q.event); return [h ? n.n / mem.W : 0, f ? n.n / mem.W : 0, !h && passes(n.parent, q.cond) ? 1 : 0]; };
      mem.nodes.forEach(n => { if (!n.parent) return; const gk = n.parent.state.key + '>' + n.vals[n.d - 1], [h, f] = mass(n); sumH.set(gk, (sumH.get(gk) || 0) + h); sumF.set(gk, (sumF.get(gk) || 0) + f); });
      const wide = m => m > 0 ? (1.4 + 10 * Math.sqrt(m)) * geo.k : 0;
      const was = st.was || st.mode, delay = n => M.off || why !== 'mode' ? 0 : fold ? (3 - n.d) * .3 : was === 'fold' ? n.d * .26 : n.d < 3 ? (2 - n.d) * .28 : 0;
      mem.nodes.forEach(n => {
        const v = view(n), sym = n.d ? n.vals[n.d - 1] : '', gk = n.parent ? n.parent.state.key + '>' + sym : '', pk = n.parent ? n.parent.state.key + '>' + n.state.key : '';
        const a = par.get(pk) || [sym], lead = fold ? !firstOf.has(gk) : true; firstOf.add(gk);
        const [h, f, blk] = n.parent ? mass(n) : [0, 0, 0], hot = n.hot && !(fold && n.d === 3), same = anyEdit && !n.hot && base.states.has(n.state.key);
        v.goal = { x: rec && n.d === 3 ? geo.xRec : fold ? geo.XF[n.d] : X[n.d], y: fold ? n.state.sy : n.ty, r: rad(fold ? n.state.n : n.n), o: rec && n.d < 3 ? 0 : 1, bow: fold ? (a.indexOf(sym) - (a.length - 1) / 2) * geo.bow : 0,
          wh: wide(fold ? sumH.get(gk) : h), wf: wide(fold ? sumF.get(gk) : f), blk, hot: hot ? 1 : 0, kept: (same && n.d < 3) || (anyEdit && fold && n.d === 3 && n === n.state.members[0]) ? 1 : 0, sel: st.sel && n.src.has(st.sel) ? 1 : 0,
          fold: fold ? 1 : 0, lab: tiny || rec || !lead || (n.d === 3 && !fold) ? 0 : 1, leaf: n.d === 3 && !fold && !tiny && !dense ? 1 : 0, rec: n.d === 3 && rec && !tiny && !dense ? 1 : 0, cnt: ex && !rec && geo.size === 'full' && n.d < 3 && (!fold || n === n.state.members[0]) ? 1 : 0 };
        v.wait = delay(n); v.gone = false;
        if (v.born) { v.born = false; if (first) { ['x', 'y', 'r'].forEach(k => v[k].snap(v.goal[k])); } }
        if (v.tl) { const [p, r] = frac(n.n, n.parent.n); v.tl.textContent = ex ? `${sym} ${p}/${r}` : sym; }
        if (v.ll) { v.ll.textContent = ''; S('tspan', {}, v.ll).textContent = sym + ' '; S('tspan', { class: 'egm-num' }, v.ll).textContent = n.n; v.rl.textContent = n.vals[0] + ', ' + n.vals[1]; }
        if (v.cn) v.cn.textContent = fold ? n.state.n : n.n;
      });
      V.forEach(v => { if (!mem.nodes.has(v.key) && !v.gone) { v.gone = true; v.wait = 0; v.goal = { o: 0, r: 0, wh: 0, wf: 0, lab: 0, leaf: 0, rec: 0, hot: 1, cnt: 0 }; } });
      // threads from each record to the lines that report it
      const noThr = tiny || geo.stack, want = new Set(), baseO = noThr ? 0 : rec ? .5 : fold ? 0 : .17;
      mem.leaves.forEach(l => Object.keys(l.by).forEach(id => { const key = l.key + '@' + id; want.add(key); let t = T.get(key); if (!t) T.set(key, t = { leaf: l.key, line: +id, o: new Spring(0), el: S('path', { class: 'egm-thr' }, G.thr) });
        const rests = q && passes(l, q.cond); t.o.to(noThr ? 0 : st.sel ? (st.sel === +id ? .9 : baseO * .35) : rests ? Math.max(baseO, .5) : baseO); t.el.classList.toggle('on', st.sel === +id); }));
      T.forEach((t, key) => { if (!want.has(key)) { t.o.to(0); t.gone = true; } else t.gone = false; });
      // the callouts of the last step: EigenEngine's own names, attached to the parts they name
      calls.forEach(c => c.el.remove()); calls.length = 0;
      if (st.skin === 'eigen' && !tiny) {
        const hotInner = [...mem.nodes.values()].filter(n => n.d === 1 && n.hot)[0], keptInner = [...mem.nodes.values()].filter(n => n.d === 1 && !n.hot && base.states.has(n.state.key))[0];
        [[hotInner, 'needs review', 'coral', -1], [keptInner, 'current', 'teal', 1]].forEach(([n, text, cls, dir]) => { if (n) calls.push({ key: n.key, dir: geo.size === 'full' ? dir : -1, el: S('text', { class: 'egm-call ' + cls, 'text-anchor': geo.size === 'full' ? 'middle' : 'end' }, G.call) }); if (n) calls[calls.length - 1].el.textContent = text; });
      }
      skinO.to(st.skin === 'eigen' ? 1 : 0);
      if (why === 'ask' || why === 'replay') { flowP = M.off ? 9 : 0; } flowTo = ans ? ans.last + 2.2 : 0;
      st.was = st.mode; first = false;
      writeLines(); sync(); say(why);
    }

    /* ---- what the figure says about itself, computed from the state ---- */
    function say() {
      const fold = st.mode === 'fold', q = QUESTIONS[st.q], ex = expert(), nL = mem.leaves.length, nS = mem.states.size, anyEdit = st.ed.correct || st.ed.add || st.ed.withdraw, small = geo.size !== 'full';
      const live = notebook(Object.assign({ grow: st.grow }, st.ed)).filter(l => !l.off).length;
      let s = st.mode === 'records' ? `The ${nL} records hold the ${mem.W} samples, and each is tied to the line that reports it.` : fold ? `The ${nL} records share ${nS} ${ex ? 'continuation states' : 'states'}.` + (st.grow ? ' Each added batch costs one more link at the root, and nothing beyond it.' : '') : `Each of the ${nL} records has a path of its own.`;
      let edit = '', moved = '', lead = '', cost = '';
      if (q) {
        const f = answer(mem, q, true).links, t = answer(mem, q, false).links, top = Math.max(f, t, 1);
        $q.textContent = small ? q.brief : q.ask; $val.innerHTML = ans.den ? `<b>${said(ans.num, ans.den)}</b><span>${ans.num} of ${ans.den} ${q.unit} ${q.verb}</span>` : `<b>undefined</b><span>no ${q.unit} are recorded</span>`;
        $rest.textContent = !ans.den ? '' : ans.rest.length === live ? 'It rests on every line of the notebook.' : ans.rest.length > 5 ? `It rests on ${ans.rest.length} of the ${live} lines.` : `It rests on line${ans.rest.length > 1 ? 's' : ''} ${listed(ans.rest)}.`;
        [[f, 'through shared states', fold], [t, 'one path at a time', !fold]].forEach(([n, name, on], i) => { $cost[i].firstChild.style.width = (n / top * 100) + '%'; $cost[i].lastChild.innerHTML = `<b>${n}</b> links ${name}`; $cost[i].classList.toggle('on', on); });
        lead = ans.den ? `Of the ${q.unit}, ${said(ans.num, ans.den)} ${q.verb}.` : 'No record is left for the question to ask about.';
        cost = fold ? `Through shared states the question touches ${f} links, against ${t} one path at a time.` : `Worked one path at a time the question touches ${t} links, against ${f} through shared states.`;
      } else { $q.textContent = 'The memory holds'; $val.innerHTML = `<b>${mem.W}</b><span>samples, in ${nL} records read from ${live} lines</span>`; $rest.textContent = st.mode === 'records' ? 'Each count is kept beside its words.' : 'It has not yet been asked a question.'; }
      if (anyEdit) {
        const gone = [...base.nodes.values()].filter(n => !mem.nodes.has(n.key)), hot = [...mem.nodes.values()].filter(n => n.hot).length + gone.length, paths = mem.leaves.filter(n => n.hot).length + gone.filter(n => n.d === 3).length;
        const kept = [...mem.states.keys()].filter(k => base.states.has(k)).length;
        edit = `The counts at ${hot} ${ex ? 'prefixes' : 'points'} of ${paths === 1 ? 'one path' : paths + ' paths'} are rewritten, and ${kept} of the ${nS} states keep their work.`; s = edit;
        if (q) { const b = answer(base, q, fold), lines = Object.keys(EDITS).filter(k => st.ed[k]).map(k => EDITS[k].line).sort((x, y) => x - y), hit = lines.filter(id => b.rest.includes(id) || ans.rest.includes(id));
          moved = !ans.den ? 'No record is left for the question to ask about, so the answer is undefined.' : !hit.length ? `The answer stands at ${said(ans.num, ans.den)}: none of the lines it rests on has changed.`
            : ans.num * b.den === b.num * ans.den ? `The answer is still ${said(ans.num, ans.den)}, although line${hit.length > 1 ? 's' : ''} ${listed(hit)} changed.` : `The answer moves from ${said(b.num, b.den)} to ${said(ans.num, ans.den)}, because line${hit.length > 1 ? 's' : ''} ${listed(hit)} changed.`; }
      }
      status.textContent = geo.stack ? '' : geo.size === 'tiny' ? (q ? q.brief + ' ' + (ans.den ? Cap(said(ans.num, ans.den)) + '.' : 'Undefined.') : s) : s + (moved ? ' ' + moved : '');
      $moved.textContent = geo.stack ? (edit ? edit + ' ' : '') + moved : '';
      said0 = q ? lead + ' ' + (moved || cost) : s;   // the figure's own account in two sentences at most, for a host's caption once the reader has taken over
    }

    /* ---- every frame: springs, then the picture, drawn from live positions so no link can come loose ---- */
    function frame(now) {
      if (dead) return; raf = requestAnimationFrame(frame);
      const dt = Math.min(.1, Math.max(0, (now - last) / 1000 || 0)); last = now;
      if (el.clientWidth !== W || el.clientHeight !== Hh) { if (!el.clientWidth) return; geometry(); retarget('size'); measure(); }
      if (measureFor > 0) { measureFor--; measure(); }
      if (timers.length) { const due = timers.filter(t => (t.at -= M.off ? 9 : dt) <= 0); timers = timers.filter(t => t.at > 0); due.forEach(t => t.fn()); }
      V.forEach(v => { if (v.goal && (v.wait -= dt) <= 0) { for (const k in v.goal) v[k].to(v.goal[k]); v.goal = null; } });
      const n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
      for (let i = 0; i < n; i++) { V.forEach(v => { for (let j = 0; j < SPR.length; j++) v[SPR[j]].step(h); }); T.forEach(t => t.o.step(h)); skinO.step(h); }
      clock += dt; flowP = M.off ? 9 : Math.min(flowTo, flowP + dt * 1.5);
      draw();
    }
    function draw() {
      const k = geo.k, fold = st.mode === 'fold';
      V.forEach(v => {
        const x = v.x.v, y = v.y.v, r = Math.max(0, v.r.v), o = clamp(v.o.v);
        if (v.gone && o < .02) { drop(v); V.delete(v.key); return; }
        v.c.setAttribute('cx', x); v.c.setAttribute('cy', y); v.c.setAttribute('r', r); v.c.style.opacity = o;
        const mark = Math.max(v.hot.v, v.kept.v); v.ring.setAttribute('cx', x); v.ring.setAttribute('cy', y); v.ring.setAttribute('r', r + 3.6 * k); v.ring.style.opacity = clamp(mark) * o; v.ring.classList.toggle('kept', v.kept.v > v.hot.v);
        const p = v.d && V.get(v.n.parent.key);
        if (p) {
          const px = p.x.v, py = p.y.v, dx = x - px, bow = v.bow.v, ax = px + dx * .45, ay = py + bow, bx = x - dx * .45, by = y + bow, eo = o * clamp(p.o.v), sel = clamp(v.sel.v);
          const d = `M${px.toFixed(1)},${py.toFixed(1)}C${ax.toFixed(1)},${ay.toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
          v.e.setAttribute('d', d); v.e.style.opacity = eo * (.4 + .6 * sel); v.e.style.strokeWidth = (1.1 + 1.3 * sel) * k; v.e.classList.toggle('sel', sel > .5);
          const rev = clamp(flowP - (v.d - 1)), wh = v.wh.v, wf = v.wf.v;
          v.eh.setAttribute('d', d); v.eh.style.strokeWidth = Math.max(0, wh); v.eh.style.opacity = wh > .3 && rev > .01 ? eo * .3 : 0; v.eh.setAttribute('stroke-dashoffset', 1 - rev);
          v.ef.setAttribute('d', d); v.ef.style.strokeWidth = Math.max(0, wf); v.ef.style.opacity = wf > .3 && rev > .01 ? eo * .92 : 0; v.ef.setAttribute('stroke-dashoffset', 1 - rev);
          const s = bez(px, py, ax, ay, bx, by, x, y, .6), s2 = bez(px, py, ax, ay, bx, by, x, y, .64), nx = -(s2[1] - s[1]), ny = s2[0] - s[0], nl = Math.hypot(nx, ny) || 1, t = 5.5 * k;
          v.stop.setAttribute('d', `M${(s[0] - nx / nl * t).toFixed(1)},${(s[1] - ny / nl * t).toFixed(1)}L${(s[0] + nx / nl * t).toFixed(1)},${(s[1] + ny / nl * t).toFixed(1)}`); v.stop.style.opacity = clamp(v.blk.v) * eo * rev;
          const u = (clock * .42 - (v.d - 1) * .31) % 1, uu = u < 0 ? u + 1 : u, pd = bez(px, py, ax, ay, bx, by, x, y, uu);
          v.dot.setAttribute('cx', pd[0]); v.dot.setAttribute('cy', pd[1]); v.dot.setAttribute('r', Math.max(0, 1 + wf * .28)); v.dot.style.opacity = M.off || wf < .3 || rev < .99 ? 0 : eo * Math.sin(Math.PI * uu) * .95;
          const pl = bez(px, py, ax, ay, bx, by, x, y, mix(.72, v.d === 1 ? .56 : .3, clamp(v.fold.v))); v.tl.setAttribute('x', pl[0]); v.tl.setAttribute('y', pl[1] + mix(-5 - Math.max(wf, wh) * .5, geo.fs * .34, clamp(v.fold.v)));   // above its link in the tree, on it in the folded graph
          v.tl.style.opacity = clamp(v.lab.v) * eo;
        } else if (v.d) ['e', 'eh', 'ef', 'stop', 'dot', 'tl'].forEach(k => v[k].style.opacity = 0);
        if (v.ll) { v.ll.setAttribute('x', x + r + 6); v.ll.setAttribute('y', y + geo.fs * .34); v.ll.style.opacity = clamp(v.leaf.v) * o; v.rl.setAttribute('x', x - r - 8); v.rl.setAttribute('y', y + geo.fs * .34); v.rl.style.opacity = clamp(v.rec.v) * o; }
        if (v.cn) { v.cn.setAttribute('x', x); v.cn.setAttribute('y', y + r + geo.fs + 1); v.cn.style.opacity = clamp(v.cnt.v) * o; }
      });
      T.forEach((t, key) => {
        const v = V.get(t.leaf), o = clamp(t.o.v), ly = lineY[t.line];
        if (t.gone && o < .02) { t.el.remove(); T.delete(key); return; }
        if (!v || ly == null || o < .01) { t.el.style.opacity = 0; return; }
        const x1 = v.x.v + v.r.v + 4 + clamp(v.leaf.v) * (geo.size === 'full' ? 76 * geo.big : 64), y1 = v.y.v, x2 = geo.sideX, mx = (x1 + x2) / 2;
        t.el.setAttribute('d', `M${x1.toFixed(1)},${y1.toFixed(1)}C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${ly.toFixed(1)} ${x2},${ly.toFixed(1)}`); t.el.style.opacity = o * clamp(v.o.v);
      });
      calls.forEach(c => { const v = V.get(c.key); if (!v) return; c.el.setAttribute('x', geo.size === 'full' ? v.x.v : v.x.v + v.r.v); c.el.setAttribute('y', v.y.v + c.dir * (v.r.v + 14 * k) + (c.dir > 0 ? geo.fs * .7 : 0)); c.el.style.opacity = clamp(skinO.v) * clamp(v.o.v); });
    }

    /* ---- the six steps: each is a state of the same figure ---- */
    function step(i) {
      timers = []; handed = false; st.sel = 0; st.grow = false; st.skin = i === 5 ? 'eigen' : 'lab';
      const none = { correct: false, add: false, withdraw: false }, was = st.mode;
      st.mode = i === 0 ? 'records' : i === 1 ? 'tree' : 'fold'; st.q = i >= 3 ? 0 : -1; st.ed = i === 5 ? { correct: true, add: false, withdraw: false } : none;
      retarget(st.mode !== was ? 'mode' : i === 3 ? 'replay' : 'step'); if (i === 3 && st.mode !== was) { flowP = M.off ? 9 : -2.2; }
      if (i === 0 && !M.off) { let k = 0; const walk = () => { st.sel = k % 8 + 1; k++; retarget(); timers.push({ at: 1.25, fn: walk }); }; timers.push({ at: 1.1, fn: walk }); }
      if (i === 4) timers.push({ at: st.mode !== was ? 3 : 1.6, fn: () => { st.ed = { correct: true, add: false, withdraw: false }; retarget('edit'); } });
    }
    const onLevel = () => { retarget('level'); if (handed) announce(); };
    window.addEventListener('eigen-level', onLevel);
    geometry(); retarget('step'); measure(); V.forEach(v => { if (v.goal) { for (const k in v.goal) v[k].to(v.goal[k]); v.goal = null; } });
    last = performance.now(); raf = requestAnimationFrame(frame);
    return { step, destroy() { dead = true; cancelAnimationFrame(raf); window.removeEventListener('eigen-level', onLevel); box.remove(); }, get state() { return { ...st, ed: { ...st.ed }, answer: ans && { ...ans }, records: mem.leaves.length, states: mem.states.size, said: said0 }; }, views: V, threads: T, lineY };
  }

  /* ================= 5. why whole records are kept (the node's own page) ==========================================
     The paper's four records 000, 011, 101, 110. Each label alone is balanced and each pair is independent, yet the
     third is fixed by the other two. Tallies lose that; whole records keep it. */
  function parity(el) {
    el.classList.add('egn-memory');
    const R = [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]], pick = [0, 0];
    const box = H('div', 'egm-par', el, `<div class="egm-par-recs"><p class="egm-h">Four whole records</p><div class="egm-par-rows"></div></div>
      <div class="egm-par-ask"><p class="egm-h">Fix the first two labels</p><div class="egm-par-pick"></div><p class="egm-par-out" aria-live="polite"></p></div>
      <div class="egm-par-tal"><p class="egm-h">Separate tallies of the same four</p><div class="egm-par-bars"></div><p class="egm-par-say" aria-live="polite"></p></div>`);
    const rows = box.querySelector('.egm-par-rows'), bars = box.querySelector('.egm-par-bars'), out = box.querySelector('.egm-par-out'), sayEl = box.querySelector('.egm-par-say'), pk = box.querySelector('.egm-par-pick');
    const rowEl = R.map(r => H('div', 'egm-par-row', rows, r.map((b, i) => `<span class="${b ? 'on' : ''}" title="${'ABC'[i]} = ${b}"><i>${'ABC'[i]}</i>${b}</span>`).join('')));
    ['A', 'B', 'C'].forEach((n, i) => H('div', 'egm-par-bar', bars, `<b>${n}</b><span><i style="width:50%"></i></span><em>1 in 2</em>`));
    const pairs = H('div', 'egm-par-pairs'); bars.after(pairs);   // each pair of labels: the four combinations, one record apiece
    [[0, 1], [0, 2], [1, 2]].forEach(([i, j]) => H('div', '', pairs, `<b>${'ABC'[i]} with ${'ABC'[j]}</b>` + [0, 1].map(x => `<em>${x}</em>` + [0, 1].map(y => `<span>${R.filter(r => r[i] === x && r[j] === y).length}</span>`).join('')).join('')));
    const btn = [0, 1].map(i => { const w = H('div', 'egm-par-sw', pk, `<span>${'AB'[i]}</span>`); return [0, 1].map(v => { const b = H('button', '', w, String(v)); b.type = 'button'; b.onclick = () => { pick[i] = v; show(); }; return b; }); });
    function show() {
      btn.forEach((pair, i) => pair.forEach((b, v) => b.setAttribute('aria-pressed', pick[i] === v)));
      const left = R.filter(r => r[0] === pick[0] && r[1] === pick[1]); rowEl.forEach((e, i) => e.classList.toggle('dim', !left.includes(R[i])));
      const c = left[0][2];
      out.innerHTML = `<b>C = ${c}</b>, with certainty. One record has A = ${pick[0]} and B = ${pick[1]}, and it fixes C.`;
      sayEl.innerHTML = `Tallied alone, C equals 1 in <b>half</b> of the records, and the tally cannot say which half. Every pair of labels is as balanced as each label alone: each of its four combinations occurs once. No tally of one label or of two therefore holds the relation.`;
    }
    show();
    return { destroy() { box.remove(); } };
  }

  /* ================= registration ================================================================================= */
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.memory = {
    title: 'Dynamic Memory',
    line: 'What does a question cost, and what does a correction disturb?',
    question: 'What does a question cost, and what does a correction disturb?',
    tag: 'Pre-pre-print · an early example',
    text: TEXT,
    pdf: { href: '/assets/docs/dynamic-memory-early-experiment.pdf', pages: 22 },
    out: [{ href: '/assets/docs/dynamic-memory-early-experiment.pdf', label: 'Read the paper (PDF)' }],
    art,
    exhibit: { steps: STEPS, mount },
    sections: [{ title: 'A relation no tally holds', line: two('In these four records every label is balanced and every pair of labels is independent, and yet any two labels fix the third. This is the reason the memory keeps records whole.',
      'The records \\((A,B,C)=000,\\,011,\\,101,\\,110\\) have unbiased fields and independent pairs, yet \\(A=B=0\\) forces \\(C=0\\). The relation survives in the joint law \\(p(x)\\) and in no marginal.'), mount: parity }],
    model: { remember, notebook, answer, QUESTIONS, FIELDS }
  };
})();
