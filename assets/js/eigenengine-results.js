(() => {
  "use strict";

  const results = document.querySelector(".er-results");
  if (!results) return;

  const address = results.querySelector("[data-register-address]");
  const quarterButtons = Array.from(address.querySelectorAll("[data-quarter]"));
  const cellButtons = Array.from(address.querySelectorAll("[data-cell]"));
  const cellLegend = address.querySelector("[data-local-legend]");
  const addressReadout = address.querySelector("[data-address-read]");
  let quarter = 2;
  let cell = 3;

  function showAddress() {
    quarterButtons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.quarter) === quarter)));
    cellButtons.forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.cell) === cell)));
    cellLegend.textContent = "Inside quarter " + quarter;
    addressReadout.textContent = "Quarter " + quarter + ", cell " + cell + " identifies one of the sixteen places.";
  }

  quarterButtons.forEach((button) => button.addEventListener("click", () => {
    quarter = Number(button.dataset.quarter);
    showAddress();
  }));

  cellButtons.forEach((button) => button.addEventListener("click", () => {
    cell = Number(button.dataset.cell);
    showAddress();
  }));

  address.hidden = false;

  const lab = results.querySelector("[data-refinement-lab]");
  const before = lab.querySelector("[data-layout-before]");
  const after = lab.querySelector("[data-layout-after]");
  const plot = lab.querySelector("[data-cost-plot]");
  const beforeCount = lab.querySelector("[data-count-before]");
  const afterCount = lab.querySelector("[data-count-after]");
  const childLabel = lab.querySelector("[data-child-label]");
  const roundLabel = lab.querySelector("[data-round-label]");
  const priceNote = lab.querySelector("[data-price-note]");
  const formula = lab.querySelector("[data-round-math]");
  const increment = lab.querySelector("[data-increment]");
  const total = lab.querySelector("[data-total]");
  const totalLabel = lab.querySelector("[data-total-label]");
  const play = lab.querySelector("[data-replay-rounds]");
  const trail = lab.querySelector("[data-round-status]");
  const previous = lab.querySelector("[data-previous-round]");
  const next = lab.querySelector("[data-next-round]");
  const priceButtons = Array.from(lab.querySelectorAll("[data-price]"));
  const curveKeys = Array.from(lab.querySelectorAll("[data-curve-key]"));

  const rules = [
    { id: "area", label: "Area", gamma: 2, note: "Each smaller square has a quarter of its parent’s area, so one split costs a quarter as much." },
    { id: "length", label: "Wall length", gamma: 1, note: "Each smaller square is half as wide. The cross dividing it uses half as much wall." },
    { id: "cubic", label: "Width cubed", gamma: 3, note: "When the width halves, a split priced by width cubed costs an eighth as much." }
  ];
  const svgNamespace = "http://www.w3.org/2000/svg";
  const maxRound = 4;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const transitionTime = 1260;
  const beatTime = 2750;
  const squareEdge = 14;
  const squareWidth = 212;
  let round = 2;
  let progress = 1;
  let scene;
  let graph;
  let animationFrame = 0;
  let sequenceTimer = 0;
  let entryTimer = 0;
  let sequenceKind = "";
  let introOffered = false;
  let rule = rules[0];

  function svg(parent, name, attrs, label) {
    const element = document.createElementNS(svgNamespace, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    if (label !== undefined) element.textContent = label;
    parent.appendChild(element);
    return element;
  }

  function cellsAt(depth) {
    return 4 ** depth;
  }

  function priceAt(pricing, depth) {
    return 2 ** ((2 - pricing.gamma) * depth);
  }

  function totalAt(pricing, steps) {
    let result = 0;
    for (let depth = 0; depth < steps; depth += 1) {
      result += priceAt(pricing, depth);
    }
    return result;
  }

  function hilbertPoint(size, index) {
    let x = 0;
    let y = 0;
    for (let scale = 1; scale < size; scale *= 2) {
      const rx = 1 & (index >> 1);
      const ry = 1 & (index ^ rx);
      if (ry === 0) {
        if (rx === 1) {
          x = scale - 1 - x;
          y = scale - 1 - y;
        }
        [x, y] = [y, x];
      }
      x += scale * rx;
      y += scale * ry;
      index >>= 2;
    }
    return [x, y];
  }

  function hilbertTrace(depth) {
    const side = 2 ** depth;
    const width = squareWidth / side;
    return Array.from({ length: cellsAt(depth) }, (_, index) => {
      const [x, y] = hilbertPoint(side, index);
      return [squareEdge + width * (x + .5), squareEdge + squareWidth - width * (y + .5)];
    });
  }

  function pointPath(points) {
    return points.map(([x, y], index) => (index === 0 ? "M" : "L") + x + " " + y).join("");
  }

  function drawGrid(target, depth) {
    target.replaceChildren();
    svg(target, "rect", {
      x: squareEdge, y: squareEdge, width: squareWidth, height: squareWidth,
      class: "er-square-outline"
    });
    const side = 2 ** depth;
    let lines = "";
    for (let index = 1; index < side; index += 1) {
      const position = squareEdge + squareWidth * index / side;
      lines += "M" + position + " " + squareEdge + "v" + squareWidth +
        "M" + squareEdge + " " + position + "h" + squareWidth;
    }
    if (lines) svg(target, "path", { d: lines, class: "er-square-grid" });
  }

  function endpoint(target, point, outline = false) {
    const [cx, cy] = point;
    return svg(target, "circle", {
      cx, cy, r: outline ? 3.25 : 2.65,
      class: outline ? "er-square-endpoint" : "er-square-point"
    });
  }

  function drawParents() {
    const depth = round - 1;
    const parentTrace = hilbertTrace(depth);
    drawGrid(before, depth);
    if (depth) {
      svg(before, "path", { d: pointPath(parentTrace), class: "er-square-trace" });
      endpoint(before, parentTrace.at(-1), true);
    }
    endpoint(before, parentTrace[0]);
    before.setAttribute("aria-label", cellsAt(depth) + (depth ? " parent cells" : " parent cell"));
  }

  function makeSplit() {
    const parentDepth = round - 1;
    const parentSide = 2 ** parentDepth;
    const width = squareWidth / parentSide;
    const half = width / 2;
    const parentTrace = hilbertTrace(parentDepth);
    const centres = [];
    let fills = "";
    drawGrid(after, parentDepth);

    for (let row = 0; row < parentSide; row += 1) {
      for (let column = 0; column < parentSide; column += 1) {
        const left = squareEdge + width * column;
        const top = squareEdge + width * row;
        centres.push([left + half, top + half]);
        fills += "M" + left + " " + top + "h" + half + "v" + half + "h-" + half + "Z" +
          "M" + (left + half) + " " + (top + half) + "h" + half + "v" + half + "h-" + half + "Z";
      }
    }

    const tiles = svg(after, "path", { d: fills, class: "er-child-tiles" });
    const ghost = parentDepth
      ? svg(after, "path", { d: pointPath(parentTrace), class: "er-square-trace" })
      : endpoint(after, parentTrace[0]);
    const cuts = svg(after, "path", { class: "er-square-new" });
    const childTrace = hilbertTrace(round);
    const trace = svg(after, "path", {
      d: pointPath(childTrace), class: "er-square-trace", pathLength: 1, "stroke-dasharray": "1 1"
    });
    const start = endpoint(after, childTrace[0]);
    const finish = endpoint(after, childTrace.at(-1), true);
    after.setAttribute("aria-label", cellsAt(round) + " child cells, with the new cuts marked");
    return { centres, half, tiles, ghost, cuts, trace, start, finish };
  }

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function ease(value) {
    return value * value * (3 - 2 * value);
  }

  function paintSplit(value) {
    const radius = scene.half * ease(clamp(value / .69));
    const tracing = clamp((value - .31) / .69);
    const cuts = scene.centres.map(([x, y]) => {
      return "M" + (x - radius) + " " + y + "h" + (2 * radius) +
        "M" + x + " " + (y - radius) + "v" + (2 * radius);
    }).join("");
    scene.cuts.setAttribute("d", cuts);
    scene.cuts.setAttribute("opacity", value > 0 ? "1" : "0");
    scene.tiles.setAttribute("opacity", clamp((value - .52) / .22));
    scene.ghost.setAttribute("opacity", 1 - clamp((value - .21) / .31));
    scene.trace.setAttribute("opacity", tracing > 0 ? "1" : "0");
    scene.trace.setAttribute("stroke-dashoffset", 1 - tracing);
    if (value === 1) scene.trace.removeAttribute("stroke-dasharray");
    scene.start.setAttribute("opacity", clamp(tracing * 7));
    scene.finish.setAttribute("opacity", clamp((tracing - .89) / .11));
  }

  const left = 48;
  const base = 176;
  const top = 22;
  const right = 418;
  const chartX = (number) => left + number * (right - left) / maxRound;
  const chartY = (cost) => base - cost * (base - top) / 16;

  function drawPlot() {
    plot.replaceChildren();
    svg(plot, "text", { x: left, y: 13, class: "er-axis-unit" }, "First-round units");
    [0, 5, 10, 15].forEach((cost) => {
      const y = chartY(cost);
      svg(plot, "line", { x1: left, x2: right, y1: y, y2: y, class: "er-plot-grid" });
      svg(plot, "text", { x: left - 9, y: y + 5, "text-anchor": "end", class: "er-axis-text" }, cost);
    });
    svg(plot, "path", { d: "M" + left + " " + top + "V" + base + "H" + right, class: "er-plot-axis" });

    for (let depth = 0; depth <= maxRound; depth += 1) {
      svg(plot, "text", {
        x: chartX(depth), y: base + 24, "text-anchor": "middle",
        class: depth === round ? "er-axis-text er-axis-active" : "er-axis-text"
      }, cellsAt(depth));
    }
    svg(plot, "text", { x: (left + right) / 2, y: 225, "text-anchor": "middle", class: "er-axis-unit" }, "Number of cells (log scale)");
    const marker = svg(plot, "line", { y1: top, y2: base, class: "er-plot-marker" });

    const series = [...rules.filter((pricing) => pricing !== rule), rule].map((pricing) => {
      const points = Array.from({ length: maxRound + 1 }, (_, depth) => [chartX(depth), chartY(totalAt(pricing, depth))]);
      svg(plot, "path", { d: pointPath(points), class: "er-curve-guide", "data-curve": pricing.id });
      return { pricing, points };
    }).map(({ pricing, points }) => {
      const selected = pricing === rule;
      const line = svg(plot, "path", {
        "data-curve": pricing.id, class: selected ? "er-curve-line er-curve-active" : "er-curve-line"
      });
      const point = svg(plot, "circle", {
        r: selected ? 5 : 3, class: "er-curve-point", "data-curve": pricing.id
      });
      return { points, line, point };
    });
    const totals = rules.map((pricing) => pricing.label + " " + totalAt(pricing, round)).join(", ");
    plot.setAttribute("aria-label", "Total subdivision costs at " + cellsAt(round) + " cells: " + totals + " first-round units.");
    graph = { marker, series };
  }

  function paintPlot(value) {
    const share = ease(value);
    const x = chartX(round - 1 + share);
    graph.marker.setAttribute("x1", x);
    graph.marker.setAttribute("x2", x);
    graph.series.forEach(({ points, line, point }) => {
      const y0 = points[round - 1][1];
      const y = y0 + (points[round][1] - y0) * share;
      line.setAttribute("d", pointPath(points.slice(0, round)) + "L" + x + " " + y);
      point.setAttribute("cx", x);
      point.setAttribute("cy", y);
    });
  }

  function showReadout(settled, announce = false) {
    const depth = round - 1;
    const parents = cellsAt(depth);
    const count = cellsAt(round);
    const denominator = 2 ** (rule.gamma * depth);
    const added = priceAt(rule, depth);
    const spent = totalAt(rule, round);
    const fraction = denominator === 1 ? "1" : "1/" + denominator;

    beforeCount.textContent = parents + (parents === 1 ? " cell" : " cells");
    childLabel.textContent = settled ? "After the round" : "Cuts in progress";
    afterCount.textContent = settled ? count + " cells" : parents + " → " + count;
    roundLabel.textContent = "Round " + round + " of " + maxRound;
    priceNote.textContent = rule.note;
    const charges = parents + (parents === 1 ? " split" : " splits") + " × " + fraction + " unit per split";
    formula.textContent = settled ? charges + " = " + added + (added === 1 ? " unit added" : " units added") : charges;
    increment.textContent = settled ? added : "—";
    totalLabel.textContent = settled ? "Total after this round" : "Total before this round";
    total.textContent = settled ? spent : totalAt(rule, depth);
    if (announce) trail.textContent = rule.label + " pricing. Round " + round + " makes " + count +
      " cells, adds " + added + " and brings the total to " + spent + " first-round units.";
  }

  function paint(value) {
    progress = value;
    paintSplit(value);
    paintPlot(value);
  }

  function settle(announce = true) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    paint(1);
    showReadout(true, announce);
  }

  function setRound(value, animate = true) {
    window.cancelAnimationFrame(animationFrame);
    round = value;
    drawParents();
    scene = makeSplit();
    drawPlot();
    previous.disabled = round === 1;
    next.disabled = round === maxRound;

    if (!animate || motion.matches) {
      settle(animate);
      return;
    }

    showReadout(false);
    paint(0);
    const began = window.performance.now();
    function advance(now) {
      const elapsed = clamp((now - began) / transitionTime);
      if (elapsed === 1) settle();
      else {
        paint(elapsed);
        animationFrame = window.requestAnimationFrame(advance);
      }
    }
    animationFrame = window.requestAnimationFrame(advance);
  }

  function stopPlayback() {
    window.clearTimeout(sequenceTimer);
    sequenceKind = "";
    play.textContent = "Replay all rounds";
    if (progress < 1) settle();
  }

  function playSequence(lastRound, kind) {
    stopPlayback();
    sequenceKind = kind;
    play.textContent = "Stop playback";
    setRound(1);
    function advance() {
      if (round === lastRound) stopPlayback();
      else {
        setRound(round + 1);
        sequenceTimer = window.setTimeout(advance, beatTime);
      }
    }
    sequenceTimer = window.setTimeout(advance, beatTime);
  }

  function keepManualControl() {
    introOffered = true;
    window.clearTimeout(entryTimer);
    stopPlayback();
  }

  priceButtons.forEach((button) => button.addEventListener("click", () => {
    keepManualControl();
    rule = rules.find((pricing) => pricing.id === button.dataset.price);
    priceButtons.forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
    curveKeys.forEach((key) => key.classList.toggle("er-legend-active", key.dataset.curveKey === rule.id));
    drawPlot();
    paintPlot(1);
    showReadout(true, true);
  }));

  previous.addEventListener("click", () => {
    keepManualControl();
    setRound(round - 1);
  });
  next.addEventListener("click", () => {
    keepManualControl();
    setRound(round + 1);
  });
  play.addEventListener("click", () => {
    const alreadyPlaying = Boolean(sequenceKind);
    keepManualControl();
    if (!alreadyPlaying) playSequence(maxRound, "replay");
  });

  const diagrams = lab.querySelector(".er-geometry");
  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(([entry]) => {
      window.clearTimeout(entryTimer);
      if (entry.intersectionRatio < .7) {
        if (sequenceKind === "introduction") stopPlayback();
      } else if (!introOffered && !motion.matches) {
        entryTimer = window.setTimeout(() => {
          introOffered = true;
          playSequence(2, "introduction");
        }, 850);
      }
    }, { threshold: .7, rootMargin: "-70px 0px -18px" });
    visibility.observe(diagrams);
  }

  motion.addEventListener("change", () => {
    if (motion.matches) keepManualControl();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) keepManualControl();
  });

  function openNote() {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target instanceof HTMLDetailsElement && results.contains(target)) target.open = true;
  }
  window.addEventListener("hashchange", openNote);
  openNote();
  curveKeys[0].classList.add("er-legend-active");
  setRound(round, false);
  lab.hidden = false;
})();

(() => {
  const board = document.querySelector(".er-board");
  if (!board) return;
  board.addEventListener("click", event => {
    if (!event.target.closest("button")) return;
    const bounds = board.getBoundingClientRect();
    const header = document.querySelector(".er-paper-header")?.offsetHeight || 0;
    if (bounds.height <= innerHeight - header - 6 && (bounds.top < header || bounds.bottom > innerHeight)) {
      board.scrollIntoView({block:"start", behavior:"instant"});
    }
  });
  for (const button of board.querySelectorAll("button[data-chart-view]")) {
    button.addEventListener("click", () => {
      board.dataset.chartView = button.dataset.chartView;
      board.querySelectorAll("button[data-chart-view]").forEach(option =>
        option.setAttribute("aria-pressed", String(option === button)));
    });
  }
})();
