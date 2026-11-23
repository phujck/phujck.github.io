/* The technicality switch: every description on the EigenEngine pages exists at two levels, plain and expert, and the
   reader chooses which one the page is written at. Choosing the level is choosing a receiver state, so this file is the
   projection node's idea carried out by the whole site (dispatch/CONTRACT.md, "Two levels").

   What a node supplies:  any of line, text, a step's caption, a section's title, line or caption, kicker, and the label of
                          an `out` link may be written { plain: '…', expert: '…' }. A plain string counts as both.
                          The expert string may hold LaTeX between \( and \) (in a line) or \[ and \] (set apart).
   What a host does:      load level.css and this file before any node.js, and put <span data-eg-level-switch></span>
                          where the switch should sit. Nothing else: a two-level field prints as both readings and the
                          stylesheet shows the one in force.
   What an exhibit may do: listen for `eigen-level` on window (detail.level is 'plain' or 'expert'), or read
                          document.documentElement.dataset.level; write its own two-level words with EigenLevel.html().

   A host that measures such a field, or puts it in an attribute, must take one reading with EigenLevel.pick(field):
   its .length and typeof are those of the markup for both readings (a String object), not of the words on screen.

   EigenLevel.get() / set(level) / toggle()      the level in force; set() also remembers it and fires `eigen-level`
   EigenLevel.two(plain, expert)                 one two-level field
   EigenLevel.html(field)                        markup holding both readings of a field (a string passes through)
   EigenLevel.pick(field[, level])               the one string of a field at a level, for attributes and for measuring
   EigenLevel.adopt(node)                        make the two-level fields of a node printable (done for every node that
                                                 registers in EIGEN_NODES once this file has loaded)
   EigenLevel.switch(el[, opts])                 draw the switch inside el
   EigenLevel.typeset(root)                      set the mathematics under root (done for the whole page when needed) */
