(() => {
  'use strict';
  const evidenceNotes = [...document.querySelectorAll('.nr-notebook > details')];
  const savedNotes = history.state?.nrOpenNotes || [];
  evidenceNotes.forEach((note, n) => {
    if (savedNotes.includes(n)) note.open = true;
    note.addEventListener('toggle', () => {
      const open = evidenceNotes.flatMap((item, i) => item.open ? [i] : []);
      history.replaceState({ ...history.state, nrOpenNotes: open }, '');
    });
  });
  function revealReference() {
    const target = document.getElementById(location.hash.slice(1));
    const note = target?.closest('details');
    if (note && !note.open) {
      note.open = true;
      requestAnimationFrame(() => target.scrollIntoView());
    }
  }
  revealReference();
  window.addEventListener('hashchange', revealReference);

  const example = document.querySelector('#transfer-example');
  if (!example) return;
  const choices = {
    keep: {
      event: 'Stored in log', next: 'Log cleared later', verdict: 'Count erasure when the log is cleared.',
      reason: 'The log still distinguishes the failed guesses. The calculation depends on what the later reset clears and what information survives.'
    },
    reset: {
      event: 'Register cleared', next: 'Next attempt', verdict: 'Count erasure after each failed test.',
      reason: 'Each failed candidate is cleared before the next attempt. Use the distribution of guesses that reach this reset, accounting for any information the machine keeps.'
    }
  };
  const buttons = [...example.querySelectorAll('button[data-retention]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
      for (const [field, text] of Object.entries(choices[button.dataset.retention])) {
        example.querySelector('[data-' + field + ']').textContent = text;
      }
      example.dataset.retention = button.dataset.retention;
    });
  }
})();
