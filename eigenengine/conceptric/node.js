/* "What is a conceptric?": the node's card art, words and live exhibit (see dispatch/CONTRACT.md).
   Nothing here is placed by hand. Each arrangement is computed from the typed relations between nine real records
   of The Cost of Complexity; each split is computed from the Hilbert order the paper itself uses. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const { Spring, smooth, clamp, M } = window.EigenMotion;
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const h = (tag, cls, parent, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; };
  const f1 = n => n.toFixed(1);
  const rr = (x, y, w, hh, r) => { r = Math.max(0, Math.min(r, w / 2, hh / 2)); return `M${f1(x + r)} ${f1(y)}H${f1(x + w - r)}Q${f1(x + w)} ${f1(y)} ${f1(x + w)} ${f1(y + r)}V${f1(y + hh - r)}Q${f1(x + w)} ${f1(y + hh)} ${f1(x + w - r)} ${f1(y + hh)}H${f1(x + r)}Q${f1(x)} ${f1(y + hh)} ${f1(x)} ${f1(y + hh - r)}V${f1(y + r)}Q${f1(x)} ${f1(y)} ${f1(x + r)} ${f1(y)}Z`; };

  /* ───────────────────────── the card art ─────────────────────────
     An endless descent. Every envelope holds four; a light runs along the thread that joins them, the last one opens,
     and the view passes inside to find four more. Each level is the level above scaled by k about one fixed point,
     so the loop closes on itself exactly. */
  function art(svg) {
    svg.classList.add('cq-art');
    const k = .36, HH = .72, off = [.55, .065];                    // a child is its parent scaled by k, placed at off
    const F = [off[0] / (1 - k), off[1] / (1 - k)];                // the point the descent closes on
    const slots = [[.09, .065], [.09, .396], [.55, .396], [.55, .065]];   // the chosen child is the last
    const cen = p => [p[0] + k * .5, p[1] + k * HH * .5];
    const G = [[.5, HH * .5], ...slots.map(cen)];                  // the thread: centre, then the four children in turn
    const seg = G.slice(1).map((p, i) => Math.hypot(p[0] - G[i][0], p[1] - G[i][1]));
    const total = seg.reduce((a, b) => a + b, 0);
    const onThread = w => { let d = clamp(w) * total; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const u = Math.min(1, d / seg[i]); return [G[i][0] + (G[i + 1][0] - G[i][0]) * u, G[i][1] + (G[i + 1][1] - G[i][1]) * u]; } d -= seg[i]; } };
    const FS = [276, 84], W0 = 214, period = 6.8, LEV = 6;
    const g = mk('g', {}, svg);
    const lev = Array.from({ length: LEV }, () => ({ body: mk('path', { class: 'cq-art-body' }, g), sib: mk('path', { class: 'cq-art-sib' }, g), flap: mk('path', { class: 'cq-art-flap' }, g), thread: mk('path', { class: 'cq-art-thread' }, g) }));
    const wakeA = mk('path', { class: 'cq-art-wake' }, g), wakeB = mk('path', { class: 'cq-art-wake cq-art-wake-b' }, g), tip = mk('circle', { class: 'cq-art-tip', r: 3.6 }, g);
    const zoom = w => .25 * w + .75 * smooth(clamp((w - .35) / .65));
    const env = (x, y, s, open) => {                               // one envelope: its body and its flap, shut or lifted
      const hh = s * HH, r = s * .055, apex = y + hh * (.44 - .78 * open);
      return [rr(x, y, s, hh, r), `M${f1(x + r * .6)} ${f1(y + r * .25)}L${f1(x + s / 2)} ${f1(apex)}L${f1(x + s - r * .6)} ${f1(y + r * .25)}`];
    };
    function tick(t) {
      if (M.off) t = 2.1;
      const u = t / period, w = u - Math.floor(u), z = zoom(w);
      const sc = j => W0 * Math.pow(k, j - z), at = (j, p) => { const s = sc(j); return [FS[0] + s * (p[0] - F[0]), FS[1] + s * (p[1] - F[1])]; };
      for (let i = 0; i < LEV; i++) {
        const j = i - 1, s = sc(j), L = lev[i], o = at(j, [0, 0]);
        const alpha = smooth(clamp((s - 9) / 26)) * (1 - smooth(clamp((s - 520) / 520)));
        const open = j <= 0 ? 1 : j === 1 ? smooth(clamp((z - .28) / .5)) : 0;
        const [body, flap] = env(o[0], o[1], s, open), sw = clamp(s / 120, .7, 2.3).toFixed(2);
        L.body.setAttribute('d', body); L.flap.setAttribute('d', flap);
        let sd = '';
        for (let c = 0; c < 3; c++) { const p = at(j, slots[c]), e = env(p[0], p[1], s * k, 0); sd += e[0] + e[1]; }
        L.sib.setAttribute('d', sd);
        L.thread.setAttribute('d', 'M' + G.map(p => at(j, p).map(f1).join(' ')).join('L'));
        for (const key in L) { L[key].style.opacity = (alpha * (key === 'thread' ? .5 : key === 'sib' ? .8 : 1)).toFixed(3); L[key].style.strokeWidth = sw; }
      }
      const pt = v => { const b = Math.floor(v), p = onThread(v - b); return at(b - Math.floor(u), p); };
      const run = n => { let d = ''; for (let i = 0; i <= 22; i++) { const p = pt(u - n * (1 - i / 22)); d += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); } return d; };
      wakeA.setAttribute('d', run(.34)); wakeB.setAttribute('d', run(.12));
      const p = pt(u); tip.setAttribute('cx', f1(p[0])); tip.setAttribute('cy', f1(p[1]));
    }
    tick(0);
    return { tick, destroy() { g.remove(); } };
  }

  /* ───────────────────────── the records ─────────────────────────
     Nine pieces of one result in The Cost of Complexity: the law of word frequencies, what it rests on,
     the calculation and figure that show it, and the sections that hold it. */
  const PDF = '/assets/docs/the-cost-of-complexity.pdf';
  const P = {
    paper:   { kind: 'Project', t: ['The Cost of', 'Complexity'], tone: 'ink', says: 'The research object behind the paper, holding its sections, its calculation and its figures.', inside: '21 pages', more: 'A paper of 21 pages, with the calculation behind its figures.', href: PDF },
    sec3:    { kind: 'Section', t: ['The cost of', 'a word'], tone: 'ink', says: 'The section that prices a word by how common it is.', inside: 'Section III', more: 'Section III, pages 4 to 11.', href: PDF + '#page=4' },
    sec5:    { kind: 'Section', t: ['How words', 'are used'], tone: 'ink', says: 'The section that asks how often each word is used.', inside: 'Section V', more: 'Section V, pages 13 to 15.', href: PDF + '#page=13' },
    logcost: { kind: 'Premise', t: ['Rare words', 'cost more'], tone: 'ink', says: 'The cost of a word grows as the logarithm of its rank.', inside: 'K(r) = log r', more: 'K(r) = log r, where r is the rank of the word.', href: PDF + '#page=9' },
    maxent:  { kind: 'Method', t: ['Least-biased', 'guess'], tone: 'ink', says: 'The guess that assumes nothing about usage beyond its average cost.', inside: 'max entropy', more: 'Maximise the entropy of usage while the mean cost is held fixed.', href: PDF + '#page=13' },
    law:     { kind: 'Claim', t: ['Law of word', 'frequencies'], tone: 'gold', says: 'A few words are used constantly, and most hardly at all.', inside: '', more: 'p(r) ∝ r<sup>−λ</sup>, a power law in the rank r.', href: PDF + '#page=13', face: [['A few words are used', 'constantly, and most', 'hardly at all.'], ['A few words are used constantly,', 'and most hardly at all.']] },
    fig6:    { kind: 'Figure', t: ['Figure 6'], tone: 'teal', says: 'The law drawn for five exponents.', inside: '', more: 'Five curves on logarithmic axes, one to each exponent.', href: PDF + '#page=14' },
    run:     { kind: 'Calculation', t: ['Five hundred', 'ranks'], tone: 'teal', says: 'The calculation that sums the law over five hundred ranks.', inside: 'R = 500', more: 'The law summed directly over R = 500 ranks.' },
    jaynes:  { kind: 'Source', t: ['Jaynes', '1957'], tone: 'blue', says: 'The paper of 1957 that gives the rule for a least-biased guess.', inside: 'Phys. Rev.', more: 'E. T. Jaynes, Physical Review 106, 620 (1957).' },
  };
  const GLYPH = {   // one small drawing to each kind of record
    Project: 'M1 4L6 1.5L11 4L6 6.5ZM1 6.8L6 9.3L11 6.8M1 9.5L6 12L11 9.5', Section: 'M1.5 2.5H10.5M1.5 6H10.5M1.5 9.5H7', Premise: 'M1 10.5H11M3 10.5V6H9V10.5M4.5 6V3H7.5V6',
    Method: 'M2.2 6.6a4 4 0 1 1 1.4 2.6M2 10V6.4H5.6', Claim: 'M6 1L11 6L6 11L1 6Z', Figure: 'M1.5 1.5V10.5H10.5M3.5 3.5L9.5 9', Calculation: 'M1.5 1.5H10.5V10.5H1.5ZM1.5 6H10.5M6 1.5V10.5',
    Source: 'M1.5 2.5C3.5 1.5 5 1.8 6 2.8C7 1.8 8.5 1.5 10.5 2.5V10C8.5 9 7 9.3 6 10.3C5 9.3 3.5 9 1.5 10ZM6 2.8V10.3',
  };
  const ORDER = ['paper', 'sec3', 'logcost', 'sec5', 'maxent', 'law', 'fig6', 'run', 'jaynes'];
  const RELS = [   // [from, to, kind]: "from <kind> to"
    ['sec3', 'paper', 'part'], ['sec5', 'paper', 'part'], ['logcost', 'sec3', 'part'],
    ['maxent', 'sec5', 'part'], ['law', 'sec5', 'part'], ['fig6', 'sec5', 'part'], ['run', 'sec5', 'part'],
    ['law', 'logcost', 'req'], ['law', 'maxent', 'req'], ['maxent', 'jaynes', 'sup'], ['run', 'law', 'req'], ['fig6', 'run', 'comp'], ['law', 'fig6', 'shown'],
  ];
  const RELNAME = { part: 'is part of', req: 'requires', sup: 'supported by', comp: 'computed by', shown: 'shown by' };
  const RESTS = { req: 1, sup: 1, comp: 1 };       // the relations by which one piece rests on another
  const AXES = { part: 'Where does it sit?', rests: 'What does it rest on?', carries: 'What rests on it?' };

  /* An arrangement is a tree read off the relations. Along a relationship each piece hangs below the deepest piece
     it is tied to; lifted by one piece, every other hangs at its distance from that piece. */
  function arrange(axis, lift) {
    const parent = {}, depth = {}, kids = {}; ORDER.forEach(id => kids[id] = []);
    let roots = [], shelf = [];
    if (lift) {
      const adj = {}; ORDER.forEach(id => adj[id] = []);
      RELS.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
      depth[lift] = 0; const q = [lift];
      while (q.length) { const a = q.shift(); adj[a].forEach(b => { if (depth[b] == null) { depth[b] = depth[a] + 1; parent[b] = a; q.push(b); } }); }
      roots = [lift];
    } else {
      const up = {}; ORDER.forEach(id => up[id] = []);          // up[x]: the pieces x may hang below
      RELS.forEach(([a, b, kind]) => {
        if (axis === 'part' && kind === 'part') up[a].push(b);
        if (axis === 'rests' && RESTS[kind]) up[b].push(a);
        if (axis === 'carries' && RESTS[kind]) up[a].push(b);
      });
      const touched = new Set(); ORDER.forEach(id => up[id].forEach(b => { touched.add(id); touched.add(b); }));
      const dep = id => depth[id] != null ? depth[id] : (depth[id] = up[id].length ? 1 + Math.max(...up[id].map(dep)) : 0);
      ORDER.forEach(id => { if (!touched.has(id)) { shelf.push(id); return; } dep(id); if (!up[id].length) roots.push(id); else parent[id] = up[id].reduce((best, b) => dep(b) > dep(best) ? b : best); });
      shelf.forEach(id => { depth[id] = 0; });
    }
    ORDER.forEach(id => { if (parent[id]) kids[parent[id]].push(id); });
    return { parent, depth, kids, roots, shelf };
  }

  /* ───────────────────────── the Hilbert order, for the splitting ───────────────────────── */
  function hilbert(side, rank) {
    let x = 0, y = 0;
    for (let size = 1; size < side; size *= 2) {
      const right = 1 & (rank >> 1), upw = 1 & (rank ^ right);
      if (!upw) { if (right) { x = size - 1 - x; y = size - 1 - y; } [x, y] = [y, x]; }
      x += size * right; y += size * upw; rank >>= 2;
    }
    return [x, side - 1 - y];
  }
  const CELL = Array.from({ length: 64 }, (_, r) => hilbert(8, r));
  const RANKAT = {}; CELL.forEach(([x, y], r) => RANKAT[x + ',' + y] = r);
  const SIZES = [64, 32, 16, 8, 4, 2];
  const present = b => b === 64 ? [] : SIZES.filter(s => { const e = Math.log(64 / s) / Math.log(b); return s < 64 && Math.abs(e - Math.round(e)) < 1e-6; });
  const SPLITS = [   // a choice among b costs b looks; each envelope opened on the way costs its own fixed price
    { b: 64, label: '64', choices: 1, say: 'One choice among sixty-four', as: 'One envelope of sixty-four' },
    { b: 8, label: '8', choices: 2, say: 'Two choices among eight', as: 'Envelopes of eight' },
    { b: 4, label: '4', choices: 3, say: 'Three choices among four', as: 'Envelopes of four' },
    { b: 2, label: '2', choices: 6, say: 'Six choices between two', as: 'Envelopes of two' },
  ];
  const PRICES = [1, 6, 60], NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];
  const looksOf = sp => sp.b * sp.choices, totalOf = (sp, price) => looksOf(sp) + sp.choices * price;
  const cheapest = price => SPLITS.reduce((best, sp) => totalOf(sp, price) < totalOf(best, price) ? sp : best);
  const SEAT = { paper: 2, sec3: 9, logcost: 13, sec5: 22, maxent: 27, law: 37, fig6: 45, run: 50, jaynes: 58 };   // where each record sits among the sixty-four

  /* ───────────────────────── the exhibit ───────────────────────── */
  const STEPS = [
    { label: 'One envelope', caption: 'We place every piece of research in an envelope. The material goes inside, while the outside carries a one-line summary and a named thread to each piece it is related to.' },
    { label: 'Envelopes nest', caption: 'An envelope can hold other envelopes and be held in turn. Each presents the same face when shut and opens in the same way, so that the structure is self-similar at every depth.' },
    { label: 'Ask a different question', caption: 'Nothing in the pieces themselves places the project outermost. Each question follows its own threads, and a piece that sat deep under one question can be the outer envelope under the next.' },
    { label: 'Start from any piece', caption: 'Any piece will serve as the place to start. Whichever one is picked up, the others hang beneath it at their distance along the threads.' },
    { label: 'How far to split', caption: 'Keep sixty-four pieces in one envelope and finding one means looking at them all. Splitting replaces this with a few small choices, but every envelope opened on the way has a cost of its own, and <i>The Cost of Complexity</i> prices the two together.' },
  ];

  function mount(host, opts) {
    const root = h('div', 'cq', host);
    const svg = mk('svg', { class: 'cq-svg', role: 'group', 'aria-label': 'Nine records of The Cost of Complexity, drawn as nested envelopes' }, root);
    const gid = 'cqg' + Math.random().toString(36).slice(2, 8), defs = mk('defs', {}, svg), grad = mk('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    mk('stop', { offset: 0, class: 'cq-g0' }, grad); mk('stop', { offset: 1, class: 'cq-g1' }, grad);
    const L = {}; ['guide', 'hull', 'wall', 'hil', 'link', 'tok', 'card', 'fx', 'lab'].forEach(n => L[n] = mk('g', { class: 'cq-l-' + n }, svg));
    const bar = h('div', 'cq-bar', root), hint = h('p', 'cq-hint', root), read = h('div', 'cq-read', root);
    hint.setAttribute('aria-live', 'polite');
    const legend = h('p', 'cq-legend', root); legend.setAttribute('aria-hidden', 'true');
    legend.innerHTML = '<span>threads</span>' + Object.keys(RELNAME).map(k => `<span><svg viewBox="0 0 26 8"><path class="cq-link cq-r-${k}" d="M1 4H25"/></svg>${RELNAME[k]}</span>`).join('');

    const S = { step: 0, view: 'one', axis: 'part', lift: null, closed: new Set(), sheets: new Set(), reveal: 1, split: 64, price: 1, target: 37, hover: null, focus: 'law',
      W: 0, H: 0, narrow: false, full: false, gen: 0, touched: false, tree: arrange('part'), U: null, g: 1, top: 46, bottom: 34 };

    /* controls */
    const axisBox = h('div', 'cq-group cq-axis', bar); h('span', 'cq-group-label', axisBox, 'Ask');
    const axisBtn = {}; Object.keys(AXES).forEach(a => { const b = axisBtn[a] = h('button', 'cq-btn', axisBox, AXES[a]); b.type = 'button'; b.onclick = () => { S.touched = true; S.lift = null; S.axis = a; S.view = 'hang'; retarget(); pulse(); }; });
    const liftTag = h('span', 'cq-lifted', axisBox);
    const splitBox = h('div', 'cq-group cq-split', bar); h('span', 'cq-group-label', splitBox, 'Envelopes of');
    const splitBtn = {}; SPLITS.forEach(sp => { const b = splitBtn[sp.b] = h('button', 'cq-btn', splitBox, sp.label); b.type = 'button'; b.onclick = () => { S.touched = true; setSplit(sp.b); }; });
    read.innerHTML = '<p class="cq-num"><b data-total>65</b><span>to find one piece</span></p><p class="cq-say" data-say></p><div class="cq-price"><span class="cq-group-label">An envelope costs</span><span data-prices></span></div><div class="cq-chart" aria-hidden="true">' +
      SPLITS.map(sp => `<div class="cq-col" data-col="${sp.b}"><b></b><i class="cq-bar-env"></i><i class="cq-bar-looks"></i><span>${sp.label}</span></div>`).join('') + '</div><p class="cq-key"><i class="cq-key-looks"></i>looks<i class="cq-key-env"></i>envelopes opened</p>';
    const priceBtn = {}; PRICES.forEach(pr => { const b = priceBtn[pr] = h('button', 'cq-btn', read.querySelector('[data-prices]'), pr === 1 ? '1 look' : pr + ' looks'); b.type = 'button'; b.onclick = () => { S.touched = true; S.price = pr; setSplit(cheapest(pr).b); }; });
    const info = h('div', 'cq-info', root); info.setAttribute('aria-live', 'polite');
    const q = sel => read.querySelector(sel);

    /* the nine pieces */
    const pieces = {};
    ORDER.forEach(id => {
      const d = P[id], p = pieces[id] = { id, d };
      p.hull = mk('path', { class: 'cq-hull cq-t-' + d.tone }, L.hull); p.hflap = mk('path', { class: 'cq-hull cq-hflap cq-t-' + d.tone }, L.hull);
      p.g = mk('g', { class: 'cq-piece cq-t-' + d.tone, tabindex: '0', role: 'button', 'data-id': id }, L.card);
      p.hook = mk('path', { class: 'cq-hook' }, p.g);
      p.back = mk('path', { class: 'cq-flap-back' }, p.g);
      p.sheet = mk('g', { class: 'cq-sheet' }, p.g); p.sheetRect = mk('rect', { rx: 3 }, p.sheet);
      p.face = mk('rect', { class: 'cq-face', fill: `url(#${gid})` }, p.g);
      p.seam = mk('path', { class: 'cq-seam' }, p.g); p.front = mk('path', { class: 'cq-flap-front' }, p.g); p.glyph = mk('path', { class: 'cq-glyph', d: GLYPH[d.kind] }, p.g);
      p.kind = mk('text', { class: 'cq-kind' }, p.g); p.kind.textContent = d.kind;
      p.title = mk('text', { class: 'cq-title' }, p.g);
      p.says = mk('text', { class: 'cq-says' }, p.g);
      p.ring = mk('rect', { class: 'cq-ring' }, p.g);
      p.badge = mk('g', { class: 'cq-badge' }, p.g); mk('circle', { r: 9.5 }, p.badge); p.badgeText = mk('text', { y: 4.2 }, p.badge);
      p.sp = {}; p.seq = 0; ['x', 'y', 's', 'bx', 'by', 'bw', 'bh'].forEach(n => p.sp[n] = new Spring(0, 34, 11.7));   // slow enough that a change of depth can be followed by eye
      ['a', 'ha', 'o', 'sh', 'big', 'ring', 'hook', 'txt'].forEach(n => p.sp[n] = new Spring(0, 60, 15.5));
      p.sp.s.snap(1); p.sp.txt.snap(1);
      const act = () => { S.touched = true; clickPiece(id); };
      p.g.addEventListener('click', act);
      p.g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      const on = () => { S.hover = id; hintNow(); infoNow(); linkFocus(); }, offh = () => { if (S.hover === id) { S.hover = null; hintNow(); infoNow(); linkFocus(); } };
      p.g.addEventListener('pointerenter', on); p.g.addEventListener('pointerleave', offh); p.g.addEventListener('focus', on); p.g.addEventListener('blur', offh);
    });
    const links = RELS.map(([a, b, kind], i) => {
      const l = { a, b, kind, i, path: mk('path', { class: 'cq-link cq-r-' + kind, 'data-a': a, 'data-b': b }, L.link), lab: mk('text', { class: 'cq-link-label' }, L.lab), pa: mk('circle', { class: 'cq-port cq-r-' + kind, r: 2.4 }, L.link), pb: mk('circle', { class: 'cq-port cq-r-' + kind, r: 2.4 }, L.link), dot: mk('circle', { class: 'cq-pulse', r: 2.6 }, L.fx), al: new Spring(0), ll: new Spring(0), glow: 0 };
      l.lab.textContent = RELNAME[kind]; return l;
    });
    const guides = Array.from({ length: 6 }, (_, i) => { const gd = { line: mk('path', { class: 'cq-guide' }, L.guide), text: mk('text', { class: 'cq-guide-n' }, L.guide), y: new Spring(0), a: new Spring(0) }; gd.text.textContent = i; return gd; });
    const guideLab = mk('text', { class: 'cq-guide-n cq-guide-word' }, L.guide); guideLab.textContent = 'depth';
    const shelfLab = mk('text', { class: 'cq-shelf-label' }, L.lab); shelfLab.textContent = 'not on these threads';
    const shelfSp = { x: new Spring(0), y: new Spring(0), a: new Spring(0) };
    const trail = mk('path', { class: 'cq-trail' }, L.fx), trailPts = [];

    /* the sixty-four */
    const toks = CELL.map((c, r) => {
      const tone = 'ink', home = ORDER.reduce((best, id) => Math.abs(SEAT[id] - r) < Math.abs(SEAT[best] - r) ? id : best);
      const t = { r, g: mk('g', { class: 'cq-tok cq-t-' + tone, tabindex: '-1', role: 'button', 'aria-label': 'Piece ' + (r + 1) }, L.tok), home, x: new Spring(0, 60, 15.5), y: new Spring(0, 60, 15.5), a: new Spring(0), glow: 0 };
      t.rect = mk('rect', {}, t.g); t.v = mk('path', {}, t.g);
      const act = () => { S.touched = true; S.target = r; paintSplitState(); trace(); };
      t.g.addEventListener('click', act); t.g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      return t;
    });
    const walls = {}; SIZES.forEach(s => { walls[s] = Array.from({ length: 64 / s }, (_, i) => ({ el: mk('path', { class: 'cq-wall' }, L.wall), glow: 0, hold: 0, i })); });
    const pres = {}; SIZES.forEach(s => pres[s] = new Spring(s === 64 ? 1 : 0));
    const wallA = new Spring(0), hil = mk('path', { class: 'cq-hilbert' }, L.hil), hilA = new Spring(0);
    const tracer = mk('g', { class: 'cq-tracer' }, L.fx), tWake = mk('path', {}, tracer), tDot = mk('circle', { r: 4.2 }, tracer);
    const tr = { x: new Spring(0, 520, 42), y: new Spring(0, 520, 42), a: new Spring(0), looks: [], t: -1, count: 0, pts: [] };
    let gridBox = { x: 0, y: 0, t: 15, p: 2.6 };

    /* ── geometry ── */
    function units() {
      if (S.narrow) return { cw: 232, ch: 30, pad: 6, gap: 6, rowgap: 6, indent: 15, wide: true };
      return { cw: 88, ch: 54, pad: 6, gap: 6, rowgap: S.view === 'nest' ? 38 : 13, wide: false };
    }
    function layoutTree(tree, U) {
      const size = {}, pos = {};
      const open = id => !S.closed.has(id) && tree.kids[id].length > 0;
      const measure = id => {
        const kids = open(id) ? tree.kids[id] : [];
        kids.forEach(measure);
        if (U.wide) { const hh = kids.reduce((a, k2) => a + size[k2].h + U.gap, 0); return size[id] = { kids, w: kids.length ? Math.max(U.cw, U.indent + Math.max(...kids.map(k2 => size[k2].w))) + 2 * U.pad : U.cw, h: kids.length ? U.pad + U.ch + U.rowgap + hh - U.gap + U.pad : U.ch }; }
        const inner = kids.reduce((a, k2) => a + size[k2].w + U.gap, -U.gap);
        return size[id] = { kids, inner, w: kids.length ? Math.max(U.cw, inner) + 2 * U.pad : U.cw, h: kids.length ? U.pad + U.ch + U.rowgap + Math.max(...kids.map(k2 => size[k2].h)) + U.pad : U.pad + U.ch };
      };
      const place = (id, x, y, hid) => {
        const s = size[id], kidsOpen = s.kids.length > 0;
        if (U.wide) {
          pos[id] = { x: x + (kidsOpen ? U.pad : 0) + U.cw / 2, y: y + (kidsOpen ? U.pad : 0) + U.ch / 2, bx: x, by: y, bw: s.w, bh: s.h, open: kidsOpen, hid };
          let cy = y + U.pad + U.ch + U.rowgap; s.kids.forEach(k2 => { place(k2, x + U.pad + U.indent, cy, hid); cy += size[k2].h + U.gap; });
        } else {
          pos[id] = { x: x + s.w / 2, y: y + U.pad + U.ch / 2, bx: x, by: y, bw: s.w, bh: s.h, open: kidsOpen, hid };
          let cx = x + (s.w - s.inner) / 2; s.kids.forEach(k2 => { place(k2, cx, y + U.pad + U.ch + U.rowgap, hid); cx += size[k2].w + U.gap; });
        }
        if (!kidsOpen) tree.kids[id].forEach(function fold(k2) { pos[k2] = { x: pos[id].x, y: pos[id].y, bx: pos[id].x - U.cw / 2, by: pos[id].y - U.ch / 2, bw: U.cw, bh: U.ch, open: false, hid: true }; tree.kids[k2].forEach(fold); });
      };
      let x = 0, y = 0, w = 0, hh = 0;
      tree.roots.forEach(id => { measure(id); if (U.wide) { place(id, 0, y, false); y += size[id].h + 2 * U.gap; w = Math.max(w, size[id].w); hh = y - 2 * U.gap; } else { place(id, x, 0, false); x += size[id].w + 2 * U.gap; hh = Math.max(hh, size[id].h); w = x - 2 * U.gap; } });
      let shelf = null;
      if (tree.shelf.length) {
        if (U.wide) { shelf = { x: 0, y: hh + 26 }; tree.shelf.forEach((id, i) => { pos[id] = { x: U.cw / 2, y: shelf.y + i * (U.ch + U.gap) + U.ch / 2, shelf: true }; }); hh = shelf.y + tree.shelf.length * (U.ch + U.gap); w = Math.max(w, U.cw); }
        else if (w > U.cw * 4) { const n = tree.shelf.length, sw2 = n * U.cw + (n - 1) * U.gap; shelf = { x: (w - sw2) / 2, y: hh + 30, under: true }; tree.shelf.forEach((id, i) => { pos[id] = { x: shelf.x + i * (U.cw + U.gap) + U.cw / 2, y: shelf.y + U.ch / 2, shelf: true }; }); hh = shelf.y + U.ch; shelf.x += sw2 / 2 - U.cw / 2; }
        else { shelf = { x: w + 30, y: 16 }; tree.shelf.forEach((id, i) => { pos[id] = { x: shelf.x + U.cw / 2, y: shelf.y + i * (U.ch + U.gap) + U.ch / 2, shelf: true }; }); w = shelf.x + U.cw; hh = Math.max(hh, shelf.y + tree.shelf.length * (U.ch + U.gap)); }
      }
      return { pos, w, h: hh, shelf };
    }

    function tokenGoals() {       // where each of the sixty-four sits for the present split
      const t = gridBox.t, p = gridBox.p, g0 = S.narrow ? 2.4 : 3.2, on = present(S.split);
      const gap = (axis, c) => { let most = 0; for (let o = 0; o < 8; o++) { const a = axis ? RANKAT[o + ',' + c] : RANKAT[c + ',' + o], b = axis ? RANKAT[o + ',' + (c + 1)] : RANKAT[(c + 1) + ',' + o]; most = Math.max(most, on.filter(s => Math.floor(a / s) !== Math.floor(b / s)).length); } return g0 + 2 * p * most; };
      const X = [0], Y = [0]; for (let c = 0; c < 7; c++) { X.push(X[c] + t + gap(0, c)); Y.push(Y[c] + t + gap(1, c)); }
      const outer = p * (on.length + 1) + 3, span = X[7] + t + 2 * outer, spanY = Y[7] + t + 2 * outer;
      return { X, Y, outer, span, spanY };
    }

    /* ── targets: called whenever the state changes, never per frame ── */
    function retarget() {
      let W = S.W; const H = S.H; if (!W || !H) return;
      const U = S.U = units(); S.tree = arrange(S.axis, S.lift);
      const availH = H - S.top - S.bottom, gmax = S.narrow ? 1.25 : S.full ? 1.9 : 1.3, WA = W, showInfo = S.full && S.view !== 'split';
      root.dataset.full = S.full ? '1' : '0'; info.classList.toggle('on', showInfo);
      if (showInfo) W -= 290;                                   // the record in focus is written out beside the stage
      root.dataset.view = S.view; root.dataset.narrow = S.narrow ? '1' : '0';
      Object.keys(axisBtn).forEach(a => axisBtn[a].classList.toggle('on', S.view !== 'one' && S.view !== 'split' && !S.lift && S.axis === a));
      liftTag.textContent = '';
      SPLITS.forEach(sp => splitBtn[sp.b].classList.toggle('on', S.split === sp.b));
      const T = {}, set = (p, o) => Object.assign(T[p.id] = T[p.id] || {}, o);
      if (S.view === 'one') {
        const g = S.g = S.narrow ? 1 : S.full ? 1.5 : 1.1;
        const big = S.narrow ? Math.min(1.7, (W - 30) / U.cw) : clamp(Math.min(W / (U.cw * 3), availH * .5 / (U.ch + 27)), 1.5, 3.2);
        const cx = W / 2, cy = S.top + availH * .52, mx = (S.narrow ? 8 : 14) + U.cw * g / 2, my = U.ch * g / 2 + 8;
        const st = S.narrow ? (U.ch + 8) * g : 0;                 // on a narrow stage the four neighbours are stepped, so each keeps its full width
        const corner = { sec5: [mx, S.top + my], maxent: [W - mx, S.top + my + st], logcost: [mx, H - S.bottom - my - st], fig6: [W - mx, H - S.bottom - my] };
        ORDER.forEach(id => {
          const p = pieces[id], c = corner[id], open = S.sheets.has(id) ? 1 : 0;
          if (id === 'law') set(p, { x: cx, y: cy, s: big, a: 1, o: open, sh: open, big: 1, ha: 0, ring: 0, hook: 0, txt: 1 });
          else if (c) set(p, { x: c[0], y: c[1], s: g, a: 1, o: open, sh: S.narrow ? 0 : open, big: 0, ha: 0, ring: 0, hook: 0, txt: 1 });
          else { const near = id === 'paper' || id === 'sec3' ? corner.sec5 : id === 'run' ? corner.fig6 : corner.maxent; set(p, { x: near[0], y: near[1], s: g * .6, a: 0, o: 0, sh: 0, big: 0, ha: 0, ring: 0, hook: 0, txt: 1 }); }
          const t = T[id], hw = U.cw * t.s / 2, hh = U.ch * t.s / 2; set(p, { bx: t.x - hw, by: t.y - hh, bw: 2 * hw, bh: 2 * hh });
        });
        guides.forEach(gd => gd.a.to(0)); shelfSp.a.to(0);
      } else if (S.view === 'nest' || S.view === 'hang') {
        const lay = layoutTree(S.tree, U), gutter = S.narrow ? 8 : 26, fit = l => Math.min((W - gutter - 14) / l.w, (availH - 10) / l.h, gmax);
        const keep = S.closed; S.closed = new Set();              // one size of card for every arrangement of this view, so that only places change
        const ref = (S.view === 'nest' ? ['part'] : ['part', 'rests', 'carries']).map(a => fit(layoutTree(arrange(a), U))); S.closed = keep;
        const g = S.g = Math.min(fit(lay), Math.min(...ref) * 1.3);
        const ox = gutter + (W - gutter - 8 - lay.w * g) / 2, oy = S.top + Math.max(4, (availH - lay.h * g) / 2 - (S.narrow ? 0 : 4));
        const shown = () => true; S.guideW = W;
        const rows = {};
        ORDER.forEach(id => {
          const p = pieces[id], q2 = lay.pos[id], vis = shown(id) && !q2.hid, leaf = !S.tree.kids[id].length, open = S.sheets.has(id);
          const X = ox + q2.x * g, Y = oy + q2.y * g;
          set(p, { x: X, y: Y, s: g * (q2.hid ? .5 : 1), a: vis ? (q2.shelf ? .5 : 1) : 0, big: 0, txt: 1,
            o: vis && (q2.open || (S.view === 'nest' && open)) ? 1 : 0, sh: vis && S.view === 'nest' && open && leaf && !S.narrow ? 1 : 0,
            ha: vis && q2.open ? 1 : 0, ring: S.view === 'hang' && id === 'fig6' ? 1 : 0, hook: S.lift === id ? 1 : 0 });
          if (q2.shelf || q2.hid || !q2.open) set(p, { bx: X - U.cw * g / 2, by: Y - U.ch * g / 2, bw: U.cw * g, bh: U.ch * g });
          else set(p, { bx: ox + q2.bx * g, by: oy + q2.by * g, bw: q2.bw * g, bh: q2.bh * g });
          if (vis && !q2.shelf) rows[S.tree.depth[id]] = Y;
          p.badgeText.textContent = S.tree.depth[id];
        });
        guides.forEach((gd, i) => { const on = !S.narrow && rows[i] != null; if (on) { if (gd.a.g < .5 && gd.a.v < .05) gd.y.snap(rows[i]); gd.y.to(rows[i]); } gd.a.to(on ? 1 : 0); });
        if (lay.shelf) { const sx = ox + (lay.shelf.x + (U.wide ? 0 : U.cw / 2)) * g, sy = oy + (lay.shelf.y - 9) * g; if (shelfSp.a.g < .5 && shelfSp.a.v < .05) { shelfSp.x.snap(sx); shelfSp.y.snap(sy); } shelfSp.x.to(sx); shelfSp.y.to(sy); shelfSp.a.to(1); } else shelfSp.a.to(0);
      }
      /* the sixty-four */
      W = WA;
      const sideRead = !S.narrow && W >= 560, readW = sideRead ? Math.min(250, W * .36) : 0;
      gridBox.t = S.narrow ? 13 : S.full ? 23 : 15; gridBox.p = S.narrow ? 2.2 : S.full ? 3.6 : 2.6;
      let tg = tokenGoals(); const room = Math.min(W - readW - (sideRead ? 58 : 26), sideRead ? availH - 26 : H - S.top - 178);
      const deepest = (() => { const keep = S.split; S.split = 2; const d = tokenGoals(); S.split = keep; return d.span; })();
      { const f = Math.min(room / deepest, 2.3); gridBox.t *= f; gridBox.p *= f; tg = tokenGoals(); }
      gridBox.x = (W - readW - tg.span) / 2 + tg.outer + gridBox.t / 2; gridBox.y = S.top + ((sideRead ? availH : H - S.top - 170) - tg.spanY) / 2 + tg.outer + gridBox.t / 2;
      const inSplit = S.view === 'split';
      toks.forEach(t => { const [cx, cy] = CELL[t.r]; t.gx = gridBox.x + tg.X[cx]; t.gy = gridBox.y + tg.Y[cy]; if (inSplit) { t.x.to(t.gx); t.y.to(t.gy); } t.a.to(inSplit ? 1 : 0); t.g.setAttribute('tabindex', inSplit ? '0' : '-1'); });
      const on = present(S.split); SIZES.forEach(s => pres[s].to(s === 64 || on.includes(s) ? 1 : 0));
      wallA.to(inSplit ? 1 : 0); hilA.to(inSplit ? 1 : 0);
      if (inSplit) {
        ORDER.forEach(id => { const p = pieces[id], t = toks[SEAT[id]]; set(p, { x: t.gx, y: t.gy, s: gridBox.t / U.cw * 1.15, a: 0, ha: 0, o: 0, sh: 0, big: 0, ring: 0, hook: 0, txt: 0 }); set(p, { bx: t.gx - gridBox.t / 2, by: t.gy - gridBox.t / 2, bw: gridBox.t, bh: gridBox.t }); });
        guides.forEach(gd => gd.a.to(0)); shelfSp.a.to(0);
      } else { tr.a.to(0); tr.t = -1; }
      const GEO = { x: 1, y: 1, s: 1, bx: 1, by: 1, bw: 1, bh: 1 };
      ORDER.forEach(id => {                                      // faces answer at once; places follow from the top of the arrangement down
        const p = pieces[id], t = T[id] || {}, seq = ++p.seq, wait = S.view === 'hang' && !M.off && !S.tree.shelf.includes(id) ? S.tree.depth[id] * 95 : 0;
        const geo = () => { if (p.seq === seq) for (const n in t) if (GEO[n]) p.sp[n].to(t[n]); };
        for (const n in t) if (!GEO[n]) p.sp[n].to(t[n]);
        if (wait) setTimeout(geo, wait); else geo();
      });
      ORDER.forEach(id => { const p = pieces[id], vis = p.sp.a.g > .4; p.g.setAttribute('tabindex', vis && !inSplit ? '0' : '-1'); p.g.style.pointerEvents = vis && !inSplit ? 'auto' : 'none'; p.g.setAttribute('aria-label', `${p.d.kind}: ${p.d.t.join(' ')}. ${p.d.says}`); });
      L.tok.style.pointerEvents = inSplit ? 'auto' : 'none';
      read.classList.toggle('side', sideRead);
      linkFocus(); hintNow(); infoNow(); paintSplitState();
    }
    function linkFocus() {
      const tree = S.tree, seen = id => pieces[id].sp.a.g > .4;
      links.forEach(l => {
        const both = seen(l.a) && seen(l.b), isTree = tree.parent[l.a] === l.b || tree.parent[l.b] === l.a, near = S.hover === l.a || S.hover === l.b;
        const one = S.view === 'one' && (l.a === 'law' || l.b === 'law');
        const aside = tree.shelf.includes(l.a) || tree.shelf.includes(l.b);
        l.al.to(!both || S.view === 'split' ? 0 : near || one ? 1 : S.view === 'one' ? 0 : aside ? (S.view === 'nest' ? .6 : .1) : isTree ? .8 : .36);
        l.ll.to(both && S.view !== 'split' && (one || near) ? 1 : 0);
        l.tree = isTree;
      });
    }
    const name = id => P[id].t.join(' '), list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0];
    function status() {             // what is true of the present arrangement, worked out from it, so that it cannot fall out of step with the controls
      if (S.view === 'one') return 'Press the envelope to open it or shut it.';
      if (S.view === 'nest') return 'Press an envelope to shut it or open it.';
      if (S.view === 'split') return 'Press any piece to look for it.';
      const placed = ORDER.filter(id => !S.tree.shelf.includes(id)), most = Math.max(...placed.map(id => S.tree.depth[id])), deep = placed.filter(id => S.tree.depth[id] === most);
      return `Outermost: ${list(S.tree.roots.map(name))}. Deepest: ${deep.length > 2 ? deep.length + ' pieces' : list(deep.map(name))}, at depth ${most}. Press any piece to start from it.`;
    }
    let hintText = '';
    function hintNow() {
      let text = status();
      if (S.hover && S.view !== 'split' && !S.full) { const d = P[S.hover]; text = `${d.kind} · ${name(S.hover)}. ${d.says}`; if (S.view === 'hang' && !S.tree.shelf.includes(S.hover)) text += ` Depth ${S.tree.depth[S.hover]}.`; if (S.sheets.has(S.hover) && d.inside) text += ` Inside: ${d.inside}.`; }
      if (text === hintText) return; hintText = text;
      hint.classList.remove('in'); void hint.offsetWidth; hint.textContent = text; hint.classList.add('in');
    }
    const BACK = { part: 'holds', req: 'required by', sup: 'supports', comp: 'computes', shown: 'shows' };
    let infoId = '';
    function infoNow() {            // on a wide stage the record in focus is written out: its face, what is inside, and each named thread
      const id = S.hover || S.focus || 'law'; if (!S.full || id === infoId) return; infoId = id; const d = P[id];
      const threads = RELS.filter(r => r[0] === id || r[1] === id).map(r => r[0] === id ? `<li><i>${RELNAME[r[2]]}</i>${name(r[1])}</li>` : `<li><i>${BACK[r[2]]}</i>${name(r[0])}</li>`).join('');
      info.classList.remove('in'); void info.offsetWidth;
      info.innerHTML = `<p class="cq-info-kind cq-t-${d.tone}">${d.kind}</p><h4>${name(id)}</h4><p class="cq-info-says">${d.says}</p><p class="cq-info-label">Inside</p><p class="cq-info-in">${d.more}</p><p class="cq-info-label">Outside, its threads</p><ul>${threads}</ul>` + (d.href ? `<a href="${d.href}" target="_blank" rel="noopener">Read it in the paper ↗</a>` : '');
      info.classList.add('in');
    }
    function pulse() { links.forEach(l => { if (l.tree) l.glow = 1; }); }
    function clickPiece(id) {
      S.focus = id;
      if (S.view === 'one') { S.sheets.has(id) ? S.sheets.delete(id) : S.sheets.add(id); retarget(); }
      else if (S.view === 'nest') {
        if (S.tree.kids[id].length) S.closed.has(id) ? S.closed.delete(id) : S.closed.add(id);
        else S.sheets.has(id) ? S.sheets.delete(id) : S.sheets.add(id);
        retarget();
      } else if (S.view === 'hang') { S.lift = id; retarget(); pulse(); }
    }

    /* ── the splitting ── */
    function paintSplitState() {
      const sp = SPLITS.find(x => x.b === S.split), best = cheapest(S.price), top = Math.max(...SPLITS.map(x => totalOf(x, S.price)));
      q('[data-say]').textContent = `${sp.say}: ${({ 12: 'twelve', 16: 'sixteen', 64: 'sixty-four' })[looksOf(sp)]} looks, and ${NUM[sp.choices]} envelope${sp.choices > 1 ? 's' : ''} opened on the way.` + (sp === best ? ' Nothing is cheaper at this price.' : ` ${best.as} would cost ${totalOf(best, S.price)}.`);
      read.querySelectorAll('.cq-col').forEach(c => { const x = SPLITS.find(y => y.b === +c.dataset.col); c.classList.toggle('on', x === sp); c.classList.toggle('best', x === best);
        c.querySelector('.cq-bar-looks').style.height = (looksOf(x) / top * 58).toFixed(1) + 'px'; c.querySelector('.cq-bar-env').style.height = (x.choices * S.price / top * 58).toFixed(1) + 'px'; c.querySelector('b').textContent = totalOf(x, S.price); });
      PRICES.forEach(pr => priceBtn[pr].classList.toggle('on', pr === S.price));
      if (tr.t < 0) q('[data-total]').textContent = totalOf(sp, S.price);
      toks.forEach(t => t.g.classList.toggle('target', t.r === S.target));
    }
    function setSplit(b) { S.split = b; retarget(); trace(); }
    const members = (s, i) => toks.slice(i * s, i * s + s);
    const centreOf = (s, i) => { const m = members(s, i); return [m.reduce((a, t) => a + t.x.v, 0) / m.length, m.reduce((a, t) => a + t.y.v, 0) / m.length]; };
    function trace() {
      const b = S.split, per = .075, settle = .3; tr.looks = []; let s = 64, t = .35;
      SIZES.forEach(z => walls[z].forEach(w => { w.hold = 0; })); toks.forEach(k2 => { k2.hold = 0; });
      while (s > 1) { const cs = s / b, first = Math.floor(S.target / s) * b, chosen = Math.floor(S.target / cs);
        for (let i = 0; i < b; i++) { tr.looks.push({ s: cs, i: first + i, t, look: true }); t += per; }
        tr.looks.push({ s: cs, i: chosen, t, chosen: true }); t += settle; s = cs; }
      tr.end = t; tr.t = 0; tr.k = -1; tr.count = 0; tr.env = 0; tr.pts = [];
      const c = centreOf(64, 0); tr.x.snap(c[0]); tr.y.snap(c[1] - 12); tr.a.to(1);
      if (M.off) { tr.t = tr.end; }
    }
    function stepTrace(dt) {
      if (tr.t < 0) return;
      tr.t += dt;
      while (tr.k + 1 < tr.looks.length && tr.looks[tr.k + 1].t <= tr.t) {
        const lk = tr.looks[++tr.k], hit = lk.s === 1 ? toks[lk.i] : walls[lk.s][lk.i];
        hit.glow = 1; if (lk.look) tr.count++; if (lk.chosen) { hit.hold = 1; tr.env++; }
        const c = lk.s === 1 ? [toks[lk.i].x.v, toks[lk.i].y.v] : centreOf(lk.s, lk.i); tr.x.to(c[0]); tr.y.to(c[1]);
      }
      q('[data-total]').textContent = tr.count + tr.env * S.price;
      if (tr.t > tr.end + .5 && tr.a.g) { tr.a.to(0); const best = cheapest(S.price).b; if (S.view === 'split' && !S.touched && S.split !== best) later(1100, () => { if (!S.touched && S.view === 'split') setSplit(best); }); }
    }

    /* ── steps ── */
    const timers = new Set();
    function later(ms, fn) { const gen = S.gen; if (M.off) ms = 0; const id = setTimeout(() => { timers.delete(id); if (gen === S.gen) fn(); }, ms); timers.add(id); }
    function step(i) {
      S.gen++; S.step = i; S.touched = false; S.hover = null;
      if (i === 0) { S.view = 'one'; S.axis = 'part'; S.lift = null; S.focus = 'law'; S.closed.clear(); S.sheets.clear(); retarget(); later(900, () => { S.sheets.add('law'); retarget(); }); }
      if (i === 1) {                                         // everything folds into the one shut envelope that holds it, which is then opened level by level
        S.view = 'nest'; S.axis = 'part'; S.lift = null; S.focus = 'paper'; S.sheets.clear(); S.closed.clear(); ['paper', 'sec3', 'sec5'].forEach(id => S.closed.add(id)); retarget();
        later(1200, () => { if (S.touched) return; S.closed.delete('paper'); retarget(); });
        later(2300, () => { if (S.touched) return; S.closed.delete('sec3'); S.closed.delete('sec5'); retarget(); });
        later(3400, () => { if (S.touched) return; S.sheets.add('law'); S.focus = 'law'; retarget(); });
      }
      if (i === 2) { S.view = 'hang'; S.sheets.clear(); S.closed.clear(); S.lift = null; S.axis = 'rests'; S.focus = 'fig6'; retarget(); pulse(); }
      if (i === 3) { S.view = 'hang'; S.sheets.clear(); S.closed.clear(); S.lift = S.focus = 'jaynes'; retarget(); pulse(); }
      if (i === 4) { S.view = 'split'; S.split = 64; S.lift = null; retarget(); later(1100, trace); }
    }

    /* ── drawing ── */
    function buildCards() {       // the text and outline of each card, in card units; rebuilt only when the width class changes
      const U = units(), w = U.cw, hh = U.ch;
      ORDER.forEach(id => {
        const p = pieces[id], d = p.d;
        p.face.setAttribute('x', -w / 2); p.face.setAttribute('y', -hh / 2); p.face.setAttribute('width', w); p.face.setAttribute('height', hh); p.face.setAttribute('rx', U.wide ? 6 : 8);
        p.ring.setAttribute('x', -w / 2 - 4); p.ring.setAttribute('y', -hh / 2 - 4); p.ring.setAttribute('width', w + 8); p.ring.setAttribute('height', hh + 8); p.ring.setAttribute('rx', 11);
        p.badge.setAttribute('transform', `translate(${w / 2 - 3} ${-hh / 2 + 3})`);
        p.title.textContent = ''; p.says.textContent = ''; p.seam.setAttribute('d', `M${-w / 2 + 4} ${hh / 2 - 3}L0 ${f1(hh * .04)}L${w / 2 - 4} ${hh / 2 - 3}`);
        if (U.wide) {
          p.kind.setAttribute('x', -w / 2 + 25); p.kind.setAttribute('y', 4); p.kind.setAttribute('text-anchor', 'start'); p.glyph.setAttribute('transform', `translate(${-w / 2 + 8} -6)`);
          p.title.setAttribute('text-anchor', 'start'); const ts = mk('tspan', { x: -w / 2 + 92, y: 4 }, p.title); ts.textContent = d.t.join(' ');
        } else {
          const kw = d.kind.length * 6.1; p.kind.setAttribute('x', 8); p.kind.setAttribute('y', -hh / 2 + 19.5); p.kind.setAttribute('text-anchor', 'middle'); p.glyph.setAttribute('transform', `translate(${f1(-kw / 2 - 9.5)} ${f1(-hh / 2 + 9.6)})`);
          p.title.setAttribute('text-anchor', 'middle'); d.t.forEach((line, i) => { const ts = mk('tspan', { x: 0, y: -hh / 2 + 33.5 + i * 13.4 + (d.t.length === 1 ? 6 : 0) }, p.title); ts.textContent = line; });
        }
        if (d.face) d.face[U.wide ? 1 : 0].forEach((line, i) => { const ts = mk('tspan', { x: U.wide ? -w / 2 + 10 : 0, y: hh / 2 + 6 + i * (U.wide ? 9.6 : 7.3) }, p.says); ts.textContent = line; });
        p.says.setAttribute('text-anchor', U.wide ? 'start' : 'middle'); p.extra = d.face ? d.face[U.wide ? 1 : 0].length * (U.wide ? 9.6 : 7.3) + 5 : 0; p.says.style.fontSize = U.wide ? '8px' : '';
        p.sheet.querySelectorAll('text,path').forEach(n => n.remove());
        if (id === 'law') {                                     // the material itself: the law, and its curve on logarithmic axes
          const t = mk('text', { class: 'cq-sheet-text', x: -w / 2 + 7, y: 0 }, p.sheet); t.innerHTML = 'p(r) ∝ r<tspan dy="-4.2">−λ</tspan>';
          mk('path', { class: 'cq-sheet-axis', d: `M${w / 2 - 25} -8v13h19` }, p.sheet); mk('path', { class: 'cq-sheet-curve', d: `M${w / 2 - 23} -6L${w / 2 - 8} 3` }, p.sheet);
        } else if (id === 'fig6') { mk('path', { class: 'cq-sheet-axis', d: 'M-22 -8v13h44' }, p.sheet); mk('path', { class: 'cq-sheet-curve', d: 'M-20 -7L20 -1M-20 -6L20 3M-20 -5L14 4' }, p.sheet);
        } else { const t = mk('text', { class: 'cq-sheet-text', x: 0, y: 0, 'text-anchor': 'middle' }, p.sheet); t.textContent = d.inside; }
      });
    }
    function paint() {
      const U = S.U || units(), w = U.cw, hh = U.ch;
      ORDER.forEach(id => {
        const p = pieces[id], s = p.sp, a = s.a.v, sc = Math.max(.01, s.s.v);
        p.g.setAttribute('transform', `translate(${f1(s.x.v)} ${f1(s.y.v)}) scale(${sc.toFixed(4)})`);
        p.g.style.opacity = clamp(a).toFixed(3); p.g.style.display = a < .004 ? 'none' : '';
        const o = clamp(s.o.v), top = -hh / 2, lift = U.wide ? 8 : 15, dip = U.wide ? 6 : 8;
        p.front.setAttribute('d', `M${-w / 2 + 5} ${top + 1.5}L0 ${f1(top + dip * (1 - o))}L${w / 2 - 5} ${top + 1.5}Z`); p.front.style.opacity = (1 - o).toFixed(3);
        p.back.setAttribute('d', `M${-w / 2 + 5} ${top + 1}L0 ${f1(top - lift * o)}L${w / 2 - 5} ${top + 1}Z`); p.back.style.opacity = (o * (1 - clamp(s.ha.v))).toFixed(3);
        const sh = clamp(s.sh.v), sw = w - 4, shh = 23;
        p.sheetRect.setAttribute('x', -sw / 2); p.sheetRect.setAttribute('y', -shh / 2); p.sheetRect.setAttribute('width', sw); p.sheetRect.setAttribute('height', shh);
        p.sheet.setAttribute('transform', `translate(0 ${f1(top + 13 - 27 * sh)})`); p.sheet.style.opacity = clamp(sh * 3).toFixed(3);
        p.kind.style.opacity = p.title.style.opacity = clamp(s.txt.v).toFixed(3);
        if (p.extra) { const bg = clamp(s.big.v); p.face.setAttribute('height', f1(hh + p.extra * bg)); p.says.style.opacity = smooth(clamp(bg * 2 - 1)).toFixed(3); }
        p.ring.style.opacity = clamp(s.ring.v).toFixed(3); p.badge.style.opacity = clamp(s.ring.v).toFixed(3);
        const hk = clamp(s.hook.v); p.hook.setAttribute('d', `M0 ${top}V${f1(top - 20 * hk)}m-4.5 -4.5a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0`); p.hook.style.opacity = hk.toFixed(3);
        p.hull.setAttribute('d', rr(s.bx.v, s.by.v, Math.max(1, s.bw.v), Math.max(1, s.bh.v), 13 * S.g)); p.hull.style.opacity = clamp(s.ha.v * a).toFixed(3);
        const hf = 10 * S.g * clamp(s.ha.v), hr = Math.min(16 * S.g, s.bw.v * .2); p.hflap.setAttribute('d', `M${f1(s.bx.v + hr)} ${f1(s.by.v)}L${f1(s.bx.v + s.bw.v / 2)} ${f1(s.by.v - hf)}L${f1(s.bx.v + s.bw.v - hr)} ${f1(s.by.v)}Z`); p.hflap.style.opacity = clamp(s.ha.v * a).toFixed(3);
      });
      /* threads: always drawn from where the two cards are now, so none can come away from its card */
      links.forEach(l => {
        const A = pieces[l.a].sp, B = pieces[l.b].sp, al = clamp(l.al.v) * Math.min(1, pieces[l.a].sp.a.v * 1.4, pieces[l.b].sp.a.v * 1.4);
        l.path.style.display = l.lab.style.display = l.pa.style.display = l.pb.style.display = l.dot.style.display = al < .01 ? 'none' : ''; if (al < .01) return;
        const dx = B.x.v - A.x.v, dy = B.y.v - A.y.v, len = Math.hypot(dx, dy) || 1;
        const edge = (sp, sx, sy) => { const hw = w * sp.s.v / 2 + 2, hh2 = hh * sp.s.v / 2 + 2, t = Math.min(hw / Math.abs(sx || 1e-6), hh2 / Math.abs(sy || 1e-6)); return [sp.x.v + sx * t, sp.y.v + sy * t]; };
        const a1 = edge(A, dx, dy), b1 = edge(B, -dx, -dy), bow = (l.i % 2 ? 1 : -1) * Math.min(26, len * .1) * (l.tree ? .25 : 1);
        const c = [(a1[0] + b1[0]) / 2 - dy / len * bow, (a1[1] + b1[1]) / 2 + dx / len * bow];
        l.path.setAttribute('d', `M${f1(a1[0])} ${f1(a1[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(b1[0])} ${f1(b1[1])}`);
        l.path.style.opacity = Math.min(1, al + l.glow * .5).toFixed(3); l.path.style.strokeWidth = (1.15 + (l.tree ? .5 : 0) + l.glow * 1.6).toFixed(2);
        l.pa.setAttribute('cx', f1(a1[0])); l.pa.setAttribute('cy', f1(a1[1])); l.pb.setAttribute('cx', f1(b1[0])); l.pb.setAttribute('cy', f1(b1[1])); l.pa.style.opacity = l.pb.style.opacity = al.toFixed(3);
        const lit = M.off ? 0 : (l.tree || S.view === 'one' ? 1 : .0) * al, u = ((clock / 3.1 + l.i * .37) % 1), v = 1 - u;   // a light travels each thread from one piece to the piece it names
        l.dot.style.opacity = (lit * Math.sin(Math.PI * u) * .95).toFixed(3);
        if (lit > .01) { l.dot.setAttribute('cx', f1(v * v * a1[0] + 2 * v * u * c[0] + u * u * b1[0])); l.dot.setAttribute('cy', f1(v * v * a1[1] + 2 * v * u * c[1] + u * u * b1[1])); }
        const ll = clamp(l.ll.v) * al; l.lab.style.opacity = ll.toFixed(3);
        if (ll > .01) { l.lab.setAttribute('x', f1((a1[0] + 2 * c[0] + b1[0]) / 4)); l.lab.setAttribute('y', f1((a1[1] + 2 * c[1] + b1[1]) / 4 + 4)); }
      });
      guides.forEach(gd => { const a = clamp(gd.a.v); gd.line.style.opacity = gd.text.style.opacity = a.toFixed(3); if (a < .01) return; gd.text.setAttribute('x', 11); gd.text.setAttribute('y', f1(gd.y.v + 4)); gd.line.setAttribute('d', `M22 ${f1(gd.y.v)}H${(S.guideW || S.W) - 8}`); });
      guideLab.style.opacity = clamp(guides[0].a.v).toFixed(3); guideLab.setAttribute('x', 6); guideLab.setAttribute('y', f1(guides[0].y.v - 16));
      shelfLab.setAttribute('x', f1(shelfSp.x.v)); shelfLab.setAttribute('y', f1(shelfSp.y.v)); shelfLab.setAttribute('text-anchor', S.narrow ? 'start' : 'middle'); shelfLab.style.opacity = clamp(shelfSp.a.v).toFixed(3);
      /* the followed piece leaves a short wake, so its change of depth can be seen */
      const f = pieces.fig6.sp, last = trailPts[trailPts.length - 1], moved = last ? Math.hypot(f.x.v - last[0], f.y.v - last[1]) : 9;
      if (moved > 1.2) trailPts.push([f.x.v, f.y.v, 1]);
      for (let i = trailPts.length - 1; i >= 0; i--) { trailPts[i][2] -= .014; if (trailPts[i][2] <= 0) trailPts.splice(i, 1); }
      trail.setAttribute('d', trailPts.length > 1 ? 'M' + trailPts.map(pp => f1(pp[0]) + ' ' + f1(pp[1])).join('L') : '');
      trail.style.opacity = (clamp(f.ring.v) * (trailPts.length > 1 ? Math.min(.7, trailPts[0][2] * 1.2 + .15) : 0)).toFixed(3);
      /* the sixty-four, their envelopes, and the thread through them */
      const ta = clamp(wallA.v); L.tok.style.display = L.wall.style.display = L.hil.style.display = ta < .004 && toks[0].a.v < .004 ? 'none' : '';
      if (ta >= .004 || toks[0].a.v >= .004) {
        const t = gridBox.t, p = gridBox.p; let hd = '';
        toks.forEach(k2 => {
          const a = clamp(k2.a.v), gl = Math.max(k2.glow, k2.hold || 0);
          k2.g.setAttribute('transform', `translate(${f1(k2.x.v)} ${f1(k2.y.v)})`); k2.g.style.opacity = a.toFixed(3);
          k2.rect.setAttribute('x', -t / 2); k2.rect.setAttribute('y', -t / 2); k2.rect.setAttribute('width', t); k2.rect.setAttribute('height', t); k2.rect.setAttribute('rx', t * .2);
          k2.v.setAttribute('d', `M${f1(-t / 2 + 1.5)} ${f1(-t / 2 + 1.5)}L0 ${f1(-t * .08)}L${f1(t / 2 - 1.5)} ${f1(-t / 2 + 1.5)}`);
          k2.g.style.setProperty('--glow', gl.toFixed(3)); hd += (hd ? 'L' : 'M') + f1(k2.x.v) + ' ' + f1(k2.y.v);
        });
        hil.setAttribute('d', hd); hil.style.opacity = (clamp(hilA.v) * .5).toFixed(3);
        const box = (s, i, lvl) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; members(s, i).forEach(k2 => { x0 = Math.min(x0, k2.x.v); y0 = Math.min(y0, k2.y.v); x1 = Math.max(x1, k2.x.v); y1 = Math.max(y1, k2.y.v); }); const pad = t / 2 + p * lvl + (s === 64 ? 3 : 0); return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]; };
        const inside = s => SIZES.filter(z => z < s).reduce((a, z) => a + clamp(pres[z].v), 0);
        SIZES.forEach(s => {
          const pr = clamp(pres[s].v), up = SIZES.filter(z => z > s && pres[z].g > .5).pop() || 64;
          walls[s].forEach(wl => {
            const al = pr * ta; wl.el.style.display = al < .01 ? 'none' : ''; if (al < .01) return;
            let b = box(s, wl.i, inside(s) + 1);
            if (pr < .999 && s < 64) { const pb = box(up, Math.floor(wl.i * s / up), inside(up) + 1); b = b.map((v, n) => pb[n] + (v - pb[n]) * smooth(pr)); }   // a new envelope is born from the one that holds it
            wl.el.setAttribute('d', rr(b[0], b[1], b[2] - b[0], b[3] - b[1], Math.min(7, t * .34) + p * .4)); wl.el.style.opacity = al.toFixed(3);
            wl.el.style.setProperty('--glow', Math.max(wl.glow, wl.hold).toFixed(3));
          });
        });
      }
      const tra = clamp(tr.a.v); tracer.style.opacity = tra.toFixed(3);
      if (tra > .01) { tr.pts.push([tr.x.v, tr.y.v]); if (tr.pts.length > 9) tr.pts.shift(); tDot.setAttribute('cx', f1(tr.x.v)); tDot.setAttribute('cy', f1(tr.y.v)); tWake.setAttribute('d', 'M' + tr.pts.map(pp => f1(pp[0]) + ' ' + f1(pp[1])).join('L')); }
    }

    /* ── the loop ── */
    let raf = 0, last = 0, visible = true, dead = false, clock = 0;
    function frame(now) {
      raf = 0; if (dead) return;
      const dt = Math.min(.034, last ? (now - last) / 1000 : .016); last = now; clock += dt;
      ORDER.forEach(id => { const s = pieces[id].sp; for (const n in s) s[n].step(dt); });
      links.forEach(l => { l.al.step(dt); l.ll.step(dt); l.glow *= Math.exp(-dt / .5); });
      guides.forEach(gd => { gd.y.step(dt); gd.a.step(dt); }); shelfSp.x.step(dt); shelfSp.y.step(dt); shelfSp.a.step(dt);
      const split = S.view === 'split';
      toks.forEach(t => { if (!split && (SEAT[t.home] === t.r || t.a.v < .02)) { t.x.snap(pieces[t.home].sp.x.v); t.y.snap(pieces[t.home].sp.y.v); } t.x.step(dt); t.y.step(dt); t.a.step(dt); t.glow *= Math.exp(-dt / .3); });
      SIZES.forEach(s => { pres[s].step(dt); walls[s].forEach(w => { w.glow *= Math.exp(-dt / .3); }); }); wallA.step(dt); hilA.step(dt);
      tr.x.step(dt); tr.y.step(dt); tr.a.step(dt); stepTrace(dt);
      paint();
      if (visible) raf = requestAnimationFrame(frame);
    }
    const wake = () => { if (!raf && !dead && visible) { last = 0; raf = requestAnimationFrame(frame); } };
    function resize() {
      const r = host.getBoundingClientRect(), W = Math.round(r.width), H = Math.round(r.height); if (!W || !H || (W === S.W && H === S.H)) return;
      const first = !S.W, narrow = W < 480, changed = narrow !== S.narrow || first;
      S.W = W; S.H = H; S.narrow = narrow; S.full = W >= 900; S.top = narrow ? 76 : 50; S.bottom = narrow ? 44 : W >= 900 ? 56 : 36;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); if (changed) buildCards();
      retarget();
      if (first) { ORDER.forEach(id => { const s = pieces[id].sp; for (const n in s) s[n].snap(s[n].g); }); toks.forEach(t => { t.x.snap(t.gx); t.y.snap(t.gy); }); }
    }
    const ro = new ResizeObserver(resize); ro.observe(host);
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }) : null; if (io) io.observe(host);
    resize(); step(0); wake();
    return { step(i) { step(clamp(i, 0, STEPS.length - 1)); wake(); }, destroy() { dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); ro.disconnect(); if (io) io.disconnect(); root.remove(); } };
  }

  /* ───────────────────────── a further section for the node's own page ───────────────────────── */
  const sections = [{
    title: 'Where the nesting comes from',
    mount(el) {
      el.classList.add('cq-why');
      el.innerHTML = '<p>The nesting is taken from <a href="/eigenengine/cost-of-complexity/"><i>The Cost of Complexity</i></a>, where a register holds distinctions at one level and is itself selected by a distinction at the next. An envelope is a register of this kind, so that the same picture repeats at every depth. Reaching a piece costs the choice of its envelope together with the choice made inside it, and the paper prices both.</p>' +
        '<p>If every question arranges the pieces differently, then no single tree is the right one to search. This is the problem that <a href="/eigenengine/query-diffusion/">query diffusion</a> addresses. How deep the nesting can usefully go is a separate matter, and the subject of <a href="/assets/docs/the-phases-of-hierarchy.pdf"><i>The Phases of Hierarchy</i></a>.</p>' +
        '<p class="cq-note"><i>The Cost of Complexity</i> and <i>The Phases of Hierarchy</i> are pre-pre-prints, early examples of work done in EigenEngine.</p>';
    },
  }];

  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.conceptric = {
    title: 'The conceptric',
    question: 'What is a conceptric?',
    line: 'An envelope around one concept, nested among others in an order that depends on the question asked.',
    text: 'A book can be read in more than one order. Its contents page orders the pages by chapter, while its index orders the same pages by subject. We call the envelope around a single concept a <em>conceptric</em>, with the material inside and its named relationships outside. Conceptrics hold conceptrics to any depth, and which of them is outermost depends on the question being asked.',
    art,
    exhibit: { steps: STEPS, mount },
    sections,
  };
})();
