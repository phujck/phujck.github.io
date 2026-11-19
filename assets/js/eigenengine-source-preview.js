/* Pinpoint links remain ordinary manuscript links until the public source index is ready. */
(() => {
  "use strict";
  if (!window.HTMLDialogElement?.prototype.showModal) return;

  const historyKey = "eigenengineSourceRegion";
  const paperForAsset = new Map([["cost-paper", "cost"], ["kalmar-paper", "kalmar"]]);
  let index;
  let dialog;
  let activeRegion;
  let opener;
  let readingPosition;
  let closing = false;
  let fullPage = false;
  let enlarged = false;

  function regionFor(link) {
    if (!index || !(link instanceof HTMLAnchorElement) || link.hasAttribute("download")) return;
    const requested = link.dataset.sourceRegion;
    if (link.target && link.target !== "_self" && !(requested && link.target === "_blank")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    let paper, page;
    if (url.pathname === "/demo/view/") {
      paper = paperForAsset.get(url.searchParams.get("asset"));
      page = url.searchParams.get("page");
    } else if (requested) {
      paper = index.regions[requested]?.paper;
      if (index.papers[paper]?.asset !== url.pathname) return;
      page = new URLSearchParams(url.hash.slice(1)).get("page");
    }
    if (!paper || !/^[1-9]\d*$/.test(page || "")) return;
    const key = link.dataset.sourceRegion || index.defaultByPage[paper]?.[page];
    const region = index.regions[key];
    if (region?.paper === paper && String(region.page) === page) return key;
  }

  function createDialog() {
    dialog = document.createElement("dialog");
    dialog.className = "ee-source-preview";
    dialog.setAttribute("aria-labelledby", "ee-source-region");
    dialog.setAttribute("aria-describedby", "ee-source-reference ee-source-description");
    dialog.innerHTML = `
      <div class="ee-source-head">
        <div>
          <p id="ee-source-reference"></p>
          <h2 id="ee-source-region"></h2>
        </div>
        <button type="button" data-source-close autofocus>Close</button>
      </div>
      <p id="ee-source-description"></p>
      <div class="ee-source-image" role="region" aria-label="Manuscript preview" tabindex="0">
        <svg xmlns="http://www.w3.org/2000/svg" role="img">
          <image width="612" height="792"></image>
          <rect class="ee-source-outline" vector-effect="non-scaling-stroke"></rect>
        </svg>
        <p data-source-error role="status" hidden>The page image could not be loaded. You can open the full paper below.</p>
      </div>
      <div class="ee-source-actions">
        <div class="ee-source-view-options">
          <button type="button" data-source-detail></button>
          <button type="button" data-source-zoom>Enlarge detail</button>
        </div>
        <a data-source-paper target="_blank" rel="noopener"></a>
      </div>`;
    document.body.append(dialog);
    dialog.querySelector("[data-source-close]").addEventListener("click", requestClose);
    dialog.querySelector("[data-source-detail]").addEventListener("click", () => {
      fullPage = !fullPage;
      enlarged = false;
      drawRegion();
    });
    dialog.querySelector("[data-source-zoom]").addEventListener("click", () => {
      enlarged = !enlarged;
      drawRegion();
    });
    dialog.querySelector("image").addEventListener("error", () => {
      dialog.querySelector("svg").style.display = "none";
      dialog.querySelector("[data-source-error]").hidden = false;
      dialog.querySelector("[data-source-detail]").disabled = true;
      dialog.querySelector("[data-source-zoom]").hidden = true;
    });
    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      requestClose();
    });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) requestClose();
    });
  }

  // Both manuscripts use US Letter pages. Work in the original PDF's point coordinates.
  function drawRegion() {
    const region = index.regions[activeRegion];
    const [left, top, wide, high] = region.rect;
    const x = left * 612, y = top * 792, w = wide * 612, h = high * 792;
    const frame = dialog.querySelector(".ee-source-outline");
    for (const [name, value] of Object.entries({ x, y, width: w, height: h })) {
      frame.setAttribute(name, value);
    }
    const cropX = fullPage ? 0 : Math.max(0, x - 13);
    const cropY = fullPage ? 0 : Math.max(0, y - 13);
    const cropW = fullPage ? 612 : Math.min(612, x + w + 13) - cropX;
    const cropH = fullPage ? 792 : Math.min(792, y + h + 13) - cropY;
    const svg = dialog.querySelector("svg");
    svg.setAttribute("viewBox", [cropX, cropY, cropW, cropH].join(" "));
    svg.setAttribute("width", cropW);
    svg.setAttribute("height", cropH);
    svg.setAttribute("aria-label", (fullPage ? "Full page. Highlighted area: " : "Highlighted detail: ") + region.label);
    svg.style.setProperty("--detail-width", cropW * 2 + "px");
    svg.style.setProperty("--native-width", cropW * 2.5 + "px");
    dialog.classList.toggle("ee-source-full", fullPage);
    dialog.classList.toggle("ee-source-enlarged", enlarged);
    const zoom = dialog.querySelector("[data-source-zoom]");
    zoom.hidden = fullPage;
    zoom.textContent = enlarged ? "Fit detail" : "Enlarge detail";
    dialog.querySelector("[data-source-detail]").textContent = fullPage ? "Show highlighted detail" : "Show full page";
    dialog.querySelector(".ee-source-image").scrollTo(0, 0);
  }

  function openRegion(key) {
    if (!dialog) createDialog();
    const region = index.regions[key];
    const paper = index.papers[region.paper];
    activeRegion = key;
    fullPage = false;
    enlarged = false;
    dialog.querySelector("#ee-source-reference").textContent = paper.title + " · Page " + region.page;
    dialog.querySelector("#ee-source-region").textContent = region.label;
    dialog.querySelector("#ee-source-description").textContent = region.description;
    const fullPaper = dialog.querySelector("[data-source-paper]");
    fullPaper.href = paper.asset + "#page=" + region.page;
    fullPaper.textContent = "Open page " + region.page + " in the full paper ↗";
    fullPaper.setAttribute("aria-label", "Open page " + region.page + " in the full paper (opens in a new tab)");
    dialog.querySelector("svg").style.removeProperty("display");
    dialog.querySelector("[data-source-error]").hidden = true;
    dialog.querySelector("[data-source-detail]").disabled = false;
    dialog.querySelector("image").setAttribute("href", region.image);
    drawRegion();
    if (!dialog.open) {
      dialog.showModal();
      document.dispatchEvent(new CustomEvent("eigenengine-source-preview", { detail: { open: true } }));
    }
  }

  function requestClose() {
    if (closing || !dialog.open) return;
    closing = true;
    history.back();
  }

  function restoreFromHistory() {
    closing = false;
    const key = history.state?.[historyKey];
    if (key && index?.regions[key]) {
      openRegion(key);
    } else if (dialog?.open) {
      dialog.close();
      activeRegion = undefined;
      // Browsers can refocus and scroll to the URL fragment after popstate finishes.
      const place = readingPosition;
      setTimeout(() => {
        if (dialog.open) return;
        if (place && place.url === location.href && place === readingPosition) {
          opener?.focus({ preventScroll: true });
          window.scrollTo({ left: place.x, top: place.y, behavior: "instant" });
        }
        document.dispatchEvent(new CustomEvent("eigenengine-source-preview", { detail: { open: false } }));
      }, 0);
    }
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.("a[href]");
    const key = regionFor(link);
    if (!key) return;
    event.preventDefault();
    opener = link;
    readingPosition = { x: window.scrollX, y: window.scrollY, url: location.href };
    // The identical URL keeps the host's anchor, selected graph and film position intact.
    history.pushState({ ...history.state, [historyKey]: key }, "");
    openRegion(key);
  });
  window.addEventListener("popstate", restoreFromHistory);

  fetch("/assets/data/eigenengine-source-regions.json")
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data?.papers || !data.regions || !data.defaultByPage) return;
      index = data;
      restoreFromHistory();
    })
    .catch(() => { /* Keep the original manuscript destinations available offline. */ });
})();
