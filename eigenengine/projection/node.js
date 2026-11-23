/* Node "reading": From conceptrics to papers and talks.
   A paper or a talk is a projection of the research object through a receiver state. The exhibit shows one object (the
   word frequency law of The Cost of Complexity, the twelve records the "build" node builds), a reader drawn as the same
   object with what they already know filled in, and the sequence that carries the difference from one to the other.
   The sequence is computed here from the records' own links: which records a reader lacks, and the order in which each
   needs only what came before. Reading fills the reader's state record by record; the line then folds into pages or slides.
   Every description is given at two levels (see level.js, which this file loads if the page has not).
   Contract: dispatch/CONTRACT.md. Everything is scoped to the root this file creates (.egj.egn-reading). */
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
  const f1 = v => (Math.round(v * 10) / 10).toString();
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const ht = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const cap = s => s[0].toUpperCase() + s.slice(1);

  /* ---- the two levels ----------------------------------------------------------------------------------------
     level.js owns the mechanism. If the page did not load it (the harness, the pattern before synthesis), it is fetched
     here, and until it arrives two-level words are made in the same form it would make them. */
  const HERE = ((document.currentScript && document.currentScript.src) || '/eigenengine/projection/node.js').replace(/node\.js.*$/, '');
  if (!window.EigenLevel && !document.querySelector('script[data-eg-level]')) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = HERE + 'level.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = HERE + 'level.js'; js.dataset.egLevel = '1'; document.head.appendChild(js);
  }
  const markTwo = (p, e) => `<span class="eg-lv eg-lv-plain">${p}</span><span class="eg-lv eg-lv-expert">${e}</span>`;
  const two = (p, e) => {
    if (window.EigenLevel) return window.EigenLevel.two(p, e);
    const s = new String(markTwo(p, e)); s.plain = p; s.expert = e; s.egTwo = true;      // eslint-disable-line no-new-wrappers
    s.replace = (a, b) => String(document.documentElement.dataset.level === 'expert' ? e : p).replace(a, b);
    return s;
  };
  const levelNow = () => document.documentElement.dataset.level === 'expert' ? 'expert' : 'plain';

  /* ---- the object --------------------------------------------------------------------------------------------
     The same twelve records, labels and places as the "build" node. needs: what a reader must hold before this record
     can be read. cite: the source a record is tied to, which a paper gives as a citation. len: its length on a page. */
  const REC = {
    I:  { kind: 'idea',    label: 'telling things apart has a cost', x: 38,   y: 6,  needs: [],                       len: 3, eq: 'K_{\\mathcal R}(x) > 0' },
    SM: { kind: 'source',  label: 'Mandelbrot 1953',                 x: 38,   y: 91, needs: [],                       len: 2, gist: 'what a word costs to name' },
    C1: { kind: 'claim',   label: 'cost grows as log of rank',       x: 38,   y: 27, needs: ['I', 'SM'],              len: 3, cite: 'SM', eq: 'K(r) = \\log r' },
    SL: { kind: 'source',  label: 'Landauer 1961',                   x: 13,   y: 91, needs: [],                       len: 2, gist: 'the heat given up in erasing' },
    C3: { kind: 'claim',   label: 'forgetting costs energy',         x: 13,   y: 27, needs: ['I', 'SL'],              len: 3, cite: 'SL', eq: '\\langle Q\\rangle \\ge k_B T\\,\\ell(p)' },
    P2: { kind: 'premise', label: 'every rank counted alike',        x: 51,   y: 69, needs: [],                       len: 2, eq: '\\mu(r) = 1' },
    P3: { kind: 'premise', label: 'known average cost',              x: 77.5, y: 69, needs: [],                       len: 2, eq: '\\langle \\log r\\rangle = C' },
    SJ: { kind: 'source',  label: 'Jaynes 1957',                     x: 63.5, y: 91, needs: [],                       len: 2, gist: 'the rule for a least-biased guess' },
    O:  { kind: 'step',    label: 'least-biased guess',              x: 63,   y: 49, needs: ['C1', 'P2', 'P3', 'SJ'], len: 3, cite: 'SJ', eq: '\\max_p\\,-\\!\\sum_r p_r \\log p_r' },
    C2: { kind: 'claim',   label: 'word frequency law',              x: 63,   y: 27, needs: ['I', 'O'],               len: 3, eq: 'p(r \\mid \\lambda) = r^{-\\lambda}/Z_R(\\lambda)' },
    Rn: { kind: 'run',     label: 'recorded run',                    x: 87,   y: 31, needs: ['C2'],                   len: 2, eq: 'R = 500' },
    F:  { kind: 'figure',  label: 'Figure 6',                        x: 87,   y: 6,  needs: ['Rn', 'C2'],             len: 6 },
  };
  const ALL = Object.keys(REC), ORDER = ALL;                        // every record can be read; a source read is a paragraph of background
  const KIND = { idea: 'Idea', claim: 'Claim', step: 'Step', premise: 'Premise', source: 'Source', run: 'Run', figure: 'Figure' };
  const LINKS = [                                                   // as drawn in the object: [record, what it stands on, name, bow]
    ['I', 'C3', 'requires', -.10], ['I', 'C1', 'requires', 0], ['I', 'C2', 'requires', .10],
    ['C2', 'O', 'requires', 0], ['O', 'C1', 'requires', -.12], ['O', 'P2', 'requires', .08], ['O', 'P3', 'requires', -.08],
    ['C3', 'SL', 'supported by', 0], ['C1', 'SM', 'supported by', 0], ['O', 'SJ', 'supported by', 0],
    ['Rn', 'C2', 'computed by', -.12], ['F', 'Rn', 'computed by', 0], ['F', 'C2', 'shown by', .1],
  ];
  const COUNT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'], TEEN = ['thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const num = n => n <= 12 ? COUNT[n] : n < 20 ? TEEN[n - 13] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? '-' + COUNT[n % 10] : '') : n.toLocaleString('en-GB');   // in words up to ninety-nine
  /* holds: what this reader already knows. first: what they are shown first. A paper opens on its idea; a newcomer is
     shown the figure first, as the thing to be explained, and the law that explains it comes later. */
  const AUD = [
    { id: 'phys', label: 'a physicist',          holds: ['SJ', 'P2', 'SL', 'C3'], first: 'I' },
    { id: 'new',  label: 'a newcomer',           holds: [],                       first: 'F' },
    { id: 'comp', label: 'a computer scientist', holds: ['C1', 'SM', 'P3'],       first: 'I' },
  ];
  const RESULT = ['C2', 'F'];                                       // what the paper sets out to convey, unless the reader of the page changes it

  /* ---- the projection ----------------------------------------------------------------------------------------
     Given what the reader holds and the results to convey: the records to supply are those the results rest on and the
     reader lacks. Of the orders in which each record needs only what came before, the one taken makes the links span the
     least, so that nothing is held for long before it is used. Both the count of admissible orders and the order are
     found exactly, by one pass over the subsets (nine records at most). */
  /* what a record needs before it can be read. A record shown first needs nothing, and what it would have rested on
     comes after it instead, as its explanation. */
  const needsOf = (id, first) => first === 'I' || !REC[first] ? REC[id].needs : id === first ? [] : REC[first].needs.includes(id) ? REC[id].needs.concat(first) : REC[id].needs;
  function project(holds, results, first = 'I') {
    const seen = new Set(), need = id => needsOf(id, holds.has(first) ? 'I' : first);
    const visit = id => { if (holds.has(id) || seen.has(id)) return; seen.add(id); need(id).forEach(visit); };
    ORDER.forEach(id => { if (results.has(id)) visit(id); });
    if (first !== 'I' && seen.has(first)) REC[first].needs.forEach(visit);      // a record shown first is still explained: what it rests on is conveyed after it
    const ids = ORDER.filter(id => seen.has(id)), n = ids.length, idx = {};
    ids.forEach((id, i) => { idx[id] = i; });
    const pre = ids.map(id => need(id).reduce((m, u) => seen.has(u) ? m | (1 << idx[u]) : m, 0));
    const opens = first in idx ? first : 'I' in idx ? 'I' : null, lead = opens ? 1 << idx[opens] : 0;   // the sequence opens on what this reader is shown first: nothing is read before it
    const idea = 'I' in idx ? 1 << idx.I : 0;                         // and the idea comes before every record but that one (the status line at the expert level says so)
    const size = 1 << n, cost = new Float64Array(size).fill(Infinity), ways = new Float64Array(size), last = new Int8Array(size).fill(-1);
    const bits = m => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
    cost[0] = 0; ways[0] = 1;
    for (let m = 0; m < size; m++) {
      if (!ways[m]) continue;
      for (let v = 0; v < n; v++) {
        if ((m >> v) & 1 || (pre[v] & m) !== pre[v] || (lead && !(m & lead) && (1 << v) !== lead) || (idea && !(m & idea) && (1 << v) !== idea && (1 << v) !== lead)) continue;
        const m2 = m | (1 << v); ways[m2] += ways[m];
        let cut = 0; for (let w = 0; w < n; w++) if (!((m2 >> w) & 1)) cut += bits(pre[w] & m2);   // links still open after this record
        if (cost[m] + cut < cost[m2] - 1e-9) { cost[m2] = cost[m] + cut; last[m2] = v; }
      }
    }
    const seq = []; for (let m = size - 1; m; m ^= 1 << last[m]) seq.unshift(ids[last[m]]);
    const pos = {}; seq.forEach((id, k) => { pos[id] = k; });
    const arcs = []; seq.forEach(id => need(id).forEach(u => { if (u in pos) arcs.push([u, id]); }));
    const cites = []; seq.forEach(id => { const c = REC[id].cite; if (c && !cites.includes(c)) cites.push(c); });
    return { seq, pos, arcs, cites, need, opens, ways: n ? ways[size - 1] : 0, span: n ? cost[size - 1] : 0 };
  }
  /* a talk: one slide for each idea, claim, step or figure; a premise, a source or a run goes on the slide of the next of those */
  function slidesOf(seq) {
    const out = []; let wait = [];
    seq.forEach(id => {
      const k = REC[id].kind;
      if (k === 'premise' || k === 'run' || k === 'source') wait.push(id); else { out.push({ head: id, with: wait }); wait = []; }
    });
    if (wait.length) { if (out.length) out[out.length - 1].with.push(...wait); else out.push({ head: wait[0], with: wait.slice(1) }); }
    return out;
  }
  /* a paper: each record a paragraph of its own length, set down the page; a page holds twenty-four lines, and a figure is kept with the run it was drawn from */
  const PAGE_LINES = 24;
  function pagesOf(seq) {
    const total = seq.reduce((a, id) => a + REC[id].len, 0), even = total / Math.max(1, Math.ceil(total / PAGE_LINES));   // pages are filled evenly, so the last is never left nearly empty
    const out = [[]]; let used = 0;
    seq.forEach(id => {
      const l = REC[id].len, page = out[out.length - 1];
      if (page.length && (used + l > PAGE_LINES || (used + l / 2 > even && out.length * PAGE_LINES < total + PAGE_LINES - 1e-9 && out.length < Math.ceil(total / PAGE_LINES)))) {
        const prev = page[page.length - 1], carry = REC[id].kind === 'figure' && REC[id].needs.includes(prev) && page.length > 1 ? [page.pop()] : [];
        out.push(carry); used = carry.reduce((a, c) => a + REC[c].len, 0);
      }
      out[out.length - 1].push(id); used += l;
    });
    return out;
  }

  /* ---- what a record looks like --------------------------------------------------------------------------------
     The drawing says what the record says: a cost that climbs with rank, bars that fall as the law, flat bars for ranks
     counted alike. The same drawing is used in the object, in the reader and in the sequence, so a record is recognised
     wherever it goes. */
  const barsOf = (h, extra = '') => h.map((v, i) => `<rect class="f" x="${f1(5 + i * 4)}" y="${f1(24.5 - v)}" width="2.7" height="${f1(v)}" rx=".7"/>`).join('') + extra;
  const FLAT = [8, 8, 8, 8, 8, 8], LAW = [17, 8.5, 5.7, 4.3, 3.4, 2.8], COST = [4, 9, 11.9, 14, 15.5, 16.8];
  function glyph(id) {
    const o = '<svg class="egj-g" viewBox="0 0 32 32" aria-hidden="true">', base = '<path class="b" d="M4 25.5H28"/>';
    switch (id) {
      case 'I':  return o + '<circle cx="16" cy="16" r="9.5"/><circle class="f" cx="16" cy="16" r="3.6"/></svg>';
      case 'C1': return o + base + barsOf(COST) + '</svg>';
      case 'C2': return o + base + barsOf(LAW) + '</svg>';
      case 'C3': return o + '<rect x="9" y="15" width="14" height="10.5" rx="2"/><path d="M12 11.5c-1.7-1.7 1.7-2.8 0-4.7M16 11.5c-1.7-1.7 1.7-2.8 0-4.7M20 11.5c-1.7-1.7 1.7-2.8 0-4.7"/></svg>';
      case 'O':  return o + '<path d="M16 3.5 28.5 16 16 28.5 3.5 16Z"/><path class="b" d="M10.5 19.5h11"/><rect class="f" x="11.2" y="15" width="2" height="4" rx=".5"/><rect class="f" x="15" y="12.5" width="2" height="6.5" rx=".5"/><rect class="f" x="18.8" y="15.8" width="2" height="3.2" rx=".5"/></svg>';
      case 'P2': return o + base + barsOf(FLAT) + '</svg>';
      case 'P3': return o + base + '<g class="dim">' + barsOf(COST) + '</g><path class="avg" d="M2.5 13.4H29.5"/></svg>';
      case 'Rn': return o + base + barsOf(LAW) + '<path class="b" d="M4 6.5h6M4 9.8h4"/></svg>';
      case 'F':  return o + '<path class="b" d="M6 4.5V26H28"/><path class="plot" d="M9 8.5 26 22.5"/>' + [0, .22, .42, .6, .78, 1].map(f => `<circle class="f" cx="${f1(9 + 17 * f)}" cy="${f1(8.5 + 14 * f)}" r="1.25"/>`).join('') + '</svg>';
      default:   return o + '<path d="M8.5 3.5h10l5.5 5.5v19.5H8.5Z"/><path class="b" d="M18.2 3.8v5.5h5.5M12 14.5h8.5M12 18.3h8.5M12 22.1h5.5"/></svg>';
    }
  }
  const lineBars = seed => Array.from({ length: 7 }, (_, i) => `<i style="width:${[100, 93, 97, 88, 95, 91, 99][(i + seed) % 7]}%"></i>`).join('');

  /* ---- words the exhibit writes itself: its status line, computed from what is on the stage --------------------- */
  const names = ids => { const a = ids.map(id => REC[id].kind === 'source' ? REC[id].label : REC[id].kind === 'figure' ? 'Figure 6' : REC[id].kind === 'run' ? 'the recorded run' : 'the ' + REC[id].kind + ' “' + REC[id].label + '”'); return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; };
  const audOf = S => AUD.findIndex(a => a.first === S.first && a.holds.length === S.holds.size && a.holds.every(id => S.holds.has(id)));
  const whoIs = S => { const a = AUD[audOf(S)]; return a ? cap(a.label) : 'This reader'; };
  /* a record as a sentence of the paper (the wording of the "build" node's sheet) */
  const REF = '<sup class="egj-ref"></sup>';
  const SENT = {
    SM: `Mandelbrot asked what it costs to name a word${REF}.`, C1: `The cost of naming a word grows as the logarithm of its rank${REF}.`,
    SL: `Landauer showed that erasing a record gives up heat${REF}.`, C3: `Forgetting costs energy${REF}.`,
    P2: 'Suppose every rank is counted alike.', P3: 'Suppose also that only the average cost is known.',
    SJ: `Jaynes gave the rule for the least-biased guess from known averages${REF}.`, O: `We take the least-biased guess${REF} at how often each word is used.`,
    C2: 'That guess is the word frequency law.', Rn: 'A recorded run computes the law for five hundred ranks.',
  };

  let mounts = 0;
  /* ================================================================================================================
     The exhibit
     ================================================================================================================ */
  function mount(host, opts = {}) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const root = ht('div', 'egj egn-reading', host), uid = 'egj' + (++mounts);
    root.setAttribute('role', 'group');
    root.setAttribute('aria-label', 'A research object, a reader, and the sequence that carries one to the other. The records on the left choose what is conveyed; the records on the right choose what the reader already knows.');
    root.innerHTML =
      '<div class="egj-top">' +
        '<div class="egj-set" role="group" aria-label="Who the reader is"><span class="egj-lab">The reader is</span>' + AUD.map((a, i) => `<button type="button" class="egj-chip" data-aud="${i}" aria-pressed="false">${a.label}</button>`).join('') + '</div>' +
        '<div class="egj-set" role="group" aria-label="The form it takes"><span class="egj-lab">as</span><button type="button" class="egj-chip" data-form="paper" aria-pressed="false">a paper</button><button type="button" class="egj-chip" data-form="talk" aria-pressed="false">a talk</button></div>' +
      '</div>' +
      '<div class="egj-stage">' +
        `<svg class="egj-wires" aria-hidden="true"><defs><marker id="${uid}-a" viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path class="egj-arrow" d="M1 1 7 4 1 7"/></marker></defs>` +
          '<rect class="egj-frame" rx="14"/><g class="egj-lo"></g><g class="egj-lr"></g><g class="egj-th"></g><g class="egj-arcs"></g><g class="egj-pulses"></g></svg>' +
        '<span class="egj-eye egj-eye-o">The research object</span><span class="egj-eye egj-eye-r"></span><span class="egj-eye egj-eye-m"></span><span class="egj-eye egj-ruler" aria-hidden="true"></span>' +
        '<div class="egj-sheets" aria-hidden="true"></div><div class="egj-cursor" aria-hidden="true"></div>' +
        '<div class="egj-names" aria-hidden="true"></div><div class="egj-tiles"></div><div class="egj-cards"></div>' +
      '</div>' +
      '<p class="egj-status" aria-live="polite"></p>';
    const q = s => root.querySelector(s), stage = q('.egj-stage'), wires = q('.egj-wires'), statusEl = q('.egj-status');
    const eyeO = q('.egj-eye-o'), eyeR = q('.egj-eye-r'), eyeM = q('.egj-eye-m'), ruler = q('.egj-ruler'), cursor = q('.egj-cursor'), frame = q('.egj-frame');

    /* ---- state: everything drawn is read from this ---- */
    const S = { phase: 0, holds: new Set(AUD[0].holds), first: AUD[0].first, results: new Set(RESULT), form: null, got: new Set(), read: 0, playing: false, hot: null, pin: null, note: null };
    let P = project(S.holds, S.results, S.first), NM = '', cur = 0, W = 0, H = 0, first = true, dead = false, raf = 0, lastT = 0, dirty = true, auto = 0, autoOn = false, playT = 0;
    let U = 1;                                                        // the page's own scale: sizes given in pixels below grow with its type, as on a 2560 px window
    const tiny = () => H < 250 * U, narrow = () => W < 520 * U;

    /* ---- the pieces ---- */
    const tiles = {}, rtiles = {}, namesEl = {}, cards = {}, lo = [], lr = [], thO = {}, thR = {}, arcEls = [], pulses = []; let pulseN = 0;
    ALL.forEach(id => {
      const r = REC[id];
      const a = tiles[id] = ht('button', `egj-tile egj-k-${r.kind}`, q('.egj-tiles'), glyph(id) + '<i class="egj-flag"></i>');
      a.dataset.id = id; a.dataset.side = 'o'; a.type = 'button'; a.setAttribute('aria-pressed', 'false');
      const b = rtiles[id] = ht('button', `egj-tile egj-rt egj-k-${r.kind}`, q('.egj-tiles'), glyph(id));
      b.type = 'button'; b.dataset.id = id; b.dataset.side = 'r'; b.setAttribute('aria-pressed', 'false');
      namesEl[id] = ht('span', 'egj-name', q('.egj-names'), `<small>${KIND[r.kind]}</small>${r.label}`);
    });
    ORDER.forEach(id => {
      const r = REC[id], c = ht('button', `egj-card egj-k-${r.kind}`, q('.egj-cards'));
      c.type = 'button'; c.dataset.id = id; c.dataset.len = r.len;
      c.innerHTML = `<span class="egj-no"></span>${glyph(id)}<span class="egj-tx"><b>${cap(r.label)}${r.cite || r.kind === 'source' ? REF : ''}</b>${SENT[id] ? `<span class="egj-sent">${SENT[id]}</span>` : ''}` +
        `<small>${r.kind === 'source' ? 'Source · ' + r.gist : markTwo(KIND[r.kind] + (r.cite ? ' · ' + REC[r.cite].label : ''), r.eq ? `\\(${r.eq}\\)` : KIND[r.kind])}</small><span class="egj-bars">${lineBars(ORDER.indexOf(id))}</span></span>`;
      cards[id] = { id, el: c, no: c.querySelector('.egj-no'), refs: [...c.querySelectorAll('.egj-ref')], x: new Spring(0, 105, 21), y: new Spring(0, 105, 21), w: new Spring(40, 105, 21), h: new Spring(40, 105, 21), a: new Spring(0), hold: 0, mode: '', in: false };   // a little slower than the shared spring, so the straightening can be watched
      thO[id] = sv('path', { class: 'egj-thread' }, q('.egj-th')); thR[id] = sv('path', { class: 'egj-thread egj-thread-r' }, q('.egj-th'));
    });
    LINKS.forEach(l => {
      lo.push({ l, el: sv('path', { class: 'egj-link egj-ln-' + l[2].split(' ')[0] }, q('.egj-lo')) });
      lr.push({ l, el: sv('path', { class: 'egj-link egj-link-r egj-ln-' + l[2].split(' ')[0] }, q('.egj-lr')), a: new Spring(0) });
    });
    for (let i = 0; i < 12; i++) arcEls.push({ el: sv('path', { class: 'egj-arc', 'marker-end': `url(#${uid}-a)` }, q('.egj-arcs')), a: new Spring(0) });
    const sheets = Array.from({ length: 3 }, (_, i) => ({ el: ht('div', 'egj-page', q('.egj-sheets'), `<span>${i + 1}</span><p class="egj-refs"></p>`), x: new Spring(), y: new Spring(), w: new Spring(10), h: new Spring(10), a: new Spring(0) }));
    const frames = Array.from({ length: 7 }, (_, i) => ({ el: ht('div', 'egj-slide', q('.egj-sheets'), `<span>${i + 1}</span>`), x: new Spring(), y: new Spring(), w: new Spring(10), h: new Spring(10), a: new Spring(0) }));
    /* zones: where the object and the reader sit, and how far each record's fill has gone */
    const Z = { ox: new Spring(), oy: new Spring(), ow: new Spring(100), oh: new Spring(100), rx: new Spring(), ry: new Spring(), rw: new Spring(100), rh: new Spring(100), ra: new Spring(0), na: new Spring(0), ta: new Spring(0), ca: new Spring(0), cur: new Spring(0), cx: new Spring(0, 260, 32), cy: new Spring(0, 260, 32), cw: new Spring(40, 260, 32), ch: new Spring(20, 260, 32) };
    const fill = {}; ALL.forEach(id => { fill[id] = new Spring(0, 120, 20); });

    /* ---- geometry: every target is a function of the state and the size of the stage ---- */
    function zones() {
      const p = S.phase, pad = tiny() ? 4 : 12 * U, top = tiny() ? 15 : 24 * U, bh = H - top - pad, wide = W >= 900 * U;
      if (p === 0) {                                                   // alone on the stage the records are named: beneath each where there is height, beside each where there is only width
        const w = Math.min(W - 2 * pad, Math.max(W * .62, 300), bh * 1.5), nm = tiny() ? '' : bh >= 500 * U && w >= 430 * U ? 'below' : W - 2 * pad >= 560 * U ? 'beside' : '';
        return { nm, o: nm === 'beside' ? [pad, top, W - 2 * pad, bh] : [(W - w) / 2, top, w, bh], r: [W * .74, top + bh * .1, W * .24, bh * .8], ra: 0, m: null };
      }
      if (p === 1) { const w = (W - 3 * pad) / 2 - W * .03; return { o: [pad, top, w, bh], r: [W - pad - w, top, w, bh], ra: 1, m: null }; }
      if (p <= 3) { const w = W * (wide ? .27 : .245) - pad, g = W * (wide ? .045 : .028); return { o: [pad, top, w, bh], r: [W - pad - w, top, w, bh], ra: 1, m: [pad + w + g, top, W - 2 * (pad + w + g), bh] }; }
      if (narrow() && !tiny()) { const hh = bh * .23, w = (W - 3 * pad) / 2, gap = 20 * U; return { o: [pad, top, w, hh], r: [W - pad - w, top, w, hh], ra: 1, m: [pad, top + hh + gap, W - 2 * pad, bh - hh - gap] }; }   // on a narrow stage the two maps sit above the pages
      const w = W * (wide ? .17 : .135) - pad, hh = Math.min(bh, w * 1.9), g = W * (wide ? .03 : .022);
      return { o: [pad, top + (bh - hh) / 2, w, hh], r: [W - pad - w, top + (bh - hh) / 2, w, hh], ra: 1, m: [pad + w + g, top, W - 2 * (pad + w + g), bh] };
    }
    const tsize = (w, h, cap = 56) => clamp(Math.min(w / 5.3, h / 6.6), tiny() ? 8 : 13, cap * U);
    const nameW = zw => NM === 'beside' ? clamp(zw * .25 - 54 * U, 70, 170 * U) : clamp(zw * .235, 76, 150 * U);
    const place = (id, zx, zy, zw, zh, named) => {                    // a record's place in a zone; in the object, room is left for the names while they show
      const na = named ? Z.na.v : 0, s = tsize(zw, zh, mix(56, NM === 'beside' ? 38 : 46, na)), r = REC[id];
      return [zx + s * .62 + (r.x - 13) / 74.5 * (zw - s * 1.24 - (NM === 'beside' ? (nameW(zw) + 6) * na : 0)), zy + s * .62 + (r.y - 6) / 85 * (zh - s * 1.24 - (NM === 'below' ? 56 * U * na : 0)), s];
    };
    const oAt = id => place(id, Z.ox.v, Z.oy.v, Z.ow.v, Z.oh.v, true), rAt = id => place(id, Z.rx.v, Z.ry.v, Z.rw.v, Z.rh.v, false);

    function cardGoals(z) {                                           // where each record of the sequence sits: in the object, in the line, on a page or on a slide
      const g = {}, n = P.seq.length, p = S.phase;
      sheets.forEach(s => { s.goal = null; }); frames.forEach(s => { s.goal = null; });
      if (p < 2 || !n) return g;
      const [mx, my, mw, mh] = z.m;
      if (p <= 3) {
        const gut = clamp(mw * .15, 18, 46 * U), gap = tiny() ? 1 : clamp(mh * .014, 3, 7 * U), rh = clamp((mh - (n - 1) * gap) / n, 13, 46 * U), y0 = my + (mh - n * rh - (n - 1) * gap) / 2;
        P.seq.forEach((id, k) => { g[id] = [mx + gut, y0 + k * (rh + gap), mw - gut, rh, 'row']; });
        return g;
      }
      if (S.form === 'talk') {
        const sl = slidesOf(P.seq), ns = sl.length, gap = tiny() ? 4 : 10; let best = null;
        for (let cols = 1; cols <= ns; cols++) {
          const rows = Math.ceil(ns / cols), w = Math.min((mw - (cols - 1) * gap) / cols, ((mh - (rows - 1) * gap) / rows) * 16 / 10.2);
          if (!best || w > best.w) best = { cols, rows, w };
        }
        const { cols, rows, w } = best, h = w * 10.2 / 16, x0 = mx + (mw - cols * w - (cols - 1) * gap) / 2, y0 = my + (mh - rows * h - (rows - 1) * gap) / 2;
        sl.forEach((s, i) => {
          const last = i >= (rows - 1) * cols ? ns - (rows - 1) * cols : cols, off = i >= (rows - 1) * cols ? (cols - last) * (w + gap) / 2 : 0;
          const x = x0 + off + (i % cols) * (w + gap), y = y0 + Math.floor(i / cols) * (h + gap), pd = clamp(w * .045, 3, 9), nb = s.with.length;
          if (frames[i]) frames[i].goal = [x, y, w, h];
          const bh = nb ? clamp(h * .5 / nb - 3, 13, 24 * U) : 0, all = nb * (bh + 3);
          g[s.head] = [x + pd, y + pd, w - 2 * pd, h - 2 * pd - all - (nb ? 2 : 0), 'head'];
          s.with.forEach((id, j) => { g[id] = [x + pd, y + h - pd - all + 3 + j * (bh + 3), w - 2 * pd, bh, 'bullet']; });
        });
        return g;
      }
      const pg = pagesOf(P.seq), np = pg.length, gap = tiny() ? 6 : 14, ph = Math.min(mh, ((mw - (np - 1) * gap) / np) * 1.34, mw * .9), pw = ph / 1.34;
      const x0 = mx + (mw - np * pw - (np - 1) * gap) / 2, y0 = my + (mh - ph) / 2, pd = clamp(pw * .07, 4, 14 * U), most = Math.max(...pg.map(l => l.reduce((a, id) => a + REC[id].len, 0))), u = (ph - 2 * pd) / (Math.max(most, 15) + 2.2);   // lines are as tall as the fullest page allows; the foot is kept for the page number and the references
      pg.forEach((list, i) => {
        const x = x0 + i * (pw + gap); let y = y0 + pd;
        if (sheets[i]) { sheets[i].goal = [x, y0, pw, ph]; sheets[i].el.classList.toggle('is-small', pw < 230 * U); }
        list.forEach(id => { const hh = REC[id].len * u; g[id] = [x + pd, y, pw - 2 * pd, hh - 1, 'para']; y += hh; });
      });
      return g;
    }

    function retarget(stagger) {
      const z = zones(), now = performance.now();
      Z.ox.to(z.o[0]); Z.oy.to(z.o[1]); Z.ow.to(z.o[2]); Z.oh.to(z.o[3]); Z.rx.to(z.r[0]); Z.ry.to(z.r[1]); Z.rw.to(z.r[2]); Z.rh.to(z.r[3]); Z.ra.to(z.ra);
      if (z.nm != null && z.nm !== NM) { NM = z.nm; root.classList.toggle('egj-names-beside', NM === 'beside'); }
      Z.na.to(S.phase === 0 && NM ? 1 : 0);
      arcEls.forEach((A, i) => A.a.to(i < P.arcs.length && (S.phase === 2 || S.phase === 3) ? 1 : 0));
      Z.ta.to(S.phase === 2 || S.phase === 3 ? 1 : 0);
      Z.ca.to(S.phase === 3 && S.read < P.seq.length ? 1 : 0);
      const g = cardGoals(z);
      const sentences = ORDER.every(id => !g[id] || g[id][4] !== 'para' || !SENT[id] || (g[id][2] >= 190 * U && g[id][3] >= 27 * U));   // a page is set in sentences only if every paragraph has room for one
      ORDER.forEach(id => {
        const c = cards[id], t = g[id];
        c.in = !!t; c.goal = t || null;
        if (stagger && t) c.hold = now + (M.off ? 0 : (P.pos[id] || 0) * 75); else if (stagger) c.hold = 0;
        const mode = t ? t[4] : '';
        if (mode !== c.mode) { c.mode = mode; c.el.dataset.mode = mode; }
        if (t) {
          c.el.classList.toggle('is-short', t[3] < 30 * U); c.el.classList.toggle('is-slim', t[2] < 150 * U);
          const para = mode === 'para', sent = para && !!SENT[id] && sentences;   // on a page: the sentence where it fits, else the name on one line, else only the lines
          c.el.classList.toggle('is-sent', sent); c.el.classList.toggle('is-one', para && !sent && t[3] < 31 * U); c.el.classList.toggle('is-bare', para && t[3] < 14.5 * U);
          if (para) c.el.style.setProperty('--lc', Math.max(1, Math.floor((t[3] + .6) / (15.1 * U))));
        }
      });
      [...sheets, ...frames].forEach(s => { s.a.to(s.goal ? 1 : 0); if (s.goal) { if (s.a.v < .02) { const m = z.m || [W / 2, H / 2, 10, 10]; s.x.snap(m[0] + m[2] * .3); s.y.snap(m[1] + m[3] * .15); s.w.snap(m[2] * .4); s.h.snap(m[3] * .7); } s.x.to(s.goal[0]); s.y.to(s.goal[1]); s.w.to(s.goal[2]); s.h.to(s.goal[3]); } });
      dirty = true;
    }

    /* ---- what the state looks like on each piece (classes and words; colours move by CSS, geometry by springs) ---- */
    const heldNow = id => S.holds.has(id) || S.got.has(id);
    function paint() {
      const inSeq = id => id in P.pos, p = S.phase;
      ALL.forEach(id => {
        const o = tiles[id], r = rtiles[id];
        o.classList.toggle('is-result', S.results.has(id));
        o.classList.toggle('is-send', p >= 1 && inSeq(id));
        o.classList.toggle('is-known', p >= 1 && S.holds.has(id));
        o.classList.toggle('is-hot', S.hot === id); r.classList.toggle('is-hot', S.hot === id);
        o.setAttribute('aria-pressed', S.results.has(id) ? 'true' : 'false'); o.setAttribute('aria-label', `${KIND[REC[id].kind]}: ${REC[id].label}. ${S.results.has(id) ? 'A result this paper conveys' : 'Not one of the results conveyed'}.`);
        r.classList.toggle('is-held', S.holds.has(id)); r.classList.toggle('is-got', !S.holds.has(id) && S.got.has(id));
        r.classList.toggle('is-want', !heldNow(id) && inSeq(id));
        r.setAttribute('aria-pressed', S.holds.has(id) ? 'true' : 'false');
        r.setAttribute('aria-label', `${REC[id].label}: ${S.holds.has(id) ? 'the reader already knows this' : S.got.has(id) ? 'the reader has now read this' : 'the reader does not know this'}.`);
        fill[id].to(heldNow(id) ? 1 : 0);
      });
      const refs = {}; P.cites.forEach((s, i) => { refs[s] = i + 1; });
      const np0 = pagesOf(P.seq).length; sheets.forEach((sh, i) => { const el = sh.el.querySelector('.egj-refs'), txt = i === np0 - 1 ? P.cites.map((s, j) => `[${j + 1}] ${REC[s].label}`).join('   ') : ''; if (el.textContent !== txt) el.textContent = txt; });
      ORDER.forEach(id => {
        const c = cards[id], k = P.pos[id];
        if (k != null) { c.no.textContent = k + 1; const rf = refs[REC[id].kind === 'source' ? id : REC[id].cite]; c.refs.forEach(e => { e.textContent = rf ? '[' + rf + ']' : ''; }); }
        c.el.classList.toggle('is-read', k != null && S.got.has(id)); c.el.classList.toggle('is-hot', S.hot === id);
        c.el.tabIndex = c.in ? 0 : -1; c.el.setAttribute('aria-hidden', c.in ? 'false' : 'true');
        c.el.setAttribute('aria-label', k != null ? `${k + 1}. ${KIND[REC[id].kind]}: ${REC[id].label}.` + (P.need(id).length ? ` Needs ${names(P.need(id))}.` : '') : REC[id].label);
      });
      const au = audOf(S); root.querySelectorAll('[data-aud]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.aud === au ? 'true' : 'false'));
      [['P2', 'P3', 'every rank is counted alike'], ['P3', 'P2', 'only the average cost is known']].forEach(([id, other, words]) => {   // the second supposition on a page says "also"
        const el = cards[id].el.querySelector('.egj-sent'), txt = `Suppose ${P.pos[other] < P.pos[id] ? 'also ' : ''}that ${words}.`; if (el && el.textContent !== txt) el.textContent = txt; });
      root.querySelectorAll('[data-form]').forEach(b => b.setAttribute('aria-pressed', p >= 4 && S.form === b.dataset.form ? 'true' : 'false'));
      const held = ALL.filter(heldNow).length, n = P.seq.length;
      const zz = zones(), rw = zz.r[2], ow = zz.o[2], kk = P.seq.filter(id => S.got.has(id)).length;                 // the labels shorten with the room they have; the state is counted from what has arrived
      eyeO.textContent = ow >= 176 * U ? 'The research object' : ow >= 92 * U ? 'The object' : ow >= 62 * U ? 'Object' : '';
      const forms = [[`The reader holds <b>${held ? num(held) : 'none'}</b> of twelve`, `Receiver state \\(K_{${kk}}\\): <b>${held}</b> of 12`], [`Reader: <b>${held}</b> of 12`, `\\(K_{${kk}}\\): <b>${held}</b> of 12`], [`<b>${held}</b> of 12`, `<b>${held}</b> of 12`], [`<b>${held}</b>/12`, `<b>${held}</b>/12`]];
      const fits = f => { ruler.innerHTML = levelNow() === 'expert' ? f[1].replace(/\\\(|\\\)|[{}_]/g, '') : f[0]; return ruler.offsetWidth <= rw - 6; };   // the longest wording that fits the room is used
      const form = forms.find(fits) || forms[3], key = form.join('|');
      if (eyeR.dataset.k !== key) { eyeR.dataset.k = key; eyeR.innerHTML = markTwo(form[0], form[1]); }
      const ns = slidesOf(P.seq).length, np = pagesOf(P.seq).length, small = tiny() || narrow();
      eyeM.textContent = p < 2 || !n ? '' : p <= 3 ? `${small ? '' : 'The sequence · '}${num(n)} record${n > 1 ? 's' : ''}` : S.form === 'talk' ? `${small ? '' : 'A talk · '}${num(ns)} slide${ns > 1 ? 's' : ''}` : `${small ? '' : 'A paper · '}${num(np)} page${np > 1 ? 's' : ''}`;
      eyeM.style.top = zz.m && narrow() && !tiny() && p >= 4 ? f1(zz.m[1] - 19 * U) + 'px' : '';
      root.dataset.phase = p; say();
      if (window.EigenLevel) window.EigenLevel.typeset(root);
      dirty = true;
    }
    function say() {
      const who = whoIs(S), n = P.seq.length, p = S.phase, k = P.seq.filter(id => S.got.has(id)).length, held = ALL.filter(heldNow).length, res = names(ORDER.filter(id => S.results.has(id)));
      const opens = P.opens === 'F' ? 'the figure' : 'the idea';
      let a, b;
      if (S.note && performance.now() < S.note.until) { a = S.note.a; b = S.note.b; }
      else if (S.hot) {
        const r = REC[S.hot], nd = P.need(S.hot), me = cap(names([S.hot]));
        a = nd.length ? `${me} needs ${names(nd)}.` : P.opens === S.hot && S.hot !== 'I' ? `${me} is shown to this reader first.` : `${me} needs nothing before it.`; b = a + (r.eq ? ` \\(${r.eq}\\)` : '');
      } else if (p === 0) {
        a = 'The object holds twelve records and thirteen links. Press a record to choose what a paper should convey.'; b = 'The object has \\(|R| = 12\\) records and thirteen links. Press a record to change the result \\(T\\).';
      } else if (!n) {
        a = b = `${who} already holds ${res}, so there is nothing left to convey.`;
      } else if (p === 1) {
        a = `${who} holds ${S.holds.size ? num(S.holds.size) : 'none'} of the twelve records, and to reach ${res} ${num(n)} must be supplied. Press a record on the right to change what this reader knows.`;
        b = `Here \\(|K_0| = ${S.holds.size}\\), and to reach \\(T\\) ${num(n)} records must be conveyed. Press a record on the right to change \\(K_0\\).`;
      } else if (p === 2) {
        const then = P.opens === 'F' && 'I' in P.pos ? ', then the idea,' : '';
        a = `These ${num(n)} records are in an order ${who.toLowerCase()} can follow, which opens on ${opens}. Press one to read as far as it.`;
        b = (P.ways > 1 ? `This is one of ${num(P.ways)} orders that open on ${opens}${then} and respect every link, and none has links that span less (${P.span} in all).` : `This is the only order that opens on ${opens}${then} and respects every link; its links span ${P.span} in all.`) + ' Press a record to read as far as it.';
      } else if (p === 3) {
        a = k < n ? `${k ? cap(num(k)) : 'None'} of the ${num(n)} ${k < 2 ? 'has' : 'have'} been read${k ? '' : ' yet'}, and the reader ${k ? 'now ' : ''}holds ${held ? num(held) : 'none'} of the twelve records.`
          : `${n === 1 ? 'The one record has' : n === 2 ? 'Both have' : `All ${num(n)} have`} been read. The reader now holds ${res}, with everything ${S.results.size > 1 ? 'they rest' : 'it rests'} on.`;
        b = k < n ? `The state \\(K_{${k}}\\) holds ${held} of the 12 records, and the next step is \\(K_{${k + 1}} = K_{${k}} \\cup \\{r_{${k + 1}}\\}\\).` : `After ${num(n)} transition${n > 1 ? 's' : ''} the state holds the result: \\(T \\subseteq K_{${n}}\\).`;
      } else if (S.form === 'talk') {
        const ns = slidesOf(P.seq).length; a = b = `As a talk for ${who.toLowerCase()} it takes ${num(ns)} slide${ns > 1 ? 's' : ''}, which hold the ${num(n)} record${n > 1 ? 's' : ''} in the same order.`;
      } else {
        const np = pagesOf(P.seq).length, nc = P.cites.length; a = b = `As a paper for ${who.toLowerCase()} it takes ${num(n)} paragraph${n > 1 ? 's' : ''} on ${num(np)} page${np > 1 ? 's' : ''}, with ${nc ? num(nc) : 'no'} reference${nc === 1 ? '' : 's'}.`;
      }
      const html = markTwo(a, b);
      if (statusEl.dataset.h !== html) { statusEl.dataset.h = html; statusEl.innerHTML = html; }
    }
    function note(a, b = a) { S.note = { a, b, until: performance.now() + 2600 }; clearTimeout(note.t); note.t = setTimeout(() => { if (!dead) paint(); }, 2650); paint(); }

    /* ---- reading: the place in the sequence, and what each record read does to the reader ---- */
    function setRead(k, quiet) {                                      // the reader has read the first k records
      const n = P.seq.length; k = clamp(k, 0, n); S.got.clear();
      for (let i = 0; i < k; i++) S.got.add(P.seq[i]);
      S.read = k; if (quiet && Z.ca.v < .05) Z.cur.snap(Math.max(0, k - 1));            // the reading window is moved at once only while it cannot be seen
    }
    function arrive(id) { if (!S.got.has(id)) { S.got.add(id); paint(); } rtiles[id].classList.remove('is-flash'); void rtiles[id].offsetWidth; rtiles[id].classList.add('is-flash'); }
    function send(id, delay = 0) {                                    // a record read: a light runs from its row to its place in the reader
      const c = cards[id];
      if (M.off) return arrive(id);
      pulses.push({ n: ++pulseN, t0: performance.now() + delay, dur: 430, from: () => [c.x.v + c.w.v, c.y.v + c.h.v / 2], to: () => rAt(id), done: () => arrive(id), el: sv('circle', { class: 'egj-pulse', r: 3.4 }, q('.egj-pulses')) });
    }
    function clearPulses() { pulses.forEach(p => p.el.remove()); pulses.length = 0; }
    function play() { clearPulses(); S.got.clear(); S.read = 0; if (Z.ca.v < .05) Z.cur.snap(0); S.playing = P.seq.length > 0; playT = performance.now() + (M.off ? 0 : 420); if (M.off) { setRead(P.seq.length, true); S.playing = false; } }

    /* ---- moving between states ---- */
    const notify = i => { try { opts.onStep && opts.onStep(i); } catch (e) {} host.dispatchEvent(new CustomEvent('eg-step', { bubbles: true, detail: { node: 'reading', i } })); };
    const tell = i => { if (cur !== i) { cur = i; notify(i); } };
    function recompute() { P = project(S.holds, S.results, S.first); }
    function show(p, o = {}) {                                         // put the stage in phase p
      const was = S.phase; S.phase = p; S.playing = false; S.pin = null; clearPulses();
      if (p <= 2) setRead(0, true); else if (p >= 4) { S.form = p === 4 ? 'paper' : 'talk'; setRead(P.seq.length, true); }
      if (p < 4 && was >= 4) S.form = null;
      if (p === 3) play();
      retarget(o.stagger !== false); paint();
    }
    function again() {                                                 // the step already showing is pressed: show it happening once more
      if (S.phase === 3) { play(); paint(); return; }
      root.classList.remove('is-again'); void root.offsetWidth; root.classList.add('is-again');
      if (S.phase >= 2) { retarget(true); const now = performance.now(); P.seq.forEach((id, k) => { const c = cards[id]; c.hold = now + k * 55; if (!M.off) { c.y.s -= 140; } }); }
    }
    function changed() {                                               // the reader or the result has changed: the same phase, a new projection
      recompute(); clearPulses();
      if (S.phase === 0) { S.phase = 1; tell(1); }
      if (S.phase === 3) play(); else if (S.phase >= 4) setRead(P.seq.length, true); else setRead(0, true);
      retarget(true); paint();
    }
    function step(i) {
      stopAuto();
      if (i === 6) {                                                   // another reader: the next audience, straightened and then read
        const next = AUD[(audOf(S) + 1) % AUD.length];
        S.holds = new Set(next.holds); S.first = next.first; S.note = null; cur = 6; recompute(); show(2);
        clearTimeout(step.t); step.t = setTimeout(() => { if (cur === 6 && S.phase === 2 && !dead) { S.phase = 3; play(); retarget(false); paint(); } }, M.off ? 0 : 1250);
        return;
      }
      clearTimeout(step.t);
      if (i === cur && S.phase === Math.min(i, 5)) return again();
      cur = i; show(clamp(i, 0, 5));
    }

    /* ---- the reader's own hands ---- */
    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
      stopAuto(); clearTimeout(step.t);
      if (b.dataset.aud != null) { const a = AUD[+b.dataset.aud]; S.holds = new Set(a.holds); S.first = a.first; S.note = null; changed(); return; }
      if (b.dataset.form) { const p = b.dataset.form === 'paper' ? 4 : 5; if (S.phase === p) return again(); tell(p); show(p); return; }
      const id = b.dataset.id; if (!id) return;
      if (b.classList.contains('egj-card')) {                          // read as far as this record
        const k = P.pos[id]; if (k == null) return;
        if (S.phase >= 4) { S.pin = S.hot = id; paint(); return; }                    // on a page or a slide a record is pointed out, and stays pointed out; the form is kept
        if (S.phase !== 3) { S.phase = 3; tell(3); }
        S.playing = false; clearPulses();
        const before = new Set(S.got), list = P.seq.slice(0, k + 1);
        S.got = new Set(list.filter(x => before.has(x))); S.read = k + 1;             // what was read stays; what is new arrives by a light; what lies beyond is given up
        let late = 0; list.forEach(r => { if (!before.has(r)) send(r, late++ * 70); });
        retarget(false); paint(); return;
      }
      if (b.dataset.side === 'r') { if (S.holds.has(id)) S.holds.delete(id); else S.holds.add(id); changed(); return; }
      if (S.results.has(id) && S.results.size === 1) { b.classList.remove('is-no'); void b.offsetWidth; b.classList.add('is-no'); note('A paper has to convey something. Another result must be chosen before this one is removed.', 'The result \\(T\\) cannot be empty. Another record must be added to it before this one is removed.'); return; }
      const adding = !S.results.has(id), before = P.seq.join();
      if (adding) S.results.add(id); else S.results.delete(id);
      changed();
      if (adding && P.seq.join() === before) note(`${whoIs(S)} already holds ${names([id])}, so the sequence does not change.`, `Here ${names([id])} is already in \\(K_0\\), so the sequence does not change.`);
    });
    const hot = id => { id = id || S.pin; if (S.hot === id) return; S.hot = id; paint(); };
    root.addEventListener('pointerover', e => { const t = e.target.closest('[data-id]'); if (t && e.pointerType !== 'touch') hot(t.dataset.id); });
    root.addEventListener('pointerout', e => { const t = e.target.closest('[data-id]'); if (t && (!e.relatedTarget || !t.contains(e.relatedTarget))) hot(null); });
    root.addEventListener('focusin', e => { const t = e.target.closest('[data-id]'); if (t && t.matches(':focus-visible')) hot(t.dataset.id); });
    root.addEventListener('focusout', () => hot(null));

    /* ---- left alone, it shows itself once ---- */
    function stopAuto() { autoOn = false; clearTimeout(auto); }
    function runAuto() { if (!autoOn || dead) return; const nx = cur + 1; if (nx > 6) { autoOn = false; return; } step(nx); autoOn = true; notify(nx); auto = setTimeout(runAuto, nx === 3 || nx === 6 ? 5200 : 3400); }
    const io = 'IntersectionObserver' in window && opts.autoplay !== false ? new IntersectionObserver(es => { if (es.some(x => x.isIntersecting) && !io.done) { io.done = true; io.disconnect(); autoOn = true; auto = setTimeout(runAuto, 2600); } }, { threshold: .5 }) : null;
    if (io) io.observe(root);

    /* ---- drawing ---- */
    const linkPath = (a, b, bow, sa, sb) => {                         // from the edge of one tile to the edge of another, bowed
      const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, ra = sa * .56, rb = sb * .56;
      const x1 = a[0] + ux * ra, y1 = a[1] + uy * ra, x2 = b[0] - ux * rb, y2 = b[1] - uy * rb, mx = (x1 + x2) / 2 - uy * d * bow, my = (y1 + y2) / 2 + ux * d * bow;
      return `M${f1(x1)} ${f1(y1)}Q${f1(mx)} ${f1(my)} ${f1(x2)} ${f1(y2)}`;
    };
    const put = (el, x, y, w, h) => { el.style.transform = `translate(${f1(x)}px,${f1(y)}px)`; el.style.width = f1(w) + 'px'; el.style.height = f1(h) + 'px'; };
    function draw(now) {
      const os = tsize(Z.ow.v, Z.oh.v), rs = tsize(Z.rw.v, Z.rh.v), ra = Z.ra.v, O = {}, R = {};
      ALL.forEach(id => {
        const a = O[id] = oAt(id), b = R[id] = rAt(id);
        tiles[id].style.transform = `translate(${f1(a[0] - 22)}px,${f1(a[1] - 22)}px) scale(${(a[2] / 44).toFixed(3)})`; tiles[id].style.setProperty('--k', (44 / a[2]).toFixed(2));
        rtiles[id].style.transform = `translate(${f1(b[0] - 22)}px,${f1(b[1] - 22)}px) scale(${(b[2] / 44).toFixed(3)})`; rtiles[id].style.setProperty('--k', (44 / b[2]).toFixed(2));
        rtiles[id].style.opacity = ra.toFixed(3); rtiles[id].style.setProperty('--f', fill[id].v.toFixed(3));
        rtiles[id].style.pointerEvents = ra > .5 ? '' : 'none';
        const nm = namesEl[id], na = Z.na.v;
        if (na > .01) { nm.style.opacity = na.toFixed(3); nm.style.transform = NM === 'beside' ? `translate(${f1(a[0] + a[2] * .58)}px,${f1(a[1])}px) translateY(-50%)` : `translate(${f1(a[0])}px,${f1(a[1] + a[2] * .6)}px) translateX(-50%)`; nm.style.width = f1(nameW(Z.ow.v)) + 'px'; } else if (nm.style.opacity !== '0') nm.style.opacity = '0';
      });
      lo.forEach(({ l, el }) => el.setAttribute('d', linkPath(O[l[0]], O[l[1]], l[3], os, os)));
      lr.forEach(L => { const { l, el } = L, v = Math.min(fill[l[0]].v, fill[l[1]].v) * ra; el.setAttribute('d', linkPath(R[l[0]], R[l[1]], l[3], rs, rs)); el.style.opacity = (.12 * ra + .8 * v).toFixed(3); });
      frame.setAttribute('x', f1(Z.rx.v)); frame.setAttribute('y', f1(Z.ry.v - (tiny() ? 0 : 4))); frame.setAttribute('width', f1(Math.max(0, Z.rw.v))); frame.setAttribute('height', f1(Math.max(0, Z.rh.v + (tiny() ? 0 : 8)))); frame.style.opacity = (ra * .9).toFixed(3);
      eyeO.style.transform = `translate(${f1(Z.ox.v + 2)}px,${f1(Z.oy.v - (tiny() ? 1 : 7 * U))}px) translateY(-100%)`;
      eyeR.style.transform = `translate(${f1(Z.rx.v + 2)}px,${f1(Z.ry.v - (tiny() ? 1 : 7 * U))}px) translateY(-100%)`; eyeR.style.opacity = ra.toFixed(3);
      eyeR.style.width = f1(Math.max(40, Z.rw.v - 4)) + 'px'; eyeO.style.width = f1(Math.max(40, Z.ow.v - 4)) + 'px';
      const ta = Z.ta.v, active = S.hot && S.hot in P.pos ? S.hot : S.phase === 3 && S.read < P.seq.length ? P.seq[Math.min(P.seq.length - 1, Math.round(Z.cur.v))] : null;
      ORDER.forEach(id => {
        const c = cards[id], a = c.a.v;
        if (a < .01 && !c.in) { if (c.el.style.visibility !== 'hidden') { c.el.style.visibility = 'hidden'; thO[id].style.opacity = thR[id].style.opacity = 0; } return; }
        if (c.el.style.visibility) c.el.style.visibility = '';
        put(c.el, c.x.v, c.y.v, c.w.v, c.h.v); c.el.style.opacity = a.toFixed(3);
        const on = id === active ? 1 : 0, o = O[id], r = R[id], y = c.y.v + c.h.v / 2, xl = c.x.v, xr = c.x.v + c.w.v, va = ta * a;
        if (va > .01) {
          const k1 = (xl - o[0]) * .5, k2 = (r[0] - xr) * .5;
          thO[id].setAttribute('d', `M${f1(o[0] + os * .52)} ${f1(o[1])}C${f1(o[0] + k1)} ${f1(o[1])} ${f1(xl - k1)} ${f1(y)} ${f1(xl)} ${f1(y)}`);
          thR[id].setAttribute('d', `M${f1(xr)} ${f1(y)}C${f1(xr + k2)} ${f1(y)} ${f1(r[0] - k2)} ${f1(r[1])} ${f1(r[0] - rs * .52)} ${f1(r[1])}`);
          thO[id].style.opacity = (va * (on ? .95 : .1)).toFixed(3); thR[id].style.opacity = (va * (on ? .95 : .09)).toFixed(3);
        } else { thO[id].style.opacity = thR[id].style.opacity = 0; }
      });
      arcEls.forEach((A, i) => {
        const arc = P.arcs[i];
        if (!arc || A.a.v < .01) { A.el.style.opacity = 0; return; }
        const u = cards[arc[0]], v = cards[arc[1]], x = v.x.v - 3, y1 = v.y.v + v.h.v * .5, y2 = u.y.v + u.h.v * .5, sp = Math.abs(P.pos[arc[1]] - P.pos[arc[0]]), bx = clamp(6 + sp * 7, 9, Math.max(10, v.x.v - (Z.ox.v + Z.ow.v) - 4));
        A.el.setAttribute('d', `M${f1(x)} ${f1(y1 - 3)}C${f1(x - bx)} ${f1(y1 - 3)} ${f1(x - bx)} ${f1(y2 + 3)} ${f1(x)} ${f1(y2 + 3)}`);
        const hotArc = active && (arc[1] === active); A.el.classList.toggle('is-hot', !!hotArc);
        A.el.style.opacity = (A.a.v * Math.min(u.a.v, v.a.v) * (hotArc ? 1 : .6)).toFixed(3);
      });
      [...sheets, ...frames].forEach(s => { if (s.a.v < .01) { if (s.el.style.opacity !== '0') s.el.style.opacity = '0'; return; } put(s.el, s.x.v, s.y.v, s.w.v, s.h.v); s.el.style.opacity = s.a.v.toFixed(3); });
      const ca = Z.ca.v, n = P.seq.length;
      if (ca > .01 && n) {                                              // the place the reader has reached: a window that slides down the line
        put(cursor, Z.cx.v - 3, Z.cy.v - 3, Z.cw.v + 6, Z.ch.v + 6); cursor.style.opacity = ca.toFixed(3);
      } else cursor.style.opacity = 0;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], u = (now - p.t0) / p.dur;
        if (u < 0) { p.el.style.opacity = 0; continue; }
        if (u >= 1) { p.el.remove(); pulses.splice(i, 1); p.done(); continue; }
        const a = p.from(), b = p.to(), e = smooth(u), k = (b[0] - a[0]) * .5, v = 1 - e;
        const x = v * v * v * a[0] + 3 * v * v * e * (a[0] + k) + 3 * v * e * e * (b[0] - k) + e * e * e * b[0], y = v * v * v * a[1] + 3 * v * v * e * a[1] + 3 * v * e * e * b[1] + e * e * e * b[1];
        p.el.setAttribute('cx', f1(x)); p.el.setAttribute('cy', f1(y)); p.el.style.opacity = Math.min(1, u * 6, (1 - u) * 5).toFixed(2);
      }
    }
    function tick(now) {
      if (dead) return; raf = requestAnimationFrame(tick);
      if (!W || !H) return;
      const dt = Math.min(.05, (now - (lastT || now)) / 1000); lastT = now;
      if (S.playing && now >= playT) {                                 // reading advances at a steady pace, a record at a time
        const n = P.seq.length, before = Math.floor(S.read + 1e-6);
        S.read = Math.min(n, S.read + dt * Math.max(2.3, n / 3.1));
        const after = Math.floor(S.read + 1e-6);
        for (let k = before; k < after; k++) send(P.seq[k]);
        if (after !== before) paint();
        if (S.read >= n) { S.playing = false; Z.ca.to(0); }
        dirty = true;
      }
      Z.cur.to(clamp(S.playing ? S.read - .15 : Math.floor(S.read + 1e-6) - 1, 0, Math.max(0, P.seq.length - 1)));
      if (P.seq.length && cards[P.seq[0]].goal && cards[P.seq[0]].goal[4] === 'row') {   // the window follows the places of the rows, never a row that is still on its way
        const n = P.seq.length, f = clamp(Z.cur.v, 0, n - 1), i0 = Math.floor(f), u = smooth(f - i0), A = cards[P.seq[i0]].goal, B = cards[P.seq[Math.min(n - 1, i0 + 1)]].goal;
        if (A && B) { const t = [mix(A[0], B[0], u), mix(A[1], B[1], u), mix(A[2], B[2], u), mix(A[3], B[3], u)]; if (Z.ca.v < .03) { Z.cx.snap(t[0]); Z.cy.snap(t[1]); Z.cw.snap(t[2]); Z.ch.snap(t[3]); } else { Z.cx.to(t[0]); Z.cy.to(t[1]); Z.cw.to(t[2]); Z.ch.to(t[3]); } }
      }
      ORDER.forEach(id => {                                            // a record in the sequence goes to its place; one that is not goes home to the object
        const c = cards[id]; if (now < c.hold) return;
        if (c.goal) { c.x.to(c.goal[0]); c.y.to(c.goal[1]); c.w.to(c.goal[2]); c.h.to(c.goal[3]); c.a.to(1); }
        else { const o = oAt(id); c.x.to(o[0] - o[2] / 2); c.y.to(o[1] - o[2] / 2); c.w.to(o[2]); c.h.to(o[2]); c.a.to(0); }
      });
      let moving = pulses.length > 0 || dirty;
      const all = [Z.ox, Z.oy, Z.ow, Z.oh, Z.rx, Z.ry, Z.rw, Z.rh, Z.ra, Z.na, Z.ta, Z.ca, Z.cur, Z.cx, Z.cy, Z.cw, Z.ch];
      for (let left = dt; left > 1e-5; left -= .008) {
        const h = Math.min(.008, left);
        all.forEach(s => { if (s.step(h)) moving = true; });
        ALL.forEach(id => { if (fill[id].step(h)) moving = true; });
        ORDER.forEach(id => { const c = cards[id]; if (c.x.step(h) | c.y.step(h) | c.w.step(h) | c.h.step(h) | c.a.step(h)) moving = true; });
        lr.forEach(L => L.a.step(h)); arcEls.forEach(A => { if (A.a.step(h)) moving = true; });
        [...sheets, ...frames].forEach(s => { if (s.x.step(h) | s.y.step(h) | s.w.step(h) | s.h.step(h) | s.a.step(h)) moving = true; });
        if (M.off) break;
      }
      if (ORDER.some(id => now < cards[id].hold && cards[id].hold - now < 2000)) moving = true;
      if (moving) { dirty = false; draw(now); }
    }
    function measure() {
      const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h || (w === W && h === H)) return;
      W = w; H = h; U = clamp((parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16, 1, 2);
      wires.setAttribute('viewBox', `0 0 ${W} ${H}`); root.classList.toggle('egj-tiny', tiny()); root.classList.toggle('egj-narrow', narrow()); root.classList.toggle('egj-wide', W >= 880 * U);
      retarget(false); if (!first) paint();
      if (first) {                                                     // the first picture is placed, never flown in from a corner
        first = false; Object.values(Z).forEach(s => s.snap(s.g));
        ORDER.forEach(id => { const c = cards[id], o = oAt(id); c.x.snap(o[0] - o[2] / 2); c.y.snap(o[1] - o[2] / 2); c.w.snap(o[2]); c.h.snap(o[2]); });
      }
      dirty = true;
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(stage); else window.addEventListener('resize', measure);
    const onLevel = () => { paint(); };
    window.addEventListener('eigen-level', onLevel);
    measure(); paint(); raf = requestAnimationFrame(tick);

    return {
      step, state: S, get projection() { return P; },
      snapshot() {                                                     // for tests: where everything is, and whether every link is still attached
        const os = tsize(Z.ow.v, Z.oh.v), pts = {}; ALL.forEach(id => { pts['o:' + id] = oAt(id).slice(0, 2); pts['r:' + id] = rAt(id).slice(0, 2); });
        ORDER.forEach(id => { const c = cards[id]; if (c.a.v > .05) pts['c:' + id] = [c.x.v + c.w.v / 2, c.y.v + c.h.v / 2]; });
        if (Z.ca.v > .05 && P.seq.length) pts.cursor = [Z.cx.v, Z.cy.v];
        pulses.forEach(p => { if (p.el.getAttribute('cx') && +p.el.style.opacity > .05) pts['p' + p.n] = [+p.el.getAttribute('cx'), +p.el.getAttribute('cy')]; });
        let gap = 0; ORDER.forEach(id => { const c = cards[id]; if (c.a.v * Z.ta.v < .05) return; const d = thO[id].getAttribute('d') || '', m = d.match(/M([\d.-]+) ([\d.-]+).* ([\d.-]+) ([\d.-]+)$/); if (!m) return; const o = oAt(id); gap = Math.max(gap, Math.abs(+m[1] - (o[0] + os * .52)), Math.abs(+m[2] - o[1]), Math.abs(+m[3] - c.x.v), Math.abs(+m[4] - (c.y.v + c.h.v / 2))); });
        return { pts, gap, phase: S.phase, seq: P.seq.slice(), read: S.read, held: ALL.filter(heldNow) };
      },
      destroy() { dead = true; cancelAnimationFrame(raf); stopAuto(); clearTimeout(step.t); if (ro) ro.disconnect(); if (io) io.disconnect(); window.removeEventListener('eigen-level', onLevel); root.remove(); }
    };
  }

  /* ================================================================================================================
     The card: a graph has many orders hidden in it. A path winds through its records; the graph straightens along that
     path into a line and a light runs it; it returns, and straightens along another. One loop, no seam.
     ================================================================================================================ */
  function art(svg) {
    svg.classList.add('egj-art');
    const G = [[206, 30], [128, 62], [286, 58], [352, 30], [232, 104], [150, 128], [318, 112], [366, 78], [84, 104], [262, 150], [196, 76]];   // the graph
    const E = [[0, 1], [0, 2], [2, 3], [2, 4], [4, 5], [4, 6], [6, 7], [3, 7], [1, 5], [1, 8], [5, 8], [4, 9], [6, 9], [0, 10], [10, 4], [10, 1]];
    const ORD = [[8, 1, 5, 10, 0, 4, 9, 2, 6, 7, 3], [8, 5, 0, 9, 6, 3, 1, 10, 4, 2, 7]], N = G.length, X0 = 40, DX = 32, YL = 132;
    const line = o => { const p = []; ORD[o].forEach((n, k) => { p[n] = [X0 + k * DX, YL]; }); return p; };
    const LN = [line(0), line(1)], period = 18;
    const g = sv('g', {}, svg);
    const links = sv('path', { class: 'egj-art-link' }, g);            // every link in one path: fewer writes each frame, and one region to repaint
    const path = [0, 1].map(() => sv('path', { class: 'egj-art-path' }, g));
    const glow = sv('path', { class: 'egj-art-glow' }, g), wake = sv('path', { class: 'egj-art-wake' }, g), tip = sv('circle', { class: 'egj-art-tip', r: 3.6 }, g);   // the glow is a wider stroke: a filter fails on a perfectly level line
    const nodes = G.map((_, i) => sv(i % 4 === 2 ? 'rect' : 'circle', { class: 'egj-art-node' + (i % 3 === 0 ? ' f' : '') }, g));
    const ramp = (w, a, b) => smooth(clamp((w - a) / (b - a)));
    const along = (pts, u) => {                                      // the point a fraction u of the way along a polyline
      let tot = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
      let d = clamp(u) * tot; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const f = seg[i] ? Math.min(1, d / seg[i]) : 0; return [mix(pts[i][0], pts[i + 1][0], f), mix(pts[i][1], pts[i + 1][1], f)]; } d -= seg[i]; }
      return pts[0];
    };
    const curve = pts => {                                           // a smooth line through the points, in order
      let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
      for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], t = .19; d += `C${f1(p1[0] + (p2[0] - p0[0]) * t)} ${f1(p1[1] + (p2[1] - p0[1]) * t)} ${f1(p2[0] - (p3[0] - p1[0]) * t)} ${f1(p2[1] - (p3[1] - p1[1]) * t)} ${f1(p2[0])} ${f1(p2[1])}`; }
      return d;
    };
    function tick(t) {
      if (M.off) t = period * .29;
      const w = (t / period) % 1, half = w < .5 ? 0 : 1, v = (w - half * .5) * 2;          // v runs 0 to 1 within each half: one order each
      const s = ramp(v, .12, .4) * (1 - ramp(v, .7, .98)), show = ramp(v, .02, .12) * (1 - ramp(v, .9, .99));
      const P = G.map((p, i) => { const b = Math.sin(t * .5 + i * 1.7) * 2.2 * (1 - s), c = Math.cos(t * .43 + i * 2.3) * 2.2 * (1 - s); return [mix(p[0], LN[half][i][0], s) + b, mix(p[1], LN[half][i][1], s) + c]; });
      let ld = '';
      E.forEach(([a, b]) => {
        const A = P[a], B = P[b], d = Math.hypot(B[0] - A[0], B[1] - A[1]), bow = s * Math.min(128, d * .62);   // straightened, every link arches over the line
        ld += `M${f1(A[0])} ${f1(A[1])}C${f1(A[0])} ${f1(A[1] - bow)} ${f1(B[0])} ${f1(B[1] - bow)} ${f1(B[0])} ${f1(B[1])}`;
      });
      links.setAttribute('d', ld); links.style.opacity = (.42 + .2 * s).toFixed(3);
      const pts = ORD[half].map(n => P[n]);
      path[half].setAttribute('d', curve(pts)); path[half].style.opacity = (show * (.38 + .5 * s)).toFixed(3); path[1 - half].style.opacity = 0;
      const u = ramp(v, .1, .9), head = along(pts, u), tail = [];
      for (let k = 0; k <= 10; k++) tail.push(along(pts, Math.max(0, u - .2 * (k / 10))));
      const wd = 'M' + tail.map(p => `${f1(p[0])} ${f1(p[1])}`).join('L');
      wake.setAttribute('d', wd); wake.style.opacity = (show * .85).toFixed(3); glow.setAttribute('d', wd); glow.style.opacity = (show * .22).toFixed(3);
      tip.setAttribute('cx', f1(head[0])); tip.setAttribute('cy', f1(head[1])); tip.style.opacity = show.toFixed(3);
      nodes.forEach((el, i) => {
        const k = ORD[half].indexOf(i) / (N - 1), lit = show * ramp(u, k - .05, k + .02), r = 4.6 + 1.6 * lit;
        if (el.tagName === 'rect') { el.setAttribute('x', f1(P[i][0] - r)); el.setAttribute('y', f1(P[i][1] - r)); el.setAttribute('width', f1(2 * r)); el.setAttribute('height', f1(2 * r)); el.setAttribute('rx', 1.6); }
        else { el.setAttribute('cx', f1(P[i][0])); el.setAttribute('cy', f1(P[i][1])); el.setAttribute('r', f1(r)); }
        const on = lit > .5; if (el.egOn !== on) { el.egOn = on; el.classList.toggle('is-lit', on); }
      });
    }
    tick(0);
    return { tick, destroy() { g.remove(); } };
  }

  /* ================================================================================================================
     A section for the node's own page: the switch at the head of the page is the same projection, carried out on the
     page itself. One sentence of this site is shown as it is written for each of the two readers.
     ================================================================================================================ */
  function sectionSwitch(el) {
    const box = ht('div', 'egj-sec egn-reading', el);
    const rows = [
      ['The word frequency law', 'If the cost of naming a word grows as the logarithm of its rank, and only the average cost is known, then the least-biased guess at how often each word is used is the word frequency law.',
        'Let \\(R \\ge 2\\) and \\(K(r) = \\log r\\). For \\(0 < \\ell < \\log R\\), the maximum-entropy distribution at fixed mean cost \\(\\ell\\) is \\(p(r \\mid \\lambda) = r^{-\\lambda}/Z_R(\\lambda)\\) (Theorem 5).'],
      ['A projection', 'A paper is the object set out in an order that one reader can follow from what they already know to the result.',
        'A projection is a sequence \\(r_1, \\dots, r_n\\) with \\(\\mathrm{needs}(r_i) \\subseteq K_{i-1}\\), \\(K_i = K_{i-1} \\cup \\{r_i\\}\\) and \\(T \\subseteq K_n\\).'],
    ];
    box.innerHTML = '<p class="egj-sec-lead">The switch at the head of this page sets a receiver state for the page itself. Each description is kept once, as a record with two readings, and the page is projected for whichever reader is chosen.</p>' +
      rows.map(r => `<div class="egj-sec-row"><b>${r[0]}</b><p class="egj-sec-p" data-lv="plain"><small>In plain terms</small>${r[1]}</p><p class="egj-sec-p" data-lv="expert" data-eg-math><small>With the equations</small>${r[2]}</p></div>`).join('');
    const sync = () => { const lv = levelNow(); box.querySelectorAll('.egj-sec-p').forEach(p => p.classList.toggle('is-on', p.dataset.lv === lv)); };
    const set = () => { if (window.EigenLevel && window.EigenLevel.math) box.querySelectorAll('[data-eg-math]').forEach(p => window.EigenLevel.math(p)); };   // both readings are shown here, so the mathematics is set whichever is in force
    box.addEventListener('click', e => { const p = e.target.closest('.egj-sec-p'); if (p && window.EigenLevel) window.EigenLevel.set(p.dataset.lv); });
    window.addEventListener('eigen-level', sync); sync();
    if (window.EigenLevel) set(); else { const js = document.querySelector('script[data-eg-level]'); if (js) js.addEventListener('load', set); }
    return { destroy() { window.removeEventListener('eigen-level', sync); box.remove(); } };
  }

  /* ================================================================================================================
     The node
     ================================================================================================================ */
  const node = {
    title: 'From conceptrics to papers',
    question: 'How does it become a paper or a talk?',
    line: two('A paper is the research object set out in the order one reader can follow.',
      'A paper is a projection of the object, in which its records are ordered for one receiver state.'),
    text: two('A research object is a graph, but it is read one record at a time. The right order depends on the reader, whom we describe by a <i>receiver state</i>: what they already know. A record can be read once the state holds all it needs, and reading adds to the state. A paper or a talk is a path of such steps to the result: a <i>projection</i> of the object.',
      'Let the object be a set of records \\(R\\), with \\(a \\prec b\\) when \\(b\\) needs \\(a\\). A <i>receiver state</i> is the subset \\(K \\subseteq R\\) a reader holds. A record \\(r\\) can be read when \\(\\mathrm{needs}(r) \\subseteq K\\), and reading it gives \\(K \\cup \\{r\\}\\). A <i>projection</i> for a reader \\(K_0\\) and result \\(T\\) is a sequence \\(r_1, \\dots, r_n\\) of such steps with \\(T \\subseteq K_n\\).'),
    out: [{ href: '/eigenengine/built-in-stages/', label: 'How the object is built →' }],
    art,
    exhibit: {
      steps: [
        { label: 'The object', caption: two('The object holds one result of <i>The Cost of Complexity</i>, the word frequency law, as twelve linked records. Nothing in it says which of them should be read first.',
          'The object holds the twelve records \\(R\\) behind Theorem 5 of <i>The Cost of Complexity</i>. Its links induce a partial order \\(a \\prec b\\), in which a claim follows the idea it answers and every other record follows what it rests on, and this leaves the order of reading open.') },
        { label: 'A reader', caption: two('A reader arrives knowing some of this already, and the filled records on the right are their <i>receiver state</i>. A paper has to supply the difference between the two pictures.',
          'The receiver state \\(K_0 \\subseteq R\\) is what the reader holds on arrival. For a result \\(T\\), the paper must convey every record that \\(T\\) rests on and \\(K_0\\) lacks.') },
        { label: 'A sequence', caption: two('The missing records leave the object and straighten into a line, ordered so that each needs only what the reader knows already or what came before it. Every link in the line therefore points backwards.',
          'The records to convey are put in a linear extension of \\(\\prec\\) that opens on what the reader is shown first, so that \\(\\mathrm{needs}(r_i) \\subseteq K_{i-1}\\) at every step. Of these orders we take one whose links span the least, which keeps each record close to what it rests on.') },
        { label: 'Reading', caption: two('Each record read moves the reader to a new state, and the picture on the right fills until it holds the result. A paper is this sequence of changes of state.',
          'Reading \\(r_i\\) takes the state from \\(K_{i-1}\\) to \\(K_i = K_{i-1} \\cup \\{r_i\\}\\), and the sequence ends once \\(T \\subseteq K_n\\). In a manuscript each section records the pair as its entry state and its exit state.') },
        { label: 'A paper', caption: two('Written out, the sequence becomes a manuscript, in which each record is a paragraph and a source the reader has not met is given a paragraph of background. The object is unchanged, and the next paper is drawn from the same records.',
          'Written out, each \\(r_i\\) becomes a paragraph, and the pair \\((K_{i-1}, K_i)\\) is the contract that paragraph must honour. The object \\((R, \\prec)\\) is unchanged by being read.') },
        { label: 'A talk', caption: two('When the result is to be spoken, the same sequence folds into slides. A slide holds one claim, step or figure, together with the premises, sources and runs that go with it.',
          'A talk is a coarser partition of the same linear order: a slide holds a claim, step or figure together with the premises, sources and runs that go with it. The order, and so the path through the states \\(K_i\\), is the one the paper took.') },
        { label: 'Another reader', caption: two('A reader who starts elsewhere is given a different sequence from the same object, since what they know already is left out and what they lack is supplied. A newcomer is shown the figure first, and the argument that explains it afterwards.',
          'Changing \\(K_0\\) changes the set to convey, and with it the admissible orders, while \\(R\\) stays fixed. A record shown first, as the figure is to a newcomer, is a forward use: what it rests on then follows it as its explanation.') },
      ],
      mount
    },
    sections: [{ title: 'This page, written for two readers', mount: sectionSwitch }],
    project, slidesOf, pagesOf, needsOf, audiences: AUD
  };
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.reading = node;
})();
