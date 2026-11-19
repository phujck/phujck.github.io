/* Carry a reader's place between these public pages without changing their share URLs. */
(() => {
  "use strict";
  const overview = "/eigenengine.html";
  const viewer = "/demo/view/";
  const guide = "/eigenengine/guide/";
  const oldGuide = "/assets/data/networked-research/";
  const names = new Map([
    [overview, "EigenEngine"], [viewer, "the viewer"],
    ["/eigenengine/networked-research/", "Networked Research"],
    [guide, "the reading guide"],
    ["/eigenengine/cost-of-complexity/", "The Cost of Complexity"],
    ["/eigenengine/cost-of-complexity/reading/", "the paired reading"],
    ["/eigenengine/kalmar-constant/", "the Kalmár article"],
    ["/demo/writing/", "the Writing App film"],
    ["/demo/writing/simulation/", "the simulation"],
    ["/demo/writing/project-record/", "the editing record"],
  ]);
  const path = url => url.pathname.replace(/\/index\.html$/, "/");
  const current = new URL(location.href);
  const here = path(current);
  if (!names.has(here)) return;

  function knownUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value, location.href);
      if (url.origin === location.origin && path(url) === oldGuide) url.pathname = guide;
      return url.origin === location.origin && names.has(path(url)) ? url : null;
    } catch { return null; }
  }

  // Without JavaScript each authored link opens the material itself in a separate tab.
  document.querySelectorAll("a[data-material-viewer]").forEach(link => {
    const destination = knownUrl(link.dataset.materialViewer);
    if (!destination || path(destination) !== viewer) return;
    link.href = destination.href;
    link.removeAttribute("target");
  });

  const storeKey = "eigenengine-reading-departure";
  let origin = history.state?.eeReadingOrigin;
  try {
    const saved = JSON.parse(sessionStorage.getItem(storeKey));
    if (knownUrl(saved?.destination)?.href === location.href) {
      origin = saved;
      sessionStorage.removeItem(storeKey);
      history.replaceState({ ...history.state, eeReadingOrigin: origin }, "");
    }
  } catch { /* Referrer and direct page links work when storage is unavailable. */ }

  const referrer = knownUrl(document.referrer);
  let source = knownUrl(origin?.source);
  if (!source && referrer && path(referrer) !== here) source = referrer;
  const prior = window.navigation?.entries().find(entry => entry.key === origin?.entryKey);
  const home = document.querySelector('header a[href="/eigenengine.html"]');
  const homeIsSource = source && path(source) === overview;

  function installReturn(link) {
    link.href = source.href;
    link.dataset.readingReturn = "";
    link.addEventListener("click", event => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (prior && knownUrl(prior.url)?.pathname === source.pathname) {
        event.preventDefault();
        window.navigation.traverseTo(prior.key).finished.catch(() => location.assign(source.href));
      } else if (origin && referrer && path(referrer) === path(source) && history.length > 1 && !window.navigation) {
        event.preventDefault();
        history.back();
      }
    });
  }

  if (source && path(source) !== here && path(source) !== viewer) {
    const headerLink = Array.from(document.querySelectorAll("header nav a[href]")).find(link => {
      const to = knownUrl(link.href);
      return to && path(to) === path(source) && !to.hash && !to.search;
    });
    if (homeIsSource && home) {
      document.querySelectorAll('a[href="/eigenengine.html"]').forEach(installReturn);
    } else if (headerLink) {
      headerLink.textContent = "Return to " + names.get(path(source));
      installReturn(headerLink);
    } else {
      const link = document.createElement("a");
      link.className = "ee-reading-return";
      link.textContent = "Return to " + names.get(path(source));
      installReturn(link);
      if (home) {
        const group = document.createElement("span");
        group.className = "ee-reading-returns";
        home.before(group);
        group.append(home, link);
      } else {
        const main = document.querySelector("main");
        if (main) main.prepend(link);
      }
    }
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") || link.hasAttribute("data-reading-return") ||
        (link.target && link.target !== "_self") || here === viewer) return;
    const next = knownUrl(link.href);
    if (!next || path(next) === here) return;
    const sourceUrl = new URL(location.href);
    const section = link.closest("section[id], article[id], figure[id], main[id]");
    if (section) sourceUrl.hash = section.id;
    const departure = { source: sourceUrl.href, destination: next.href, entryKey: window.navigation?.currentEntry?.key };
    const sameLinks = Array.from(document.links).filter(a => a.href === link.href);
    const place = { x: window.scrollX, y: window.scrollY, link: link.href, ordinal: sameLinks.indexOf(link) };
    try {
      history.replaceState({ ...history.state, eeReadingPlace: place }, "");
      sessionStorage.setItem(storeKey, JSON.stringify(departure));
    } catch { /* Preserve native navigation when storage is unavailable. */ }
  });

  window.addEventListener("pageshow", event => {
    const returnVisit = event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward";
    const place = history.state?.eeReadingPlace;
    if (!returnVisit || !place) return;
    setTimeout(() => {
      const link = Array.from(document.links).filter(a => a.href === place.link)[place.ordinal];
      link?.focus({ preventScroll: true });
      window.scrollTo({ left: place.x, top: place.y, behavior: "instant" });
    }, 0);
  });
})();
