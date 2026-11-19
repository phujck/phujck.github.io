(() => {
  "use strict";

  const walkthrough = document.querySelector(".walkthrough");
  const steps = Array.from(walkthrough.querySelectorAll(".walk-step"));
  const controls = walkthrough.querySelector(".viewer-controls");
  const progress = controls.querySelector(".viewer-progress");
  const selector = controls.querySelector("select");
  const previous = controls.querySelector("[data-previous]");
  const next = controls.querySelector("[data-next]");
  const links = Array.from(walkthrough.querySelectorAll(".step-nav a"));
  const share = walkthrough.querySelector(".share-row");
  const copy = share.querySelector(".copy-link");
  const shareStatus = share.querySelector(".share-status");
  let current = 0;

  const stepIndex = (id) => steps.findIndex((step) => step.id === id);
  const stepTitle = (step) => step.querySelector("h2").textContent;
  const hashStep = () => stepIndex(window.location.hash.slice(1));

  function showStep(index) {
    current = index;
    const active = steps[current];

    steps.forEach((step) => { step.hidden = step !== active; });
    links.forEach((link) => {
      if (link.hash === "#" + active.id) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    selector.value = active.id;
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    progress.textContent = "Stop " + (current + 1) + " of " + steps.length;
    shareStatus.textContent = "";
  }

  function chooseStep(index, moveFocus = false) {
    if (index < 0 || index >= steps.length || index === current) return;

    window.history.pushState(null, "", "#" + steps[index].id);
    showStep(index);
    if (moveFocus) {
      const heading = steps[current].querySelector("h2");
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  links.forEach((link) => {
    const id = link.hash.slice(1);
    selector.add(new Option(link.textContent.trim(), id));
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      chooseStep(stepIndex(id), true);
    });
  });

  selector.addEventListener("change", () => chooseStep(stepIndex(selector.value)));
  previous.addEventListener("click", () => chooseStep(current - 1, current === 1));
  next.addEventListener("click", () => chooseStep(current + 1, current === steps.length - 2));
  window.addEventListener("hashchange", () => {
    const index = hashStep();
    if (index >= 0 || !window.location.hash) showStep(Math.max(0, index));
  });

  if (navigator.clipboard && navigator.clipboard.writeText) {
    share.hidden = false;
    copy.addEventListener("click", async () => {
      const address = new URL(window.location.href);
      address.hash = steps[current].id;
      try {
        await navigator.clipboard.writeText(address.href);
        shareStatus.textContent = "Link copied.";
      } catch {
        shareStatus.textContent = "The browser could not copy the link.";
      }
    });
  }

  const lightbox = document.querySelector(".lightbox");
  const lightboxTitle = lightbox.querySelector("#lightbox-title");
  const lightboxScroll = lightbox.querySelector(".lightbox-scroll");
  const lightboxImage = lightboxScroll.querySelector("img");
  const zoom = lightbox.querySelector(".scale-toggle");
  const close = lightbox.querySelector(".lightbox-close");
  let activeCapture;

  function setZoom(fullSize) {
    lightboxScroll.classList.toggle("is-full", fullSize);
    zoom.textContent = fullSize ? "Fit screen" : "View at full size";
    if (!fullSize) {
      lightboxScroll.scrollTo(0, 0);
      return;
    }

    window.requestAnimationFrame(() => {
      const x = Number(activeCapture.dataset.focusX);
      const y = Number(activeCapture.dataset.focusY);
      lightboxScroll.scrollLeft = x * lightboxImage.offsetWidth - lightboxScroll.clientWidth / 2;
      lightboxScroll.scrollTop = y * lightboxImage.offsetHeight - lightboxScroll.clientHeight / 2;
    });
  }

  if (typeof lightbox.showModal === "function") {
    zoom.addEventListener("click", () => setZoom(!lightboxScroll.classList.contains("is-full")));
    close.addEventListener("click", () => lightbox.close());

    walkthrough.querySelectorAll(".capture > a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const image = link.querySelector("img");
        activeCapture = link.closest("figure");
        lightboxTitle.textContent = stepTitle(steps[current]);
        lightboxImage.alt = image.alt;
        const width = image.getAttribute("width") || image.naturalWidth;
        lightboxImage.width = width;
        lightboxImage.height = image.getAttribute("height") || image.naturalHeight;
        lightboxScroll.style.setProperty("--capture-width", width + "px");
        lightboxImage.src = image.currentSrc || image.src;
        lightbox.showModal();
        setZoom(window.matchMedia("(max-width: 600px)").matches);
      });
    });
  }

  document.body.classList.add("is-enhanced");
  controls.hidden = false;
  showStep(Math.max(0, hashStep()));
})();

