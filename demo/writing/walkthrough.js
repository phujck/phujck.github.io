(() => {
  "use strict";

  const frame = document.querySelector(".session-film");
  const film = frame.querySelector("video");
  const play = frame.querySelector(".film-play");
  const resume = frame.querySelector(".film-resume");
  const captions = frame.querySelector(".film-caption-text");
  const captionTitle = frame.querySelector(".film-caption-title");
  const trackElement = film.querySelector("track");
  const track = trackElement.track;
  const chapterList = document.querySelector(".film-chapters");
  const chapters = Array.from(chapterList.querySelectorAll("button"), (button) => ({
    button,
    time: Number(button.dataset.time),
    title: button.querySelector("b").textContent
  }));
  const storageKey = "eigenengine-session-film-time";
  let activeChapter = chapters[0];
  let engaged = false;
  let playing = false;
  let fullscreen = false;
  let restoreRibbon = false;

  function syncTransport() {
    const atStart = film.currentTime < .25;
    const show = !playing && !fullscreen;
    play.hidden = !show || !atStart;
    resume.hidden = !show || atStart;
    const label = film.ended ? "Replay film" : "Resume film";
    if (resume.textContent !== label) resume.textContent = label;
  }

  function sync() {
    const time = film.currentTime;
    const selected = chapters.findLast((chapter) => chapter.time <= time) || chapters[0];
    if (selected !== activeChapter) {
      activeChapter.button.removeAttribute("aria-current");
      selected.button.setAttribute("aria-current", "true");
      captionTitle.textContent = selected.title;
      activeChapter = selected;
    }
    const cues = Array.from(track.cues || []);
    const cue = time >= film.duration
      ? cues.at(-1)
      : cues.find(({ startTime, endTime }) => startTime <= time && time < endTime);
    if (cue && captions.textContent !== cue.text) captions.textContent = cue.text;
    frame.toggleAttribute("data-native-captions", track.mode === "showing");
    syncTransport();
  }

  function setFullscreen(active) {
    if (active === fullscreen) return;
    fullscreen = active;
    if (active && track.mode !== "showing") {
      restoreRibbon = true;
      track.mode = "showing";
    } else if (!active && restoreRibbon) {
      restoreRibbon = false;
      track.mode = "hidden";
    }
    sync();
  }

  function remember(time = film.currentTime) {
    if (!engaged) return;
    try {
      window.sessionStorage.setItem(storageKey, String(time));
    } catch {
      // The film still works where storage is unavailable.
    }
    try {
      window.history.replaceState({ ...window.history.state, sessionFilmTime: time }, "");
    } catch {
      // Session storage also carries the position across pages.
    }
  }

  function restore() {
    if (engaged || !film.paused || film.currentTime) return;
    let savedTime = window.history.state?.sessionFilmTime;
    try {
      savedTime ??= window.sessionStorage.getItem(storageKey);
    } catch {
      // The position can still be restored from browser history.
    }
    if (savedTime != null) {
      film.preload = "metadata";
      const time = Number(savedTime);
      film.currentTime = time;
      engaged = true;
      remember(time);
    }
  }

  for (const chapter of chapters) {
    chapter.button.addEventListener("click", () => {
      if (chapter === activeChapter) return;
      film.preload = "metadata";
      // Seek inside the cue so native captions also clear the preceding line.
      const time = chapter.time ? chapter.time + .001 : 0;
      film.currentTime = time;
      engaged = true;
      remember(time);
      sync();
    });
  }

  for (const button of [play, resume]) {
    button.addEventListener("click", () => {
      film.focus({ preventScroll: true });
      film.play().catch(() => {});
    });
  }

  track.mode = "hidden";
  trackElement.addEventListener("load", sync);
  track.addEventListener("cuechange", sync);
  film.textTracks.addEventListener("change", () => {
    if (track.mode === "disabled") track.mode = "hidden";
    sync();
  });
  film.addEventListener("timeupdate", sync);
  film.addEventListener("playing", () => {
    engaged = true;
    playing = true;
    syncTransport();
  });
  film.addEventListener("seeked", () => {
    engaged = true;
    remember();
    sync();
  });
  film.addEventListener("pause", () => {
    playing = false;
    remember();
    syncTransport();
  });
  film.addEventListener("ended", () => {
    playing = false;
    syncTransport();
  });
  window.addEventListener("pagehide", () => {
    film.pause();
    remember();
  });

  document.addEventListener("fullscreenchange", () => setFullscreen(document.fullscreenElement === film));
  film.addEventListener("webkitbeginfullscreen", () => setFullscreen(true));
  film.addEventListener("webkitendfullscreen", () => setFullscreen(false));
  window.addEventListener("hashchange", () => {
    if (!window.location.hash || window.location.hash === "#session-film") restore();
  });
  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !film.paused && !fullscreen
        && document.fullscreenElement !== film && !film.webkitDisplayingFullscreen) {
        film.pause();
      }
    });
    visibility.observe(film);
  }

  chapterList.hidden = false;
  const hash = window.location.hash;
  const navigationType = performance.getEntriesByType("navigation")[0]?.type;
  if (!hash && (!navigationType || navigationType === "navigate")) {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // A fresh opening can still play without storage.
    }
    film.muted = true;
    film.play().catch(() => {});
  } else if (!hash || hash === "#session-film") {
    restore();
  }
  syncTransport();
})();

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
  const lightbox = document.querySelector(".lightbox");
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
    if (lightbox.open) lightbox.close();
    const index = hashStep();
    const hash = window.location.hash;
    if (index >= 0 || !hash || hash === "#edit-example" || hash === "#walkthrough") {
      showStep(Math.max(0, index));
    }
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

    const x = Number(activeCapture.dataset.focusX);
    const y = Number(activeCapture.dataset.focusY);
    lightboxScroll.scrollLeft = x * lightboxImage.offsetWidth - lightboxScroll.clientWidth / 2;
    lightboxScroll.scrollTop = y * lightboxImage.offsetHeight - lightboxScroll.clientHeight / 2;
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
  const sessionFilm = document.querySelector(".session-film video");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowScreen = window.matchMedia("(max-width: 560px)");
  const stopDelay = 7600;
  let current = 0;
  let focused = false;
  let timer = null;
  let nextAt;
  let playRemaining = null;
  let autoplayEntry = false;
  let camera;

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
          view.scrollIntoView({ block: "nearest", behavior: reducedMotion.matches ? "instant" : "smooth" });
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
    const stickyHeight = document.querySelector('.site-header').getBoundingClientRect().height;
    const captions = stops[current].querySelector('figcaption').getBoundingClientRect().height;
    const extra = tour.querySelector('.tour-links')?.getBoundingClientRect().height || 0;
    const available = (window.visualViewport?.height || innerHeight) - stickyHeight
      - header.getBoundingClientRect().height - nav.getBoundingClientRect().height - captions - extra - 14;
    view.style.maxHeight = Math.max(120, Math.floor(available)) + 'px';
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

    const start = animate ? getComputedStyle(scene).transform : null;
    const target = "translate(" + x + "px, " + y + "px) scale(" + scale + ")";
    camera?.cancel();
    camera = null;
    highlight.classList.toggle("is-visible", Boolean(detail && region));
    scene.style.transform = target;
    if (start && start !== "none") {
      camera = scene.animate([{ transform: start }, { transform: target }], {
        duration: 680,
        easing: "cubic-bezier(.2,.75,.26,1)"
      });
    }
    if (focusButton) focusButton.textContent = detail ? "Full workspace" : "Focus detail";
  }

  function show(index, animate = false) {
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
    updatePlay();
    status.textContent = "Stop " + (current + 1) + " of " + stops.length + ". " +
      stop.querySelector("h3").textContent;

    if (focused && animate) paint(false);
    paint(focused, focused && animate);
  }

  function updatePlay() {
    play.textContent = timer !== null ? "Pause tour"
      : atLastStop() && playRemaining === null ? "Replay tour" : "Play tour";
  }

  function pause(freeze = false) {
    if (freeze && timer !== null) {
      playRemaining = Math.max(0, nextAt - performance.now());
      if (camera?.playState === "running") {
        const frameTime = camera.currentTime;
        camera.pause();
        camera.currentTime = frameTime;
      }
    } else if (!freeze) {
      playRemaining = null;
    }
    window.clearTimeout(timer);
    timer = null;
    updatePlay();
  }

  function navigate(index, method = "pushState") {
    window.history[method](null, "", "#" + stops[index].id);
    show(index, true);
  }

  function scheduleNext(delay = stopDelay) {
    nextAt = performance.now() + delay;
    timer = window.setTimeout(() => {
      if (atLastStop()) {
        pause();
        return;
      }
      // Keep a single history entry for the stops reached during this playback.
      navigate(current + 1, autoplayEntry ? "replaceState" : "pushState");
      autoplayEntry = true;
      scheduleNext();
    }, delay);
    updatePlay();
  }

  function move(index) {
    if (index < 0 || index >= stops.length) return;
    if (index === current) {
      pause(true);
      return;
    }
    pause();
    navigate(index);
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
      pause(true);
      return;
    }
    sessionFilm.pause();
    const delay = playRemaining;
    playRemaining = null;
    if (delay === null) {
      autoplayEntry = false;
      if (atLastStop()) navigate(0);
    }
    if (camera?.playState === "paused") camera.play();
    scheduleNext(delay ?? stopDelay);
  });

  tour.addEventListener("focusin", (event) => {
    if (event.target !== play && timer !== null) pause(true);
  });
  for (const event of ["pointerdown", "play", "seeking"]) {
    sessionFilm.addEventListener(event, () => pause(true));
  }

  function measureAnchorOffset() {
    tour.style.setProperty("--tour-anchor-offset", header.offsetHeight + nav.offsetHeight + 18 + "px");
  }

  window.addEventListener("resize", () => {
    measureAnchorOffset();
    paint(focused);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause(true);
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
