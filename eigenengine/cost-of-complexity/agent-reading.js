(() => {
  "use strict";
  for (const box of document.querySelectorAll("[data-paired-review]")) {
    const status = box.querySelector("[data-paired-status]");
    const field = box.querySelector("[data-paired-selection]");
    const alternatives = box.querySelector(".paper-agent-access");
    const inspect = box.querySelector("[data-read-opening]");
    const openingPreview = box.querySelector("[data-opening-preview]");
    const openingText = box.querySelector("[data-opening-preview-text]");
    const canInspect = inspect && openingPreview && openingText;
    const ready = new Map();
    function showOpening(open) {
      openingPreview.hidden = !open;
      inspect.setAttribute("aria-expanded", String(open));
      inspect.textContent = open ? "Hide first prompt" : "Read first prompt";
      if (open) {
        field.hidden = true;
        openingPreview.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    }
    if (canInspect) {
      inspect.addEventListener("click", () => {
        const open = openingPreview.hidden;
        showOpening(open);
        if (open) {
          openingText.setSelectionRange(0, 0);
          openingText.scrollTop = 0;
          openingText.focus({ preventScroll: true });
        }
      });
    }
    async function prepare(key) {
      if (ready.has(key)) return;
      const link = box.querySelector(`[data-prompt-url="${key}"]`);
      const button = box.querySelector(`[data-copy-message="${key}"]`);
      if (!link || !button) return;
      try {
        const embedded = box.querySelector(`script[type="text/plain"][data-embedded-message="${key}"]`);
        let value;
        if (embedded) value = embedded.textContent.trim();
        else {
          const response = await fetch(link.href);
          if (!response.ok) return;
          value = (await response.text()).trim();
        }
        if (!value) return;
        ready.set(key, value);
        if (key === "opening" && canInspect) {
          openingText.value = value;
          inspect.hidden = false;
        }
        button.hidden = false;
        link.hidden = true;
      } catch { /* The ordinary link opens the message even when scripting or fetch is unavailable. */ }
    }
    for (const button of box.querySelectorAll("[data-copy-message]")) {
      const key = button.dataset.copyMessage;
      button.addEventListener("click", async () => {
        const value = ready.get(key);
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          field.hidden = true;
          status.textContent = key === "opening" ? "Copied. Send this in a fresh chat with no manuscript attached." :
            "Copied. Send this after the first reply, in the same chat.";
        } catch {
          if (key === "opening" && canInspect) {
            showOpening(true);
            openingText.focus({ preventScroll: true });
            openingText.select();
          } else {
            if (canInspect) showOpening(false);
            field.hidden = false; field.value = value; field.focus(); field.select();
          }
          status.textContent = "Message selected. Use your browser’s Copy command.";
        }
      });
    }
    prepare("opening");
    prepare("follow-up");
    alternatives.addEventListener("toggle", () => { if (alternatives.open) prepare("with-papers"); });
  }
})();
