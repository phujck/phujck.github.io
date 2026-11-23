/* The EigenEngine pattern: one component that draws any node of EIGEN_GRAPH at any depth.
   A node has an outside (an animated card and its named links) and an inside (more nodes, or one live exhibit).
   Its children are always drawn inside it: small while it is closed, full size once it is open, so opening is a
   continuous change of scale and the same gesture works at every depth. Rooted at `eigen` this is the main page;
   rooted at any other node it is that node's page; the map in the corner is the same arrangement drawn small.
   Every rectangle is a damped spring in stage coordinates, links are redrawn from the live rectangles each frame,
   and nothing here scrolls the page or moves keyboard focus out of sight. */
(() => {
  'use strict';
  const EM = window.EigenMotion; if (!EM || !window.EIGEN_GRAPH) return;
  const M = EM.M, clamp = EM.clamp, NS = 'http://www.w3.org/2000/svg';
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sv = (tag, cls, at) => { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); for (const k in at || {}) e.setAttribute(k, at[k]); return e; };
  const mix = (a, b, u) => a + (b - a) * u;
  const esc = s => String(s == null ? '' : s);

  class Sp extends EM.Spring {                       // the shared spring, with a start delay so motion can ripple outward
    to(g, delay = 0) { if (delay > 0 && !M.off) { this.next = g; this.at = performance.now() + delay; } else { this.g = g; this.next = null; } return this; }
    snap(g) { this.next = null; return super.snap(g); }
    get goal() { return this.next != null ? this.next : this.g; }
    tick(dt, now) {                                // integrated in steps of at most 9 ms, so a slow or uneven frame rate gives the same motion
      if (this.next != null && now >= this.at) { this.g = this.next; this.next = null; }
      const k = Math.max(1, Math.ceil(dt / .009)); let m = false; for (let i = 0; i < k; i++) m = super.step(dt / k);
      return m || this.next != null;
    }
  }

  const LINK_NAME = { requires: 'requires', supports: 'supports', 'shown by': 'shown by', then: '', cites: 'cites', 'computed by': 'computed by' };
  const HOME = {                                     // where a container's children sit inside it, as fractions of its inside
    eigen: { pos: { object: [.175, .2], reading: [.5, .155], change: [.825, .235], network: [.165, .6], theory: [.49, .535], interface: [.83, .62], made: [.5, .885] }, size: { object: [1.16, 1.14], theory: [1.3, 1.3], made: [1.95, .7] } },
    object: { pos: { build: [.19, .3], conceptric: [.5, .7], search: [.81, .3] } },
    theory: { pos: { cost: [.19, .32], phases: [.5, .68], memory: [.81, .32] }, tile: { box: [.05, .07, .5, .27], pos: { cost: [.17, .5], phases: [.5, .5], memory: [.83, .5] } } }
  };

  class Pattern {
    constructor(app, opts = {}) {
      this.app = app; this.opts = opts;
      const G = window.EIGEN_GRAPH, D = window.EIGEN_NODES || {};
      this.data = window.EIGEN_PATTERN_DATA || {};
      this.rootId = opts.root || app.dataset.epRoot || G.root;
      this.grow(this.rootId);
      this.st = { lift: 'part', order: null, orderName: null, path: [], q: null, pick: false };
      this.visited = []; this.timers = []; this.pulses = []; this.routes = new Map(); this.dim = new Sp(1); this.lastHeat = {};
      if (this.rootId !== G.root && G.nodes[G.root]) { const g = this.ghost = Object.create(Pattern.prototype); g.grow(G.root); g.narrow = false; g.capH = 0; g.data = this.data; }   // the whole site, for the map on a node's own page
      this.build();
      this.measure();
      const h = (location.hash || '').slice(1), alias = (this.data.alias || {})[h] || h;
      this.layout(true);
      this.intro(); this.say(this.root.kids.length ? (this.questions.length ? 'Open any card, or ask the page a question. It will rearrange itself to answer.' : 'Open any card. Each one holds more cards, or a demonstration of its idea.') : '');
      if (alias && this.N[alias] && alias !== this.rootId) setTimeout(() => this.go(alias), 500);
      this.frame = this.frame.bind(this); this.last = 0; this.t0 = performance.now(); this.tick = 0;
      requestAnimationFrame(this.frame);
      let rt = 0; new ResizeObserver(() => { const w = this.W, hh = this.H, nar = this.narrow; this.measure(); if (Math.abs(w - this.W) < 1 && Math.abs(hh - this.H) < 1) return; this.layout(!(performance.now() - (this.acted || 0) < 500 && Math.abs(w - this.W) < 1)); if (nar !== this.narrow) this.say(''); clearTimeout(rt); rt = setTimeout(() => this.remount(), 260); }).observe(this.stage);
      window.addEventListener('keydown', e => { if (e.key === 'Escape') { if (this.st.pick) { this.st.pick = false; this.sync(); } else this.back(); } });
      app.classList.add('ep-on');
    }
    grow(rootId) {                                    // the tree under one node, with its links
      const G = window.EIGEN_GRAPH, D = window.EIGEN_NODES || {};
      this.rootId = rootId; this.N = {}; this.all = [];
      const add = (id, parent, depth) => {
        const g = G.nodes[id] || {}, d = D[id] || {};
        const n = { id, g, d, parent, depth, kids: [], title: d.title || g.title || id, line: d.line || g.line || '', text: d.text || '', ground: g.ground || d.ground || '',
          x: new Sp(0), y: new Sp(0), w: new Sp(0), h: new Sp(0), o: new Sp(0), a: new Sp(0), f: new Sp(0), heat: new Sp(0), R: { x: 0, y: 0, w: 0, h: 0 }, vis: 0, T: null, fr: 0 };
        this.N[id] = n; this.all.push(n);
        (g.children || d.children || []).forEach(c => { if (!this.N[c] && (G.nodes[c] || D[c])) n.kids.push(add(c, n, depth + 1)); });
        return n;
      };
      this.root = add(this.rootId, null, 0);
      const inTree = id => !!this.N[id];
      const extra = []; this.all.forEach(n => (n.d.links || []).forEach(l => extra.push(l)));
      this.links = G.links.concat(extra).filter(l => inTree(l[0]) && inTree(l[1]) && l[1] !== this.rootId && l[0] !== this.rootId).map(l => ({ a: this.N[l[0]], b: this.N[l[1]], kind: l[2], o: new Sp(0), hot: new Sp(0) }));
      this.all.forEach(n => { n.inside = new Set(); (function walk(k) { n.inside.add(k.id); k.kids.forEach(walk); })(n); });
      this.all.forEach(n => { n.dissolve = n !== this.root && n.kids.length > 0 && this.links.some(l => n.inside.has(l.a.id) !== n.inside.has(l.b.id) && (l.a !== n && l.b !== n || true) && (n.inside.has(l.a.id) ? l.a !== n : l.b !== n)); });
    }

    // ---- construction ----------------------------------------------------------------------------------------
    build() {
      const app = this.app, root = this.root;
      this.stage = app.querySelector('.ep-stage') || app.appendChild(el('div', 'ep-stage'));
      this.stage.setAttribute('role', 'group');
      this.layers = []; for (let d = 0; d < 6; d++) { const s = sv('svg', 'ep-links'); s.style.zIndex = d * 10 - 2; this.stage.appendChild(s); this.layers.push(s); }
      this.linkEls();
      this.all.forEach(n => { if (n === root && root.kids.length) return; this.nodeEl(n); });
      this.sayEl = el('p', 'ep-say'); this.sayEl.setAttribute('aria-live', 'polite'); this.stage.appendChild(this.sayEl);
      this.resetEl = el('button', 'ep-reset', 'Show the graph as it was'); this.resetEl.type = 'button'; this.resetEl.hidden = true; this.stage.appendChild(this.resetEl);
      this.resetEl.addEventListener('click', e => { e.stopPropagation(); this.home(); });
      this.stage.addEventListener('click', e => { if (e.target === this.stage || e.target.classList.contains('ep-links')) this.back(); });
      this.tray = app.querySelector('.ep-tray') || app.appendChild(el('div', 'ep-tray'));
      this.console();
    }
    linkEls() {
      this.links.forEach(l => {
        const depth = Math.max(l.a.depth, l.b.depth), L = this.layers[Math.min(5, depth)];
        l.el = sv('path', 'ep-l ep-l-' + l.kind.replace(/\s/g, '-') + (l.a.ground ? ' ep-g-' + l.a.ground : '')); L.appendChild(l.el);
        l.head = sv('circle', 'ep-lh ep-l-' + l.kind.replace(/\s/g, '-') + (l.a.ground ? ' ep-g-' + l.a.ground : ''), { r: 3.2 }); L.appendChild(l.head);
        l.lab = sv('text', 'ep-ll'); l.lab.textContent = LINK_NAME[l.kind] != null ? LINK_NAME[l.kind] : l.kind; L.appendChild(l.lab);
      });
    }
    nodeEl(n) {
      const d = n.d, leaf = !n.kids.length, e = el('div', 'ep-n' + (leaf ? ' ep-leaf' : ' ep-box') + (n.ground ? ' ep-g-' + n.ground : '') + ' egn-' + n.id);
      e.dataset.id = n.id; e.tabIndex = -1; e.setAttribute('role', 'button'); e.setAttribute('aria-expanded', 'false'); e.setAttribute('aria-label', n.title + (n.line ? '. ' + (window.EigenLevel ? window.EigenLevel.pick(n.line) : n.line) : ''));
      const steps = leaf && d.exhibit && d.exhibit.steps || [];
      const go = d.page ? { href: d.page, label: 'Its page →' } : /^made-/.test(n.id) && d.out && d.out[0] ? { href: d.out[0].href, label: String(d.out[0].label) } : null;   // where the card leads: its own page, or the thing itself
      const out = (d.out || []).filter(o => !(n === this.root && o.href === d.page)).map(o => `<a href="${o.href}"${/^https?:|\.pdf$/.test(o.href) ? ' target="_blank" rel="noopener"' : ''}>${o.label}</a>`).join('');
      e.innerHTML =
        `<div class="ep-bg"><svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg></div><div class="ep-scrim"></div>` +
        `<span class="ep-ord"></span><span class="ep-sum"></span>` +
        (go && n !== this.root ? `<a class="ep-go" href="${go.href}"${/^https?:|\.pdf$/.test(go.href) ? ' target="_blank" rel="noopener"' : ''} aria-label="${esc(go.label.replace(/\s*[→↗]\s*$/, ''))}: ${esc(n.title)}">${go.label}</a>` : '') +
        `<div class="ep-face"><h3 class="ep-t">${n.title}</h3><p class="ep-line">${n.line}</p></div>` +
        `<div class="ep-in" inert>` +
          `<div class="ep-bar"><span class="ep-walk"><button type="button" class="ep-prev" aria-label="Previous in the reading order">‹</button><b></b><button type="button" class="ep-next" aria-label="Next in the reading order">›</button></span><button type="button" class="ep-x" aria-label="Close ${esc(n.title)}">×</button></div>` +
          (leaf ? `<div class="ep-ex"></div><div class="ep-steps" role="group" aria-label="Steps">${steps.map((s, i) => `<button type="button" data-i="${i}">${s.label}</button>`).join('')}</div><p class="ep-cap" aria-live="polite"></p>` : '') +
          `<div class="ep-side"><p class="ep-text">${n.text}</p>${leaf ? '' : `<p class="ep-short">${n.line}</p>`}${out ? `<p class="ep-out">${out}</p>` : ''}</div>` +
        `</div>`;
      n.el = e; n.bg = e.querySelector('.ep-bg'); n.bw = 0; n.bh = 0; n.in = e.querySelector('.ep-in'); n.ordEl = e.querySelector('.ep-ord'); n.sumEl = e.querySelector('.ep-sum');
      const svg = e.querySelector('.ep-bg svg'), art = d.art || (window.EIGEN_ART || {})[n.id] || (window.EIGEN_ART || {})._;
      try { n.art = art ? art(svg, n) : null; } catch (err) { n.art = null; }
      e.addEventListener('click', ev => {
        ev.stopPropagation();
        const b = ev.target.closest('button'), t = this.st;
        if (b && b.classList.contains('ep-x')) return this.back();
        if (b && b.classList.contains('ep-prev')) return this.walk(-1);
        if (b && b.classList.contains('ep-next')) return this.walk(1);
        if (b && b.dataset.i != null) return this.step(n, +b.dataset.i, true);
        if (ev.target.closest('a')) return;
        if (ev.target.closest('.ep-ex')) { this.stopAuto(n); return; }
        if (t.path[t.path.length - 1] === n.id) return;
        let c = n; while (c.parent && c.parent !== this.root && c.R.w < 104 && !(c.T && (c.T.unit || c.T.mode === 'in' || c.T.mode === 'rail'))) c = c.parent;
        if (t.pick) { t.pick = false; return this.lift({ from: this.liftable(c).id }); }
        this.go(c.id, { x: ev.clientX, y: ev.clientY });
      });
      e.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === e) { ev.preventDefault(); if (this.st.path[this.st.path.length - 1] !== n.id) this.go(n.id); } });
      e.addEventListener('pointerenter', () => this.hover(n, 1)); e.addEventListener('pointerleave', () => this.hover(n, 0));
      e.addEventListener('focus', () => this.hover(n, 1)); e.addEventListener('blur', () => this.hover(n, 0));
      this.stage.appendChild(e);
    }
    console() {
      const D = this.data, t = this.tray, leafRoot = !this.root.kids.length;
      const grp = (key, label, items) => items.length ? `<div class="ep-grp" data-grp="${key}"><button type="button" class="ep-tab" data-tab="${key}">${label}</button><div class="ep-chips">${items.map(i => `<button type="button" class="ep-chip" data-${key}="${i.id}">${i.label}</button>`).join('')}</div></div>` : '';
      const here = id => this.N[id];
      this.questions = (D.questions || []).filter(q => Object.keys(q.seed).filter(here).length >= 1 && !leafRoot);
      this.readers = (D.readers || []).map(r => ({ id: r.id, label: r.label, say: r.say, order: r.order.filter(id => here(id) && this.unitable(id)) })).filter(r => r.order.length >= 3);
      if (new Set(this.readers.map(r => r.order.join())).size < 2) this.readers = [];
      const hasSup = this.links.some(l => l.kind === 'supports'), hasReq = this.links.some(l => l.kind === 'requires');
      this.lifts = leafRoot ? [] : [{ id: 'part', label: 'is part of' }].concat(hasReq ? [{ id: 'rests', label: 'requires' }] : [], hasSup ? [{ id: 'support', label: 'is supported by' }] : [], hasReq ? [{ id: 'pick', label: 'any card…' }] : []);
      t.innerHTML = grp('q', 'Ask it', this.questions) + grp('r', 'Read it as', this.readers) + grp('l', 'Lift it by', this.lifts) +
        `<div class="ep-map"><svg aria-hidden="true"></svg></div><p class="ep-where" aria-live="polite"></p><div class="ep-foot"><span class="ep-level"></span><button type="button" class="ep-motion"></button></div>`;
      if (window.EigenLevel) { try { window.EigenLevel.switch(t.querySelector('.ep-level')); } catch (err) {} if (!this.levelOn) { this.levelOn = true; window.addEventListener('eigen-level', () => { clearTimeout(this.levelT); this.levelT = setTimeout(() => this.layout(), 200); }); } }
      t.dataset.tab = this.questions.length ? 'q' : 'l';
      t.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.tab) { t.dataset.tab = b.dataset.tab; return; }
        if (b.dataset.q) return this.ask(b.dataset.q);
        if (b.dataset.r) return this.readAs(b.dataset.r);
        if (b.dataset.l) return b.dataset.l === 'pick' ? this.pick() : this.lift(b.dataset.l);
        if (b.classList.contains('ep-motion')) { M.off = !M.off; try { localStorage.setItem('eg-motion', M.off ? 'off' : 'on'); } catch (err) {} this.sync(); }
      });
      this.map = new Mini(this, t.querySelector('.ep-map'));
    }
    unitable(id) { let n = this.N[id]; if (!n || n === this.root) return false; for (let p = n.parent; p && p !== this.root; p = p.parent) if (!p.dissolve) return false; return !n.dissolve; }
    liftable(n) { n = this.unitOf(n); return this.unitable(n.id) ? n : this.resolve(n); }
    unitOf(n) { while (n.parent && n.parent !== this.root && !this.unitable(n.id)) n = n.parent; return n; }

    // ---- geometry: a pure arrangement of every node for a given state ---------------------------------------
    measure() {
      const r = this.stage.getBoundingClientRect();
      this.W = r.width; this.H = r.height; this.narrow = this.W < 620;
      this.capH = this.narrow ? 72 : 50;
    }
    resolve(n) { while (n.dissolve && n.kids.length) n = n.kids.reduce((m, k) => (this.layer(k) > this.layer(m) ? k : m), n.kids[0]); return n; }
    layer(n, seen = {}) {                             // how many cards deep a card's requirements go
      if (n._layer != null) return n._layer; if (seen[n.id]) return 0; seen[n.id] = 1;
      let v = 0;
      if (n.dissolve) v = Math.max(...n.kids.map(k => this.layer(k, seen)));
      else this.links.forEach(l => { if (l.kind === 'requires' && l.a === n) v = Math.max(v, 1 + this.layer(l.b, seen)); });
      return (n._layer = v);
    }
    shown(n, T) { T = T || this.T || {}; let t = T[n.id]; if (t && t.mode === 'gone') { n = this.resolve(n); t = T[n.id]; } while (t && t.mode === 'tile' && n.parent && T[n.parent.id]) { n = n.parent; t = T[n.id]; } return n; }
    flatUnits() { const out = []; (function walk(n) { n.kids.forEach(k => k.dissolve ? walk(k) : out.push(k)); })(this.root); return out; }
    flatLinks() { return this.links.filter(l => l.kind !== 'then').map(l => ({ a: this.resolve(l.a), b: this.resolve(l.b), kind: l.kind, l })); }
    rowsRests(units) {
      const L = this.flatLinks().filter(l => l.kind === 'requires'), on = units.filter(u => L.some(l => l.a === u || l.b === u));
      const rows = []; on.forEach(u => (rows[this.layer(u)] = rows[this.layer(u)] || []).push(u));
      return rows.filter(Boolean).reverse();
    }
    rowsSupport(units) {
      const L = this.flatLinks().filter(l => l.kind === 'supports'), top = units.filter(u => L.some(l => l.a === u)), low = units.filter(u => L.some(l => l.b === u) && !top.includes(u));
      return top.length ? [top, low] : null;
    }
    rowsFrom(units, id) {
      const L = this.flatLinks(), d = { [id]: 0 }, q = [id];
      while (q.length) { const v = q.shift(); L.forEach(l => { const u = l.a.id === v ? l.b.id : l.b.id === v ? l.a.id : null; if (u && !(u in d)) { d[u] = d[v] + 1; q.push(u); } }); }
      const rows = []; units.forEach(u => { if (u.id in d) (rows[d[u.id]] = rows[d[u.id]] || []).push(u); });
      const out = rows.filter(Boolean), rest = units.filter(u => !(u.id in d)); if (rest.length) out.push(rest);
      return out.reduce((a, r) => { for (let i = 0; i < r.length; i += 5) a.push(r.slice(i, i + 5)); return a; }, []);
    }
    arrange(st, W, H) {
      const T = {}, N = this.N, root = this.root, nar = this.narrow, G = 8;
      const area = { x: G, y: G, w: W - 2 * G, h: H - 2 * G - (nar && st.path.length ? 0 : this.capH) };   // on a phone an open card takes the room of the line beneath the stage
      const put = (n, r, o) => (T[n.id] = Object.assign({ x: r.x, y: r.y, w: Math.max(0, r.w), h: Math.max(0, r.h), a: 1, o: 0, f: 0, mode: 'card', ord: 0, z: n.depth * 10, unit: false, lead: n.id }, o));
      if (!root.kids.length) { put(root, { x: 0, y: 0, w: W, h: H }, { o: 1, f: 1, mode: 'open', lone: true }); return T; }
      const flat = !!st.order || st.lift !== 'part';
      const units = flat ? this.flatUnits() : root.kids.slice();
      let rows = null, line = null;
      if (st.order) line = st.order.map(id => N[id]).filter(n => units.includes(n));
      else if (st.lift === 'rests') rows = this.rowsRests(units);
      else if (st.lift === 'support') rows = this.rowsSupport(units);
      else if (st.lift && st.lift.from) rows = this.rowsFrom(units, st.lift.from);
      const arranged = line || (rows ? rows.reduce((a, r) => a.concat(r), []) : units);
      const P = st.path.map(id => N[id]).filter(Boolean), open1 = P[0];
      const aside = (open1 ? arranged.filter(u => u !== open1) : []).concat(units.filter(u => !arranged.includes(u)));
      // the rail: cards set aside, always on the same side, still linked
      const railSize = (k, n, len) => { const base = nar ? [[62, 44], [48, 34], [40, 28]][Math.min(2, k)] : [[150, 102], [78, 54], [50, 35]][Math.min(2, k)]; const fit = nar ? Math.min(1, (len - 4) / (n * (base[0] + 5))) : Math.min(1, (len - 4) / (n * (base[1] + 7))); return [base[0] * Math.max(.5, fit), base[1] * Math.max(.5, fit)]; };
      const rail = (items, box, k) => {             // lays items along the left edge (or the top edge on a phone); returns what is left of the box
        if (!items.length) return box;
        const [iw, ih] = railSize(k, items.length, nar ? box.w : box.h);
        items.forEach((u, i) => {
          const r = nar ? { x: box.x + 2 + i * (iw + 5), y: box.y + 2, w: iw, h: ih } : { x: box.x + 2, y: box.y + 2 + i * (ih + 7), w: iw, h: ih };
          put(u, r, Object.assign({ mode: 'rail', unit: true, a: 1, railk: k, ord: line ? line.indexOf(u) + 1 : 0 }, flat ? { z: 10 } : {}));
        });
        return nar ? { x: box.x, y: box.y + ih + 8, w: box.w, h: box.h - ih - 8 } : { x: box.x + iw + 12, y: box.y, w: box.w - iw - 12, h: box.h };
      };
      const main = rail(aside, area, Math.max(0, P.length - 1));
      const s = this.s = clamp(Math.min(main.w / 1060, main.h / 720), .42, 1.75);
      // the arranged cards
      const fitRows = (rws, box, snake) => {
        const most = Math.max(...rws.map(r => r.length)), cw = Math.min((snake ? 262 : 232) * s, box.w / most - 14), ch = Math.min(cw * .7, box.h / rws.length - (snake ? 16 : 30)), w = Math.min(cw, ch / .7);
        const gap = Math.min((box.h - rws.length * ch) / (rws.length + 1), 44 * s), y0 = box.y + (box.h - rws.length * ch - (rws.length - 1) * gap) / 2;
        rws.forEach((r, i) => {
          const step = Math.min(box.w / r.length, w + 70 * s), x0 = box.x + (box.w - step * r.length) / 2;
          r.forEach((u, j) => { const jj = snake && i % 2 ? r.length - 1 - j : j; put(u, { x: x0 + jj * step + (step - w) / 2, y: y0 + i * (ch + gap), w, h: ch }, { unit: true, z: 10, ord: line ? line.indexOf(u) + 1 : 0 }); });
        });
      };
      const kidsIn = (n, box, mode, maxW) => {       // a container's children inside a region of it: the same rule at every size
        const H0 = HOME[n.id], k = n.kids, cnt = k.length; if (!cnt) return;
        const z = n.depth * 10 + 10;
        if (H0 && !nar || (H0 && mode === 'tile')) {
          const w0 = Math.min(maxW * (cnt <= 3 && mode !== 'tile' ? 1.45 : 1), box.w * (cnt > 4 ? .27 : mode === 'tile' ? .3 : .36)), h0 = Math.min(w0 * .7, box.h * (cnt > 4 ? .29 : .44));
          k.forEach(c => {
            const p = (mode === 'tile' && H0.tile ? H0.tile.pos : H0.pos)[c.id] || [.5, .5], m = (H0.size || {})[c.id] || [1, 1], w = Math.min(h0 / .7, w0) * m[0], h = Math.min(h0, w0 * .7) * m[1];
            put(c, { x: clamp(box.x + p[0] * box.w - w / 2, box.x, box.x + box.w - w), y: clamp(box.y + p[1] * box.h - h / 2, box.y, box.y + box.h - h), w, h }, { mode, unit: mode === 'card', z });
          });
        } else {                                      // no hand-set places: a snake, in order, so a thread can run through it
          const wide = n === root && nar && cnt % 2 ? k[cnt - 1] : null, m = wide ? cnt - 1 : cnt;
          let cols = nar && mode !== 'tile' ? 2 : Math.max(1, Math.round(Math.sqrt(m * box.w / Math.max(1, box.h) / 1.15))); cols = Math.min(cols, m); if (mode === 'tile' && box.w / m >= 24) cols = m;
          const rws = Math.ceil(m / cols) + (wide ? 1 : 0), cw = box.w / cols, ch = box.h / rws, w = Math.min(maxW, cw * .9), h = Math.min(w * .7, ch * .86), w1 = Math.min(w, h / .7);
          k.forEach((c, i) => {
            if (c === wide) return put(c, { x: box.x + box.w * .04, y: box.y + (rws - 1) * ch + (ch - h) / 2, w: box.w * .92, h }, { mode, unit: mode === 'card', z });
            const r = Math.floor(i / cols), j = r % 2 && mode !== 'card' ? cols - 1 - i % cols : i % cols, cnt2 = r === Math.ceil(m / cols) - 1 ? m - r * cols : cols, off = (cols - cnt2) * cw / 2 * (r % 2 && mode !== 'card' ? -1 : 1);
            put(c, { x: box.x + j * cw + (cw - w1) / 2 + off, y: box.y + r * ch + (ch - h) / 2, w: w1, h }, { mode, unit: mode === 'card', z });
          });
        }
      };
      if (!open1) {
        if (line) { const per = line.length <= 4 ? line.length : line.length <= 6 || main.w / main.h < 1.9 ? 3 : 4, rws = []; for (let i = 0; i < line.length; i += per) rws.push(line.slice(i, i + per)); fitRows(nar ? line.reduce((a, u, i) => (i % 2 ? a[a.length - 1].push(u) : a.push([u]), a), []) : rws, main, true); }
        else if (rows) fitRows(nar ? rows.reduce((a, r) => { for (let i = 0; i < r.length; i += 3) a.push(r.slice(i, i + 3)); return a; }, []) : rows, main, false);
        else kidsIn(root, main, 'card', 288 * s);
      }
      if (flat) this.all.forEach(n => { if (n.dissolve && !T[n.id]) put(n, main, { a: 0, mode: 'gone' }); });
      // the open path: nested frames, each with its other children set aside inside it
      let F = main;
      P.forEach((n, i) => {
        const last = i === P.length - 1;
        put(n, F, { o: 1, f: last ? 1 : 0, mode: last ? 'open' : 'frame', unit: i === 0, z: flat ? 10 : n.depth * 10, ord: line ? line.indexOf(n) + 1 : 0 });
        if (!last) { const hh = nar ? 30 : 34, inner = rail(n.kids.filter(c => c !== P[i + 1]).map(c => c), { x: F.x + 8, y: F.y + hh + 2, w: F.w - 16, h: F.h - hh - 10 }, P.length - 2 - i); n.kids.forEach(c => { if (T[c.id] && c !== P[i + 1]) { T[c.id].unit = false; T[c.id].z = c.depth * 10; } }); F = inner; }
      });
      // everything else lives inside its parent
      const fill = n => {
        const t = T[n.id]; if (!t) return;
        if (n.kids.length && t.mode !== 'frame' && t.mode !== 'gone') {
          if (t.mode === 'open') { const hh = nar ? 50 : 60, th = this.textH(n, t.w); kidsIn(n, { x: t.x + 12, y: t.y + hh + th, w: t.w - 24, h: t.h - hh - th - 12 }, 'in', 288 * s); }
          else { const tb = (HOME[n.id] || {}).tile; kidsIn(n, tb ? { x: t.x + t.w * tb.box[0], y: t.y + t.h * tb.box[1], w: t.w * tb.box[2], h: t.h * tb.box[3] } : { x: t.x + t.w * .05, y: t.y + t.h * .07, w: t.w * .9, h: t.h * (n.kids.length > 4 ? (t.w / t.h > 2.6 ? .32 : .44) : .46) }, 'tile', t.w * .3); }
        }
        n.kids.forEach(c => { if (T[c.id]) { if (T[c.id].mode === 'tile') { T[c.id].a = t.a * (T[c.id].w < 9 ? 0 : 1); T[c.id].lead = t.lead; } fill(c); } });
      };
      units.forEach(u => { T[u.id].lead = u.id; }); root.kids.forEach(fill); if (flat) this.all.forEach(n => { if (n.dissolve) n.kids.forEach(fill); });
      return T;
    }
    textH(n, w) { const PK = f => window.EigenLevel ? window.EigenLevel.pick(f) : String(f == null ? '' : f); if (this.narrow) return Math.ceil((PK(n.line).length || 1) / Math.max(20, (w - 26) / 6.6)) * 19 + 12; const per = Math.max(20, (w - 44) / (this.narrow ? 6.9 : 7.7)); return Math.ceil((PK(n.text).replace(/<[^>]+>/g, '').length || 1) / per) * (this.narrow ? 21 : 24) + 16; }

    // ---- layout: sets every spring's goal; the frame loop does the moving -------------------------------------
    layout(snap, from) {
      const st = this.st, T = this.arrange(st, this.W, this.H), base = st.path.length ? this.arrange(Object.assign({}, st, { path: [] }), this.W, this.H) : T;
      this.base = base; this.T = T;
      const o = from || { x: this.W / 2, y: this.H / 2 }, delay = {};
      this.all.forEach(n => {
        const t = T[n.id]; n.T = t; if (!t || !n.el) return;
        n.fr = 0;
        const lead = this.N[t.lead] || n;
        if (!(lead.id in delay)) delay[lead.id] = snap ? 0 : Math.min(190, Math.hypot(lead.R.x + lead.R.w / 2 - o.x, lead.R.y + lead.R.h / 2 - o.y) * .22);
        const d = delay[lead.id], set = (sp, v) => snap ? sp.snap(v) : sp.to(v, d);
        if (!snap && n.a.v < .02 && n.a.goal < .02 && t.a > 0 && !n.R.w) { n.x.snap(t.x + t.w / 2); n.y.snap(t.y + t.h / 2); n.w.snap(0); n.h.snap(0); }
        set(n.x, t.x); set(n.y, t.y); set(n.w, t.w); set(n.h, t.h); set(n.a, t.a); set(n.o, t.o); set(n.f, t.f);
        if (n.bw && t.o < .5 && t.a > 0 && (t.w > n.bw * 1.03 || t.h > n.bh * 1.03)) { n.bw = Math.max(n.bw, t.w); n.bh = Math.max(n.bh, t.h); n.bg.style.width = n.bw.toFixed(1) + 'px'; n.bg.style.height = n.bh.toFixed(1) + 'px'; }   // a card about to grow is drawn at its larger size first, so it is never blurred
        const e = n.el, open = t.mode === 'open', wasOpen = e.dataset.mode === 'open';
        e.dataset.mode = t.mode; e.style.setProperty('--ow', t.w + 'px'); e.style.setProperty('--oh', t.h + 'px'); e.style.setProperty('--th', (n.kids.length ? this.textH(n, t.w) : 0) + 'px');
        e.classList.toggle('ep-wide', open && t.w >= 900); e.classList.toggle('ep-lone', !!t.lone);
        e.setAttribute('aria-expanded', open || t.mode === 'frame'); e.tabIndex = (t.unit || t.mode === 'in') && !open ? 0 : -1;
        n.in.inert = !open; n.z = t.z;
        e.classList.toggle('ep-has-line', t.w >= 236 && t.h >= 126 && (t.mode === 'card' || t.mode === 'in'));
        e.classList.toggle('ep-has-go', t.w >= 104 && t.h >= 70 && (t.mode === 'card' || t.mode === 'in'));
        if (t.ord) n.ordEl.textContent = t.ord; e.classList.toggle('ep-has-ord', !!t.ord && t.mode !== 'frame');
        if (open && !wasOpen) this.opened(n); if (!open && wasOpen) this.closed(n);
        if (open) { const i = st.order ? st.order.indexOf(n.id) : -1, wk = e.querySelector('.ep-walk'); wk.hidden = i < 0; if (i >= 0) { wk.querySelector('b').textContent = `${i + 1} of ${st.order.length}`; wk.querySelector('.ep-prev').disabled = i === 0; wk.querySelector('.ep-next').disabled = i === st.order.length - 1; } }
      });
      const deep = this.N[st.path[st.path.length - 1]];
      const seen = {};
      this.links.forEach(l => { const a = l.A = this.shown(l.a, T), b = l.B = this.shown(l.b, T), ta = T[a.id], tb = T[b.id], key = a.id + '>' + b.id, dup = seen[key] || seen[b.id + '>' + a.id]; seen[key] = 1;
        const L = this.layers[st.order || st.lift !== 'part' ? 1 : Math.min(5, Math.min(a.depth, b.depth))]; if (l.el.parentNode !== L) { L.appendChild(l.el); L.appendChild(l.head); L.appendChild(l.lab); }
        const on = ta && tb && ta.a > 0 && tb.a > 0 && a !== b && !dup, inP = x => st.path.includes(x.id), inD = x => deep && x.parent === deep;
        l.o.to(!on ? 0 : !deep ? 1 : inD(a) && inD(b) ? 1 : inP(a) || inP(b) ? .7 : inD(a) || inD(b) ? .05 : .12); l.near = 0; });
      // the reading thread: one path per consecutive pair, kept while the pair survives
      const want = new Map(); if (st.order) st.order.forEach((id, i) => { if (i) want.set(st.order[i - 1] + '>' + id, [this.N[st.order[i - 1]], this.N[id]]); });
      if (!st.order && !st.path.length && st.lift === 'part') this.all.forEach(n => { if (n.kids.length && !HOME[n.id]) n.kids.forEach((c, i) => { if (i) want.set(n.kids[i - 1].id + '>' + c.id, [n.kids[i - 1], c]); }); });
      this.all.forEach(n => { if (n.kids.length && !HOME[n.id] && n !== this.root) n.kids.forEach((c, i) => { if (i) want.set(n.kids[i - 1].id + '>' + c.id, [n.kids[i - 1], c]); }); });
      want.forEach((p, key) => { if (!this.routes.has(key)) { const e = sv('path', 'ep-route'); this.layers[Math.min(5, Math.max(p[0].depth, p[1].depth))].appendChild(e); this.routes.set(key, { a: p[0], b: p[1], el: e, o: new Sp(0) }); } });
      this.routes.forEach((r, key) => r.o.to(want.has(key) ? 1 : 0));
      this.dim.to(st.order ? .34 : 1);
      this.map.layout(snap);
      this.sync();
      this.moving = true;
    }
    intro() { if (M.off) return; this.root.kids.forEach((n, i) => { const sub = []; (function w(k) { sub.push(k); k.kids.forEach(w); })(n); sub.forEach(k => { const a = k.a.g; k.a.snap(0); k.a.to(a, 140 + i * 95); }); }); }
    sync() {                                          // every lit control and every label is read from the state, never from the last press
      const st = this.st, t = this.tray;
      t.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', st.q === b.dataset.q));
      t.querySelectorAll('[data-r]').forEach(b => b.classList.toggle('on', !st.q && st.orderName === b.dataset.r));
      t.querySelectorAll('[data-l]').forEach(b => b.classList.toggle('on', b.dataset.l === 'pick' ? st.pick || (!st.order && !!st.lift.from) : !st.order && !st.pick && st.lift === b.dataset.l));
      const mo = t.querySelector('.ep-motion'); mo.textContent = M.off ? 'Motion is off. Turn it on' : 'Turn motion off';
      this.app.classList.toggle('ep-pick', !!st.pick); this.app.classList.toggle('ep-open', st.path.length > 0);
      this.resetEl.hidden = !(st.order || st.lift !== 'part' || st.q) || st.path.length > 0;
      const crumbs = [this.root.title].concat(st.path.map(id => this.N[id].title));
      t.querySelector('.ep-where').textContent = st.path.length ? crumbs.join(' › ') : this.ghost ? 'This page is the gold box in the map of EigenEngine.' : 'The whole of ' + this.root.title + '. Open any card.';
    }

    // ---- the frame ---------------------------------------------------------------------------------------------
    frame(now) {
      requestAnimationFrame(this.frame);
      if (document.hidden) { this.last = 0; return; }
      const dt = (this.last ? Math.min(.05, (now - this.last) / 1000) : .016) * (M.rate || 1); this.last = now; this.tick++;
      const t = (now - this.t0) / 1000;
      let moving = this.pulses.length > 0, rebased = false;
      moving = this.dim.tick(dt, now) || moving;
      this.all.forEach(n => {
        if (!n.el) return;
        let mv = false; for (const s of [n.x, n.y, n.w, n.h, n.o, n.a, n.f, n.heat]) mv = s.tick(dt, now) || mv;
        moving = moving || mv;
        const R = n.R; R.x = n.x.v; R.y = n.y.v; R.w = Math.max(0, n.w.v); R.h = Math.max(0, n.h.v); n.vis = clamp(n.a.v);
        const e = n.el, s = e.style, show = n.vis > .012 && R.w > 3;
        if (mv || n.fr < 2) {
          n.fr++;
          if (!show) { if (s.display !== 'none') s.display = 'none'; }
          else {
            if (s.display === 'none') s.display = '';
            const o = clamp(n.o.v), fs = clamp(R.w * .074, 10.5, this.narrow ? 17 : 22 * Math.max(1, (this.s || 1) * .82)) * (1 - .26 * (o - clamp(n.f.v)) * (R.w > 300 ? 1 : 0));
            s.transform = `translate3d(${R.x.toFixed(2)}px,${R.y.toFixed(2)}px,0)`; s.width = R.w.toFixed(2) + 'px'; s.height = R.h.toFixed(2) + 'px';
            s.opacity = n.vis.toFixed(3); s.zIndex = n.z + (o > .04 ? 2 : 0);
            s.setProperty('--o', o.toFixed(3)); s.setProperty('--f', clamp(n.f.v).toFixed(3)); s.setProperty('--heat', clamp(n.heat.v).toFixed(3));
            if (!n.bw) { n.bw = Math.max(40, R.w); n.bh = Math.max(28, R.h); n.bg.style.width = n.bw.toFixed(1) + 'px'; n.bg.style.height = n.bh.toFixed(1) + 'px'; }
            const k = Math.max(R.w / n.bw, R.h / n.bh); n.bg.style.transform = `translate(${((R.w - n.bw * k) / 2).toFixed(2)}px,${((R.h - n.bh * k) / 2).toFixed(2)}px) scale(${k.toFixed(4)})`;
            s.setProperty('--tt', clamp((R.w - 84) / 14).toFixed(3)); s.setProperty('--tl', (clamp((R.w - 226) / 10) * clamp((R.h - 118) / 10)).toFixed(3)); s.setProperty('--fs', fs.toFixed(2));
          }
        }
        if (!mv && show && !rebased && n.o.v < .5 && (Math.abs(R.w - n.bw) > 1.5 || Math.abs(R.h - n.bh) > 1.5)) { rebased = true; n.bw = Math.max(40, R.w); n.bh = Math.max(28, R.h); n.bg.style.width = n.bw.toFixed(1) + 'px'; n.bg.style.height = n.bh.toFixed(1) + 'px'; n.fr = 0; }
        if (n.want && n.o.v > .88) { n.want = false; this.mount(n); }
        if (n.art && show && n.o.v < .97 && !M.off && (this.tick + n.depth) % (R.w < 96 ? 3 : this.moving ? 2 : 1) === 0) n.art.tick(t);
      });
      this.links.forEach(l => { moving = l.o.tick(dt, now) || moving; moving = l.hot.tick(dt, now) || moving; }); this.routes.forEach(r => { moving = r.o.tick(dt, now) || moving; });
      if (moving || this.moving) this.drawLinks(dt, now);
      this.drawPulses(now);
      this.map.frame(dt, now, t);
      this.moving = moving;
    }
    edge(A, B, i, bowK = 1) {                         // from the edge of one rectangle to the edge of the other, slightly bowed
      const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2, dx = bx - ax, dy = by - ay;
      const out = r => Math.min(dx ? (r.w / 2 + 3) / Math.abs(dx) : 9, dy ? (r.h / 2 + 3) / Math.abs(dy) : 9, 1);
      let ta = out(A), tb = out(B); if (ta + tb > .98) { const k = .98 / (ta + tb); ta *= k; tb *= k; }
      const x1 = ax + dx * ta, y1 = ay + dy * ta, x2 = bx - dx * tb, y2 = by - dy * tb;
      const len = Math.hypot(x2 - x1, y2 - y1) || 1, bow = (i % 2 ? 1 : -1) * Math.min(20, len * .08) * bowK;
      return { x1, y1, x2, y2, mx: (x1 + x2) / 2 - (y2 - y1) / len * bow, my: (y1 + y2) / 2 + (x2 - x1) / len * bow };
    }
    drawLinks(dt, now) {
      const dim = this.dim.v;
      this.links.forEach((l, i) => {
        const a = l.A || l.a, b = l.B || l.b, small = Math.min(a.R.w, b.R.w), hot = clamp(Math.max(l.hot.v, l.near || 0));
        const op = Math.min(a.vis, b.vis) * mix(clamp(l.o.v), l.o.g > 0 ? 1 : clamp(l.o.v), hot) * (small < 9 ? 0 : small < 60 ? .5 : .9) * mix(dim, 1, hot);
        const show = op > .02;
        for (const e of [l.el, l.head, l.lab]) { const d = show ? '' : 'none'; if (e.style.display !== d) e.style.display = d; }
        if (!show) return;
        const p = l.p = this.edge(a.R, b.R, i);
        l.el.setAttribute('d', `M${p.x1.toFixed(1)} ${p.y1.toFixed(1)}Q${p.mx.toFixed(1)} ${p.my.toFixed(1)} ${p.x2.toFixed(1)} ${p.y2.toFixed(1)}`);
        l.el.style.opacity = op.toFixed(3); l.el.style.setProperty('--hot', hot.toFixed(3));
        l.head.setAttribute('cx', p.x2.toFixed(1)); l.head.setAttribute('cy', p.y2.toFixed(1)); l.head.style.opacity = op.toFixed(3);
        const lo = hot * (small < 60 || Math.hypot(p.x2 - p.x1, p.y2 - p.y1) < 70 ? 0 : 1) * op; l.lab.style.opacity = lo.toFixed(3);
        if (lo > .02) { l.lab.setAttribute('x', (.25 * p.x1 + .5 * p.mx + .25 * p.x2).toFixed(1)); l.lab.setAttribute('y', (.25 * p.y1 + .5 * p.my + .25 * p.y2 - 5).toFixed(1)); }
      });
      this.routes.forEach((r, key) => {
        const op = Math.min(r.a.vis, r.b.vis) * clamp(r.o.v) * (Math.min(r.a.R.w, r.b.R.w) < 9 ? 0 : 1);
        if (op < .02) { if (r.el.style.display !== 'none') r.el.style.display = 'none'; if (r.o.goal < .5 && r.o.v < .02) { r.el.remove(); this.routes.delete(key); } return; }
        if (r.el.style.display === 'none') r.el.style.display = '';
        const p = this.edge(r.a.R, r.b.R, 0, .6);
        r.el.setAttribute('d', `M${p.x1.toFixed(1)} ${p.y1.toFixed(1)}Q${p.mx.toFixed(1)} ${p.my.toFixed(1)} ${p.x2.toFixed(1)} ${p.y2.toFixed(1)}`); r.el.style.opacity = op.toFixed(3);
        r.el.style.strokeWidth = Math.min(r.a.R.w, r.b.R.w) < 60 ? 1.2 : 2.6;
      });
    }
    pulse(l, back, delay = 0, dur = 1000) { if (M.off) return; const dot = sv('circle', 'ep-pulse', { r: 4.4 }); this.layers[5].appendChild(dot); this.pulses.push({ l, back, t0: performance.now() + delay, dur, dot }); }
    drawPulses(now) {
      this.pulses = this.pulses.filter(p => {
        const u = (now - p.t0) / p.dur, q = p.l.p;
        if (u >= 1 || !q) { p.dot.remove(); return false; }
        if (u < 0) { p.dot.style.opacity = 0; return true; }
        let e = u * u * (3 - 2 * u); if (p.back) e = 1 - e;
        p.dot.setAttribute('cx', ((1 - e) * (1 - e) * q.x1 + 2 * e * (1 - e) * q.mx + e * e * q.x2).toFixed(1));
        p.dot.setAttribute('cy', ((1 - e) * (1 - e) * q.y1 + 2 * e * (1 - e) * q.my + e * e * q.y2).toFixed(1));
        p.dot.style.opacity = Math.sin(Math.PI * u).toFixed(3);
        return true;
      });
    }
    hover(n, on) {
      this.hovering = on;
      const u = n; this.links.forEach(l => { const a = l.A || l.a, b = l.B || l.b; l.hot.to(on && (a === u || b === u || l.a === u || l.b === u) ? 1 : 0); });
      this.map.hint(on ? n : null); this.moving = true;
    }

    // ---- what the reader can do ----------------------------------------------------------------------------------
    chain(id) { const out = []; for (let n = this.N[id]; n && n !== this.root; n = n.parent) out.unshift(n.id); return out; }
    go(id, pt) {
      const st = this.st, n = this.N[id]; if (!n || n === this.root) return;
      this.finish();
      const flat = !!st.order || st.lift !== 'part';
      if (flat && !this.unitable(id)) { st.order = null; st.orderName = null; st.q = null; st.lift = 'part'; this.heat({}); this.say('“' + n.title + '” is a container, so the graph returns to “is part of” to open it.'); }
      st.path = (!!st.order || st.lift !== 'part') ? [id] : this.chain(id);
      if (this.visited[this.visited.length - 1] !== id) this.visited.push(id);
      try { window.EigenShell && window.EigenShell.visit(id); } catch (err) {}
      this.place(pt); this.hash(); this.here();
    }
    back() {
      const st = this.st; if (!st.path.length) return;
      this.finish();
      const was = this.N[st.path.pop()];
      this.place({ cx: was.R.x + was.R.w / 2, cy: was.R.y + was.R.h / 2 }); this.hash(); this.here();
      if (was.el) try { was.el.focus({ preventScroll: true }); } catch (e) {}
    }
    here() { const st = this.st, n = this.N[st.path[st.path.length - 1]]; if (st.q || st.orderName) { if (!n) return; } this.say(!n ? (st.order || st.lift !== 'part' ? '' : 'Open any card. Each one holds more cards, or a demonstration of its idea.') : n.kids.length ? `“${n.title}” holds ${['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n.kids.length] || n.kids.length} more cards. Open one, or press the empty stage to step back out.` : ''); }
    walk(dir) { const st = this.st, i = st.order ? st.order.indexOf(st.path[st.path.length - 1]) : -1; if (i < 0) return; const j = clamp(i + dir, 0, st.order.length - 1); if (j !== i) this.go(st.order[j]); }
    place(pt) { this.acted = performance.now(); const r = this.stage.getBoundingClientRect(); this.layout(false, pt ? (pt.cx != null ? { x: pt.cx, y: pt.cy } : { x: pt.x - r.left, y: pt.y - r.top }) : null); }
    hash() { const p = this.st.path; try { history.replaceState(null, '', p.length ? '#' + p[p.length - 1] : location.pathname + location.search); } catch (e) {} }
    home() { this.finish(); const st = this.st; st.order = null; st.orderName = null; st.q = null; st.lift = 'part'; st.pick = false; this.heat({}); this.layout(); this.say('The graph as it is stored: each card inside the card it is part of.'); }
    lift(name) {
      this.finish(); const st = this.st, same = !st.order && JSON.stringify(st.lift) === JSON.stringify(name);
      const open = st.path[st.path.length - 1];
      st.order = null; st.orderName = null; st.q = null; st.pick = false; st.lift = name; this.heat({});
      if (name === 'support' && !this.rowsSupport(this.flatUnits())) st.lift = 'part';
      st.path = open && (st.lift === 'part' ? true : this.unitable(open)) ? (st.lift === 'part' ? this.chain(open) : [open]) : [];
      this.layout();
      const D = this.data.liftSay || {}, from = name.from ? this.N[name.from].title : '';
      this.say(name.from ? `Lifted from “${from}”. The cards linked to it hang beneath it, nearest first, and the boxes that held them are gone.` : D[name] || '', same);
    }
    pick() { this.finish(); const st = this.st; st.pick = !st.pick; this.sync(); this.say(st.pick ? 'Choose any card. The graph will be lifted from it, and the rest will hang beneath.' : ''); }
    readAs(id) {
      this.finish(); const st = this.st, r = this.readers.find(x => x.id === id); if (!r) return;
      const off = !st.q && st.orderName === id;
      st.q = null; st.pick = false; this.heat({}); st.order = off ? null : r.order.slice(); st.orderName = off ? null : id; st.path = []; this.hash();
      this.layout(); this.say(off ? 'The graph as it is stored: each card inside the card it is part of.' : r.say);
    }
    heat(w) { this.lastHeat = w; this.all.forEach(n => { let v = w[n.id] || 0; if (n.kids.length) v = Math.max(v, n.kids.reduce((s, k) => s + (w[k.id] || 0), 0) * .6); n.heat.to(clamp(v)); if (n.sumEl) n.el.classList.toggle('ep-has-sum', false); }); }
    diffuse(seed) {
      const U = this.flatUnits(), L = this.flatLinks(), adj = {}; U.forEach(u => adj[u.id] = []);
      L.forEach(l => { if (adj[l.a.id] && adj[l.b.id]) { adj[l.a.id].push(l.b.id); adj[l.b.id].push(l.a.id); } });
      let w = {}; U.forEach(u => w[u.id] = seed[u.id] || 0);
      for (let r = 0; r < 3; r++) { const nx = {}; U.forEach(u => nx[u.id] = .58 * w[u.id] + .42 * adj[u.id].reduce((t, j) => t + w[j] / (adj[j].length || 1), 0)); w = nx; }
      const max = Math.max(...Object.values(w)) || 1; U.forEach(u => w[u.id] /= max);
      return w;
    }
    ask(id) {
      const st = this.st, q = this.questions.find(x => x.id === id); if (!q) return;
      const off = st.q === id; this.finish();
      if (off) return this.home();
      st.q = id; st.order = null; st.orderName = null; st.lift = 'part'; st.pick = false; st.path = []; this.hash();
      const seed = {}; Object.keys(q.seed).forEach(k => { if (this.N[k]) seed[k] = q.seed[k]; });
      const w = this.diffuse(seed), U = this.flatUnits(), top = U.slice().sort((a, b) => w[b.id] - w[a.id]), heavy = top[0];
      const keep = top.filter((u, i) => i < 6 && w[u.id] > .3), order = q.order ? q.order.filter(k => this.N[k] && this.unitable(k)) : keep.sort((a, b) => this.layer(a) - this.layer(b) || w[b.id] - w[a.id]).map(u => u.id);
      const steps = [
        [0, () => { this.heat(seed); this.layout(); this.say('The question places weight on the cards it matches.'); }],
        [2300, () => { this.heat(w); this.flatLinks().forEach((l, i) => { const a = seed[l.a.id] || 0, b = seed[l.b.id] || 0; if (a > b) this.pulse(l.l, false, i * 50); else if (b > a) this.pulse(l.l, true, i * 50); }); this.sums(w); this.say('The weight spreads along the links, and each container reports what has collected inside it. This is <i>query diffusion</i>.'); }],
        [5000, () => { st.lift = { from: heavy.id }; this.layout(); this.say(`The graph is lifted from the heaviest card, “${heavy.title}”, and the rest hang beneath it.`); }],
        [7900, () => { st.order = order; st.orderName = 'q:' + id; this.layout(); this.say(q.say || 'It straightens into a reading order for this question. Open the first card and follow the numbers.'); }]
      ];
      this.seq = steps; this.seqAt = 0;
      steps.forEach(([ms, fn], i) => this.timers.push(setTimeout(() => { this.seqAt = i + 1; fn(); if (i === steps.length - 1) this.seq = null; }, M.off ? 0 : ms)));
    }
    sums(w) { const tot = Object.values(w).reduce((a, b) => a + b, 0) || 1; this.all.forEach(n => { if (!n.kids.length || n === this.root || !n.sumEl) return; const s = n.kids.reduce((t, k) => t + (w[k.id] || 0), 0); n.sumEl.textContent = 'holds ' + Math.round(100 * s / tot) + '%'; n.el.classList.toggle('ep-has-sum', s > 0); }); }
    finish() { this.timers.forEach(clearTimeout); this.timers = []; if (this.seq) { const rest = this.seq.slice(this.seqAt); this.seq = null; const off = M.off; rest.forEach(([, fn]) => fn()); } }
    say(html, again) {
      const p = this.sayEl; clearTimeout(this.sayT);
      if (p.dataset.t === html && !again) return; p.dataset.t = html; p.style.opacity = 0;
      this.sayT = setTimeout(() => { p.innerHTML = html; p.style.opacity = html ? 1 : 0; }, M.off ? 0 : 180);
    }

    // ---- the inside of a leaf: one live exhibit, with steps the reader or the page can take ---------------------
    opened(n) {
      const X = n.d.exhibit; if (!X || !X.mount) return;
      clearTimeout(n.killT);
      n.exHost = n.el.querySelector('.ep-ex');
      if (!n.ex) { if (M.off) this.mount(n); else n.want = true; } else this.step(n, n.stepAt || 0);
    }
    mount(n) { const X = n.d.exhibit, host = n.exHost; if (!host || n.el.dataset.mode !== 'open' || n.ex) return; const r = host.getBoundingClientRect(); if (!host.dataset.epHeard) { host.dataset.epHeard = '1'; host.addEventListener('eigen-exhibit-change', () => this.stopAuto(n)); } try { n.ex = X.mount(host, { compact: r.width < 900, onStep: i => this.follow(n, i) }) || {}; } catch (err) { n.ex = {}; } host.classList.remove('ep-in-view'); void host.offsetWidth; host.classList.add('ep-in-view'); this.step(n, 0); this.auto(n); }
    closed(n) { n.want = false; this.stopAuto(n); clearTimeout(n.killT); n.killT = setTimeout(() => { if (n.el.dataset.mode === 'open' || !n.ex) return; try { n.ex.destroy && n.ex.destroy(); } catch (e) {} n.ex = null; n.exHost.innerHTML = ''; }, 900); }
    remount() { this.all.forEach(n => { if (n.ex && n.el.dataset.mode === 'open') { this.stopAuto(n); try { n.ex.destroy && n.ex.destroy(); } catch (e) {} n.ex = null; n.exHost.innerHTML = ''; this.opened(n); } }); }
    follow(n, i) { if (i == null || i < 0 || i === n.stepAt) return; this.step(n, i, false, true); }   // the exhibit moved itself: the buttons and caption follow
    step(n, i, byHand, told) {
      const X = n.d.exhibit, S = X && X.steps || []; if (!S[i]) return;
      if (byHand) this.stopAuto(n);
      n.stepAt = i; if (!told) { try { n.ex && n.ex.step && n.ex.step(i); } catch (e) {} }
      n.el.querySelectorAll('.ep-steps button').forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('done', j < i); });
      const cap = n.el.querySelector('.ep-cap'); clearTimeout(n.capT); cap.style.opacity = 0; n.capT = setTimeout(() => { cap.innerHTML = S[i].caption || ''; cap.style.opacity = 1; }, M.off ? 0 : 170);
    }
    auto(n) { const S = n.d.exhibit.steps || []; if (M.off || S.length < 2) return; n.el.classList.add('ep-auto'); const next = () => { n.autoT = setTimeout(() => { if (n.stepAt >= S.length - 1) return this.stopAuto(n); this.step(n, n.stepAt + 1); next(); }, (S[n.stepAt] && S[n.stepAt].hold) || 4200); }; next(); }
    stopAuto(n) { clearTimeout(n.autoT); n.autoT = 0; n.el.classList.remove('ep-auto'); }
  }

  /* The mini-page: the same arrangement, with nothing open, drawn small. It shows every node and link, where the
     reader is, where they have been, and where the weight of a question lies. A node in it can be chosen directly. */
  class Mini {
    constructor(P, host) {
      this.P = P; this.host = host; this.svg = host.querySelector('svg'); this.it = {};
      const S = this.S = P.ghost || P;                 // what the map shows: this page's tree, or the whole site on a node's own page
      this.gL = this.svg.appendChild(sv('g')); this.gN = this.svg.appendChild(sv('g')); this.trail = this.svg.appendChild(sv('path', 'ep-m-trail')); this.you = this.svg.appendChild(sv('circle', 'ep-m-you', { r: 5 }));
      S.all.forEach(n => {
        if (n === S.root && n.kids.length) return;
        const mine = P.N[n.id] && P.N[n.id] !== P.root, r = this.gN.appendChild(sv('rect', 'ep-m-n' + (n.kids.length ? ' ep-m-box' : '') + (n.ground ? ' ep-g-' + n.ground : '') + (P.ghost && !P.N[n.id] ? ' ep-m-out' : '') + (P.ghost && n.id === P.rootId ? ' ep-m-root' : ''), { rx: 2.5 }));
        r.addEventListener('click', () => { if (!mine) { location.href = n.id === P.rootId ? location.pathname : (n.g.page && !n.kids.length ? n.g.page : '/eigenengine.html#' + n.id); return; } P.st.pick ? (P.st.pick = false, P.lift({ from: P.liftable(P.N[n.id]).id })) : P.go(n.id); });
        r.addEventListener('pointerenter', () => this.hint(n)); r.addEventListener('pointerleave', () => this.hint(null));
        const t = sv('title'); t.textContent = n.title; r.appendChild(t);
        const lab = n.parent === S.root && n.d.short ? this.gN.appendChild(sv('text', 'ep-m-t')) : null; if (lab) lab.textContent = n.d.short;
        this.it[n.id] = { n, r, lab, x: new Sp(0), y: new Sp(0), w: new Sp(0), h: new Sp(0), a: new Sp(1) };
      });
      this.lk = S.links.map(l => ({ l, e: this.gL.appendChild(sv('path', 'ep-m-l ep-m-l-' + l.kind.replace(/\s/g, '-'))) }));
    }
    layout(snap) {
      const P = this.P, S = this.S, W = P.ghost ? 1060 : P.W, H = P.ghost ? 740 : P.H - P.capH;
      const B = this.B = P.ghost ? S.arrange({ lift: 'part', order: null, path: [] }, W, H) : P.base; this.moving = true;
      this.svg.setAttribute('viewBox', `0 0 ${W.toFixed(0)} ${H.toFixed(0)}`); this.svg.style.aspectRatio = `${W.toFixed(0)} / ${H.toFixed(0)}`;
      const path = P.st.path, here = path[path.length - 1] || (P.ghost ? P.rootId : null);
      for (const id in this.it) { const m = this.it[id], t = B[id]; if (!t) continue; const set = (s, v) => snap ? s.snap(v) : s.to(v); set(m.x, t.x); set(m.y, t.y); set(m.w, t.w); set(m.h, t.h); set(m.a, t.a); m.r.classList.toggle('on', path.includes(id)); m.r.classList.toggle('here', here === id); m.r.classList.toggle('seen', P.visited.includes(id)); }
    }
    hint(n) { const w = this.P.tray.querySelector('.ep-where'); if (n) { this.keep = this.keep == null ? w.textContent : this.keep; w.textContent = n.title; } else if (this.keep != null) { w.textContent = this.keep; this.keep = null; this.P.sync(); } }
    frame(dt, now, t) {
      const P = this.P, S = this.S; let mv = false;
      for (const id in this.it) { const m = this.it[id]; for (const s of [m.x, m.y, m.w, m.h, m.a]) mv = s.tick(dt, now) || mv; }
      const heatMv = P.all.some(n => Math.abs(n.heat.g - n.heat.v) > .004);
      if (mv || this.moving || heatMv) {
        for (const id in this.it) { const m = this.it[id], r = m.r, live = P.N[id]; r.setAttribute('x', m.x.v.toFixed(1)); r.setAttribute('y', m.y.v.toFixed(1)); r.setAttribute('width', Math.max(0, m.w.v).toFixed(1)); r.setAttribute('height', Math.max(0, m.h.v).toFixed(1)); r.style.opacity = clamp(m.a.v).toFixed(2); r.style.setProperty('--heat', live ? clamp(live.heat.v).toFixed(2) : 0); if (m.lab) { const flat = !!P.st.order || P.st.lift !== 'part'; m.lab.style.display = flat && !P.ghost ? 'none' : ''; m.lab.setAttribute('x', (m.x.v + m.w.v / 2).toFixed(1)); m.lab.setAttribute('y', (m.y.v + m.h.v - Math.min(22, m.h.v * .14)).toFixed(1)); m.lab.style.opacity = clamp(m.a.v) * (m.w.v > 90 ? 1 : 0); } }
        const c = id => { const m = this.it[id]; return m ? [m.x.v + m.w.v / 2, m.y.v + m.h.v / 2] : null; };
        this.lk.forEach(k => { const a = c(S.shown(k.l.a, this.B).id), b = c(S.shown(k.l.b, this.B).id); if (a && b) k.e.setAttribute('d', `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`); });
        const pts = P.visited.map(c).filter(Boolean); this.trail.setAttribute('d', pts.length > 1 ? 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') : '');
      }
      const here = P.st.path[P.st.path.length - 1] || (P.ghost ? P.rootId : null), p = here && this.it[here];
      if (p) { this.you.style.opacity = 1; this.you.setAttribute('cx', (p.x.v + p.w.v / 2).toFixed(1)); this.you.setAttribute('cy', (p.y.v + p.h.v / 2).toFixed(1)); this.you.setAttribute('r', (Math.max(16, Math.min(p.w.v, p.h.v) * .5) * (1 + .22 * Math.sin(t * 2.6))).toFixed(1)); } else this.you.style.opacity = 0;
      this.moving = mv;
    }
  }

  window.EigenPattern = Pattern;
})();
