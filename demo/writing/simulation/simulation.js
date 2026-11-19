(() => {
  "use strict";
  const section = document.querySelector(".simulation");
  if (!section) return;
  const stops = [...section.querySelectorAll(".sim-stop")];
  const links = [...section.querySelectorAll(".sim-stops a")];
  function show(id) {
    const active = stops.find(stop => stop.id === id);
    if (!active) return;
    for (const stop of stops) stop.hidden = stop !== active;
    for (const link of links) {
      if (link.hash === "#" + id) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    }
  }
  for (const link of links) {
    link.addEventListener("click", event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      show(link.hash.slice(1));
    });
  }
  function fromAddress() {
    const id = location.hash.slice(1);
    if (id.startsWith("simulation-")) show(id);
  }
  section.classList.add("sim-enhanced");
  show(stops[0].id);
  fromAddress();
  window.addEventListener("hashchange", fromAddress);
  window.addEventListener("popstate", fromAddress);
})();
