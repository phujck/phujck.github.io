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
  const slideButtons = [];

  const formatCounter = (index) =>
    `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;

  const normaliseHash = (hash) => hash.replace(/^#/, "").trim();

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

  const setVideoSource = (slide) => {
    videoEl.pause();
    videoEl.loop = false;
    sourceEl.src = slide.video;
    videoEl.poster = slide.poster;
    videoEl.currentTime = 0;
    setReplayVisible(false);
    videoEl.load();

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const renderBullets = (slide) => {
    bulletsEl.innerHTML = "";
    slide.bullets.forEach((bullet) => {
      const li = document.createElement("li");
      li.textContent = bullet;
      bulletsEl.appendChild(li);
    });
  };

  const updateFullscreenButton = () => {
    if (!fullscreenButton) {
      return;
    }

    const isFullscreen = document.fullscreenElement === deckRoot;
    fullscreenButton.textContent = isFullscreen ? "Exit present mode" : "Present mode";
    fullscreenButton.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
  };

  const setSlide = (requestedIndex, { updateHash = true } = {}) => {
    const nextIndex = Math.max(0, Math.min(slides.length - 1, requestedIndex));
    currentIndex = nextIndex;

    const slide = slides[currentIndex];

    sectionEl.textContent = slide.section;
    titleEl.textContent = slide.title;
    renderBullets(slide);

    counterEls.forEach((el) => {
      el.textContent = formatCounter(currentIndex);
    });

    if (progressEl) {
      progressEl.style.width = `${((currentIndex + 1) / slides.length) * 100}%`;
    }

    if (captionEl) {
      captionEl.textContent = slide.caption || "Autoplaying muted video loop";
    }

    if (openVideoEl) {
      openVideoEl.href = slide.video;
    }

    slideButtons.forEach((button, index) => {
      button.classList.toggle("active", index === currentIndex);
      button.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });

    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === slides.length - 1;

    setVideoSource(slide);
    scrollButtonIntoView(slideButtons[currentIndex]);

    if (updateHash) {
      history.replaceState(null, "", `#${slide.slug}`);
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

  prevButton.addEventListener("click", () => setSlide(currentIndex - 1));
  nextButton.addEventListener("click", () => setSlide(currentIndex + 1));

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
        setSlide(currentIndex - 1);
        break;
      case "ArrowRight":
      case "PageDown":
      case " ":
        event.preventDefault();
        setSlide(currentIndex + 1);
        break;
      case "Home":
        event.preventDefault();
        setSlide(0);
        break;
      case "End":
        event.preventDefault();
        setSlide(slides.length - 1);
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
      setReplayVisible(false);
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      videoEl.pause();
    }
  });

  videoEl.addEventListener("play", () => {
    setReplayVisible(false);
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
      setReplayVisible(false);
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
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
