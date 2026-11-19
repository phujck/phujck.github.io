(() => {
  "use strict";
  const art = document.querySelector(".ee-cover-art");
  if (!art) return;
  const ink = art.querySelector(".ee-curve-ink");
  const guide = art.querySelector(".ee-curve-guide");
  const tracer = art.querySelector(".ee-curve-tracer");
  const trail = tracer.querySelector("path");
  const tip = tracer.querySelector("circle");

  // Four consecutive children have the same parent. Keep their identities when
  // interpolating so each turn in the coarse curve opens into its own subcurve.
  function point(side, rank) {
    let x = 0, y = 0;
    for (let size = 1; size < side; size *= 2) {
      const right = 1 & (rank >> 1);
      const up = 1 & (rank ^ right);
      if (!up) {
        if (right) { x = size - 1 - x; y = size - 1 - y; }
        [x, y] = [y, x];
      }
      x += size * right;
      y += size * up;
      rank >>= 2;
    }
    return [(x + .5) * 320 / side, 320 - (y + .5) * 320 / side];
  }

  const levels = [2, 4, 8, 16].map(side =>
    Array.from({length: 256}, (_, i) => point(side, Math.floor(i * side * side / 256))));
  function path(points) {
    return points.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join("");
  }

  // Consecutive vertices coincide before a parent subdivides. Measure only
  // visible segments so the light keeps travelling at the coarse levels too.
  function curve(vertices) {
    const points = [vertices[0]], distances = [0];
    let length = 0;
    for (const vertex of vertices.slice(1)) {
      const [x, y] = points[points.length - 1];
      const segment = Math.hypot(vertex[0] - x, vertex[1] - y);
      if (segment === 0) continue;
      length += segment;
      distances.push(length);
      points.push(vertex);
    }
    return {points, distances, length, d: path(points)};
  }
  function atDistance(curve, distance) {
    let low = 0, high = curve.points.length - 1;
    while (low + 1 < high) {
      const middle = (low + high) >> 1;
      if (curve.distances[middle] < distance) low = middle;
      else high = middle;
    }
    const ratio = (distance - curve.distances[low]) / (curve.distances[high] - curve.distances[low]);
    const [x, y] = curve.points[low], [endX, endY] = curve.points[high];
    return {point: [x + (endX - x) * ratio, y + (endY - y) * ratio], segment: low};
  }
  function reflected(value) {
    const lap = (value % 2 + 2) % 2;
    return lap <= 1 ? lap : 2 - lap;
  }
  const shapes = levels.map(curve);
  const sequence = [0, 1, 2, 3, 2, 1];
  const stepTime = 1660;
  let clock = 0, travel = .43, last = null, handle = null;
  let visible = true, paused = false;
  let paintedCurve = null, paintedGuide = -1;

  function draw(dt) {
    const index = Math.floor(clock / stepTime) % sequence.length;
    const from = sequence[index], to = sequence[(index + 1) % sequence.length];
    const t = Math.max(0, Math.min(1, ((clock % stepTime) / stepTime - .23) / .6));
    const ease = t * t * (3 - 2 * t);
    let active = shapes[from];
    if (t === 1) active = shapes[to];
    else if (t > 0) {
      active = curve(levels[from].map(([x, y], i) => [
        x + (levels[to][i][0] - x) * ease,
        y + (levels[to][i][1] - y) * ease,
      ]));
    }
    if (active !== paintedCurve) {
      ink.setAttribute("d", active.d);
      paintedCurve = active;
    }
    if (from !== paintedGuide) {
      guide.setAttribute("d", shapes[from].d);
      paintedGuide = from;
    }
    guide.style.opacity = String(.12 + .16 * (1 - ease));

    // The head and its entire short wake follow the arclength of the very path
    // painted above. At either end the light turns back without jumping across.
    travel += dt * Math.max(.000062, Math.min(.00019, .185 / active.length));
    const tailTime = travel - Math.min(.16, 108 / active.length);
    const head = reflected(travel), tail = reflected(tailTime);
    let left = Math.min(head, tail), right = Math.max(head, tail);
    if (Math.floor(travel) !== Math.floor(tailTime)) {
      if (Math.floor(travel) % 2 === 1) right = 1;
      else left = 0;
    }
    const a = atDistance(active, left * active.length), b = atDistance(active, right * active.length);
    trail.setAttribute("d", path([a.point, ...active.points.slice(a.segment + 1, b.segment + 1), b.point]));
    const {point: [x, y]} = atDistance(active, head * active.length);
    tip.setAttribute("cx", x.toFixed(2));
    tip.setAttribute("cy", y.toFixed(2));
  }

  function frame(now) {
    const dt = last === null ? 0 : Math.min(100, now - last);
    last = now;
    clock = (clock + dt) % (stepTime * sequence.length);
    draw(dt);
    handle = requestAnimationFrame(frame);
  }
  function update() {
    const running = visible && !paused && !document.hidden;
    if (running && handle === null) { last = null; handle = requestAnimationFrame(frame); }
    if (!running && handle !== null) { cancelAnimationFrame(handle); handle = null; last = null; }
    const label = (paused ? "Resume" : "Pause") + " the animated Hilbert construction";
    art.setAttribute("aria-label", label);
    art.title = label;
  }
  art.disabled = false;
  tracer.removeAttribute("visibility");
  art.addEventListener("click", () => { paused = !paused; update(); });
  document.addEventListener("visibilitychange", update);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(art);
  }
  draw(0);
  update();
})();
