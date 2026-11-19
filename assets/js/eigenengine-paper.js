(() => {
  "use strict";
  const art = document.querySelector(".ee-cover-art");
  if (!art) return;
  const ink = art.querySelector(".ee-curve-ink");
  const quarter = art.querySelector(".ee-curve-quarter");
  const guide = art.querySelector(".ee-curve-guide");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  // Each four consecutive children belong to the cell at their parent's rank.
  // Coarse and fine polylines therefore share vertices throughout the refinement.
  function point(side, rank) {
    let x = 0, y = 0;
    for (let step = 1; step < side; step *= 2) {
      const right = 1 & (rank >> 1);
      const up = 1 & (rank ^ right);
      if (!up) {
        if (right) { x = step - 1 - x; y = step - 1 - y; }
        [x, y] = [y, x];
      }
      x += step * right;
      y += step * up;
      rank >>= 2;
    }
    return [(x + .5) * 320 / side, 320 - (y + .5) * 320 / side];
  }

  const levels = [2, 4, 8, 16].map(side =>
    Array.from({length: 256}, (_, index) => point(side, Math.floor(index * side * side / 256))));
  function line(coords) {
    return coords.map(([x, y], index) => (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1)).join("");
  }
  const shapes = levels.map(line);
  const thirds = levels.map(points => line(points.slice(128, 192)));
  const sequence = [0, 1, 2, 3, 2, 1];
  const stepTime = 1660;
  let elapsed = 0, last = null, handle = null, visible = true, paused = false, frozenStage = -1;
  function draw() {
    const phase = Math.floor(elapsed / stepTime) % sequence.length;
    const start = sequence[phase], end = sequence[(phase + 1) % sequence.length];
    const fraction = (elapsed % stepTime) / stepTime;
    const t = Math.min(1, Math.max(0, (fraction - .23) / .6));
    const ease = t * t * (3 - 2*t);
    if (reduced.matches) {
      // Fixed geometries dissolve in place; no pan, rotation or travelling camera.
      guide.setAttribute("d", shapes[start]);
      ink.setAttribute("d", shapes[end]);
      quarter.setAttribute("d", thirds[end]);
      guide.style.opacity = String(.88 * (1 - ease));
      ink.style.opacity = String(ease);
      quarter.style.opacity = String(ease);
      return;
    }
    guide.style.opacity = String(.16 + .16 * (1 - ease));
    ink.style.opacity = quarter.style.opacity = "1";
    guide.setAttribute("d", shapes[start]);
    if (t === 0 || t === 1) {
      const held = t === 0 ? start : end;
      if (frozenStage !== held) {
        ink.setAttribute("d", shapes[held]);
        quarter.setAttribute("d", thirds[held]);
        frozenStage = held;
      }
    } else {
      frozenStage = -1;
      const expanded = levels[start].map(([x,y], i) => [
        x + (levels[end][i][0] - x) * ease, y + (levels[end][i][1] - y) * ease
      ]);
      ink.setAttribute("d", line(expanded));
      quarter.setAttribute("d", line(expanded.slice(128,192)));
    }
  }
  function frame(now) {
    if (last !== null) elapsed = (elapsed + Math.min(100, now - last)) % (stepTime * sequence.length);
    last = now;
    draw();
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
  art.addEventListener("click", () => { paused = !paused; update(); });
  document.addEventListener("visibilitychange", update);
  reduced.addEventListener("change", () => { frozenStage = -1; draw(); update(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(art);
  }
  draw();
  update();
})();
