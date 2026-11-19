(function () {
    var NS = "http://www.w3.org/2000/svg";
    var GOLD = "#c9a96e", BLUE = "#7eb8da", GREY = "#9ca3af", DIM = "#6b7280", INK = "#e8e6e3", DARK = "#0a0e1a";
    function el(id) { return document.getElementById(id); }
    function mk(svg, tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var a in attrs) e.setAttribute(a, attrs[a]); if (text !== undefined) e.textContent = text; svg.appendChild(e); return e; }
    function clear(svg) { while (svg.firstChild) svg.removeChild(svg.firstChild); }
    // Position of the d-th cell along the Hilbert path through an n-by-n grid (n a power of two).
    function d2xy(n, d) { var x = 0, y = 0, t = d, s, rx, ry, tmp; for (s = 1; s < n; s *= 2) { rx = 1 & (t >> 1); ry = 1 & (t ^ rx); if (ry === 0) { if (rx === 1) { x = s - 1 - x; y = s - 1 - y; } tmp = x; x = y; y = tmp; } x += s * rx; y += s * ry; t >>= 2; } return [x, y]; }
    function bars(group, m) { [].forEach.call(group.querySelectorAll("button"), function (b) { b.className = b === m ? "on" : ""; b.setAttribute("aria-pressed", String(b === m)); }); }
    function fmt(v, d) { return v.toFixed(d); }

    // ---- masthead decoration: one Hilbert path of 1024 cells ----
    (function () {
      var svg = el("cc-deco"); if (!svg) return;
      var n = 32, d = "", i, p, c = 320 / n;
      for (i = 0; i < n * n; i++) { p = d2xy(n, i); d += (i ? "L" : "M") + (p[0] * c + c / 2).toFixed(1) + " " + (320 - p[1] * c - c / 2).toFixed(1); }
      var path = mk(svg, "path", { d: d });
      var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (calm || !path.getTotalLength || !("IntersectionObserver" in window)) return;
      var len = path.getTotalLength();
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { path.style.transition = "stroke-dashoffset 6s ease-out"; path.style.strokeDashoffset = 0; io.disconnect(); } }); }, { threshold: 0.2 });
      io.observe(svg);
    })();

    // ---- result 1: sixteen symbols, five arrangements ----
    (function () {
      var grid = el("cc-reg-grid"), addr = el("cc-reg-addr"), read = el("cc-reg-read"), bar = el("cc-reg-bar"); if (!grid || !addr) return;
      var m = 4, sel = 11, pts = [], r;
      for (r = 1; r <= 16; r++) { var p = d2xy(4, r - 1); pts[r] = [48 + p[0] * 75, 272 - p[1] * 75]; }
      function draw() {
        var n = 16 / m, i = Math.ceil(sel / n), j = sel - n * (i - 1), g, k, a, b;
        clear(grid);
        for (g = 1; g <= m; g++) {
          var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
          for (k = (g - 1) * n + 1; k <= g * n; k++) { x0 = Math.min(x0, pts[k][0]); x1 = Math.max(x1, pts[k][0]); y0 = Math.min(y0, pts[k][1]); y1 = Math.max(y1, pts[k][1]); }
          mk(grid, "rect", { x: x0 - 27, y: y0 - 27, width: x1 - x0 + 54, height: y1 - y0 + 54, rx: 16, fill: g === i ? "rgba(201,169,110,0.16)" : "rgba(201,169,110,0.04)", stroke: GOLD, "stroke-width": g === i ? 2 : 1, "stroke-opacity": g === i ? 1 : 0.55 });
        }
        var d = ""; for (k = 1; k <= 16; k++) d += (k > 1 ? "L" : "M") + pts[k][0] + " " + pts[k][1];
        mk(grid, "path", { d: d, fill: "none", stroke: BLUE, "stroke-width": 2, "stroke-opacity": 0.8 });
        for (k = 1; k <= 16; k++) {
          var on = k === sel, node = mk(grid, "g", { style: "cursor:pointer", role: "button", tabindex: 0, "aria-label": "Inspect symbol " + k, "aria-pressed": String(on), "data-r": k });
          mk(node, "circle", { cx: pts[k][0], cy: pts[k][1], r: 17, fill: on ? GOLD : "#101728", stroke: on ? GOLD : BLUE, "stroke-width": 1.5 });
          mk(node, "text", { x: pts[k][0], y: pts[k][1] + 5, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 13, "font-weight": on ? 700 : 400, fill: on ? DARK : INK }, k);
          node.addEventListener("click", chooseSymbol);
          node.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              chooseSymbol(event);
              grid.querySelector('[data-r="' + sel + '"]').focus();
            }
          });
        }
        function chooseSymbol(event) {
          sel = Number(event.currentTarget.dataset.r);
          draw();
        }
        clear(addr);
        function row(y, count, pick, colour, label) {
          mk(addr, "text", { x: 16, y: y, "font-family": "Outfit, sans-serif", "font-size": 13.5, "font-weight": 600, fill: colour }, label);
          var w = Math.min(34, 288 / count), q;
          for (q = 1; q <= count; q++) {
            var hit = q === pick;
            mk(addr, "rect", { x: 16 + (q - 1) * w + 1, y: y + 12, width: w - 2, height: 26, rx: 4, fill: hit ? colour : "rgba(255,255,255,0.04)", stroke: colour, "stroke-opacity": hit ? 1 : 0.5 });
            mk(addr, "text", { x: 16 + (q - 1) * w + w / 2, y: y + 30, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": w < 20 ? 10 : 12, fill: hit ? DARK : GREY }, q);
          }
        }
        row(26, m, i, GOLD, m === 1 ? "Which register: there is only one" : "Which register: " + i + " of " + m);
        row(106, n, j, BLUE, n === 1 ? "Which symbol inside: there is only one" : "Which symbol inside it: " + j + " of " + n);
        a = Math.log(m) / Math.LN2; b = 4 - a;
        mk(addr, "text", { x: 16, y: 198, "font-family": "Outfit, sans-serif", "font-size": 13.5, "font-weight": 600, fill: INK }, "The address of one symbol: 4 bits");
        if (a > 0) mk(addr, "rect", { x: 16, y: 210, width: 72 * a, height: 26, rx: 4, fill: GOLD });
        if (b > 0) mk(addr, "rect", { x: 16 + 72 * a, y: 210, width: 72 * b, height: 26, rx: 4, fill: BLUE });
        mk(addr, "text", { x: 16, y: 256, "font-family": "Lora, serif", "font-size": 12.5, fill: GOLD }, a + (a === 1 ? " bit" : " bits") + " to pick the register");
        mk(addr, "text", { x: 304, y: 256, "text-anchor": "end", "font-family": "Lora, serif", "font-size": 12.5, fill: BLUE }, b + (b === 1 ? " bit" : " bits") + " inside it");
        mk(addr, "text", { x: 16, y: 298, "font-family": "JetBrains Mono, monospace", "font-size": 14, fill: INK }, sel + " = " + n + " × (" + i + " − 1) + " + j);
        read.innerHTML = m === 1 ? "<b>One register holds everything.</b> The selector has nothing to choose, and all sixteen alternatives must be told apart inside the register."
          : n === 1 ? "<b>Every symbol has its own register.</b> Nothing is left to choose inside, and the selector now has to tell sixteen registers apart. The original problem has moved into the selector."
          : "Symbol <b>" + sel + "</b>: <b>" + a + (a === 1 ? " bit chooses" : " bits choose") + "</b> the register and <b>" + b + (b === 1 ? " bit chooses" : " bits choose") + "</b> the position inside it. An account that leaves out the first part makes small registers look cheaper than they are.";
      }
      [].forEach.call(bar.querySelectorAll("button"), function (b) { b.addEventListener("click", function () { m = +b.getAttribute("data-m"); bars(bar, b); draw(); }); });
      draw();
    })();

    // ---- result 2: dividing a square, three prices ----
    (function () {
      var sq = el("cc-hil-sq"), ch = el("cc-hil-ch"), read = el("cc-hil-read"), bar = el("cc-hil-bar"); if (!sq || !ch) return;
      var KMAX = 4, YMAX = 15;
      var series = [
        { name: "price ∝ wall length", colour: GOLD, a: 0.5 },
        { name: "price ∝ area", colour: BLUE, a: 0 },
        { name: "price falls faster than area", colour: GREY, a: -0.5 }
      ];
      // total spent after k rounds, in units of the first round: sum over rounds i of 4^(i*a)
      function spent(a, k) { var s = 0, i; for (i = 0; i < k; i++) s += Math.pow(4, i * a); return s; }
      function X(k) { return 46 + k * 68; } function Y(v) { return 276 - v / YMAX * 240; }
      function draw(k) {
        var n = Math.pow(2, k), c = 280 / n, i, lvl, p, d = "";
        clear(sq);
        mk(sq, "rect", { x: 20, y: 20, width: 280, height: 280, fill: "rgba(255,255,255,0.03)", stroke: GOLD, "stroke-width": 1.5 });
        for (lvl = k; lvl >= 1; lvl--) {
          var step = 280 / Math.pow(2, lvl), op = lvl === 1 ? 1 : lvl === 2 ? 0.6 : lvl === 3 ? 0.36 : 0.22, wdt = lvl === 1 ? 1.8 : lvl === 2 ? 1.3 : 0.9, t;
          for (t = 1; t < Math.pow(2, lvl); t += 2) {
            mk(sq, "line", { x1: 20 + t * step, y1: 20, x2: 20 + t * step, y2: 300, stroke: GOLD, "stroke-opacity": op, "stroke-width": wdt });
            mk(sq, "line", { x1: 20, y1: 20 + t * step, x2: 300, y2: 20 + t * step, stroke: GOLD, "stroke-opacity": op, "stroke-width": wdt });
          }
        }
        if (k === 0) mk(sq, "circle", { cx: 160, cy: 160, r: 6, fill: BLUE });
        else {
          for (i = 0; i < n * n; i++) { p = d2xy(n, i); d += (i ? "L" : "M") + (20 + p[0] * c + c / 2).toFixed(1) + " " + (300 - p[1] * c - c / 2).toFixed(1); }
          mk(sq, "path", { d: d, "class": "cc-hil-trace", pathLength: 1, fill: "none", stroke: BLUE, "stroke-width": k < 3 ? 2.4 : k === 3 ? 2 : 1.5, "stroke-linejoin": "round", "stroke-linecap": "round" });
        }
        clear(ch);
        mk(ch, "path", { d: "M46 30 L46 276 L330 276", fill: "none", stroke: DIM, "stroke-width": 1 });
        for (i = 0; i <= KMAX; i++) mk(ch, "text", { x: X(i), y: 292, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 11.5, fill: i === k ? INK : GREY }, i);
        [0, 5, 10, 15].forEach(function (v) { mk(ch, "text", { x: 38, y: Y(v) + 4, "text-anchor": "end", "font-family": "JetBrains Mono, monospace", "font-size": 11.5, fill: GREY }, v); if (v) mk(ch, "line", { x1: 46, y1: Y(v), x2: 330, y2: Y(v), stroke: "rgba(255,255,255,0.06)" }); });
        mk(ch, "text", { x: 188, y: 312, "text-anchor": "middle", "font-family": "Lora, serif", "font-size": 12.5, fill: GREY }, "rounds of division");
        mk(ch, "text", { x: 46, y: 18, "font-family": "Lora, serif", "font-size": 12.5, fill: GREY }, "total spent on dividing");
        mk(ch, "line", { x1: X(k), y1: 30, x2: X(k), y2: 276, stroke: "rgba(255,255,255,0.18)", "stroke-dasharray": "3 4" });
        series.forEach(function (s, si) {
          var path = "", q;
          for (q = 0; q <= KMAX; q++) path += (q ? "L" : "M") + X(q) + " " + Y(spent(s.a, q)).toFixed(1);
          mk(ch, "path", { d: path, fill: "none", stroke: s.colour, "stroke-width": si === 1 ? 2.6 : 1.8 });
          for (q = 0; q <= KMAX; q++) mk(ch, "circle", { cx: X(q), cy: Y(spent(s.a, q)), r: q === k ? 5 : 2.6, fill: s.colour });
          mk(ch, "rect", { x: 60, y: 40 + si * 20, width: 14, height: 3, fill: s.colour });
          mk(ch, "text", { x: 80, y: 45 + si * 20, "font-family": "Lora, serif", "font-size": 12.5, fill: s.colour }, s.name);
        });
        var N = Math.pow(4, k);
        read.innerHTML = k === 0 ? "<b>1 alternative.</b> Nothing has been divided, so nothing has been spent beyond the cost K<sub>0</sub> of the register existing."
          : "<b>" + N + " alternatives</b> after " + k + (k === 1 ? " round" : " rounds") + ". Spent so far, in units of the first round: <b>" + fmt(spent(0.5, k), 0) + "</b> if a division is priced by wall length, <b>" + fmt(spent(0, k), 0) + "</b> if by area, <b>" + String(+spent(-0.5, k).toFixed(3)) + "</b> if the price falls faster than area. Only the area price adds the same amount every round, which is the logarithm.";
      }
      const play = el("cc-play");
      const rounds = [...bar.querySelectorAll("[data-k]")];
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let timer;
      let depth = 3;
      function showRound(k) {
        depth = k;
        rounds.forEach((button, index) => {
          button.classList.toggle("on", index === k);
          button.setAttribute("aria-pressed", String(index === k));
        });
        draw(k);
      }
      function stop() {
        clearInterval(timer);
        timer = undefined;
        play.textContent = "Play divisions";
      }
      function replay() {
        stop();
        showRound(0);
        play.textContent = "Pause";
        timer = setInterval(() => {
          showRound(depth + 1);
          if (depth === KMAX) stop();
        }, 1250);
      }
      let autoPlayed = false;
      rounds.forEach((button, index) => button.addEventListener("click", () => {
        autoPlayed = true;
        stop();
        showRound(index);
      }));
      play.hidden = false;
      play.addEventListener("click", () => {
        autoPlayed = true;
        if (timer) stop();
        else replay();
      });
      showRound(depth);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !autoPlayed && !motion.matches) {
            autoPlayed = true;
            replay();
          } else if (!entry.isIntersecting) stop();
        }, { threshold: .42 }).observe(sq);
      }
      motion.addEventListener("change", () => { if (motion.matches) stop(); });
    })();

    // ---- result 4: the Zipf family on 500 symbols ----
    (function () {
      var svg = el("cc-zipf"), inp = el("cc-zipf-lam"); if (!svg || !inp) return;
      var R = 500, LR = Math.log(R) / Math.LN10, KT = 4.1419; // k_B T at 300 K, in zeptojoules
      function X(r) { return 52 + Math.log(r) / Math.LN10 / LR * 292; }
      function Y(p) { return 22 - Math.max(-5.4, Math.log(p) / Math.LN10) / 5 * 256; }
      function stats(lam) { var Z = 0, C = 0, r, w; for (r = 1; r <= R; r++) { w = Math.pow(r, -lam); Z += w; C += w * Math.log(r); } C /= Z; return { Z: Z, C: C, S: lam * C + Math.log(Z) }; }
      function line(lam, Z) { var d = "", r, step; for (r = 1; r <= R; r += step) { d += (r > 1 ? "L" : "M") + X(r).toFixed(1) + " " + Y(Math.pow(r, -lam) / Z).toFixed(1); step = r < 20 ? 1 : r < 100 ? 5 : 20; } return d + "L" + X(R).toFixed(1) + " " + Y(Math.pow(R, -lam) / Z).toFixed(1); }
      function draw() {
        var lam = +inp.value, st = stats(lam), e;
        clear(svg);
        var clip = mk(svg, "clipPath", { id: "cc-zipf-clip" }); mk(clip, "rect", { x: 52, y: 22, width: 292, height: 256 });
        mk(svg, "path", { d: "M52 22 L52 278 L344 278", fill: "none", stroke: DIM, "stroke-width": 1 });
        for (e = 0; e >= -5; e--) {
          var y = 22 - e / 5 * 256;
          if (e) mk(svg, "line", { x1: 52, y1: y, x2: 344, y2: y, stroke: "rgba(255,255,255,0.06)" });
          var t = mk(svg, "text", { x: 44, y: y + 4, "text-anchor": "end", "font-family": "JetBrains Mono, monospace", "font-size": 11.5, fill: GREY }, e === 0 ? "1" : "10");
          if (e) mk(t, "tspan", { dy: -5, "font-size": 8.5 }, "−" + (-e));
        }
        [1, 10, 100, 500].forEach(function (r) { mk(svg, "text", { x: X(r), y: 294, "text-anchor": "middle", "font-family": "JetBrains Mono, monospace", "font-size": 11.5, fill: GREY }, r); });
        mk(svg, "text", { x: 198, y: 313, "text-anchor": "middle", "font-family": "Lora, serif", "font-size": 12.5, fill: GREY }, "rank r");
        mk(svg, "text", { x: 52, y: 13, "font-family": "Lora, serif", "font-size": 12.5, fill: GREY }, "share of use p(r)");
        var z1 = stats(1).Z;
        mk(svg, "path", { d: line(1, z1), fill: "none", stroke: GOLD, "stroke-width": 1.4, "stroke-dasharray": "5 4", "clip-path": "url(#cc-zipf-clip)" });
        mk(svg, "line", { x1: 196, y1: 38, x2: 218, y2: 38, stroke: GOLD, "stroke-width": 1.4, "stroke-dasharray": "5 4" });
        mk(svg, "text", { x: 224, y: 42, "font-family": "Lora, serif", "font-size": 12, fill: GOLD }, "λ = 1, Zipf's law");
        mk(svg, "line", { x1: 196, y1: 57, x2: 218, y2: 57, stroke: BLUE, "stroke-width": 2.6 });
        mk(svg, "text", { x: 224, y: 61, "font-family": "Lora, serif", "font-size": 12, fill: BLUE }, "λ set by the slider");
        mk(svg, "path", { d: line(lam, st.Z), fill: "none", stroke: BLUE, "stroke-width": 2.6, "clip-path": "url(#cc-zipf-clip)" });
        el("cc-zipf-out").textContent = fmt(lam, 2);
        el("cc-zipf-c").textContent = fmt(st.C, 2) + " nats";
        el("cc-zipf-s").textContent = fmt(st.S, 2) + " nats";
        el("cc-zipf-q").textContent = fmt(st.S * KT, 1) + " zJ";
      }
      inp.addEventListener("input", draw);
      draw();
    })();
  })();

// Direct links to the two expanded paper notes should land on readable content.
function openPaperNote() {
  const note = document.getElementById(window.location.hash.slice(1));
  if (note instanceof HTMLDetailsElement) note.open = true;
}
window.addEventListener("hashchange", openPaperNote);
openPaperNote();

const coverSwitch = document.querySelector(".ee-plate-switch");
if (coverSwitch) {
  coverSwitch.hidden = false;
  const covers = [...coverSwitch.querySelectorAll("button")];
  for (const button of covers) {
    button.addEventListener("click", () => {
      for (const tab of covers) {
        const selected = tab === button;
        tab.setAttribute("aria-pressed", String(selected));
        document.getElementById("ee-cover-" + tab.dataset.cover).hidden = !selected;
      }
    });
  }
}
