/* eigenengine-graph.js — draws the baked index of one paper (window.EE from
   assets/js/eigenengine-page-data.js: nodes with x, y, kind, label; edges src→dst)
   onto a canvas and reads a node's label on hover or tap. No physics, no layout:
   the coordinates are the ones the engine emitted. */
(function () {
  "use strict";
  var EE = window.EE; if (!EE || !EE.conceptric) return;
  var canvas = document.getElementById("ee-graph"); if (!canvas) return;
  var readout = document.getElementById("ee-graph-readout");
  var legend = document.getElementById("ee-legend");
  var C = EE.conceptric, nodes = C.nodes, edges = C.edges;
  var orphans = {}; (C.def_orphans || []).forEach(function (id) { orphans[id] = true; });
  var HUE = { def: "#16A085", claim: "#4A90D9", limitation: "#D35400", result: "#9B5DE5" };
  var NAME = { def: "definition", claim: "claim", limitation: "limitation", result: "result", section: "section", cluster: "group", domain: "domain" };
  var NEUTRAL = "#6b7280", RED = "#c0392b";
  var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  var W = 1000, H = 620, PAD = 24;
  var xs = nodes.map(function (n) { return n.x; }), ys = nodes.map(function (n) { return n.y; });
  var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
  function sx(x) { return PAD + (x - x0) / (x1 - x0) * (W - 2 * PAD); }
  function sy(y) { return PAD + (y - y0) / (y1 - y0) * (H - 2 * PAD); }
  function radius(n) { return n.kind === "cluster" || n.kind === "domain" ? 9 : n.kind === "section" ? 6 : 5; }
  var hover = null;

  function draw() {
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || W, cssH = cssW * H / W;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr; canvas.style.height = cssH + "px";
    var ctx = canvas.getContext("2d"); ctx.setTransform(dpr * cssW / W, 0, 0, dpr * cssW / W, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    edges.forEach(function (e) {
      var a = byId[e.src], b = byId[e.dst]; if (!a || !b) return;
      var lit = hover && (e.src === hover.id || e.dst === hover.id);
      ctx.strokeStyle = lit ? "rgba(201,169,110,0.9)" : "rgba(255,255,255,0.10)";
      ctx.beginPath(); ctx.moveTo(sx(a.x), sy(a.y)); ctx.lineTo(sx(b.x), sy(b.y)); ctx.stroke();
    });
    nodes.forEach(function (n) {
      var r = radius(n), fill = HUE[n.kind] || NEUTRAL;
      ctx.beginPath();
      if (n.kind === "section" || n.kind === "cluster" || n.kind === "domain") { ctx.rect(sx(n.x) - r, sy(n.y) - r, 2 * r, 2 * r); }
      else { ctx.arc(sx(n.x), sy(n.y), r, 0, Math.PI * 2); }
      ctx.fillStyle = fill; ctx.globalAlpha = hover && hover !== n ? 0.55 : 1; ctx.fill(); ctx.globalAlpha = 1;
      if (orphans[n.id] || (n.kind === "def" && orphans[n.label])) { ctx.lineWidth = 2; ctx.strokeStyle = RED; ctx.beginPath(); ctx.arc(sx(n.x), sy(n.y), r + 3, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1; }
      if (hover === n) { ctx.lineWidth = 2; ctx.strokeStyle = "#e8e6e3"; ctx.beginPath(); ctx.arc(sx(n.x), sy(n.y), r + 4, 0, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 1; }
    });
  }
  function pick(ev) {
    var rect = canvas.getBoundingClientRect(), k = W / rect.width;
    var px = (ev.clientX - rect.left) * k, py = (ev.clientY - rect.top) * k, best = null, bd = 14 * 14;
    nodes.forEach(function (n) { var dx = sx(n.x) - px, dy = sy(n.y) - py, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = n; } });
    return best;
  }
  function describe(n) {
    if (!readout) return;
    if (!n) { readout.innerHTML = '<span class="ee-dim">hover a node, or tap one on a phone</span>'; return; }
    var deg = edges.filter(function (e) { return e.src === n.id || e.dst === n.id; }).length;
    var kind = NAME[n.kind] || n.kind, flag = orphans[n.id] ? " · a definition no claim uses" : "";
    readout.textContent = kind + " · " + deg + (deg === 1 ? " link" : " links") + flag + " — " + n.label;
  }
  canvas.addEventListener("mousemove", function (ev) { var n = pick(ev); if (n !== hover) { hover = n; describe(n); draw(); } });
  canvas.addEventListener("mouseleave", function () { hover = null; describe(null); draw(); });
  canvas.addEventListener("click", function (ev) { hover = pick(ev); describe(hover); draw(); });
  if (legend) {
    var counts = C.kinds || {};
    legend.innerHTML = ["def", "claim", "result", "limitation"].map(function (k) {
      return '<span class="ee-key"><i style="background:' + HUE[k] + '"></i>' + NAME[k] + (counts[k] ? " · " + counts[k] : "") + "</span>";
    }).join("") + '<span class="ee-key"><i style="background:' + NEUTRAL + ';border-radius:0"></i>section or group</span>' +
      '<span class="ee-key"><i style="background:transparent;border:2px solid ' + RED + '"></i>definition no claim uses · ' + (C.def_orphans || []).length + "</span>";
  }
  var first = nodes.filter(function (n) { return n.kind === "claim"; })[0] || nodes[0];
  hover = first; describe(first); draw();
  window.addEventListener("resize", draw);
})();
