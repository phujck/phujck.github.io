/* What happens when something changes?   node `change`, eigenengine/revision/   (dispatch/CONTRACT.md)

   One object, fourteen records of the word frequency law in The Cost of Complexity, the same example the `build`,
   `conceptric` and `search` nodes use. Nothing on screen is scripted colour: section 1 is a small engine in which every
   record keeps a version and, for each record it was written against, the version it last read. A state is the comparison
   of the two, so every control is consistent with every other by construction and changes may overlap or be undone.

   1 the object and the engine   2 words   3 the card art   4 the exhibit   5 a section for the node's page   6 the node */
(() => {
  'use strict';
  const EM = window.EigenMotion || {}, MO = window.EG_MOTION || { off: false };
  const clamp = EM.clamp || ((v, a = 0, b = 1) => Math.max(a, Math.min(b, v)));
  const smooth = EM.smooth || (x => x * x * (3 - 2 * x));
  const two = (plain, expert) => window.EigenLevel ? window.EigenLevel.two(plain, expert) : Object.assign(new String(plain), { plain, expert });
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, at = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; };
  const H = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const NUM = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
  const num = n => NUM[n] || String(n), Num = n => num(n).replace(/^./, c => c.toUpperCase());

  /* ---- 1. the object and the engine ---------------------------------------------------------------------------- */
  const WORDS = [['rank', 'ranks'], ['position', 'positions']], SIZES = ['five hundred', 'one thousand'];
  const tok = f => `<span class="egv-tok" data-f="${f}"></span>`;
  /* id: kind, label, what it says (shown when the record comes forward), the aspects its own words carry */
  const REC = {
    T:  { k: 'term',    label: `“${tok('w')}”`, says: 'a word’s place when words are listed from the most used to the least', carries: ['word'] },
    I:  { k: 'idea',    label: 'telling things apart has a cost', carries: [] },
    C1: { k: 'claim',   label: 'forgetting costs energy', carries: [] },
    C2: { k: 'claim',   label: `cost grows as log of ${tok('w')}`, carries: ['word', 'passage'] },
    L:  { k: 'claim',   label: 'word frequency law', says: `use falls as a power of ${tok('w')}`, carries: ['word'] },
    S:  { k: 'step',    label: 'least-biased guess', carries: [] },
    P1: { k: 'premise', label: `every ${tok('w')} counted alike`, carries: ['word'] },
    P2: { k: 'premise', label: 'known average cost', carries: [] },
    SL: { k: 'source',  label: 'Landauer 1961', carries: [] },
    SM: { k: 'source',  label: 'Mandelbrot 1953', says: `the passage on what a word costs${tok('p')}`, carries: ['passage'] },
    SJ: { k: 'source',  label: 'Jaynes 1957', carries: [] },
    Rn: { k: 'run',     label: 'recorded run', says: `${tok('n')} ${tok('ws')}`, carries: ['word', 'size'] },
    F:  { k: 'figure',  label: 'Figure 6', says: `drawn against ${tok('w')}`, carries: ['word', 'size'] },
    M:  { k: 'paper',   label: 'caption of Figure\u00a06', says: `the law against ${tok('w')}, for a vocabulary of ${tok('n')} words`, carries: ['word', 'size'] }
  };
  const IDS = Object.keys(REC), KIND = { term: 'Term', idea: 'Idea', claim: 'Claim', step: 'Step', premise: 'Premise', source: 'Source', run: 'Run', figure: 'Figure', paper: 'Paper' };
  /* [the record that was written, the record it was written against, the name of the thread] */
  const LINKS = [
    ['C2', 'T', 'uses'], ['P1', 'T', 'uses'], ['L', 'T', 'uses'], ['Rn', 'T', 'uses'],
    ['I', 'C1', 'requires'], ['I', 'C2', 'requires'], ['I', 'L', 'requires'],
    ['C1', 'SL', 'supported by'], ['C2', 'SM', 'supported by'], ['S', 'SJ', 'supported by'],
    ['S', 'C2', 'requires'], ['S', 'P1', 'requires'], ['S', 'P2', 'requires'], ['L', 'S', 'requires'],
    ['Rn', 'L', 'computed by'], ['F', 'Rn', 'computed by'], ['F', 'L', 'shown by'], ['M', 'F', 'cites']
  ];
  const GROUNDS = {}, DEPS = {}; IDS.forEach(id => { GROUNDS[id] = []; DEPS[id] = []; });
  LINKS.forEach(([d, g]) => { GROUNDS[d].push(g); DEPS[g].push(d); });
  const ORIGIN = { T: 'word', SM: 'passage', Rn: 'size' };

  function Engine() {
    const E = { val: {}, rev: {}, pin: {}, why: {} };
    IDS.forEach(id => { E.val[id] = { word: 0, passage: 0, size: 0 }; E.rev[id] = 1; E.pin[id] = {}; GROUNDS[id].forEach(g => E.pin[id][g] = 1); });
    E.stale = id => GROUNDS[id].filter(g => E.pin[id][g] !== E.rev[g]);
    E.owed = id => DEPS[id].filter(d => E.pin[d][id] !== E.rev[id]);
    E.state = id => E.stale(id).length ? 'review' : E.owed(id).length ? 'changed' : 'current';
    E.settled = () => IDS.every(id => E.state(id) === 'current');
    E.pristine = () => IDS.every(id => E.rev[id] === 1);
    E.change = o => { const a = ORIGIN[o]; E.val[o][a] ^= 1; E.rev[o]++; E.why[o] = a; return a; };
    E.review = id => {                                       // read it against what it was written against, as those now stand
      const st = E.stale(id); if (!st.length) return null;
      const moved = [];
      REC[id].carries.forEach(a => { if (ORIGIN[id] === a) return; st.forEach(g => { if (REC[g].carries.includes(a) && E.val[g][a] !== E.val[id][a]) { E.val[id][a] = E.val[g][a]; if (!moved.includes(a)) moved.push(a); } }); });
      const cause = E.why[st[0]] || 'word';
      st.forEach(g => E.pin[id][g] = E.rev[g]);
      if (moved.length) { E.rev[id]++; E.why[id] = moved[0]; }
      return { changed: moved.length > 0, aspect: moved[0] || cause, moved, from: st, marks: moved.length ? DEPS[id].length : 0 };
    };
    return E;
  }
  const reach = origins => {                                 // how many reviews away each record is from the change
    const dist = {}; let q = origins.slice(); q.forEach(o => dist[o] = 0);
    while (q.length) { const nx = []; q.forEach(g => DEPS[g].forEach(d => { if (dist[d] == null) { dist[d] = dist[g] + 1; nx.push(d); } })); q = nx; }
    return dist;
  };

  /* ---- 2. words --------------------------------------------------------------------------------------------- */
  const plain = (E, id, field = 'label') => (REC[id][field] || '').replace(/<span class="egv-tok" data-f="(\w+)"><\/span>/g, (m, f) => tokText(E, id, f));
  const tokText = (E, id, f) => f === 'w' ? WORDS[E.val[id].word][0] : f === 'ws' ? WORDS[E.val[id].word][1] : f === 'n' ? SIZES[E.val[id].size] : E.val[id].passage ? ', corrected' : '';
  const named = (E, id) => ({ T: 'The term', F: 'Figure 6', M: 'The caption', Rn: 'The recorded run', SL: 'Landauer 1961', SM: 'Mandelbrot 1953', SJ: 'Jaynes 1957' })[id] || `“${plain(E, id)}”`;
  const marksTail = n => n ? `${Num(n)} record${n > 1 ? 's were' : ' was'} written against it and ${n > 1 ? 'are' : 'is'} marked in turn.` : 'Nothing was written against it, so the change stops there.';
  const said = {
    made(E, o) {
      if (o === 'T') return `The term “${WORDS[E.val.T.word ^ 1][0]}” is renamed “${WORDS[E.val.T.word][0]}”. Four records use it, and each is marked for review.`;
      if (o === 'SM') return `The passage taken from Mandelbrot 1953 is ${E.val.SM.passage ? 'corrected' : 'restored'}. One claim was written against it and is marked for review.`;
      return `The calculation is run again for ${SIZES[E.val.Rn.size]} ranks. Figure 6 is computed by it and is marked for review.`.replace('ranks', WORDS[E.val.Rn.word][1]);
    },
    head(E, id, r) {
      const n = named(E, id);
      if (r.moved && r.moved.length > 1) return `${n} carried both the old word and the old range, and is rewritten`;
      return r.aspect === 'passage' ? `${n} quoted the old passage and is restated`
        : r.aspect === 'size' ? (id === 'F' ? 'Figure 6 is drawn again from the new table' : `${n} gave the range of the figure and is rewritten`)
        : id === 'F' ? 'Figure 6 named the old word on its axis and is relabelled' : `${n} used the old word and is reworded`;
    },
    reviewed(E, id, r) {
      const n = named(E, id);
      if (r.changed) return `${said.head(E, id, r)}. ${marksTail(r.marks)}`;
      if (id === 'S' && r.aspect === 'passage') return 'The step needs only that the cost grows as a logarithm, which the restated claim still says. It stands, and the change stops there.';
      if (r.aspect === 'word' && !REC[id].carries.includes('word')) return `${n} never used the word. It is read against the new wording and still stands, so the change stops there.`;
      if (r.aspect === 'word') return `${n} already carries the new word. It still stands.`;
      return `${n} is read against the new version and still stands. The change stops there.`;
    },
    settled(E, ep) {
      const looked = ep.looked.size, ch = ep.changed.size, un = IDS.filter(id => !ep.origins.includes(id) && !ep.looked.has(id)).length;
      const first = ep.kinds.has('word') ? `Every record which carried the word ${E.val.T.word ? 'now says' : 'says'} “${WORDS[E.val.T.word][0]}”${E.val.T.word ? '' : ' again'}. ` : 'Every record is current again. ';
      const rounds = ep.mixed ? '' : ` in ${num(ep.rounds)} round${ep.rounds > 1 ? 's' : ''} of review`;
      const how = ch === 0 ? (looked === 1 ? 'it did not have to change' : 'none of them had to change') : ch === looked ? (looked === 1 ? 'it had to change' : looked === 2 ? 'both had to change' : 'each had to change') : `${num(ch)} of them had to change`;
      return `${first}${Num(looked)} record${looked > 1 ? 's were' : ' was'} looked at${rounds}; ${how}, and ${num(un)} were never disturbed.`;
    },
    /* one round of review told in a sentence, for when the records of a round are looked at together */
    round(E, done) {
      const low = t => t.replace(/^The /, 'the '), list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : a[0], cap = t => t.replace(/^./, c => c.toUpperCase());
      const ch = done.filter(d => d.r.changed), st = done.filter(d => !d.r.changed), marks = ch.reduce((n, d) => n + d.fresh, 0), parts = [];
      if (ch.length === 1) parts.push(low(said.head(E, ch[0].id, ch[0].r)));
      else if (ch.length) { const a = ch[0].r.aspect, pl = ch.length > 1, who = ch.length > 2 ? `${num(ch.length)} records` : list(ch.map(d => low(named(E, d.id))));
        parts.push(a === 'passage' ? `${who} quoted the old passage and ${pl ? 'are' : 'is'} restated` : a === 'size' ? `${who} ${pl ? 'are' : 'is'} made again from the new run` : `${who} carried the old word and ${pl ? 'are' : 'is'} reworded`); }
      if (st.length) { const pl = st.length > 1, who = st.length > 2 ? `${num(st.length)} records` : list(st.map(d => low(named(E, d.id)))); parts.push(`${who} ${pl ? 'are' : 'is'} read and left as ${pl ? 'they were' : 'it was'}`); }
      return cap(parts.join(', while ')) + '.' + (marks ? ` ${Num(marks)} record${marks > 1 ? 's' : ''} written against ${ch.length > 1 ? 'them' : 'it'} ${marks > 1 ? 'are' : 'is'} marked in turn.` : '');
    },
    rest: 'Each of these fourteen records was written against, and so rests on, the records its threads lead to. Every one of them is current.',
    waiting(n) { return `${Num(n)} record${n > 1 ? 's need' : ' needs'} review. Press ${n > 1 ? 'one' : 'it'} to look at it.`; }
  };
  const stateName = { current: 'current', review: 'needs review', changed: 'changed' };

  /* ---- 3. the card art --------------------------------------------------------------------------------------
     A field of small dials. One record changes; the needles of its neighbours turn to face it; each is looked at, and
     either turns back (the change stops) or changes too and turns its own neighbours. Three changes, three routes.
     Every quantity is a function of the time within an episode, and each episode begins and ends at rest: no seam. */
  const ART = (() => {
    const P = [[38, 63], [88, 32], [90, 95], [140, 63], [160, 27], [160, 98], [208, 45], [216, 84], [262, 26], [272, 63], [280, 99], [326, 40], [334, 86], [372, 63]];
    const Ed = [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 5], [3, 6], [3, 7], [4, 6], [5, 7], [6, 8], [6, 9], [7, 9], [7, 10], [8, 11], [9, 11], [9, 12], [10, 12], [11, 13], [12, 13]];
    const adj = P.map(() => []); Ed.forEach(([a, b], i) => { adj[a].push([b, i]); adj[b].push([a, i]); });
    const TRAVEL = .46, DWELL = .62;
    const episode = (origin, pass, len) => {                 // when each dial is reached, decided and released
      const n = P.map(() => null), e = Ed.map(() => null);
      n[origin] = { a: -1, d: .5, pass: true, parent: -1, kids: [] };
      let q = [origin];
      while (q.length) {
        const nx = [];
        q.forEach(u => adj[u].forEach(([v, ei]) => {
          if (n[v] || !n[u].pass) return;
          const a = n[u].d + TRAVEL; n[v] = { a, d: a + DWELL, pass: pass.includes(v), parent: u, kids: [] }; n[u].kids.push(v);
          e[ei] = { from: u, to: v, t0: n[u].d, t1: a, d: a + DWELL }; nx.push(v);
        }));
        q = nx;
      }
      n.forEach(s => { if (s && s.pass) s.r = (s.kids.length ? Math.max(...s.kids.map(k => n[k].d)) : s.d + .5) + .3; });
      return { n, e, len };
    };
    const EPS = [episode(0, [1, 3, 6, 9, 12], 9.4), episode(13, [11, 8], 6.4), episode(5, [7, 10], 6.8)], TOTAL = EPS.reduce((s, x) => s + x.len, 0);
    const resp = t => t <= 0 ? 0 : 1 - Math.exp(-6.2 * t) * (Math.cos(8.6 * t) + .72 * Math.sin(8.6 * t));   // a needle swinging to rest
    const up = -Math.PI / 2;
    return svg => {
      svg.innerHTML = '';
      const set = (el, k, v) => { if (el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v); } };
      const g = S('g', { fill: 'none', 'stroke-linecap': 'round' }, svg);
      const far = S('g', { opacity: .5 }, g);                    // the same field, at rest, running on down the card
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { const x = 34 + c * 68 + (r % 2 ? 32 : 0), y = 136 + r * 37, x2 = x + (r % 2 ? -34 : 34), y2 = y + 37; const d = S('circle', { cx: x, cy: y, r: 2.2 }, far); d.style.fill = 'var(--eg-line)'; if (c < 5) S('line', { x1: x, y1: y, x2: x + 68, y2: y, 'stroke-width': 1 }, far).style.stroke = 'var(--eg-line)'; if (r < 4 && x2 > 10 && x2 < 392) S('line', { x1: x, y1: y, x2, y2, 'stroke-width': 1 }, far).style.stroke = 'var(--eg-line)'; }
      [[90, 95, 102, 136], [160, 98, 170, 136], [216, 84, 238, 136], [280, 99, 306, 136], [334, 86, 374, 136], [38, 63, 34, 136]].forEach(([x1, y1, x2, y2]) => { S('line', { x1, y1, x2, y2, 'stroke-width': 1, opacity: .7 }, far).style.stroke = 'var(--eg-line)'; });
      const base = Ed.map(([a, b]) => { const l = S('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], 'stroke-width': 1.3 }, g); l.style.stroke = 'var(--eg-line)'; return l; });
      const lit = Ed.map(([a, b]) => { const l = S('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], 'stroke-width': 1.9, opacity: 0 }, g); l.style.stroke = 'var(--eg-coral)'; return l; });
      const wake = Ed.map(() => { const l = S('line', { 'stroke-width': 3.7, opacity: 0 }, g); l.style.stroke = 'var(--eg-gold)'; return l; });
      const tip = Ed.map(() => { const c = S('circle', { r: 3.9, opacity: 0 }, g); c.style.fill = 'var(--eg-ink)'; c.style.filter = 'drop-shadow(0 0 4px var(--eg-gold))'; return c; });
      const nodes = P.map(([x, y]) => {
        const k = S('g', { transform: `translate(${x} ${y})` }, g);
        const halo = S('circle', { r: 9, opacity: 0 }, k); halo.style.fill = 'var(--eg-gold)'; halo.style.filter = 'blur(5px)';
        const disc = S('circle', { r: 9 }, k); disc.style.fill = 'var(--eg-ground)';
        const ring = S('circle', { r: 9, 'stroke-width': 1.7 }, k); ring.style.stroke = 'var(--eg-faint)';
        const coral = S('circle', { r: 9, 'stroke-width': 2.1, 'stroke-dasharray': '3.4 3.2', opacity: 0 }, k); coral.style.stroke = 'var(--eg-coral)';
        const arc = S('circle', { r: 12.6, 'stroke-width': 1.5, opacity: 0, transform: 'rotate(-90)', pathLength: 100, 'stroke-dasharray': '0 100' }, k); arc.style.stroke = 'var(--eg-teal)';
        const gold = S('circle', { r: 9, 'stroke-width': 2.2, opacity: 0 }, k); gold.style.stroke = 'var(--eg-gold)'; gold.style.fill = 'color-mix(in srgb, var(--eg-gold) 34%, transparent)';
        const needle = S('line', { x1: 0, y1: 0, x2: 0, y2: -14.5, 'stroke-width': 2.3 }, k); needle.style.stroke = 'var(--eg-muted)';
        const cn = S('line', { x1: 0, y1: 0, x2: 0, y2: -14.5, 'stroke-width': 2.5, opacity: 0 }, k); cn.style.stroke = 'var(--eg-coral)';
        const dot = S('circle', { r: 2.5 }, k); dot.style.fill = 'var(--eg-muted)';
        return { halo, ring, coral, arc, gold, needle, cn, dot };
      });
      const r2 = v => Math.round(v * 100) / 100;
      const tick = t => {
        let u = ((t % TOTAL) + TOTAL) % TOTAL, ep = EPS[0];
        for (const e of EPS) { if (u < e.len) { ep = e; break; } u -= e.len; }
        ep.e.forEach((e, i) => {
          let w = 0, l = 0, lw = 0;
          if (e) {
            const p = clamp((u - e.t0) / (e.t1 - e.t0));
            if (u > e.t0 && u < e.t1 + .28) {
              const a = P[e.from], b = P[e.to], q = smooth(p), q0 = Math.max(0, q - .3);
              w = (u < e.t1 ? 1 : 1 - (u - e.t1) / .28) * clamp((u - e.t0) / .09);
              set(tip[i], 'cx', r2(a[0] + (b[0] - a[0]) * q)); set(tip[i], 'cy', r2(a[1] + (b[1] - a[1]) * q));
              set(wake[i], 'x1', r2(a[0] + (b[0] - a[0]) * q0)); set(wake[i], 'y1', r2(a[1] + (b[1] - a[1]) * q0)); set(wake[i], 'x2', r2(a[0] + (b[0] - a[0]) * q)); set(wake[i], 'y2', r2(a[1] + (b[1] - a[1]) * q));
            }
            l = clamp((u - e.t1 + .1) / .2) * (1 - clamp((u - e.d) / .45)); lw = l;
          }
          set(tip[i], 'opacity', r2(w)); set(wake[i], 'opacity', r2(w * .75)); set(lit[i], 'opacity', r2(lw * .85)); set(base[i], 'opacity', r2(1 - lw * .6));
        });
        ep.n.forEach((s, i) => {
          const N = nodes[i]; let att = 0, gold = 0, sweep = 0, tick_ = 0, ang = up + Math.sin(t * .9 + i * 1.7) * .075;
          if (s) {
            if (s.parent >= 0) {
              const to = Math.atan2(P[s.parent][1] - P[i][1], P[s.parent][0] - P[i][0]); let dl = to - up; while (dl > Math.PI) dl -= 2 * Math.PI; while (dl < -Math.PI) dl += 2 * Math.PI;
              att = u < s.d ? resp(u - s.a) : resp(s.d - s.a) * (1 - resp(u - s.d));
              ang += dl * att;
              sweep = u < s.d ? clamp((u - s.a) / (s.d - s.a)) : 1; tick_ = u < s.a ? 0 : u < s.d ? 1 : 1 - clamp((u - s.d) / .5);
            }
            if (s.pass) gold = smooth(clamp((u - s.d) / .2)) * (1 - smooth(clamp((u - s.r) / .55)));
          }
          const a = clamp(Math.abs(att)), x2 = r2(Math.cos(ang) * 14.5), y2 = r2(Math.sin(ang) * 14.5);
          set(N.needle, 'x2', x2); set(N.needle, 'y2', y2); set(N.cn, 'x2', x2); set(N.cn, 'y2', y2);
          set(N.cn, 'opacity', r2(a * (1 - gold))); set(N.needle, 'opacity', r2(1 - gold)); set(N.coral, 'opacity', r2(a * (1 - gold))); set(N.ring, 'opacity', r2(1 - Math.max(a, gold) * .8));
          set(N.gold, 'opacity', r2(gold)); set(N.halo, 'opacity', r2(gold * .55)); set(N.dot, 'opacity', r2(1 - gold * .4));
          set(N.arc, 'opacity', r2(tick_ * (s && s.pass ? 1 - gold : 1) * .9)); set(N.arc, 'stroke-dasharray', `${r2(sweep * 100)} 100`);
        });
      };
      tick(0);
      return { tick, destroy() { svg.innerHTML = ''; } };
    };
  })();

  /* ---- 4. the exhibit ------------------------------------------------------------------------------------------ */
  const GLYPH = {
    term: '<path d="M3 4.5h6.2l4 3.5-4 3.5H3z"/><circle cx="6" cy="8" r=".9"/>',
    idea: '<circle cx="8" cy="8" r="5.2"/><circle cx="8" cy="8" r="1.4" fill="currentColor"/>',
    claim: '<path d="M8 2.6 13.4 8 8 13.4 2.6 8z"/>',
    step: '<path d="M3 4.5 6.5 8 3 11.5M8.5 4.5 12 8l-3.500 3.5"/>',
    premise: '<path d="M8 3v8M3.5 12.5h9"/>',
    source: '<path d="M4 2.5h5.5L12 5v8.5H4z"/><path d="M6 7.5h4M6 10h4"/>',
    run: '<path d="M3 13V4M6.3 13V6.5M9.600 13V9M13 13v-2.500"/>',
    figure: '<path d="M3 2.500V13h10.500"/><path d="M4.500 4.500c2 4 4.500 6 8 6.500"/>',
    paper: '<rect x="3.500" y="2.500" width="9" height="11" rx="1"/><path d="M5.500 6h5M5.500 8.500h5M5.500 11h3"/>'
  };
  const ARROW = k => k === 'back' ? '<svg class="egv-arrow" viewBox="0 0 18 12" aria-hidden="true"><path d="M2 3c9-3 13 0 13 4s-5 5-9 3"/><path d="M9.500 7.200 6 10l3.800 1.900"/></svg>' : `<svg class="egv-arrow" viewBox="0 0 18 12" aria-hidden="true"><path d="M2 6h14"/><path d="M12.500 2.500 16 6l-3.500 3.500"/>${k === 'both' ? '<path d="M5.500 2.500 2 6l3.500 3.500"/>' : ''}</svg>`;
  const REST = {   // where each record sits while nothing is changing (fractions of the stage)
    T: [.105, .1], I: [.43, .1], M: [.89, .1], C1: [.105, .32], C2: [.325, .32], L: [.625, .32], F: [.89, .355], S: [.615, .535], Rn: [.89, .61],
    P1: [.43, .74], P2: [.805, .85], SL: [.105, .915], SM: [.325, .915], SJ: [.615, .915]
  };
  const RESTW = {  // the same, for a stage much wider than it is tall (inside the main page)
    T: [.085, .14], I: [.30, .13], F: [.755, .12], M: [.925, .12], L: [.565, .34], C1: [.085, .52], C2: [.265, .52], Rn: [.765, .5], S: [.6, .62],
    P1: [.43, .8], P2: [.775, .87], SL: [.085, .88], SM: [.265, .88], SJ: [.61, .93]
  };
  const RESTP = {  // the same, for a stage taller than it is wide
    T: [.19, .06], I: [.5, .06], M: [.82, .06], C1: [.19, .23], L: [.5, .23], F: [.82, .23], C2: [.19, .4], S: [.5, .4], Rn: [.82, .4],
    P1: [.3, .57], P2: [.7, .57], SL: [.19, .74], SM: [.5, .74], SJ: [.82, .74]
  };
  const ORDER = ['T', 'SL', 'SM', 'SJ', 'C1', 'C2', 'P1', 'P2', 'S', 'L', 'I', 'Rn', 'F', 'M'];

  function mount(el, opts = {}) {
    const E0 = { e: Engine() }; let E = E0.e;
    const root = H('div', 'egv egn-change' + (opts.compact ? ' egv-compact' : ''));
    root.innerHTML = `
      <div class="egv-top"><span class="egv-lead">Make a change</span><span class="egv-chips" role="group" aria-label="Make a change">
        <button type="button" data-change="T">Rename a term</button><button type="button" data-change="SM">Correct a source</button><button type="button" data-change="Rn">Rerun a calculation</button></span>
        <span class="egv-machine" role="img" aria-label="The three states of a record, and how many records are in each"><span class="egv-m" data-s="current"><i></i><b>14</b> current</span>${ARROW('both')}<span class="egv-m" data-s="review"><i></i><b>0</b> need review</span>${ARROW('one')}<span class="egv-m" data-s="changed"><i></i><b>0</b> changed</span>${ARROW('back')}</span></div>
      <div class="egv-stage"><svg class="egv-threads" aria-hidden="true"></svg><div class="egv-cols" aria-hidden="true"></div><div class="egv-cards"></div><div class="egv-names" aria-hidden="true"></div><svg class="egv-over" aria-hidden="true"></svg></div>
      <aside class="egv-panel" aria-live="polite"></aside>
      <div class="egv-bar"><p class="egv-status" aria-live="polite"></p><span class="egv-acts"><button type="button" data-act="carry">Carry it through</button><button type="button" data-act="reset">Start again</button></span></div>`;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.appendChild(root);
    const q = s => root.querySelector(s), stage = q('.egv-stage'), cardsEl = q('.egv-cards'), threads = q('.egv-threads'), over = q('.egv-over'), namesEl = q('.egv-names'), colsEl = q('.egv-cols'), status = q('.egv-status'), panel = q('.egv-panel');
    const expert = () => document.documentElement.dataset.level === 'expert';

    /* cards */
    const C = {};
    IDS.forEach(id => {
      const r = REC[id], b = H('button', 'egv-card'); b.type = 'button'; b.dataset.id = id; b.dataset.k = r.k; b.dataset.s = 'current';
      b.innerHTML = `<span class="egv-in"><span class="egv-head"><svg class="egv-gl" viewBox="0 0 16 16" aria-hidden="true">${GLYPH[r.k]}</svg><span class="egv-kind">${KIND[r.k]}</span><span class="egv-ver"></span></span>` +
        `<span class="egv-lab">${r.label}</span>${r.says ? `<span class="egv-say">${id === 'F' ? '<svg class="egv-plot" viewBox="0 0 46 28" aria-hidden="true"><path class="ax" d="M4 2v22h40"/><g class="cv"><path d="M6 5 40 14"/><path d="M6 8 40 19"/><path d="M6 12 40 23"/></g></svg>' : id === 'Rn' ? '<svg class="egv-plot" viewBox="0 0 46 28" aria-hidden="true">' + Array.from({ length: 12 }, (_, i) => `<path class="${i > 6 ? 'more' : ''}" d="M${5 + i * 3.400} 25V${(25 - 20 / (1 + i * .7)).toFixed(1)}"/>`).join('') + '</svg>' : ''}<span>${r.says}</span></span>` : ''}<span class="egv-pin"></span></span>` +
        `<svg class="egv-dial" viewBox="-13 -13 26 26" aria-hidden="true"><circle class="egv-emit" r="8"/><circle class="egv-ring" r="8"/><line class="egv-needle" x2="0" y2="-11"/><circle class="egv-dot" r="2.2"/></svg>`;
      cardsEl.appendChild(b);
      const sp = () => new EM.Spring(0, 84, 18.4);
      C[id] = { el: b, x: sp(), y: sp(), w: sp(), h: sp(), o: sp(), f: sp(), ang: -90, angV: 0, vis: 'current', pend: 0, mode: 'n', hn: 60, hf: 60, needle: b.querySelector('.egv-needle'), toks: [...b.querySelectorAll('.egv-tok')], touched: false, last: {} };
    });
    /* threads, their names and the column headings */
    const T = LINKS.map(([d, g, kind], i) => {
      const p = S('path', { class: 'egv-th', 'data-kind': kind.replace(' ', '-') }, threads), stop = S('path', { class: 'egv-stop' }, threads), name = H('span', 'egv-name', kind); namesEl.appendChild(name);
      return { d, g, kind, p, stop, name, bend: (i % 2 ? 1 : -1) * (.06 + (i % 3) * .02), route: false, stood: false, a: 0 };
    });
    const pulses = [];
    const cols = Array.from({ length: 8 }, () => { const s = H('span', 'egv-col'); colsEl.appendChild(s); return s; });
    const bands = Array.from({ length: 8 }, () => { const s = H('i', 'egv-band'); colsEl.insertBefore(s, colsEl.firstChild); return s; });
    const asideLab = H('span', 'egv-col egv-aside', 'not written against it'); colsEl.appendChild(asideLab);

    /* state of the telling */
    let held = null, gapX = [], W = 0, Hh = 0, cw = 120, fs = 12, portrait = false, low = false, mode = 'rest', ep = null, focus = null, hover = null, auto = null, clock = 0, alive = true, seen = true, lastSaid = '', flash = 0, wasSettled = true;
    const newEp = o => ({ origins: [o], looked: new Set(), changed: new Set(), kinds: new Set(), rounds: 0, mixed: false, dist: reach([o]) });
    const unsettled = () => !E.settled() || IDS.some(id => C[id].pend);
    let sayT = 0;
    const put = (node, html) => { if (node.innerHTML === html) return; if (MO.off) { node.innerHTML = html; return; } node.classList.add('egv-out'); clearTimeout(node._t); node._t = setTimeout(() => { if (!alive) return; node.innerHTML = html; node.classList.remove('egv-out'); }, 150); };
    let saidAt = 0, sumAt = 0, readFor = 2;
    const say = t => { lastSaid = t; saidAt = clock; readFor = Math.max(2.3, t.replace(/<[^>]+>/g, '').split(/\s+/).length * .22); if (!hover) put(status, t); };
    const announce = () => el.dispatchEvent(new CustomEvent('eigen-exhibit-change', { bubbles: true, detail: { node: 'change', text: lastSaid.replace(/<[^>]+>/g, '') } }));

    /* words inside the cards: a token is rewritten where it stands */
    function setTok(span, text, animate) {
      if (span.dataset.v === text) return;
      const old = span.dataset.v; span.dataset.v = text;
      if (!animate || MO.off || old == null) { span.textContent = text; return; }
      const a = H('span', 'egv-old', old), b = H('span', 'egv-new', text); span.textContent = ''; span.append(a, b);
      const wa = a.getBoundingClientRect().width; b.style.maxWidth = 'none'; const wb = b.getBoundingClientRect().width; b.style.maxWidth = '0px'; a.style.maxWidth = wa + 'px';
      void b.offsetWidth; a.style.maxWidth = '0px'; a.style.opacity = 0; b.style.maxWidth = Math.ceil(wb + 1) + 'px'; b.style.opacity = 1;
      const token = text; setTimeout(() => { if (span.dataset.v === token && alive) { span.textContent = token; span.classList.add('egv-fresh'); setTimeout(() => span.classList.remove('egv-fresh'), 1500); measure(); layout(); } }, 520);
      setTimeout(() => { if (alive) { measure(); layout(); } }, 60);
    }
    function paintCard(id, animate) {
      const c = C[id], r = REC[id];
      c.toks.forEach(sp => {
        const f = sp.dataset.f; setTok(sp, tokText(E, id, f), animate);
        const behind = (f === 'w' || f === 'ws') ? E.val[id].word !== E.val.T.word : f === 'n' ? E.val[id].size !== E.val.Rn.size : false;
        sp.classList.toggle('egv-behind', behind);
      });
      c.el.dataset.size = E.val[id].size ? '1' : '0';
      const v = c.el.querySelector('.egv-ver'); v.textContent = 'v' + E.rev[id]; v.classList.toggle('on', E.rev[id] > 1);
      const st = E.stale(id), pin = c.el.querySelector('.egv-pin');
      pin.textContent = st.length ? `read ${named(E, st[0]).replace(/^The /, 'the ')} at v${E.pin[id][st[0]]}; it is now v${E.rev[st[0]]}` : '';
      c.el.setAttribute('aria-label', `${KIND[r.k]}: ${plain(E, id)}. ${stateName[c.vis]}${c.vis === 'review' ? '. Press to review it' : ''}`);
    }
    function setVis(id, s) {
      const c = C[id]; if (c.vis === s) return;
      c.vis = s; c.el.dataset.s = s; if (s !== 'current') c.touched = true;
      paintCard(id, true);
    }
    function counts() {
      const n = { current: 0, review: 0, changed: 0 }; IDS.forEach(id => n[C[id].vis]++);
      root.querySelectorAll('.egv-m').forEach(m => { const b = m.querySelector('b'), v = String(n[m.dataset.s]); if (b.textContent !== v) { b.textContent = v; m.classList.remove('egv-tick'); void m.offsetWidth; m.classList.add('egv-tick'); } m.classList.toggle('on', n[m.dataset.s] > 0 && m.dataset.s !== 'current'); const fid = focus || hover; m.classList.toggle('at', !!fid && C[fid].vis === m.dataset.s); });
      const fl = n.review > 0, pr = E.pristine() && mode === 'rest';
      q('[data-act="carry"]').hidden = !fl; q('[data-act="reset"]').hidden = pr;
      root.querySelectorAll('[data-change]').forEach(b => b.setAttribute('aria-pressed', ep && !wasSettled && ep.origins.includes(b.dataset.change) ? 'true' : 'false'));
    }

    /* sizes */
    function measure() {
      IDS.forEach(id => { const c = C[id], inn = c.el.firstChild, say = inn.querySelector('.egv-say'), pin = inn.querySelector('.egv-pin'); const sayH = say ? say.offsetHeight : 0, pinH = expert() && pin.textContent ? pin.offsetHeight : 0; const base = inn.offsetHeight - sayH - pin.offsetHeight; c.hn = base + 2; c.hf = base + sayH + pinH + 2; });
    }
    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      const first = !W; W = w; Hh = h; portrait = W < 560 && Hh > W * 1.02; low = Hh < 250;
      fs = clamp(9 + root.clientWidth / 170, 11.5, 20); if (low) fs = 11.5;
      root.style.fontSize = fs.toFixed(2) + 'px';
      cw = Math.round(low ? Math.min(fs * 7.8, W * .2) : Math.min(fs * 9.6, portrait ? W * .3 : W * .2)); root.style.setProperty('--egv-cw', cw + 'px');
      root.classList.toggle('egv-low', low); root.classList.toggle('egv-wide', root.clientWidth >= 940 && !opts.compact); root.classList.toggle('egv-portrait', portrait);
      threads.setAttribute('viewBox', `0 0 ${W} ${Hh}`); over.setAttribute('viewBox', `0 0 ${W} ${Hh}`);
      measure(); layout(first);
    }

    /* where everything goes. At rest the object sits as it was built. After a change it hangs from what changed, one
       column to each round of review, and what was not written against the change waits below. */
    function layout(snap) {
      if (!W) return;
      const goal = {}, fwd = id => C[id].vis === 'review' || (ep && !wasSettled && ep.origins.includes(id));
      cols.forEach(s => s.classList.remove('on')); bands.forEach(s => s.classList.remove('on', 'hot')); asideLab.classList.remove('on');
      if (mode === 'rest' || !ep) {
        const R = portrait ? RESTP : Hh < 340 && W > Hh * 2.1 ? RESTW : REST, padY = low ? 4 : 8;
        IDS.forEach(id => { const m = low ? 't' : fwd(id) ? 'f' : 'n'; goal[id] = { x: clamp(R[id][0] * W, cw / 2 + 3, W - cw / 2 - 3), y: padY + R[id][1] * (Hh - 2 * padY), m }; });
      } else {
        const dist = ep.dist, inC = IDS.filter(id => dist[id] != null), out = ORDER.filter(id => dist[id] == null), K = Math.max(...inC.map(id => dist[id])) + 1;
        const next = id => GROUNDS[id].some(g => C[g].vis !== 'current' || C[g].pend);
        const modeOf = id => fwd(id) ? 'f' : low ? 't' : (C[id].touched || next(id) || ep.origins.includes(id)) ? 'n' : 't';
        const head = low ? 0 : fs * 1.5, asideH = out.length ? fs * (low ? 2.3 : 2.9) : 0, chip = fs * 2.5, gapMin = low ? 2 : 6;
        const a0 = portrait ? 0 : head, len = (portrait ? W : Hh - head - asideH) - 8;     // room along a column
        const groups = Array.from({ length: K }, (_, c) => ORDER.filter(id => dist[id] === c));
        const plan = groups.map(ids => {                       // pack a column; split it in two or three if it is too tall
          const ms = ids.map(modeOf), sz = ids.map((id, i) => ms[i] === 't' ? chip : portrait ? cw : ms[i] === 'f' ? C[id].hf : C[id].hn);
          const big = Math.max(...sz, 1), fit = Math.max(1, Math.floor((len + gapMin) / (big + gapMin))), sub = Math.min(4, Math.max(1, Math.ceil(ids.length / fit)));
          const thick = ids.map((id, i) => ms[i] === 't' ? chip : portrait ? (ms[i] === 'f' ? C[id].hf : C[id].hn) : cw), per = Math.ceil(ids.length / sub);
          const lanes = Array.from({ length: sub }, (_, s) => ids.map((id, i) => i).slice(s * per, (s + 1) * per));
          return { ids, ms, sz, lanes, thick: lanes.map(l => Math.max(...l.map(i => thick[i]), 0)), hot: ms.includes('f') };
        });
        const lead = plan.map((p, c) => low ? 0 : portrait ? fs * 1.6 : c && p.ids.some(id => C[id].vis === 'review') ? fs * 4.2 : 0);
        const need = plan.map((p, c) => p.thick.reduce((s, v) => s + v + 8, 0) + (p.hot ? 14 : 6) + lead[c]), span = portrait ? Hh - asideH - 6 : W - 8, totalNeed = need.reduce((s, v) => s + v, 0);
        const spare = span - totalNeed, share = spare > 0 ? spare / K : 0, squeeze = spare < 0 ? span / totalNeed : 1;
        let at = 4; gapX = [];
        plan.forEach((p, c) => {
          const band = need[c] * squeeze + share, start = at; at += band; gapX[c] = lead[c] && c ? start + lead[c] * squeeze * .5 + (portrait ? 0 : (band - need[c] * squeeze) / 2 + 2) : null;
          let lane0 = start + lead[c] * squeeze + (portrait ? 0 : (band - lead[c] * squeeze - p.thick.reduce((s, v) => s + (v + 8) * squeeze, 0)) / 2);
          p.lanes.forEach((lane, li) => {
            const th = p.thick[li] * squeeze, tot = lane.reduce((s, i) => s + p.sz[i], 0), gap = clamp((len - tot) / (lane.length + 1), 2, fs * 2.2); let pos = a0 + 4 + (len - tot - gap * (lane.length - 1)) / 2;
            lane.forEach(i => { const along = pos + p.sz[i] / 2, across = lane0 + th / 2 + 4 * squeeze; goal[p.ids[i]] = portrait ? { x: along, y: across, m: p.ms[i] } : { x: across, y: along, m: p.ms[i] }; pos += p.sz[i] + gap; });
            lane0 += (p.thick[li] + 8) * squeeze;
          });
          if (!low) { const bd = bands[c], hot = p.ids.some(id => C[id].vis === 'review'); bd.classList.add('on'); bd.classList.toggle('hot', hot); bd.classList.toggle('src', c === 0);
            if (portrait) { bd.style.left = '3px'; bd.style.width = (W - 6) + 'px'; bd.style.top = (start + 1) + 'px'; bd.style.height = Math.max(0, band - 3) + 'px'; } else { bd.style.left = (start + 2) + 'px'; bd.style.width = Math.max(0, band - 4) + 'px'; bd.style.top = (head + 1) + 'px'; bd.style.height = Math.max(0, Hh - head - asideH - 4) + 'px'; } }
          if (!low) { const s = cols[c]; s.textContent = c === 0 ? 'the change' : K >= 6 && c >= 3 && !portrait ? String(c) : `review ${c}`; s.classList.add('on'); if (portrait) { s.style.left = '8px'; s.style.top = (start + 2) + 'px'; s.style.transform = 'none'; } else { const half = s.textContent.length * fs * .34; s.style.left = clamp(start + (band + lead[c] * squeeze) / 2, half + 4, W - half - 4) + 'px'; s.style.top = '2px'; s.style.transform = 'translateX(-50%)'; } }
        });
        const pitch = Math.min(chip * 1.35, (W - (low ? 20 : fs * 12)) / Math.max(1, out.length)), x0 = W / 2 - pitch * (out.length - 1) / 2 + (low ? 0 : fs * 5);
        out.forEach((id, i) => { goal[id] = { x: x0 + i * pitch, y: Hh - asideH / 2 - 1, m: fwd(id) ? 'f' : 't' }; });
        if (out.length && !low) { asideLab.classList.add('on'); asideLab.style.left = Math.max(4, x0 - chip * .75 - fs * 9.6) + 'px'; asideLab.style.top = (Hh - asideH / 2 - fs * .75) + 'px'; }
      }
      IDS.forEach(id => {
        const c = C[id], g = goal[id], tiny = g.m === 't', w = tiny ? fs * 2.5 : cw, h = tiny ? fs * 2.1 : g.m === 'f' ? c.hf : c.hn;
        const lift = g.m === 'f' ? 1 : 0;
        c.x.to(g.x); c.y.to(g.y); c.w.to(w); c.h.to(h); c.o.to(1); c.f.to(lift);
        if (c.mode !== g.m) { c.mode = g.m; c.el.dataset.m = g.m; }
        if (snap) { c.x.snap(g.x); c.y.snap(g.y); c.w.snap(w); c.h.snap(h); c.o.snap(1); c.f.snap(lift); }
      });
      root.dataset.mode = mode; counts(); drawPanel();
    }

    /* the side panel (wide stages): the record in focus written out, with its own three states */
    function drawPanel() {
      if (!root.classList.contains('egv-wide')) { panel.innerHTML = ''; panel.dataset.id = ''; panel.dataset.key = ''; return; }
      const id = focus || hover || (ep && !wasSettled ? (held && C[held].vis !== 'current' ? held : ep.origins[ep.origins.length - 1]) : null);
      const key = (id || '-') + '|' + IDS.map(i => C[i].vis[0] + E.rev[i]).join('') + (expert() ? 'x' : '');
      if (panel.dataset.key === key) return; panel.dataset.key = key; const sameRec = panel.dataset.id === (id || '-'); panel.dataset.id = id || '-';
      const show = html => { if (sameRec) { clearTimeout(panel._t); panel.classList.remove('egv-out'); panel.innerHTML = html; } else put(panel, html); };
      const head = (x, y, a) => `<path class="hd" d="M0 0-7 3.200-7-3.200z" transform="translate(${x} ${y}) rotate(${a})"/>`;
      const mach = s => `<svg class="egv-mach" viewBox="0 0 220 86" aria-hidden="true"><path class="ar" d="M150 36H78"/>${head(72, 36, 180)}<path class="ar" d="M146 63 172 49"/>${head(176, 47, -28)}<path class="ar" d="M48 49 74 63"/>${head(44, 47, 208)}${head(78, 65, 28)}` +
        [['current', 36, 36, 'current'], ['review', 110, 70, 'needs review'], ['changed', 184, 36, 'changed']].map(([k, x, y, t]) => `<g class="st${s === k ? ' on' : ''}" data-s="${k}"><rect x="${x - (k === 'review' ? 44 : 34)}" y="${y - 12}" width="${k === 'review' ? 88 : 68}" height="24" rx="12"/><text x="${x}" y="${y + 4}" text-anchor="middle">${t}</text></g>`).join('') + '</svg>';
      if (!id) { show(`<p class="egv-pk">Every record</p><p class="egv-pn">a machine of three states</p>${mach('current')}<p class="egv-pt">It is <b>current</b> while everything it was written against is as it last read it. When one of those changes it <b>needs review</b>. If the review alters it, or it is edited, it has <b>changed</b>, and is current again once every record written against it has been looked at.</p>`); return; }
      const r = REC[id], st = E.stale(id), owed = E.owed(id), s = C[id].vis === 'review' && !st.length ? E.state(id) : C[id].vis === 'changed' && !owed.length ? 'current' : C[id].vis;
      const why = s === 'review' ? `${named(E, st[0])}, which it was written against, has changed.` : s === 'changed' ? `${Num(owed.length)} record${owed.length > 1 ? 's' : ''} written against it ${owed.length > 1 ? 'have' : 'has'} yet to be looked at.` : 'Everything it was written against is as it last read it.';
      const row = (a, kind, b) => `<li><span>${kind}</span>${plain(E, b)}${expert() ? ` <em>v${a === id ? E.pin[id][b] : E.pin[b][id]} of v${a === id ? E.rev[b] : E.rev[id]}</em>` : ''}</li>`;
      const gs = LINKS.filter(l => l[0] === id), ds = LINKS.filter(l => l[1] === id);
      show(`<p class="egv-pk" data-k="${r.k}">${KIND[r.k]}${expert() ? ` · v${E.rev[id]}` : ''}</p><p class="egv-pn">${plain(E, id)}</p>${r.says ? `<p class="egv-pt">${plain(E, id, 'says')}</p>` : ''}${mach(s)}<p class="egv-pt"><b>${stateName[s].replace(/^./, c => c.toUpperCase())}.</b> ${why}</p>` +
        (gs.length ? `<p class="egv-ph">It was written against</p><ul>${gs.map(l => row(id, l[2], l[1])).join('')}</ul>` : '') + (ds.length ? `<p class="egv-ph">Written against it</p><ul>${ds.map(l => `<li><span>${l[2]}</span>${plain(E, l[0])}${expert() ? ` <em>v${E.pin[l[0]][id]} of v${E.rev[id]}</em>` : ''}</li>`).join('')}</ul>` : ''));
    }

    /* the acts */
    function change(o, quiet) {
      held = null; sumAt = 0;
      if (!ep || wasSettled) { ep = newEp(o); IDS.forEach(id => { C[id].touched = false; }); T.forEach(t => { t.route = t.stood = false; }); }
      else { if (!ep.origins.includes(o)) ep.origins.push(o); ep.mixed = true; ep.dist = reach(ep.origins); }
      const a = E.change(o); ep.kinds.add(a); mode = 'hung'; wasSettled = false; C[o].touched = true; flash = clock;
      paintCard(o, !quiet); C[o].el.classList.remove('egv-hit'); void C[o].el.offsetWidth; C[o].el.classList.add('egv-hit');
      if (quiet) sync(true);
      say(said.made(E, o)); layout();
    }
    function review(id, quiet) {
      const c = C[id]; if (c.vis !== 'review') return false;
      const r = E.review(id); if (!r) return false;
      ep.looked.add(id); if (r.changed) ep.changed.add(id); ep.rounds = Math.max(ep.rounds, ep.dist[id] || 1);
      T.forEach(t => { if (t.d === id && r.from.includes(t.g)) { t.route = true; t.stood = !r.changed; } });
      paintCard(id, !quiet); c.el.classList.remove('egv-stood', 'egv-moved'); void c.el.offsetWidth; c.el.classList.add(r.changed ? 'egv-moved' : 'egv-stood');
      if (quiet) sync(true);
      say(said.reviewed(E, id, r)); layout(); return true;
    }
    function reset(quiet) {
      E = Engine(); ep = null; mode = 'rest'; auto = null; held = null; sumAt = 0; wasSettled = true; pulses.forEach(p => p.el.remove()); pulses.length = 0;
      IDS.forEach(id => { const c = C[id]; c.pend = 0; c.touched = false; c.vis = 'current'; c.el.dataset.s = 'current'; c.el.classList.remove('egv-stood', 'egv-moved', 'egv-hit'); paintCard(id, !quiet); });
      T.forEach(t => { t.route = t.stood = false; });
      say(said.rest); measure(); layout();
    }
    const flagged = () => ORDER.filter(id => C[id].vis === 'review').sort((a, b) => (ep.dist[a] || 0) - (ep.dist[b] || 0));
    const carry = (o = {}) => { auto = { next: clock + (o.delay != null ? o.delay : .45), only: o.only || null, gap: o.gap || 1.75 }; };
    function reviewRound(ids) {                               // every marked record of one round, looked at together
      const done = [];
      ids.forEach(id => { if (C[id].vis !== 'review') return; const before = new Set(IDS.filter(i => E.state(i) === 'review')), r = E.review(id); if (!r) return;
        ep.looked.add(id); if (r.changed) ep.changed.add(id); ep.rounds = Math.max(ep.rounds, ep.dist[id] || 1);
        T.forEach(t => { if (t.d === id && r.from.includes(t.g)) { t.route = true; t.stood = !r.changed; } });
        paintCard(id, true); C[id].el.classList.remove('egv-stood', 'egv-moved'); void C[id].el.offsetWidth; C[id].el.classList.add(r.changed ? 'egv-moved' : 'egv-stood');
        done.push({ id, r, fresh: IDS.filter(i => E.state(i) === 'review' && !before.has(i)).length }); });
      if (done.length) { say(done.length === 1 ? said.reviewed(E, done[0].id, done[0].r) : said.round(E, done)); layout(); }
      return done.length;
    }

    /* bring what is seen into line with the engine. A record does not turn to "needs review" until the news has
       travelled its thread; everything else is immediate. All timing lives here, on one clock, so no press can strand
       a change half made. */
    function sync(now) {
      let moved = false;
      IDS.forEach(id => {
        const c = C[id], s = E.state(id);
        if (s === 'review' && c.vis !== 'review') {
          if (now || MO.off) { c.pend = 0; setVis(id, s); moved = true; }
          else if (!c.pend) { const dur = .5; c.pend = clock + dur; E.stale(id).forEach(g => { const t = T.find(x => x.d === id && x.g === g); if (t) pulses.push({ t, t0: clock, dur, el: S('g', { class: 'egv-pulse' }, over) }); }); }
          else if (clock >= c.pend) { c.pend = 0; setVis(id, s); moved = true; }
        } else if (s !== c.vis) { c.pend = 0; setVis(id, s); moved = true; }
        else if (s !== 'review') c.pend = 0;
      });
      if (moved) { measure(); layout(); }
      const set_ = !unsettled();
      if (set_ && !wasSettled) { wasSettled = true; auto = null; if (ep && ep.looked.size) sumAt = MO.off ? clock : Math.max(clock, saidAt + readFor); layout(); }
      if (sumAt && clock >= sumAt) { sumAt = 0; if (ep) say(said.settled(E, ep)); if (opts.onSettle) opts.onSettle(); }   /* the last outcome is left to be read before the summing up */
      if (auto && clock >= auto.next && !IDS.some(id => C[id].pend)) {
        const list = flagged().filter(id => !auto.only || auto.only.has(id));
        if (list.length) { const d0 = ep.dist[list[0]] || 0; reviewRound(list.filter(id => (ep.dist[id] || 0) === d0)); auto.next = clock + (MO.off ? .4 : readFor); } else if (!unsettled() || auto.only) auto = null;
      }
    }

    /* drawing, once a frame */
    const edge = (c, tx, ty) => {                            // where the line from a card's centre towards (tx, ty) leaves it
      const dx = tx - c.x.v, dy = ty - c.y.v, hw = c.w.v / 2 + 2, hh = c.h.v / 2 + 2; if (!dx && !dy) return [c.x.v, c.y.v];
      const k = Math.min(Math.abs(dx) > .01 ? hw / Math.abs(dx) : 1e9, Math.abs(dy) > .01 ? hh / Math.abs(dy) : 1e9); return [c.x.v + dx * Math.min(k, 1), c.y.v + dy * Math.min(k, 1)];
    };
    const curveAt = (t, u) => { const v = 1 - u; return [v * v * t.x1 + 2 * v * u * t.cx + u * u * t.x2, v * v * t.y1 + 2 * v * u * t.cy + u * u * t.y2]; };
    function draw(dt) {
      IDS.forEach(id => {
        const c = C[id]; let n = Math.max(1, Math.ceil(dt / .008)); const h = dt / n;
        while (n--) { c.x.step(h); c.y.step(h); c.w.step(h); c.h.step(h); c.o.step(h); c.f.step(h); }
        const w = c.w.v, hh = c.h.v, tr = `translate(${(c.x.v - w / 2).toFixed(1)}px,${(c.y.v - hh / 2).toFixed(1)}px) scale(${(1 + c.f.v * .035).toFixed(4)})`;
        if (c.last.tr !== tr) { c.last.tr = tr; c.el.style.transform = tr; }
        const ws = w.toFixed(1), hs = hh.toFixed(1); if (c.last.w !== ws) { c.last.w = ws; c.el.style.width = ws + 'px'; } if (c.last.h !== hs) { c.last.h = hs; c.el.style.height = hs + 'px'; }
        /* the dial: at rest it points up and drifts a little; marked, it turns to face what changed */
        let goalA = -90 + (MO.off ? 0 : Math.sin(clock * .9 + c.x.v * .013 + c.y.v * .021) * 4);
        if (c.vis === 'review') { const g = E.stale(id)[0]; if (g) goalA = Math.atan2(C[g].y.v - (c.y.v - hh / 2 + fs), C[g].x.v - (c.x.v + w / 2 - fs)) * 180 / Math.PI; }
        let dA = goalA - c.ang; while (dA > 180) dA -= 360; while (dA < -180) dA += 360;
        if (MO.off) { c.ang = goalA; c.angV = 0; } else { let m = Math.max(1, Math.ceil(dt / .008)); const hstep = dt / m; while (m--) { c.angV += (120 * dA - 13 * c.angV) * hstep; c.ang += c.angV * hstep; dA = goalA - c.ang; while (dA > 180) dA -= 360; while (dA < -180) dA += 360; } }
        const rot = `rotate(${(c.ang + 90).toFixed(1)})`; if (c.last.rot !== rot) { c.last.rot = rot; c.needle.setAttribute('transform', rot); }
      });
      const lit = focus || hover;
      T.forEach(t => {
        const a = C[t.d], b = C[t.g], [x1, y1] = edge(b, a.x.v, a.y.v), [x2, y2] = edge(a, b.x.v, b.y.v), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
        t.x1 = x1; t.y1 = y1; t.x2 = x2; t.y2 = y2; t.cx = mx - dy * t.bend; t.cy = my + dx * t.bend;
        t.p.setAttribute('d', `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${t.cx.toFixed(1)} ${t.cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
        const hot = a.vis === 'review' && E.pin[t.d][t.g] !== E.rev[t.g], foc = lit && (t.d === lit || t.g === lit), tiny = a.mode === 't' || b.mode === 't';
        const off = mode === 'hung' && ep && (ep.dist[t.d] == null || ep.dist[t.g] == null);
        const cls = 'egv-th' + (hot ? ' hot' : '') + (foc ? ' foc' : '') + (t.route && !hot ? (t.stood ? ' stood' : ' route') : '') + (off && !foc ? ' off' : tiny && !hot && !foc ? ' far' : '');
        if (t.cls !== cls) { t.cls = cls; t.p.setAttribute('class', cls); t.name.className = 'egv-name' + (hot ? ' hot on' : foc ? ' on' : ''); t.stop.setAttribute('class', 'egv-stop' + (t.route && t.stood && !hot ? ' on' : '')); }
        t.hot = hot; t.foc = foc;
        if (hot || foc) {
          let u = .5; const gx = hot && mode === 'hung' && ep ? gapX[ep.dist[t.d]] : null, ax = portrait ? 1 : 0, p1 = portrait ? y1 : x1, p2 = portrait ? y2 : x2;
          if (gx != null && (p1 - gx) * (p2 - gx) < 0) { let lo = 0, hi = 1; for (let k = 0; k < 14; k++) { u = (lo + hi) / 2; if ((curveAt(t, u)[ax] - gx) * (p2 - p1) < 0) lo = u; else hi = u; } }
          const [lx, ly] = curveAt(t, u); t.lx = lx; t.ly = ly; t.name.style.transform = `translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px) translate(-50%,-50%)`;
        }
        if (t.route && t.stood) { const [sx, sy] = curveAt(t, .9), [ex, ey] = curveAt(t, .97), nx = -(ey - sy), ny = ex - sx, L = Math.hypot(nx, ny) || 1, k = fs * .5 / L; t.stop.setAttribute('d', `M${(ex - nx * k).toFixed(1)} ${(ey - ny * k).toFixed(1)}L${(ex + nx * k).toFixed(1)} ${(ey + ny * k).toFixed(1)}`); }
      });
      const shown = []; T.filter(t => t.hot).sort((a, b) => a.ly - b.ly).forEach(t => { const dup = shown.some(o => o.kind === t.kind && (portrait ? Math.abs(o.ly - t.ly) < fs * 1.2 && Math.abs(o.lx - t.lx) < fs * 7 : Math.abs(o.lx - t.lx) < fs * 3 && Math.abs(o.ly - t.ly) < fs * 2.3)); t.name.classList.toggle('dup', dup); if (!dup) shown.push(t); });
      T.forEach(t => { if (!t.hot && t.name.classList.contains('dup')) t.name.classList.remove('dup'); });
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], u = clamp((clock - p.t0) / p.dur), fade = clamp((clock - p.t0 - p.dur) / .25);
        if (fade >= 1) { p.el.remove(); pulses.splice(i, 1); continue; }
        const e = smooth(u), [x, y] = curveAt(p.t, e), [x0, y0] = curveAt(p.t, Math.max(0, e - .3));
        p.el.innerHTML = `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(fs * .28).toFixed(1)}"/>`; p.el.style.opacity = 1 - fade;
      }
    }
    let raf = 0, prev = 0;
    function frame(now) {
      if (!alive) return; raf = requestAnimationFrame(frame);
      const dt = Math.min(.12, prev ? (now - prev) / 1000 : .016);   /* a long frame moves the whole of what it owes, in steps of 8 ms, so nothing runs slow after a hitch */ prev = now; if (!seen) return;
      clock += dt; sync(false); draw(dt);
    }

    /* the reader */
    function manual() { if (opts.onManual) opts.onManual(); }
    root.addEventListener('click', ev => {
      const cb = ev.target.closest('[data-change]'), ab = ev.target.closest('[data-act]'), cd = ev.target.closest('.egv-card');
      if (cb) { manual(); const was = auto; auto = null; change(cb.dataset.change); if (was) carry({ delay: 1.2 }); announce(); }
      else if (ab) { manual(); if (ab.dataset.act === 'carry') { carry({ delay: .05 }); } else { reset(); } announce(); }
      else if (cd) { manual(); const id = cd.dataset.id; if (C[id].vis === 'review') { auto = null; focus = null; held = id; review(id); announce(); } else { focus = focus === id ? null : id; showFocus(); } }
      else if (focus) { focus = null; showFocus(); }
    });
    function showFocus() {
      const id = focus || hover; IDS.forEach(i => C[i].el.classList.toggle('egv-focus', i === id));
      if (hover && !root.classList.contains('egv-wide')) { const s = C[hover].vis; put(status, `<b>${KIND[REC[hover].k]}</b> · ${plain(E, hover)}${REC[hover].says && hover !== 'T' ? ` · ${plain(E, hover, 'says')}` : ''} · ${stateName[s]}${s === 'review' ? '. Press it to look at it.' : '.'}`); } else put(status, lastSaid);
      counts(); drawPanel();
    }
    cardsEl.addEventListener('pointerover', ev => { const cd = ev.target.closest('.egv-card'); if (cd && ev.pointerType !== 'touch' && hover !== cd.dataset.id) { hover = cd.dataset.id; showFocus(); } });
    cardsEl.addEventListener('pointerleave', () => { if (hover) { hover = null; showFocus(); } });
    cardsEl.addEventListener('focusin', ev => { const cd = ev.target.closest('.egv-card'); if (cd && cd.matches(':focus-visible')) { hover = cd.dataset.id; showFocus(); } });
    cardsEl.addEventListener('focusout', () => { if (hover) { hover = null; showFocus(); } });
    const onLevel = () => { IDS.forEach(id => paintCard(id, false)); panel.dataset.key = ''; measure(); layout(); };
    window.addEventListener('eigen-level', onLevel);
    const ro = new ResizeObserver(resize); ro.observe(root); ro.observe(stage);
    let rmq = 0; const ri = new ResizeObserver(() => { if (!rmq) rmq = requestAnimationFrame(() => { rmq = 0; if (alive && W) { measure(); layout(); } }); }); IDS.forEach(id => ri.observe(C[id].el.firstChild));
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { seen = es[es.length - 1].isIntersecting; prev = 0; }) : null; if (io) io.observe(root);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (alive) { measure(); layout(); } });
    IDS.forEach(id => paintCard(id, false)); say(said.rest); resize(); raf = requestAnimationFrame(frame);

    /* the six steps. Each sets the object up as its caption describes and then plays its part; pressing the step that
       is showing plays it again. */
    const roundOne = () => ['C2', 'P1', 'L', 'Rn'];
    function step(i) {
      focus = null; auto = null;
      const fresh = () => ep && !ep.mixed && ep.origins[0] === 'T' && E.val.T.word === 1 && E.rev.T === 2;
      if (i === 0) reset();
      else if (i === 1) { reset(true); change('T'); }
      else if (i === 2) { if (!(fresh() && ep.looked.size === 0)) { reset(true); change('T', true); } carry({ delay: .7, only: new Set(roundOne()) }); }
      else if (i === 3) { if (!(fresh() && !wasSettled && roundOne().every(id => ep.looked.has(id)))) { reset(true); change('T', true); roundOne().forEach(id => review(id, true)); say('Four records carried the old word and are reworded. Three records written against them are marked in turn.'); } carry({ delay: .9 }); }
      else if (i === 4) { reset(true); change('SM'); carry({ delay: 1.5 }); }
      else if (i === 5) { reset(true); change('Rn'); carry({ delay: 1.5 }); }
    }
    return {
      step,
      destroy() { alive = false; cancelAnimationFrame(raf); ro.disconnect(); ri.disconnect(); if (io) io.disconnect(); window.removeEventListener('eigen-level', onLevel); root.remove(); },
      /* for tests and for a host that wants to follow: the state as the engine holds it, and what is on screen */
      state: () => ({ mode, idle: !auto && !sumAt && !IDS.some(id => C[id].pend), settled: !unsettled() && !sumAt && !auto, states: Object.fromEntries(IDS.map(id => [id, E.state(id)])), seen: Object.fromEntries(IDS.map(id => [id, C[id].vis])), words: Object.fromEntries(IDS.map(id => [id, plain(E, id) + (REC[id].says ? ' | ' + plain(E, id, 'says') : '')])), status: lastSaid }),
      snapshot: () => ({ cards: Object.fromEntries(IDS.map(id => [id, { x: C[id].x.v, y: C[id].y.v, w: C[id].w.v, h: C[id].h.v }])), threads: T.map(t => ({ d: t.d, g: t.g, x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 })) }),
      act: { change: o => change(o), review: id => review(id), carry: () => carry({ delay: .05 }), reset: () => reset() }
    };
  }

  /* ---- 5. a section for the node's own page: the same thing happening in the interface --------------------------- */
  const sections = [{
    title: 'In the interface',
    line: two('A single extra newline in a table of results was enough to mark the figure drawn from it.', 'The fingerprint of an input changed while every number in it stayed the same, and the figure which had read the earlier fingerprint was marked.'),
    mount(el) {
      const d = H('div', 'egv-real egn-change');
      const pill = (s, t) => `<span class="egv-m on" data-s="${s}"><i></i>${t}</span>`;
      d.innerHTML = `<p class="egv-real-head">The record of a computed figure, as the interface showed it after its input changed</p>
        <a class="egv-shot" href="/demo/writing/simulation/#simulation-stale"><img src="/demo/writing/media/simulation-stale.webp" alt="The interface showing a computed figure with the line: drawing stale, evidence stale, metadata current" loading="lazy"></a>
        <p class="egv-real-states">${pill('review', 'the drawing needs review')}${pill('review', 'its evidence needs review')}${pill('current', 'its description is current')}</p>
        <div class="egv-real-words"><p>A single extra newline changed the fingerprint of a table of results while leaving every number in it the same. The figure drawn from that table was marked at once, as was the evidence beneath it, and both stayed marked until the original bytes were restored. The description of the figure was not written against the table, and remained current.</p>
        <p class="egv-real-links"><a href="/demo/writing/simulation/#simulation-stale">The figure which remembers its input →</a><a href="/eigenengine/phases-of-hierarchy/">How far a change travels through layers is the subject of The Phases of Hierarchy →</a></p></div>`;
      el.appendChild(d); return { destroy() { d.remove(); } };
    }
  }];

  /* ---- 6. the node ------------------------------------------------------------------------------------------------ */
  window.EIGEN_NODES = window.EIGEN_NODES || {};
  window.EIGEN_NODES.change = {
    title: 'Keeping it consistent',
    question: 'What happens when something changes?',
    line: two('A change marks its neighbours for review, and each review stops it or passes it on.',
      'A record’s state is the comparison of the versions it was written against with those now current.'),
    text: two('No record in a research object stands alone: an edit to one can falsify others nobody touched. Each record is therefore a <i>state machine</i>: <i>current</i>, <i>needs review</i> or <i>changed</i>. When one changes, those written against it are marked, and stay marked until someone has looked. A review stops the change or passes it on. A renamed term is thereby forced through the conceptric until no record uses the old word.',
      'Each record \\(r\\) keeps a version \\(v(r)\\) and, for every record \\(n\\) it was written against, the version \\(p_r(n)\\) it last read. It <i>needs review</i> when some \\(p_r(n)\\neq v(n)\\), is <i>changed</i> while a record written against it has yet to read \\(v(r)\\), and is otherwise <i>current</i>. A review sets \\(p_r(n)=v(n)\\) and raises \\(v(r)\\) only if \\(r\\) had to alter. A change therefore crosses one thread per review.'),
    out: [{ href: '/demo/writing/simulation/#simulation-stale', label: 'A real change, marked in the interface →' }],
    art: ART,
    exhibit: {
      steps: [
        { label: 'At rest', caption: two('Every record keeps one of three states: current, changed or needs review. With nothing altered, all fourteen are current.',
          'Every record stores the version of each record it was written against. With \\(p_r(n)=v(n)\\) on all eighteen threads, all fourteen records are current.') },
        { label: 'A renamed term', caption: two('We rename one term. The four records which use it change state to needs review, and the object is laid out again in columns by distance from the change, with those four in the first.',
          'Renaming raises \\(v\\) of the term from 1 to 2. Four records hold \\(p=1\\) against it, which is the whole of what marks them; the columns are distances from the change along the threads.') },
        { label: 'First reviews', hold: 8000, caption: two('The marked records are read against the new wording. Each of the four carried the old word and is reworded, and the three records written against them are marked in turn.',
          'A review sets \\(p_r(n)=v(n)\\). Where the record’s own words had to follow, \\(v(r)\\) rises too, and the mismatch moves one thread outward.') },
        { label: 'Through to the end', hold: 19000, caption: two('A review which finds nothing to alter stops the change where it stands. Of the eight records looked at in three rounds, the six which carried the old word are reworded, and the step and the idea are read and left as they were.',
          'Where a review leaves \\(v(r)\\) as it was, nothing beyond \\(r\\) is marked. The change ends after three rounds, the depth of the deepest record which had to follow.') },
        { label: 'A corrected source', hold: 15000, caption: two('A correction reaches only the records written against what changed. Correcting the passage from Mandelbrot 1953 marks only the claim it supports; that claim is restated, while the step and the idea which require it are read and stand.',
          'The same rule acts along “supported by” and “requires”. The restated claim marks two records; both are left as they were, so the four at distances three to five keep their versions.') },
        { label: 'A new run', hold: 13000, caption: two('A new run disturbs the figure computed by it and the caption which cites that figure. No other record was written against the run or its figure, so the other eleven stay as they were.',
          'Only two records are reachable from the run along “computed by” and “cites”. A review is owed only where something was written against a record that changed, so this change costs two reviews.') }
      ],
      mount
    },
    sections
  };
})();