(() => {
  "use strict";

  const tour = document.querySelector(".session-tour");
  const siteHeader = document.querySelector(".site-header");
  const stops = Array.from(tour.querySelectorAll(".tour-stop"));
  const nav = tour.querySelector(".tour-nav");
  const links = Array.from(nav.querySelectorAll("a"));
  const controls = tour.querySelector(".tour-controls");
  const header = tour.querySelector(".tour-header");
  const play = controls.querySelector(".tour-play");
  const previous = controls.querySelector(".tour-previous");
  const next = controls.querySelector(".tour-next");
  const status = tour.querySelector(".tour-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowScreen = window.matchMedia("(max-width: 560px)");
  let current = 0;
  let focused = false;
  let timer = null;
  let animationFrame;

  const clamped = (value, min, max) => Math.max(min, Math.min(max, value));
  const atLastStop = () => current === stops.length - 1;
  const indexFromHash = () => stops.findIndex((stop) => "#" + stop.id === window.location.hash);

  const frames = stops.map((stop) => {
    const view = stop.querySelector(".tour-window");
    const scene = view.querySelector(".tour-scene");
    const image = scene.querySelector("img");
    const highlight = document.createElement("span");
    const focusButton = stop.querySelector(".tour-focus");

    highlight.className = "tour-highlight";
    highlight.setAttribute("aria-hidden", "true");
    scene.appendChild(highlight);
    scene.style.width = image.getAttribute("width") + "px";

    if (focusButton) {
      focusButton.hidden = false;
      focusButton.addEventListener("click", () => {
        pause();
        focused = !focused;
        paint(focused, true);
        const bounds = view.getBoundingClientRect();
        const aboveView = bounds.top < siteHeader.offsetHeight;
        const belowView = bounds.bottom > window.innerHeight;
        if ((focused || narrowScreen.matches) && (aboveView || belowView)) {
          view.scrollIntoView({ block: "center", behavior: reducedMotion.matches ? "instant" : "smooth" });
        }
      });
    }

    return { view, scene, image, highlight, focusButton };
  });

  function getRegion(stop) {
    const selected = (narrowScreen.matches && stop.dataset.mobileRegion) || stop.dataset.region;
    return selected ? selected.split(",").map(Number) : null;
  }

  function paint(detail, animate = false) {
    const { view, scene, image, highlight, focusButton } = frames[current];
    const imageWidth = Number(image.getAttribute("width"));
    const imageHeight = Number(image.getAttribute("height"));
    const width = view.clientWidth;
    const height = view.clientHeight;
    if (!width || !height) return;

    const region = getRegion(stops[current]);
    const fit = Math.min(width / imageWidth, height / imageHeight);
    let scale = fit;
    let x = (width - imageWidth * scale) / 2;
    let y = (height - imageHeight * scale) / 2;

    if (detail && region) {
      const [left, top, boxWidth, boxHeight] = region;
      const targetScale = Math.min(
        width * (narrowScreen.matches ? .96 : .86) / (boxWidth * imageWidth),
        height * .76 / (boxHeight * imageHeight)
      );
      scale = clamped(targetScale, fit, narrowScreen.matches ? 1.22 : 1.6);
      const scaledWidth = imageWidth * scale;
      const scaledHeight = imageHeight * scale;
      x = scaledWidth <= width ? (width - scaledWidth) / 2
        : clamped(width / 2 - (left + boxWidth / 2) * scaledWidth, width - scaledWidth, 0);
      y = scaledHeight <= height ? (height - scaledHeight) / 2
        : clamped(height / 2 - (top + boxHeight / 2) * scaledHeight, height - scaledHeight, 0);

      [highlight.style.left, highlight.style.top, highlight.style.width, highlight.style.height] =
        region.map((value) => value * 100 + "%");
    }

    scene.classList.toggle("is-moving", animate && !reducedMotion.matches);
    highlight.classList.toggle("is-visible", Boolean(detail && region));
    scene.style.transform = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
    if (focusButton) focusButton.textContent = detail ? "Full workspace" : "Focus detail";
  }

  function show(index, animate = false) {
    window.cancelAnimationFrame(animationFrame);
    current = index;
    const stop = stops[current];
    focused = Boolean(stop.dataset.region);

    stops.forEach((item) => { item.hidden = item !== stop; });
    links.forEach((link) => {
      if (link.hash === "#" + stop.id) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    previous.disabled = current === 0;
    next.disabled = atLastStop();
    status.textContent = "Stop " + (current + 1) + " of " + stops.length + ". " +
      stop.querySelector("h3").textContent;

    if (focused && animate && !reducedMotion.matches) {
      paint(false);
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = window.requestAnimationFrame(() => paint(focused, true));
      });
    } else {
      paint(focused);
    }
  }

  function pause() {
    window.clearTimeout(timer);
    timer = null;
    play.textContent = "Play tour";
  }

  function scheduleNext() {
    timer = window.setTimeout(() => {
      if (atLastStop()) {
        pause();
        return;
      }
      show(current + 1, true);
      scheduleNext();
    }, 7600);
  }

  function move(index) {
    if (index < 0 || index >= stops.length || index === current) return;
    pause();
    window.history.pushState(null, "", "#" + stops[index].id);
    show(index, true);
  }

  links.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      move(index);
    });
  });

  previous.addEventListener("click", () => {
    move(current - 1);
    if (previous.disabled) play.focus();
  });
  next.addEventListener("click", () => {
    move(current + 1);
    if (next.disabled) play.focus();
  });
  play.addEventListener("click", () => {
    if (timer !== null) {
      pause();
      return;
    }
    if (atLastStop()) show(0);
    play.textContent = "Pause tour";
    scheduleNext();
  });

  tour.addEventListener("focusin", (event) => {
    if (event.target !== play && timer !== null) pause();
  });

  function measureAnchorOffset() {
    tour.style.setProperty("--tour-anchor-offset", header.offsetHeight + nav.offsetHeight + 18 + "px");
  }

  window.addEventListener("resize", () => {
    measureAnchorOffset();
    paint(focused);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("hashchange", () => {
    pause();
    const index = indexFromHash();
    if (index >= 0 || !window.location.hash || window.location.hash === "#session") {
      show(Math.max(0, index));
    }
  });

  tour.classList.add("is-camera");
  controls.hidden = false;
  measureAnchorOffset();
  if ("ResizeObserver" in window) {
    const anchorObserver = new ResizeObserver(measureAnchorOffset);
    anchorObserver.observe(header);
    anchorObserver.observe(nav);
  }
  show(Math.max(0, indexFromHash()));
})();

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
