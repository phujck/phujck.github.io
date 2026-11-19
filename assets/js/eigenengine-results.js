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
  const roundLabel = lab.querySelector("[data-round-label]");
  const priceNote = lab.querySelector("[data-price-note]");
  const formula = lab.querySelector("[data-round-math]");
  const increment = lab.querySelector("[data-increment]");
  const total = lab.querySelector("[data-total]");
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
  let round = 2;
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

  function drawSquare(target, depth, markNew) {
    const edge = 14;
    const width = 212;
    const size = 2 ** depth;
    const cellWidth = width / size;
    target.replaceChildren();
    svg(target, "rect", { x: edge, y: edge, width, height: width, class: "er-square-outline" });

    if (size > 1) {
      const guides = { earlier: "", new: "" };
      for (let index = 1; index < size; index += 1) {
        const position = edge + cellWidth * index;
        const kind = markNew && index % 2 === 1 ? "new" : "earlier";
        guides[kind] += "M" + position + " " + edge + "v" + width + "M" + edge + " " + position + "h" + width;
      }
      svg(target, "path", { d: guides.earlier, class: "er-square-grid" });

      let trace = "";
      for (let index = 0; index < size * size; index += 1) {
        const [x, y] = hilbertPoint(size, index);
        const horizontal = edge + cellWidth * (x + .5);
        const vertical = edge + width - cellWidth * (y + .5);
        trace += (index ? "L" : "M") + horizontal + " " + vertical;
      }
      svg(target, "path", { d: trace, class: "er-square-trace" });
      if (guides.new) svg(target, "path", { d: guides.new, class: "er-square-new" });
    } else {
      svg(target, "circle", { cx: "120", cy: "120", r: "4", class: "er-square-point" });
    }
    const count = cellsAt(depth);
    target.setAttribute("aria-label", count + (count === 1 ? " cell" : " cells") + (markNew ? ", with the cuts from this round marked" : ""));
  }

  function drawPlot() {
    const left = 48;
    const base = 176;
    const top = 22;
    const right = 418;
    const chartX = (number) => left + number * (right - left) / maxRound;
    const chartY = (cost) => base - cost * (base - top) / 16;

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
    svg(plot, "line", { x1: chartX(round), x2: chartX(round), y1: top, y2: base, class: "er-plot-marker" });

    const lines = [...rules.filter((pricing) => pricing !== rule), rule];
    lines.forEach((pricing) => {
      const selected = pricing === rule;
      let path = "";
      for (let depth = 0; depth <= maxRound; depth += 1) {
        path += (depth ? "L" : "M") + chartX(depth) + " " + chartY(totalAt(pricing, depth));
      }
      svg(plot, "path", {
        d: path, "data-curve": pricing.id,
        class: selected ? "er-curve-line er-curve-active" : "er-curve-line"
      });
      svg(plot, "circle", {
        cx: chartX(round), cy: chartY(totalAt(pricing, round)), r: selected ? 5 : 3,
        class: "er-curve-point", "data-curve": pricing.id
      });
    });

    const totals = rules.map((pricing) => pricing.label + " " + totalAt(pricing, round)).join(", ");
    plot.setAttribute("aria-label", "Total subdivision costs at " + cellsAt(round) + " cells: " + totals + " first-round units.");
  }

  function showRound() {
    const depth = round - 1;
    const parents = cellsAt(depth);
    const count = cellsAt(round);
    const denominator = 2 ** (rule.gamma * depth);
    const added = priceAt(rule, depth);
    const spent = totalAt(rule, round);
    const fraction = denominator === 1 ? "1" : "1/" + denominator;

    beforeCount.textContent = parents + (parents === 1 ? " cell" : " cells");
    afterCount.textContent = count + " cells";
    roundLabel.textContent = "Round " + round + " of " + maxRound;
    priceNote.textContent = rule.note;
    formula.textContent = parents + (parents === 1 ? " split" : " splits") +
      " × " + fraction + " unit per split = " + added + (added === 1 ? " unit added" : " units added");
    increment.textContent = added;
    total.textContent = spent;
    trail.textContent = rule.label + " pricing. Round " + round + " makes " + count +
      " cells, adds " + added + " and brings the total to " + spent + " first-round units.";
    previous.disabled = round === 1;
    next.disabled = round === maxRound;
    priceButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.price === rule.id)));
    curveKeys.forEach((key) => key.classList.toggle("er-legend-active", key.dataset.curveKey === rule.id));
    drawPlot();
  }

  function setRound(value) {
    round = value;
    drawSquare(before, round - 1, false);
    drawSquare(after, round, true);
    showRound();
  }

  priceButtons.forEach((button) => button.addEventListener("click", () => {
    rule = rules.find((pricing) => pricing.id === button.dataset.price);
    showRound();
  }));
  previous.addEventListener("click", () => setRound(round - 1));
  next.addEventListener("click", () => setRound(round + 1));
  setRound(round);
  lab.hidden = false;
})();
