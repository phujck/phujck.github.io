document.addEventListener("DOMContentLoaded", () => {
  const deckRoot = document.querySelector("[data-talk-deck]");
  if (!deckRoot) {
    return;
  }

  const dataEl = document.getElementById("talk-deck-data");
  if (!dataEl) {
    return;
  }

  let slides;
  try {
    slides = JSON.parse(dataEl.textContent);
  } catch (error) {
    console.error("Failed to parse talk deck data.", error);
    return;
  }

  if (!Array.isArray(slides) || slides.length === 0) {
    return;
  }

  const rail = deckRoot.querySelector("[data-deck-rail]");
  const sectionEl = deckRoot.querySelector("[data-deck-section]");
  const titleEl = deckRoot.querySelector("[data-deck-title]");
  const bulletsEl = deckRoot.querySelector("[data-deck-bullets]");
  const counterEls = deckRoot.querySelectorAll("[data-deck-counter]");
  const progressEl = deckRoot.querySelector("[data-deck-progress]");
  const videoEl = deckRoot.querySelector("[data-deck-video]");
  const imageEl = deckRoot.querySelector("[data-deck-image]");
  const sourceEl = deckRoot.querySelector("[data-deck-source]");
  const captionEl = deckRoot.querySelector("[data-deck-caption]");
  const replayButton = deckRoot.querySelector("[data-deck-replay]");
  const openVideoEl = deckRoot.querySelector("[data-deck-open-video]");
  const fullscreenButton = deckRoot.querySelector("[data-deck-fullscreen]");
  const prevButton = deckRoot.querySelector("[data-deck-prev]");
  const nextButton = deckRoot.querySelector("[data-deck-next]");
  const stageCard = deckRoot.querySelector("[data-deck-stage-card]");
  const videoFrame = videoEl ? videoEl.closest(".deck-video-frame") : null;

  let currentIndex = 0;
  let currentFragment = 0;
  let videoStarted = false;
  const slideButtons = [];

  const formatCounter = (index) =>
    `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

  const normaliseHash = (hash) => hash.replace(/^#/, "").trim();

  const getFragmentCount = (slide) => {
    let count = 0;
    if (slide.revealBullets) {
      count += slide.bullets.length;
    }
    if (slide.revealMediaOnLastStep) {
      count += 1;
    }
    return count;
  };

  const getMediaHref = (slide) => slide.image || slide.video || "";

  const isImageSlide = (slide) => Boolean(slide.image);

  const isVideoSlide = (slide) => Boolean(slide && slide.video && !slide.image);

  const scrollButtonIntoView = (button) => {
    if (!button || typeof button.scrollIntoView !== "function") {
      return;
    }
    button.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "smooth",
    });
  };

  const setReplayVisible = (visible) => {
    if (videoFrame) {
      videoFrame.classList.toggle("is-ended", visible);
    }

    if (replayButton) {
      replayButton.hidden = !visible;
      replayButton.setAttribute("aria-hidden", visible ? "false" : "true");
    }
  };

  const stopVideo = () => {
    if (!videoEl || !sourceEl) {
      return;
    }

    videoStarted = false;
    videoEl.pause();
    videoEl.loop = false;
    videoEl.currentTime = 0;
    sourceEl.removeAttribute("src");
    videoEl.removeAttribute("poster");
    setReplayVisible(false);
    videoEl.load();
  };

  const setVideoSource = (slide) => {
    if (!videoEl || !sourceEl) {
      return;
    }

    videoStarted = false;
    videoEl.pause();
    videoEl.loop = false;
    sourceEl.src = slide.video;
    videoEl.poster = slide.poster;
    videoEl.currentTime = 0;
    setReplayVisible(false);
    videoEl.load();
  };

  const buildBullets = (slide) => {
    bulletsEl.innerHTML = "";
    slide.bullets.forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      bulletsEl.appendChild(li);
    });
    bulletsEl.classList.toggle("has-fragments", Boolean(slide.revealBullets));
  };

  const updateBullets = (slide) => {
    const visibleCount = slide.revealBullets ? currentFragment : slide.bullets.length;
    const bulletEls = bulletsEl.querySelectorAll("li");

    bulletsEl.classList.toggle("has-fragments", Boolean(slide.revealBullets));

    bulletEls.forEach((li, index) => {
      const shouldShow = !slide.revealBullets || index < visibleCount;
      li.hidden = Boolean(slide.revealBullets) && !shouldShow;
      li.classList.toggle("is-visible", shouldShow);
      li.setAttribute("aria-hidden", shouldShow ? "false" : "true");
    });
  };

  const primeMedia = (slide) => {
    const mediaHref = getMediaHref(slide);
    const imageSlide = isImageSlide(slide);

    if (videoFrame) {
      videoFrame.classList.toggle("is-image", imageSlide);
      videoFrame.classList.remove("is-media-hidden");
      videoFrame.dataset.placeholder = "";
    }

    if (imageEl) {
      imageEl.hidden = true;
      imageEl.classList.remove("is-visible");
      imageEl.removeAttribute("src");
      imageEl.alt = "";
    }

    if (imageSlide) {
      stopVideo();
      if (videoEl) {
        videoEl.hidden = true;
      }

      if (imageEl && mediaHref) {
        imageEl.src = mediaHref;
        imageEl.alt = slide.imageAlt || slide.title;
      }
    } else {
      if (videoEl) {
        videoEl.hidden = false;
      }
      setVideoSource(slide);
    }
  };

  const shouldShowMedia = (slide) => {
    if (!getMediaHref(slide)) {
      return false;
    }

    if (!slide.revealMediaOnLastStep) {
      return true;
    }

    const bulletSteps = slide.revealBullets ? slide.bullets.length : 0;
    return currentFragment > bulletSteps;
  };

  const canStartVideoPlayback = (slide) => {
    if (!videoEl || !isVideoSlide(slide)) {
      return false;
    }

    if (!shouldShowMedia(slide)) {
      return false;
    }

    return !videoStarted;
  };

  const startVideoPlayback = () => {
    if (!videoEl) {
      return;
    }

    if (videoEl.ended) {
      videoEl.currentTime = 0;
    }

    setReplayVisible(false);
    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const updateMedia = (slide) => {
    const mediaHref = getMediaHref(slide);
    const mediaVisible = shouldShowMedia(slide);
    const imageSlide = isImageSlide(slide);

    if (videoFrame) {
      videoFrame.classList.toggle("is-media-hidden", !mediaVisible);
      videoFrame.dataset.placeholder = !mediaVisible ? slide.mediaPlaceholder || "" : "";
    }

    if (imageSlide) {
      if (imageEl) {
        imageEl.hidden = !mediaVisible;
        imageEl.classList.toggle("is-visible", mediaVisible);
      }
    } else if (videoEl) {
      videoEl.hidden = !mediaVisible;
      if (!mediaVisible) {
        videoEl.pause();
        setReplayVisible(false);
      }
    }

    if (openVideoEl) {
      const hasMedia = Boolean(mediaHref);
      openVideoEl.hidden = !hasMedia || !mediaVisible;
      openVideoEl.href = hasMedia ? mediaHref : "#";
      openVideoEl.textContent = imageSlide ? "Open current image" : "Open current video";
    }
  };

  const updateNavButtons = (slide) => {
    const lastFragment = getFragmentCount(slide);
    const atStart = currentIndex === 0 && currentFragment === 0;
    const atEnd =
      currentIndex === slides.length - 1 &&
      currentFragment >= lastFragment &&
      !canStartVideoPlayback(slide);

    prevButton.disabled = atStart;
    nextButton.disabled = atEnd;
  };

  const renderCurrentState = () => {
    const slide = slides[currentIndex];
    updateBullets(slide);
    updateMedia(slide);
    updateNavButtons(slide);
  };

  const setFragment = (requestedFragment) => {
    const slide = slides[currentIndex];
    const maxFragment = getFragmentCount(slide);
    currentFragment = Math.max(0, Math.min(maxFragment, requestedFragment));
    renderCurrentState();
  };

  const updateFullscreenButton = () => {
    if (!fullscreenButton) {
      return;
    }

    const isFullscreen = document.fullscreenElement === deckRoot;
    fullscreenButton.textContent = isFullscreen ? "Exit present mode" : "Present mode";
    fullscreenButton.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
  };

  const setSlide = (requestedIndex, { updateHash = true, fragment = 0 } = {}) => {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, requestedIndex));
    currentIndex = nextIndex;

    const slide = slides[currentIndex];
    currentFragment = Math.max(0, Math.min(getFragmentCount(slide), fragment));
    videoStarted = false;

    sectionEl.textContent = slide.section;
    titleEl.textContent = slide.title;
    buildBullets(slide);

    counterEls.forEach((el) => {
      el.textContent = formatCounter(currentIndex);
    });

    if (progressEl) {
      progressEl.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    }

    if (captionEl) {
      captionEl.textContent = slide.caption || "Autoplaying muted video loop";
    }

    slideButtons.forEach((button, index) => {
      button.classList.toggle("active", index === currentIndex);
      button.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });

    primeMedia(slide);
    renderCurrentState();
    scrollButtonIntoView(slideButtons[currentIndex]);

    if (updateHash) {
      history.replaceState(null, "", `#${slide.slug}`);
    }
  };

  const advanceDeck = () => {
    const slide = slides[currentIndex];
    const lastFragment = getFragmentCount(slide);

    if (currentFragment < lastFragment) {
      setFragment(currentFragment + 1);
      return;
    }

    if (canStartVideoPlayback(slide)) {
      startVideoPlayback();
      return;
    }

    if (currentIndex < slides.length - 1) {
      setSlide(currentIndex + 1);
    }
  };

  const rewindDeck = () => {
    if (currentFragment > 0) {
      setFragment(currentFragment - 1);
      return;
    }

    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      setSlide(previousIndex, { fragment: getFragmentCount(slides[previousIndex]) });
    }
  };

  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "deck-rail-button";
    button.innerHTML = `
      <span class="deck-rail-index">${String(index + 1).padStart(2, "0")}</span>
      <span>
        <span class="deck-rail-title">${slide.title}</span>
        <span class="deck-rail-section">${slide.section}</span>
      </span>
    `;
    button.addEventListener("click", () => setSlide(index));
    rail.appendChild(button);
    slideButtons.push(button);
  });

  prevButton.addEventListener("click", rewindDeck);
  nextButton.addEventListener("click", advanceDeck);

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const target = event.target;
    const tagName = target && target.tagName ? target.tagName.toLowerCase() : "";
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        rewindDeck();
        break;
      case "ArrowRight":
      case "PageDown":
      case " ":
        event.preventDefault();
        advanceDeck();
        break;
      case "Home":
        event.preventDefault();
        setSlide(0);
        break;
      case "End":
        event.preventDefault();
        setSlide(slides.length - 1, { fragment: getFragmentCount(slides[slides.length - 1]) });
        break;
      default:
        break;
    }
  });

  window.addEventListener("hashchange", () => {
    const slug = normaliseHash(window.location.hash);
    const slideIndex = slides.findIndex((slide) => slide.slug === slug);
    if (slideIndex >= 0 && slideIndex !== currentIndex) {
      setSlide(slideIndex, { updateHash: false });
    }
  });

  videoEl.addEventListener("click", () => {
    if (videoEl.ended) {
      videoEl.currentTime = 0;
    }

    if (videoEl.paused) {
      startVideoPlayback();
    } else {
      videoEl.pause();
    }
  });

  videoEl.addEventListener("play", () => {
    videoStarted = true;
    setReplayVisible(false);
    updateNavButtons(slides[currentIndex]);
  });

  videoEl.addEventListener("ended", () => {
    setReplayVisible(true);
  });

  if (replayButton) {
    replayButton.hidden = true;
    replayButton.setAttribute("aria-hidden", "true");
    replayButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      videoEl.currentTime = 0;
      startVideoPlayback();
    });
  }

  if (!document.fullscreenEnabled && fullscreenButton) {
    fullscreenButton.hidden = true;
  }

  if (fullscreenButton && document.fullscreenEnabled) {
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement === deckRoot) {
          await document.exitFullscreen();
        } else {
          await deckRoot.requestFullscreen();
        }
      } catch (error) {
        console.error("Failed to toggle presentation fullscreen.", error);
      }
    });
  }

  document.addEventListener("fullscreenchange", () => {
    updateFullscreenButton();

    if (document.fullscreenElement === deckRoot && stageCard) {
      stageCard.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  });

  const initialSlug = normaliseHash(window.location.hash);
  const initialIndex = slides.findIndex((slide) => slide.slug === initialSlug);
  updateFullscreenButton();
  setSlide(initialIndex >= 0 ? initialIndex : 0, { updateHash: initialSlug.length === 0 });
});
