/* The shell every EigenEngine page shares: one header bar, links between pages read from the site graph, and the
   mini-map, which can be popped out on any page and shows the graph, where the reader is and the route taken so far.
   The route is kept for the visit (sessionStorage), so it carries from page to page.
   A page needs only: eigen-tokens.css, eigen-shell.css, eigenengine/_graph/site-graph.js and this file, loaded last. */
(() => {
  'use strict';
  const G = window.EIGEN_GRAPH; if (!G || window.EigenShell) return;
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, text) => { const e = document.createElementNS(NS, tag); for (const k in at || {}) e.setAttribute(k, at[k]); if (text != null) e.textContent = text; return e; };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const store = { get(k, d) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* ---- where each node lives, and which node this page is ------------------------------------------------------ */
  const HOME = '/eigenengine.html';
  const pageOf = id => { const g = G.nodes[id]; if (!g) return HOME; if (id === G.root) return HOME; if (g.page) return g.page; if (g.slug) return `/eigenengine/${g.slug}/`; return `${HOME}#${id}`; };
  const parentOf = id => Object.keys(G.nodes).find(p => (G.nodes[p].children || []).includes(id));
  const ALSO = { '/eigenengine/cost-of-complexity/': 'cost', '/eigenengine/kalmar-constant/': 'cost', '/eigenengine/networked-research/': 'network', '/demo/writing/': 'interface', '/demo/writing/simulation/': 'interface', '/demo/writing/project-record/': 'interface' };
  const path = location.pathname.replace(/index\.html$/, '');
  const onHome = /\/eigenengine\.html$/.test(path);
  const asked = new URLSearchParams(location.search).get('root');
  let here = onHome ? G.root : Object.keys(G.nodes).find(id => id !== G.root && pageOf(id) === path) || ALSO[path] || Object.keys(ALSO).filter(p => path.startsWith(p)).map(p => ALSO[p])[0] || null;
  if (asked && G.nodes[asked] && /research-object/.test(path)) here = asked;
  const nodePage = !onHome && here && pageOf(here) === path;        // a node's own page, as against an older page filed under a node

  /* ---- the route ------------------------------------------------------------------------------------------------ */
  let route = store.get('eg-route', []); if (!Array.isArray(route)) route = [];
  const visit = id => { if (!G.nodes[id] && !/^made-/.test(id)) return; const k = G.nodes[id] ? id : 'made'; if (route[route.length - 1] !== k) { route.push(k); if (route.length > 40) route = route.slice(-40); store.set('eg-route', route); } now = k; draw(); };
  let now = here || G.root;

  /* ---- the map: the same arrangement on every page -------------------------------------------------------------- */
  const BOX = { object: [10, 10, 186, 86], build: [18, 40, 54, 48], conceptric: [76, 40, 54, 48], search: [134, 40, 54, 48], reading: [212, 10, 86, 54], change: [310, 32, 80, 54],
    network: [14, 124, 118, 58], theory: [150, 112, 150, 86], cost: [158, 142, 42, 48], phases: [204, 142, 42, 48], memory: [250, 142, 42, 48], interface: [314, 110, 76, 62], made: [70, 222, 260, 50] };
  const SHORT = { object: 'The research object', build: 'stages', conceptric: 'conceptric', search: 'search', reading: 'papers', change: 'consistency', network: 'network', theory: 'Why it scales', cost: 'Cost', phases: 'Phases', memory: 'Memory', interface: 'interface', made: 'What it has made' };
  const mid = id => { const b = BOX[id]; return b ? [b[0] + b[2] / 2, b[1] + b[3] / 2] : null; };
  let panel, svg, whereEl, routeEl, pill, open = !!store.get('eg-map-open', false);

  function build() {
    pill = document.createElement('button'); pill.type = 'button'; pill.className = 'egs-pill'; pill.setAttribute('aria-expanded', 'false');
    pill.innerHTML = '<svg viewBox="0 0 20 16" aria-hidden="true"><rect x="1" y="1" width="8" height="6" rx="1.5"/><rect x="12" y="3" width="7" height="5" rx="1.5"/><rect x="5" y="10" width="9" height="5" rx="1.5"/><path d="M9 4h3M8 7l2 3"/></svg><span>Map</span>';
    pill.addEventListener('click', () => toggle());
    panel = document.createElement('aside'); panel.className = 'egs-map'; panel.setAttribute('aria-label', 'Map of EigenEngine'); panel.hidden = true;
    panel.innerHTML = '<div class="egs-map-head"><b>Map</b><span class="egs-map-where"></span><button type="button" class="egs-map-x" aria-label="Close the map">×</button></div><div class="egs-map-svg"></div><p class="egs-map-route"></p>';
    panel.querySelector('.egs-map-x').addEventListener('click', () => toggle(false));
    svg = sv('svg', { viewBox: '0 0 400 282', role: 'group' }); panel.querySelector('.egs-map-svg').appendChild(svg);
    whereEl = panel.querySelector('.egs-map-where'); routeEl = panel.querySelector('.egs-map-route');
    const gL = svg.appendChild(sv('g', { class: 'egs-m-links' }));
    G.links.forEach(([a, b]) => { const p = mid(a), q = mid(b === G.root ? 'theory' : b); if (!p || !q || b === G.root) return; gL.appendChild(sv('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1] })); });
    Object.keys(BOX).forEach(id => {
      const b = BOX[id], g = G.nodes[id]; if (!g) return;
      const holds = (g.children || []).length > 0, a = svg.appendChild(sv('a', { class: 'egs-m-node' + (holds ? ' egs-m-holds' : '') + (g.ground ? ' egs-m-' + g.ground : ''), 'data-id': id, href: pageOf(id), tabindex: 0 }));
      a.appendChild(sv('title', null, g.title));
      a.appendChild(sv('rect', { x: b[0], y: b[1], width: b[2], height: b[3], rx: holds ? 9 : 6 }));
      a.appendChild(sv('text', holds ? { x: b[0] + 9, y: b[1] + 17 } : { x: b[0] + b[2] / 2, y: b[1] + b[3] / 2 + 3.5, 'text-anchor': 'middle' }, SHORT[id] || g.title));
      a.addEventListener('click', e => { const P = (window.EIGEN_PATTERNS || [])[0]; if (onHome && P && P.go) { e.preventDefault(); try { P.go(id); } catch (err) { location.hash = id; } } });
    });
    svg.appendChild(sv('path', { class: 'egs-m-trail' })); svg.appendChild(sv('circle', { class: 'egs-m-you', r: 4 }));
    document.body.appendChild(panel);
    const tools = document.querySelector('.egs-tools'); if (tools) { pill.classList.add('egs-pill-in'); tools.appendChild(pill); panel.classList.add('egs-map-top'); } else document.body.appendChild(pill);
    if (onHome) { let n = 0; const seat = () => { const foot = document.querySelector('.ep-foot'); if (foot) { pill.classList.add('egs-pill-in'); foot.appendChild(pill); panel.classList.add('egs-map-home'); } else if (++n < 40) setTimeout(seat, 200); }; seat(); }
    toggle(open, true);
  }
  function toggle(to, quiet) { open = to == null ? !open : to; panel.hidden = !open; pill.setAttribute('aria-expanded', String(open)); pill.classList.toggle('on', open); if (!quiet) store.set('eg-map-open', open); draw(); }
  function draw() {
    if (!svg) return;
    const seen = new Set(route);
    svg.querySelectorAll('.egs-m-node').forEach(a => { a.classList.toggle('seen', seen.has(a.dataset.id)); a.classList.toggle('here', a.dataset.id === now); });
    const pts = route.slice(-14).map(mid).filter(Boolean);
    svg.querySelector('.egs-m-trail').setAttribute('d', pts.length > 1 ? 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') : '');
    const you = svg.querySelector('.egs-m-you'), bx = BOX[now]; you.style.display = bx ? '' : 'none'; if (bx) { you.setAttribute('cx', bx[0] + bx[2] - 8); you.setAttribute('cy', bx[1] + 8); }
    whereEl.textContent = now && now !== G.root && G.nodes[now] ? G.nodes[now].title : 'EigenEngine';
    const last = route.slice(-5);
    routeEl.innerHTML = last.length > 1 ? 'Your route: ' + last.map(id => `<a href="${pageOf(id)}">${esc(G.nodes[id].title)}</a>`).join(' › ') : 'Every card is a page. The dotted line will follow where you go.';
  }

  /* ---- the header bar and the links of a node's own page -------------------------------------------------------- */
  function bar() {
    const g = G.nodes[here]; if (!nodePage || !g) return;
    const head = document.querySelector('body header, body nav.cqp-top'); if (!head) return;
    const keep = Array.from(head.querySelectorAll('button, [data-eg-level-switch], p')).filter(el => !el.parentElement.closest('[data-eg-level-switch]'));
    const up = parentOf(here), crumbs = document.createElement('nav'); crumbs.className = 'egs-crumbs'; crumbs.setAttribute('aria-label', 'Where this page sits');
    crumbs.innerHTML = `<a href="${HOME}#${here}">← EigenEngine</a>` + (up && up !== G.root ? ` <i>›</i> <a href="${pageOf(up)}">${esc(G.nodes[up].title)}</a>` : '') + ` <i>›</i> <b>${esc(g.title)}</b>`;
    const tools = document.createElement('span'); tools.className = 'egs-tools';
    head.textContent = ''; head.classList.add('egs-bar'); head.appendChild(crumbs);
    keep.forEach(el => { if (el.tagName === 'P') { el.classList.add('egs-kick'); head.appendChild(el); } else tools.appendChild(el); });
    head.appendChild(tools);
    const h1 = document.querySelector('h1'); if (h1 && h1.textContent.trim() !== g.title && !/Cost of Complexity/.test(g.title)) h1.textContent = g.title;
    document.title = g.title + ' · EigenEngine';
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));       // the level switch measures itself again in its new place
  }
  function links() {
    const g = G.nodes[here]; if (!nodePage || !g) return;
    const nav = document.querySelector('nav[aria-label="Linked to this"], nav[aria-label="Linked ideas"]'); if (!nav) return;
    const rows = [], seen = new Set(), add = (word, id) => { if (!G.nodes[id] || id === G.root || seen.has(id)) return; seen.add(id); rows.push(`<a href="${pageOf(id)}"><span>${word} · </span>${esc(G.nodes[id].title)} →</a>`); };
    const up = parentOf(here); if (up) add('Part of', up);
    G.links.forEach(([a, b, k]) => { if (a === here) add(k === 'supports' ? 'Supports' : 'Requires', b); });
    G.links.forEach(([a, b, k]) => { if (b === here) add(k === 'supports' ? 'Supported by' : 'Required by', a); });
    const pages = new Set(Object.keys(G.nodes).map(pageOf)), others = Array.from(nav.querySelectorAll('a')).filter(a => { const p = (a.getAttribute('href') || '').replace(/#.*$/, ''); return p && !pages.has(p) && p !== HOME; });
    nav.innerHTML = rows.join(''); others.forEach(a => nav.appendChild(a));
  }

  window.EigenShell = { visit, here: () => now, pageOf, toggle: to => toggle(to) };
  const start = () => { try { bar(); links(); } catch (e) {} build(); if (here && here !== G.root) visit(here); else draw(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
