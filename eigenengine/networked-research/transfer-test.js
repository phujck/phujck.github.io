(() => {
  'use strict';
  const example = document.querySelector('#transfer-example');
  if (!example) return;
  const choices = {
    keep: {
      event: 'Stored in log', next: 'Log cleared later', verdict: 'Price the later reset.',
      reason: 'Rejection leaves a distinguishable record in the log. To use the erasure bound, inspect what is erased when the log is cleared and what information is still available then.'
    },
    reset: {
      event: 'Register cleared', next: 'Next attempt', verdict: 'Price the reset after failure.',
      reason: 'This machine clears its failed candidate before trying again. The relevant distribution is the set of failed guesses that enter that reset, with any retained side information accounted for.'
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
