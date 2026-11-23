/* The interface at work: shared behaviour for the session film, the worked simulation and the project record.
   Everything that moves is a spring from /assets/js/eigen-motion.js, so motion runs unless the reader turns it off
   with the page's own switch. Each page fits one screen: a part opens in the stage from its card, and the address
   (#id) follows, so every old link into these pages still lands on the right part and the right stop. */
(() => {
  'use strict';
  const EM = window.EigenMotion, M = window.EG_MOTION; if (!EM) return;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = EM.clamp, smooth = EM.smooth;
  document.documentElement.classList.add('ifc-on');

  /* one frame loop for the page; it sleeps when nothing is moving */
  const tickers = new Set(); let raf = 0, last = 0;
  const frame = now => { raf = 0; if (!(now > last)) { raf = requestAnimationFrame(frame); return; } const dt = Math.min(.064, (now - last) / 1000); last = now; let alive = false; tickers.forEach(t => { if (t(dt, now)) alive = true; }); if (alive) raf = requestAnimationFrame(frame); };
  const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stepAll = (springs, dt) => { let moving = false; for (let left = dt; left > 1e-5; left -= .008) { const st = Math.min(.008, left); moving = false; for (const s of springs) if (s.step(st)) moving = true; } return moving; };
  const setHash = id => { if (id && location.hash !== '#' + id) history.replaceState(history.state, '', '#' + id); };

  $$('[data-ifc-motion], [data-film-play]').forEach(b => { b.hidden = false; });
  $$('[data-ifc-motion]').forEach(b => { const label = () => b.textContent = M.off ? 'Turn motion on' : 'Turn motion off'; b.addEventListener('click', () => { M.off = !M.off; try { localStorage.setItem('eg-motion', M.off ? 'off' : 'on'); } catch (e) {} label(); wake(); }); label(); });

  /* ---- a camera over the interface's own screens: one window, several stops, each a screen and where to look ---- */
  class Tour {
    constructor(root, opts = {}) {
      this.root = root; this.win = $('.ifc-window', root); this.stops = $$('.ifc-stop:not(.ifc-rec-note)', root); this.i = -1; this.zoomed = false; this.playing = false; this.opts = opts;
      this.scene = el('div', 'ifc-scene'); this.win.prepend(this.scene); this.ring = el('span', 'ifc-ring'); this.ringO = new EM.Spring(0);
      this.cam = { x: new EM.Spring(.5, 44, 13.2), y: new EM.Spring(.5, 44, 13.2), z: new EM.Spring(1, 44, 13.2) };
      this.layers = this.stops.map(st => {
        const img = $('figure img', st), layer = el('div', 'ifc-layer'); if (img) { img.loading = 'eager'; img.removeAttribute('fetchpriority'); layer.appendChild(img); } this.scene.appendChild(layer);
        const r = (st.dataset.region || '').split(',').map(Number), f = [st.dataset.focusX, st.dataset.focusY].map(Number);
        const region = r.length === 4 ? { x: r[0], y: r[1], w: r[2], h: r[3] } : (f[0] ? { x: clamp(f[0] - .27, 0, .46), y: clamp(f[1] - .27, 0, .46), w: .54, h: .54 } : null);
        return { st, layer, region, crop: st.dataset.crop ? new EM.Spring(1, 120, 22) : null, o: new EM.Spring(0, 120, 22), iw: img ? +img.getAttribute('width') : 16, ih: img ? +img.getAttribute('height') : 9 };
      });
      this.scene.appendChild(this.ring);
      this.buttons = this.layers.map((L, i) => { const b = el('button', 'ifc-btn', `<span>${i + 1}</span>${L.st.dataset.short || $('h3', L.st).textContent}`); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { this.stop(); this.go(i); }); return b; });
      const bar = $('.ifc-steps', root); if (bar) this.layers.forEach((L, i) => { if (L.st.dataset.group) bar.appendChild(el('span', 'ifc-group', L.st.dataset.group)); bar.appendChild(this.buttons[i]); });
      this.count = $('.ifc-count', root);
      const on = (sel, fn) => { const b = $(sel, root); if (b) { b.hidden = false; b.addEventListener('click', fn); } return b; };
      on('[data-tour="prev"]', () => { this.stop(); this.go((this.i + this.layers.length - 1) % this.layers.length); });
      on('[data-tour="next"]', () => { this.stop(); this.go((this.i + 1) % this.layers.length); });
      this.playBtn = on('[data-tour="play"]', () => this.playing ? this.stop() : this.play());
      this.zoomBtn = on('[data-tour="zoom"]', () => { this.stop(); this.zoom(!this.zoomed); });
      if (!this.layers.some(L => L.region)) { if (this.zoomBtn) this.zoomBtn.remove(); this.zoomBtn = null; this.win.style.cursor = 'default'; }
      this.win.addEventListener('click', ev => { const L = this.layers[this.i]; if (ev.target.closest('video, a, button, .ifc-rec') || !L || !L.region || L.crop) return; this.stop(); this.zoom(!this.zoomed); });
      new ResizeObserver(() => { this.fit(); this.draw(); }).observe(this.win);
      tickers.add(dt => this.tick(dt));
    }
    fit() { const W = this.win.clientWidth, H = this.win.clientHeight; this.W = W; this.H = H; this.layers.forEach(L => { const f = Math.min((W - 16) / L.iw, (H - 16) / L.ih); L.f = f; L.w = L.iw * f; L.h = L.ih * f; L.left = (W - L.w) / 2; L.top = (H - L.h) / 2; Object.assign(L.layer.style, { width: L.w + 'px', height: L.h + 'px', left: L.left + 'px', top: L.top + 'px' }); }); }
    aim() {
      const L = this.layers[this.i]; if (!L) return; const r = this.zoomed && L.region;
      if (r) { const z = clamp(Math.min(this.W / (r.w * L.w), this.H / (r.h * L.h)) * .9, 1, 2.2); this.cam.x.to(r.x + r.w / 2); this.cam.y.to(r.y + r.h / 2); this.cam.z.to(z); } else { this.cam.x.to(.5); this.cam.y.to(.5); this.cam.z.to(1); }
      this.ringO.to(!this.zoomed && L.region ? 1 : 0); this.win.classList.toggle('is-zoomed', !!r); if (L.crop) L.crop.to(r ? 1 : 0);
      if (this.zoomBtn) { this.zoomBtn.textContent = this.zoomed ? 'Whole screen' : 'Look closer'; this.zoomBtn.disabled = !L.region; this.zoomBtn.hidden = !!L.crop; }
      wake();
    }
    zoom(z) { this.zoomed = z; clearTimeout(this.zt); this.aim(); }
    go(i, quiet) {
      if (!this.layers[i]) return; const first = this.i < 0; this.i = i; const L = this.layers[i];
      this.layers.forEach((K, k) => { K.o.to(k === i ? 1 : 0); K.st.classList.toggle('is-on', k === i); this.buttons[k].setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      if (this.count) this.count.textContent = `${i + 1} of ${this.layers.length}`;
      if (L.region) { const r = L.region; Object.assign(this.ring.style, { left: L.left + r.x * L.w + 'px', top: L.top + r.y * L.h + 'px', width: r.w * L.w + 'px', height: r.h * L.h + 'px' }); }
      this.zoomed = !!(L.region && L.crop); this.aim(); clearTimeout(this.zt); if (L.region && !this.zoomed) this.zt = setTimeout(() => { this.zoomed = true; this.aim(); }, M.off ? 0 : first ? 1700 : 1150);
      if (first) { this.layers.forEach(K => K.o.snap(K.o.g)); [this.cam.x, this.cam.y, this.cam.z].forEach(s => s.snap(s.g)); }
      if (!quiet) setHash(L.st.id); if (this.opts.onGo) this.opts.onGo(i, L.st); wake();
    }
    play() { this.playing = true; if (this.playBtn) this.playBtn.textContent = 'Pause the tour'; clearInterval(this.pt); this.pt = setInterval(() => this.go((this.i + 1) % this.layers.length), 6400); this.go((this.i + 1) % this.layers.length); }
    stop() { if (!this.playing) return; this.playing = false; clearInterval(this.pt); if (this.playBtn) this.playBtn.textContent = 'Play the tour'; }
    has(id) { return this.layers.findIndex(L => L.st.id === id); }
    draw() {
      const L = this.layers[this.i]; if (!L) return; const z = this.cam.z.v, px = L.left + this.cam.x.v * L.w, py = L.top + this.cam.y.v * L.h;
      this.scene.style.transform = `translate(${(this.W / 2 - px).toFixed(2)}px,${(this.H / 2 - py).toFixed(2)}px) scale(${z.toFixed(4)})`;
      this.scene.style.transformOrigin = `${px.toFixed(2)}px ${py.toFixed(2)}px`;
      this.layers.forEach(K => { const o = clamp(K.o.v); K.layer.style.opacity = o.toFixed(3); K.layer.style.visibility = o < .01 ? 'hidden' : 'visible'; if (K.crop) { const c = clamp(K.crop.v), g = K.region; K.layer.style.clipPath = c < .002 ? '' : `inset(${(g.y * 100 * c).toFixed(2)}% 0 ${((1 - g.y - g.h) * 100 * c).toFixed(2)}% 0 round 6px)`; } });
      this.ring.style.opacity = clamp(this.ringO.v).toFixed(3);
    }
    tick(dt) { if (this.i < 0) return false; const moving = stepAll([this.cam.x, this.cam.y, this.cam.z, this.ringO, ...this.layers.map(L => L.o), ...this.layers.filter(L => L.crop).map(L => L.crop)], dt); this.draw(); return moving; }
  }

  /* ---- parts of a page: each opens in the stage, growing from its card, while the one before returns to its own ---- */
  const stage = $('.ifc-stage'), panels = $$('.ifc-stage > .ifc-panel'), parts = $$('.ifc-part[data-part]');
  const P = panels.map(p => ({ el: p, id: p.id, o: new EM.Spring(0, 150, 24), card: parts.find(c => c.dataset.part === p.id), enter: [], leave: [] }));
  let open = -1;
  const cardBox = Q => { const s = stage.getBoundingClientRect(), c = Q.card ? Q.card.getBoundingClientRect() : s; return { x: c.left - s.left, y: c.top - s.top, k: clamp(c.width / Math.max(1, s.width), .08, 1) }; };
  const showPanel = (i, quiet) => {
    if (i < 0 || !P[i] || i === open) return; const was = P[open]; open = i;
    P.forEach((Q, k) => { Q.o.to(k === i ? 1 : 0); if (Q.card) Q.card.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    P[i].el.hidden = false; P[i].box = cardBox(P[i]); if (was) { was.box = cardBox(was); was.leave.forEach(f => f()); } else P[i].o.snap(1);
    P[i].enter.forEach(f => f()); if (!quiet) setHash(P[i].id); wake();
  };
  if (P.length > 1) {
    P.forEach(Q => Q.el.hidden = true);
    tickers.add(dt => {
      const moving = stepAll(P.map(Q => Q.o), dt);
      P.forEach((Q, k) => { const v = clamp(Q.o.v), b = Q.box || { x: 0, y: 0, k: 1 }, e = 1 - v; if (v < .004 && k !== open) { Q.el.hidden = true; return; } Q.el.style.transform = e < .001 ? '' : `translate(${(b.x * e).toFixed(2)}px,${(b.y * e).toFixed(2)}px) scale(${(1 - (1 - b.k) * e).toFixed(4)})`; Q.el.style.opacity = smooth(v).toFixed(3); Q.el.style.pointerEvents = k === open ? '' : 'none'; Q.el.style.zIndex = k === open ? 2 : 1; });
      return moving;
    });
    parts.forEach(c => c.addEventListener('click', ev => { const i = P.findIndex(Q => Q.id === c.dataset.part); if (i >= 0) { ev.preventDefault(); showPanel(i); } }));
  }
  const panelOf = node => P.findIndex(Q => Q.el.contains(node));
  const hashHooks = [];                                                                // (id, element) -> true when it has dealt with the address
  const fromAddress = quiet => {
    const id = decodeURIComponent(location.hash.slice(1)), node = id && document.getElementById(id);
    if (node) { const i = panelOf(node); if (i >= 0) showPanel(i, true); hashHooks.some(hk => hk(id, node)); } else if (open < 0 && P.length) showPanel(0, true);
    if (!quiet || matchMedia('(min-width: 901px) and (min-height: 701px)').matches) requestAnimationFrame(() => { window.scrollTo(0, 0); if (stage) stage.scrollTop = 0; P.forEach(Q => Q.el.scrollTop = 0); });
  };
  document.addEventListener('click', ev => {                                           // links inside the page move the stage, never the page
    const a = ev.target.closest('a[href^="#"]'); if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey) return;
    const node = document.getElementById(a.getAttribute('href').slice(1)); if (!node || !stage || !stage.contains(node)) return;
    ev.preventDefault(); history.replaceState(history.state, '', a.getAttribute('href')); fromAddress(true);
  });
  window.addEventListener('hashchange', () => fromAddress(true));

  /* ---- the session film: chapters that fill as they play, and the line now being spoken ---- */
  const film = $('#session-film video');
  if (film) {
    const video = film, sec = $('#session-film'), chapters = $$('.ifc-chapter', sec), lines = $$('.ifc-lines p', sec), now = $('.ifc-now', sec), Q = P[panelOf(sec)];
    const lt = lines.map(p => +p.dataset.t), text = lines.map(p => p.lastChild.textContent.trim()); let shown = -2;
    const mark = () => {
      const t = video.currentTime; chapters.forEach(ch => { const a = +ch.dataset.time, b = +ch.dataset.end; ch.classList.toggle('is-on', t >= a - .05 && t < b - .05); ch.style.setProperty('--p', clamp((t - a) / (b - a)).toFixed(4)); });
      let n = -1; lt.forEach((x, i) => { if (t >= x - .05) n = i; }); if (video.currentTime < .05 && video.paused) n = -1;
      if (n !== shown) { shown = n; lines.forEach((p, i) => p.classList.toggle('is-now', i === n)); now.style.opacity = 0; setTimeout(() => { now.textContent = n < 0 ? 'Press play, or choose a chapter. Each line of the film appears here as it is reached.' : text[n]; now.style.opacity = 1; }, M.off ? 0 : 220); }
    };
    const seek = (t, play) => { video.currentTime = t; mark(); if (play) video.play().catch(() => {}); wake(); };
    chapters.forEach(ch => $('button', ch).addEventListener('click', () => seek(+ch.dataset.time, true)));
    lines.forEach(p => p.addEventListener('click', () => { const d = p.closest('details'); if (d) d.open = false; seek(+p.dataset.t, true); }));
    tickers.add(() => { mark(); return !video.paused && !video.ended; });
    ['play', 'seeked', 'timeupdate'].forEach(e => video.addEventListener(e, () => { mark(); wake(); })); mark();
    const lab = () => $$('[data-film-play]').forEach(b => b.textContent = video.paused ? (video.ended ? 'Replay the film' : video.currentTime > .5 ? 'Resume the film' : 'Play the film') : 'Pause the film');
    $$('[data-film-play]').forEach(b => b.addEventListener('click', () => { if (video.ended) video.currentTime = 0; video.paused ? video.play().catch(() => {}) : video.pause(); }));
    ['play', 'pause', 'ended'].forEach(e => video.addEventListener(e, lab)); lab();
    if (Q) Q.leave.push(() => video.pause());
    hashHooks.push((id, node) => { if (!sec.contains(node) && node !== sec) return false; if (id === 'film-rewrite') seek(+node.dataset.rewriteTime || 21, true); if (id === 'session-film-transcript') node.open = true; return true; });
    document.addEventListener('eigenengine-source-preview', ev => { if (ev.detail && ev.detail.open) video.pause(); });
    /* a fresh visit starts the film, silent, so the page opens on the thing itself */
    window.addEventListener('load', () => { if (!location.hash && !M.off && open === panelOf(sec)) { video.muted = true; video.play().catch(() => {}); } });
  }

  /* ---- a section rewritten: three sheets, and a drawing compared with its revision by dragging a line across it ---- */
  const tabs = $('.ifc-tabs');
  if (tabs) {
    const sheets = $$('.ifc-sheet', tabs), btns = $$('[data-sheet]');
    const pick = (i, quiet) => { sheets.forEach((s, k) => s.classList.toggle('is-on', k === i)); btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.sheet === sheets[i].id ? 'true' : 'false')); if (!quiet) setHash(sheets[i].id); };
    btns.forEach(b => b.addEventListener('click', ev => { ev.preventDefault(); pick(sheets.findIndex(s => s.id === b.dataset.sheet)); }));
    pick(0, true);
    hashHooks.push((id, node) => { const i = sheets.findIndex(s => s === node || s.contains(node)); if (i < 0) return false; pick(i, true); return true; });
    $$('.ifc-compare').forEach(box => {
      const cut = new EM.Spring(.5, 140, 22); let auto = true, t0 = performance.now();
      const set = x => { const r = box.getBoundingClientRect(); cut.to(clamp((x - r.left) / r.width, .02, .98)); auto = false; wake(); };
      box.addEventListener('pointerdown', ev => { box.setPointerCapture(ev.pointerId); set(ev.clientX); });
      box.addEventListener('pointermove', ev => { if (ev.buttons || ev.pointerType === 'mouse') set(ev.clientX); });
      box.tabIndex = 0; box.addEventListener('keydown', ev => { if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') { ev.preventDefault(); auto = false; cut.to(clamp(cut.g + (ev.key === 'ArrowLeft' ? -.08 : .08), .02, .98)); wake(); } });
      tickers.add((dt, now) => { if (auto && !M.off && box.offsetParent) cut.to(.5 + .34 * Math.sin((now - t0) / 1900)); const moving = stepAll([cut], dt); box.style.setProperty('--cut', (cut.v * 100).toFixed(2) + '%'); return moving || (auto && !M.off && !!box.offsetParent && open === panelOf(box)); });
      const Q = P[panelOf(box)]; if (Q) Q.enter.push(() => { t0 = performance.now(); wake(); });
    });
  }

  $$('.ifc-reader').forEach(d => { const c = $('.ifc-reader-close', d); if (c) c.addEventListener('click', () => { d.open = false; }); d.addEventListener('keydown', ev => { if (ev.key === 'Escape') d.open = false; }); });

  /* ---- screens toured by the camera ---- */
  $$('.ifc-tour').forEach(root => {
    const Q = P[panelOf(root)], tour = new Tour(root), rec = $('[data-tour="film"]', root), video = $('.ifc-window video', root), recBox = video && (video.closest('.ifc-rec') || video);
    const start = () => { tour.fit(); if (tour.i < 0) tour.go(0, true); else tour.aim(); tour.draw(); };
    if (Q) { Q.enter.push(() => requestAnimationFrame(start)); Q.leave.push(() => { tour.stop(); if (video) video.pause(); }); } else requestAnimationFrame(start);
    if (rec && video) {                                                                // the same edit as a recording, in the same window
      const note = $('.ifc-rec-note', root), show = on => { recBox.hidden = !on; rec.setAttribute('aria-pressed', on ? 'true' : 'false'); rec.textContent = on ? 'Back to the screens' : 'Watch it as a recording'; if (note) note.classList.toggle('is-on', on); const cur = tour.layers[tour.i]; if (cur) cur.st.classList.toggle('is-on', !on); if (on) { tour.stop(); video.play().catch(() => {}); } else video.pause(); };
      rec.hidden = false; rec.addEventListener('click', () => show(recBox.hidden)); tour.opts.onGo = () => { if (!recBox.hidden) show(false); };
      hashHooks.push(id => { if (id !== 'video' && id !== 'edit-film-transcript') return false; show(true); return true; });
    }
    hashHooks.push((id, node) => { const i = tour.layers.findIndex(L => L.st === node || L.st.contains(node)); if (i < 0) return false; requestAnimationFrame(() => { tour.fit(); tour.go(i, true); }); return true; });
    root.tour = tour;
  });

  /* ---- a node's own exhibit as a part of the page: the reader makes the edit that the film only shows ---- */
  $$('[data-exhibit]').forEach(host => {
    const N = (window.EIGEN_NODES || {})[host.dataset.exhibit]; if (!N) return;
    const Q = P[panelOf(host)], wrap = host.parentNode, bar = $('.ifc-steps', wrap), cap = $('.ifc-cap', wrap); let ex = null;
    const show = i => { [...bar.children].forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false')); if (cap.dataset.i === String(i)) return; cap.dataset.i = i; cap.style.opacity = 0; setTimeout(() => { const c = N.exhibit.steps[i].caption; cap.innerHTML = c.plain || String(c); cap.style.opacity = 1; }, M.off ? 0 : 200); };
    N.exhibit.steps.forEach((s, i) => { const b = el('button', 'ifc-btn', `<span>${i + 1}</span>${s.label}`); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.addEventListener('click', () => { if (ex) { ex.step(i); show(i); } }); bar.appendChild(b); });
    const start = () => { if (ex) return; ex = N.exhibit.mount(host, { compact: false, onStep: show }); ex.step(1); show(1); };
    if (Q) Q.enter.push(() => setTimeout(start, M.off ? 0 : 420)); else start();
  });
  $$('svg[data-art]').forEach(svg => { const N = (window.EIGEN_NODES || {})[svg.dataset.art]; if (!N || !N.art) return; const a = N.art(svg), t0 = performance.now(); a.tick(2.4); (function loop(now) { if (!M.off && svg.getBoundingClientRect().width) a.tick((now - t0) / 1000); requestAnimationFrame(loop); })(t0); });

  window.IFC = { tickers, wake, stepAll, setHash, hashHooks, fromAddress, P, showPanel, panelOf, Tour, el, $, $$ };
  fromAddress(true);
  window.addEventListener('load', () => { fromAddress(true); setTimeout(() => fromAddress(true), 260); });
  window.addEventListener('pageshow', () => wake());
})();