(() => {
  'use strict';
  if (window.EigenLevel) return;
  const LEVELS = ['plain', 'expert'], root = document.documentElement;
  const KATEX = '/demo/shared/katex/';                       // the site's own copy; fetched only when an expert reading holds mathematics
  const motionOff = () => !!(window.EG_MOTION && window.EG_MOTION.off);
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---- the level in force ----------------------------------------------------------------------------------- */
  const stored = () => { try { return localStorage.getItem('eg-level'); } catch (e) { return null; } };
  const asked = new URLSearchParams(location.search).get('level');
  let level = LEVELS.includes(asked) ? asked : LEVELS.includes(stored()) ? stored() : 'plain';
  root.dataset.level = level;

  /* ---- a two-level field ------------------------------------------------------------------------------------
     It is a String, so a host that prints `${node.text}` or sets innerHTML gets markup holding both readings, and it
     still answers .plain and .expert as the contract describes. replace() works on the reading in force, because the
     hosts that call it are measuring how much room the words on screen will take. */
  const isTwo = f => !!f && typeof f === 'object' && typeof f.plain === 'string';
  const mark = (plain, expert) => expert == null || expert === plain ? plain
    : `<span class="eg-lv eg-lv-plain">${plain}</span><span class="eg-lv eg-lv-expert">${expert}</span>`;
  function two(plain, expert) {
    const s = new String(mark(plain, expert));               // eslint-disable-line no-new-wrappers
    s.plain = plain; s.expert = expert == null ? plain : expert; s.egTwo = true;
    s.replace = (a, b) => String(pick(s)).replace(a, b);
    return s;
  }
  const pick = (f, lv = level) => isTwo(f) ? (lv === 'expert' ? f.expert : f.plain) : f == null ? '' : String(f);
  const html = f => isTwo(f) ? mark(f.plain, f.expert) : f == null ? '' : String(f);
  const up = f => isTwo(f) && !f.egTwo ? two(f.plain, f.expert) : f;

  const FIELDS = ['line', 'text', 'kicker', 'tag'], INNER = ['title', 'line', 'caption', 'label'];
  function adopt(node) {
    if (!node || typeof node !== 'object' || node.egLevel) return node;
    try { Object.defineProperty(node, 'egLevel', { value: true }); } catch (e) { return node; }
    FIELDS.forEach(k => { if (isTwo(node[k])) node[k] = up(node[k]); });
    const each = list => Array.isArray(list) && list.forEach(o => o && typeof o === 'object' && INNER.forEach(k => { if (isTwo(o[k])) o[k] = up(o[k]); }));
    each(node.exhibit && node.exhibit.steps); each(node.sections); each(node.out);
    return node;
  }
  /* every node that registers from now on is adopted as it arrives; the ones already there are adopted now */
  const have = window.EIGEN_NODES || {};
  Object.keys(have).forEach(k => adopt(have[k]));
  try { window.EIGEN_NODES = new Proxy(have, { set(t, k, v) { t[k] = adopt(v); return true; } }); } catch (e) { window.EIGEN_NODES = have; }

  /* ---- mathematics ------------------------------------------------------------------------------------------
     Only expert readings hold any, so nothing is fetched until the expert level is chosen and a formula is on the page. */
  let katex = null;
  const loadKatex = () => katex || (katex = new Promise((res, rej) => {
    if (window.katex) return res(window.katex);
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = KATEX + 'katex.min.css'; document.head.appendChild(css);
    const js = document.createElement('script'); js.src = KATEX + 'katex.min.js'; js.onload = () => res(window.katex); js.onerror = rej; document.head.appendChild(js);
  }));
  const MATH = /\\\((.+?)\\\)|\\\[(.+?)\\\]/gs;
  const pending = new Set(); let queued = false;
  function setMath(el) {                                     // one element whose own text holds \( … \) or \[ … \]
    if (!el.isConnected || el.dataset.egMath === '1') return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), texts = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.includes('\\(') || n.nodeValue.includes('\\[')) texts.push(n);
    if (!texts.length) return;
    texts.forEach(n => {
      if (n.parentNode.closest('.katex')) return;
      const frag = document.createDocumentFragment(); let last = 0; const src = n.nodeValue;
      src.replace(MATH, (all, inl, dis, at) => {
        if (at > last) frag.appendChild(document.createTextNode(src.slice(last, at)));
        const span = document.createElement('span'); span.className = 'eg-math' + (dis != null ? ' eg-math-block' : '');
        try { window.katex.render((inl != null ? inl : dis).trim(), span, { displayMode: dis != null, throwOnError: false, output: 'html' }); }
        catch (e) { span.textContent = inl != null ? inl : dis; span.classList.add('eg-math-raw'); }
        frag.appendChild(span); last = at + all.length; return all;
      });
      if (!last) return;
      if (last < src.length) frag.appendChild(document.createTextNode(src.slice(last)));
      n.parentNode.replaceChild(frag, n);
    });
    el.dataset.egMath = '1';
  }
  const settle = () => root.classList.remove('eg-lv-wait');
  function flush() {
    queued = false; if (!pending.size) return settle();
    const list = [...pending]; pending.clear();
    if (window.katex) { list.forEach(setMath); return settle(); }
    loadKatex().then(() => { list.forEach(setMath); settle(); }, () => { list.forEach(el => { delete el.dataset.egMath; }); settle(); });   // without the library the source stays readable as written
  }
  function typeset(scope = document) {
    if (level !== 'expert') return;
    const found = scope.querySelectorAll ? scope.querySelectorAll('.eg-lv-expert, [data-eg-math]') : [];
    const add = el => { if (el.dataset.egMath !== '1' && /\\\(|\\\[/.test(el.textContent)) { pending.add(el); if (!window.katex) el.dataset.egMath = 'wait'; } };   // until it is set, a formula is kept out of sight, never shown as its source
    found.forEach(add);
    if (scope.matches && scope.matches('.eg-lv-expert, [data-eg-math]')) add(scope);
    if (!pending.size) return;
    if (window.katex) return flush();                        // once the library is here a formula is set before it is ever seen as source
    if (!queued) { queued = true; requestAnimationFrame(flush); }
  }
  function math(el) {                                        // set one element's mathematics now, whichever level is in force
    if (!el || el.dataset.egMath === '1') return;
    if (window.katex) return setMath(el);
    loadKatex().then(() => setMath(el), () => {});
  }
  const hasMath = () => [...document.querySelectorAll('.eg-lv-expert')].some(el => el.dataset.egMath !== '1' && /\\\(|\\\[/.test(el.textContent));
  /* words written after the page has loaded (a caption changing, a card opening) are set as they arrive */
  const watch = new MutationObserver(list => {
    if (level !== 'expert') return;
    for (const m of list) for (const n of m.addedNodes) if (n.nodeType === 1 && !n.classList.contains('katex') && !(n.closest && n.closest('.katex'))) typeset(n);
  });
  if (level === 'expert') { root.classList.add('eg-lv-wait'); setTimeout(settle, 900); }   // on arrival at the expert level, formulas are shown once set
  const startWatch = () => { watch.observe(document.body, { childList: true, subtree: true }); typeset(document); if (!pending.size) settle(); };
  if (document.body) startWatch(); else document.addEventListener('DOMContentLoaded', startWatch);

  /* ---- changing the level -----------------------------------------------------------------------------------
     The words in force fade out, the other reading takes their place, and every block that changes height glides to its
     new height, so nothing on the page jumps. With motion off the change is immediate. */
  const switches = new Set();
  const sync = () => switches.forEach(s => s.sync());
  let timer = 0;
  function blocks() {                                        // the nearest block around each two-level run of words
    const seen = new Set();
    document.querySelectorAll('.eg-lv').forEach(sp => {
      let b = sp.parentElement;
      while (b && b !== document.body && getComputedStyle(b).display.startsWith('inline')) b = b.parentElement;
      if (b && b !== document.body && b.offsetParent !== null) seen.add(b);
    });
    return [...seen];
  }
  function apply(next) {
    level = next; root.dataset.level = next;
    try { localStorage.setItem('eg-level', next); } catch (e) {}
    sync(); typeset(document);
    window.dispatchEvent(new CustomEvent('eigen-level', { detail: { level: next } }));
  }
  function set(next) {
    if (!LEVELS.includes(next) || next === level) return level;
    clearTimeout(timer); root.classList.remove('eg-lv-in');
    if (motionOff() || !document.body) { root.classList.remove('eg-lv-out'); apply(next); return level; }
    const bl = blocks(), before = bl.map(b => b.getBoundingClientRect().height);
    level = next; sync();                                    // the switch itself answers at once
    root.classList.add('eg-lv-out');
    /* the library is fetched while the old words fade, so the formulas arrive already set */
    const ready = next === 'expert' && !window.katex && hasMath() ? Promise.race([loadKatex().catch(() => {}), new Promise(r => setTimeout(r, 700))]) : Promise.resolve();
    const token = timer = setTimeout(() => ready.then(() => {
      if (timer !== token) return;
      apply(next);
      bl.forEach((b, i) => {
        if (!b.isConnected) return;
        const after = b.getBoundingClientRect().height;
        if (Math.abs(after - before[i]) < 1.5) return;
        const cs = getComputedStyle(b); if (cs.position === 'absolute' || cs.position === 'fixed') return;
        b.style.height = before[i] + 'px'; b.style.overflow = 'hidden'; void b.offsetHeight;
        b.style.transition = 'height .36s cubic-bezier(.3,.1,.2,1)'; b.style.height = after + 'px';
        setTimeout(() => { b.style.height = b.style.overflow = b.style.transition = ''; }, 400);
      });
      root.classList.remove('eg-lv-out'); root.classList.add('eg-lv-in');
      timer = setTimeout(() => root.classList.remove('eg-lv-in'), 420);
    }), 170);
    return next;
  }

  /* ---- the switch ---------------------------------------------------------------------------------------------
     Two choices, one always lit: the lit one is the level the page is written at. */
  function makeSwitch(el, opts = {}) {
    if (!el || el.dataset.egLevelReady) return null;
    el.dataset.egLevelReady = '1'; el.classList.add('eg-level'); el.setAttribute('role', 'group');
    const legend = opts.legend == null ? 'Described' : opts.legend, names = opts.names || { plain: 'in plain terms', expert: 'with the equations' };
    el.setAttribute('aria-label', 'How technical the descriptions are');
    el.innerHTML = (legend ? `<span class="eg-level-legend">${esc(legend)}</span>` : '') + '<span class="eg-level-track"><i class="eg-level-thumb" aria-hidden="true"></i>' +
      LEVELS.map(l => `<button type="button" data-level="${l}" title="${l === 'plain' ? 'Every description in plain terms' : 'Every description with its equations and conditions'}">${esc(names[l])}</button>`).join('') + '</span>';
    const btns = [...el.querySelectorAll('button')], thumb = el.querySelector('.eg-level-thumb');
    const me = {
      sync() {
        btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.level === level ? 'true' : 'false'));
        const on = btns.find(b => b.dataset.level === level);
        if (on && on.offsetWidth) { thumb.style.width = on.offsetWidth + 'px'; thumb.style.transform = `translateX(${on.offsetLeft}px)`; thumb.style.opacity = 1; }
      },
      destroy() { switches.delete(me); el.innerHTML = ''; delete el.dataset.egLevelReady; }
    };
    btns.forEach(b => b.addEventListener('click', () => set(b.dataset.level)));
    switches.add(me); me.sync();
    requestAnimationFrame(me.sync); if (document.fonts && document.fonts.ready) document.fonts.ready.then(me.sync);
    return me;
  }
  const mountAll = () => document.querySelectorAll('[data-eg-level-switch]').forEach(el => makeSwitch(el));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll); else mountAll();
  window.addEventListener('resize', sync);
  window.addEventListener('storage', e => { if (e.key === 'eg-level' && LEVELS.includes(e.newValue) && e.newValue !== level) { root.classList.remove('eg-lv-out'); apply(e.newValue); } });

  window.EigenLevel = { LEVELS, get: () => level, set, toggle: () => set(level === 'plain' ? 'expert' : 'plain'), two, html, pick, adopt, typeset, math, switch: makeSwitch, mount: mountAll };
})();
