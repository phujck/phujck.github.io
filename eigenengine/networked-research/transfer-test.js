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
  const controls = example.querySelector('.nr-log-choice');
  controls.hidden = false;
  const buttons = Array.from(controls.querySelectorAll('button[data-pixel-scale]'));
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const scale = Number(button.dataset.pixelScale);
    const width = 40 * scale;
    buttons.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    example.querySelector('[data-scale]').textContent = scale + ' µm/pixel';
    example.querySelector('[data-width]').textContent = width + ' µm';
    // Each drawn grain spans 80 SVG units for its 40 image pixels.
    const scaleBar = 2 * 10 / scale;
    example.querySelector('[data-scale-bar]').setAttribute('d', 'M17 65h' + scaleBar);
    example.querySelector('[data-scale-label]').setAttribute('x', 23 + scaleBar);
    example.querySelector('[data-verdict]').textContent = width === 40
      ? 'Both grains are 40 µm wide.' : 'The second grain is half as wide.';
    example.querySelector('[data-reason]').textContent = width === 40
      ? 'Both images have the same scale. A span of 40 pixels represents the same physical width in each.'
      : 'The first grain is 40 µm wide. The second looks just as wide because its image is magnified.';
  }));
})();
