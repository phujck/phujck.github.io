/* Node "network": How do projects join up?
   One world of circles and one camera. A record, a result, a project, a network of projects and a group of networks
   are all drawn by the same rule: a circle that is a dot from far away, a node from nearer, and an open hull holding
   further circles from nearer still. Every link runs from one record to another and is drawn once, so the same thread
   reads as a link between projects from a distance and lands on a single figure close up. The reader steps out until
   a project is one node, and into another to find the same structure.
   Contract: dispatch/CONTRACT.md. Everything here is scoped to the root this file creates (.nw.egn-network). */
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
  const { Spring, clamp, M } = EM;
  const mix = (a, b, t) => a + (b - a) * t;
  const fract = x => x - Math.floor(x);
  const ramp = (v, a, b) => clamp((v - a) / (b - a));
  const ease = u => u * u * u * (u * (u * 6 - 15) + 10);
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const ht = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const num = n => WORDS[n] || String(n);
  const two = (plain, expert) => ({ plain, expert, toString() { return this.plain; } });   // a text at two levels; reads as the plain one
  const isExpert = () => document.documentElement.dataset.level === 'expert';
  const pick = t => (t && typeof t === 'object') ? (isExpert() && t.expert ? t.expert : t.plain) : t;

  /* ---- the world --------------------------------------------------------------------------------------------
     A result is an envelope of records. Each record takes one of a few places, the same in every result, so that
     any two results show the same arrangement: the claim above, the step and premises that give it beneath, the
     sources at the foot, the run and the figure to the right. */
  const SLOT = { c: ['claim', -.22, -.64], c2: ['claim', -.66, -.3], s: ['step', -.22, -.16], p1: ['premise', -.66, .16], p2: ['premise', .22, .22],
    l1: ['source', -.42, .64], l2: ['source', .08, .7], l3: ['source', .56, .48], r: ['run', .56, -.06], f: ['figure', .42, -.56] };
  const KIND_WORD = { claim: 'claim', step: 'step', premise: 'premise', source: 'source', run: 'recorded run', figure: 'figure' };
  function defLinks(keys) {
    const has = k => keys.includes(k), L = [], mid = has('s') ? 's' : 'c';
    if (has('s')) L.push(['c', 's', 'requires']);
    if (has('c2')) L.push(['c', 'c2', 'requires']);
    ['p1', 'p2'].forEach(p => has(p) && L.push([mid, p, 'requires']));
    if (has('l1')) L.push([has('p1') ? 'p1' : mid, 'l1', 'supported by']);
    if (has('l2')) L.push([mid, 'l2', 'supported by']);
    if (has('l3')) L.push([mid, 'l3', 'supported by']);
    if (has('r')) L.push(['c', 'r', 'computed by']);
    if (has('f')) L.push(['c', 'f', 'shown by']);
    if (has('f') && has('r')) L.push(['f', 'r', 'computed by']);
    return L;
  }
  const R = (id, label, recs, links) => ({ id, kind: 'result', label, recs, links });
  const P = (id, label, results, o = {}) => Object.assign({ id, kind: 'project', label, results }, o);
  const GEN = [['c', 's', 'p1', 'l1', 'f'], ['c', 'p1', 'p2', 'l1', 'r', 'f'], ['c', 's', 'p1', 'p2', 'l1', 'l2'], ['c', 'c2', 's', 'l1', 'r', 'f'], ['c', 's', 'p2', 'l2', 'r']];
  const gen = (id, label, i) => R(id, label, Object.fromEntries(GEN[i % GEN.length].map(k => [k, null])));

  const OURS = [
    P('cost', 'The Cost of Complexity', [
      R('wf', 'Word frequency', { c: 'word frequency law', s: 'least-biased guess', p1: 'every rank counted alike', p2: 'known average cost', l2: 'Jaynes 1957', r: 'run for five hundred words', f: 'Figure 6' }),
      R('reg', 'Registers', { c: 'cost grows as log of rank', c2: 'choose a register, then within it', p1: 'equal refinements, equal price', l1: 'Mandelbrot 1953', f: 'Figure 2' },
        [['c', 'c2', 'requires'], ['c', 'p1', 'requires'], ['c', 'l1', 'supported by'], ['c2', 'f', 'shown by']]),
      R('ref', 'Refinement', { c: 'every level costs the same', p1: 'four times as many squares', p2: 'a cut priced by its area', l1: 'Hilbert 1891', r: 'recorded run of 85 cuts', f: 'Figure 3' },
        [['c', 'p1', 'requires'], ['c', 'p2', 'requires'], ['p1', 'l1', 'supported by'], ['c', 'r', 'computed by'], ['c', 'f', 'shown by']]),
      R('fg', 'Forgetting', { c: 'forgetting costs energy', s: 'guess, test, erase', p1: 'a failed guess is erased', l1: 'Landauer 1961', l2: 'Bérut 2015', f: 'Figure 5' },
        [['c', 's', 'requires'], ['s', 'p1', 'requires'], ['c', 'l1', 'supported by'], ['c', 'l2', 'supported by'], ['c', 'f', 'shown by']])
    ], { tone: 'cost', at: [0, 0], ring: [[0, -.58], [.58, 0], [0, .58], [-.58, 0]] }),
    P('kalmar', 'The Kalmár constant', [
      R('cap', 'Capacity', { c: 'layouts grow as a power of the range', p1: 'every register has a fixed cost', l1: 'Shannon 1948', r: 'exact counts to a million', f: 'Table I' },
        [['c', 'p1', 'requires'], ['c', 'l1', 'supported by'], ['c', 'r', 'computed by'], ['c', 'f', 'shown by']]),
      R('lay', 'Counting layouts', { c: 'eight layouts of sixteen symbols', s: 'count the ordered factorisations', p1: 'a layout is a choice of register sizes', l1: 'Kalmár 1931', f: 'Figure 1' },
        [['c', 's', 'requires'], ['s', 'p1', 'requires'], ['s', 'l1', 'supported by'], ['c', 'f', 'shown by']]),
      R('self', 'Self-description', { c: 'ten bits to hold sixteen symbols', s: 'record the layout, then its layout', p1: 'the layout must itself be held' })
    ], { at: [.62, 0], ring: [[.3, -.45], [-.5, 0], [.3, .45]] }),
    P('phases', 'The Phases of Hierarchy', [
      R('gain', 'Gain', { c: 'gain grows as the root of the number voting', s: 'majority rule', p1: 'each votes on the mismatch', f: 'Figure 1' }),
      R('edge', 'The phase boundary', { c: 'past a critical gain the loop alternates', s: 'stability of the sampled map', p1: 'held for one review period', r: 'run of the phase portraits', f: 'Figure 11' }),
      R('layers', 'Layers', { c: 'layers postpone the instability', p1: 'each stage passes a fraction', f: 'Figure 4' }),
      R('deadline', 'The deadline', { c: 'depth is bounded by the deadline', p1: 'one review for every layer', f: 'Figure 7' })
    ], { tone: 'phases', at: [-.62, 0] }),
    P('memory', 'Dynamic Memory', [
      R('merge', 'Merged futures', { c: 'equal futures are merged', p1: 'records are read field by field', l1: 'Crutchfield and Young 1989' }),
      R('ask', 'What a question costs', { c: 'cost follows the width', s: 'push the question through the layers', r: 'timing on the parity family' }),
      R('fix', 'What a correction disturbs', { c: 'a correction changes one path', p1: 'each source keeps its own count' })
    ], { tone: 'memory', at: [.47, -.47] }),
    P('laws', 'The Laws of Learning', [
      R('fates', 'Fades, computes or runs away', { c: 'three fates of a learning system', p1: 'a system that revises its own setting', f: 'the viable-window applet' }),
      R('loop', 'The adaptive loop', { c: 'the loop revises its own setting', s: 'driven, then adaptive', f: 'the adaptive-loop applet' }),
      R('faces', 'Four kinds of learner', { c: 'evolution, descent, market, reservoir', f: 'the many-faces applet' })
    ], { at: [-.47, .47] }),
    P('synth', 'Synthetics', [
      R('ingest', 'Sources as a diffusion', { c: 'cards diffuse into coarse objects', s: 'diffuse on the neighbour graph', p1: 'thirty-six source cards', f: 'the ingest applet' }),
      R('log', 'Log cost', { c: 'only log r adds over pairs of ranks', p1: 'pair rank is the product of ranks', f: 'the log-cost applet' }),
      R('reg', 'The register', { c: 'erasing a slot costs the most', p1: 'each read, write and erase has a cost', l1: 'The Cost of Complexity', f: 'the register applet' }),
      R('parity', 'Parity memory', { c: 'the rule is lost in the summaries', p1: 'single bits balanced', p2: 'pairs independent', l2: 'Dynamic Memory', f: 'the parity applet' })
    ], { at: [0, .62] }),
    P('arc', 'SuperARC', [
      R('forms', 'Three kinds of answer', { c: 'a rule, a list or a copy', p1: 'scored one hundred to ten to one', f: 'what each system answered' }),
      R('run', 'Every rule was run', { c: 'each rule regenerates its sequence', s: 'run it before submitting', r: 'the run report' }),
      R('score', 'One hundred sequences', { c: 'ninety-six answered with a rule', p1: 'a plan written before the run', r: 'the audit', f: 'the result grids' })
    ], { at: [-.47, -.47] }),
    P('twin', 'Optical twinning trees', [
      R('ask', 'One research question', { c: 'roots found with twinning trees', p1: 'a question from a physicist', l1: 'the paper' }),
      R('draft', 'The first draft, reviewed', { c: 'a second version after review', s: 'Eigen reviews its own draft', l1: 'the first version' }),
      R('talk', 'The talk', { c: 'fifteen slides from the same object', l1: 'the slides' })
    ], { at: [.47, .47] }),
    P('pages', 'These pages', [
      R('object', 'The research object', { c: 'a graph of linked records', f: 'the card' }),
      R('reading', 'From conceptrics to papers', { c: 'a paper is one projection', f: 'the card' }),
      R('change', 'Keeping it consistent', { c: 'a change marks its neighbours', f: 'the card' }),
      R('interface', 'The human interface', { c: 'one object, two representations', f: 'the card' }),
      R('network', 'The research network', { c: 'a project is one more conceptric', f: 'the card' }),
      R('made', 'What it has made', { c: 'the pieces, in the order made', f: 'the card' }),
      R('theory', 'Why it scales', { c: 'nesting keeps the cost logarithmic', l1: 'The Cost of Complexity', l2: 'The Phases of Hierarchy', l3: 'Dynamic Memory', f: 'the card' })
    ], { at: [0, -.62] })
  ];
  const CROSS = [   // record to record, across results, projects and groups; [from, to, kind]: from "requires" to
    ['eg/cost/wf/c', 'eg/cost/reg/c', 'requires'], ['eg/cost/ref/c', 'eg/cost/reg/c2', 'requires'], ['eg/cost/fg/c', 'eg/cost/reg/c', 'requires'],
    ['eg/kalmar/lay/c', 'eg/cost/reg/f', 'supported by'],
    ['eg/kalmar/cap/c', 'eg/kalmar/lay/c', 'requires'], ['eg/kalmar/self/c', 'eg/kalmar/lay/c', 'requires'],
    ['eg/phases/edge/c', 'eg/phases/gain/c', 'requires'], ['eg/phases/layers/c', 'eg/phases/edge/c', 'requires'], ['eg/phases/deadline/c', 'eg/phases/layers/c', 'requires'],
    ['eg/phases/gain/p1', 'eg/laws/loop/c', 'supported by'],
    ['eg/memory/ask/c', 'eg/memory/merge/c', 'requires'], ['eg/memory/fix/c', 'eg/memory/merge/c', 'requires'],
    ['eg/synth/reg/l1', 'eg/cost/reg/c', 'supported by'], ['eg/synth/log/c', 'eg/cost/reg/c', 'supported by'], ['eg/synth/parity/l2', 'eg/memory/merge/c', 'supported by'],
    ['eg/pages/theory/l1', 'eg/cost/reg/c', 'supported by'], ['eg/pages/theory/l2', 'eg/phases/deadline/c', 'supported by'], ['eg/pages/theory/l3', 'eg/memory/ask/c', 'supported by'],
    ['eg/pages/change/c', 'eg/pages/object/c', 'requires'], ['eg/pages/reading/c', 'eg/pages/object/c', 'requires'], ['eg/pages/change/c', 'eg/pages/reading/c', 'requires'],
    ['eg/pages/interface/c', 'eg/pages/reading/c', 'requires'], ['eg/pages/interface/c', 'eg/pages/change/c', 'requires'], ['eg/pages/network/c', 'eg/pages/object/c', 'requires'],
    ['eg/pages/object/c', 'eg/pages/theory/c', 'supported by'],
    ['g2/p1/r0/l2', 'eg/cost/wf/c', 'supported by'], ['g3/p0/r1/l1', 'eg/phases/edge/c', 'supported by'], ['g4/p2/r0/l1', 'eg/memory/merge/c', 'supported by'], ['g3/p2/r0/l1', 'g2/p0/r1/c', 'supported by']
  ];
  const LINK_ID = 'eg/kalmar/lay/c>eg/cost/reg/f', OUTER_ID = 'g2/p1/r0/l2>eg/cost/wf/c';
  const RING = { 3: [[0, -.52], [-.47, .3], [.47, .3]], 4: [[-.41, -.41], [.41, -.41], [-.41, .41], [.41, .41]], 5: [0, 1, 2, 3, 4].map(i => [.6 * Math.sin(i * 1.2566), -.6 * Math.cos(i * 1.2566)]),
    7: [[0, 0]].concat([0, 1, 2, 3, 4, 5].map(i => [.64 * Math.sin(i * 1.0472), -.64 * Math.cos(i * 1.0472)])) };
  const RR = { 3: .3, 4: .28, 5: .25, 7: .2 };
  function otherGroup(id, n, seed, at, rr) {
    const g0 = i => GEN[(i * 3 + seed) % 5].includes('l1') ? 'l1' : 'l2';
    const projects = Array.from({ length: n }, (_, i) => P('p' + i, 'a project', [0, 1, 2].map(j => gen('r' + j, 'a result', i * 3 + j + seed))));
    const cross = []; for (let i = 1; i < n; i++) cross.push([`${id}/p${i}/r0/${g0(i)}`, `${id}/p${i - 1}/r1/c`, 'supported by']);
    return { id, kind: 'network', label: 'another group', projects, cross, at, rr, generic: true };
  }
  const WORLD = { id: 'all', kind: 'world', label: 'Many groups', networks: [
    { id: 'eg', kind: 'network', label: 'Made with EigenEngine', projects: OURS, at: [-.4, .12], rr: .46 },
    otherGroup('g2', 5, 1, [.5, -.4], .26), otherGroup('g3', 4, 2, [.52, .4], .24), otherGroup('g4', 3, 4, [.02, -.72], .18)
  ] };

  function buildWorld() {
    const all = [], by = {}, links = [];
    const add = (spec, parent, at, rr, path) => {
      const t = { i: all.length, id: path, kind: spec.kind, label: spec.label, tone: spec.tone || (parent && parent.tone) || '', generic: !!(spec.generic || (parent && parent.generic)), parent, kids: [], links: [],
        depth: parent ? parent.depth + 1 : 0, x: parent ? parent.x + at[0] * parent.r : 0, y: parent ? parent.y + at[1] * parent.r : 0, r: parent ? rr * parent.r : 1000, leaf: false, st: 0, out: 0, count: 0 };
      all.push(t); by[path] = t; if (parent) parent.kids.push(t); return t;
    };
    const root = add(WORLD, null, [0, 0], 1, 'all'), cross = CROSS.slice();
    WORLD.networks.forEach(nw => {
      const N = add(nw, root, nw.at, nw.rr, nw.id), n = nw.projects.length;
      nw.projects.forEach((p, pi) => {
        const Pn = add(p, N, p.at || RING[n][pi], p.at ? .17 : RR[n], `${nw.id}/${p.id}`), m = p.results.length;
        p.results.forEach((rs, ri) => {
          const Rn = add(rs, Pn, (p.ring || RING[m])[ri], RR[m], `${Pn.id}/${rs.id}`), keys = Object.keys(rs.recs);
          keys.forEach(k => { const s = SLOT[k], leaf = add({ kind: s[0], label: rs.recs[k] || KIND_WORD[s[0]] }, Rn, [s[1], s[2]], .13, `${Rn.id}/${k}`); leaf.leaf = true; leaf.named = !!rs.recs[k]; });
          (rs.links || defLinks(keys)).forEach(([a, b, kind]) => links.push({ a: by[`${Rn.id}/${a}`], b: by[`${Rn.id}/${b}`], kind, at: Rn }));
        });
      });
      (nw.cross || []).forEach(c => cross.push(c));
    });
    cross.forEach(([a, b, kind]) => {
      const A = by[a], B = by[b]; if (!A || !B) return;
      const up = t => { const s = []; for (let n = t; n; n = n.parent) s.push(n); return s; }, ua = up(A), ub = up(B), at = ua.find(n => ub.includes(n));
      const l = { a: A, b: B, kind, at, cross: true, id: `${a}>${b}` }; links.push(l);
      ua.forEach(n => { if (n !== at && !up(at).includes(n) && n !== A) n.out++; }); ub.forEach(n => { if (n !== at && !up(at).includes(n) && n !== B) n.out++; });
    });
    links.forEach((l, i) => {                                   // drawn once, in the world's own coordinates
      const { a, b } = l, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const p0 = [a.x + ux * a.r * 1.06, a.y + uy * a.r * 1.06], p1 = [b.x - ux * b.r * 1.06, b.y - uy * b.r * 1.06], bend = (l.cross ? .13 : .07) * (i % 2 ? 1 : -1) * d;
      l.p0 = p0; l.p1 = p1; l.c = [(p0[0] + p1[0]) / 2 - uy * bend, (p0[1] + p1[1]) / 2 + ux * bend]; l.len = d; l.i = i;
      l.at.links.push(l); (a.touch = a.touch || []).push(l); (b.touch = b.touch || []).push(l);
    });
    const count = t => t.count = t.leaf ? 1 : t.kids.reduce((s, k) => s + count(k), 0); count(root);
    return { all, by, links, root };
  }
  const onLink = (l, u) => { const v = 1 - u; return [v * v * l.p0[0] + 2 * v * u * l.c[0] + u * u * l.p1[0], v * v * l.p0[1] + 2 * v * u * l.c[1] + u * u * l.p1[1]]; };

  /* The path a camera takes between two views, after van Wijk and Nuij: it pulls back before it travels. */
  function zoomPath(a, b) {
    const rho = Math.SQRT2, [x0, y0, w0] = a, [x1, y1, w1] = b, dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy; let S, f;
    if (d2 < 1e-9) { S = Math.log(w1 / w0) / rho; f = t => [x0 + t * dx, y0 + t * dy, w0 * Math.exp(rho * t * S)]; }
    else { const d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (4 * w0 * d1), b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (4 * w1 * d1),
        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1); S = (r1 - r0) / rho;
      f = t => { const s = t * S, c0 = Math.cosh(r0), u = w0 / (2 * d1) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0)); return [x0 + u * dx, y0 + u * dy, w0 * c0 / Math.cosh(rho * s + r0)]; }; }
    f.S = Math.abs(S); return f;
  }

  const TONE = { cost: 'var(--eg-cost-line)', phases: 'var(--eg-phases-line)', memory: 'var(--eg-memory-line)' };
  const KCOL = { claim: 'var(--eg-ink)', step: 'var(--eg-ink)', premise: 'var(--eg-ink)', source: 'var(--eg-blue)', run: 'var(--eg-teal)', figure: 'var(--eg-teal)' };
  const GLYPH = {
    claim: g => sv('circle', { r: .42, fill: 'var(--eg-ink)', stroke: 'none' }, g),
    premise: g => sv('circle', { r: .4 }, g),
    step: g => sv('path', { d: 'M0-.54L.54 0L0 .54L-.54 0Z' }, g),
    source: g => sv('path', { d: 'M-.3-.5H.1L.34-.26V.5H-.3ZM.1-.5V-.26H.34M-.12 0H.16M-.12 .22H.16' }, g),
    run: g => sv('path', { d: 'M-.54 0L-.27-.46H.27L.54 0L.27 .46H-.27ZM-.12-.2L.12 0L-.12 .2' }, g),
    figure: g => sv('path', { d: 'M-.46-.42V.42H.46M-.3 .2L-.08-.08L.1 .08L.36-.28' }, g)
  };
  const LSTYLE = { 'requires': ['var(--eg-ink)', ''], 'supported by': ['var(--eg-blue)', '5 4'], 'computed by': ['var(--eg-teal)', ''], 'shown by': ['var(--eg-teal)', '1.5 4'] };

  const STEPS = [
    { label: 'One result', caption: two(
      'One result of <i>The Cost of Complexity</i>, the law of word frequencies, is held as an envelope of linked records: a claim, the step and premises which give it, a source, a recorded run and the figure drawn from it.',
      'The result is a conceptric: an envelope whose exterior carries a summary and typed links (requires, supported by, computed by, shown by), and whose interior is the records themselves. Its revision is a digest of its content and of its direct prerequisites.') },
    { label: 'The paper', caption: two(
      'From one step back the result is a single node, and the paper holds such results, joined by the same kinds of link. The paper is an envelope of the same kind, holding results where the result held records.',
      'Containment is closed, since an envelope of envelopes is again an envelope. With \\(b\\) children at each of \\(L\\) levels one node stands for \\(N=b^{L}\\) records, and reaching one of them costs \\(L\\,K_0+\\kappa\\log N\\), where \\(K_0\\) is the fixed cost of a level.') },
    { label: 'The network', caption: two(
      'Another step and the paper is itself one node, among the other things made with EigenEngine. Each of them opens in the same way.',
      'The network adds one level to that address, at the price of one further \\(K_0\\). Whether a level pays is the question of <i>The Cost of Complexity</i>, in which multiplying the range adds only a fixed amount to the budget.') },
    { label: 'Another project', caption: two(
      'Inside <i>The Kalmár constant</i> we find the same structure: results, and within each result a claim and the records it rests on.',
      'The same operations open a project as open a result. <i>The Kalmár constant</i> counts the layouts themselves: sixteen symbols can be organised in eight ways, and in general \\(H(N)\\le N^{\\rho}\\) with \\(\\zeta(\\rho)=2\\).') },
    { label: 'A link between projects', caption: two(
      'One claim in <i>The Kalmár constant</i> rests on a single figure inside <i>The Cost of Complexity</i>, cited at a fixed version. The link is of the same kind as those within a paper, so a question follows it across the boundary.',
      'The link names its target by project, record and revision, and carries a SHA-256 digest of the record it cites (6a609122…). It points at Figure 2(b,c), page 5, at one fixed revision.') },
    { label: 'A change crosses', caption: two(
      'When that figure is revised its state changes, the change travels the link, and the claim resting on it is marked for review. A correction in one project therefore reaches every project that relies on it.',
      'A change travels one link at each review, so a correction \\(L\\) links away arrives after no fewer than \\(L\\) reviews (<i>The Phases of Hierarchy</i>). The claim is not rewritten. Its state moves from current to needs review.') },
    { label: 'Agent and author', caption: two(
      'The review is shared. Eigen, the agent, reads the revised figure and proposes a change to the claim; the author accepts or rewords it, and a rewording is kept to guide the next proposal.',
      'The agent acts through the operations open to the author. It reads the changed record and seals a proposal against that revision, which the author applies or rewrites, and the link is then pinned to the new revision. The difference between proposal and rewording is itself a record.') },
    { label: 'The network as one object', caption: two(
      'Step out once more and the whole network is a single object, which another group can cite as it would a claim. EigenEngine is the generator and interface for a living research effort of this kind, directed by scientists working with agents.',
      'At every scale the object is the same: nodes, typed links and a state on each. A network of \\(M\\) groups is addressed with one further choice, at a cost of \\(K_0+\\kappa\\log M\\).') }
  ];

  /* ---- the exhibit ------------------------------------------------------------------------------------------ */
  function mount(host, opts = {}) {
    const W0 = buildWorld(), { all, by, links, root } = W0;
    const el = ht('div', 'nw egn-network', host); el.tabIndex = 0; el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'A network of research projects. Arrow keys choose a node, Enter steps into it, Escape steps out.');
    const svg = sv('svg', { class: 'nw-svg', 'aria-hidden': 'true' }, el);
    const top = sv('svg', { class: 'nw-svg nw-top', 'aria-hidden': 'true' }, el);
    const gWorld = sv('g', { class: 'nw-world' }, svg), gOver = sv('g', { class: 'nw-over' }, top), gLab = sv('g', { class: 'nw-labels' }, top);
    const pathBox = ht('div', 'nw-path', el), legend = ht('div', 'nw-legend', el), bar = ht('div', 'nw-bar', el);
    const status = ht('p', 'nw-status', bar); status.setAttribute('aria-live', 'polite');
    const note = ht('div', 'nw-note', el);
    note.innerHTML = `<p><svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M0-7C.9-2.2 2.2-.9 7 0C2.2 .9 .9 2.2 0 7C-.9 2.2-2.2 .9-7 0C-2.2-.9-.9-2.2 0-7Z"/></svg><span>Eigen, the agent, proposes a revision</span></p><p><svg viewBox="-8 -8 16 16" aria-hidden="true"><circle cy="-3.3" r="2.7"/><path d="M-5.4 6.6C-5.4 2.7-2.9 1 0 1S5.4 2.7 5.4 6.6"/></svg><span>The author accepts or rewords it</span></p><p><svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="M5.6-2.4A6 6 0 1 0 6 1.6M5.9-6.2V-2.2H1.9"/></svg><span>A rewording is kept, and guides the next proposal</span></p>`;
    const rowA = note.children[0], rowB = note.children[1], rowC = note.children[2], noteMix = new Spring(0, 120, 22);
    const act2 = ht('button', 'nw-alt is-off', bar, 'Reword it'); act2.type = 'button'; act2.tabIndex = -1;
    const fig = ht('figure', 'nw-fig', el); let figMade = false, figX = -1, figY = -1;   // the cited figure itself, from the published page
    const noteFoot = () => [note.offsetLeft, note.offsetTop + note.offsetHeight + 3];
    const act = ht('button', 'nw-act', bar); act.type = 'button';

    // every thing, drawn once
    const draw = (t, parentG) => {
      t.g = sv('g', { 'data-i': t.i }, parentG);
      t.body = sv('g', { transform: `translate(${t.x} ${t.y}) scale(${t.r})` }, t.g);
      if (t.leaf) {
        const col = KCOL[t.kind];
        t.hull = sv('circle', { r: 1, class: 'nw-disc', style: `stroke:${col};fill:${col}` }, t.body);
        t.glyph = sv('g', { class: 'nw-glyph', style: `stroke:${col}` }, t.body); GLYPH[t.kind](t.glyph);
      } else {
        const col = TONE[t.tone] || 'var(--eg-faint)';
        t.hull = sv('circle', { r: 1, class: 'nw-hull' + (t.tone ? ' nw-hull--tone' : ''), style: `stroke:${col};fill:${col}` }, t.body);
        t.inner = sv('g', {}, t.g); t.linkG = sv('g', {}, t.inner); t.kidG = sv('g', {}, t.inner);
        t.links.forEach(l => { const [c, dash] = LSTYLE[l.kind]; l.el = sv('path', { class: 'nw-link' + (l.cross ? ' nw-link--cross' : ''), 'data-a': l.a.i, 'data-b': l.b.i, d: `M${l.p0[0]} ${l.p0[1]}Q${l.c[0]} ${l.c[1]} ${l.p1[0]} ${l.p1[1]}`, style: `stroke:${c}`, 'stroke-dasharray': dash }, t.linkG); l.o = -1; });
        t.kids.forEach(k => draw(k, t.kidG));
      }
      t.ring = new Spring(0, 120, 22); t.flag = new Spring(0, 120, 22); t.shown = true; t.innerShown = true; t.lo = -1;
    };
    draw(root, gWorld);
    gWorld.querySelectorAll('circle,path').forEach(n => n.setAttribute('vector-effect', 'non-scaling-stroke'));
    const ringEl = t => t.ringEl || (t.ringEl = sv('circle', { r: t.leaf ? 1.42 : 1.07, class: 'nw-ring', 'vector-effect': 'non-scaling-stroke' }, t.body));
    const flagEl = t => t.flagEl || (t.flagEl = sv('circle', { r: 1.42, class: 'nw-flag', 'vector-effect': 'non-scaling-stroke' }, t.body));
    const crossLinks = links.filter(l => l.cross); crossLinks.forEach(l => { l.rel = l.relv = 1; });
    let flagged = [];

    const T = id => by[id], WF = T('eg/cost/wf'), COST = T('eg/cost'), NET = T('eg'), KAL = T('eg/kalmar'), LAY = T('eg/kalmar/lay'), REG = T('eg/cost/reg'), FIG = T('eg/cost/reg/f'), KCL = T('eg/kalmar/lay/c');
    KCL.up = true; const theLink = links.find(l => l.id === LINK_ID), outer = links.find(l => l.id === OUTER_ID), showLink = links.find(l => l.at === REG && l.b === FIG);

    // legend and controls
    legend.innerHTML = `<b>Records</b>${Object.keys(GLYPH).map(k => `<span><svg viewBox="-1.3 -1.3 2.6 2.6" data-k="${k}"></svg>${KIND_WORD[k]}</span>`).join('')}
      <b>Links</b>${Object.keys(LSTYLE).map(k => `<span><svg viewBox="0 0 22 8"><path d="M1 4H21" style="stroke:${LSTYLE[k][0]}" stroke-dasharray="${LSTYLE[k][1]}"/></svg>${k}</span>`).join('')}
      <b>State</b><span><i class="nw-dot"></i>changed, or needs review</span>`;
    legend.querySelectorAll('svg[data-k]').forEach(s => { const k = s.dataset.k; sv('circle', { r: 1, class: 'nw-disc', style: `stroke:${KCOL[k]};fill:none` }, s); const g = sv('g', { class: 'nw-glyph', style: `stroke:${KCOL[k]}` }, s); GLYPH[k](g); });

    /* ---- state ---- */
    let W = 0, H = 0, S = 100, ox = 0, oy = 0, availW = 0, availH = 0, wide = false, U = 1, tiny = false, barH = 40, panL = [0, 0], panR = [1e9, 0];
    // names are not drawn where a panel would cover them
    function panels() { panL = wide ? [pathBox.offsetLeft + pathBox.offsetWidth + 6, pathBox.offsetTop + pathBox.offsetHeight + 8] : [W, 36 * U]; const lg = getComputedStyle(legend).display !== 'none'; panR = lg ? [legend.offsetLeft - 6, legend.offsetTop + legend.offsetHeight + 8] : [1e9, 0]; }
    let focus = WF, sel = null, hover = null, kbd = null, mode = -1, frameSet = null, alive = true, visible = true, raf = 0, last = 0, clock = 0, frameId = 0, dirty = true;
    const cam = { x: new Spring(WF.x, 230, 30.4), y: new Spring(WF.y, 230, 30.4), l: new Spring(Math.log(WF.r * 2.14), 230, 30.4) };
    let path = null, pu = 1, pdur = 1, hlLink = null, hlMix = new Spring(0, 120, 22);
    const timers = []; const later = (ms, fn) => { const id = setTimeout(() => { timers.splice(timers.indexOf(id), 1); if (alive) fn(); }, M.off ? Math.min(ms, 60) : ms); timers.push(id); };
    const clearTimers = () => { timers.splice(0).forEach(clearTimeout); flagged.forEach(t => { if (t.alarm) t.alarm.to(0); }); };
    const forced = new Set(), near = new Set(), shots = []; let reviewed = false;                     // labels shown whatever their size; one-off lights along a link

    const viewOf = t => [t.x, t.y, t.r * 2.14];
    const viewOfSet = ts => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; ts.forEach(t => { a = Math.min(a, t.x - t.r); b = Math.min(b, t.y - t.r); c = Math.max(c, t.x + t.r); d = Math.max(d, t.y + t.r); });
      const k = Math.min(availW / (c - a), availH / (d - b)) / (ts[0].kind === 'project' ? 1.07 : 1.34); return [(a + c) / 2, (b + d) / 2, 2 * S / k]; };
    const target = () => frameSet ? viewOfSet(frameSet) : viewOf(focus);
    // the link is shown with both projects whole where the stage is wide enough to keep their records in sight
    const linkSet = () => { const whole = [COST, KAL], v = viewOfSet(whole); return FIG.r * 2 * S / v[2] >= 3.3 ? whole : [REG, LAY]; };
    function go(slow = 1) {
      const from = path && pu < 1 ? path(ease(pu)) : [cam.x.g, cam.y.g, Math.exp(cam.l.g)], to = target();
      path = zoomPath(from, to); pu = 0; pdur = clamp(path.S * .95 * slow, .85, 2.3); wake();
    }
    function measure() {
      const w = host.clientWidth, h = host.clientHeight; if (!w || !h || (w === W && h === H)) return false;
      W = w; H = h; U = clamp((parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16, .9, 1.6); wide = W >= 680 * U && H >= 330 * U; const leg = W >= 860 * U && H >= 400 * U;
      const key = !leg && wide && W >= 720 * U; tiny = H < 270 * U;
      el.classList.toggle('nw--wide', wide); el.classList.toggle('nw--legend', leg); el.classList.toggle('nw--key', key); el.classList.toggle('nw--small', W < 480); el.classList.toggle('nw--tiny', tiny);
      const pl = wide ? 172 * U : 6, pr = leg ? 156 * U : 6, pt = wide ? (key ? 46 * U : 12) : 36 * U, pb = (tiny ? 34 : wide ? 40 : 54) * U; barH = pb;
      availW = Math.max(60, W - pl - pr); availH = Math.max(60, H - pt - pb); S = Math.min(availW, availH) / 2; ox = pl + availW / 2; oy = pt + availH / 2;
      note.style.top = (wide ? 10 : 38 * U).toFixed(0) + 'px'; panels();
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); top.setAttribute('viewBox', `0 0 ${W} ${H}`); if (frameSet) { if (hlLink === theLink) frameSet = linkSet(); const v = target(); cam.x.snap(v[0]); cam.y.snap(v[1]); cam.l.snap(Math.log(v[2])); path = null; pu = 1; }
      dirty = true; return true;
    }

    /* ---- words ---- */
    const where = t => { const s = []; for (let n = t.parent; n && n.kind !== 'world'; n = n.parent) s.push(n.label); return s; };
    const quote = t => `“${t.label}”`;
    const far = (t, o) => { let p = o; while (p && p.kind !== 'project') p = p.parent; let q = t; while (q && q.kind !== 'project') q = q.parent; return p && p !== q ? ` in ${p.generic ? 'a project of another group' : p.label}` : ''; };
    // the review of the one link between projects: 0 current, 1 the change is travelling, 2 needs review, 3 Eigen has proposed, 4 the author is accepting
    let phase = 0, version = 1, learned = false, reworded = false;
    const framed = () => !!frameSet && hlLink === theLink;
    function describe() {
      const x = isExpert();
      if (framed() && !sel) {
        if (phase === 1) return `${FIG.label} has been revised, and the change is travelling the link to the claim which rests on it.`;
        if (phase === 2) return `${FIG.label} has changed. “${cap(KCL.label)}” rests on it and now needs review, as do the result and the project which hold it.`;
        if (phase >= 3) return learned ? `Eigen proposes a change to the claim, guided this time by the author’s last rewording. The author accepts or rewords it.` : `Eigen has read the revised figure and proposes a change to the claim. The author accepts or rewords it.`;
        if (reviewed) return reworded ? `The author has reworded the proposal. The claim is current again and cites version ${version} of ${FIG.label}, and the rewording is kept for the next proposal.` : `The author has accepted the proposal. The claim is current again, and now cites version ${version} of ${FIG.label}.`;
        const tail = x ? ` Target: cost-addresses, revision ${version}, digest 6a609122….` : '';
        if (mode === 4 && !small()) return `A question put to “${KCL.label}” follows the link out of ${KAL.label} and into ${COST.label}, to ${FIG.label} and the claim it shows.` + tail;
        return `“${cap(KCL.label)}” in ${KAL.label} is supported by ${FIG.label} in ${COST.label}, at version ${version}.` + tail;
      }
      const t = sel || focus;
      if (t.leaf) {
        if (t.generic) return `This is a ${KIND_WORD[t.kind]} in a project of another group, linked as the records of our own projects are.`;
        const w = where(t), bits = (t.touch || []).slice(0, 3).map(l => l.a === t
          ? ({ 'requires': 'requires ', 'supported by': 'is supported by ', 'computed by': 'is computed by ', 'shown by': 'is shown by ' })[l.kind] + quote(l.b) + far(t, l.b)
          : ({ 'requires': `${quote(l.a)}${far(t, l.a)} rests on it`, 'supported by': `supports ${quote(l.a)}${far(t, l.a)}`, 'computed by': `computes ${quote(l.a)}`, 'shown by': `shows ${quote(l.a)}` })[l.kind]);
        return `“${cap(t.label)}” is a ${KIND_WORD[t.kind]} in ${w[0]} of ${w[1]}.${bits.length ? ' It ' + bits.join(', ').replace(/, ([^,]*)$/, ' and $1') + '.' : ''}`
          + (x ? ` Its address has ${num(t.depth)} parts.` : '');
      }
      const o = t.out, tail = x ? ` N = ${t.count} records drawn here, ln N = ${Math.log(t.count).toFixed(1)}${t.depth ? `, ${num(t.depth)} choice${t.depth > 1 ? 's' : ''} deep` : ''}.` : '';
      if (t.kind === 'result') return (t.generic ? 'This is a result in a project of another group: a claim and the records it rests on.'
        : `“${cap(t.label)}” is one result of ${t.parent.label}: a claim and the records it rests on${o ? ', with threads to records elsewhere' : ''}.`) + ' Press a record to read its links.' + tail;
      if (t.kind === 'project') return (t.generic ? 'This is a project of another group, held in the same form.'
        : `${t.label} is open, and each circle is one of its results${o ? '. The threads which leave it reach records in other projects' : ''}.`) + ' Press a result to step in.' + tail;
      if (t.kind === 'network') return (t.generic ? 'These are the projects of another group, joined as ours are.' : 'Each of the things made with EigenEngine is a project in its own right.') + ' Press a project to step in.' + tail;
      return 'These are groups of projects. The links which join two records are the links which join two groups. Press a group to step in.' + tail;
    }
    function words() {
      const s = describe(); if (status.textContent !== s) status.textContent = s;
      const lab = phase >= 3 ? 'Accept as author' : phase === 2 ? 'Let Eigen propose' : phase === 1 ? 'Revising…' : 'Revise Figure 2';
      if (act.textContent !== lab) act.textContent = lab; act.classList.toggle('is-hot', phase >= 2); act.disabled = phase === 1 || phase === 4;
      const show = framed() || sel === FIG || phase > 0; act.classList.toggle('is-off', !show); act.tabIndex = show ? 0 : -1;
      const on = framed() && (phase >= 2 || reviewed); note.classList.toggle('is-on', on); el.classList.toggle('nw--noting', on); noteMix.to(on ? 1 : 0);
      rowA.className = phase >= 3 || reviewed ? 'is-lit' : phase === 2 ? 'is-next' : ''; rowB.className = phase === 4 || reviewed ? 'is-lit' : phase === 3 ? 'is-next' : ''; rowC.className = learned ? 'is-lit' : '';
      const two2 = phase === 3 && show; act2.classList.toggle('is-off', !two2); act2.tabIndex = two2 ? 0 : -1;
      const ll = `supported by · version ${version}`; if (linkLab.textContent !== ll) linkLab.textContent = ll;
    }
    function ladder() {
      pathBox.textContent = '';
      const chain = []; for (let n = focus; n; n = n.parent) chain.unshift(n);
      const out = ht('button', 'nw-out', pathBox, 'Step out'); out.type = 'button'; out.disabled = !focus.parent; out.onclick = e => { e.stopPropagation(); manual(); stepOut(); tell(); };
      const list = ht('ol', 'nw-rungs', pathBox);
      chain.forEach((n, i) => { const li = ht('li', '', list), b = ht('button', '', li); b.type = 'button'; b.style.setProperty('--d', i);
        ht('i', '', b); ht('span', '', b, n.generic && n.kind !== 'world' ? cap(n.kind === 'network' ? 'another group' : `a ${n.kind}`) : n.label);
        if (n === focus) b.setAttribute('aria-current', 'true'); b.onclick = e => { e.stopPropagation(); manual(); setFocus(n); tell(); }; });
      panels();
    }
    // told to the host only when the reader has acted by hand: it may then stop its tour and drop its step mark
    const tell = () => host.dispatchEvent(new CustomEvent('eigen-exhibit-change', { bubbles: true, detail: { node: 'network', text: status.textContent } }));

    /* ---- moves ---- */
    function setFocus(t, o = {}) {
      const prev = focus; frameSet = o.set || null; focus = t; sel = null; kbd = null;
      if (!o.keep) { hlLink = null; hlMix.to(0); forced.clear(); reviewed = false; }
      if (frameSet) all.forEach(a => { if (a.trail) { a.trail = false; a.ring.to(0); } });
      else for (let n = prev; n && n.parent; n = n.parent) if (n.parent === t) { all.forEach(a => { if (a.trail) { a.trail = false; a.ring.to(0); } }); n.trail = true; n.ring.to(1); later(5200, () => { if (n.trail) { n.trail = false; n.ring.to(0); wake(); } }); }
      relevance(); go(o.slow); ladder(); words(); dirty = true;
    }
    const isIn = (t, f) => t === f || isAbove(f, t);
    const childOf = (t, a) => { while (t.parent && t.parent !== a) t = t.parent; return t; };
    function relevance() { crossLinks.forEach(l => {
      if (frameSet) l.rel = l === hlLink ? 1 : frameSet.some(s => isIn(l.a, s)) && frameSet.some(s => isIn(l.b, s)) ? .8 : .16;
      else l.rel = l.at === focus || isAbove(focus, l.at) ? 1 : isIn(l.a, focus) || isIn(l.b, focus) ? .85 : .16; }); }
    const stepOut = () => { if (frameSet) setFocus(focus); else if (focus.parent) setFocus(focus.parent); };
    function select(t) { sel = sel === t ? null : t; all.forEach(a => { if (a.picked) { a.picked = false; if (!a.trail) a.ring.to(0); } }); if (sel) { sel.picked = true; sel.ring.to(1); } words(); wake(); dirty = true; }
    function light(link, o = {}) { if (!link && !o.fn) return; shots.push({ l: link, fn: o.fn, t0: clock + (o.delay || 0), dur: o.dur || 1.2, back: !!o.back, cls: o.cls || 'gold', done: o.done }); wake(); }
    function frameLink() {
      hlLink = theLink; hlMix.to(1); forced.clear(); forced.add(FIG); forced.add(KCL);
      near.clear(); [COST, KAL, REG, LAY].forEach(p => near.add(p));
      setFocus(NET, { set: linkSet(), keep: true });
    }
    function resetStates() { phase = 0; reviewed = false; FIG.st = 0; KCL.st = 0; flags(true); }
    function flags(quiet) {
      all.forEach(t => { t.fl = 0; }); [FIG, KCL].forEach(t => { if (t.st) for (let n = t; n && n.parent; n = n.parent) n.fl = 1; });
      all.forEach(t => { if (t.flag.g !== t.fl) { t.flag.to(t.fl);
        if (t.fl && !t.leaf) { if (!flagged.includes(t)) flagged.push(t);     // the mark climbs: each hull that now holds the change is ringed in turn
          if (!quiet) { const up = KCL.depth - t.depth; t.alarm = t.alarm || new Spring(0, 120, 22); later(120 + 300 * up, () => { t.alarm.to(1); wake(); later(560, () => { t.alarm.to(0); wake(); }); }); } } } });
      words(); wake(); dirty = true;
    }
    function revise(byHand) {
      if (phase) return;
      reviewed = false; phase = 1; FIG.st = 1; flags();
      light(theLink, { back: true, cls: 'coral', dur: 1.6, delay: .35, done: () => { if (phase === 1) { phase = 2; KCL.st = 2; flags(); if (byHand) tell(); } } });
    }
    const leadPt = u => { const a = noteFoot(), b = KCL.sx == null ? a : [KCL.sx, KCL.sy - Math.max(KCL.sr, 5) - 7 - 2.3 * 12 * U], v = 1 - u; return [v * v * a[0] + 2 * v * u * a[0] + u * u * b[0], v * v * a[1] + 2 * v * u * (a[1] + b[1]) / 2 + u * u * b[1]]; };
    function propose(byHand) {
      if (phase !== 2) return; phase = 3; words(); dirty = true;
      light(null, { fn: leadPt, cls: 'teal', dur: .95, done: () => { if (byHand) tell(); } });
    }
    function accept(byHand, reword) {
      if (phase !== 3) return; phase = 4; words();
      light(null, { fn: leadPt, cls: 'gold', dur: .75, done: () => { if (phase !== 4) return; phase = 0; version++; reviewed = true; reworded = !!reword; FIG.st = 0; KCL.st = 0;
        if (reword) { learned = true; light(null, { fn: u => leadPt(1 - u), cls: 'gold', dur: .7, delay: .2 }); }   // what the author changed goes back to the agent
        flags(true); light(theLink, { cls: 'gold', dur: 1 }); if (byHand) tell(); } });
    }
    function loopLink() { if (mode !== 4 || !alive) return; light(theLink, { dur: 1.5, done: () => light(showLink, { back: true, dur: .7 }) }); later(3400, loopLink); }
    function step(i) {
      clearTimers(); shots.length = 0; mode = i;
      if (i !== 6) resetStates();
      if (i === 0) setFocus(WF);
      else if (i === 1) setFocus(COST);
      else if (i === 2) setFocus(NET);
      else if (i === 3) { setFocus(KAL); later(1750, () => setFocus(LAY)); }
      else if (i === 4) { frameLink(); later(1300, loopLink); }
      else if (i === 5) { frameLink(); later(1100, () => revise()); }
      else if (i === 6) { if (phase !== 2) { phase = 2; reviewed = false; FIG.st = 1; KCL.st = 2; flags(true); } frameLink(); later(900, () => propose()); later(2000, () => accept(false, true)); }
      else if (i === 7) { setFocus(root); hlLink = outer; hlMix.to(1); later(1500, () => light(outer, { dur: 1.6 })); }
      words();
    }
    function manual() { clearTimers(); if (phase === 1 || phase === 4) { phase = phase === 1 ? 2 : 3; if (phase === 2) KCL.st = 2; shots.length = 0; flags(true); } mode = -1; }

    /* ---- one frame ---- */
    const labels = new Map();
    function label(t, x, y, o, size, strong) {
      let L = labels.get(t);
      if (!L) { const txt = sv('text', { class: 'nw-lab' }, gLab), s = t.label, mid = s.length > 15 ? (() => { let best = -1; for (let i = 0; i < s.length; i++) if (s[i] === ' ' && (best < 0 || Math.abs(i - s.length / 2) <= Math.abs(best - s.length / 2))) best = i; return best; })() : -1;
        const lines = mid > 0 ? [s.slice(0, mid), s.slice(mid + 1)] : [s]; lines.forEach((ln, i) => sv('tspan', { x: 0, dy: i ? '1.18em' : 0 }, txt).textContent = ln);
        L = { el: txt, o: -1, x: 1e9, y: 1e9, lines: lines.length, wide: Math.max(...lines.map(ln => ln.length)) }; labels.set(t, L); t.lines2 = lines.length > 1; txt.classList.toggle('nw-lab--leaf', t.leaf); txt.classList.toggle('nw-lab--soft', t.generic || t.named === false); }
      L.stamp = frameId;
      const half = L.wide * size * .27 + 4; x = clamp(x, half, Math.max(half, W - half));
      if (((x - half * .6 < panL[0] && y < panL[1]) || (x + half * .6 > panR[0] && y < panR[1]) || y > H - barH + size) && !strong) o = 0;
      if (L.cur == null || M.off) L.cur = o; else if (L.cur !== o) { L.cur += (o - L.cur) * fadeStep; if (Math.abs(o - L.cur) < .012) L.cur = o; else fading = true; }
      o = L.cur;
      if (Math.abs(L.o - o) > .015) { L.o = o; L.el.style.opacity = o.toFixed(2); L.el.style.display = o < .02 ? 'none' : ''; }
      if (o < .02) return;
      if (Math.abs(L.x - x) > .05 || Math.abs(L.y - y) > .05) { L.x = x; L.y = y; L.el.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); }
      if (L.size !== size) { L.size = size; L.el.style.fontSize = size.toFixed(1) + 'px'; }
      if (L.strong !== strong) { L.strong = strong; L.el.classList.toggle('nw-lab--on', !!strong); }
    }
    const setO = (node, key, holder, v) => { if (Math.abs(holder[key] - v) > .012 || (v < .05) !== holder.off) { holder[key] = v; holder.off = v < .05; node.style.opacity = v.toFixed(3); node.style.display = holder.off ? 'none' : ''; } };
    let k = 1, cx = 0, cy = 0, pool = [], used = 0, lastTf = '', fading = false, fadeStep = 1, passId = -1;
    const onScreen = t => t.shown && t.seen === passId;
    const dot = (x, y, r, cls, o) => { let c = pool[used]; if (!c) { c = sv('circle', {}, gOver); pool.push(c); } used++; c.setAttribute('class', 'nw-pulse nw-pulse--' + cls); c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', r); c.style.opacity = o.toFixed(2); c.style.display = ''; };
    const scr = p => [(p[0] - cx) * k + ox, (p[1] - cy) * k + oy];
    const small = () => W < 480;

    function visit(t, onPath) {
      const sr = t.r * k, sx = (t.x - cx) * k + ox, sy = (t.y - cy) * k + oy, m = 30;
      if (sx + sr < -m || sx - sr > W + m || sy + sr < -m || sy - sr > H + m || sr < .35) { if (t.shown) { t.shown = false; t.g.style.display = 'none'; } return; }
      if (!t.shown) { t.shown = true; t.g.style.display = ''; }
      const ring = t.ring.v, hov = (t === hover || t === kbd) ? .55 : 0, rr = Math.max(ring, hov), fl = t.flag.v;
      if (rr > .01 || t.ringEl) { const e = ringEl(t); if (Math.abs((t.ro || 0) - rr) > .01) { t.ro = rr; e.style.opacity = rr.toFixed(2); } }
      t.sx = sx; t.sy = sy; t.sr = sr; t.seen = frameId;
      const fz = (small() ? 11 : 12) * U;
      if (t.leaf) {
        const gl = ramp(sr, 3.5, 8.5); if (Math.abs(t.lo - gl) > .012) { t.lo = gl; t.glyph.style.opacity = gl.toFixed(3); t.hull.style.fillOpacity = (1 - gl).toFixed(3); t.hull.style.strokeOpacity = (.25 + .6 * gl).toFixed(3); t.hull.classList.toggle('nw-disc--open', gl > .5); const g0 = gl > .01; if (t.gshown !== g0) { t.gshown = g0; t.glyph.style.display = g0 ? '' : 'none'; } }
        const f = forced.has(t) || t === hover || t === sel || t === kbd, lo = Math.max(t.parent === focus && !frameSet ? ramp(sr, 16, 21) : 0, f ? 1 : 0);
        if (lo > .02 || labels.has(t)) label(t, sx, t.up && sr < 14 ? sy - Math.max(sr, 5) - 7 - (t.lines2 ? fz * 1.18 : 0) : sy + Math.max(sr, 5) + fz + 3, lo, fz, f);
        return;
      }
      const big = ramp(sr, 3, 9), huge = ramp(sr, S * 1.25, S * 2.2);
      const so = mix(.5, onPath ? .62 : .5, big) * (1 - .45 * huge), fo = mix(.95, t.tone ? .1 : .045, big) * (1 - ramp(sr, S * .8, S * 1.15));
      if (Math.abs(t.lo - (so + fo * 7)) > .01) { t.lo = so + fo * 7; t.hull.style.strokeOpacity = so.toFixed(3); t.hull.style.fillOpacity = fo.toFixed(3); const paint = fo > .004; if (t.paint !== paint) { t.paint = paint; t.hull.style.fill = paint ? '' : 'none'; t.hull.style.pointerEvents = 'all'; } }
      const f = t === hover || t === kbd, quiet = frameSet ? !near.has(t) : t.parent !== focus, a0 = small() ? 15 : Math.max(20, S * .085);
      const lo = Math.max(quiet ? 0 : frameSet ? ramp(sr, 12, 18) : ramp(sr, a0, a0 * 1.36) * (1 - ramp(sr, S * .5, S * .72)), f && sr < S * .72 ? 1 : 0);
      if (lo > .02 || labels.has(t)) label(t, sx, sy + sr + fz + 3, lo, t.kind === 'record' ? fz : fz + .5, f || t.trail);
      if (sr < 2.6) { if (t.innerShown) { t.innerShown = false; t.inner.style.display = 'none'; } return; }
      if (!t.innerShown) { t.innerShown = true; t.inner.style.display = ''; }
      for (let i = 0; i < t.links.length; i++) {
        const l = t.links[i], e = Math.min(l.a.r, l.b.r) * k, len = l.len * k, h = l === hlLink ? hlMix.v : 0, touch = sel && (l.a === sel || l.b === sel) ? 1 : 0;
        let o = l.cross ? ramp(len, 10, 26) * mix(.34, .62, ramp(e, 1.2, 6)) * l.relv : ramp(e, 1.4, 5) * .5; o = Math.max(o, h, touch * .95);
        setO(l.el, 'o', l, o); const cls = h > .5 ? (l === theLink && phase && phase < 3 ? 3 : 2) : touch ? 1 : 0; if (l.cls !== cls) { l.cls = cls; l.el.classList.toggle('is-lit', cls === 2); l.el.classList.toggle('is-alarm', cls === 3); l.el.classList.toggle('is-touch', cls === 1); }
      }
      for (let i = 0; i < t.kids.length; i++) visit(t.kids[i], onPath && (t.kids[i] === focus || isAbove(t.kids[i], focus)));
    }
    const isAbove = (a, b) => { for (let n = b.parent; n; n = n.parent) if (n === a) return true; return false; };

    function frame(now) {
      raf = 0; if (!alive) return;
      let dt = last ? Math.min(.1, (now - last) / 1000) : 1 / 60; last = now; if (M.off) pu = 1; clock += dt; frameId++;
      let moving = false;
      if (path && pu < 1) { pu = Math.min(1, pu + dt / pdur); const p = path(ease(pu)); cam.x.to(p[0]); cam.y.to(p[1]); cam.l.to(Math.log(p[2])); moving = true; }
      else if (path) { const p = path(1); cam.x.to(p[0]); cam.y.to(p[1]); cam.l.to(Math.log(p[2])); path = null; }
      for (let n = Math.ceil(dt / .008), h = dt / n, i = 0; i < n; i++) {
        moving = cam.x.step(h) | cam.y.step(h) | cam.l.step(h) | hlMix.step(h) || moving;
        for (let j = 0; j < all.length; j++) { const t = all[j]; if (t.ring.v !== t.ring.g || t.ring.s) moving = t.ring.step(h) || moving; if (t.flag.v !== t.flag.g || t.flag.s) moving = t.flag.step(h) || moving; }
      }
      for (let j = 0; j < crossLinks.length; j++) { const l = crossLinks[j]; if (l.relv !== l.rel) { l.relv += (l.rel - l.relv) * Math.min(1, dt * 4.5); if (Math.abs(l.rel - l.relv) < .01) l.relv = l.rel; moving = true; } }
      cx = cam.x.v; cy = cam.y.v; k = 2 * S / Math.exp(cam.l.v);
      const tf = `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${k.toFixed(5)}) translate(${(-cx).toFixed(3)} ${(-cy).toFixed(3)})`;
      if (tf !== lastTf || moving || dirty || fading) {
        if (tf !== lastTf) { lastTf = tf; gWorld.setAttribute('transform', tf); }
        fading = false; fadeStep = Math.min(1, dt * 8); passId = frameId;
        visit(root, true);
        labels.forEach(L => { if (L.stamp !== frameId && L.o > 0) { L.o = 0; L.cur = 0; L.el.style.display = 'none'; } });
      }
      const still = !moving;
      if (fading) moving = true;
      // lights: a slow traffic along the links of whatever is open, and the one-off lights of a step
      used = 0;
      if (!M.off && still) {
        const ls = focus.leaf ? [] : focus.links; let n = 0;
        for (let i = 0; i < ls.length && n < 12; i += Math.max(1, Math.floor(ls.length / 12))) { const l = ls[i]; if (l.o < .2 || l === hlLink) continue; n++;
          const u = fract(clock / (3.4 + (l.i % 5) * .5) + l.i * .37), p = scr(onLink(l, 1 - u)); dot(p[0], p[1], 2.1, l.kind === 'supported by' ? 'blue' : l.kind === 'requires' ? 'ink' : 'teal', Math.sin(Math.PI * u) * .75 * l.o * 2); }
        if (n) moving = true;
      }
      for (let i = shots.length - 1; i >= 0; i--) { const s = shots[i], u = (clock - s.t0) / s.dur; if (u < 0) { moving = true; continue; }
        if (u >= 1 || M.off) { shots.splice(i, 1); if (s.done) s.done(); continue; }
        const e = ease(u); for (let j = 0; j < 5; j++) { const v = clamp(e - j * .035), p = s.fn ? s.fn(v) : scr(onLink(s.l, s.back ? 1 - v : v)); dot(p[0], p[1], (5 - j * .8) * U, s.cls, (1 - j * .2) * Math.sin(Math.PI * clamp(u * 1.05))); } moving = true; }
      for (let i = flagged.length - 1; i >= 0; i--) { const t = flagged[i], v = t.flag.v; if (v < .01 && !t.fl) { flagged.splice(i, 1); continue; } if (!onScreen(t)) continue;
        const o = v * ramp(t.sr, 3.5, 8) * (1 - ramp(t.sr, S * 1.3, S * 2)); if (o > .02) dot(t.sx + t.sr * .72, t.sy - t.sr * .72, (clamp(t.sr * .17, 3.6, 8) * U).toFixed(1), 'badge', o);
        if (t.alarm) { if (t.alarm.v !== t.alarm.g || t.alarm.s) { for (let n = Math.ceil(dt / .008), h = dt / n, q = 0; q < n; q++) t.alarm.step(h); moving = true; } if (t.alarm.v > .02 && t.sr < S * 2) dot(t.sx, t.sy, (t.sr * 1.05).toFixed(1), 'alarm', t.alarm.v); } }
      [FIG, KCL].forEach(t => { const v = t.flag.v; if (v < .02 || !onScreen(t)) return; dot(t.sx, t.sy, Math.max(t.sr * 1.5, 9 * U).toFixed(1), t === KCL ? (phase >= 3 ? 'flag-proposed' : 'flag-review') : 'flag', v); });
      if (noteMix.v !== noteMix.g || noteMix.s) { for (let n = Math.ceil(dt / .008), h = dt / n, q = 0; q < n; q++) noteMix.step(h); moving = true; }
      if (noteMix.v > .02 && onScreen(KCL)) { const nw2 = note.offsetWidth / 2, nx = tiny ? noteX : clamp(KCL.sx, (wide ? panL[0] : 0) + nw2 + 8, Math.max((wide ? panL[0] : 0) + nw2 + 8, Math.min(W, panR[0]) - nw2 - 8)); if (Math.abs(nx - noteX) > .5) { noteX = nx; note.style.left = nx.toFixed(1) + 'px'; }
        const a = leadPt(0), m = leadPt(.5), b = leadPt(1); lead.setAttribute('d', `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${(2 * m[0] - (a[0] + b[0]) / 2).toFixed(1)} ${(2 * m[1] - (a[1] + b[1]) / 2).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`); lead.style.opacity = (noteMix.v * .7).toFixed(2); lead.style.display = tiny ? 'none' : ''; } else lead.style.display = 'none';
      // the figure the link cites, shown where there is room above its project
      const room = COST.sy - COST.sr - (wide ? 12 : 40 * U), fw = 168 * U, fh = fw * 209 / 428 + 22 * U, showFig = framed() && !tiny && W >= 560 && onScreen(COST) && onScreen(FIG) && room > fh + 14 && pu >= 1;
      if (showFig) { if (!figMade) { figMade = true; fig.innerHTML = `<svg viewBox="81 82 428 209" role="img" aria-label="Figure 2, panels b and c, of The Cost of Complexity"><image href="/assets/img/eigen/source-pages/cost-05.webp" width="612" height="792"/></svg><figcaption></figcaption>`; }
        const fx = clamp(COST.sx, (wide ? panL[0] : 0) + fw / 2 + 8, W - fw / 2 - 8), fy = COST.sy - COST.sr - fh - 12; if (Math.abs(fx - figX) > .5 || Math.abs(fy - figY) > .5) { figX = fx; figY = fy; fig.style.left = fx.toFixed(1) + 'px'; fig.style.top = fy.toFixed(1) + 'px'; fig.style.width = fw.toFixed(0) + 'px'; }
        const cap2 = `Figure 2(b,c), page 5 · version ${phase ? version + 1 : version}`, fc = fig.lastChild; if (fc.textContent !== cap2) fc.textContent = cap2;
        lead2.setAttribute('d', `M${fx.toFixed(1)} ${(fy + fh + 2).toFixed(1)}L${FIG.sx.toFixed(1)} ${(FIG.sy - Math.max(FIG.sr, 5) - 4).toFixed(1)}`); }
      if (fig.classList.contains('is-on') !== showFig) { fig.classList.toggle('is-on', showFig); lead2.style.display = showFig ? '' : 'none'; }
      if (hlLink && hlMix.v > .02) {                             // the two ends of the link in question, and its name
        [hlLink.p0, hlLink.p1].forEach(p => { const q = scr(p); dot(q[0], q[1], 3.1, 'end', hlMix.v); });
        if (hlLink === theLink && !tiny && !small()) { const q = scr(onLink(hlLink, .5)); if (labU !== U) { labU = U; linkLab.style.fontSize = (11.5 * U).toFixed(1) + 'px'; } linkLab.setAttribute('transform', `translate(${q[0].toFixed(1)} ${(q[1] - 11 * U).toFixed(1)})`); linkLab.style.opacity = hlMix.v.toFixed(2); linkLab.style.display = ''; }
        else linkLab.style.display = 'none';
      } else linkLab.style.display = 'none';
      for (let i = used; i < pool.length; i++) if (pool[i].style.display !== 'none') pool[i].style.display = 'none';
      dirty = false;
      if ((moving || shots.length) && visible && !document.hidden) raf = requestAnimationFrame(frame); else last = 0;
    }
    const linkLab = sv('text', { class: 'nw-lab nw-lab--link', style: 'display:none' }, gLab); linkLab.textContent = 'supported by · version 1'; let labU = 0;
    const lead = sv('path', { class: 'nw-lead', style: 'display:none' }, gOver), lead2 = sv('path', { class: 'nw-lead', style: 'display:none' }, gOver); let noteX = -1;
    function wake() { if (!raf && alive && visible && !document.hidden) raf = requestAnimationFrame(frame); }

    /* ---- the reader's hand ---- */
    const thingAt = e => { const g = e.target.closest && e.target.closest('[data-i]'); if (!g || !el.contains(g)) return null; let t = all[+g.dataset.i]; while (t && t.parent && t.r * k < (t.leaf ? 8 : 15)) t = t.parent; return t; };
    // what a press on t would act on: one level in from the nearest level it shares with where the reader is
    const aim = t => { if (!t) return null; if (frameSet) return [COST, KAL].find(p => isIn(t, p)) || null; if (t === focus || isAbove(t, focus)) return null;
      if (isIn(t, focus)) return childOf(t, focus); let a = t.parent; while (a && !isAbove(a, focus)) a = a.parent; return a ? childOf(t, a) : null; };
    function press(t) {
      manual(); const a = aim(t);
      if (a) { if (a.leaf) select(a); else setFocus(a); }
      else if (t === focus && !frameSet) { if (sel) select(sel); }
      else stepOut();
      tell();
    }
    svg.addEventListener('click', e => press(thingAt(e)));
    svg.addEventListener('pointermove', e => { const t = thingAt(e), h = aim(t); if (h !== hover) { hover = h; dirty = true; wake(); } svg.style.cursor = h || t !== focus || frameSet ? 'pointer' : ''; });
    svg.addEventListener('pointerleave', () => { if (hover) { hover = null; dirty = true; wake(); } });
    el.addEventListener('keydown', e => {
      const kids = (frameSet ? [] : focus.kids); let used = true;
      if (e.key === 'Escape' || e.key === 'Backspace') { manual(); stepOut(); tell(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp') { if (kids.length) { const d = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1, i = kids.indexOf(kbd); kbd = kids[(i + d + kids.length) % kids.length]; status.textContent = `${cap(kbd.label)}. Enter steps in.`; dirty = true; wake(); } }
      else if ((e.key === 'Enter' || e.key === ' ') && kbd && e.target === el) press(kbd);
      else used = false;
      if (used) e.preventDefault();
    });
    act.addEventListener('click', e => {
      e.stopPropagation(); if (phase === 1 || phase === 4) return;
      const was = framed(); clearTimers(); mode = -1; if (!was) frameLink();
      const run = phase === 2 ? () => propose(true) : phase === 3 ? () => accept(true) : () => revise(true);
      if (was) run(); else later(1000, run); tell();
    });
    act2.addEventListener('click', e => { e.stopPropagation(); if (phase !== 3) return; clearTimers(); mode = -1; accept(true, true); tell(); });
    const onLevel = () => { words(); };
    window.addEventListener('eigen-level', onLevel);

    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { if (measure()) wake(); }) : null; if (ro) ro.observe(host);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { visible = es[es.length - 1].isIntersecting; if (visible) wake(); }) : null; if (io) io.observe(host);
    const onVis = () => { if (!document.hidden) wake(); }; document.addEventListener('visibilitychange', onVis);
    measure(); ladder(); words(); wake();

    return {
      step(i) { step(clamp(i | 0, 0, STEPS.length - 1)); },
      destroy() { alive = false; clearTimers(); cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (io) io.disconnect(); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('eigen-level', onLevel); el.remove(); },
      get state() { return { focus: focus.id, mode, k, moving: !!raf, phase, version }; }
    };
  }

  /* ---- the card: stepping out without end ------------------------------------------------------------------
     A network of six nodes. The first node holds the same network a level down, so pulling back from one network
     leaves it as a single node of the next. A light leaves that node and visits its neighbours in turn. Every style
     is a function of a level's age alone, and the picture after one period is the picture at its start. */
  function art(svg) {
    const g = sv('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const F = [262, 110], R0 = 152, f = .3, PERIOD = 9.5, LEV = [-1, 0, 1, 2, 3];
    const N = [[.3, -.25, .3], [-.47, -.36, .22], [-.06, -.72, .15], [-.64, .2, .19], [-.08, .42, .24], [.6, .36, .2]];
    const E = [[0, 1], [0, 2], [1, 2], [1, 3], [3, 4], [0, 4], [0, 5], [4, 5]], ROUTE = [0, 2, 1, 3];
    const q = [N[0][0] / (1 - f), N[0][1] / (1 - f)];
    const seg = (a, b) => { const A = N[a], B = N[b], dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy); return `M${(A[0] + dx / d * A[2]).toFixed(3)} ${(A[1] + dy / d * A[2]).toFixed(3)}L${(B[0] - dx / d * B[2]).toFixed(3)} ${(B[1] - dy / d * B[2]).toFixed(3)}`; };
    const uid = 'nwa' + Math.random().toString(36).slice(2, 8), nss = { 'vector-effect': 'non-scaling-stroke' };
    const defs = sv('defs', {}, g), mini = sv('g', { id: uid }, defs);
    sv('path', Object.assign({ d: E.map(e => seg(e[0], e[1])).join(''), style: 'stroke:var(--eg-blue)', 'stroke-width': .8, 'stroke-opacity': .55 }, nss), mini);
    N.forEach(n => sv('circle', Object.assign({ cx: n[0], cy: n[1], r: n[2], style: 'stroke:var(--eg-ink)', 'stroke-width': .8, 'stroke-opacity': .5 }, nss), mini));
    const lev = LEV.map(() => { const L = sv('g', {}, g);
      sv('circle', Object.assign({ r: 1, style: 'stroke:var(--eg-faint);fill:var(--eg-blue)', 'fill-opacity': .035, 'stroke-opacity': .7 }, nss), L);
      sv('path', Object.assign({ d: E.map(e => seg(e[0], e[1])).join(''), style: 'stroke:var(--eg-blue)', 'stroke-opacity': .66 }, nss), L);
      N.slice(1).forEach(n => sv('circle', Object.assign({ cx: n[0], cy: n[1], r: n[2], style: 'stroke:var(--eg-ink);fill:var(--eg-surface)', 'fill-opacity': .5, 'stroke-opacity': .8 }, nss), L));
      const minis = sv('g', {}, L); N.slice(1).forEach(n => sv('use', { href: '#' + uid, transform: `translate(${n[0]} ${n[1]}) scale(${n[2]})` }, minis));
      return { L, minis }; });
    // the light
    const pts = ROUTE.map(i => N[i]), d = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1])), total = d.reduce((a, b) => a + b, 0);
    const at = w => { let s = clamp(w, 0, total); for (let i = 0; i < d.length; i++) { if (s <= d[i] || i === d.length - 1) { const u = Math.min(1, s / d[i]); return [mix(pts[i][0], pts[i + 1][0], u), mix(pts[i][1], pts[i + 1][1], u)]; } s -= d[i]; } };
    const stops = [0]; d.forEach(x => stops.push(stops[stops.length - 1] + x));
    const halo = ROUTE.slice(1).map(() => sv('circle', { style: 'stroke:var(--eg-gold)', 'stroke-width': 2, opacity: 0 }, g));
    const rim = [0, 1].map(() => sv('circle', { style: 'stroke:var(--eg-gold)', 'stroke-width': 1.8, opacity: 0 }, g));
    const trail = [0, 1, 2].map(() => sv('path', { style: 'stroke:var(--eg-gold)', 'stroke-width': 2.4, 'stroke-opacity': .82 }, g));
    const glow = sv('g', {}, g);
    const halo2 = sv('path', { style: 'stroke:var(--eg-gold)', 'stroke-width': 10, 'stroke-opacity': .16 }, glow), wake = sv('path', { style: 'stroke:var(--eg-gold)', 'stroke-width': 4.2, 'stroke-opacity': .95 }, glow);
    sv('circle', { r: 6.5, style: 'fill:var(--eg-gold)', 'fill-opacity': .22 }, glow); const tip = sv('circle', { r: 3.3, style: 'fill:var(--eg-ink);stroke:var(--eg-gold)', 'stroke-width': 1.4 }, glow), tipGlow = tip.previousSibling;
    function tick(t) {
      const p = fract(t / PERIOD), geo = a => { const Rr = R0 * Math.pow(f, a); return [F[0] - Rr * q[0], F[1] - Rr * q[1], Rr]; };
      LEV.forEach((j, i) => { const a = j + p, [x, y, Rr] = geo(a), o = ramp(a, -1, -.5) * (1 - ramp(a, 2.5, 3.4)) * mix(.62, 1, ramp(a, -.5, 0));
        lev[i].L.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${Rr.toFixed(3)})`); const mo = ramp(Rr * .2, 5, 14), shown = o > .004, ms = mo > .004 && shown;
        if (lev[i].shown !== shown) { lev[i].shown = shown; lev[i].L.style.display = shown ? '' : 'none'; } if (lev[i].ms !== ms) { lev[i].ms = ms; lev[i].minis.style.display = ms ? '' : 'none'; } if (!shown) return;
        lev[i].L.setAttribute('opacity', o.toFixed(3)); lev[i].L.setAttribute('stroke-width', clamp(Rr / 34, .5, 1.5).toFixed(2)); if (ms) lev[i].minis.setAttribute('opacity', mo.toFixed(3)); });
      const [x, y, Rr] = geo(p), w = ease(ramp(p, .02, .93)) * total, len = .46, P = s => { const u = at(s); return [x + Rr * u[0], y + Rr * u[1]]; };
      let dd = ''; const from = Math.max(0, w - len); [from].concat(stops.filter(s => s > from && s < w), [w]).forEach((s, i) => { const u = P(s); dd += (i ? 'L' : 'M') + u[0].toFixed(1) + ' ' + u[1].toFixed(1); });
      const on = ramp(p, .02, .07) * (1 - ramp(p, .93, .99)), h = P(w);
      const line = (g3, upto) => { let t = ''; [0].concat(stops.filter(s => s > 0 && s < upto), [upto]).forEach((s, i) => { const u = at(s); t += (i ? 'L' : 'M') + (g3[0] + g3[2] * u[0]).toFixed(1) + ' ' + (g3[1] + g3[2] * u[1]).toFixed(1); }); return t; };
      trail[0].setAttribute('d', line([x, y, Rr], Math.max(w, .001))); trail[0].setAttribute('opacity', ramp(p, .03, .1).toFixed(3));
      trail[1].setAttribute('d', line(geo(1 + p), total)); trail[1].setAttribute('opacity', mix(1, .55, p).toFixed(3)); trail[1].setAttribute('stroke-width', mix(2.4, 1.3, p).toFixed(2));
      trail[2].setAttribute('d', line(geo(2 + p), total)); trail[2].setAttribute('opacity', (.55 * (1 - ramp(p, .1, .9))).toFixed(3)); trail[2].setAttribute('stroke-width', mix(1.3, .7, p).toFixed(2));
      wake.setAttribute('d', dd); halo2.setAttribute('d', dd); glow.setAttribute('opacity', on.toFixed(3)); [tip, tipGlow].forEach(c => { c.setAttribute('cx', h[0].toFixed(1)); c.setAttribute('cy', h[1].toFixed(1)); });
      ROUTE.slice(1).forEach((ni, i) => { const n = N[ni], c = halo[i], near = 1 - clamp(Math.abs(w - stops[i + 1] - .1) / .34), last = i === halo.length - 1 ? ramp(w, stops[i + 1] - .05, stops[i + 1]) * (1 - ramp(p, .95, 1)) : 0;
        c.setAttribute('cx', (x + Rr * n[0]).toFixed(1)); c.setAttribute('cy', (y + Rr * n[1]).toFixed(1)); c.setAttribute('r', (Rr * n[2]).toFixed(1)); c.setAttribute('opacity', (Math.max(near * near, last) * .9).toFixed(3)); });
      [p, 1 + p].forEach((a, i) => { const [hx, hy, hr] = geo(a); rim[i].setAttribute('cx', hx.toFixed(1)); rim[i].setAttribute('cy', hy.toFixed(1)); rim[i].setAttribute('r', hr.toFixed(1)); rim[i].setAttribute('opacity', (i ? mix(.85, .3, ramp(a, 1, 1.5)) * (1 - ramp(a, 1.7, 2)) : mix(.3, .85, ramp(a, .88, 1)) * ramp(a, 0, .12)).toFixed(3)); });
    }
    tick(0);
    return { tick, destroy() { g.remove(); } };
  }

  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.network = {
    title: 'The research network',
    question: 'How do projects join up?',
    line: two('A finished project is one object in a network, joined to others by the links used inside it.',
      'Conceptrics are closed under containment, so projects link as claims do: by typed links to a fixed revision.'),
    text: two(
      'A project joins a network as a single object, and opening it shows the same structure inside. A <i>conceptric</i>, the envelope around one concept, is built without regard to what it holds: a claim will do, but so will a paper, or a project of a dozen papers. A finished project is therefore cited, searched and revised by the rules that govern its claims.',
      'The <i>conceptric</i> is closed under containment: an envelope of envelopes is an envelope, so a project of \\(N\\) records is addressed as a claim is. A link between projects names a record, its revision and a digest of its contents, which lets the citing project tell when its basis has moved. Reaching one record among \\(N\\) through \\(L\\) levels costs \\(L\\,K_0+\\kappa\\log N\\) when envelopes compose by position, so a further level holding the same records adds only \\(K_0\\).'),
    out: [
      { href: '/eigenengine/networked-research/#project-network', label: 'The Kalmár citation, followed record by record' },
      { href: '/eigenengine/networked-research/#editor-learning-loop', label: 'What one project can learn from an edit in another' },
      { href: '/eigenengine/kalmar-constant/', label: 'Physical origins of the Kalmár constant' }
    ],
    art,
    exhibit: { steps: STEPS, mount }
  };
})();
