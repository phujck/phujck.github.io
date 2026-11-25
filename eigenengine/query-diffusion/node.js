/* Node "search": How do you find anything in it? (query diffusion)
   One file, as the node contract asks: the search itself (a small real computation), the card art, the exhibit,
   and a second exhibit for the node's own page. Styles are in node.css, scoped under .egn-search.
   The object searched is The Cost of Complexity: 39 records, filed by subject (four boxes of three) or by kind.
   A link [a, b, kind] reads "a <kind> b". Link kinds: requires, supported by, computed by, shown by. */
(() => {
  'use strict';

  /* ------------------------------------------------------------------ 1. the object and the search ---- */
  const PARTS = [
    { name: 'Registers', groups: [
      { name: 'Symbols', recs: [
        ['sym-reg', 'premise', 'A register holds alternatives', 'A physical system whose states stand for a set of alternatives'],
        ['sym-typ', 'premise', 'Common symbols never cost more', 'A common symbol never costs more than a rare one'],
        ['fig1', 'figure', 'Figure 1', 'Sixteen symbols held in four registers'] ] },
      { name: 'Nesting', recs: [
        ['nest-two', 'premise', 'A register is itself chosen', 'Each register is one symbol of the register above it'],
        ['nest-sum', 'claim', 'Costs add level by level', 'Reaching a symbol costs choosing its register, then choosing inside it'],
        ['nest-ext', 'claim', 'No layout escapes the cost', 'One large register, or one for each symbol, leaves the cost in place'] ] },
      { name: 'Budget', recs: [
        ['bud-hom', 'premise', 'Equal refinements, equal cost', 'The same relative refinement has the same price at every range'],
        ['bud-log', 'claim', 'The budget grows as a logarithm', 'The budget of a register grows as the logarithm of its range'],
        ['bud-fek', 'source', 'Fekete 1923', 'A lemma on sequences whose terms add'],
        ['bud-rank', 'claim', 'Rank r costs at least log r', 'A rare symbol has a high rank, and so it costs more than a common one'],
        ['bud-man', 'source', 'Mandelbrot 1953', 'A logarithmic cost for each word'] ] } ] },
    { name: 'Refinement', groups: [
      { name: 'Curve', recs: [
        ['hil-src', 'source', 'Hilbert 1891', 'A curve that fills the square'],
        ['hil-four', 'premise', 'Every square splits into four', 'Each square is a register for its four quarters'],
        ['fig4', 'figure', 'Figure 4', 'The curve at other dimensions'] ] },
      { name: 'Pricing', recs: [
        ['pr-area', 'premise', 'Price a split by its area', 'A division priced by the area it divides'],
        ['pr-wall', 'premise', 'Price a split by its walls', 'A division priced by the length of wall it builds'],
        ['pr-const', 'claim', 'By area, all levels cost the same', 'Every level costs the same: four times the splits at a quarter the price'],
        ['pr-double', 'claim', 'By walls, each level costs double', 'The cost of each level is twice the cost of the last'] ] },
      { name: 'Check', recs: [
        ['run-sub', 'run', 'Subdivision run', 'A calculation of four rounds and eighty-five splits'],
        ['fig3', 'figure', 'Figure 3', 'The cost of each level under both prices'] ] } ] },
    { name: 'Word frequency', groups: [
      { name: 'Premises', recs: [
        ['wf-rare', 'premise', 'Rarer words cost more', 'A rare word costs more to name than a common word'],
        ['wf-mean', 'premise', 'Only the average cost is known', 'The average cost of a word is fixed, and nothing else is known'],
        ['wf-flat', 'premise', 'No word is favoured in advance', 'Each rank counts once before the constraint is applied'] ] },
      { name: 'Law', recs: [
        ['wf-step', 'step', 'Least-biased guess', 'The least biased guess at a distribution, by maximum entropy'],
        ['wf-jay', 'source', 'Jaynes 1957', 'The rule of maximum entropy'],
        ['wf-law', 'claim', 'The word-frequency law', 'The frequency of a word falls as a power of its rank'] ] },
      { name: 'Evidence', recs: [
        ['wf-run', 'run', 'Zipf family calculation', 'A calculation of the distribution for five hundred ranks'],
        ['fig6', 'figure', 'Figure 6', 'Word frequency against rank'],
        ['wf-oct', 'claim', 'Equal weight per doubling of rank', 'Each octave of rank carries about equal probability'] ] } ] },
    { name: 'Forgetting', groups: [
      { name: 'Machine', recs: [
        ['fg-test', 'premise', 'Any checkable claim has a test', 'Each statement that can be confirmed has a polynomial test'],
        ['fg-mach', 'step', 'Guess, test, erase', 'A machine makes a guess, tests it and erases each wrong guess'],
        ['fig5', 'figure', 'Figure 5', 'The guessing machine and its reset'] ] },
      { name: 'Heat bound', recs: [
        ['fg-land', 'source', 'Landauer 1961', 'The heat released when a memory is reset'],
        ['fg-heat', 'claim', 'Erasing a guess costs heat', 'Forgetting a wrong guess costs heat, in proportion to the entropy erased'],
        ['fg-ineq', 'step', 'Rank × probability ≤ 1', 'The probability at rank r is at most one over r'],
        ['fg-rank', 'claim', 'Heat is at least mean log rank', 'The heat is at least the mean logarithm of the probability rank'] ] },
      { name: 'Experiments', recs: [
        ['fg-ber', 'source', 'Bérut 2012', 'A measurement of the heat of erasing one bit'],
        ['fg-hong', 'source', 'Hong 2016', 'A measurement of erasure in a nanomagnetic memory'],
        ['fg-rec', 'claim', 'A kept record needs a register', 'A record of a failed guess occupies another register'] ] } ] }
  ];
  const LINKS = [
    ['nest-sum', 'nest-two', 'requires'], ['nest-sum', 'sym-reg', 'requires'], ['nest-ext', 'nest-sum', 'requires'], ['sym-typ', 'fig1', 'shown by'], ['nest-sum', 'fig1', 'shown by'],
    ['bud-log', 'bud-hom', 'requires'], ['bud-log', 'nest-sum', 'requires'], ['bud-rank', 'bud-log', 'requires'], ['bud-rank', 'sym-typ', 'requires'], ['bud-log', 'bud-fek', 'supported by'], ['bud-rank', 'bud-man', 'supported by'],
    ['hil-four', 'hil-src', 'supported by'], ['hil-four', 'fig4', 'shown by'], ['pr-const', 'pr-area', 'requires'], ['pr-const', 'hil-four', 'requires'], ['pr-double', 'pr-wall', 'requires'], ['pr-double', 'hil-four', 'requires'],
    ['pr-const', 'run-sub', 'computed by'], ['pr-double', 'run-sub', 'computed by'], ['pr-const', 'fig3', 'shown by'], ['pr-double', 'fig3', 'shown by'], ['pr-const', 'bud-hom', 'requires'],
    ['wf-rare', 'bud-rank', 'requires'], ['wf-step', 'wf-rare', 'requires'], ['wf-step', 'wf-mean', 'requires'], ['wf-step', 'wf-flat', 'requires'], ['wf-step', 'wf-jay', 'supported by'], ['wf-law', 'wf-step', 'requires'],
    ['wf-law', 'wf-run', 'computed by'], ['wf-law', 'fig6', 'shown by'], ['fig6', 'wf-run', 'computed by'], ['wf-oct', 'wf-law', 'requires'],
    ['fg-mach', 'fg-test', 'requires'], ['fg-mach', 'fig5', 'shown by'], ['fg-heat', 'fg-mach', 'requires'], ['fg-heat', 'fg-land', 'supported by'], ['fg-heat', 'fg-ber', 'supported by'], ['fg-heat', 'fg-hong', 'supported by'],
    ['fg-rank', 'fg-heat', 'requires'], ['fg-rank', 'fg-ineq', 'requires'], ['fg-rec', 'fg-mach', 'requires'], ['fg-rec', 'nest-two', 'requires']
  ];
  /* A question names how strongly its weight follows each kind of link, forwards (a to b) and backwards. */
  const QUESTIONS = [
    { id: 'figure', short: 'Figure', ask: 'Which figure shows the word-frequency law?',
      follow: { 'shown by': [4, .15], 'computed by': [.4, 1], 'requires': [.5, .3], 'supported by': [.3, .1] } },
    { id: 'rare', short: 'Rare words', ask: 'Why should a rare word cost more?',
      follow: { 'requires': [4, .15], 'supported by': [1.2, .1], 'shown by': [.3, .1], 'computed by': [.3, .1] } },
    { id: 'level', short: 'Levels', ask: 'Does every level of nesting cost the same?',
      follow: { 'requires': [1.2, .5], 'computed by': [1.4, .3], 'shown by': [1.4, .3], 'supported by': [.5, .1] } },
    { id: 'forget', short: 'Forgetting', ask: 'What does forgetting a wrong guess cost?',
      follow: { 'requires': [1.2, .8], 'supported by': [.6, .2], 'shown by': [.5, .2], 'computed by': [.4, .2] } }
  ];

  const STOP = new Set('a an and are as at be by can do does each for from has have how in is it its more of on one or should so than that the then to what when which whose why with'.split(' '));
  const words = s => s.toLowerCase().replace(/[^a-zà-ÿ ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));
  const same = (a, b) => { let n = 0; while (n < a.length && n < b.length && a[n] === b[n]) n++; return n >= Math.min(4, a.length, b.length); };

  const recs = [], byId = {};
  PARTS.forEach((p, pi) => p.groups.forEach((g, gi) => g.recs.forEach(([id, kind, label, text], ri) => {
    const r = { i: recs.length, id, kind, label, text, place: [], bag: [...new Set(words(label + ' ' + text + ' ' + kind))] };
    recs.push(r); byId[id] = r;
  })));
  const links = LINKS.map(([a, b, kind]) => ({ a: byId[a].i, b: byId[b].i, kind }));
  const N = recs.length;
  /* The same records can be filed another way. The first filing is by subject (PARTS, above); the second is by kind,
     and by subject within each kind. A filing is only a set of boxes: the records and their links do not change. */
  const KINDS = [['claim', 'Claims'], ['premise', 'Premises'], ['step', 'Steps'], ['source', 'Sources'], ['run', 'Calculations'], ['figure', 'Figures']];
  const FILINGS = [
    { id: 'subject', parts: PARTS.map(p => ({ name: p.name, groups: p.groups.map(g => ({ name: g.name, ids: g.recs.map(r => r[0]) })) })) },
    { id: 'kind', parts: KINDS.map(([k, name]) => ({ name, groups: PARTS.map(p => ({ name: p.name, ids: p.groups.flatMap(g => g.recs.filter(r => r[1] === k).map(r => r[0])) })).filter(g => g.ids.length) })) }
  ];
  FILINGS.forEach((F, f) => {
    F.boxes = F.parts.length + F.parts.reduce((n, p) => n + p.groups.length, 0);
    F.parts.forEach((p, pi) => p.groups.forEach((g, gi) => g.ids.forEach((id, k) => { byId[id].place[f] = { part: pi, group: gi, slot: k, n: g.ids.length }; })));
  });

  /* One round: every record keeps half its weight and passes half along its links, in proportion to how strongly
     this question follows each one; a fifth of the whole then returns to where the round began (`home`), which
     keeps the weight near the question. `inside` restricts the round to a set of records. */
  const BACK = .2;
  function step(x, q, inside, home) {
    const out = Array.from({ length: N }, () => []);
    links.forEach((l, li) => {
      if (inside && !(inside.has(l.a) && inside.has(l.b))) return;
      const [f, bk] = q.follow[l.kind];
      out[l.a].push({ to: l.b, c: f, li, dir: 1 }); out[l.b].push({ to: l.a, c: bk, li, dir: -1 });
    });
    const next = x.map(v => v * .5), flows = [];
    x.forEach((v, j) => {
      if (!v) return;
      const tot = out[j].reduce((s, e) => s + e.c, 0);
      if (!tot) { next[j] += v * .5; return; }
      out[j].forEach(e => { const m = v * .5 * e.c / tot; next[e.to] += m; if (m > 1e-4) flows.push({ from: j, to: e.to, li: e.li, dir: e.dir, m }); });
    });
    return { x: next.map((v, i) => (1 - BACK) * v + BACK * home[i]), flows };
  }
  const sums = (x, f) => { const P = FILINGS[f].parts.map(() => 0), G = FILINGS[f].parts.map(p => p.groups.map(() => 0)); recs.forEach(r => { const at = r.place[f]; P[at.part] += x[r.i]; G[at.part][at.group] += x[r.i]; }); return { P, G }; };
  const argmax = a => a.reduce((b, v, i) => v > a[b] ? i : b, 0);
  const norm = x => { const t = x.reduce((s, v) => s + v, 0) || 1; return x.map(v => v / t); };

  function search(q, f = 0) {
    const qw = words(q.ask);
    const hit = recs.map(r => qw.filter(w => r.bag.some(b => same(w, b))));
    const matched = [...new Set(hit.flat())];
    const seed = norm(hit.map(h => h.length * h.length));
    /* 1. spread over the whole object */
    const frames = [seed], flows = [];
    for (let k = 0; k < 4; k++) { const s = step(frames[frames.length - 1], q, null, seed); frames.push(s.x); flows.push(s.flows); }
    const top = sums(frames[4], f); const part = argmax(top.P);
    /* 2. the same again inside the heaviest part */
    const inP = new Set(recs.filter(r => r.place[f].part === part).map(r => r.i));
    const pframes = [norm(frames[4].map((v, i) => inP.has(i) ? v : 0))], pflows = [];
    for (let k = 0; k < 3; k++) { const s = step(pframes[pframes.length - 1], q, inP, pframes[0]); pframes.push(s.x); pflows.push(s.flows); }
    const mid = sums(pframes[3], f); const group = argmax(mid.G[part]);
    /* 3. the heaviest group is opened and its records are read: the answer is the heaviest of them */
    const inG = new Set(recs.filter(r => r.place[f].part === part && r.place[f].group === group).map(r => r.i));
    const fin = norm(frames[4].map((v, i) => inG.has(i) ? v : 0)), answer = argmax(fin);
    /* Reading order: start at the answer and take, each time, the heaviest record linked to what is already chosen.
       It hangs from the earliest chosen record it is linked to, so the order is also a tree rooted at the answer. */
    const w = frames[4], order = [{ i: answer, parent: -1, via: '', depth: 0 }], chosen = new Set([answer]);
    while (order.length < 6) {
      let best = null;
      links.forEach(l => [[l.a, l.b, 1], [l.b, l.a, -1]].forEach(([u, v, dir]) => {
        if (!chosen.has(u) || chosen.has(v)) return;
        const at = order.findIndex(o => o.i === u);
        if (!best || w[v] > best.w + 1e-9 || (v === best.i && at < best.at)) best = { w: w[v], i: v, at, kind: l.kind, dir };
      }));
      if (!best || best.w < .012) break;
      const par = order[best.at];
      order.push({ i: best.i, parent: par.i, via: best.dir > 0 ? best.kind : INVERSE[best.kind], depth: par.depth + 1 }); chosen.add(best.i);
    }
    const opened = 2, read = inG.size;
    return { q, f, matched, hit, seed, frames, flows, top, part, pframes, pflows, mid, group, fin, answer, order, opened, read,
      reached: recs.filter(r => !hit[r.i].length && frames[4][r.i] > .03).sort((a, b) => frames[4][b.i] - frames[4][a.i]).map(r => r.i) };
  }
  /* How a link reads from the far end: "Figure 6 shows the law" is the law "shown by" Figure 6 seen backwards. */
  const INVERSE = { 'requires': 'needed by', 'supported by': 'supports', 'computed by': 'computes', 'shown by': 'shows' };

  /* Where a record sits in the published paper (page of the PDF), for those whose place we can point to. */
  const PAPER = '/assets/docs/the-cost-of-complexity.pdf?v=3f99bae5';
  const PAGE = { 'sym-reg': 2, 'fig1': 3, 'sym-typ': 4, 'nest-sum': 4, 'bud-man': 8, 'fg-mach': 11, 'fg-ber': 3, 'fg-hong': 3, 'bud-hom': 6, 'bud-log': 6, 'bud-fek': 17, 'bud-rank': 8, 'hil-four': 9, 'pr-area': 10, 'pr-wall': 10, 'pr-const': 10, 'pr-double': 10, 'fig3': 10, 'fig4': 11,
    'fig5': 12, 'fg-test': 12, 'fg-land': 12, 'fg-heat': 12, 'fg-ineq': 12, 'fg-rank': 12, 'wf-rare': 13, 'wf-mean': 13, 'wf-flat': 13, 'wf-step': 13, 'wf-law': 13, 'wf-run': 14, 'fig6': 14 };
  recs.forEach(r => { r.page = PAGE[r.id] || 0; });
  const MODEL = { PARTS, FILINGS, QUESTIONS, recs, links, byId, search, words, INVERSE };
  if (typeof module !== 'undefined') module.exports = MODEL;
  if (typeof window === 'undefined') return;

  /* ------------------------------------------------------------------ 2. small helpers ---- */
  const NS = 'http://www.w3.org/2000/svg';
  const EM = window.EigenMotion || {};
  const MO = window.EG_MOTION = window.EG_MOTION || { off: false, rate: 1 };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const ramp = (x, a, b) => smooth((x - a) / (b - a));
  const mix = (a, b, t) => a + (b - a) * t;
  const Spring = EM.Spring || class { constructor(v = 0) { this.v = this.g = v; } to(g) { this.g = g; return this; } snap(g) { this.v = this.g = g; return this; } step() { this.v = this.g; return false; } };
  const sp = (v, k, c) => new Spring(v, k, c);
  function S(tag, parent, attrs, style) {            // one SVG element
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (style) e.setAttribute('style', style);
    if (parent) parent.appendChild(e);
    return e;
  }
  const H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const INK = 'var(--eg-ink)', MUTED = 'var(--eg-muted)', FAINT = 'var(--eg-faint)', GOLD = 'var(--eg-gold)', BLUE = 'var(--eg-blue)', TEAL = 'var(--eg-teal)', LINE = 'var(--eg-line)';

  /* The six kinds of record, drawn about (0,0) inside a 20-unit square. */
  const KIND = { claim: 'claim', premise: 'premise', step: 'step', source: 'source', run: 'calculation', figure: 'figure' };
  function glyph(kind, parent) {
    const g = S('g', parent, { class: 'qd-glyph qd-k-' + kind });
    if (kind === 'claim') S('circle', g, { r: 6.2 });
    else if (kind === 'premise') S('circle', g, { r: 5.6 });
    else if (kind === 'step') S('path', g, { d: 'M0 -7.4L7.4 0L0 7.4L-7.4 0Z' });
    else if (kind === 'source') { S('path', g, { d: 'M-5.2 -7.2H2.2L5.2 -4.2V7.2H-5.2Z' }); S('path', g, { d: 'M-2.6 -2.2H2.6M-2.6 .8H2.6M-2.6 3.8H1', class: 'qd-fine' }); }
    else if (kind === 'run') { S('path', g, { d: 'M-3.9 -6.8H3.9L7.8 0L3.9 6.8H-3.9L-7.8 0Z' }); S('path', g, { d: 'M-2 -2.8L1.6 0L-2 2.8', class: 'qd-fine' }); }
    else { S('rect', g, { x: -7, y: -6, width: 14, height: 12, rx: 2.6 }); S('path', g, { d: 'M-4.4 2.6L-1.6 -.8L.8 1.4L4.4 -2.8', class: 'qd-fine' }); }
    return g;
  }

  /* ------------------------------------------------------------------ 3. the card art ---- */
  /* An endless descent. A box holds five smaller boxes and one large one, the heaviest; a gold tracer runs the
     links from box to box and enters the heaviest, which the view has meanwhile grown to fill: and inside it is
     the same arrangement again. The picture is self-similar (each level is the last at 0.4 of the size about one
     fixed point), and every style is a function of level minus progress, so the loop has no seam. */
  function art(svg) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const r = .4, F = [246, 112], T = 8.4, LV = 5;
    const f = p => [F[0] + r * (p[0] - F[0]), F[1] + r * (p[1] - F[1])];           // a box, seen from its parent
    const fi = p => [F[0] + (p[0] - F[0]) / r, F[1] + (p[1] - F[1]) / r];
    const C = [F[0] * (1 - r), F[1] * (1 - r), 400 * r, 300 * r];                    // the heaviest box
    const SAT = [[20, 22, 100, 75], [320, 10, 66, 50], [26, 146, 92, 69], [326, 132, 62, 46], [164, 204, 108, 81]];
    const share = [.16, .07, .13, .06, .1], pass = [.02, .82, .22, .62, .42];        // when the tracer passes each
    const mid = b => [b[0] + b[2] / 2, b[1] + b[3] / 2];
    const W = [mid(SAT[0]), mid(SAT[2]), mid(SAT[4]), mid(SAT[3]), mid(SAT[1])]; W.push(f(W[0]));
    const pre = fi(W[4]), post = f(W[1]);
    const P = u => {                                                                  // the tracer's route, C1 across levels
      const x = clamp(u, 0, 1) * 5, i = Math.min(4, Math.floor(x)), t = x - i;
      const a = i ? W[i - 1] : pre, b = W[i], c = W[i + 1], d = i < 4 ? W[i + 2] : post;
      return [0, 1].map(k => .5 * (2 * b[k] + (c[k] - a[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t + (3 * b[k] - 3 * c[k] + d[k] - a[k]) * t * t * t));
    };
    const defs = S('defs', svg), gid = 'qda' + Math.random().toString(36).slice(2, 8);
    const rg = S('radialGradient', defs, { id: gid, cx: '50%', cy: '50%', r: '60%' });
    S('stop', rg, { offset: 0, 'stop-color': '#e4bf7d', 'stop-opacity': .5 }); S('stop', rg, { offset: 1, 'stop-color': '#e4bf7d', 'stop-opacity': 0 });
    const mg = S('linearGradient', defs, { id: gid + 'g', x1: 1, y1: 0, x2: 0, y2: 1 });          // the drawing thins toward the corner where a title sits
    S('stop', mg, { offset: 0, 'stop-color': '#fff' }); const m1 = S('stop', mg, { offset: .42, 'stop-color': '#fff' }), m2 = S('stop', mg, { offset: .7, 'stop-color': '#fff', 'stop-opacity': .2 }); S('stop', mg, { offset: 1, 'stop-color': '#fff', 'stop-opacity': .05 });
    S('rect', S('mask', defs, { id: gid + 'm', maskUnits: 'userSpaceOnUse', x: -20, y: -20, width: 440, height: 340 }), { x: -20, y: -20, width: 440, height: 340, fill: `url(#${gid}g)` });
    const scene = S('g', svg, { mask: `url(#${gid}m)` });
    const ns = 'vector-effect:non-scaling-stroke;fill:none;';
    let route = ''; for (let i = 0; i <= 60; i++) { const p = P(i / 60); route += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }
    const levels = [];
    for (let n = 0; n < LV; n++) {
      const g = S('g', scene), L = { g, sat: [], dots: [] };
      L.glow = S('rect', g, { x: 0, y: 0, width: 400, height: 300, rx: 14, fill: `url(#${gid})` });
      L.frame = S('rect', g, { x: 0, y: 0, width: 400, height: 300, rx: 14 }, ns + `stroke:${MUTED};stroke-width:1.3`);
      L.rim = S('rect', g, { x: 0, y: 0, width: 400, height: 300, rx: 14 }, ns + `stroke:${GOLD};stroke-width:2.2`);
      L.route = S('path', g, { d: route }, ns + `stroke:${MUTED};stroke-width:1;stroke-dasharray:1 5;stroke-linecap:round`);
      SAT.forEach((b, i) => {
        const box = S('rect', g, { x: b[0], y: b[1], width: b[2], height: b[3], rx: 7 }, ns + `stroke:${MUTED};stroke-width:1.3`);
        const per = 2 * (b[2] + b[3]);
        const gauge = S('rect', g, { x: b[0], y: b[1], width: b[2], height: b[3], rx: 7, pathLength: 100 }, ns + `stroke:${GOLD};stroke-width:2;stroke-linecap:round`);
        const m = mid(b), q = b[2] * .23, dots = [[-q, -q * .5], [q * .9, -q * .7], [q * .2, q * .8], [-q * 1.1, q * .55]].slice(0, 3 + (i % 2));
        S('path', g, { d: dots.map((d, j) => (j ? 'L' : 'M') + (m[0] + d[0]).toFixed(1) + ' ' + (m[1] + d[1]).toFixed(1)).join('') + 'Z' }, ns + `stroke:${MUTED};stroke-width:.7;opacity:.55`);
        dots.forEach((d, j) => L.dots.push({ i, el: S('circle', g, { cx: m[0] + d[0], cy: m[1] + d[1], r: j ? 2.3 : 3.1 }, `fill:${INK}`), gold: S('circle', g, { cx: m[0] + d[0], cy: m[1] + d[1], r: j ? 4.4 : 6.4 }, `fill:${GOLD}`) }));
        L.sat.push({ box, gauge, per });
      });
      levels.push(L);
    }
    const tr = S('g', scene, null, 'filter:drop-shadow(0 0 3px #ffd58b)');
    const wake = [S('path', tr, null, `fill:none;stroke:${GOLD};stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.38`),
      S('path', tr, null, 'fill:none;stroke:#ffe3a8;stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round;opacity:.8')];
    const tip = S('circle', tr, { r: 3.6 }, 'fill:#fff9e9;stroke:#f7ce7e;stroke-width:1.4');
    const at = v => v >= 0 ? f(P(v)) : P(v + 1);                                      // the route inside the box being entered, continued from its parent
    let small = false, n_ = 0;
    function tick(t) {
      if (n_++ % 90 === 0) {                                                            // a small card draws fewer levels and keeps further clear of its title
        const w = svg.clientWidth, s_ = w > 0 && w < 260, mid_ = w > 0 && w < 340;
        if (s_ !== small || n_ === 1) { small = s_; }
        m1.setAttribute('offset', mid_ ? .3 : .42); m2.setAttribute('offset', mid_ ? .56 : .7); m2.setAttribute('stop-opacity', mid_ ? .12 : .2);
      }
      const u = (((t / T) % 1) + 1) % 1, z = Math.pow(r, -u);
      const scr = p => [F[0] + z * (p[0] - F[0]), F[1] + z * (p[1] - F[1])];
      levels.forEach((L, n) => {
        const l = n + 1 - u, s = Math.pow(r, n - u);                                  // l = 2: just entered, at 0.4 of the view; l = 1: filling it
        L.g.setAttribute('transform', `translate(${(F[0] * (1 - s)).toFixed(3)} ${(F[1] * (1 - s)).toFixed(3)}) scale(${s.toFixed(5)})`);
        L.g.setAttribute('opacity', (small ? 1 - ramp(l, 2.6, 3.4) : 1 - ramp(l, 3.6, 4.8)).toFixed(3));
        const chosen = ramp(2.7 - l, 0, .6) * (1 - ramp(1.62 - l, 0, .56));          // gold from the moment it is chosen until it fills the view
        L.frame.style.opacity = (ramp(l, 1.02, 1.5) * .7).toFixed(3);
        L.rim.style.opacity = chosen.toFixed(3);
        L.glow.setAttribute('opacity', (chosen * .55).toFixed(3));
        const prog = 2 - l, here = ramp(l, .7, 1.25);
        L.route.style.opacity = (.5 * here).toFixed(3);
        L.sat.forEach((sat, i) => {
          const lit = ramp(prog - pass[i], -.04, .1);
          sat.gauge.style.strokeDasharray = `${(share[i] * 300 * lit).toFixed(2)} 100`;
          sat.gauge.style.opacity = lit.toFixed(3);
          sat.box.style.opacity = (.62 + .3 * lit).toFixed(3);
        });
        L.dots.forEach(d => { const lit = ramp(prog - pass[d.i], -.02, .12); d.gold.setAttribute('opacity', (lit * .5).toFixed(3)); });
      });
      const len = .26, pts = [];
      for (let i = 0; i <= 30; i++) pts.push(scr(at(u - len + len * i / 30)));
      const d = a => a.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
      wake[0].setAttribute('d', d(pts)); wake[1].setAttribute('d', d(pts.slice(17)));
      const h = pts[pts.length - 1]; tip.setAttribute('cx', h[0].toFixed(2)); tip.setAttribute('cy', h[1].toFixed(2));
    }
    tick(0);
    return { tick, destroy() { while (svg.firstChild) svg.removeChild(svg.firstChild); } };
  }

  /* ------------------------------------------------------------------ 4. the exhibit ---- */
  /* The object is drawn as boxes within boxes whose areas are springs. Nothing is ever placed by hand twice:
     a box's rectangle follows from the weights, a record's place follows from its box, and a link is redrawn
     from its two records every frame. A step of the search only changes what the springs are aiming at.
     Beats: 0 at rest, 1 ask, 2 spread, 3 report, 4 open the heaviest part, 5 open the heaviest group,
     6 the chosen records hang from the answer, 7 they straighten into a reading order. */
  const BEAT_OF_STEP = [0, 0, 1, 2, 3, 4, 6], STEP_OF_BEAT = [0, 2, 3, 4, 5, 5, 6, 6];      // step 1, "Refile", is the object at rest in its other filing
  const HOLD = [0, 2500, 3500, 3000, 3600, 3300, 3400, 0];        // how long each beat is held when the search plays itself
  const FROM_CHILD = { 'requires': p => `${p} requires it`, 'needed by': p => `requires ${p}`, 'supported by': p => `supports ${p}`, 'supports': p => `supported by ${p}`,
    'computed by': p => `computes ${p}`, 'computes': p => `computed by ${p}`, 'shown by': p => `shows ${p}`, 'shows': p => `shown by ${p}` };
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const ONES = 'no one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' '), TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
  const num = n => n < 20 ? ONES[n] : n < 60 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '') : String(n);
  const Num = n => { const w = num(n); return w[0].toUpperCase() + w.slice(1); };
  const wrap2 = (s, n) => { if (s.length <= n) return [s]; let k = s.lastIndexOf(' ', n); if (k < 0) k = n; return [s.slice(0, k), s.slice(k + 1)]; };

  function mount(el, opts) {
    const compact = !!(opts && opts.compact);
    el.classList.add('egn-search');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (el.clientHeight < 80) el.style.height = 'min(620px, 82vh)';                  // a host that gave no height
    const root = H('div', 'qd' + (compact ? ' qd-compact' : ''),
      '<div class="qd-ask"><span class="qd-qs" role="group" aria-label="Example questions"><span class="qd-lab">Ask</span></span><span class="qd-file" role="group" aria-label="How the records are filed"><span class="qd-lab">File by</span></span></div><p class="qd-asked" hidden></p>' +
      '<div class="qd-stage"><svg class="qd-svg" role="img"></svg><div class="qd-tip" aria-hidden="true"></div></div>' +
      '<div class="qd-foot"><p class="qd-say" aria-live="polite"></p><div class="qd-key" aria-hidden="true"></div></div>');
    el.appendChild(root);
    const askBar = root.querySelector('.qd-qs'), fileBar = root.querySelector('.qd-file'), asked = root.querySelector('.qd-asked'), stage = root.querySelector('.qd-stage'), svg = root.querySelector('svg'), tip = root.querySelector('.qd-tip'), sayEl = root.querySelector('.qd-say');
    const uid = 'qd' + Math.random().toString(36).slice(2, 8);
    const defs = S('defs', svg);
    const hg = S('radialGradient', defs, { id: uid + 'h' });
    S('stop', hg, { offset: 0, 'stop-color': '#f2d294', 'stop-opacity': .78 }); S('stop', hg, { offset: .45, 'stop-color': '#e4bf7d', 'stop-opacity': .3 }); S('stop', hg, { offset: 1, 'stop-color': '#e4bf7d', 'stop-opacity': 0 });
    const gBox = S('g', svg), gLink = S('g', svg), gLead = S('g', svg), gHalo = S('g', svg), gFlow = S('g', svg), gRec = S('g', svg), gThread = S('g', svg), gCard = S('g', svg), gOver = S('g', svg);

    /* legend */
    root.querySelector('.qd-key').innerHTML = Object.keys(KIND).map(k => `<span><svg viewBox="-10 -10 20 20" class="qd-rec qd-k-${k}"></svg>${KIND[k]}</span>`).join('');
    root.querySelectorAll('.qd-key svg').forEach((s, i) => glyph(Object.keys(KIND)[i], s));

    /* state */
    let W = 0, Hh = 0, narrow = false, zig = false, sums = false, short = false, tiny = false, two = true, pad = 10;
    let fi = 0, note = '', refiled = false, byHand = false, qi = -1, cur = null, beat = 0, round = 0, pround = 0, view = { part: -1, group: -1 }, playing = false, acted = false, landed = true, visible = true, destroyed = false, raf = 0, last = 0, first = true;
    const all = [], mk = (v, k, c) => { const s = sp(v, k, c); all.push(s); return s; };
    const mapS = { x: mk(0, 90, 19), y: mk(0, 90, 19), w: mk(100, 90, 19), h: mk(100, 90, 19) }, read = mk(0), lineS = mk(0), fmix = mk(0, 15, 7.75);      // the large moves are slower springs
    const timers = new Set();
    const later = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); if (!destroyed) fn(); }, ms); timers.add(id); return id; };
    const cancel = () => { timers.forEach(clearTimeout); timers.clear(); };

    /* boxes, one set for each way of filing the records */
    const rest = n => .55 + .045 * n;                    // a box at rest is a little larger for holding more
    const files = FILINGS.map((F, f) => {
      const layer = S('g', gBox, { class: 'qd-filing' });
      const ps = F.parts.map((P, p) => {
        const g = S('g', layer, { class: 'qd-part' });
        const o = { p, name: P.name, lw: mk(1), open: mk(0), gauge: mk(0), sel: mk(0), rect: { x: 0, y: 0, w: 0, h: 0 }, n: 0, tw: 90, tight: 0 };
        o.box = S('rect', g, { class: 'qd-pbox', rx: 13, tabindex: f ? -1 : 0, role: 'button' });
        o.tint = S('rect', g, { class: 'qd-tint', rx: 13 });
        o.groups = P.groups.map((G, gi) => {
          const q = { p, gi, name: G.name, lw: mk(1), open: mk(0), gauge: mk(0), rect: { x: 0, y: 0, w: 0, h: 0 }, n: G.ids.length };
          q.box = S('rect', g, { class: 'qd-gbox', rx: 9, tabindex: -1, role: 'button' });
          q.rim = S('rect', g, { class: 'qd-rim', rx: 9, pathLength: 1 });
          q.title = S('text', g, { class: 'qd-gtitle' }); q.title.textContent = G.name;
          q.pct = S('text', g, { class: 'qd-pct qd-gpct', 'text-anchor': 'end' });
          const act = e => { e.stopPropagation(); if (f === fi) manual(p, gi); };
          q.box.addEventListener('click', act); q.box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(e); } });
          o.n += q.n; return q;
        });
        o.rim = S('rect', g, { class: 'qd-rim', rx: 13, pathLength: 1 });
        o.title = S('text', g, { class: 'qd-ptitle' }); o.title.textContent = P.name;
        o.pct = S('text', g, { class: 'qd-pct', 'text-anchor': 'end' });
        o.cnt = S('text', g, { class: 'qd-cnt', 'text-anchor': 'end' }); o.cnt.textContent = o.n + ' records';
        const act = () => { if (f === fi) manual(p, -1); };
        o.box.addEventListener('click', act); o.box.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        return o;
      });
      return { f, F, layer, parts: ps };
    });
    let parts = files[0].parts;                          // the boxes of the filing now showing

    /* links */
    const L = links.map((l, i) => ({ l, i, el: S('path', gLink, { class: 'qd-link qd-l-' + l.kind.replace(' ', '-') }), flash: mk(0, 60, 16), bow: ((i * 7919) % 2 ? 1 : -1) * (.1 + ((i * 31) % 7) / 60) }));
    const linksOf = recs.map(() => []); L.forEach(o => { linksOf[o.l.a].push(o); linksOf[o.l.b].push(o); });

    /* records */
    const R = recs.map(r => {
      const o = { r, w: mk(0), lift: mk(0), cx: mk(0), cy: mk(0), cw: mk(160), ch: mk(30), ring: mk(0), hot: mk(0, 120, 22), x: 0, y: 0, hx: 0, hy: 0, op: 0, gh: 40, tw: 120, ord: -1, inCard: false };
      o.halo = S('circle', gHalo, { class: 'qd-halo', fill: `url(#${uid}h)`, r: 0 });
      o.ghost = S('circle', gLead, { class: 'qd-ghost', r: 4.5 }); o.lead = S('path', gLead, { class: 'qd-lead' });
      o.g = S('g', gRec, { class: 'qd-rec qd-k-' + r.kind });
      o.card = S('rect', o.g, { class: 'qd-card', rx: 10 });
      o.ringEl = S('circle', o.g, { class: 'qd-ring', r: 14 });
      o.gl = glyph(r.kind, o.g);
      o.label = S('text', o.g, { class: 'qd-label', x: 16, y: 4.6 }); o.label.textContent = r.label;
      o.sum = S('text', o.g, { class: 'qd-sum', x: 16, y: 21 });
      wrap2(r.text + '.', 42).forEach((t, k) => { const ts = S('tspan', o.sum, { x: 16, dy: k ? 15 : 0 }); ts.textContent = t; });
      o.sub = S('text', o.g, { class: 'qd-sub', x: 16, y: 11.6 });
      o.badge = S('g', o.g, { class: 'qd-badge' }); S('circle', o.badge, { r: 10 }); o.bt = S('text', o.badge, { 'text-anchor': 'middle', y: 4.3 });
      o.hit = S('circle', o.g, { class: 'qd-hit', r: 13 });
      if (r.page) { o.pg = S('a', o.g, { class: 'qd-page', href: `${PAPER}#page=${r.page}`, target: '_blank', rel: 'noopener', tabindex: -1, 'aria-label': `${r.label}: page ${r.page} of the paper, in a new tab` }); const t = S('text', o.pg, { 'text-anchor': 'end', y: -3.8 }); t.textContent = `p. ${r.page} ↗`; }
      o.hit.addEventListener('pointerenter', () => hover(o, true)); o.hit.addEventListener('pointerleave', () => hover(o, false));
      return o;
    });
    const thread = Array.from({ length: 5 }, () => ({ el: S('path', gThread, { class: 'qd-thread' }), tx: S('text', gThread, { class: 'qd-via', 'text-anchor': 'middle' }) }));
    const header = S('text', gOver, { class: 'qd-head' }); header.textContent = 'Reading order';

    /* particles of weight */
    const flows = [], pool = [];
    const dot = () => pool.pop() || S('circle', gFlow, { class: 'qd-flow' });
    function emit(list, tone) {
      if (MO.off) return;
      list.slice().sort((a, b) => b.m - a.m).slice(0, 46).forEach((f, k) => {
        const el = dot(); el.setAttribute('class', 'qd-flow' + (tone ? ' qd-flow-' + tone : ''));
        flows.push({ o: L[f.li], dir: f.dir, m: f.m, t0: performance.now() + k * 6, dur: 640, el }); L[f.li].flash.snap(Math.min(1, .35 + Math.sqrt(f.m) * 3)).to(0);
      });
      wake();
    }
    function rain(k) {                                   // the question falls from its chip onto the records it matches
      if (MO.off || !cur) return;
      const sb = stage.getBoundingClientRect(), cb = qBtns[k].getBoundingClientRect(), x0 = cb.left + cb.width / 2 - sb.left;
      R.forEach((o, i) => { if (cur.seed[i] > 0) { const el = dot(); el.setAttribute('class', 'qd-flow'); flows.push({ from: { x: x0, y: -8 }, to: o, m: cur.seed[i], t0: performance.now() + i * 9, dur: 720, el }); } });
      wake();
    }
    let idleAt = 0, idleN = 0;

    /* ------------------------------------------------ what the springs aim at ---- */
    const ofRec = (r, f = fi) => files[f].parts[r.place[f].part].groups[r.place[f].group];
    function measure() {
      const b = stage.getBoundingClientRect(); W = Math.max(240, b.width); Hh = Math.max(200, b.height);
      svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); narrow = W < 520; pad = W < 700 ? 8 : 12;
      const gw = ((W - 2 * pad - 9) * .77 - 28) * 5 / 7, gh = (Hh - 2 * pad - 9) * .85 - 70;      // an opened group, roughly
      zig = gw >= 560; sums = gw >= 380 && gh / 5 >= 50;
      const rh = root.getBoundingClientRect().height; short = rh < 430; tiny = rh < 290;
      const was = root.classList.contains('qd-narrow');
      root.classList.toggle('qd-zig', zig); root.classList.toggle('qd-narrow', narrow); if (was !== narrow) chips(); root.classList.toggle('qd-short', short); root.classList.toggle('qd-tiny', tiny);
      R.forEach(o => { const t = o.label.getComputedTextLength ? o.label.getComputedTextLength() : 0; o.tw = t > 4 ? t : o.r.label.length * 7; });
      const wide = (e, n, k) => { const t = e.getComputedTextLength ? e.getComputedTextLength() : 0; return t > 4 ? t : n.length * k; };
      files.forEach(fl => fl.parts.forEach(P => { P.tw = wide(P.title, P.name, 7.4); P.groups.forEach(G => { G.tw = wide(G.title, G.name, 6.4); }); }));
    }
    function listGeom() {
      const n = cur ? cur.order.length : 6; let g;
      if (narrow) {
        const mh = tiny ? 0 : Math.max(72, Hh * .2), y0 = mh + (tiny ? 22 : 30), pitch = Math.min(64, (Hh - y0 - 2) / n);
        g = { map: { x: pad, y: tiny ? -70 : pad, w: W - 2 * pad, h: tiny ? 60 : mh - pad }, left: pad + 30, y0, pitch, cw: W - 2 * pad - 30, hx: pad + 30, hy: mh + (tiny ? 14 : 18), gap: 5 };
      } else {
        const mw = clamp(W * .4, 210, 470), left = mw + 44, y0 = short ? 30 : 36, pitch = Math.min(74, (Hh - y0 - 4) / n);
        g = { map: { x: pad, y: pad, w: mw - pad, h: Hh - 2 * pad }, left, y0, pitch, cw: W - left - pad, hx: left, hy: short ? 18 : 22, gap: pitch < 44 ? 5 : 8 };
      }
      two = g.pitch >= 44; return g;                       // room for a second line on each card
    }
    function treeGeom() {
      const ord = cur.order, maxD = Math.max(...ord.map(o => o.depth)), gapY = clamp((Hh - 70) / Math.max(1, maxD), 46, 96), pos = {};
      for (let d = 0; d <= maxD; d++) {
        const row = ord.filter(o => o.depth === d).sort((a, b) => (pos[a.parent] ? pos[a.parent].x : 0) - (pos[b.parent] ? pos[b.parent].x : 0));
        const ws = row.map(o => R[o.i].tw + 50), need = ws.reduce((s, v) => s + v, 0) + 22 * (row.length - 1), avail = W - 2 * pad - 8;
        const k = need > avail ? avail / need : 1; let x = (W - need * k) / 2;
        row.forEach((o, j) => { pos[o.i] = { x: x + 20 * k, y: 36 + d * gapY + (k < 1 && j % 2 ? 24 : 0), cw: ws[j] }; x += (ws[j] + 22) * k; });
      }
      return pos;
    }
    function aim() {
      const s = cur, b = beat, reading = b >= 6;
      const lg = listGeom(), m = b === 7 ? lg.map : { x: pad, y: pad, w: W - 2 * pad, h: Hh - 2 * pad };
      mapS.x.to(m.x); mapS.y.to(m.y); mapS.w.to(m.w); mapS.h.to(m.h); read.to(reading ? 1 : 0); lineS.to(b === 7 ? 1 : 0);
      const v = b === 7 ? { part: -1, group: -1 } : view;
      fmix.to(fi);
      files.forEach(fl => {
        const on = fl.f === fi;
        fl.parts.forEach((P, p) => {
          const share = on && s && b >= 3 ? s.top.P[p] : 0;
          let lw = on && s && b >= 3 ? .5 + 2.6 * share : rest(P.n);
          if (on && v.part >= 0) lw = p === v.part ? (narrow ? 15 : 6) : 1.05 + share;
          P.lw.to(lw); P.open.to(on && p === v.part ? 1 : 0); P.gauge.to(share);
          P.sel.to(on && s && b >= 3 && p === s.part ? 1 : 0);
          P.box.setAttribute('tabindex', on ? 0 : -1);
          P.box.setAttribute('aria-expanded', on && p === v.part ? 'true' : 'false');
          P.box.setAttribute('aria-label', `${P.name}, ${P.n} records` + (share ? `, ${Math.round(share * 100)} per cent of the weight` : ''));
          P.groups.forEach((G, g) => {
            const inS = on && s && p === s.part && b >= 4, gs = inS ? s.mid.G[p][g] : 0;
            let gw = inS ? .5 + 2.6 * gs : 1;
            if (on && p === v.part && v.group >= 0) gw = g === v.group ? (narrow ? 9 : 5) : narrow ? .3 : (inS ? .7 + .9 * gs : 1);
            G.lw.to(gw); G.open.to(on && p === v.part && g === v.group ? 1 : 0); G.gauge.to(gs);
            G.box.setAttribute('tabindex', on && p === v.part ? 0 : -1); G.box.setAttribute('aria-label', `${G.name}, ${G.n} records, in ${P.name}`);
          });
        });
      });
      const tg = reading && s ? treeGeom() : null;
      R.forEach(o => {
        const i = o.r.i, at = o.r.place[fi], inP = s && at.part === s.part, inG = inP && at.group === s.group;
        let w = 0;
        if (s && b > 0) {
          if (b === 1) w = landed ? s.seed[i] : 0; else if (b === 2) w = s.frames[round][i]; else if (b === 3) w = s.frames[4][i];
          else if (b === 4) w = inP ? s.pframes[pround][i] : s.frames[4][i] * .55;
          else w = inG ? s.fin[i] * .8 : inP ? s.pframes[3][i] * .45 : s.frames[4][i] * .4;
        }
        o.w.to(w); o.ring.to(s && b >= 5 && i === s.answer ? 1 : 0);
        const k = s ? s.order.findIndex(x => x.i === i) : -1; o.ord = k;
        if (reading && k >= 0) {
          const t = b === 7 ? { x: lg.left + 22, y: lg.y0 + lg.pitch * (k + .5), cw: lg.cw, ch: lg.pitch - lg.gap } : { x: tg[i].x, y: tg[i].y, cw: tg[i].cw, ch: 32 };
          const go_ = () => { o.cx.to(t.x); o.cy.to(t.y); o.cw.to(t.cw); o.ch.to(t.ch); };
          if (o.lift.g < .5 && o.lift.v < .05) { o.cx.snap(t.x); o.cy.snap(t.y); o.cw.snap(t.cw); o.ch.snap(t.ch); }
          else if (b === 7 && Math.abs(o.cy.g - t.y) > 2 && !MO.off) later(k * 55, () => { if (beat === 7) { go_(); wake(); } });      // straighten one after another
          else go_();
          if (!o.inCard) { gCard.appendChild(o.g); o.inCard = true; }
          if (o.lift.g < .5) later(60 + k * 80, () => { if (beat >= 6) { o.lift.to(1); wake(); } });
          const it = s.order[k], F = FILINGS[fi], roomy = o.r.text.length * 6.1 < lg.cw - 70;
          const ph = k ? FROM_CHILD[it.via]('\u0001').split('\u0001') : roomy ? [o.r.text + '.', ''] : ['the answer, from the ', ' box'], nm = k ? recs[it.parent].label : roomy ? '' : F.parts[at.part].name;
          while (o.sub.firstChild) o.sub.removeChild(o.sub.firstChild);
          [[ph[0], ''], [nm, 'qd-nm'], [ph[1], '']].forEach(([t, c]) => { if (t) { const ts = S('tspan', o.sub, c ? { class: c } : null); ts.textContent = t; } });
          o.bt.textContent = String(k + 1);
        } else o.lift.to(0);
        o.g.classList.toggle('qd-in-order', reading && k >= 0);
      });
      if (s) s.order.slice(1).forEach((it, k) => { thread[k].tx.textContent = it.via; });
      wake();
    }

    /* ------------------------------------------------ where everything is, this frame ---- */
    function layout(fl, M, gap) {                         // the rectangles of one filing, from its weights
      const cols = [fl.parts.filter((_, i) => i % 2 === 0), fl.parts.filter((_, i) => i % 2 === 1)], cw = cols.map(c => c.reduce((t, P) => t + P.lw.v, 0)), w0 = (M.w - gap) * cw[0] / (cw[0] + cw[1]);
      cols.forEach((c, ci) => {
        const x = ci ? M.x + w0 + gap : M.x, w = ci ? M.w - gap - w0 : w0, room = M.h - gap * (c.length - 1); let y = M.y;
        c.forEach(P => { const h = room * P.lw.v / cw[ci]; P.rect = { x, y, w, h }; y += h + gap; });
      });
      fl.parts.forEach(P => {
        P.tight = (1 - ramp(P.rect.w, P.tw + 58, P.tw + 76)) * ramp(P.gauge.v, .004, .03);
        const r = P.rect, hh = Math.min(mix(25, 31, P.open.v) + 15 * P.tight, r.h * .5), in_ = Math.min(8, r.w * .06), gg = Math.min(6, r.w * .03);
        const cx = r.x + in_, cy = r.y + hh, cw_ = r.w - 2 * in_, ch = r.h - hh - in_, tot = P.groups.reduce((t, G) => t + G.lw.v, 0);
        let x = cx;
        P.groups.forEach(G => { const w = (cw_ - gg * (P.groups.length - 1)) * G.lw.v / tot; G.rect = { x, y: cy, w, h: Math.max(2, ch) }; x += w + gg; });
      });
    }
    function home(o, f) {                                // where a record sits in one filing
      const at = o.r.place[f], G = files[f].parts[at.part].groups[at.group], g = G.rect, op = G.open.v, k = at.slot, n = at.n;
      const gh = 20 * ramp(g.h, 34, 60) * ramp(g.w, 50, 96), top = g.y + gh + 3, hgt = Math.max(1, g.h - gh - 8);
      const xc = g.x + g.w * (n === 1 ? .5 : k % 2 ? .66 : .34), xo = g.x + (narrow ? 15 : 24) + (zig && k % 2 ? g.w * .49 : 0);
      return { x: mix(xc, xo, op), y: top + hgt * (k + .5) / n, sc: mix(clamp(Math.min(g.w / 56, hgt / (n * 17)), .36, .96), 1.08, op), op, gh: g.h };
    }
    function place() {
      const M = { x: mapS.x.v, y: mapS.y.v, w: mapS.w.v, h: mapS.h.v }, gap = W < 700 ? 6 : 9, f01 = clamp(fmix.v);
      files.forEach(fl => layout(fl, M, gap));
      R.forEach(o => {
        const u = clamp(f01 * 1.25 - .25 * (o.r.i / (R.length - 1))), t = u * u * u * (u * (u * 6 - 15) + 10);      // the records set off one after another, and gently
        const a = t < .999 ? home(o, 0) : null, b = t > .001 ? home(o, 1) : null, A = a || b, B = b || a, l = o.lift.v;
        o.hx = mix(A.x, B.x, t); o.hy = mix(A.y, B.y, t); o.op = mix(A.op, B.op, t); o.gh = mix(A.gh, B.gh, t);
        o.sc = mix(mix(A.sc, B.sc, t), 1.08, l);
        o.x = mix(o.hx, o.cx.v, l); o.y = mix(o.hy, o.cy.v, l);
      });
    }
    const curve = (A, B, bow) => { const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, k = Math.sign(bow) * Math.min(34, Math.abs(bow) * d); return [(A.x + B.x) / 2 - dy / d * k, (A.y + B.y) / 2 + dx / d * k]; };

    const at_ = (e, k, v) => { const c = e.__a || (e.__a = {}); if (c[k] !== v) { c[k] = v; e.setAttribute(k, v); } };      // write only what changed
    const st_ = (e, k, v) => { const c = e.__s || (e.__s = {}); if (c[k] !== v) { c[k] = v; e.style[k] = v; } };
    function draw(now) {
      const dim = 1 - .62 * read.v, rd = read.v, ln = lineS.v, f2 = v => v.toFixed(2), ft = smooth(clamp(fmix.v));
      files.forEach(fl => {
      const fa = fl.f ? ft : 1 - ft; st_(fl.layer, 'opacity', f2(fa)); at_(fl.layer, 'pointer-events', fl.f === fi ? 'auto' : 'none');
      if (fa < .002) return;
      fl.parts.forEach(P => {
        const r = P.rect;
        [P.box, P.tint, P.rim].forEach(e => { at_(e, 'x', f2(r.x)); at_(e, 'y', f2(r.y)); at_(e, 'width', f2(Math.max(1, r.w))); at_(e, 'height', f2(Math.max(1, r.h))); });
        st_(P.box, 'opacity', f2(dim)); st_(P.tint, 'opacity', f2((.05 + .09 * P.sel.v) * dim * (.4 + .6 * Math.max(P.sel.v, P.open.v))));
        st_(P.rim, 'strokeDasharray', `${P.gauge.v.toFixed(4)} 1`); st_(P.rim, 'opacity', f2(ramp(P.gauge.v, .004, .03) * (.45 + .55 * dim)));
        const gv = ramp(P.gauge.v, .004, .03), tight = P.tight, ty = r.y + 18 + 2 * P.open.v;
        at_(P.title, 'x', f2(r.x + 12)); at_(P.title, 'y', f2(ty)); st_(P.title, 'opacity', f2(ramp(r.w, P.tw + 14, P.tw + 30) * ramp(r.h, 24, 34) * dim));
        const pc = Math.round(P.gauge.v * 100); if (P.pcv !== pc) { P.pcv = pc; P.pct.textContent = pc + '%'; }
        at_(P.pct, 'x', f2(r.x + r.w - 11)); at_(P.pct, 'y', f2(ty + 16 * tight)); st_(P.pct, 'opacity', f2(gv * ramp(r.w, 44, 64) * ramp(r.h, 22 + 16 * tight, 30 + 16 * tight) * (.55 + .45 * dim)));
        at_(P.cnt, 'x', f2(r.x + r.w - 11)); at_(P.cnt, 'y', f2(ty)); st_(P.cnt, 'opacity', f2((1 - gv) * ramp(r.w, P.tw + 96, P.tw + 120) * ramp(r.h, 24, 34) * dim * .9));
        P.groups.forEach(G => {
          const g = G.rect;
          [G.box, G.rim].forEach(e => { at_(e, 'x', f2(g.x)); at_(e, 'y', f2(g.y)); at_(e, 'width', f2(Math.max(1, g.w))); at_(e, 'height', f2(Math.max(1, g.h))); });
          st_(G.box, 'opacity', f2(dim * ramp(g.h, 4, 16)));
          st_(G.box, 'fillOpacity', f2(.35 + .5 * G.open.v));
          st_(G.rim, 'strokeDasharray', `${G.gauge.v.toFixed(4)} 1`); st_(G.rim, 'opacity', f2(ramp(G.gauge.v, .004, .03) * dim));
          const ga = ramp(g.w, (G.tw || 60) + 12, (G.tw || 60) + 26) * ramp(g.h, 52, 74) * dim;
          at_(G.title, 'x', f2(g.x + 10)); at_(G.title, 'y', f2(g.y + 16)); st_(G.title, 'opacity', f2(ga * (.75 + .25 * G.open.v)));
          const gp = Math.round(G.gauge.v * 100); if (G.pcv !== gp) { G.pcv = gp; G.pct.textContent = gp + '%'; }
          at_(G.pct, 'x', f2(g.x + g.w - 9)); at_(G.pct, 'y', f2(g.y + 16)); st_(G.pct, 'opacity', f2(ramp(G.gauge.v, .004, .03) * ramp(g.w, (G.tw || 60) + 50, (G.tw || 60) + 66) * ramp(g.h, 36, 58) * dim));
        });
      });
      });
      R.forEach(o => {
        const op = o.op, l = o.lift.v, hot = o.hot.v;
        at_(o.g, 'transform', `translate(${f2(o.x)} ${f2(o.y)})`);
        st_(o.g, 'opacity', f2(mix(dim * (.55 + .45 * ramp(o.gh, 6, 22)), 1, l)));
        at_(o.gl, 'transform', `scale(${(o.sc * (1 + .18 * hot)).toFixed(3)})`);
        const la = Math.max(ramp(op, .55, .97), ramp(l, .25, .8));
        st_(o.label, 'opacity', f2(la)); at_(o.label, 'y', f2(mix(4.6, two ? -3.8 : 4.6, ln * l) - (sums ? 5 * ramp(op, .6, 1) * (1 - l) : 0)));
        st_(o.sum, 'opacity', f2(sums ? ramp(op, .7, 1) * (1 - ramp(l, 0, .3)) * .92 : 0)); at_(o.sum, 'y', '15');
        st_(o.sub, 'opacity', f2(two ? ln * ramp(l, .6, 1) : 0));
        const cw = o.cw.v, ch = o.ch.v;
        at_(o.card, 'x', -22); at_(o.card, 'y', f2(-ch / 2)); at_(o.card, 'width', f2(Math.max(2, cw))); at_(o.card, 'height', f2(Math.max(2, ch)));
        st_(o.card, 'opacity', f2(ramp(l, .15, .75)));
        st_(o.ringEl, 'opacity', f2(o.ring.v)); at_(o.ringEl, 'r', f2(11 + 4 * o.sc + 3 * (1 - o.ring.v)));
        if (o.pg) { at_(o.pg, 'transform', `translate(${f2(cw - 36)} ${two ? 0 : 8.4})`); st_(o.pg, 'opacity', f2(ln * ramp(l, .6, 1))); }
        at_(o.badge, 'transform', `translate(${f2(-22 - 17 * ln)} 0)`); st_(o.badge, 'opacity', f2(ln * ramp(l, .5, 1)));
        const w = o.w.v, hk = compact ? .8 : 1, hr = ramp(w, .0008, .012) * Math.min(44 * hk, (9 + Math.sqrt(w) * mix(48, 60, op)) * hk);
        at_(o.halo, 'cx', f2(o.x)); at_(o.halo, 'cy', f2(o.y)); at_(o.halo, 'r', f2(Math.max(0, hr * (1 - .45 * l))));
        st_(o.halo, 'opacity', f2(ramp(w, .0015, .02) * mix(.55 + .45 * dim, .5, l)));
        at_(o.ghost, 'cx', f2(o.hx)); at_(o.ghost, 'cy', f2(o.hy)); st_(o.ghost, 'opacity', f2(l * .9));
        if (l > .01) { const c = curve({ x: o.hx, y: o.hy }, { x: o.x - 18, y: o.y }, .12); at_(o.lead, 'd', `M${f2(o.hx)} ${f2(o.hy)}Q${f2(c[0])} ${f2(c[1])} ${f2(o.x - 18)} ${f2(o.y)}`); }
        st_(o.lead, 'opacity', f2(l * (.34 - .12 * ln)));
        if (o.inCard && o.lift.g < .5 && l < .02) { gRec.appendChild(o.g); o.inCard = false; }
      });
      L.forEach(o => {
        const A = R[o.l.a], B = R[o.l.b], c = curve(A, B, o.bow), la = A.lift.v, lb = B.lift.v;
        o.c = c; at_(o.el, 'd', `M${f2(A.x)} ${f2(A.y)}Q${f2(c[0])} ${f2(c[1])} ${f2(B.x)} ${f2(B.y)}`);
        const hot = Math.max(A.hot.v, B.hot.v), far = ofRec(A.r) !== ofRec(B.r), both = Math.min(la, lb), any = Math.max(la, lb);
        const base = (far ? .34 : .5) * dim * (1 - any) + .0 * both;
        st_(o.el, 'opacity', f2(clamp(base + hot * .6 * (1 - any * .5) + o.flash.v * .65 * (1 - any))));
        st_(o.el, 'strokeWidth', f2(1.1 + hot * .9 + o.flash.v * 1.5));
      });
      for (let k = flows.length - 1; k >= 0; k--) {
        const p = flows[k], t = (now - p.t0) / p.dur;
        if (t >= 1 || MO.off) { st_(p.el, 'opacity', 0); pool.push(p.el); flows.splice(k, 1); continue; }
        if (t < 0) { st_(p.el, 'opacity', 0); continue; }
        const A = p.from || R[p.dir > 0 ? p.o.l.a : p.o.l.b], B = p.to || R[p.dir > 0 ? p.o.l.b : p.o.l.a], c = p.from ? [mix(A.x, B.x, .3), mix(A.y, B.y, .75)] : (p.o.c || [(A.x + B.x) / 2, (A.y + B.y) / 2]), e = smooth(t), q = 1 - e;
        at_(p.el, 'cx', f2(q * q * A.x + 2 * q * e * c[0] + e * e * B.x)); at_(p.el, 'cy', f2(q * q * A.y + 2 * q * e * c[1] + e * e * B.y));
        at_(p.el, 'r', f2(1.4 + Math.min(6, Math.sqrt(p.m) * 15))); st_(p.el, 'opacity', f2(Math.sin(Math.PI * t) * Math.min(1, .35 + Math.sqrt(p.m) * 4) * (.4 + .6 * dim)));
      }
      const ord = cur ? cur.order : [];
      thread.forEach((T, k) => {
        const it = ord[k + 1];
        if (!it) { st_(T.el, 'opacity', 0); st_(T.tx, 'opacity', 0); return; }
        const P = R[it.parent], C = R[it.i], l = Math.min(P.lift.v, C.lift.v), a = ramp(l, .35, .95) * rd;
        const x1 = mix(P.x - 22 + P.cw.v / 2, P.x - 39, ln), y1 = mix(P.y + P.ch.v / 2, P.y + 10 * ln, ln), x2 = mix(C.x - 22 + C.cw.v / 2, C.x - 39, ln), y2 = mix(C.y - C.ch.v / 2, C.y - 10 * ln, ln);
        const my = (y1 + y2) / 2, bx = mix(0, -16 - 6 * Math.max(0, (ord.findIndex(q => q.i === it.i) - ord.findIndex(q => q.i === it.parent) - 1)), ln);
        at_(T.el, 'd', `M${f2(x1)} ${f2(y1)}C${f2(x1 + bx)} ${f2(mix(my, y1 + (y2 - y1) * .25, ln))} ${f2(x2 + bx)} ${f2(mix(my, y1 + (y2 - y1) * .75, ln))} ${f2(x2)} ${f2(y2)}`);
        st_(T.el, 'opacity', f2(a * .95));
        at_(T.tx, 'x', f2((x1 + x2) / 2)); at_(T.tx, 'y', f2(my + 4)); st_(T.tx, 'opacity', f2(a * (1 - ramp(ln, 0, .5))));
      });
      const lg = listGeom(); at_(header, 'x', f2(lg.hx)); at_(header, 'y', f2(lg.hy)); st_(header, 'opacity', f2(ramp(ln, .8, 1) * rd));
    }

    /* ------------------------------------------------ the loop ---- */
    function frame(now) {
      raf = 0; if (destroyed) return;
      const dt = Math.min(.1, Math.max(.001, (now - last) / 1000)); last = now;
      let moving = false; const sub = Math.max(1, Math.ceil(dt / .009)), h = dt / sub;      // short fixed steps, so a slow frame cannot lurch
      for (let k = 0; k < sub; k++) { moving = false; for (const s of all) if (s.step(h)) moving = true; }
      const idle = beat === 0 && !MO.off && visible;
      if (idle && now > idleAt) { idleAt = now + 520; const o = L[(idleN = (idleN * 17 + 11) % L.length)]; emit([{ li: o.i, dir: idleN % 2 ? 1 : -1, m: .012 }], 'idle'); }
      place(); draw(now);
      if (probe) {                                     // motion measured on the exhibit's own frames (for tests)
        const k = dt / (1 / 60); let mx = 0, at = -1; probe.n++; probe.t += dt;
        R.forEach((o, i) => { const d = o.px == null ? 0 : Math.hypot(o.x - o.px, o.y - o.py) / k, j = Math.abs(d - (o.pd || 0)); if (d > probe.step) probe.step = d; if (o.px != null && j > probe.jerk) { probe.jerk = j; probe.who = o.r.id; probe.beat = beat; } o.px = o.x; o.py = o.y; o.pd = d; });
        probe.dtMax = Math.max(probe.dtMax, dt);
      }
      if ((moving || flows.length || idle) && visible) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && !destroyed) { last = performance.now() - 16; raf = requestAnimationFrame(frame); } }

    /* ------------------------------------------------ words beside the figure ---- */
    const pc = v => Math.round(v * 100) + '%', em = s => `<b>${esc(s)}</b>`;
    const boxShare = (p, g) => recs.reduce((a, r) => { const at = r.place[fi]; return a + (at.part === p && (g < 0 || at.group === g) ? cur.frames[4][r.i] : 0); }, 0);
    const rec_ = i => `the record ‘${em(recs[i].label)}’`;
    function say() {
      const s = cur, n = recs.length, F = FILINGS[fi], by = fi ? 'kind' : 'subject'; let t;
      if (note) t = note;
      else if (!s || beat === 0) t = fi ? `The same ${num(n)} records are filed by kind, in ${num(F.boxes)} boxes. Not one link has changed.` : `${Num(n)} records of <b>The Cost of Complexity</b> are filed by subject in ${num(F.boxes)} boxes. A question can be chosen, or a box opened.`;
      else {
        const P = F.parts[s.part], G = P.groups[s.group];
        const hits = s.hit.filter(h => h.length).length, seedP = F.parts.map((_, p) => recs.reduce((a, r) => a + (r.place[fi].part === p ? s.seed[r.i] : 0), 0)), sp0 = seedP.indexOf(Math.max(...seedP));
        const far = s.reached.find(i => s.order.some(o => o.i === i)), reach = far != null ? far : s.reached[0];
        if (beat === 1) t = `${Num(hits)} records share a word with the question. The more words a record shares, the more weight it starts with.`;
        else if (beat === 2) t = reach != null ? `${rec_(reach).replace('the', 'The')} gains weight, although none of its words matched.` : `The weight moves along the links, away from the records that only matched a word.`;
        else if (beat === 3) t = (refiled ? `Filed by ${by}, the same weight sits in other boxes. ` : '') + (sp0 !== s.part ? `The ${em(P.name)} box ${refiled ? '' : 'now '}holds ${pc(s.top.P[s.part])} of the weight, although the ${F.parts[sp0].name} box started with more of it.` : `The ${em(P.name)} box holds ${pc(s.top.P[s.part])} of the weight. Nothing inside it has been opened yet.`);
        else if (beat === 4) t = `Inside the ${P.name} box the weight spreads again, and the ${em(G.name)} group collects ${pc(s.mid.G[s.part][s.group])} of it.`;
        else if (beat === 5) t = `The answer is ${rec_(s.answer)}, the heaviest in the group. The search opened ${num(s.opened)} of the ${num(F.boxes)} boxes to reach it.` + (fi && search(s.q, 0).answer === s.answer ? ` Filed by subject, the records lead to the same answer.` : ``);
        else if (beat === 6) t = `The records that carry the weight hang from the answer, each from the record it is linked to.`;
        else t = `Straightened, the tree becomes a reading order: the answer first, then the records linked to it, heaviest first.`;
      }
      if (sayEl.dataset.t === t) return;
      sayEl.dataset.t = t; sayEl.classList.add('qd-out');
      setTimeout(() => { if (sayEl.dataset.t === t) { sayEl.innerHTML = t; sayEl.classList.remove('qd-out'); } }, MO.off ? 0 : 160);
      svg.setAttribute('aria-label', t.replace(/<[^>]+>/g, ''));
    }
    function chips() {
      const marked = q => q.split(/(\s+|-)/).map(w => { const c = words(w)[0]; return c && cur && cur.matched.includes(c) ? `<mark>${esc(w)}</mark>` : esc(w); }).join('');
      qBtns.forEach((b, k) => {
        const on = k === qi && beat > 0, q = QUESTIONS[k]; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', q.ask);
        b.innerHTML = narrow ? esc(q.short) : on && cur ? marked(q.ask) : esc(q.ask);
      });
      fBtns.forEach((b, k) => b.setAttribute('aria-pressed', k === fi ? 'true' : 'false'));
      const show = narrow && qi >= 0 && beat > 0 && !(tiny && beat >= 6);        // in a narrow host the chips are short, so the question is written out below them
      if (show) asked.innerHTML = marked(QUESTIONS[qi].ask);
      if (asked.hidden === show) asked.hidden = !show;
      root.classList.toggle('qd-reading', beat === 7);
      R.forEach(o => { if (o.pg) o.pg.setAttribute('tabindex', beat === 7 && o.ord >= 0 ? 0 : -1); });
    }

    /* ------------------------------------------------ moving between beats ---- */
    function go(b, replay) {
      if (b > 0 && !cur) { qi = 0; cur = search(QUESTIONS[0], fi); }
      beat = b; note = ''; byHand = false; if (b !== 3) refiled = false;
      if (b === 0) view = { part: -1, group: -1 };
      if (b >= 1 && b <= 3 && (playing || replay)) view = { part: -1, group: -1 };
      if (b === 4) view = { part: cur.part, group: -1 };
      if (b >= 5 && b <= 6) view = { part: cur.part, group: cur.group };
      if (b === 2) { round = 0; aim(); [1, 2, 3, 4].forEach(k => later(60 + (k - 1) * 660, () => { if (beat !== 2) return; round = k; emit(cur.flows[k - 1]); aim(); })); }
      else if (b === 4) { pround = 0; aim(); [1, 2, 3].forEach(k => later(900 + (k - 1) * 620, () => { if (beat !== 4) return; pround = k; emit(cur.pflows[k - 1]); aim(); })); }
      else if (b === 1 && !MO.off) { landed = false; aim(); rain(qi); later(560, () => { if (beat === 1) { landed = true; aim(); } }); }
      else { round = 4; pround = 3; landed = true; aim(); }
      say(); chips(); tell();
      if (playing && b < 7) later(HOLD[b], () => go(b + 1)); else if (b === 7) playing = false;
    }
    function play(k) {                                   // a question is asked: the whole search, from the top
      cancel(); qi = k; cur = search(QUESTIONS[k], fi); playing = true; view = { part: -1, group: -1 };
      R.forEach(o => o.lift.to(0)); go(1, true);
    }
    function refile(k, keep) {                            // the same records, in the other set of boxes
      fi = k; parts = files[k].parts; view = { part: -1, group: -1 }; note = ''; byHand = false;
      if (cur) cur = search(cur.q, fi);
      if (!keep) { if (beat >= 4) beat = 3; refiled = beat === 3; round = 4; pround = 3; landed = true; aim(); say(); chips(); tell(); }
    }
    function refileNow(k) {                              // by the reader, at any moment: a search that was playing goes on in the new boxes
      const was = playing; cancel(); playing = false; refile(k);
      if (was && beat > 0 && beat < 7) { playing = true; later(2600, () => go(beat + 1)); }
    }
    function step(i) {                                   // the seven steps, for whoever holds the step buttons
      acted = true; cancel(); playing = false; i = clamp(Math.round(i), 0, 6);
      if (i < 2 && fi !== i) refile(i, true);
      const b = BEAT_OF_STEP[i]; go(b, true);
      if (b === 4) later(2700, () => beat === 4 && go(5)); else if (b === 6) later(3000, () => beat === 6 && go(7));
    }
    function manual(p, g) {                              // the reader opens or closes a box by hand
      acted = true; cancel(); playing = false;
      if (beat >= 4) beat = cur ? 3 : 0;
      if (g < 0) view = view.part === p ? { part: -1, group: -1 } : { part: p, group: -1 };
      else view = view.part === p && view.group === g ? { part: p, group: -1 } : { part: p, group: g };
      const P = parts[p], G = view.group >= 0 ? P.groups[view.group] : null, live = cur && beat > 0;
      byHand = view.part >= 0; refiled = false;
      note = view.part < 0 ? '' : live ? (G ? `The ${em(G.name)} group of the ${P.name} box holds ${pc(boxShare(p, view.group))} of the weight for this question.` : `The ${em(P.name)} box holds ${pc(boxShare(p, -1))} of the weight for this question.`)
        : (G ? `The ${em(G.name)} group holds ${num(G.n)} record${G.n > 1 ? 's' : ''} of the ${P.name} box. Each line is a link to another record.` : `The ${em(P.name)} box holds ${num(P.n)} records in ${num(P.groups.length)} groups.`);
      round = 4; pround = 3; landed = true; aim(); say(); chips(); tell();
    }
    function tell() {                                    // let whoever draws the step buttons follow what the exhibit is doing
      const i = byHand ? -1 : beat === 0 ? fi : STEP_OF_BEAT[beat];
      if (opts && typeof opts.onStep === 'function') { try { opts.onStep(i); } catch (e) {} }
      el.dispatchEvent(new CustomEvent('eg-step', { bubbles: true, detail: { node: 'search', i, beat, question: qi, filing: FILINGS[fi].id } }));
    }
    function hover(o, on) {
      o.hot.to(on ? 1 : 0); wake();
      if (!on || o.op > .6 || o.lift.v > .5) { tip.classList.remove('qd-on'); return; }      // a record already spelled out needs no label
      const at = o.r.place[fi], P = FILINGS[fi].parts[at.part];
      tip.innerHTML = `<b>${esc(o.r.label)}</b><span>${KIND[o.r.kind]} · ${esc(P.name)} › ${esc(P.groups[at.group].name)}</span><span>${esc(o.r.text)}.${o.r.page ? ' Page ' + o.r.page + ' of the paper.' : ''}</span>`;
      const x = clamp(o.x + 16, 6, W - 236), y = o.y + 16 > Hh - 96 ? o.y - 92 : o.y + 16;
      tip.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`; tip.classList.add('qd-on');
    }

    const qBtns = QUESTIONS.map((q, k) => { const b = H('button', 'qd-q'); b.type = 'button'; b.addEventListener('click', () => { acted = true; play(k); }); askBar.appendChild(b); return b; });
    const fBtns = FILINGS.map((F, k) => { const b = H('button', 'qd-q qd-f'); b.type = 'button'; b.textContent = F.id; b.addEventListener('click', () => { acted = true; if (k !== fi) refileNow(k); }); fileBar.appendChild(b); return b; });

    /* ------------------------------------------------ start ---- */
    function settle() { measure(); aim(); if (first) { all.forEach(s => s.snap(s.g)); first = false; } place(); draw(performance.now()); wake(); }
    const ro = new ResizeObserver(() => { const b = stage.getBoundingClientRect(); if (Math.abs(b.width - W) > .5 || Math.abs(b.height - Hh) > .5 || first) settle(); });
    ro.observe(stage);
    const io = new IntersectionObserver(es => {
      visible = es[0].isIntersecting; if (visible) wake();
      if (es[0].intersectionRatio > .6 && !acted && beat === 0 && !playing && !io.done) { io.done = true; later(1300, () => { if (!acted && beat === 0) play(0); }); }
    }, { threshold: [0, .6] });
    io.observe(stage);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!destroyed) { measure(); aim(); } });
    say(); chips(); settle();

    let probe = null;
    const handle = {
      probe(on) { const p = probe; probe = on ? { n: 0, t: 0, step: 0, jerk: 0, dtMax: 0, who: '', beat: 0 } : null; R.forEach(o => { o.px = null; o.pd = 0; }); return p; },
      step, ask: k => { acted = true; play(clamp(k, 0, QUESTIONS.length - 1)); },
      file: k => { acted = true; k = clamp(k, 0, 1); if (k !== fi) refileNow(k); },
      get state() { return { beat, step: byHand ? -1 : beat === 0 ? fi : STEP_OF_BEAT[beat], question: qi, filing: FILINGS[fi].id, view, W, H: Hh, say: sayEl.dataset.t }; },
      snapshot() { return { recs: R.map(o => [o.x, o.y]), halos: R.map(o => +o.w.g.toFixed(4)), links: L.map(o => { const d = o.el.getAttribute('d') || ''; const m = d.match(/^M([-\d.]+) ([-\d.]+)Q[-\d. ]+ ([-\d.]+) ([-\d.]+)$/); return m ? [+m[1], +m[2], +m[3], +m[4], o.l.a, o.l.b] : null; }), boxes: parts.map(P => [P.rect.x, P.rect.y, P.rect.w, P.rect.h]) }; },
      destroy() { destroyed = true; cancel(); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); root.remove(); }
    };
    el.__qd = handle;
    return handle;
  }

  /* Words at two levels where the host has the level switch (eigenengine/projection/level.js); otherwise the plain one. */
  const two = (plain, expert) => window.EigenLevel && window.EigenLevel.two ? window.EigenLevel.two(plain, expert) : plain;
  const STEPS = [
    { label: 'The object', caption: 'Thirty-nine records of <i>The Cost of Complexity</i> sit in conceptrics, drawn as boxes within boxes and joined by their links. They are filed here by subject, which suits questions about one subject and few others.' },
    { label: 'Refile', caption: 'Filed by kind, the same records fall into other boxes: Figure 1 and Figure 6, which sat under Registers and Word frequency, now share the Figures box. Neither filing is the object, so the search cannot be a walk down either tree.' },
    { label: 'Ask', caption: two('A question places weight on the records that share its words. A search that only matched words would stop here.',
      'A question places a starting weight \\(s_i \\propto m_i^2\\) on each record, where \\(m_i\\) is the number of its words that record \\(i\\) shares, and \\(\\sum_i s_i = 1\\). A search that only matched words would stop here.') },
    { label: 'Spread', caption: two('The weight spreads along the links, and furthest along the kinds of link this question follows. A record whose own words never matched can end up carrying it.',
      'Each round takes \\(x \\mapsto (1-\\beta)\\,\\tfrac12\\,(x + P_q x) + \\beta s\\) with \\(\\beta = 0.2\\): a record keeps half its weight and passes half along its links, in proportion to the rate the question \\(q\\) gives each kind of link. Four rounds run over the whole object, and the total stays one.') },
    { label: 'Report', caption: two('Each box adds up the weight of what it holds, so a whole box can be judged before it is opened. The boxes grow and shrink with their share.',
      'A box \\(B\\) reports \\(w_B = \\sum_{i \\in B} x_i\\), which is its share because the weights sum to one. The boxes grow and shrink with \\(w_B\\).') },
    { label: 'Open', caption: two('The heaviest box opens, and the weight spreads and is counted again inside it. The answer is the heaviest record in the last box opened.',
      'The search enters \\(B^\\ast = \\arg\\max_B w_B\\) and runs three more rounds restricted to \\(B^\\ast\\), restarted from the weight it held. Its heaviest group is opened, and the answer is \\(\\arg\\max_i x_i\\) there.') },
    { label: 'Read', caption: 'The records that carry the weight are drawn out and hung from the answer by their links. Straightened, that tree is a reading order for this question.' }
  ];

  /* ------------------------------------------------------------------ 5. the second exhibit: one question, two filings ---- */
  /* Sixteen records, each with three labels: its paper, its kind, its topic. Filed as a tree, they must be filed
     in some order of those labels. The exhibit files them two ways and counts, for two questions, how many
     branches a search has to look at before the labels it asks about have all been met. Nothing is pre-set:
     the trees are built from the records and the looks are counted by walking them. */
  function mountOrders(el) {
    el.classList.add('egn-search');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (el.clientHeight < 80) el.style.height = 'min(620px, 82vh)';
    const TYPES = [['Cost', 'claim', 'rank', 2], ['Cost', 'figure', 'rank', 1], ['Cost', 'source', 'rank', 1], ['Cost', 'claim', 'heat', 2], ['Cost', 'figure', 'heat', 1], ['Cost', 'source', 'heat', 1],
      ['Phases', 'claim', 'depth', 1], ['Phases', 'figure', 'depth', 2], ['Phases', 'source', 'depth', 1], ['Phases', 'claim', 'rank', 1], ['Phases', 'figure', 'rank', 2], ['Phases', 'source', 'rank', 1]];
    const TOTAL = TYPES.reduce((s, t) => s + t[3], 0), FIELD = ['paper', 'kind', 'topic'];
    const FILE = [{ order: [0, 1, 2], label: 'paper, then kind, then topic', short: 'Paper first' }, { order: [1, 2, 0], label: 'kind, then topic, then paper', short: 'Kind first' }];
    const ASK = [{ label: 'Which figures are about rank?', short: 'Figures about rank', test: { 1: 'figure', 2: 'rank' } }, { label: 'What is in The Phases of Hierarchy?', short: 'All of Phases', test: { 0: 'Phases' } }];
    const trees = FILE.map(f => {
      const root = { depth: 0, kids: [], leaves: [] }, nodes = [root];
      TYPES.forEach((t, ti) => { let n = root; n.leaves.push(ti); f.order.forEach((fi, d) => { let c = n.kids.find(k => k.val === t[fi]); if (!c) { c = { depth: d + 1, val: t[fi], field: fi, kids: [], leaves: [], parent: n }; n.kids.push(c); nodes.push(c); } c.leaves.push(ti); n = c; }); });
      const order = []; (function walk(n) { if (n.depth === 3) order.push(n.leaves[0]); n.kids.forEach(walk); })(root);
      return { f, root, nodes, order };
    });
    function visit(tree, test) {                          // look at every branch until the last label asked about
      const last = Math.max(...tree.f.order.map((fi, d) => fi in test ? d : -1)), levels = []; let live = [tree.root];
      for (let d = 0; d <= last; d++) { const ex = [], next = []; live.forEach(n => n.kids.forEach(c => { const ok = !(c.field in test) || test[c.field] === c.val; ex.push({ n: c, ok }); if (ok) next.push(c); })); levels.push(ex); live = next; }
      return { levels, live, looks: levels.reduce((s, l) => s + l.length, 0), hits: live.reduce((s, n) => s + n.leaves.reduce((a, ti) => a + TYPES[ti][3], 0), 0) };
    }

    const root = H('div', 'qd qo',
      '<div class="qd-ask qo-bar"><div role="group" aria-label="How the records are filed"><span class="qd-lab">File by</span><span class="qo-file"></span></div><div role="group" aria-label="Example questions"><span class="qd-lab">Ask</span><span class="qo-askb"></span></div></div>' +
      '<div class="qd-stage"><svg class="qd-svg" role="img"></svg><table class="qo-tab" aria-label="Looks needed, by filing and question"></table></div>' +
      '<div class="qd-foot"><p class="qd-say" aria-live="polite"></p></div>');
    el.appendChild(root);
    const stage = root.querySelector('.qd-stage'), svg = root.querySelector('svg'), sayEl = root.querySelector('.qd-say'), tab = root.querySelector('.qo-tab');
    const gE = S('g', svg), gN = S('g', svg), gL = S('g', svg), gT = S('g', svg);
    const all = [], mk = (v, k, c) => { const s = sp(v, k, c); all.push(s); return s; };
    let W = 0, Hh = 0, fi = 0, qi = -1, res = null, raf = 0, last = 0, destroyed = false, first = true, visible = true, acted = false;
    const seen = {}; const timers = new Set();
    const later = (ms, fn) => { const id = setTimeout(() => { timers.delete(id); if (!destroyed) fn(); }, ms); timers.add(id); };
    const cancel = () => { timers.forEach(clearTimeout); timers.clear(); };
    const leaves = TYPES.map((t, ti) => {
      const g = S('g', gL, { class: 'qd-rec qd-k-' + (t[1] === 'figure' ? 'figure' : t[1]) }), o = { t, ti, x: mk(0), hit: mk(0), dim: mk(0), g };
      o.halo = S('circle', g, { class: 'qo-hit', r: 17 }); o.gl = glyph(t[1], g);
      for (let k = 0; k < t[3]; k++) S('circle', g, { class: 'qo-pip', cx: (k - (t[3] - 1) / 2) * 7, cy: 15, r: 2.2 });
      o.l1 = S('text', g, { class: 'qo-leaf', 'text-anchor': 'middle', y: 34 }); o.l2 = S('text', g, { class: 'qo-leaf qo-leaf2', 'text-anchor': 'middle', y: 49 });
      return o;
    });
    trees.forEach((T, k) => {
      T.vis = mk(k ? 0 : 1);
      T.nodes.forEach(n => {
        n.lit = mk(0); n.dim = mk(0); n.x = 0; n.y = 0;
        if (n.parent) { n.edge = S('path', gE, { class: 'qo-edge' }); n.gold = S('path', gE, { class: 'qo-edge qo-gold' }); }
        if (n.depth < 3) { n.el = S('g', gN, { class: 'qo-node' }); S('circle', n.el, { r: n.depth ? 6 : 8 }); n.tx = S('text', n.el, { 'text-anchor': 'middle', y: -12 }); n.tx.textContent = n.depth ? n.val : 'all sixteen'; }
      });
    });
    const big = S('text', gT, { class: 'qo-big', x: 18, y: 44 }), small = S('text', gT, { class: 'qo-small', x: 18, y: 64 }), count = mk(0, 90, 20);

    const fileB = FILE.map((f, k) => { const b = H('button', 'qd-q'); b.type = 'button'; b.textContent = f.label; b.addEventListener('click', () => { acted = true; setFile(k); }); root.querySelector('.qo-file').appendChild(b); return b; });
    const askB = ASK.map((a, k) => { const b = H('button', 'qd-q'); b.type = 'button'; b.textContent = a.label; b.addEventListener('click', () => { acted = true; ask(k); }); root.querySelector('.qo-askb').appendChild(b); return b; });

    function table() {
      tab.innerHTML = '<tr><th></th>' + ASK.map((a, q) => `<th class="${q === qi ? 'on' : ''}">${a.short}</th>`).join('') + '</tr>' +
        FILE.map((f, k) => `<tr><th class="${k === fi ? 'on' : ''}">${f.short}</th>` + ASK.map((a, q) => { const v = seen[k + '-' + q], other = seen[(1 - k) + '-' + q]; return `<td class="${k === fi && q === qi ? 'on' : ''}${v != null && other != null && v < other ? ' best' : ''}">${v != null ? v : '·'}</td>`; }).join('') + '</tr>').join('');
    }
    function say() {
      let t;
      if (qi < 0) t = `Sixteen records each carry a paper, a kind and a topic. Filed by ${FILE[fi].label}, they form the tree shown. Choose a question.`;
      else { const o = visit(trees[1 - fi], ASK[qi].test).looks; t = `With the records filed by ${FILE[fi].label}, this question takes <b>${num(res.looks)} looks</b> to reach ${num(res.hits)} of the ${num(TOTAL)} records.` + (o === res.looks ? '' : ` Filed the other way it takes ${num(o)}.`); }
      sayEl.innerHTML = t; svg.setAttribute('aria-label', t.replace(/<[^>]+>/g, ''));
      fileB.forEach((b, k) => b.setAttribute('aria-pressed', k === fi ? 'true' : 'false')); askB.forEach((b, k) => b.setAttribute('aria-pressed', k === qi ? 'true' : 'false'));
      table();
    }
    function aim() {
      const T = trees[fi], m = W < 560 ? 16 : 46, slot = (W - 2 * m) / TYPES.length;
      T.order.forEach((ti, k) => leaves[ti].x.to(m + slot * (k + .5)));
      trees.forEach((t, k) => t.vis.to(k === fi ? 1 : 0));
      leaves.forEach(o => { o.l1.textContent = o.t[T.f.order[2]]; });
      wake();
    }
    function clear() { trees.forEach(T => T.nodes.forEach(n => { n.lit.to(0); n.dim.to(0); })); leaves.forEach(o => { o.hit.to(0); o.dim.to(0); }); }
    function run() {                                       // show the search level by level, counting as it goes
      cancel(); clear(); count.to(0);
      if (qi < 0) { res = null; say(); wake(); return; }
      const T = trees[fi]; res = visit(T, ASK[qi].test); seen[fi + '-' + qi] = res.looks; say();
      let sum = 0;
      res.levels.forEach((lv, d) => later(500 + d * 1000, () => {
        sum += lv.length; count.to(sum);
        lv.forEach(e => { e.n.lit.to(1); if (!e.ok) later(520, () => { e.n.lit.to(0); (function dim(n) { n.dim.to(1); n.kids.forEach(dim); if (n.depth === 3) leaves[n.leaves[0]].dim.to(1); })(e.n); wake(); }); });
        wake();
      }));
      later(500 + res.levels.length * 1000, () => { res.live.forEach(n => (function take(c) { c.lit.to(1); c.kids.forEach(take); if (c.depth === 3) leaves[c.leaves[0]].hit.to(1); })(n)); wake(); });
      wake();
    }
    function setFile(k) { fi = k; aim(); run(); }
    function ask(k) { qi = k; run(); }

    function frame(now) {
      raf = 0; if (destroyed) return;
      const dt = Math.min(.1, Math.max(.001, (now - last) / 1000)); last = now;
      let moving = false; const sub = Math.max(1, Math.ceil(dt / .009));
      for (let k = 0; k < sub; k++) { moving = false; for (const s of all) if (s.step(dt / sub)) moving = true; }
      draw(); if (moving && visible) raf = requestAnimationFrame(frame);
    }
    function wake() { if (!raf && !destroyed) { last = performance.now() - 16; raf = requestAnimationFrame(frame); } }
    function draw() {
      const yL = Hh - 78, ys = [56, 56 + (yL - 56) * .36, 56 + (yL - 56) * .7, yL], f2 = v => v.toFixed(2);
      leaves.forEach(o => {
        o.g.setAttribute('transform', `translate(${f2(o.x.v)} ${f2(yL)})`); o.g.style.opacity = f2(1 - .68 * o.dim.v);
        o.halo.style.opacity = f2(o.hit.v); o.l1.style.opacity = o.l2.style.opacity = W < 560 ? 0 : 1;
      });
      trees.forEach(T => {
        const v = T.vis.v;
        T.nodes.forEach(n => { if (n.depth === 3) { n.x = leaves[n.leaves[0]].x.v; n.y = yL - 12; } });
        [2, 1, 0].forEach(d => T.nodes.forEach(n => { if (n.depth === d) { n.x = n.kids.reduce((s, c) => s + c.x, 0) / n.kids.length; n.y = ys[d]; } }));
        T.nodes.forEach(n => {
          if (n.el) { n.el.setAttribute('transform', `translate(${f2(n.x)} ${f2(n.y)})`); n.el.style.opacity = f2(v * (1 - .7 * n.dim.v)); n.el.classList.toggle('qo-lit', n.lit.v > .5); n.tx.style.opacity = W < 560 && n.depth === 2 && T.nodes.length > 18 ? 0 : 1; }
          if (n.parent) {
            const p = n.parent, y1 = p.y + (p.depth ? 6 : 8), my = (y1 + n.y) / 2, d = `M${f2(p.x)} ${f2(y1)}C${f2(p.x)} ${f2(my)} ${f2(n.x)} ${f2(my)} ${f2(n.x)} ${f2(n.y - (n.depth < 3 ? 6 : 0))}`;
            n.edge.setAttribute('d', d); n.gold.setAttribute('d', d);
            n.edge.style.opacity = f2(v * .62 * (1 - .7 * n.dim.v)); n.gold.style.opacity = f2(v * n.lit.v);
          }
        });
      });
      const c = Math.round(count.v); if (big.__c !== c) { big.__c = c; big.textContent = c === 1 ? '1 look' : c + ' looks'; }
      big.style.opacity = qi < 0 ? 0 : 1; small.style.opacity = qi < 0 ? 0 : 1;
      if (res && small.__t !== res.hits) { small.__t = res.hits; small.textContent = `${res.hits} of ${TOTAL} records answer it`; }
    }
    function settle() { const b = stage.getBoundingClientRect(); W = Math.max(260, b.width); Hh = Math.max(240, b.height); svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); aim(); if (first) { all.forEach(s => s.snap(s.g)); first = false; } draw(); wake(); }
    const ro = new ResizeObserver(() => { const b = stage.getBoundingClientRect(); if (first || Math.abs(b.width - W) > .5 || Math.abs(b.height - Hh) > .5) settle(); }); ro.observe(stage);
    const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) wake(); if (es[0].intersectionRatio > .6 && !acted && qi < 0 && !io.done) { io.done = true; later(1200, () => { if (!acted) ask(0); }); } }, { threshold: [0, .6] }); io.observe(stage);
    say(); settle();
    const handle = { ask, file: setFile, get state() { return { file: fi, question: qi, looks: res && res.looks, seen }; }, destroy() { destroyed = true; cancel(); cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); root.remove(); } };
    el.__qo = handle; return handle;
  }
  const SECTIONS = [{ title: 'Why one tree will not do', caption: 'A tree must put one label first. Filed kind first, the question about one paper must look at every branch, twenty-four in all.', mount: mountOrders }];

  /* ------------------------------------------------------------------ 6. the node ---- */
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.search = {
    title: 'Navigating conceptrics',
    question: 'How do you search it?',
    line: 'A question spreads its weight along the links, and the search opens only what is heaviest.',
    text: two('A tree built for one question is the wrong tree for the next. Which should a search descend? In <i>query diffusion</i> the question chooses: it places weight on the records it matches, and the weight spreads along their links to records whose words never matched. Each conceptric reports its total before it is opened, so only the heaviest is opened, and the records collected come back as a reading order.',
      'A filing is one tree over the records, and a tree built for one question is the wrong tree for the next. In <i>query diffusion</i> a question \\(q\\) seeds a weight \\(s\\) on the records it matches, and each round takes \\(x \\mapsto (1-\\beta)\\,\\tfrac12\\,(x + P_q x) + \\beta s\\), where \\(P_q\\) passes weight along the links at rates set by \\(q\\). A conceptric \\(B\\) reports \\(\\sum_{i \\in B} x_i\\); the heaviest is opened, and the rounds repeat inside it.'),
    out: [{ href: '/eigenengine/query-diffusion/#one-tree', label: 'Why one tree will not do →' }],
    art,
    exhibit: { steps: STEPS, mount },
    sections: typeof SECTIONS !== 'undefined' ? SECTIONS : []
  };
})();
