/* eigenengine.js — the interactive exhibits on the EigenEngine page.
   (1) a force-directed render of the real falqon conceptric (window.EIGEN_GRAPH),
   (2) the pipeline diagram's per-stage readout.
   Self-contained, no dependencies. Desktop: hover + drag + pan. Touch: tap-select
   (never preventDefaults background moves, so the page always scrolls). */
(function () {
  'use strict';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ graph */
  function initGraph() {
    var G = window.EIGEN_GRAPH;
    var canvas = document.getElementById('ee-graph');
    if (!G || !canvas || !canvas.getContext) return;
    var fallback = document.querySelector('.ee-canvas-fallback');
    if (fallback) fallback.style.display = 'none';

    var ctx = canvas.getContext('2d');
    var KIND_COLOR = {
      domain: '#dfc599', cluster: '#c9a96e', claim: '#7eb8da',
      result: '#e6cc92', def: '#a89a7a', limitation: '#b8894a', section: '#6b7280'
    };
    var ORPHAN = '#c0392b';

    // build node + edge model
    var nodes = G.nodes.map(function (n) {
      return { id: n.id, kind: n.kind, label: n.label, short: n.short, orphan: n.orphan,
               x: 0, y: 0, vx: 0, vy: 0, deg: 0, fixed: false };
    });
    var index = {};
    nodes.forEach(function (n, i) { index[n.id] = i; });
    var edges = [];
    var adj = {};
    G.edges.forEach(function (e) {
      var a = index[e.src], b = index[e.dst];
      if (a == null || b == null) return;
      edges.push({ a: a, b: b, rel: e.rel });
      nodes[a].deg++; nodes[b].deg++;
      (adj[a] = adj[a] || {})[b] = e.rel;
      (adj[b] = adj[b] || {})[a] = e.rel;
    });
    // seed positions on a jittered ring, coarse kinds pulled inward
    nodes.forEach(function (n, i) {
      var coarse = (n.kind === 'domain' || n.kind === 'cluster');
      var r = coarse ? 40 : 150 + (i % 7) * 22;
      var a = (i / nodes.length) * Math.PI * 2 + (i * 2.399);
      n.x = Math.cos(a) * r + (Math.random() - 0.5) * 30;
      n.y = Math.sin(a) * r + (Math.random() - 0.5) * 30;
    });

    var view = { scale: 1, panx: 0, pany: 0, w: 0, h: 0, dpr: 1 };
    var hoverId = null, selId = null, filterKind = null;
    var alpha = 1;

    function radiusOf(n) { return 4 + Math.min(9, Math.sqrt(n.deg) * 2.1); }
    function colorOf(n) { return n.orphan ? ORPHAN : (KIND_COLOR[n.kind] || '#9ca3af'); }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      view.dpr = window.devicePixelRatio || 1;
      view.w = rect.width; view.h = rect.height;
      canvas.width = Math.round(rect.width * view.dpr);
      canvas.height = Math.round(rect.height * view.dpr);
      draw();
    }

    // one physics tick (Fruchterman-Reingold-ish)
    function tick() {
      var i, j, n, m, dx, dy, d2, d, f;
      var REP = 5200, SPRING = 0.010, LEN = 62, GRAV = 0.020;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; if (n.fixed) continue;
        for (j = i + 1; j < nodes.length; j++) {
          m = nodes[j];
          dx = n.x - m.x; dy = n.y - m.y;
          d2 = dx * dx + dy * dy; if (d2 < 0.01) { dx = Math.random(); dy = Math.random(); d2 = 1; }
          d = Math.sqrt(d2);
          f = REP / d2;
          var ux = dx / d, uy = dy / d;
          n.vx += ux * f; n.vy += uy * f;
          if (!m.fixed) { m.vx -= ux * f; m.vy -= uy * f; }
        }
      }
      for (i = 0; i < edges.length; i++) {
        var e = edges[i]; n = nodes[e.a]; m = nodes[e.b];
        dx = m.x - n.x; dy = m.y - n.y; d = Math.sqrt(dx * dx + dy * dy) || 1;
        f = SPRING * (d - LEN);
        var ex = (dx / d) * f, ey = (dy / d) * f;
        if (!n.fixed) { n.vx += ex; n.vy += ey; }
        if (!m.fixed) { m.vx -= ex; m.vy -= ey; }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i]; if (n.fixed) continue;
        n.vx -= n.x * GRAV; n.vy -= n.y * GRAV;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += n.vx * alpha * 1.4; n.y += n.vy * alpha * 1.4;
      }
    }

    function toScreen(n) {
      return {
        x: view.w / 2 + view.panx + n.x * view.scale,
        y: view.h / 2 + view.pany + n.y * view.scale
      };
    }

    function draw() {
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      ctx.clearRect(0, 0, view.w, view.h);
      var active = (hoverId != null) ? hoverId : selId;
      var nbr = (active != null && adj[active]) ? adj[active] : null;
      // edges
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i], na = nodes[e.a], nb = nodes[e.b];
        if (filterKind && na.kind !== filterKind && nb.kind !== filterKind) continue;
        var pa = toScreen(na), pb = toScreen(nb);
        var touch = active != null && (e.a === active || e.b === active);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = touch ? 'rgba(201,169,110,0.55)' : 'rgba(255,255,255,0.06)';
        ctx.lineWidth = touch ? 1.4 : 0.8;
        ctx.stroke();
      }
      // nodes
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k], p = toScreen(n), r = radiusOf(n) * Math.min(1.4, view.scale);
        var dim = filterKind && n.kind !== filterKind;
        var isActive = (n.id === active);
        var isNbr = nbr && nbr[k] != null;
        ctx.globalAlpha = dim ? 0.12 : (active != null && !isActive && !isNbr ? 0.35 : 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, isActive ? r + 2.5 : r, 0, Math.PI * 2);
        ctx.fillStyle = colorOf(n);
        ctx.fill();
        if (isActive) {
          ctx.lineWidth = 2; ctx.strokeStyle = '#e8e6e3'; ctx.stroke();
        } else if (n.orphan) {
          ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(232,230,227,0.4)'; ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // label the active node
      if (active != null) {
        var an = nodes[index[active]]; if (an) {
          var ap = toScreen(an);
          var txt = an.short || an.id;
          ctx.font = '12px ui-monospace, "JetBrains Mono", monospace';
          var tw = ctx.measureText(txt).width;
          var bx = Math.min(Math.max(ap.x + 10, 4), view.w - tw - 12);
          var by = ap.y - 10;
          ctx.fillStyle = 'rgba(10,14,26,0.85)';
          ctx.fillRect(bx - 4, by - 12, tw + 8, 18);
          ctx.fillStyle = '#e8e6e3';
          ctx.fillText(txt, bx, by + 1);
        }
      }
    }

    // readout DOM
    var elKind = document.getElementById('ee-r-kind');
    var elLabel = document.getElementById('ee-r-label');
    var elId = document.getElementById('ee-r-id');
    var elEdges = document.getElementById('ee-r-edges');
    var elHint = document.getElementById('ee-r-hint');
    function relSummary(idx) {
      var a = adj[idx]; if (!a) return '';
      var counts = {};
      for (var k in a) counts[a[k]] = (counts[a[k]] || 0) + 1;
      return Object.keys(counts).map(function (r) { return r + ' ×' + counts[r]; }).join(' · ');
    }
    function showReadout(id) {
      var n = nodes[index[id]]; if (!n) return;
      if (elHint) elHint.style.display = 'none';
      if (elKind) { elKind.style.display = ''; elKind.textContent = n.kind + (n.orphan ? ' · orphan (connectivity gate)' : ''); elKind.style.color = n.orphan ? ORPHAN : 'var(--accent)'; }
      if (elLabel) { elLabel.style.display = ''; elLabel.textContent = n.label; }
      if (elId) { elId.style.display = ''; elId.textContent = n.id; }
      if (elEdges) { elEdges.style.display = ''; elEdges.innerHTML = '<span class="num">' + n.deg + '</span> edges — ' + relSummary(index[id]); }
    }

    // hit-testing
    function pick(sx, sy) {
      var best = null, bestD = 18 * 18;
      for (var i = 0; i < nodes.length; i++) {
        if (filterKind && nodes[i].kind !== filterKind) continue;
        var p = toScreen(nodes[i]);
        var dx = p.x - sx, dy = p.y - sy, d2 = dx * dx + dy * dy;
        var rr = radiusOf(nodes[i]) + 8; rr = rr * rr;
        if (d2 < rr && d2 < bestD) { bestD = d2; best = nodes[i]; }
      }
      return best;
    }
    function localXY(ev) {
      var rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    }

    // interaction state
    var dragNode = null, panning = false, last = null, moved = false;
    canvas.addEventListener('pointerdown', function (ev) {
      var pt = localXY(ev);
      var hit = pick(pt.x, pt.y);
      moved = false;
      if (ev.pointerType === 'touch') {
        // tap-select only: do not capture, do not preventDefault -> page scroll intact
        if (hit) { selId = hit.id; showReadout(hit.id); draw(); }
        return;
      }
      canvas.setPointerCapture(ev.pointerId);
      last = pt;
      if (hit) {
        dragNode = hit; hit.fixed = true; selId = hit.id; showReadout(hit.id);
        canvas.classList.add('dragging');
        if (REDUCED) alpha = 0; else if (alpha < 0.25) { alpha = 0.35; loop(); }
      } else {
        panning = true; canvas.classList.add('dragging');
      }
    });
    canvas.addEventListener('pointermove', function (ev) {
      var pt = localXY(ev);
      if (dragNode) {
        moved = true;
        dragNode.x = (pt.x - view.w / 2 - view.panx) / view.scale;
        dragNode.y = (pt.y - view.h / 2 - view.pany) / view.scale;
        dragNode.vx = dragNode.vy = 0;
        if (REDUCED) draw();
      } else if (panning) {
        moved = true;
        view.panx += pt.x - last.x; view.pany += pt.y - last.y; last = pt; draw();
      } else if (ev.pointerType !== 'touch') {
        var hit = pick(pt.x, pt.y);
        var id = hit ? hit.id : null;
        if (id !== hoverId) {
          hoverId = id;
          canvas.style.cursor = hit ? 'pointer' : 'grab';
          if (id) showReadout(id);
          draw();
        }
      }
    });
    function endPointer(ev) {
      if (dragNode) { dragNode.fixed = false; dragNode = null; }
      panning = false; last = null;
      canvas.classList.remove('dragging');
    }
    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('pointerleave', function () {
      if (!dragNode && !panning && hoverId != null) { hoverId = null; draw(); }
    });
    // desktop wheel zoom (only when pointer is over canvas; ctrl not required)
    canvas.addEventListener('wheel', function (ev) {
      if (ev.deltaY === 0) return;
      ev.preventDefault();
      var f = ev.deltaY < 0 ? 1.1 : 0.9;
      view.scale = Math.max(0.4, Math.min(3, view.scale * f));
      draw();
    }, { passive: false });

    // legend filter
    Array.prototype.forEach.call(document.querySelectorAll('.ee-legend-row'), function (row) {
      row.addEventListener('click', function () {
        var kind = row.getAttribute('data-kind');
        filterKind = (filterKind === kind) ? null : kind;
        Array.prototype.forEach.call(document.querySelectorAll('.ee-legend-row'), function (r) {
          r.classList.toggle('dimmed', filterKind && r.getAttribute('data-kind') !== filterKind);
        });
        draw();
      });
    });
    var reheat = document.getElementById('ee-reheat');
    if (reheat) reheat.addEventListener('click', function () {
      view.panx = view.pany = 0; view.scale = 1;
      nodes.forEach(function (n) { n.fixed = false; });
      if (REDUCED) { settle(220); } else { alpha = 1; loop(); }
    });

    // animation loop with cooling
    var running = false;
    function loop() {
      if (running) return; running = true;
      function step() {
        tick();
        alpha *= 0.985;
        draw();
        if (alpha > 0.02) { requestAnimationFrame(step); }
        else { running = false; alpha = 0; }
      }
      requestAnimationFrame(step);
    }
    function settle(n) { for (var i = 0; i < n; i++) { alpha = Math.max(0.05, 1 - i / n); tick(); } alpha = 0; draw(); }

    window.addEventListener('resize', resize);
    resize();
    if (REDUCED) { settle(260); } else {
      // hold until in view, then run once
      var started = false;
      var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting && !started) { started = true; loop(); io.disconnect(); } });
      }, { threshold: 0.15 }) : null;
      if (io) io.observe(canvas); else { started = true; loop(); }
    }
    // expose for tests
    window.__eeGraph = { showReadout: showReadout, pick: pick, nodes: nodes, toScreen: toScreen, selectFirst: function () { selId = nodes[0].id; showReadout(nodes[0].id); draw(); } };
  }

  /* --------------------------------------------------------------- pipeline */
  function initPipeline() {
    var card = document.getElementById('ee-pipeline-card');
    if (!card) return;
    var STAGES = {
      corpus: { k: 'corpus', t: 'A person’s sources — papers, notes, derivations — stay on local hardware; nothing is uploaded to run the map.', a: 'engine_corpus / source tree' },
      conceptric: { k: 'conceptric', t: 'The sources are decomposed into a graded graph of typed nodes and relations — 91 nodes, 140 edges in the falqon build shown above.', a: 'conceptric_v1.json · 91n/140e' },
      gates: { k: 'gates', t: 'Connectivity, evidence, drift, actor and voice checks run before anything counts as converged; a failed gate opens a residue row instead of smoothing it.', a: 'gates: drift · links · survival · deslop · visual' },
      paper: { k: 'projection · paper', t: 'The converged graph projects to a manuscript with every number keyed to its numerics reading.', a: 'EigenEngine.pdf · numerics/*_readings.json' },
      talk: { k: 'projection · talk', t: 'The same object projects to slides; the falqon and laws-of-learning decks are pipeline output.', a: 'eigenengine-talk.pdf · slides kind' },
      page: { k: 'projection · page', t: 'This page is a projection of the engine by the engine; its shell is generated from a spine and gated on drift.', a: 'site_backend · site/spine.json' },
      demo: { k: 'projection · demo', t: 'The demo is the engine’s editor over the same conceptric, running client-side with comments minted to their author.', a: '/demo/ · baked at commit' }
    };
    var kEl = card.querySelector('.k'), pEl = card.querySelector('p'), aEl = card.querySelector('.ee-addr');
    function show(id) {
      var s = STAGES[id]; if (!s) return;
      kEl.textContent = s.k; pEl.textContent = s.t; aEl.textContent = s.a;
    }
    Array.prototype.forEach.call(document.querySelectorAll('.ee-stage'), function (g) {
      var id = g.getAttribute('data-stage');
      var proj = (id === 'paper' || id === 'talk' || id === 'page' || id === 'demo');
      function on() {
        show(id);
        Array.prototype.forEach.call(document.querySelectorAll('.ee-pipe-edge'), function (ed) {
          var toProj = ed.getAttribute('data-to') === 'proj';
          ed.classList.toggle('hot', (proj && toProj && ed.getAttribute('data-stage') === id) || (!proj && ed.getAttribute('data-from') === id));
        });
      }
      g.addEventListener('mouseenter', on);
      g.addEventListener('focus', on);
      g.addEventListener('click', on);
    });
    show('conceptric');
  }

  function boot() { try { initGraph(); } catch (e) {} try { initPipeline(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
