/* ============================================================
   /trip — renders the Timeline reconstruction.
   Data is fetched from /assets/data/, so the page ships small.
   No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var root = function () { return document.querySelector('.trip'); };
  var css = function (v) { return getComputedStyle(root()).getPropertyValue(v).trim(); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-GB'); };
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function label(d) { var p = d.split('-'); return +p[2] + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }

  Promise.all([
    fetch('/assets/data/trip.json').then(function (r) { return r.json(); }),
    fetch('/assets/data/us.json').then(function (r) { return r.json(); }),
    fetch('/assets/data/trip-photos.json').then(function (r) { return r.json(); }).catch(function () { return []; })
  ]).then(function (r) { build(r[0], r[1], r[2]); })
    .catch(function (e) {
      var n = document.getElementById('trip-status');
      if (n) n.textContent = 'Could not load the trip data (' + e.message + ').';
    });

  function build(T, US, PH) {
    var st = document.getElementById('trip-status');
    if (st) st.remove();

    /* ------------------------------ ledger --------------------------- */
    document.getElementById('trip-ledger').innerHTML = [
      [fmt(T.drive.km), '<small>&nbsp;km</small>', 'driven, in ' + T.drive.legs + ' legs'],
      [String(T.days.length), '<small>&nbsp;days</small>', 'leaving to flight out'],
      ['27', '<small>+6</small>', 'states slept in, plus crossed'],
      [String(T.parks.length), '', 'parks and monuments within 28 km'],
      [fmt(T.drive.hours), '<small>&nbsp;h</small>', 'at the wheel, ' + Math.round(T.drive.km / T.drive.hours) + ' km/h mean']
    ].map(function (r) {
      return '<div><span class="n">' + r[0] + r[1] + '</span><span class="l">' + r[2] + '</span></div>';
    }).join('');

    /* --------------------------- projection -------------------------- */
    var P1 = 29.5 * Math.PI / 180, P2 = 45.5 * Math.PI / 180,
        L0 = -96 * Math.PI / 180, PH0 = 37.5 * Math.PI / 180;
    var nA = (Math.sin(P1) + Math.sin(P2)) / 2;
    var CA = Math.pow(Math.cos(P1), 2) + 2 * nA * Math.sin(P1);
    var rho = function (p) { return Math.sqrt(CA - 2 * nA * Math.sin(p)) / nA; };
    var RHO0 = rho(PH0);
    function albers(lat, lon) {
      var p = lat * Math.PI / 180, th = nA * (lon * Math.PI / 180 - L0), r = rho(p);
      return [r * Math.sin(th), RHO0 - r * Math.cos(th)];   // +y north
    }
    var cv = document.getElementById('trip-route'), ctx = cv.getContext('2d');
    var bb = [1e9, -1e9, 1e9, -1e9];
    US.forEach(function (s) {
      (function walk(c) {
        if (typeof c[0] === 'number') {
          var q = albers(c[1], c[0]);
          if (q[0] < bb[0]) bb[0] = q[0]; if (q[0] > bb[1]) bb[1] = q[0];
          if (q[1] < bb[2]) bb[2] = q[1]; if (q[1] > bb[3]) bb[3] = q[1];
          return;
        }
        c.forEach(walk);
      })(s.c);
    });
    var PAD = 26;
    var SC = Math.min((cv.width - 2 * PAD) / (bb[1] - bb[0]), (cv.height - 2 * PAD) / (bb[3] - bb[2]));
    var OX = (cv.width - (bb[1] - bb[0]) * SC) / 2, OY = (cv.height - (bb[3] - bb[2]) * SC) / 2;
    function proj(lat, lon) {
      var q = albers(lat, lon);
      return [OX + (q[0] - bb[0]) * SC, OY + (bb[3] - q[1]) * SC];   // canvas y grows down
    }

    /* --------------------------- pan and zoom ------------------------ */
    // proj() gives map pixels; view maps those onto the canvas.
    var view = { k: 1, tx: 0, ty: 0 };
    function sx(lat, lon) { var q = proj(lat, lon); return [q[0] * view.k + view.tx, q[1] * view.k + view.ty]; }
    function clampView() {
      view.k = Math.min(Math.max(view.k, 1), 14);
      var w = cv.width, h = cv.height;
      view.tx = Math.min(0, Math.max(view.tx, w - w * view.k));
      view.ty = Math.min(0, Math.max(view.ty, h - h * view.k));
    }
    function zoomAbout(cxp, cyp, factor) {
      var k0 = view.k;
      view.k = Math.min(Math.max(view.k * factor, 1), 14);
      var r = view.k / k0;
      view.tx = cxp - (cxp - view.tx) * r;
      view.ty = cyp - (cyp - view.ty) * r;
      clampView(); drawRoute();
    }

    /* ------------------------------- ramp ---------------------------- */
    function hx(x) { return [parseInt(x.slice(1,3),16), parseInt(x.slice(3,5),16), parseInt(x.slice(5,7),16)]; }
    function rampAt(t) {
      var R = ['--route-1','--route-2','--route-3','--route-4','--route-5'].map(css);
      var k = Math.min(Math.max(t, 0), 1) * (R.length - 1);
      var i = Math.min(Math.floor(k), R.length - 2), f = k - i;
      var A = hx(R[i]), B = hx(R[i + 1]);
      return 'rgb(' + A.map(function (v, j) { return Math.round(v + (B[j] - v) * f); }).join(',') + ')';
    }

    /* -------------------- photographs, grouped by day ---------------- */
    var photos = PH.slice().sort(function (x, y) { return x.t.localeCompare(y.t); });
    var days = [];
    photos.forEach(function (p) {
      var d = p.t.slice(0, 10);
      if (!days.length || days[days.length - 1].d !== d) days.push({ d: d, items: [] });
      days[days.length - 1].items.push(p);
    });
    days.forEach(function (g) {
      g.lat = g.items.reduce(function (s, p) { return s + p.lat; }, 0) / g.items.length;
      g.lon = g.items.reduce(function (s, p) { return s + p.lon; }, 0) / g.items.length;
      var named = g.items.filter(function (p) { return p.place; });
      g.place = named.length ? named[0].place : '';
    });
    var hotDay = -1;

    /* ------------------------------- map ----------------------------- */
    function drawRoute() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = css('--bg-secondary') || '#111827';
      ctx.fillRect(0, 0, cv.width, cv.height);

      ctx.fillStyle = 'rgba(255,255,255,0.045)';
      ctx.strokeStyle = 'rgba(255,255,255,0.13)';
      ctx.lineWidth = 1.1;
      US.forEach(function (s) {
        var polys = s.t === 'Polygon' ? [s.c] : s.c;
        ctx.beginPath();
        polys.forEach(function (poly) {
          poly.forEach(function (ring) {
            ring.forEach(function (pt, i) {
              var q = sx(pt[1], pt[0]);
              if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]);
            });
            ctx.closePath();
          });
        });
        ctx.fill('evenodd'); ctx.stroke();
      });

      var tr = T.track, N = tr.length, STEP = Math.max(1, Math.floor(N / 2600));
      ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var i = STEP; i < N; i += STEP) {
        var a = sx(tr[i - STEP][0], tr[i - STEP][1]), b = sx(tr[i][0], tr[i][1]);
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 230) continue;   // not a road
        ctx.strokeStyle = rampAt(i / N);
        ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      T.parks.forEach(function (p) {
        var q = sx(p.lat, p.lon);
        ctx.beginPath(); ctx.arc(q[0], q[1], 9, 0, 7);
        ctx.strokeStyle = css('--accent'); ctx.lineWidth = 2.4; ctx.stroke();
      });

      // One mark per day rather than per frame; hovering a mark puts that
      // day's frames in the panel beside the map.
      days.forEach(function (g, i) {
        var q = sx(g.lat, g.lon);
        var s = 7 + Math.min(Math.sqrt(g.items.length) * 2.6, 8);
        ctx.fillStyle = i === hotDay ? css('--accent') : css('--link');
        ctx.globalAlpha = i === hotDay ? 1 : 0.85;
        ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s);
        ctx.strokeStyle = css('--bg-secondary'); ctx.lineWidth = 2;
        ctx.strokeRect(q[0] - s / 2, q[1] - s / 2, s, s);
        ctx.globalAlpha = 1;
      });

      var h = sx(T.home[0], T.home[1]);
      ctx.beginPath(); ctx.arc(h[0], h[1], 7.5, 0, 7);
      ctx.fillStyle = css('--text-primary'); ctx.fill();
      ctx.strokeStyle = css('--bg-secondary'); ctx.lineWidth = 2.4; ctx.stroke();
    }

    var tip = document.getElementById('trip-tip');

    /* --------------------------- day panel ---------------------------
       The photographs for whichever day the pointer finds on the map are
       shown full-size in the panel beside it, not drawn onto the canvas.
       The panel is sticky per day: it keeps the last day until a new one
       is hovered, so the pointer can travel from mark to photograph. */
    var dvTitle = document.getElementById('trip-dayview-title');
    var dvNote = document.getElementById('trip-dayview-note');
    var dvHost = document.getElementById('trip-dayview-photos');
    var shownDay = -1, dvIdx = 0;
    function big(p) { return '/assets/img/trip/' + p.id + '.jpg'; }
    function dvRender() {
      var g = days[shownDay], n = g.items.length, p = g.items[dvIdx];
      dvNote.textContent = p.t.slice(11, 16) + ' UTC · ±' + p.dt + ' min' +
        (p.place ? ' · ' + p.place.split(',')[0] : '') + ' · click for full size';
      dvHost.innerHTML =
        '<div class="trip-dayframe">' +
        '<img src="' + big(p) + '" alt="" decoding="async" ' +
          'style="aspect-ratio:' + (p.w || 1) + '/' + (p.h || 1) + '">' +
        (n > 1 ? '<button class="trip-df-nav prev" type="button" aria-label="Previous">&#8249;</button>' +
                 '<button class="trip-df-nav next" type="button" aria-label="Next">&#8250;</button>' : '') +
        '<span class="trip-df-count">' + (dvIdx + 1) + ' / ' + n + '</span>' +
        '</div>';
      // the neighbours load while this one is on screen, so flicking is instant
      if (n > 1) {
        new Image().src = big(g.items[(dvIdx + 1) % n]);
        new Image().src = big(g.items[(dvIdx - 1 + n) % n]);
      }
    }
    function showDay(gi) {
      if (gi < 0 || gi === shownDay || !dvHost) return;
      shownDay = gi; dvIdx = 0;
      var g = days[gi];
      dvTitle.textContent = label(g.d) + (g.place ? ' — ' + g.place.split(',')[0] : '');
      dvRender();
    }
    if (dvHost) dvHost.addEventListener('click', function (e) {
      var n = days[shownDay] ? days[shownDay].items.length : 0;
      if (!n) return;
      var b = e.target.closest('.trip-df-nav');
      if (b) {
        dvIdx = (dvIdx + (b.classList.contains('next') ? 1 : -1) + n) % n;
        dvRender();
        return;
      }
      if (e.target.closest('img')) {
        var i = photos.findIndex(function (x) { return x.id === days[shownDay].items[dvIdx].id; });
        if (i >= 0) show(i);
      }
    });

    /* ------------------------- map interaction ----------------------- */
    function canvasXY(e) {
      var r = cv.getBoundingClientRect();
      return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height];
    }
    function dayUnder(mx, my) {
      var best = -1, bd = 1e9;
      days.forEach(function (g, i) {
        var q = sx(g.lat, g.lon), d = Math.hypot(q[0] - mx, q[1] - my);
        if (d < bd) { bd = d; best = i; }
      });
      return bd < 26 ? best : -1;
    }
    var drag = null;
    cv.addEventListener('mousedown', function (e) {
      drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
      cv.classList.add('dragging');
    });
    addEventListener('mouseup', function () { drag = null; cv.classList.remove('dragging'); });
    cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      var p = canvasXY(e);
      zoomAbout(p[0], p[1], e.deltaY < 0 ? 1.18 : 1 / 1.18);
    }, { passive: false });
    document.querySelector('.trip-mapctl').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.z === 'reset') { view = { k: 1, tx: 0, ty: 0 }; drawRoute(); }
      else zoomAbout(cv.width / 2, cv.height / 2, b.dataset.z === 'in' ? 1.5 : 1 / 1.5);
    });

    cv.addEventListener('mousemove', function (e) {
      if (drag) {
        var r = cv.getBoundingClientRect(), sc = cv.width / r.width;
        view.tx = drag.tx + (e.clientX - drag.x) * sc;
        view.ty = drag.ty + (e.clientY - drag.y) * sc;
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 3) drag.moved = true;
        clampView(); drawRoute();
        return;
      }
      var p = canvasXY(e), mx = p[0], my = p[1];

      var d = dayUnder(mx, my);
      if (d !== hotDay) { hotDay = d; drawRoute(); }
      if (d >= 0) {
        showDay(d);
        var g = days[d];
        tipAt(e, label(g.d) + ' — ' + g.items.length +
              (g.items.length === 1 ? ' frame' : ' frames') + (g.place ? ' · ' + g.place : ''));
        cv.style.cursor = 'pointer';
        return;
      }
      cv.style.cursor = '';

      var cand = T.parks.map(function (x) {
        return { lat: x.lat, lon: x.lon, t: x.name + ' — ' + x.date + ', within ' + x.km + ' km' };
      }).concat(T.stops.filter(function (s) { return s.days >= 1; }).map(function (s) {
        return { lat: s.lat, lon: s.lon, t: s.name + ', ' + s.state + ' — ' + s.start };
      }));
      var best = null, bd = 1e9;
      cand.forEach(function (c) {
        var q = sx(c.lat, c.lon), dd = Math.hypot(q[0] - mx, q[1] - my);
        if (dd < bd) { bd = dd; best = c; }
      });
      if (best && bd < 22) tipAt(e, best.t); else tip.style.opacity = 0;
    });
    function tipAt(e, text) {
      var r = cv.getBoundingClientRect();
      tip.textContent = text; tip.style.opacity = 1;
      tip.style.left = Math.min((e.clientX - r.left) + 14, r.width - tip.offsetWidth - 8) + 'px';
      tip.style.top = ((e.clientY - r.top) - 34) + 'px';
    }
    cv.addEventListener('mouseleave', function () {
      tip.style.opacity = 0;
      if (hotDay !== -1) { hotDay = -1; drawRoute(); }
    });
    cv.addEventListener('click', function (e) {
      if (drag && drag.moved) return;
      var p = canvasXY(e), d = dayUnder(p[0], p[1]);   // tap = hover, for touch
      if (d >= 0) { hotDay = d; drawRoute(); showDay(d); }
    });
    cv.addEventListener('dblclick', function () { view = { k: 1, tx: 0, ty: 0 }; drawRoute(); });

    /* ----------------------------- mile log -------------------------- */
    (function () {
      var W = 1080, H = 320, M = { l: 46, r: 16, t: 14, b: 52 };
      var iw = W - M.l - M.r, ih = H - M.t - M.b;
      var d = T.days, n = d.length;
      var max = Math.max.apply(null, d.map(function (x) { return x.drive; }));
      var bw = iw / n, Y = function (v) { return M.t + ih - v / max * ih; };
      var s = '';
      [0, 250, 500, 750, 1000, 1250].forEach(function (v) {
        if (v > max) return;
        s += '<line class="gridline" x1="' + M.l + '" x2="' + (M.l + iw) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>' +
             '<text class="axl" x="' + (M.l - 7) + '" y="' + (Y(v) + 3.5) + '" text-anchor="end">' + v + '</text>';
      });
      var i = 0;
      while (i < n) {
        var j = i;
        while (j + 1 < n && d[j + 1].state === d[i].state) j++;
        var x0 = M.l + bw * i, x1 = M.l + bw * (j + 1);
        s += '<rect x="' + x0 + '" y="' + (M.t + ih + 5) + '" width="' + Math.max(x1 - x0 - 1, 1) +
             '" height="15" rx="1" fill="rgba(255,255,255,' + ((i / 2 | 0) % 2 ? 0.06 : 0.11) + ')"/>';
        if (x1 - x0 > 21) {
          s += '<text class="axl" x="' + ((x0 + x1) / 2) + '" y="' + (M.t + ih + 16) +
               '" text-anchor="middle">' + (d[i].state || '') + '</text>';
        }
        i = j + 1;
      }
      d.forEach(function (x, k) {
        if (x.drive < 1) return;
        s += '<rect x="' + (M.l + bw * k + 0.4) + '" y="' + Y(x.drive) + '" width="' + Math.max(bw - 0.8, 0.8) +
             '" height="' + (M.t + ih - Y(x.drive)) + '" fill="' + rampAt(k / n) + '">' +
             '<title>' + x.d + ' — ' + Math.round(x.drive) + ' km (' + (x.state || '—') + ')</title></rect>';
      });
      var cmax = d[n - 1].cum, Y2 = function (v) { return M.t + ih - v / cmax * ih; };
      s += '<polyline points="' + d.map(function (x, k) { return (M.l + bw * (k + 0.5)) + ',' + Y2(x.cum); }).join(' ') +
           '" fill="none" stroke="' + css('--link') + '" stroke-width="1.6" stroke-dasharray="4 3"/>';
      s += '<text class="axt" x="' + (M.l + iw - 4) + '" y="' + (Y2(cmax) - 7) +
           '" text-anchor="end">cumulative ' + fmt(cmax) + ' km</text>';
      var cm = '';
      d.forEach(function (x, k) {
        var m = x.d.slice(0, 7);
        if (m !== cm) {
          cm = m;
          s += '<line class="ax" x1="' + (M.l + bw * k) + '" x2="' + (M.l + bw * k) + '" y1="' + M.t +
               '" y2="' + (M.t + ih) + '" opacity=".55"/>' +
               '<text class="axt" x="' + (M.l + bw * k + 5) + '" y="' + (M.t + 11) + '">' +
               MON[+m.slice(5) - 1] + '</text>';
        }
      });
      s += '<line class="ax" x1="' + M.l + '" x2="' + (M.l + iw) + '" y1="' + (M.t + ih) + '" y2="' + (M.t + ih) + '"/>';
      s += '<text class="axt" transform="translate(12,' + (M.t + ih / 2) + ') rotate(-90)" text-anchor="middle">km driven that day</text>';
      document.getElementById('trip-log').innerHTML = s;
    })();

    /* --------------------------- two small plots --------------------- */
    var M2 = { l: 46, r: 16, t: 14, b: 34 }, CW = 420, CH = 300;
    var iw2 = CW - M2.l - M2.r, ih2 = CH - M2.t - M2.b;
    function axes(yt, xt, xlab, ylab) {
      var s = '';
      yt.forEach(function (t) {
        s += '<line class="gridline" x1="' + M2.l + '" x2="' + (M2.l + iw2) + '" y1="' + t.y + '" y2="' + t.y + '"/>' +
             '<text class="axl" x="' + (M2.l - 7) + '" y="' + (t.y + 3.5) + '" text-anchor="end">' + t.l + '</text>';
      });
      xt.forEach(function (t) {
        s += '<text class="axl" x="' + t.x + '" y="' + (M2.t + ih2 + 15) + '" text-anchor="middle">' + t.l + '</text>';
      });
      s += '<line class="ax" x1="' + M2.l + '" x2="' + (M2.l + iw2) + '" y1="' + (M2.t + ih2) + '" y2="' + (M2.t + ih2) + '"/>';
      s += '<text class="axt" x="' + (M2.l + iw2 / 2) + '" y="' + (CH - 2) + '" text-anchor="middle">' + xlab + '</text>';
      s += '<text class="axt" transform="translate(11,' + (M2.t + ih2 / 2) + ') rotate(-90)" text-anchor="middle">' + ylab + '</text>';
      return s;
    }
    (function () {
      var d = T.days, n = d.length;
      var max = Math.max.apply(null, d.map(function (x) { return x.home; }));
      var X = function (i) { return M2.l + i / (n - 1) * iw2; };
      var Y = function (v) { return M2.t + ih2 - v / max * ih2 * 0.95; };
      var yt = [0, 500, 1000, 1500, 2000, 2500].filter(function (v) { return v <= max * 1.02; })
        .map(function (v) { return { y: Y(v), l: v }; });
      var xt = [], cm = '';
      d.forEach(function (x, k) {
        var m = x.d.slice(0, 7);
        if (m !== cm) { cm = m; xt.push({ x: X(k), l: MON[+m.slice(5) - 1] }); }
      });
      var s = axes(yt, xt, '', 'km from New Orleans');
      s += '<path d="M ' + X(0) + ' ' + Y(0) + ' ' +
           d.map(function (x, k) { return 'L ' + X(k) + ' ' + Y(x.home); }).join(' ') +
           ' L ' + X(n - 1) + ' ' + Y(0) + ' Z" fill="' + css('--accent') + '" opacity=".16"/>';
      s += '<polyline points="' + d.map(function (x, k) { return X(k) + ',' + Y(x.home); }).join(' ') +
           '" fill="none" stroke="' + css('--accent') + '" stroke-width="2.2"/>';
      var pk = d.reduce(function (a, b) { return b.home > a.home ? b : a; });
      var pi = d.indexOf(pk);
      s += '<circle cx="' + X(pi) + '" cy="' + Y(pk.home) + '" r="4" fill="' + css('--accent') + '"/>';
      s += '<text class="axl" x="' + (X(pi) + 7) + '" y="' + (Y(pk.home) + 3) + '">' + fmt(pk.home) + ' km · ' + pk.d + '</text>';
      document.getElementById('trip-home').innerHTML = s;
    })();
    (function () {
      var v = T.days.map(function (x) { return x.drive; }).sort(function (a, b) { return b - a; });
      var n = v.length, max = v[0], bw = iw2 / n;
      var Y = function (y) { return M2.t + ih2 - y / max * ih2 * 0.95; };
      var yt = [0, 250, 500, 750, 1000, 1250].filter(function (y) { return y <= max * 1.02; })
        .map(function (y) { return { y: Y(y), l: y }; });
      var xt = [0, 25, 50, 75].map(function (i) { return { x: M2.l + bw * i, l: i }; });
      var s = axes(yt, xt, 'days, ranked', 'km');
      v.forEach(function (y, i) {
        s += '<rect x="' + (M2.l + bw * i + 0.3) + '" y="' + Y(y) + '" width="' + Math.max(bw - 0.6, 0.6) +
             '" height="' + (M2.t + ih2 - Y(y)) + '" fill="' +
             (y < 5 ? 'rgba(255,255,255,0.14)' : css('--accent')) + '"/>';
      });
      var zero = v.filter(function (y) { return y < 5; }).length, med = v[Math.floor(n / 2)];
      s += '<line x1="' + M2.l + '" x2="' + (M2.l + iw2) + '" y1="' + Y(med) + '" y2="' + Y(med) +
           '" stroke="' + css('--link') + '" stroke-width="1.2" stroke-dasharray="4 3"/>';
      s += '<text class="axl" x="' + (M2.l + iw2 - 3) + '" y="' + (Y(med) - 5) + '" text-anchor="end">median ' + Math.round(med) + ' km</text>';
      s += '<text class="axl" x="' + (M2.l + bw * (n - zero) + 4) + '" y="' + (M2.t + ih2 - 9) + '">' + zero + ' days, no driving</text>';
      document.getElementById('trip-sorted').innerHTML = s;
    })();

    /* ----------------------------- mosaic ---------------------------- */
    var host = document.getElementById('trip-photos');
    var ROW_H = 132;                       // target row height, px
    host.innerHTML = days.map(function (g, gi) {
      return g.items.map(function (p, k) {
        var ar = (p.w > 0 && p.h > 0) ? p.w / p.h : 1;
        return '<button class="trip-photo' + (k === 0 ? ' first' : '') + '" type="button" ' +
          'style="flex:' + (ar * 100).toFixed(1) + ' 1 ' + (ar * ROW_H).toFixed(0) + 'px;' +
          'aspect-ratio:' + (p.w || 1) + '/' + (p.h || 1) + '" ' +
          'data-id="' + p.id + '" data-g="' + gi + '">' +
          '<img src="/assets/img/trip/' + p.id + '_t.jpg" alt="" loading="lazy" decoding="async">' +
          (k === 0 ? '<i class="daychip">' + label(g.d).replace(/ \d{4}$/, '') + '</i>' : '') +
          '<em>' + p.t.slice(11, 16) + ' &plusmn;' + p.dt + 'm' +
          (p.place ? ' · ' + p.place.split(',')[0] : '') + '</em></button>';
      }).join('');
    }).join('');

    document.getElementById('trip-photo-count').textContent =
      photos.length + ' frames over ' + days.length + ' days.';

    /* ----------------------------- lightbox -------------------------- */
    var lb = document.getElementById('trip-lightbox'), cur = 0;
    function show(i) {
      cur = (i + photos.length) % photos.length;
      var p = photos[cur];
      document.getElementById('trip-lb-img').src = '/assets/img/trip/' + p.id + '.jpg';
      document.getElementById('trip-lb-title').textContent = p.place || label(p.t.slice(0, 10));
      document.getElementById('trip-lb-meta').textContent =
        p.t.slice(0, 10) + ' ' + p.t.slice(11, 16) + ' UTC · ' + p.lat.toFixed(4) + ', ' +
        p.lon.toFixed(4) + ' · nearest fix ±' + p.dt + ' min';
      lb.hidden = false;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.trip-photo');
      if (!b) return;
      var i = photos.findIndex(function (p) { return p.id === b.dataset.id; });
      if (i >= 0) show(i);
    });
    document.getElementById('trip-lb-close').addEventListener('click', function () { lb.hidden = true; });
    document.getElementById('trip-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    document.getElementById('trip-lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.hidden = true; });
    addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') lb.hidden = true;
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });

    /* ------------------------------- parks --------------------------- */
    document.getElementById('trip-parks').innerHTML = T.parks.map(function (p) {
      return '<div class="trip-park"><b>' + p.name + '</b><span>' + p.date.slice(5) + ' · ' + p.km + ' km</span></div>';
    }).join('');

    /* ------------------------------- states -------------------------- */
    document.getElementById('trip-states').innerHTML =
      T.nights.map(function (x) {
        return '<div class="trip-state"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>';
      }).join('') +
      T.transit.map(function (s) {
        return '<div class="trip-state transit"><b>' + s + '</b><span>·</span></div>';
      }).join('');

    /* ------------------------------- stops ---------------------------
       Total nights per place, longest first, as bars. The stops rows are
       aggregates (New Orleans spans the bookend stays), so a bar per place
       is the honest shape; a timeline would draw overlapping intervals. */
    (function () {
      var S = T.stops.filter(function (s) { return s.days >= 1; })
                     .sort(function (a, b) { return b.days - a.days; });
      var minor = T.stops.length - S.length;
      var W = 1080, RH = 26, ML = 200, MR = 56;
      var maxD = S.length ? S[0].days : 1;
      var t0 = +new Date(T.days[0].d), t1 = +new Date(T.days[T.days.length - 1].d);
      var el = document.getElementById('trip-stops');
      el.setAttribute('viewBox', '0 0 ' + W + ' ' + (S.length * RH + 6));
      el.innerHTML = S.map(function (s, i) {
        var y = i * RH + 3, bw = Math.max((W - ML - MR) * s.days / maxD, 2);
        var f = Math.min(Math.max((+new Date(s.start) - t0) / (t1 - t0), 0), 1);
        return '<text class="axt" text-anchor="end" x="' + (ML - 10) + '" y="' + (y + RH / 2 + 3.5) + '">' +
            s.name + ', ' + s.state + '</text>' +
          '<rect x="' + ML + '" y="' + (y + 4) + '" width="' + bw.toFixed(1) + '" height="' + (RH - 8) +
            '" rx="2" fill="' + rampAt(f) + '"><title>' + s.name + ', ' + s.state + ' — ' +
            s.start.slice(5) + ' &#8594; ' + s.end.slice(5) + ' &#183; ' + s.days.toFixed(1) + ' nights</title></rect>' +
          '<text class="axl" x="' + (ML + bw + 7).toFixed(1) + '" y="' + (y + RH / 2 + 3.5) + '">' +
            s.days.toFixed(1) + '</text>';
      }).join('');
      document.getElementById('trip-stops-note').textContent =
        'Stays of nine hours or more, summed per place; bar colour is arrival date on the ' +
        'October-to-January ramp. ' + minor + ' shorter pauses are counted but not drawn.';
    })();

    /* ------------------------------ facts ---------------------------- */
    var d = T.days;
    var far = d.reduce(function (a, b) { return b.home > a.home ? b : a; });
    var zero = d.filter(function (x) { return x.drive < 5; }).length;
    var sorted = d.map(function (x) { return x.drive; }).sort(function (a, b) { return a - b; });
    var med = sorted[Math.floor(sorted.length / 2)];
    var busiest = days.reduce(function (a, b) { return b.items.length > a.items.length ? b : a; });
    var top = T.nights.slice(0, 3).map(function (x) { return x[0] + ' ' + x[1]; }).join(', ');
    document.getElementById('trip-facts').innerHTML = [
      ['Longest driving day', fmt(T.drive.longest.km) + ' km · ' + T.drive.longest.d],
      ['Median driving day', Math.round(med) + ' km'],
      ['Days with no driving', zero + ' of ' + d.length],
      ['Furthest from home', fmt(far.home) + ' km · ' + far.d],
      ['Most nights', top],
      ['Distinct stops', T.stops.length],
      ['Photographs', photos.length + ' over ' + days.length + ' days'],
      ['Busiest day for frames', busiest.items.length + ' · ' + label(busiest.d)],
      ['Southernmost', 'Key West, 24.55°N'],
      ['Westernmost', 'Pocatello, 112.45°W']
    ].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');

    // Anything this script fills was empty when main.js observed it, so the
    // site's one-shot fade observer can leave it stuck at opacity 0. Reveal
    // the dynamic containers directly rather than relying on that observer.
    ['trip-ledger','trip-facts','trip-photos','trip-parks','trip-states'].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) n.classList.add('visible');
    });
    document.querySelectorAll('.trip .trip-figure, .trip .trip-grid, .trip .trip-three, .trip .trip-caption')
      .forEach(function (n) { n.classList.add('visible'); });

    // small hook so the figure can be driven and checked from the console
    window.__trip = { days: days, photos: photos, sx: sx, view: view, redraw: drawRoute,
                      hot: function (i) { hotDay = i; drawRoute(); if (i >= 0) showDay(i); } };

    drawRoute();
  }
})();
