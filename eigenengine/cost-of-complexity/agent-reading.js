(async () => {
  const box = document.querySelector(".paper-agent-entry");
  if (!box) return;
  const button = box.querySelector("[data-copy-opening]");
  const link = box.querySelector("[data-open-reader]");
  const field = box.querySelector("[data-opening-text]");
  const status = box.querySelector("[data-opening-status]");
  try {
    const embedded = box.querySelector('script[type="text/plain"]');
    if (embedded) field.value = embedded.textContent.trim();
    else {
      const response = await fetch(new URL("opening.txt", link.href));
      if (!response.ok) return;
      field.value = (await response.text()).trim();
    }
  } catch { return; }
  button.hidden = false;
  link.textContent = "Open the reading notebook ↗";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = "Copied. Send it in a fresh chat, then save the reply in the notebook.";
    } catch {
      field.hidden = false; field.focus(); field.select();
      status.textContent = "Opening prompt selected. Use your browser’s Copy command.";
    }
  });
})();
