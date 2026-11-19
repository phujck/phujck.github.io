(() => {
  'use strict';
  const mount = document.getElementById('editor-learning-loop');
  if (!mount || !window.ResizeObserver || !window.IntersectionObserver) return;

  const svgNS = 'http://www.w3.org/2000/svg';
  const stages = [
    {
      title: 'Ask for the inset', duration: 3400,
      detail: 'After the section rewrite, the author asked to show the same nested choice at each dimension.',
    },
    {
      title: 'Package the edit', subtitle: 'Version and reason', duration: 3000,
      detail: 'A reusable note could link the figure version to a reminder to label changes of scale.',
      icon: '<g class="el-copy-sheet"><path d="M17 9h26l6 6v23H17z"/></g><g class="el-front-sheet"><path d="M25 5h24l7 7v24H25z"/><path d="M49 5v8h7M31 17h15m-15 6h19m-19 6h10"/></g>',
    },
    {
      title: 'Try a new project', subtitle: 'A pair of micrographs', duration: 3000,
      detail: 'Two micrographs show grains equally wide on screen. Check both scales before comparing the grains.',
      icon: '<rect x="7" y="6" width="24" height="30" rx="2"/><rect x="41" y="6" width="24" height="30" rx="2"/><path d="m12 19 5-6 8 4-1 7-8 1zm34 0 5-6 8 4-1 7-8 1zM11 31h11m23 0h6"/>',
    },
    {
      title: 'Compare fresh cases', subtitle: 'With and without the note', duration: 3600,
      detail: 'Give both editors fresh images and scale bars. Can each tell whether the physical widths differ?',
      icon: '<path class="el-chart-guide" d="M7 22h6q5 0 5-5v-4h6m-11 9q5 0 5 5v4h6"/><g class="el-trace"><path pathLength="1" d="M24 13h34"/><path pathLength="1" d="M24 31h34"/></g><rect x="29" y="10" width="6" height="6" rx="1"/><rect x="43" y="10" width="6" height="6" rx="1"/><rect x="29" y="28" width="6" height="6" rx="1"/><rect x="43" y="28" width="6" height="6" rx="1"/><path d="M59 10h5v24h-5"/>',
    },
    {
      title: 'Review the result', subtitle: 'Retain or revise', duration: 3700,
      detail: 'A reviewer can keep the tested instruction for future edits or send it back for revision.',
      icon: '<path d="m36 2 19 19-19 20-19-20z"/><circle cx="36" cy="16" r="4.3"/><path d="M28 28q1-7 8-7t8 7"/>',
    },
  ];
  const starts = [];
  const duration = stages.reduce((total, stage) => { starts.push(total); return total + stage.duration; }, 0);
  const stageButton = (stage, i) => `<button class="el-stage el-node-${i}" data-step="${i}" type="button" aria-pressed="false">
    <svg class="el-icon" viewBox="0 0 72 44" aria-hidden="true">${stage.icon}</svg><span>${stage.title}</span><small>${stage.subtitle}</small></button>`;

  mount.innerHTML = `<div class="el-shell" role="group" aria-labelledby="el-title">
    <div class="el-header"><h3 id="el-title">From one edit to a future instruction</h3>
      <div class="el-controls"><button type="button" data-play>Play</button><button type="button" data-replay>Replay</button></div>
    </div>
    <div class="el-workspace">
      <svg class="el-wires" aria-hidden="true"><defs>
        <marker id="el-wire-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto" markerUnits="userSpaceOnUse"><path d="m1 1 6 3-6 3" fill="none" stroke="#85a8ba" stroke-linecap="round" stroke-linejoin="round"/></marker>
      </defs><g class="el-routes"></g><path class="el-flight" pathLength="1"/>
        <g class="el-traveler"><circle class="el-halo" r="8.5"/><rect x="-3.6" y="-3.6" width="7.2" height="7.2" rx="1.3"/></g>
      </svg>
      <div class="el-editor">
        <div class="el-record-label">Hilbert manuscript revision <span>Writing App</span></div>
        <div class="el-proposal">
          <div class="el-workbench">
            <svg class="el-saved-ui" viewBox="224 117 1360 480" role="img" aria-label="The manuscript editor and its saved project changes."><image href="/demo/writing/media/full-changes.webp" width="1600" height="900"/></svg>
            <p>The author asked for prose, maths and figures to explain the cost of a cut.</p>
          </div>
          <div class="el-versions">
            <a href="/demo/writing/#revision-figure" aria-label="Compare the original and revised Figure 4 drawings"><img src="/demo/writing/media/hilbert-before-rewrite.webp" alt="Before the section rewrite, five layouts are labeled by their dimension"><span>Before · dimensions ↗</span></a>
            <span class="el-between" aria-hidden="true">→</span>
            <a href="/demo/writing/#revision-figure" aria-label="Inspect the revised cuts and costs beside the earlier drawing"><img src="/demo/writing/media/hilbert-after-rewrite.webp" alt="After the rewrite, the same five layouts also show the cuts and their cost exponents"><span>After · cut costs ↗</span></a>
          </div>
          <div class="el-passage-head"><p>Next author request</p>
            <button class="el-mark" type="button" data-step="0" aria-pressed="true"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 13 8.3-8.3 3 3L7 16l-4 1zM11 6l3 3"/></svg>Show the nesting</button>
          </div>
          <a class="el-inset-example" data-source-region="cost-fig-4b" href="/assets/docs/the-cost-of-complexity.pdf#page=11" target="_blank" rel="noopener" aria-label="Inspect the magnified children and physical width labels in published Figure 4(b)">
            <img src="/demo/writing/media/hilbert-inset.webp" alt=""><span>Each child is enlarged as its <mark>physical width shrinks</mark>. <b>Figure 4(b) ↗</b></span>
          </a>
        </div>
        <span class="el-exit-port" aria-hidden="true"></span>
        <div class="el-return"><span class="el-return-port" aria-hidden="true"></span><span>Future editor instructions</span><small>If retained</small></div>
      </div>
      <div class="el-cycle"><p class="el-cycle-label">Proposed reuse</p>
        ${stages.slice(1).map((stage, offset) => stageButton(stage, offset + 1)).join('')}
      </div>
    </div>
    <p class="el-caption" data-caption role="status" aria-live="off" aria-atomic="true"></p>
  </div>`;

  const get = selector => mount.querySelector(selector);
  const board = get('.el-workspace');
  const wires = get('.el-wires');
  const routes = get('.el-routes');
  const flight = get('.el-flight');
  const traveler = get('.el-traveler');
  const caption = get('[data-caption]');
  const play = get('[data-play]');
  const buttons = stages.map((_, index) => get(`[data-step="${index}"]`));
  const paths = stages.map(() => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('marker-end', 'url(#el-wire-arrow)');
    routes.append(path);
    return path;
  });

  function roundRoute(points, radius = 10) {
    let d = `M${points[0]}`;
    for (let i = 1; i < points.length - 1; i++) {
      const [x, y] = points[i];
      const [ax, ay] = points[i - 1];
      const [bx, by] = points[i + 1];
      const before = Math.hypot(x - ax, y - ay);
      const after = Math.hypot(bx - x, by - y);
      const r = Math.min(radius, before / 2, after / 2);
      if (!r) continue;
      d += ` L${x - (x-ax)*r/before} ${y - (y-ay)*r/before} Q${x} ${y} ${x + (bx-x)*r/after} ${y + (by-y)*r/after}`;
    }
    return d + ` L${points.at(-1)}`;
  }

  let elapsed = 0, stageIndex = -1, frame = 0, previousTime = null;
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = false, previewOpen = false;
  function measure() {
    const box = board.getBoundingClientRect();
    const narrow = getComputedStyle(board).getPropertyValue('--el-stacked').trim() === '1';
    const screen = get('.el-saved-ui');
    const crop = narrow ? '230 233 1340 320' : '224 117 1360 480';
    if (screen.getAttribute('viewBox') !== crop) screen.setAttribute('viewBox', crop);
    wires.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    function port(el, edge) {
      const b = el.getBoundingClientRect();
      const x = b.x - box.x, y = b.y - box.y;
      if (edge === 'left') return [x - 3, y + b.height/2];
      if (edge === 'right') return [x + b.width + 3, y + b.height/2];
      if (edge === 'top') return [x + b.width/2, y - 3];
      if (edge === 'bottom') return [x + b.width/2, y + b.height + 3];
      return [x + b.width/2, y + b.height/2];
    }
    const icon = i => buttons[i].querySelector('svg');
    const out = port(get('.el-exit-port'));
    const back = port(get('.el-return-port'));
    const note = port(icon(1), narrow ? 'top' : 'left');
    const runOut = port(buttons[2], 'bottom'), testIn = port(icon(3), 'top');
    const reviewOut = port(icon(4), 'left');
    const runPath = [port(icon(1), 'right'), port(icon(2), 'left')];
    const reviewPath = [port(icon(3), 'left'), port(icon(4), 'right')];
    const midX = (out[0] + note[0])/2;
    const belowEditor = get('.el-editor').getBoundingClientRect().bottom - box.y + 6;
    const rail = narrow ? 8 : back[0] + (reviewOut[0] - back[0]) * .32;
    const linked = [
      narrow ? [out, [box.width-4,out[1]], [box.width-4,belowEditor], [note[0],belowEditor], note] : [out, [midX,out[1]], [midX,note[1]], note],
      runPath, [runOut,testIn], reviewPath,
      [reviewOut, [rail,reviewOut[1]], [rail,back[1]], back]
    ];
    paths.forEach((path,i) => path.setAttribute('d', roundRoute(linked[i])));
    draw();
  }

  function draw() {
    const i = Math.min(stages.length - 1, starts.findLastIndex(time => elapsed >= time));
    const p = Math.min(1, (elapsed - starts[i]) / stages[i].duration);
    const motion = Math.max(0, Math.min(1, (p - .21)/.76));
    const travel = motion * motion * (3 - 2*motion);
    if (i !== stageIndex) {
      stageIndex = i;
      buttons.forEach((button,index) => button.setAttribute('aria-pressed', String(i === index)));
      paths.forEach((path,index) => path.classList.toggle('el-current', i === index));
      caption.textContent = stages[i].detail;
      board.dataset.phase = String(i);
    }
    board.style.setProperty('--el-underline', i ? 1 : Math.min(1,.12 + p*3));
    board.style.setProperty('--el-draw', i === 3 ? Math.min(1, .24 + p*1.6) : 1);
    board.style.setProperty('--el-lift', i === 1 ? String(Math.sin(p*Math.PI)) : '0');
    board.classList.toggle('el-arrived', i === 4 && motion > .93);
    const d = paths[i].getAttribute('d');
    if (!d) return;
    if (flight.getAttribute('d') !== d) flight.setAttribute('d',d);
    flight.style.strokeDasharray = travel + ' 1';
    const point = paths[i].getPointAtLength(paths[i].getTotalLength() * travel);
    traveler.setAttribute('transform', `translate(${point.x} ${point.y})`);
  }

  function tick(now) {
    frame = 0;
    if (previousTime !== null) elapsed = Math.min(duration, elapsed + now - previousTime);
    previousTime = now;
    draw();
    if (elapsed === duration) playing = false;
    sync();
  }

  function sync() {
    const active = playing && visible && !document.hidden && !previewOpen;
    if (active && !frame) frame = requestAnimationFrame(tick);
    if (!active) {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
    }
    const label = playing ? 'Pause' : elapsed > 0 && elapsed < duration ? 'Resume' : 'Play';
    if (play.textContent !== label) play.textContent = label;
  }

  function replay() {
    caption.setAttribute('aria-live', 'off');
    elapsed = 0;
    previousTime = null;
    playing = true;
    draw();
    sync();
  }
  play.addEventListener('click', () => {
    if (elapsed === duration) return replay();
    playing = !playing;
    if (playing) caption.setAttribute('aria-live', 'off');
    sync();
  });
  get('[data-replay]').addEventListener('click', replay);
  buttons.forEach((button,i) => button.addEventListener('click', () => {
    if (i === stageIndex) return;
    caption.setAttribute('aria-live', 'polite');
    elapsed = starts[i] + stages[i].duration * .22;
    playing = false;
    draw();
    sync();
  }));
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('eigenengine-source-preview', ({detail}) => { previewOpen = detail.open; sync(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .3;
    sync();
  }, { threshold:[0,.3], rootMargin:'-52px 0px 0px' }).observe(board);
  new ResizeObserver(measure).observe(board);
  document.fonts?.ready.then(measure);
  measure();
  sync();
})();
