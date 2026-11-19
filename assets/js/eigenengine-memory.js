(() => {
  'use strict';

  const mount = document.querySelector('#ee-memory-map');
  if (!mount || mount.dataset.ready === 'true') return;
  mount.dataset.ready = 'true';

  const paper = '/demo/view/?asset=cost-paper';
  const version = 'e9c6dabb85d252a81c6e27fc575e7c1bb3e7a90973533fe6b6b3c09c98b9fb98';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const topics = [
    { name: 'Representation', children: ['Distinctions', 'Notation', 'Constraints'], x: 155, y: 150 },
    { name: 'Refinement', children: ['Registers', 'Figure 3', 'Composition'], x: 425, y: 150 },
    { name: 'Rank and use', children: ['Cost constraint', 'Rank ensemble', 'Usage figures'], x: 155, y: 298 },
    { name: 'Erasure', children: ['Setup', 'Reset', 'Heat'], x: 425, y: 298 },
  ];
  const phases = [
    { label: 'Keep the sources', at: 0 },
    { label: 'Build the map', at: 1350 },
    { label: 'Check access', at: 3600 },
    { label: 'Follow the question', at: 5300 },
    { label: 'Return evidence', at: 10850 },
  ];
  const duration = 11500;
  const occupation = 2;
  const figure3 = 17;
  const witness = 30;
  const relatedFigure = 34;
  const seeds = { paper: 28, figures: 32 };
  let seed = 21;

  function wobble() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const records = topics.flatMap((topic, group) => topic.children.flatMap((_, family) =>
    Array.from({ length: 4 }, (_, index) => {
      const column = family * 4 + index;
      const around = Math.PI * index / 2 + family * 0.6;
      const hub = topic.x - 62 + family * 62;
      const ring = 9 + 8 * wobble();
      return {
        id: group * 12 + column,
        group,
        family,
        figure: family === 2 || (group === 1 && family === 1),
        list: [194 + 29 * column, 109 + 72 * group],
        map: [hub + Math.cos(around) * ring, topic.y + 5 + Math.sin(around) * ring * 0.8],
        detail: group === occupation
          ? [182 + 141 * family + (index % 2) * 61, 163 + Math.floor(index / 2) * 94]
          : [55 + 9 * (column % 4), 143 + 69 * group + 6 * Math.floor(column / 4)],
      };
    })
  ));

  const links = [];
  topics.forEach((_, group) => {
    for (let family = 0; family < 3; family += 1) {
      const offset = group * 12 + family * 4;
      links.push(
        [offset, offset + 1], [offset, offset + 2], [offset + 1, offset + 3],
        [offset + 2, offset + 3], [offset, offset + 3],
      );
      if (family < 2) links.push([offset + 3, offset + 4]);
    }
  });
  links.push([3, 15], [21, 25], [33, 40], [23, 45]);
  const adjacency = records.map(() => []);
  links.forEach(([left, right]) => {
    adjacency[left].push(right);
    adjacency[right].push(left);
  });

  const state = { role: 'paper', time: 0, frame: null, priorTime: null, phase: -1, engaged: false };
  const observed = new Set();
  let diffusion = [];
  let priorPhase = -1;

  mount.innerHTML = `
    <div class="ee-memory__query">
      <span>The question</span>
      <p>What pattern does the paper predict for common and rare symbols?</p>
    </div>
    <div class="ee-memory__toolbar">
      <div class="ee-memory__stops" role="group" aria-label="Follow the answer">
        ${phases.map(({ label }, i) => `<button type="button" data-phase="${i}" aria-pressed="${i === 0}">${label}</button>`).join('')}
      </div>
      <button class="ee-memory__play" type="button" data-play>Play</button>
    </div>
    <div class="ee-memory__body">
      <div class="ee-memory__scene">
        <svg class="ee-memory__graph" viewBox="0 0 760 406" role="img" aria-label="Passages from The Cost of Complexity gather into topics. The question follows the rank-and-use section and returns the rank ensemble passage.">
          <defs>
            <pattern id="ee-memory-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle r=".7" cx="3" cy="3" fill="#7598b3" opacity=".33"></circle>
            </pattern>
            <radialGradient id="ee-memory-field" cx="53%" cy="51%" r="57%">
              <stop offset="0" stop-color="#1c3c57" stop-opacity=".9"></stop>
              <stop offset="1" stop-color="#122638" stop-opacity="0"></stop>
            </radialGradient>
          </defs>
          <rect width="760" height="406" fill="url(#ee-memory-field)"></rect>
          <rect width="760" height="406" fill="url(#ee-memory-grid)"></rect>
          <g class="ee-memory__paper-shell">
            <rect x="23" y="31" width="551" height="348" rx="18"></rect>
            <path d="M48 72H549"></path>
            <text x="48" y="58">The Cost of Complexity</text>
          </g>
          <g data-layer="panels"></g>
          <g data-layer="edges"></g>
          <g data-layer="flows"></g>
          <g data-layer="nodes"></g>
          <g class="ee-memory__paper-legend" aria-hidden="true">
            <text x="48" y="398">PUBLIC PAPER</text>
            <text x="573" y="398" text-anchor="end">RETAINED EXCERPTS</text>
          </g>
          <g class="ee-memory__scope-box" aria-hidden="true">
            <rect x="594" y="31" width="142" height="348" rx="18"></rect>
            <path d="M657 171v-18a9 9 0 0 1 18 0v18m-24-1h30v24h-30z"></path>
            <text x="666" y="231" text-anchor="middle">Outside</text>
            <text x="666" y="254" text-anchor="middle">scope</text>
          </g>
        </svg>
        <div class="ee-memory__legend">
          <span><i></i> Groups contain passages</span>
          <span><i></i> Links join similar passages</span>
          <span><i></i> Weight spreads here</span>
          <strong class="ee-memory__reused" data-reused hidden>Same map and PDF edition</strong>
        </div>
      </div>
      <aside class="ee-memory__read" aria-label="Question and evidence">
        <div class="ee-memory__permission">
          <span>Agent access</span>
          <div role="group" aria-label="Example agent access">
            <button type="button" data-role="paper" aria-pressed="true">Public paper</button>
            <button type="button" data-role="figures" aria-pressed="false">Figures only</button>
          </div>
          <p class="ee-memory__access-note" data-access-note aria-live="polite">The agent can read sections and figures.</p>
        </div>
        <div class="ee-memory__readout" aria-live="polite"></div>
      </aside>
    </div>
    <div class="ee-memory__related">
      <span class="ee-memory__item-icon" aria-hidden="true">▤</span>
      <div><strong>Figure 3 · Area pricing</strong><p>The area-pricing claim sits in the Refinement group. This question follows the Rank and use group.</p></div>
      <a href="#how">Inspect the Figure 3 envelope <span aria-hidden="true">↑</span></a>
    </div>
    <details class="ee-memory__mechanism">
      <summary>What the map preserves</summary>
      <dl>
        <div><dt>Persistence</dt><dd>The same passage identifiers survive grouping and repeated questions. Figure 3 remains attached to the refinement claim and its original source.</dd></div>
        <div><dt>Permission</dt><dd>This example fixes the agent’s read scope before spreading weight. Try both access settings to see what can be returned.</dd></div>
        <div><dt>Provenance</dt><dd>The returned passage names its page, equation and the SHA-256 fingerprint of the published PDF.</dd></div>
      </dl>
      <p>The gold marks show a small illustrative diffusion over links between similar passages. Evidence and containment are separate relationships on those same records. The research memory uses source diffusion to build its graded index. Atlas’s text retrieval applies compiled conditions and descends within bounds. Dynamic Memory propagates conditional filters on structured records.</p>
    </details>
  `;

  const $ = selector => mount.querySelector(selector);
  const stage = $('.ee-memory__graph');
  const playButton = $('[data-play]');
  const readout = $('.ee-memory__readout');
  const layers = Object.fromEntries([...stage.querySelectorAll('[data-layer]')].map(layer => [layer.dataset.layer, layer]));
  const steps = [...mount.querySelectorAll('[data-phase]')];
  const roles = [...mount.querySelectorAll('[data-role]')];

  function svg(tag, parent, attrs = {}, label = '') {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([name, value]) => node.setAttribute(name, value));
    if (label) node.textContent = label;
    parent.append(node);
    return node;
  }

  const catalogueLabels = topics.map((topic, index) =>
    svg('text', layers.panels, { class: 'ee-memory__list-label', x: 49, y: 115 + index * 72 }, topic.name)
  );
  const groups = topics.map((topic, index) => {
    const layer = svg('g', layers.panels, { class: 'ee-memory__group', 'data-origin': index });
    svg('rect', layer, { x: topic.x - 107, y: topic.y - 54, width: 214, height: 107, rx: 13 });
    svg('text', layer, { x: topic.x - 91, y: topic.y - 30 }, topic.name);
    return layer;
  });
  const sections = svg('g', layers.panels, { class: 'ee-memory__sections' });
  svg('rect', sections, { x: 110, y: 95, width: 442, height: 259, rx: 16 });
  svg('text', sections, { x: 129, y: 125 }, 'Rank and use');
  topics[occupation].children.forEach((label, i) => {
    svg('rect', sections, { x: 139 + 141 * i, y: 139, width: 126, height: 191, rx: 10, class: 'ee-memory__subgroup', 'data-family': i });
    svg('text', sections, { x: 202 + 141 * i, y: 305, 'text-anchor': 'middle', class: 'ee-memory__sub-title' }, label);
  });
  const figureLabel = svg('text', layers.panels, { x: 425, y: 189, class: 'ee-memory__figure-label', 'text-anchor': 'middle' }, '▤ Figure 3');
  const edgeNodes = links.map(() => svg('line', layers.edges));
  const flows = links.filter(([a, b]) => records[a].group === occupation && records[b].group === occupation)
    .flatMap(([a, b]) => [[a, b], [b, a]])
    .map(([from, to]) => ({ from, to, dot: svg('circle', layers.flows, { r: 2.8, class: 'ee-memory__flow' }) }));
  const dots = records.map(record => {
    const wrap = svg('g', layers.nodes, { class: 'ee-memory__node', 'data-record': record.id });
    const card = svg('rect', wrap, { x: -7.5, y: -9, width: 15, height: 18, rx: 2, class: 'ee-memory__doc' });
    const point = svg('circle', wrap, { r: 4.5, class: 'ee-memory__dot' });
    const signal = svg('circle', wrap, { r: 17, class: 'ee-memory__signal' });
    return { wrap, card, point, signal };
  });
  const receipt = svg('g', layers.nodes, { class: 'ee-memory__return-mark' });
  svg('circle', receipt, { r: 16, class: 'ee-memory__return-ring' });
  svg('circle', receipt, { r: 7, class: 'ee-memory__return-core' });
  const receiptTitle = svg('text', receipt, { x: 0, y: -23, 'text-anchor': 'middle' });

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mix = (from, to, t) => from + (to - from) * t;
  const smooth = t => clamp(t) ** 2 * (3 - 2 * clamp(t));
  const admitted = item => state.role === 'paper' || item.figure;
  const inPass = item => item.group === occupation && admitted(item);

  function makeDiffusion() {
    const initial = records.map(row => row.id === seeds[state.role] ? 1 : 0);
    const frames = [initial];
    for (let round = 0; round < 5; round += 1) {
      const before = frames.at(-1);
      const next = before.map(mass => mass * 0.48);
      before.forEach((mass, id) => {
        if (!mass) return;
        const neighbours = adjacency[id].filter(other => inPass(records[other]));
        if (!neighbours.length) next[id] += mass * 0.52;
        else neighbours.forEach(other => { next[other] += mass * 0.52 / neighbours.length; });
      });
      frames.push(next);
    }
    return frames;
  }

  function draw(time) {
    const fold = smooth((time - 1390) / 1540);
    const focus = smooth((time - 5640) / 1660);
    const scoped = time >= phases[2].at;
    const t = clamp((time - 7150) / 730, 0, 5);
    const iteration = Math.min(4, Math.floor(t));
    const before = diffusion[iteration];
    const after = diffusion[iteration + 1];
    const progress = t - iteration;
    const mass = before.map((amount, index) => mix(amount, after[index], progress));
    const positions = records.map(({ list, map, detail }) =>
      list.map((value, axis) => mix(mix(value, map[axis], fold), detail[axis], focus))
    );

    catalogueLabels.forEach(label => label.setAttribute('opacity', 1 - fold));
    groups.forEach((group, index) => {
      group.setAttribute('opacity', fold * (1 - focus));
      group.classList.toggle('is-chosen', stage.dataset.phase === '3' && index === occupation);
    });
    sections.setAttribute('opacity', focus);
    figureLabel.setAttribute('opacity', fold * (1 - focus));
    stage.classList.toggle('is-scoped', scoped);

    dots.forEach(({ wrap, card, point, signal }, index) => {
      const [x, y] = positions[index];
      const row = records[index];
      const kept = smooth((time - (index % 12) * 35) / 450);
      const inFocus = row.group === occupation;
      const allowed = !scoped || admitted(row);
      const strength = time >= 7150 && inPass(row) ? Math.sqrt(mass[index]) : 0;
      wrap.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      wrap.setAttribute('opacity', allowed ? (inFocus ? 1 : mix(1, 0.32, focus)) : 0.08);
      wrap.classList.toggle('is-figure', index === figure3 && allowed);
      card.setAttribute('opacity', (1 - fold) * (0.40 + kept * 0.60));
      point.setAttribute('opacity', fold * (0.52 + strength * 0.48));
      point.setAttribute('r', fold * 4.5 + strength * 8);
      signal.setAttribute('opacity', strength * 0.72);
      signal.setAttribute('r', 13 + strength * 24);
    });

    edgeNodes.forEach((line, index) => {
      const [left, right] = links[index];
      const [a, b] = [positions[left], positions[right]];
      const pass = inPass(records[left]) && inPass(records[right]);
      const inScope = !scoped || (admitted(records[left]) && admitted(records[right]));
      const lit = time >= 7250 && pass;
      const possible = inScope ? fold * (pass ? 1 : mix(1, 0.16, focus)) : 0.02;
      const weight = lit ? Math.sqrt(mass[left] * mass[right]) * 7 : 0;
      line.setAttribute('x1', a[0]);
      line.setAttribute('y1', a[1]);
      line.setAttribute('x2', b[0]);
      line.setAttribute('y2', b[1]);
      line.setAttribute('opacity', possible * (0.28 + Math.min(0.72, weight)));
      line.classList.toggle('is-lit', lit && weight > 0.06);
    });

    flows.forEach(({ from, to, dot }) => {
      const strength = inPass(records[from]) && inPass(records[to]) ? Math.sqrt(before[from]) : 0;
      const [a, b] = [positions[from], positions[to]];
      dot.setAttribute('opacity', time > 7150 ? strength * 1.9 * Math.sin(progress * Math.PI) : 0);
      dot.setAttribute('cx', mix(a[0], b[0], progress));
      dot.setAttribute('cy', mix(a[1], b[1], progress));
    });
    const round = $('[data-round]');
    if (round) {
      const label = time < 7150 ? 'Preparing the route' : `Illustrative diffusion · round ${Math.ceil(t)} of 5`;
      if (round.textContent !== label) round.textContent = label;
    }

    const trace = state.role === 'paper' ? witness : relatedFigure;
    receipt.setAttribute('transform', `translate(${positions[trace].join(',')})`);
    receipt.setAttribute('opacity', smooth((time - 10700) / 450));
    receipt.classList.toggle('is-context', state.role === 'figures');
    receiptTitle.textContent = state.role === 'paper' ? 'Equation 46' : 'Figure 6';
  }

  function body(phase) {
    const full = state.role === 'paper';
    const versionLabel = `<code title="SHA-256: ${version}">${version.slice(0, 12)}…</code>`;
    if (phase === 0) return `<h3>Start with the original</h3><p>The published paper is the record. Its retained passages have their own addresses.</p><p class="ee-memory__detail">Edition fingerprint · ${versionLabel}</p>`;
    if (phase === 1) return '<h3>Keep the same passages</h3><p>The cards gather into topics. Each topic opens into smaller groups of passages.</p><p class="ee-memory__detail">Figure 3 keeps its place inside Refinement.</p>';
    if (phase === 2) return '<h3>Set the read scope</h3><p>Check access before opening a passage. This read can return one supporting passage.</p><p class="ee-memory__detail">A separate collection stays closed.</p>';
    if (phase === 3) return `<h3>Follow the question</h3><p>“Common and rare” points to Rank and use. Weight spreads along links between passages the agent can read.</p><ol class="ee-memory__path"><li>The Cost of Complexity</li><li>Rank and use</li><li>${full ? 'Rank ensemble' : 'Usage figures'}</li></ol><p class="ee-memory__detail" data-round aria-live="off"></p>`;

    const comparison = observed.size > 1
      ? '<div class="ee-memory__comparison"><strong>Same question and PDF edition</strong><p>Public paper · 1 original passage<br>Figures only · 0 original passages</p></div>'
      : '';
    if (!full) {
      return `<h3>Figure 6 gives context</h3><p>The figure plots examples. The section text carries the general formula, so this read returns no supporting passage.</p><p class="ee-memory__detail">Public paper · Figure 6, p. 14 · ${versionLabel}</p><a href="${paper}&amp;page=14">Open Figure 6 in the public PDF <span aria-hidden="true">↗</span></a>${comparison}<button type="button" data-repeat>Repeat question</button>`;
    }
    return `<h3>A power law</h3>
      <p>Frequency falls as a power of rank, the symbol’s position when listed from most to least common.</p>
      <p class="ee-memory__formula" aria-label="p of r given lambda equals r to the minus lambda divided by Z sub R of lambda">p(r | λ) = r<sup>−λ</sup> / Z<sub>R</sub>(λ)</p>
      <p>For a finite list of symbols, this is the maximum-entropy distribution when the average logarithm of rank is set.</p>
      <blockquote>“the exponential in cost becomes a power law in rank.”</blockquote>
      <dl class="ee-memory__receipt"><div><dt>Delivered</dt><dd>One original passage</dd></div><div><dt>PDF edition</dt><dd>${versionLabel}</dd></div></dl>
      <a href="${paper}&amp;page=13">Open page 13, Equation 46 <span aria-hidden="true">↗</span></a>${comparison}<button type="button" data-repeat>Repeat question</button>`;
  }

  function render(time) {
    state.time = clamp(time, 0, duration);
    state.phase = phases.findLastIndex(({ at }) => state.time >= at);
    if (priorPhase !== state.phase) {
      steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.phase)));
      priorPhase = state.phase;
      if (state.phase === 4) observed.add(state.role);
      readout.innerHTML = body(state.phase);
      stage.dataset.phase = state.phase;
      stage.setAttribute('aria-label', phases[state.phase].label + '. Public paper: Representation, Refinement, Rank and use, and Erasure.');
    }
    draw(state.time);
  }

  function stop() {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null;
    state.priorTime = null;
    playButton.textContent = state.time >= duration ? 'Replay' : state.time ? 'Resume' : 'Play';
  }

  function tick(now) {
    const elapsed = state.priorTime === null ? 0 : now - state.priorTime;
    state.priorTime = now;
    render(state.time + elapsed);
    if (state.time >= duration) {
      stop();
      return;
    }
    state.frame = requestAnimationFrame(tick);
  }

  function play() {
    stop();
    if (reduced.matches) {
      render(duration);
      stop();
      return;
    }
    if (state.time >= duration) {
      $('[data-reused]').hidden = true;
      render(0);
    }
    playButton.textContent = 'Pause';
    state.frame = requestAnimationFrame(tick);
  }

  function switchRole(role) {
    if (role === state.role) return;
    state.role = role;
    mount.dataset.role = role;
    roles.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === role)));
    $('[data-access-note]').textContent = role === 'paper'
      ? 'The agent can read sections and figures.'
      : 'The agent can read figures. Section text stays closed.';
    diffusion = makeDiffusion();
    priorPhase = -1;
    repeat();
  }

  function repeat() {
    $('[data-reused]').hidden = false;
    stop();
    render(phases[2].at);
    play();
  }

  const stoppedFrames = [1050, 3240, 4730, 9320, duration];
  mount.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    state.engaged = true;
    if (button.hasAttribute('data-play')) {
      if (state.frame === null) play();
      else stop();
    } else if (button.hasAttribute('data-phase')) {
      stop();
      const phase = Number(button.dataset.phase);
      if (phase < 2) $('[data-reused]').hidden = true;
      render(stoppedFrames[phase]);
      stop();
      if (phase === phases.length - 1) {
        const result = $('.ee-memory__readout h3');
        if (result) {
          const bounds = result.getBoundingClientRect();
          if (bounds.top < 85 || bounds.bottom > innerHeight - 60) {
            result.scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
          }
        }
      }
    } else if (button.hasAttribute('data-repeat')) {
      repeat();
      playButton.focus({ preventScroll: true });
    } else if (button.hasAttribute('data-role')) {
      switchRole(button.dataset.role);
    }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches && state.frame !== null) {
      render(duration);
      stop();
    }
  });

  mount.dataset.role = state.role;
  diffusion = makeDiffusion();
  render(0);
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (!state.engaged && !reduced.matches) play();
    }, { threshold: 0.32 });
    observer.observe(stage);
  }
})();
