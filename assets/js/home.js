/* home.js — the hero constellation. A faint field of points and short
   edges in the identity gold, drifting slowly and parallax-nudging toward
   the pointer. Texture, not carnival. Honours prefers-reduced-motion:
   static single paint, no drift, no pointer response. Self-contained;
   no network. */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-constellation');
  if (!canvas || !canvas.getContext) { return; }
  var ctx = canvas.getContext('2d');
  if (!ctx) { return; }

  var hero = canvas.closest('.hero') || canvas.parentElement;
  if (!hero) { return; }

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var accent = (getComputedStyle(document.documentElement)
    .getPropertyValue('--accent') || '#c9a96e').trim() || '#c9a96e';

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var nodes = [];
  var LINK = 130; // px: max edge length
  var raf = null;

  var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  function build() {
    var n = Math.max(16, Math.min(38, Math.round(W / 46)));
    nodes = [];
    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.10,
        vy: (Math.random() - 0.5) * 0.10,
        z: 0.4 + Math.random() * 0.9,       // depth → parallax weight
        r: 0.8 + Math.random() * 1.3
      });
    }
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    var ox = (pointer.x - 0.5) * 26;
    var oy = (pointer.y - 0.5) * 18;

    var pts = [];
    var i, n;
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      if (!reduce) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -24) { n.x = W + 24; } else if (n.x > W + 24) { n.x = -24; }
        if (n.y < -24) { n.y = H + 24; } else if (n.y > H + 24) { n.y = -24; }
      }
      pts.push({ x: n.x + ox * n.z, y: n.y + oy * n.z, r: n.r, z: n.z });
    }

    var a, b, dx, dy, d, al;
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = accent;
    for (a = 0; a < pts.length; a++) {
      for (b = a + 1; b < pts.length; b++) {
        dx = pts[a].x - pts[b].x;
        dy = pts[a].y - pts[b].y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          al = (1 - d / LINK) * 0.15;
          ctx.globalAlpha = al;
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
      }
    }

    ctx.fillStyle = accent;
    for (i = 0; i < pts.length; i++) {
      ctx.globalAlpha = 0.16 + pts[i].z * 0.16;
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick() {
    draw();
    raf = window.requestAnimationFrame(tick);
  }

  function onMove(e) {
    var r = hero.getBoundingClientRect();
    var cx, cy;
    if (e.touches && e.touches.length) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else {
      cx = e.clientX; cy = e.clientY;
    }
    pointer.tx = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    pointer.ty = Math.max(0, Math.min(1, (cy - r.top) / r.height));
    // observable hook for verification: the layer records the pointer.
    canvas.setAttribute('data-px', pointer.tx.toFixed(3));
    canvas.setAttribute('data-py', pointer.ty.toFixed(3));
  }

  var rtimer = null;
  function onResize() {
    if (rtimer) { window.clearTimeout(rtimer); }
    rtimer = window.setTimeout(function () {
      resize();
      if (reduce) { draw(); }
    }, 160);
  }

  resize();
  if (reduce) {
    draw(); // static single paint, no drift, no pointer wiring
  } else {
    hero.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    tick();
  }
})();
