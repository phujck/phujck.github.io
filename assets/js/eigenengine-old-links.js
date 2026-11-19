/* Follow incoming bookmarks from the earlier, single-page edition. */
(() => {
  function followOldBookmark() {
    const id = location.hash.slice(1);
    let route;
    if (location.pathname.endsWith("/eigenengine.html")) {
      if (id === "refinement" || id === "derivations") route = "/eigenengine/cost-of-complexity/#" + id;
      if (id === "coda") route = "/eigenengine/kalmar-constant/";
      if (id === "project-record" || id === "tool-frequency") route = "/demo/writing/project-record/#" + id;
    } else if (/\/demo\/writing\/(index\.html)?$/.test(location.pathname) && /^simulation(?:-|$)/.test(id)) {
      route = "/demo/writing/simulation/" + (id === "simulation" ? "" : "#" + id);
    }
    if (route) location.replace(route);
  }
  window.addEventListener("hashchange", followOldBookmark);
  followOldBookmark();
})();
