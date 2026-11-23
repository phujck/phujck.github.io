/* The insides of the nine things made: each is the thing's own material, running.
   Fetched by node.js when an item is first opened. Two kinds of exhibit:
   a reel (.egr) of real material as tiles, one large and live while the rest wait beside it (the talks' own applets,
   the slides, pages of the papers, the film), and three figures (.egf) computed from the site's own data
   (the SuperARC answers, the journey, the layouts of sixteen symbols). Everything moves on the shared spring. */
(() => {
  'use strict';
  const M = window.EIGEN_MADE, K = M.KIT, { sv, h, clamp, smooth, mix, track, say, level, MOT } = K;
  const Spring = window.EigenMotion.Spring, IMG = M.BASE + 'img/';
  const DATA = () => window.EIGEN_MADE_DATA;
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const tok = () => ({ gold: css('--eg-gold'), blue: css('--eg-blue'), teal: css('--eg-teal'), coral: css('--eg-coral'), ink: css('--eg-ink'), muted: css('--eg-muted'), faint: css('--eg-faint'), line: css('--eg-line'), ground: css('--eg-ground'), surface: css('--eg-surface'), raise: css('--eg-raise'), cost: css('--eg-cost-line'), green: css('--eg-interface-line') });
  const stepAll = (springs, dt) => { let moving = false; for (let k = Math.max(1, Math.ceil(dt / .008)), i = 0; i < k; i++) for (const s of springs) if (s.step(dt / k)) moving = true; return moving; };
  const ticker = fn => { let raf = 0, last = 0, dead = false, t = 0; const loop = now => { if (dead) return; const dt = Math.min(.05, last ? (now - last) / 1000 : .016); last = now; t += dt; fn(dt, t); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); return () => { dead = true; cancelAnimationFrame(raf); }; };
  const report = (el, opts, id, i) => { if (opts.onStep) opts.onStep(i); el.dispatchEvent(new CustomEvent('eg-step', { bubbles: true, detail: { node: id, i } })); };
  const fade = (node, html) => { clearTimeout(node._t); if (node._html === html) return; node._html = html; if (MOT().off) { node.innerHTML = html; return; } node.style.opacity = 0; node._t = setTimeout(() => { node.innerHTML = html; node.style.opacity = 1; }, 170); };

  // ---- the talks' applets, run from their own files with the site's typefaces ---------------------------------
  /* An applet is fetched as text and given to the frame as srcdoc with three additions: a base address so its own
     files resolve, the site's fonts, and a small script that makes every word it draws use them and keeps it
     running whatever the system's "reduce motion" setting says. Nothing in the talk's own folder is changed. */
  const inFrame = function () {
    var keep = /lora|georgia|serif/i, sans = /sans-serif/i;
    var d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
    Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', { configurable: true, get: function () { return d.get.call(this); },
      set: function (v) { var m = String(v).match(/^(.*?\d(?:\.\d+)?px(?:\/[\d.]+)?\s+)(.+)$/); d.set.call(this, m && (!keep.test(m[2]) || sans.test(m[2])) ? m[1] + 'Outfit, sans-serif' : v); } });
    var mm = window.matchMedia; window.matchMedia = function (q) { var r = mm.call(window, q); if (/prefers-reduced-motion/.test(q)) return { matches: false, media: q, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {} }; return r; };
    var faces = function () { var all = document.querySelectorAll('html, body, body *'); for (var i = 0; i < all.length; i++) { var f = getComputedStyle(all[i]).fontFamily; if (!keep.test(f.split(',')[0])) all[i].style.fontFamily = 'Outfit, sans-serif'; } };
    document.addEventListener('DOMContentLoaded', faces); window.addEventListener('load', function () { faces(); setTimeout(faces, 600); });
  };
  const frames = {};
  const applet = src => frames[src] || (frames[src] = fetch(src).then(r => r.text()).then(html => {
    const o = location.origin, add = `<base href="${o}${src.replace(/[^/]*$/, '')}"><style>@font-face{font-family:Outfit;src:url(${o}/demo/shared/fonts/outfit-var.woff2) format("woff2");font-weight:100 900}@font-face{font-family:Lora;src:url(${o}/demo/shared/fonts/lora-var.woff2) format("woff2");font-weight:400 700}html,body{overflow:hidden;font-family:Outfit,sans-serif}</style><script>(${inFrame.toString()})()</` + 'script>';
    return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, m => m + add) : add + html;
  }));

  // ---- the kinds of tile -----------------------------------------------------------------------------------------
  const KIND = {
    applet(o) {
      h('img', '', null, o.media).src = IMG + o.t.poster; o.media.firstChild.alt = '';
      let fr = null, gone = 0, L = 960;
      return { aspect: 16 / 9,
        enter() { clearTimeout(gone); if (fr) { o.live.classList.add('is-on'); return; } applet(o.t.src).then(html => { if (!o.on || fr) return; fr = h('iframe', '', null, o.live); fr.title = o.t.label; fr.setAttribute('loading', 'eager'); fr.addEventListener('load', () => setTimeout(() => { if (o.on) o.live.classList.add('is-on'); }, 350)); L = clamp(o.w.g, o.t.least || 640, 960); fr.style.width = L + 'px'; fr.style.height = (L * 9 / 16) + 'px'; fr.srcdoc = html; this.size(o.w.v); }, () => {}); },
        leave() { o.live.classList.remove('is-on'); clearTimeout(gone); gone = setTimeout(() => { if (fr) { fr.remove(); fr = null; } }, 600); },
        size(w) { if (fr) fr.style.transform = `scale(${(w / L).toFixed(4)})`; },
        destroy() { clearTimeout(gone); if (fr) fr.remove(); } };
    },
    pages(o) {
      const box = h('div', 'egr-pages', '', o.media); o.t.pages.forEach(p => { const im = h('img', '', null, box); im.src = /^\//.test(p) ? p : IMG + p; im.alt = ''; im.loading = 'lazy'; });
      return { aspect: 0, enter() {}, leave() {}, size() {}, destroy() {} };
    },
    slides(o) {
      const box = h('div', 'egr-slides', '', o.media), dots = h('div', 'egr-dots', o.t.slides.map(() => '<i></i>').join(''), o.media), ims = []; let at = 0, timer = 0, byHand = false;
      const im = k => { if (!ims[k]) { ims[k] = h('img', '', null, box); ims[k].src = IMG + o.t.slides[k]; ims[k].alt = ''; } return ims[k]; };
      const show = k => { const n = o.t.slides.length; k = (k + n) % n; ims.forEach((e, j) => { if (e && j !== k) { e.classList.toggle('is-gone', e.classList.contains('is-on')); e.classList.remove('is-on'); } }); const e = im(k); e.classList.remove('is-gone'); void e.offsetWidth; e.classList.add('is-on'); at = k; im((k + 1) % n); [...dots.children].forEach((d, j) => d.classList.toggle('on', j === k)); };
      show(0);
      box.addEventListener('click', ev => { if (!o.on) return; ev.stopPropagation(); byHand = true; clearInterval(timer); show(at + 1); });
      return { aspect: 16 / 9, enter() { clearInterval(timer); if (!byHand) timer = setInterval(() => show(at + 1), 2800); }, leave() { clearInterval(timer); }, size() {}, destroy() { clearInterval(timer); } };
    },
    video(o) {
      h('img', '', null, o.media).src = o.t.poster; o.media.firstChild.alt = '';
      const rail = h('div', 'egr-rail', '<u></u>' + o.t.chapters.map(c => `<i style="left:${(c / o.t.length * 100).toFixed(2)}%"></i>`).join('') + '<b></b>', o.el), head = rail.querySelector('b'), done = rail.querySelector('u'); let v = null, want = 0;
      const mark = () => { const f = clamp((v ? v.currentTime : want) / o.t.length) * 100; head.style.left = f.toFixed(2) + '%'; done.style.width = f.toFixed(2) + '%'; };
      rail.addEventListener('click', ev => { ev.stopPropagation(); const r = rail.getBoundingClientRect(), t = clamp((ev.clientX - r.left) / r.width) * o.t.length; api.act(t); let k = 0; o.t.chapters.forEach((c, j) => { if (t >= c - .5) k = j; }); o.picked && o.picked(k); });
      const api = { aspect: 16 / 9 / .885,                  // a little wider than the film: its top strip, which carries the film's own header, is left outside the tile
        enter() { if (!v) { v = h('video', '', null, o.live); v.muted = true; v.playsInline = true; v.preload = 'metadata'; v.setAttribute('aria-label', o.t.label); v.src = o.t.src; v.addEventListener('timeupdate', mark); v.addEventListener('playing', () => o.live.classList.add('is-on')); v.addEventListener('click', ev => { ev.stopPropagation(); if (v.paused) v.play().catch(() => {}); else v.pause(); }); } this.act(want); },
        act(t) { want = t; mark(); if (!v || !o.on) return; try { v.currentTime = t; } catch (e) {} v.play().catch(() => {}); },
        leave() { if (v) v.pause(); }, size() {}, destroy() { if (v) { v.pause(); v.removeAttribute('src'); v.load(); } } };
      mark(); return api;
    },
    art(o) {
      const s = sv('svg', { class: 'egr-art', viewBox: o.t.box || '130 0 270 205', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, o.media); let a = o.t.art(s);
      if (o.t.better) o.t.better().then(art => { if (!art || o.dead) return; try { a.destroy(); s.setAttribute('viewBox', '0 0 400 300'); a = art(s); } catch (e) {} }, () => {});
      return { aspect: 0, enter() {}, leave() {}, size() {}, tick(t) { a.tick(t); }, destroy() { o.dead = true; try { a.destroy(); } catch (e) {} } };
    }
  };

  // ---- the reel ---------------------------------------------------------------------------------------------------
  function reel(el, opts, id, tiles, plan) {
    const root = h('div', 'egr', '', el); let W = 0, H = 0, main = -1, dead = false, at = -1;
    const T = tiles.map((t, k) => {
      const b = h('div', 'egr-tile is-thumb', '', root), o = { t, k, el: b, media: h('div', 'egr-media', '', b), live: h('div', 'egr-live', '', b), x: new Spring(0), y: new Spring(0), w: new Spring(40), h: new Spring(30), on: false, enterT: 0 };
      h('span', 'egr-lab', t.label, b); b.tabIndex = 0; b.setAttribute('role', 'button'); b.setAttribute('aria-label', t.label);
      o.api = KIND[t.kind](o); o.picked = j => { at = j; report(el, opts, id, j); };
      const go = ev => { if (main === k) return; ev.stopPropagation(); const i = plan.findIndex(p => p.tile === k); if (i >= 0) { api.step(i); report(el, opts, id, i); } };
      b.addEventListener('click', go); b.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(ev); } });
      return o;
    });
    const place = snap => {
      if (!W || !H) return; const pad = Math.max(6, Math.min(12, W * .014)), gap = pad, n = T.length, others = T.filter(o => o.k !== main); let area;
      if (n === 1) area = [pad, pad, W - 2 * pad, H - 2 * pad];
      else if (W / H >= 1.2) { const tw = clamp(W * .19, 76, 200), th = tw * 9 / 16, tot = others.length * th + (others.length - 1) * gap, y0 = Math.max(pad, (H - tot) / 2); others.forEach((o, j) => { o.x.to(W - pad - tw / 2); o.y.to(y0 + th / 2 + j * (th + gap)); o.w.to(tw); o.h.to(th); }); area = [pad, pad, W - 3 * pad - tw, H - 2 * pad]; }
      else { const th = clamp(H * .2, 44, 90), tw = th * 16 / 9, tot = others.length * tw + (others.length - 1) * gap, x0 = Math.max(pad, (W - tot) / 2); others.forEach((o, j) => { o.x.to(x0 + tw / 2 + j * (tw + gap)); o.y.to(H - pad - th / 2); o.w.to(tw); o.h.to(th); }); area = [pad, pad, W - 2 * pad, H - 3 * pad - th]; }
      const m = T[main]; if (m) { const a = m.api.aspect; let w = area[2], hh = area[3]; if (a) { if (w / hh > a) w = hh * a; else hh = w / a; } m.x.to(area[0] + area[2] / 2); m.y.to(area[1] + area[3] / 2); m.w.to(w); m.h.to(hh); }
      if (snap) T.forEach(o => [o.x, o.y, o.w, o.h].forEach(s => s.snap(s.g)));
    };
    const pick = k => {
      if (k === main) return; const old = T[main]; if (old) { old.on = false; clearTimeout(old.enterT); old.api.leave(); old.el.classList.replace('is-main', 'is-thumb'); old.el.style.zIndex = 1; }
      const first = main < 0; main = k; const o = T[k]; o.on = true; o.el.classList.replace('is-thumb', 'is-main'); o.el.style.zIndex = 2; place(first);
      o.enterT = setTimeout(() => { if (o.on && !dead) o.api.enter(); }, first || MOT().off ? 60 : 900);   // the live frame is fetched once the tiles have come to rest, so its loading cannot hitch their motion
    };
    const stop = ticker((dt, t) => { const all = []; T.forEach(o => all.push(o.x, o.y, o.w, o.h)); stepAll(all, dt);
      T.forEach(o => { const w = o.w.v, hh = o.h.v; o.el.style.transform = `translate(${(o.x.v - w / 2).toFixed(2)}px,${(o.y.v - hh / 2).toFixed(2)}px)`; o.el.style.width = w.toFixed(2) + 'px'; o.el.style.height = hh.toFixed(2) + 'px'; o.api.size(w, hh); if (o.api.tick && !MOT().off) o.api.tick(t); }); });
    const ro = new ResizeObserver(() => { const w = root.clientWidth, hh = root.clientHeight; if (!w || !hh) return; const first = !W; W = w; H = hh; place(first); }); ro.observe(root);
    const api = { step(i) { const p = plan[i]; if (!p) return; at = i; pick(p.tile); if (p.act != null) T[p.tile].api.act(p.act); }, destroy() { dead = true; stop(); ro.disconnect(); T.forEach(o => { clearTimeout(o.enterT); o.api.destroy(); }); root.remove(); } };
    el.__egr = { T, get main() { return main; } };
    return api;
  }

  // ---- canvas plumbing for the figures -------------------------------------------------------------------------
  function figure(el, draw, onSize) {
    const root = h('div', 'egf', '', el), cv = h('canvas', '', null, root), g = cv.getContext('2d'), F = { root, cv, g, W: 0, H: 0, c: tok(), t: 0, dead: false, springs: [], note: h('p', 'egf-note', '', root) };
    F.note.setAttribute('aria-live', 'polite');
    const size = () => { const w = root.clientWidth, hh = root.clientHeight; if (!w || !hh) return; const r = Math.min(2, window.devicePixelRatio || 1), first = !F.W; cv.width = Math.round(w * r); cv.height = Math.round(hh * r); F.W = w; F.H = hh; F.r = r; F.u = clamp(parseFloat(getComputedStyle(document.documentElement).fontSize) / 16, 1, 1.5); onSize(first); };
    const ro = new ResizeObserver(size); ro.observe(root);
    const stop = ticker((dt, t) => { if (!F.W) return; F.t = t; F.dt = dt; stepAll(F.springs, dt); g.setTransform(F.r, 0, 0, F.r, 0, 0); g.clearRect(0, 0, F.W, F.H); draw(dt, t); });
    if (document.fonts && document.fonts.load) { document.fonts.load('500 13px Outfit'); document.fonts.load('600 13px Outfit'); }
    F.sp = v => { const s = new Spring(v); F.springs.push(s); return s; };
    F.xy = ev => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    F.font = (w, px) => { g.font = `${w} ${(px * F.u).toFixed(1)}px Outfit, system-ui, sans-serif`; };
    F.rr = (x, y, w, hh, r) => { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, hh, r); else g.rect(x, y, w, hh); };
    F.destroy = () => { F.dead = true; stop(); ro.disconnect(); root.remove(); };
    return F;
  }

  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', n: 'ⁿ', '+': '⁺', '-': '⁻', k: 'ᵏ', i: 'ⁱ' };
  const written = s => s.replace(/\s--\s/g, ', ').replace(/==/g, '=').replace(/!=/g, '≠').replace(/>=/g, '≥').replace(/<=/g, '≤').replace(/(\d)\.\.(\d)/g, '$1 to $2').replace(/\^\(([0-9nki+\-]+)\)|\^([0-9nki]+)/g, (m, a, b) => (a || b).split('').map(c => SUP[c] || c).join('')).replace(/\s*\*\s*/g, ' × ').replace(/\s+/g, ' ');

  // ---- SuperARC: the hundred answers, sorted by what kind of answer each is -------------------------------------
  function superarc(el, opts) {
    const S = DATA().superarc, items = S.items, RANK = { r: 0, l: 1, c: 2 }, NAME = { r: 'a rule', l: 'a list', c: 'a copy' };
    let mode = 0, sel = 0, hover = -1, byHand = false, auto = 0, G = { x: 0, y: 0, cell: 10 };
    const F = figure(el, draw, place), g = F.g;
    const tiles = items.map((it, i) => ({ i, x: F.sp(0), y: F.sp(0), s: F.sp(8), c: F.sp(0), k: F.sp(0) }));
    const count = { r: F.sp(0), l: F.sp(0), c: F.sp(0) }, bars = [F.sp(0), F.sp(0), F.sp(0), F.sp(0)], side = F.sp(0), score = F.sp(0), det = F.sp(0), flip = F.sp(1);
    const order = w => items.map((it, i) => i).sort((a, b) => RANK[items[a][w]] - RANK[items[b][w]] || a - b);
    const slot = { 0: items.map((it, i) => i), 1: [], 2: [] }; order(2).forEach((i, s) => { slot[1][i] = s; }); order(1).forEach((i, s) => { slot[2][i] = s; });
    function place(snap) {
      const W = F.W, H = F.H, pad = 14, foot = 44 * F.u, wide = W / H > 1.25, m = Math.min(mode, 2), use = mode === 3 ? 2 : m;
      let size = Math.min(H - pad - foot - 6, wide ? W * (mode === 3 ? .34 : .5) : H * .52), x = wide ? pad + 4 : (W - size) / 2, y = wide ? pad + (H - pad - foot - size) / 2 : pad;
      G = { x, y, cell: size / 10, size, wide, px: wide ? x + size + 26 : pad + 6, py: wide ? y : y + size + 14, pw: wide ? W - (x + size + 26) - pad : W - 2 * pad - 12, ph: wide ? size : H - foot - (y + size + 14) };
      tiles.forEach(t => { const s = use === 0 ? t.i : slot[use][t.i]; t.x.to(x + (s % 10 + .5) * G.cell); t.y.to(y + (Math.floor(s / 10) + .5) * G.cell); t.s.to(G.cell * .84); t.c.to(mode === 0 ? 0 : 1); t.k.to(mode >= 2 ? 1 : 0); });
      const n = w => ({ r: items.filter(it => it[w] === 'r').length, l: items.filter(it => it[w] === 'l').length, c: items.filter(it => it[w] === 'c').length }), now = n(mode >= 2 ? 1 : 2);
      ['r', 'l', 'c'].forEach(k => count[k].to(mode === 0 ? 0 : now[k])); side.to(mode === 1 || mode === 2 ? 1 : 0); score.to(mode === 3 ? 1 : 0); det.to(mode === 0 ? 1 : 0);
      [S.phi.loop, S.phi.one, S.phi.bare, S.phi.published].forEach((v, j) => bars[j].to(mode === 3 ? v : 0));
      if (snap) F.springs.forEach(s => s.snap(s.g));
    }
    const col = k => k === 'r' ? F.c.gold : k === 'l' ? F.c.blue : F.c.faint;
    function draw() {
      const c = F.c;
      tiles.forEach(t => { const it = items[t.i], s = t.s.v, x = t.x.v - s / 2, y = t.y.v - s / 2, cc = t.c.v, kk = t.k.v, r = Math.max(2, s * .16);
        g.globalAlpha = 1; F.rr(x, y, s, s, r); g.fillStyle = c.surface; g.fill();
        if (cc > .01) { [[it[2], (1 - kk) * cc], [it[1], kk * cc]].forEach(([k, a]) => { if (a < .01) return; g.globalAlpha = a * (k === 'c' ? .34 : .92); F.rr(x, y, s, s, r); g.fillStyle = col(k); g.fill(); }); }
        g.globalAlpha = .5 + .5 * (1 - cc); F.rr(x, y, s, s, r); g.lineWidth = 1; g.strokeStyle = c.line; g.stroke();
        if (cc < .98 && s > 15) { const a = 1 - cc, d = s / 5.2; for (let b = 0; b < 12; b++) { g.globalAlpha = a * (it[0][b] === '1' ? .95 : .2); g.beginPath(); g.arc(x + s / 2 + (b % 4 - 1.5) * d, y + s / 2 + (Math.floor(b / 4) - 1) * d, Math.max(1, d * .3), 0, 6.3); g.fillStyle = c.ink; g.fill(); } }
        if (t.i === sel || t.i === hover) { g.globalAlpha = 1; F.rr(x - 2, y - 2, s + 4, s + 4, r + 2); g.lineWidth = t.i === sel ? 2 : 1.2; g.strokeStyle = c.gold; g.stroke(); } });
      if (det.v > .01 && sel >= 0) {                                    // one sequence, large, with the rule Eigen gave for it
        const it = items[sel], a = det.v * clamp(flip.v), n = 12, cw = Math.min(34, (G.pw - 6) / n), x0 = G.px, small = G.ph < 190, y0 = G.py + (G.wide ? Math.max(18, (G.ph - (small ? 150 : 210)) / 2) : 14);
        g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.globalAlpha = a; F.font(500, small ? 11.5 : 13); g.fillStyle = c.muted; g.fillText(`Sequence ${sel + 1} of 100`, x0, y0);
        for (let b = 0; b < n; b++) { const on = it[0][b] === '1'; F.rr(x0 + b * cw + 1.5, y0 + 10, cw - 3, cw - 3, 4); g.globalAlpha = a * (on ? .95 : .5); if (on) { g.fillStyle = c.ink; g.fill(); } else { g.lineWidth = 1; g.strokeStyle = c.faint; g.stroke(); } g.globalAlpha = a; F.font(600, Math.max(11, cw * .42)); g.textAlign = 'center'; g.fillStyle = on ? c.ground : c.muted; g.fillText(it[0][b], x0 + b * cw + cw / 2, y0 + 10 + (cw - 3) / 2 + cw * .15); }
        g.textAlign = 'left'; const y1 = y0 + cw + (small ? 28 : 40); F.font(500, small ? 11.5 : 13); g.fillStyle = c.gold; g.fillText('The rule Eigen gave' + (it[3] > 1 ? `, on attempt ${it[3]}` : ''), x0, y1);
        F.font(500, small ? 12.5 : 15); g.fillStyle = c.ink; const words = (written(it[4]) + (it[4].length >= 150 ? '…' : '')).split(' '), lines = ['']; words.forEach(w => { const l = lines[lines.length - 1], t = l ? l + ' ' + w : w; if (g.measureText(t).width > G.pw - 4 && l) lines.push(w); else lines[lines.length - 1] = t; });
        lines.slice(0, small ? 3 : 5).forEach((l, j) => g.fillText(l, x0, y1 + (small ? 18 : 24) + j * (small ? 17 : 21))); }
      g.globalAlpha = side.v; if (side.v > .01) {                       // the count of each kind of answer
        const rows = [['r', 'A rule', 'counts in full'], ['l', 'A list of positions', 'counts a tenth'], ['c', 'The sequence copied back', 'counts a hundredth']], rh = Math.min(64, G.ph / 3.4), y0 = G.py + (G.wide ? Math.max(0, (G.ph - rh * 3) / 2 - 8) : 0), small = rh < 46;
        F.font(500, small ? 11.5 : 13); g.fillStyle = c.muted; g.textBaseline = 'alphabetic'; g.fillText(mode >= 2 ? 'With Eigen, up to four attempts' : 'The same model, answering alone', G.px, y0 - (small ? 4 : 8));
        rows.forEach(([k, a, b], j) => { const y = y0 + j * rh + (small ? 6 : 10), v = count[k].v, bw = Math.max(0, G.pw - 56);
          g.globalAlpha = side.v; F.font(600, small ? 16 : 22); g.fillStyle = c.ink; g.fillText(String(Math.round(v)), G.px, y + (small ? 15 : 20));
          F.font(500, small ? 11.5 : 13.5); g.fillStyle = c.ink; g.fillText(a, G.px + 48, y + (small ? 8 : 10)); if (!small) { F.font(400, 12); g.fillStyle = c.muted; g.fillText(b, G.px + 48, y + 27); }
          g.globalAlpha = side.v * .25; F.rr(G.px + 48, y + (small ? 13 : 34), bw, 5, 2.5); g.fillStyle = c.line; g.fill();
          g.globalAlpha = side.v * (k === 'c' ? .5 : 1); F.rr(G.px + 48, y + (small ? 13 : 34), bw * v / 100, 5, 2.5); g.fillStyle = col(k); g.fill(); }); }
      g.globalAlpha = score.v; if (score.v > .01) {                     // the benchmark's score, from 0 to 1
        const rows = [['Eigen, up to four attempts', c.gold, 1], ['Eigen, one attempt', c.gold, .6], ['The same model, answering alone', c.faint, .9], ['The best published model', c.blue, .9]], rh = Math.min(58, (G.ph - 22) / 4), y0 = G.py + Math.max(0, (G.ph - rh * 4 - 22) / 2), x0 = G.px, bw = G.pw - 8, small = rh < 44;
        rows.forEach(([name, colr, a], j) => { const y = y0 + j * rh, v = bars[j].v;
          g.globalAlpha = score.v; F.font(500, small ? 11.5 : 13.5); g.fillStyle = c.ink; g.fillText(name, x0, y + 13);
          g.globalAlpha = score.v * .3; F.rr(x0, y + 20, bw, small ? 8 : 12, 4); g.fillStyle = c.line; g.fill();
          g.globalAlpha = score.v * a; F.rr(x0, y + 20, Math.max(3, bw * v), small ? 8 : 12, 4); g.fillStyle = colr; g.fill();
          g.globalAlpha = score.v; F.font(600, small ? 12 : 14); g.fillStyle = c.ink; g.fillText(v.toFixed(3), x0 + Math.max(3, bw * v) + 8, y + (small ? 28 : 31)); });
        const ya = y0 + rh * 4 + 4; g.globalAlpha = score.v * .7; g.fillStyle = c.muted; F.font(400, 11.5); [0, .5, 1].forEach(v => { g.textAlign = v === 0 ? 'left' : v === 1 ? 'right' : 'center'; g.fillText(v === 1 ? '1, every answer a short rule' : String(v), x0 + bw * v, ya + 12); }); g.textAlign = 'left'; }
      g.globalAlpha = 1;
    }
    const at = ev => { const [x, y] = F.xy(ev); let best = -1; tiles.forEach(t => { const s = t.s.v / 2 + 1; if (Math.abs(x - t.x.v) <= s && Math.abs(y - t.y.v) <= s) best = t.i; }); return best; };
    const tell = () => { const i = sel >= 0 ? sel : hover; if (i < 0 || mode === 0) return fade(F.note, ''); const it = items[i], alone = mode === 1; fade(F.note, `<b>Sequence ${i + 1}</b> &nbsp;${it[0].split('').join(' ')} &nbsp;·&nbsp; ${alone ? 'alone, ' + NAME[it[2]] : 'Eigen answered with ' + NAME[it[1]] + (it[3] > 1 ? ', on attempt ' + it[3] : '')}${alone ? '' : ': <b>' + written(it[4]).replace(/</g, '&lt;') + (it[4].length >= 150 ? '…' : '') + '</b>'}`); };
    F.cv.addEventListener('pointermove', ev => { const i = at(ev); F.cv.style.cursor = i >= 0 ? 'pointer' : ''; hover = i; });
    F.cv.addEventListener('pointerleave', () => { hover = -1; });
    const choose = i => { if (i === sel) return; if (mode === 0 && !MOT().off) { flip.snap(0); flip.to(1); } sel = i; tell(); };
    F.cv.addEventListener('click', ev => { const i = at(ev); if (i < 0) return; ev.stopPropagation(); byHand = true; clearInterval(auto); choose(i); });
    const cycle = () => { clearInterval(auto); if (byHand || MOT().off) return; auto = setInterval(() => { if (mode === 0) choose((sel + 1) % 100); }, 2100); };
    el.__egf = { tiles, get mode() { return mode; } };
    return { step(i) { mode = clamp(i | 0, 0, 3); if (sel < 0) sel = 0; place(); tell(); if (mode === 0) cycle(); else clearInterval(auto); }, destroy() { clearInterval(auto); F.destroy(); } };
  }

  // ---- The Long Way Round: the route, the days and the nights, from the one record -----------------------------
  const STATE = { AL: 'Alabama', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington DC', FL: 'Florida', GA: 'Georgia', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function trip(el, opts) {
    const Tr = DATA().trip, KX = .788, LON0 = -125, LAT0 = 49.7, SPANX = 58.6 * KX, SPANY = 25.4, ASP = SPANX / SPANY, days = Tr.days, nDay = days.length, maxKm = Math.max(...days.map(d => d[2]));
    const proj = p => [(p[0] - LON0) * KX / SPANX, (LAT0 - p[1]) / SPANY], route = track(Tr.route.map(proj)), frac = Tr.at.map(i => route.L[i] / route.T);
    let mode = 0, pickState = '', held = 0;
    const F = figure(el, draw, place), g = F.g, mx = F.sp(0), my = F.sp(0), mw = F.sp(100), day = F.sp(0), up = F.sp(0), nights = F.sp(0); let goal = 0;
    const B = { x: 0, y: 0, w: 0, h: 0 }, Nb = { x: 0, y: 0, w: 0, rh: 0 };
    function place(snap) {
      const W = F.W, H = F.H, pad = 12, foot = 24 * F.u, wide = W / H > 1.25;
      if (mode === 0) { const w = Math.min(W - 2 * pad, (H - pad - foot) * ASP); mw.to(w); mx.to((W - w) / 2); my.to(pad + (H - pad - foot - w / ASP) / 2); }
      else if (mode === 1) { const w = Math.min(W * (wide ? .46 : .8), (H * .5) * ASP); mw.to(w); mx.to(wide ? pad + 6 : (W - w) / 2); my.to(pad); B.x = pad + 30; B.w = W - 2 * pad - 36; B.h = Math.max(40, H - foot - 26 * F.u - (pad + w / ASP + 16)); B.y = H - foot - 22 * F.u; }
      else { const w = wide ? Math.min(W * .56, (H - pad - foot) * ASP) : Math.min(W - 2 * pad, (H * .46) * ASP); mw.to(w); mx.to(wide ? pad : (W - w) / 2); my.to(wide ? pad + (H - pad - foot - w / ASP) / 2 : pad); Nb.x = wide ? pad + w + 22 : pad + 6; Nb.w = wide ? W - Nb.x - pad : W - 2 * pad - 12; const top = wide ? pad + 6 : pad + w / ASP + 12; Nb.rh = Math.min(34, (H - foot - top - 4) / Tr.nights.length); Nb.y = top + Math.max(0, (H - foot - top - Nb.rh * Tr.nights.length) / 2); }
      up.to(mode === 1 ? 1 : 0); nights.to(mode === 2 ? 1 : 0);
      if (snap) [mx, my, mw, up, nights].forEach(s => s.snap(s.g));
    }
    const fAt = d => { d = clamp(d, 0, nDay); const i = Math.floor(d), u = d - i, a = i === 0 ? 0 : frac[i - 1], b = frac[Math.min(nDay - 1, i)]; return mix(a, i >= nDay ? a : b, u); };
    const dateOf = i => { const d = days[clamp(i, 0, nDay - 1)], m = +d[4].slice(0, 2), dd = +d[4].slice(3); return `${dd} ${MON[m - 1]} ${m >= 10 ? 2023 : 2024}`; };
    function draw(dt) {
      const c = F.c, X = mx.v, Y = my.v, Wm = mw.v, Hm = Wm / ASP, to = p => [X + p[0] * Wm, Y + p[1] * Hm];
      if (!MOT().off && performance.now() > held) { goal += dt * (mode === 0 ? 6.4 : 4.2); if (goal > nDay + 10) goal = 0; } day.to(Math.min(goal, nDay));
      const d = clamp(day.v, 0, nDay), di = clamp(Math.ceil(d) - 1, 0, nDay - 1), f = fAt(d);
      g.lineJoin = 'round'; g.lineCap = 'round';
      g.beginPath(); Tr.states.forEach(r => { r.forEach((p, i) => { const q = to(proj(p)); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.closePath(); });
      g.globalAlpha = .5; g.fillStyle = c.raise; g.fill(); g.globalAlpha = .65; g.lineWidth = 1; g.strokeStyle = c.line; g.stroke();
      const path = (pts, w, a, colr) => { g.beginPath(); pts.forEach((p, i) => { const q = to(p); if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.globalAlpha = a; g.lineWidth = w; g.strokeStyle = colr; g.stroke(); };
      path(route.pts, 1.2, .3, c.gold); path(route.cut(0, f * route.T), Wm > 520 ? 2.2 : 1.6, .95, c.gold);
      if (nights.v > .01 && pickState) days.forEach((dd, i) => { if (dd[3] !== pickState) return; const a = i ? frac[i - 1] : 0; path(route.cut(a * route.T, frac[i] * route.T), 4, nights.v, c.ink); });
      if (Wm > 420) { g.globalAlpha = .7 * (1 - up.v) * (1 - nights.v); F.font(400, 11.5); g.fillStyle = c.muted; Tr.stops.forEach((s, j) => { if (!/^(New Orleans|Fort Collins|Grand Junction|Mentor|Albany|Asheville|Key West)$/.test(s[0]) || j === 12) return; const q = to(proj([s[1], s[2]])); g.beginPath(); g.arc(q[0], q[1], 2.2, 0, 6.3); g.fill(); g.fillText(s[0], q[0] + 6, q[1] - 5); }); }
      const q = to(route.at(f * route.T)); g.globalAlpha = .25; g.beginPath(); g.arc(q[0], q[1], 11, 0, 6.3); g.fillStyle = c.gold; g.fill(); g.globalAlpha = 1; g.beginPath(); g.arc(q[0], q[1], 3.6, 0, 6.3); g.fillStyle = c.ink; g.fill();
      if (up.v > .01) {                                              // ninety-five days as distance driven
        const bw = B.w / nDay; g.textBaseline = 'alphabetic';
        days.forEach((dd, i) => { const grow = smooth(clamp(up.v * 1.7 - i / nDay * .7)), hh = dd[2] / maxKm * B.h * grow; g.globalAlpha = up.v * (i === di ? 1 : i < d ? .85 : .32); g.fillStyle = i === di ? c.ink : c.gold; g.fillRect(B.x + i * bw + .5, B.y - Math.max(1, hh), Math.max(1.5, bw - 1.5), Math.max(1, hh)); });
        g.globalAlpha = up.v * .8; g.fillStyle = c.muted; F.font(400, 11.5); let seen = ''; days.forEach((dd, i) => { const m = dd[4].slice(0, 2); if (m !== seen) { seen = m; if (i === 0 || +dd[4].slice(3) === 1) { g.fillRect(B.x + i * bw, B.y + 2, 1, 5); g.fillText(MON[+m - 1], B.x + i * bw + 4, B.y + 14 * F.u); } } });
        g.textAlign = 'right'; g.fillText(maxKm.toLocaleString('en-GB') + ' km', B.x + B.w, B.y - B.h - 5); g.textAlign = 'left'; g.globalAlpha = up.v * .3; g.fillRect(B.x, B.y - B.h, B.w, 1); }
      if (nights.v > .01) {                                          // nights in each state
        const max = Tr.nights[0][1]; Tr.nights.forEach(([s, n], j) => { const y = Nb.y + j * Nb.rh, on = !pickState || pickState === s, bw = Math.max(0, Nb.w - 150) * smooth(clamp(nights.v * 1.6 - j * .07));
          g.globalAlpha = nights.v * (on ? 1 : .4); F.font(500, Nb.rh < 24 ? 11.5 : 13); g.fillStyle = c.ink; g.fillText(STATE[s] || s, Nb.x, y + Nb.rh * .62);
          g.globalAlpha = nights.v * (on ? .95 : .3); F.rr(Nb.x + 104, y + Nb.rh * .28, bw * n / max, Nb.rh * .44, 3); g.fillStyle = pickState === s ? c.ink : c.gold; g.fill();
          g.globalAlpha = nights.v * (on ? 1 : .4); F.font(600, Nb.rh < 24 ? 11.5 : 13); g.fillStyle = c.ink; g.fillText(String(n), Nb.x + 104 + bw * n / max + 7, y + Nb.rh * .62); }); }
      g.globalAlpha = 1;
      const dd = days[di], txt = d <= 0 ? 'New Orleans, 9 October 2023' : `<b>Day ${di + 1} of ${nDay}</b> · ${dateOf(di)} · ${STATE[dd[3]] || dd[3]} · ${dd[2].toLocaleString('en-GB')} km driven`;
      if (F.note._html !== txt) { F.note._html = txt; F.note.innerHTML = txt; }
    }
    const nearest = (x, y) => { const X = mx.v, Y = my.v, Wm = mw.v, Hm = Wm / ASP; let best = 1e9, bi = -1; route.pts.forEach((p, i) => { const dx = X + p[0] * Wm - x, dy = Y + p[1] * Hm - y, dd = dx * dx + dy * dy; if (dd < best) { best = dd; bi = i; } }); if (best > 46 * 46) return -1; let k = Tr.at.findIndex(a => a >= bi); return k < 0 ? nDay - 1 : k; };
    const hit = ev => { const [x, y] = F.xy(ev); if (mode === 1 && y > B.y - B.h - 8 && y < B.y + 18 && x >= B.x && x <= B.x + B.w) return { day: Math.floor((x - B.x) / (B.w / nDay)) }; if (mode === 2 && x >= Nb.x && y >= Nb.y && y < Nb.y + Nb.rh * Tr.nights.length) return { state: Tr.nights[Math.floor((y - Nb.y) / Nb.rh)][0] }; const k = nearest(x, y); return k >= 0 ? { day: k } : null; };
    F.cv.addEventListener('pointermove', ev => { const o = hit(ev); F.cv.style.cursor = o ? 'pointer' : ''; if (o && o.day != null && mode === 1 && ev.pointerType === 'mouse') { goal = o.day + 1; held = performance.now() + 2500; } });
    F.cv.addEventListener('click', ev => { const o = hit(ev); if (!o) return; ev.stopPropagation(); if (o.state) pickState = pickState === o.state ? '' : o.state; else { goal = o.day + 1; held = performance.now() + 3200; } });
    el.__egf = { day, get mode() { return mode; } };
    return { step(i) { mode = clamp(i | 0, 0, 2); if (mode !== 2) pickState = ''; place(); }, destroy: F.destroy };
  }

  // ---- The Kalmár constant: sixteen symbols, their eight layouts, and what it takes to store the choice ---------
  function kalmar(el, opts) {
    const LAY = [[16], [2, 8], [4, 4], [8, 2], [2, 2, 4], [2, 4, 2], [4, 2, 2], [2, 2, 2, 2]], name = c => c.length === 1 ? '16' : c.join(' × ');
    let mode = 0, lay = 0, auto = 0, byHand = false;
    const F = figure(el, draw, place), g = F.g, xs = Array.from({ length: 16 }, () => F.sp(0)), rowY = F.sp(0), unit = F.sp(20), tower = F.sp(0), rows = [F.sp(0), F.sp(0), F.sp(0)], bits = F.sp(4);
    const groups = c => { const out = []; let size = 16; c.forEach((n, L) => { if (L === c.length - 1) return; size /= n; for (let s = 0; s < 16; s += size) out.push({ key: s + '-' + size, s, size, depth: c.length - 2 - L }); }); out.push({ key: '0-16', s: 0, size: 16, depth: c.length - 1 }); return out; };
    const frames = {}; LAY.forEach(c => groups(c).forEach(q => { if (!frames[q.key]) frames[q.key] = { s: q.s, size: q.size, a: F.sp(0), pad: F.sp(8) }; }));
    const pick = h('div', 'egf-pick', '', F.root); LAY.forEach((c, k) => { const b = h('button', '', name(c), pick); b.type = 'button'; b.addEventListener('click', ev => { ev.stopPropagation(); byHand = true; clearInterval(auto); set(k); }); });
    function set(k) { lay = k; [...pick.children].forEach((b, j) => { b.classList.toggle('on', j === k); b.setAttribute('aria-pressed', j === k ? 'true' : 'false'); }); place(); }
    function place(snap) {
      const W = F.W, H = F.H, c = LAY[lay], pad = 22, raw = []; let x = 0;
      for (let i = 0; i < 16; i++) { if (i) { let gap = 1, size = 16; c.forEach((n, L) => { if (L === c.length - 1) return; size /= n; if (i % size === 0) gap = Math.max(gap, 1.5 + .5 * (c.length - 2 - L)); }); x += gap; } raw.push(x); }
      const depth = c.length - 1, u = Math.min(46, (W - 2 * pad - 16 * depth - 20) / (x + 1)), x0 = (W - x * u) / 2;
      raw.forEach((r, i) => xs[i].to(x0 + r * u)); unit.to(u); rowY.to(mode === 2 ? Math.max(70, H * .27) : H * .5); tower.to(mode === 2 ? 1 : 0); bits.to(mode === 2 ? 10 : mode === 1 ? 7 : 4);
      const now = {}; groups(c).forEach(q => { now[q.key] = q; }); for (const k in frames) { const f = frames[k], q = now[k]; f.a.to(q ? 1 : 0); if (q) f.pad.to(6 + q.depth * 8); }
      rows.forEach((r, j) => r.to(mode === 2 ? 1 : 0));
      pick.style.opacity = mode === 0 ? .55 : 1;
      if (snap) F.springs.forEach(s => s.snap(s.g));
    }
    const address = () => { const c = LAY[lay]; if (c.length === 1) return 'one register, position 11'; let i = 10, size = 16; const d = c.map(n => { size /= n; const q = Math.floor(i / size); i -= q * size; return q + 1; }); return c.length === 2 ? `register ${d[0]}, position ${d[1]}` : 'successive choices ' + d.join(' → '); };
    function draw(dt, t) {
      const c = F.c, y = rowY.v, u = unit.v, r = clamp(u * .2, 3, 8), W = F.W, H = F.H;
      for (const k in frames) { const f = frames[k]; if (f.a.v < .01) continue; const a = xs[f.s].v, b = xs[f.s + f.size - 1].v, p = f.pad.v; g.globalAlpha = f.a.v * (f.size === 16 ? .5 : .9); F.rr(a - r - p, y - r - p, b - a + 2 * (r + p), 2 * (r + p), Math.min(14, r + p)); g.lineWidth = 1.3; g.strokeStyle = f.size === 16 ? c.line : c.cost; g.stroke(); }
      xs.forEach((s, i) => { g.globalAlpha = 1; g.beginPath(); g.arc(s.v, y, i === 10 ? r * 1.25 : r, 0, 6.3); g.fillStyle = i === 10 ? c.gold : c.ink; g.globalAlpha = i === 10 ? 1 : .8; g.fill(); if (i === 10) { g.globalAlpha = .25; g.beginPath(); g.arc(s.v, y, r * 2.6, 0, 6.3); g.fill(); } });
      g.globalAlpha = 1; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; F.font(500, 13); g.fillStyle = c.ink; const dp = (LAY[lay].length - 1) * 8 + 6 + r;
      g.fillText('Symbol 11 · ' + address(), W / 2, y + dp + 24); F.font(400, 12); g.fillStyle = c.muted; g.fillText(`${name(LAY[lay])}${LAY[lay].length === 1 ? ' symbols in one register' : ''} · 4 bits pick the symbol`, W / 2, y - dp - 12);
      if (tower.v > .01) {                                          // each choice of layout is itself a symbol that has to be held
        const T = [['Record that layout', 8, 3, lay], ['Record the three-bit layout', 4, 2, 1], ['Record the two-bit layout', 2, 1, 0]], y0 = y + dp + 46, rh = Math.min(46, (H - y0 - 40) / 3), bx = Math.min(30, (W - 2 * 22 - 250) / 8);
        T.forEach(([label, n, b, on], j) => { const a = smooth(clamp(tower.v * 2.4 - j * .55)), yy = y0 + j * rh + rh / 2, x0 = W / 2 - (8 * (bx + 5)) / 2 + 40;
          g.globalAlpha = a; g.textAlign = 'right'; F.font(500, 12.5); g.fillStyle = c.ink; g.fillText(label, x0 - 14, yy + 4);
          for (let k = 0; k < n; k++) { F.rr(x0 + k * (bx + 5), yy - 9, bx, 18, 4); g.globalAlpha = a * (k === on ? 1 : .55); g.lineWidth = 1.2; g.strokeStyle = k === on ? c.gold : c.line; g.stroke(); if (k === on) { g.globalAlpha = a * .22; g.fillStyle = c.gold; g.fill(); } }
          g.globalAlpha = a; g.textAlign = 'left'; F.font(400, 12); g.fillStyle = c.muted; g.fillText(`${n} possibilities · ${b} bit${b > 1 ? 's' : ''}`, x0 + n * (bx + 5) + 8, yy + 4); });
        g.globalAlpha = tower.v; g.textAlign = 'center'; F.font(600, 15); g.fillStyle = c.gold; const n = Math.round(bits.v); g.fillText(n >= 10 ? '4 + 3 + 2 + 1 = 10 bits' : n + ' bits', W / 2, Math.min(H - 14, y0 + 3 * rh + 22)); }
      g.globalAlpha = 1; g.textAlign = 'left';
    }
    el.__egf = { xs, get mode() { return mode; }, get lay() { return lay; } };
    return { step(i) { mode = clamp(i | 0, 0, 2); clearInterval(auto); if (mode === 0) { byHand = false; set(0); } else if (mode === 1) { if (!byHand) { set(1); if (!MOT().off) auto = setInterval(() => set(lay % 7 + 1), 1900); } else place(); } else { if (!byHand && lay === 0) set(1); else place(); } },
      destroy() { clearInterval(auto); F.destroy(); } };
  }

  // ---- the nine ----------------------------------------------------------------------------------------------------
  const slides = Array.from({ length: 15 }, (_, i) => `twinning-slide-${String(i + 1).padStart(2, '0')}.webp`);
  const phasesArt = () => { const N = window.EIGEN_NODES || {}; if (N.phases && N.phases.art) return Promise.resolve(N.phases.art); return M.need('../phases-of-hierarchy/node.js').then(() => (window.EIGEN_NODES.phases || {}).art, () => null); };
  window.EIGEN_MADE_ITEMS = {
    learning: (el, o) => reel(el, o, 'made-learning', [
      { kind: 'applet', label: 'Four systems, one loop', src: '/talks/laws-of-learning-v3/viz/many-faces.html', poster: 'laws-many-faces.webp', least: 720 },
      { kind: 'applet', label: 'The viable window', src: '/talks/laws-of-learning-v3/viz/viable-window.html', poster: 'laws-viable-window.webp', least: 860 },
      { kind: 'applet', label: 'Depth as coarse-graining', src: '/talks/laws-of-learning-v3/viz/coarse-graining.html', poster: 'laws-coarse-graining.webp', least: 760 }], [{ tile: 0 }, { tile: 1 }, { tile: 2 }]),
    phases: (el, o, x) => reel(el, o, 'made-phases', [
      { kind: 'art', label: 'The model, running', art: x.ART['made-phases'], better: phasesArt, box: '150 -8 240 236' },
      { kind: 'pages', label: 'The paper', pages: ['page-phases-01.webp', 'page-phases-03.webp'] }], [{ tile: 0 }, { tile: 1 }]),
    twinning: (el, o) => reel(el, o, 'made-twinning', [
      { kind: 'slides', label: 'The talk, fifteen slides', slides },
      { kind: 'pages', label: 'The first paper', pages: ['page-tw1-01.webp'] },
      { kind: 'pages', label: 'The paper after its review', pages: ['page-tw2-01.webp', 'page-tw2-02.webp'] }], [{ tile: 0 }, { tile: 1 }, { tile: 2 }]),
    superarc, trip,
    synthetics: (el, o) => reel(el, o, 'made-synthetics', [
      { kind: 'applet', label: 'A register and its cost', src: '/talks/synthetics/viz/partition-register.html', poster: 'synthetics-partition-register.webp' },
      { kind: 'applet', label: 'Why the cost is a logarithm', src: '/talks/synthetics/viz/log-cost.html', poster: 'synthetics-log-cost.webp' },
      { kind: 'applet', label: 'A memory built by diffusion', src: '/talks/synthetics/viz/ingest-diffusion.html', poster: 'synthetics-ingest-diffusion.webp' }], [{ tile: 0 }, { tile: 1 }, { tile: 2 }]),
    cost: (el, o, x) => reel(el, o, 'made-cost', [
      { kind: 'art', label: 'The construction', art: x.ART['made-cost'], box: '176 -8 216 216' },
      { kind: 'pages', label: 'What a level costs', pages: ['page-cost-01.webp', '/assets/img/eigen/source-pages/cost-10.webp'] },
      { kind: 'pages', label: 'The word law', pages: ['/assets/img/eigen/source-pages/cost-13.webp', '/assets/img/eigen/source-pages/cost-14.webp'] }], [{ tile: 0 }, { tile: 1 }, { tile: 2 }]),
    kalmar,
    film: (el, o) => reel(el, o, 'made-film', [
      { kind: 'video', label: 'The interface at work', src: '/demo/writing/media/session-tour.mp4', poster: IMG + 'film-still.webp', length: 97, chapters: [0, 9, 42, 55, 85] }], [{ tile: 0, act: 0 }, { tile: 0, act: 9 }, { tile: 0, act: 42 }, { tile: 0, act: 55 }, { tile: 0, act: 85 }])
  };
})();
