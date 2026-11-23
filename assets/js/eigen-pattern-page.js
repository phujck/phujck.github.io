/* Starts the EigenEngine pattern on a page: loads the level switch, then every node the graph names
   (eigenengine/<slug>/node.js and node.css), names them from the graph, and draws every .ep-app from its data-ep-root. */
(() => {
  'use strict';
  const G = window.EIGEN_GRAPH; if (!G || !window.EigenPattern) return;
  const css = href => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); };
  const js = src => new Promise(res => { const s = document.createElement('script'); s.src = src; s.async = false; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  const start = () => {
    if (start.done) return; start.done = true;
    try { window.EIGEN_PATTERN_FILL(); } catch (e) {}
    /* an old address such as #memory names an item of the plain list; the pattern opens the matching card, and the page stays where it is */
    document.querySelectorAll('.ep-fallback [id]').forEach(e => e.removeAttribute('id'));
    if (location.hash) { const top = () => { if (window.scrollY) window.scrollTo(0, 0); }; top(); window.addEventListener('load', top); [120, 500, 1200].forEach(ms => setTimeout(top, ms)); }
    document.querySelectorAll('.ep-app').forEach(app => {
      const q = new URLSearchParams(location.search).get('root'); if (q && G.nodes[q] && app.hasAttribute('data-ep-any-root')) app.dataset.epRoot = q;
      const id = app.dataset.epRoot || G.root, N = (window.EIGEN_NODES || {})[id] || {}, g = G.nodes[id] || {}, c = app.querySelector('.ep-console');
      if (c && id !== G.root && !c.querySelector('h1')) c.insertAdjacentHTML('beforeend', `<a class="ep-up" href="/eigenengine.html#${id}">← EigenEngine</a><h1>${g.title || N.title}</h1><p class="ep-def">${N.line || ''}</p><p class="ep-lede">${N.text || ''}</p>`);
      const P = new window.EigenPattern(app); (window.EIGEN_PATTERNS = window.EIGEN_PATTERNS || []).push(P);
      if (N.sections && N.sections.length && !(g.children || []).length) { const box = document.createElement('div'); box.className = 'ep-sections'; app.parentNode.insertBefore(box, app.nextSibling); N.sections.forEach(sec => { const h = document.createElement('h2'); h.innerHTML = sec.title || ''; const d = document.createElement('div'); box.appendChild(h); box.appendChild(d); try { sec.mount(d); } catch (e) {} }); }
    });
  };
  css('/eigenengine/projection/level.css');
  js('/eigenengine/projection/level.js').then(() => {
    const slugs = Object.keys(G.nodes).map(id => G.nodes[id].slug).filter(Boolean);
    slugs.forEach(slug => css(`/eigenengine/${slug}/node.css`));
    return Promise.all(slugs.map(slug => js(`/eigenengine/${slug}/node.js`)));
  }).then(start, start);
  setTimeout(start, 4000);
})();
