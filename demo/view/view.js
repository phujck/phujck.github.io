(() => {
  "use strict";
  const images = {
    "full-project": ["The editing workspace", "session-overview"],
    "morning-versions": ["The saved proposal versions", "session-morning"],
    "morning-comparison": ["The morning proof edit", "session-morning"],
    "full-changes": ["Saved project changes", "session-changes"],
    "full-passage": ["A changed passage", "session-passage"],
    "full-history": ["The source file’s history", "session-history"],
    "full-arxiv": ["The arXiv package check", "session-arxiv"],
    manuscript: ["Open the manuscript", "manuscript"],
    "proposal-changes": ["The suggested edit", "proposal"],
    "proposal-edit": ["The author’s wording", "edit"],
    "proposal-accepted": ["The accepted edit", "accept"],
    "proposal-undo": ["The original passage restored", "undo"],
    workflow: ["The workflow graph", "workflow"],
    "reader-plan": ["The reader plan", "reader-plan"],
    figure: ["Inspect the figure", "figure"],
    "reading-options": ["Reading options", "reading-options"],
    "simulation-table": ["The numerical evidence table", "simulation-result"],
    "simulation-provenance": ["Code, inputs and output", "simulation-result"],
    "simulation-stale": ["The figure after its input changed", "simulation-stale"],
    "simulation-run": ["The subdivision simulation", "simulation-run"],
    "simulation-result": ["Recorded numerical result", "simulation-result"],
    "simulation-binding": ["The figure’s evidence and table", "simulation-binding"],
    "simulation-figure": ["The computed figure in the manuscript", "simulation-figure"],
    "simulation-plot": ["The computed costs of subdivision", "simulation"],
    "published-figure": ["Figure 3 in the paper", "published-figure"],
  };
  const assets = Object.assign(Object.create(null), window.eigenExampleViews || {}, {
    "cost-paper": {type: "pdf", title: "The Cost of Complexity", src: "/assets/docs/the-cost-of-complexity.pdf"},
    "kalmar-paper": {type: "pdf", title: "Physical origins of the Kalmár constant", src: "/assets/docs/physical-origins-of-the-kalmar-constant.pdf"},
    "session-tour": {type: "video", title: "The 18 November editing session", src: "../writing/media/session-tour.mp4", stop:"session-film"},
    "proposal-walkthrough": {type: "video", title: "One edit up close", src: "../writing/media/proposal-walkthrough.mp4", stop:"video"}
  });
  for (const [id, [title, stop]] of Object.entries(images)) {
    assets[id] = {type: "image", title, stop, src: "../writing/media/" + id + ".webp"};
  }
  const params = new URLSearchParams(location.search);
  const item = assets[params.get("asset")];
  if (!item) return;
  document.title = item.title + " · EigenEngine";
  document.getElementById("title").textContent = item.title;
  const holder = document.getElementById("material");
  const related = document.getElementById("related");
  if (item.stop) {
    related.href = item.stop.startsWith("simulation") ? "/demo/writing/simulation/#" + item.stop : "../writing/#" + item.stop;
    related.textContent = item.stop.startsWith("simulation") ? "Return to the simulation" : "Return to walkthrough";
    related.hidden = false;
  }
  let element;
  if (item.type === "image") {
    element = new Image();
    element.alt = item.title;
    element.src = item.src;
    element.className = "can-zoom";
    element.onload = () => holder.style.setProperty("--intrinsic-width", element.naturalWidth + "px");
    element.title = "Click to switch between the fitted and full-size image";
    const size = document.getElementById("image-size");
    size.hidden = false;
    function resize(expanded) {
      element.classList.toggle("expanded", expanded);
      size.setAttribute("aria-pressed", String(expanded));
      size.textContent = expanded ? "Fit image" : "Actual size";
      holder.tabIndex = expanded ? 0 : -1;
      if (!expanded) {
        holder.scrollTo(0, 0);
        if (document.activeElement === holder) size.focus();
      }
    }
    const toggleSize = () => resize(!element.classList.contains("expanded"));
    element.addEventListener("click", toggleSize);
    size.addEventListener("click", toggleSize);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && element.classList.contains("expanded")) resize(false);
    });
  } else if (item.type === "video") {
    element = document.createElement("video");
    element.controls = true;
    element.playsInline = true;
    element.preload = "metadata";
    element.src = item.src;
    const track = document.createElement("track");
    Object.assign(track, {kind:"captions", srclang:"en", label:"English", src:item.src.replace(/\.mp4$/, ".vtt")});
    element.append(track);
  } else {
    element = document.createElement("iframe");
    element.title = item.title;
    element.allowFullscreen = true;
    const page = params.get("page");
    const slide = params.get("slide");
    const talkSlide = item === assets.synthetics && /^\d{1,2}$/.test(slide || "")
      && Number(slide) >= 1 && Number(slide) <= 39;
    const target = item.src + (talkSlide ? "#/" + Number(slide) : "");
    element.src = target + (item.type === "pdf" && /^\d{1,3}$/.test(page || "") ? "#page=" + page : "");
    if (item.type === "page") {
      related.href = target;
      related.target = "_blank";
      related.rel = "noopener";
      related.textContent = "Open original ↗";
      related.hidden = false;
    }
    if (item.type === "pdf") {
      related.href = item.src;
      related.download = "";
      related.textContent = "Download PDF";
      related.hidden = false;
    }
  }
  holder.replaceChildren(element);
})();
