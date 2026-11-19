(() => {
  const button = document.getElementById("nr-copy-prompt");
  if (!button) return;
  const field = document.getElementById("nr-agent-prompt");
  const details = document.getElementById("nr-prompt-details");
  const status = document.getElementById("nr-copy-status");
  let reset;
  button.hidden = false;
  button.addEventListener("click", async () => {
    clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = "Prompt copied. Paste it into your agent.";
      reset = setTimeout(() => { status.textContent = ""; }, 7000);
    } catch {
      details.open = true;
      field.focus({ preventScroll: true });
      field.select();
      status.textContent = "Prompt selected. Use your browser’s Copy command.";
    }
  });
})();
