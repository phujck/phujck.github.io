(() => {
  "use strict";
  const card = document.querySelector(".ee-feature-paper");
  if (!card) return;
  const light = card.querySelector(".ee-hilbert-light");
  const control = card.querySelector("#ee-curve-motion");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (!light.animate) return;
  // A moving window along the original path traces each quadrant in rank order.
  light.style.strokeDasharray = "7 93";
  const travel = light.animate(
    [{ strokeDashoffset: "0" }, { strokeDashoffset: "-100" }],
    { duration: 14500, iterations: Infinity, easing: "linear" }
  );
  let playing = !reduced.matches;
  let visible = true;
  function update() {
    if (playing && visible && !document.hidden) travel.play();
    else travel.pause();
    control.textContent = playing ? "Pause curve" : "Play curve";
    control.setAttribute("aria-label", (playing ? "Pause" : "Play") + " Hilbert curve animation");
  }
  control.hidden = false;
  control.addEventListener("click", () => { playing = !playing; update(); });
  reduced.addEventListener("change", () => { playing = !reduced.matches; update(); });
  document.addEventListener("visibilitychange", update);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(card);
  }
  update();
})();

function openPaperNote() {
  const note = document.getElementById(window.location.hash.slice(1));
  if (note instanceof HTMLDetailsElement) note.open = true;
}
window.addEventListener("hashchange", openPaperNote);
openPaperNote();
