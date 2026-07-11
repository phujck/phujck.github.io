/* eigenengine.js — the two exhibits on the EigenEngine page.
   (1) a STATIC render of the real falqon conceptric (window.EIGEN_GRAPH), drawn once
       from baked coordinates: no physics, no animation, no per-load jitter. It carries
       its information at rest — clusters are labelled, nodes are sized by degree, the
       six def-orphans ring red. Hover/tap ADDS precision (a node's full label, id,
       edges); it never reveals the basics.
   (2) the pipeline diagram's per-stage readout.
   Self-contained, no dependencies. Desktop: hover to read a node. Touch: tap to read;
   the page always scrolls (no gesture is trapped). */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ graph */
  function initGraph() {
    var G = window.EIGEN_GRAPH;
    var canvas = document.getElementById('ee-graph');
    if (!G || !canvas || !canvas.getContext || !G.layout) return;
    var fallback = document.querySelector('.ee-canvas-fallback');
    if (fallback) fallback.style.display = 'none';

    var ctx = canvas.getContext('2d');
    var KIND_COLOR = {
      domain: '#dfc599', cluster: '#c9a96e', claim: '#7eb8da',
      result: '#e6cc92', def: '#a89a7a', limitation: '#b8894a', section: '#6b7280'
    };
    var ORPHAN = '#c0392b';

    // build node + edge model from baked coordinates (world space = layout viewBox)
    var nodes = G.nodes.map(function (n) {
      return { id: n.id, kind: n.kind, label: n.label, short: n.short, orphan: n.orphan,
               wx: n.x, wy: n.y, deg: 0 };
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
    var labels = G.layout.labels || [];
    var VB_W = G.layout.vbW, VB_H = G.layout.vbH;

    // fit: baked viewBox -> canvas, contained, deterministic (no pan, no zoom)
    var view = { s: 1, ox: 0, oy: 0, w: 0, h: 0, dpr: 1 };
    var hoverId = null, selId = null, filterKind = null;

    function radiusOf(n) { return 4 + Math.min(9, Math.sqrt(n.deg) * 2.1); }
    function colorOf(n) { return n.orphan ? ORPHAN : (KIND_COLOR[n.kind] || '#9ca3af'); }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      view.dpr = window.devicePixelRatio || 1;
      view.w = rect.width; view.h = rect.height;
      canvas.width = Math.round(rect.width * view.dpr);
      canvas.height = Math.round(rect.height * view.dpr);
      // contain the baked box in the canvas with a small margin
      var pad = 14;
      var s = Math.min((view.w - 2 * pad) / VB_W, (view.h - 2 * pad) / VB_H);
      view.s = s;
      view.ox = (view.w - VB_W * s) / 2;
      view.oy = (view.h - VB_H * s) / 2;
      draw();
    }

    function sx(wx) { return view.ox + wx * view.s; }
    function sy(wy) { return view.oy + wy * view.s; }

    function draw() {
      ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
      ctx.clearRect(0, 0, view.w, view.h);
      var active = (hoverId != null) ? hoverId : selId;
      var nbr = (active != null && adj[active]) ? adj[active] : null;
      // edges
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i], na = nodes[e.a], nb = nodes[e.b];
        if (filterKind && na.kind !== filterKind && nb.kind !== filterKind) continue;
        var touch = active != null && (e.a === active || e.b === active);
        ctx.beginPath();
        ctx.moveTo(sx(na.wx), sy(na.wy)); ctx.lineTo(sx(nb.wx), sy(nb.wy));
        ctx.strokeStyle = touch ? 'rgba(201,169,110,0.60)' : 'rgba(255,255,255,0.07)';
        ctx.lineWidth = touch ? 1.4 : 0.7;
        ctx.stroke();
      }
      // nodes
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k], px = sx(n.wx), py = sy(n.wy), r = radiusOf(n);
        var dim = filterKind && n.kind !== filterKind;
        var isActive = (n.id === active);
        var isNbr = nbr && nbr[k] != null;
        ctx.globalAlpha = dim ? 0.12 : (active != null && !isActive && !isNbr ? 0.30 : 1);
        ctx.beginPath();
        ctx.arc(px, py, isActive ? r + 2.5 : r, 0, Math.PI * 2);
        ctx.fillStyle = colorOf(n);
        ctx.fill();
        if (isActive) {
          ctx.lineWidth = 2; ctx.strokeStyle = '#e8e6e3'; ctx.stroke();
        } else if (n.orphan) {
          ctx.lineWidth = 1.6; ctx.strokeStyle = ORPHAN; ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // static cluster labels drawn on top, so they read as clean pins (the map at rest)
      if (!filterKind && active == null) drawLabels();
      // active-node label chip (precision added on hover/tap)
      if (active != null) {
        var an = nodes[index[active]]; if (an) {
          var ap = { x: sx(an.wx), y: sy(an.wy) };
          var txt = an.short || an.id;
          ctx.font = '12px ui-monospace, "JetBrains Mono", monospace';
          var tw = ctx.measureText(txt).width;
          var bx = Math.min(Math.max(ap.x + 10, 4), view.w - tw - 12);
          var by = ap.y - 10;
          ctx.fillStyle = 'rgba(10,14,26,0.88)';
          ctx.fillRect(bx - 4, by - 12, tw + 8, 18);
          ctx.fillStyle = '#e8e6e3';
          ctx.fillText(txt, bx, by + 1);
        }
      }
    }

    function drawLabels() {
      ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      for (var i = 0; i < labels.length; i++) {
        var l = labels[i], tw = ctx.measureText(l.text).width;
        // offset upward in SCREEN px by the anchor node's radius so it always clears it;
        // clamp x so the chip never spills past the canvas edge (matters on narrow screens)
        var lx = Math.min(Math.max(sx(l.x), tw / 2 + 8), view.w - tw / 2 - 8);
        var ly = sy(l.y) - ((l.r || 8) + 16);
        var col = l.kind === 'section' ? 'rgba(156,163,175,0.95)' : 'rgba(223,197,153,0.98)';
        // solid chip so the label reads as a deliberate pin over nodes/edges
        ctx.fillStyle = 'rgba(12,16,28,0.94)';
        ctx.fillRect(lx - tw / 2 - 6, ly - 11, tw + 12, 16);
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.strokeRect(lx - tw / 2 - 6, ly - 11, tw + 12, 16);
        ctx.fillStyle = col;
        ctx.fillText(l.text, lx, ly);
      }
      ctx.textAlign = 'left';
    }

    // readout DOM
    var elKind = document.getElementById('ee-r-kind');
    var elLabel = document.getElementById('ee-r-label');
    var elId = document.getElementById('ee-r-id');
    var elEdges = document.getElementById('ee-r-edges');
    var elHint = document.getElementById('ee-r-hint');
    function relSummary(ix) {
      var a = adj[ix]; if (!a) return '';
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
    function clearReadout() {
      if (elHint) elHint.style.display = '';
      [elKind, elLabel, elId, elEdges].forEach(function (el) { if (el) el.style.display = 'none'; });
    }

    // hit-testing (screen space)
    function pick(px, py) {
      var best = null, bestD = 1e9;
      for (var i = 0; i < nodes.length; i++) {
        if (filterKind && nodes[i].kind !== filterKind) continue;
        var dx = sx(nodes[i].wx) - px, dy = sy(nodes[i].wy) - py, d2 = dx * dx + dy * dy;
        var rr = radiusOf(nodes[i]) + 7; rr = rr * rr;
        if (d2 < rr && d2 < bestD) { bestD = d2; best = nodes[i]; }
      }
      return best;
    }
    function localXY(ev) {
      var rect = canvas.getBoundingClientRect();
      return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    }

    // interaction: hover (desktop) + tap (touch) to read. Nothing moves.
    canvas.addEventListener('pointermove', function (ev) {
      if (ev.pointerType === 'touch') return;
      var pt = localXY(ev);
      var hit = pick(pt.x, pt.y);
      var id = hit ? hit.id : null;
      if (id !== hoverId) {
        hoverId = id;
        canvas.style.cursor = hit ? 'pointer' : 'default';
        if (id) showReadout(id); else if (selId == null) clearReadout(); else showReadout(selId);
        draw();
      }
    });
    canvas.addEventListener('pointerleave', function () {
      if (hoverId != null) { hoverId = null; if (selId != null) showReadout(selId); else clearReadout(); draw(); }
    });
    canvas.addEventListener('pointerdown', function (ev) {
      // tap-select on touch; never preventDefault so the page keeps scrolling
      if (ev.pointerType !== 'touch') {
        var pt0 = localXY(ev), hit0 = pick(pt0.x, pt0.y);
        selId = hit0 ? hit0.id : null;
        if (hit0) showReadout(hit0.id); else clearReadout();
        draw();
        return;
      }
      var pt = localXY(ev), hit = pick(pt.x, pt.y);
      if (hit) { selId = hit.id; showReadout(hit.id); } else { selId = null; clearReadout(); }
      draw();
    });

    // legend filter (state change, redrawn once — no animation)
    Array.prototype.forEach.call(document.querySelectorAll('.ee-legend-row'), function (row) {
      row.addEventListener('click', function () {
        var kind = row.getAttribute('data-kind');
        filterKind = (filterKind === kind) ? null : kind;
        Array.prototype.forEach.call(document.querySelectorAll('.ee-legend-row'), function (r) {
          r.classList.toggle('dimmed', filterKind && r.getAttribute('data-kind') !== filterKind);
          r.setAttribute('aria-pressed', filterKind === r.getAttribute('data-kind') ? 'true' : 'false');
        });
        draw();
      });
    });

    window.addEventListener('resize', resize);
    resize();
    // expose for tests
    window.__eeGraph = { showReadout: showReadout, pick: pick, nodes: nodes,
      selectFirst: function () { selId = nodes[0].id; showReadout(nodes[0].id); draw(); } };
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
