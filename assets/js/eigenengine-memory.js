(() => {
  'use strict';

  const mount = document.querySelector('#ee-memory-map');
  if (!mount || mount.dataset.ready === 'true') return;
  mount.dataset.ready = 'true';

  const paper = '/demo/view/?asset=cost-paper';
  const version = 'e9c6dabb85d252a81c6e27fc575e7c1bb3e7a90973533fe6b6b3c09c98b9fb98';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 540px)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const topics = [
    { name: 'Representation', children: ['Records', 'Terms', 'Limits'], x: 82, weights: [4, 3, 2] },
    { name: 'Refinement', children: ['Sizes', 'Fig. 3', 'Rules'], x: 226, weights: [3, 4, 2] },
    { name: 'Rank and use', children: ['Cost', 'Ranks', 'Plots'], x: 370, weights: [1, 13, 2] },
    { name: 'Erasure', children: ['Setup', 'Reset', 'Heat'], x: 514, weights: [3, 3, 2] },
  ];
  const phases = [
    { label: 'Keep the sources', scene: 'Original passage cards', at: 0 },
    { label: 'Build the map', scene: 'A tree of smaller graphs', at: 1950 },
    { label: 'Check access', scene: 'Read scope', at: 5200 },
    { label: 'Follow the question', scene: 'Resolve the tree', at: 7700 },
    { label: 'Return evidence', scene: 'Return the evidence', at: 16600 },
  ];
  const duration = 17600;
  const resolutionAt = phases[3].at;
  const tierTime = 1100;
  const spreadAt = resolutionAt + 3 * tierTime;
  const spreadRound = 1050;
  const reducedFrames = [
    [0, 140], [1120, 1700], [2540, 4240], [5200, 7210],
    [7700, 7700], [8800, 8800], [9900, 9900], [11000, 11000],
    [12050, 12050], [13100, 13100], [14150, 14150], [15200, 15200],
    [16250, 16250], [16600, duration],
  ];
  const occupation = 2;
  const figure3 = 17;
  const leafBase = 17;
  const topicId = group => 1 + group;
  const familyId = (group, family) => 5 + group * 3 + family;
  const leafId = index => leafBase + index;
  const familyX = (topic, family) => topic.x - 42 + family * 42;

  const records = topics.flatMap((topic, group) => topic.children.flatMap((_, family) =>
    Array.from({ length: 4 }, (_, index) => ({
      id: group * 12 + family * 4 + index,
      group,
      family,
      index,
      figure: family === 2 || (group === 1 && family === 1),
      list: [213 + 27 * (family * 4 + index), 109 + 72 * group],
      map: [familyX(topic, family) + (index % 2 ? 10 : -10), index < 2 ? 278 : 311],
    }))
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

  const state = {
    role: 'paper', time: 0, frame: null, priorTime: null, phase: -1,
    visible: false, begun: false, playing: false, full: !reduced.matches,
    drawn: -1, fading: null,
  };
  const observed = new Set();
  let diffusion;
  let priorPhase = -1;

  mount.innerHTML = `
    <div class="ee-memory__exhibit">
    <div class="ee-memory__query">
      <span>The question</span>
      <p>What pattern links common and rare symbols?</p>
    </div>
    <div class="ee-memory__toolbar">
      <div class="ee-memory__stops" role="group" aria-label="Follow the answer">
        ${phases.map(({ label }, i) => `<button type="button" data-phase="${i}" aria-pressed="${i === 0}">${label}</button>`).join('')}
      </div>
      <div class="ee-memory__mobile-steps">
        <select data-phase-select aria-label="Animation step">
          ${phases.map(({ label }, i) => `<option value="${i}">${label}</option>`).join('')}
        </select>
      </div>
      <div class="ee-memory__transport" role="group" aria-label="Animation controls">
        <button class="ee-memory__play" type="button" data-play>Play</button>
        <button type="button" data-replay>Restart</button>
        <button type="button" data-motion hidden>Play full motion</button>
      </div>
    </div>
    <div class="ee-memory__body">
      <div class="ee-memory__scene">
        <div class="ee-memory__scene-caption">
          <strong data-scene-title>Read the passage cards</strong>
          <span class="ee-memory__scene-meta"><span data-scene-note>Original text · one published edition</span>
            <a data-see-evidence href="#ee-memory-evidence" hidden>Read evidence ↓</a></span>
        </div>
        <div class="ee-memory__canvas">
        <svg class="ee-memory__graph" viewBox="0 0 760 406" role="img" aria-label="Passages from The Cost of Complexity gather into topics. The question follows the rank-and-use section and returns the rank ensemble passage.">
          <defs>
            <pattern id="ee-memory-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle r=".7" cx="3" cy="3" fill="#7598b3" opacity=".33"></circle>
            </pattern>
            <radialGradient id="ee-memory-field" cx="53%" cy="51%" r="57%">
              <stop offset="0" stop-color="#1c3c57" stop-opacity=".9"></stop>
              <stop offset="1" stop-color="#122638" stop-opacity="0"></stop>
            </radialGradient>
            <linearGradient id="ee-memory-scan">
              <stop offset="0" stop-color="#e8ba75" stop-opacity="0"></stop>
              <stop offset="1" stop-color="#f6d496" stop-opacity=".42"></stop>
            </linearGradient>
          </defs>
          <rect width="760" height="406" fill="url(#ee-memory-field)"></rect>
          <rect width="760" height="406" fill="url(#ee-memory-grid)"></rect>
          <g class="ee-memory__paper-shell">
            <rect x="23" y="31" width="551" height="348" rx="18"></rect>
            <path d="M48 72H549"></path>
            <text x="48" y="58">The Cost of Complexity</text>
          </g>
          <g data-layer="panels"></g>
          <g data-layer="scan"></g>
          <g data-layer="edges"></g>
          <g data-layer="gate"></g>
          <g data-layer="flows"></g>
          <g data-layer="nodes"></g>
          <g class="ee-memory__paper-legend" aria-hidden="true">
            <text x="48" y="398">PUBLIC PAPER</text>
            <text x="573" y="398" text-anchor="end">RETAINED EXCERPTS</text>
          </g>
          <g class="ee-memory__aside-paths" aria-hidden="true">
            <g class="ee-memory__earlier-box">
              <rect x="594" y="31" width="142" height="158" rx="16"></rect>
              <path d="M651 88h25m-25 8h25m-25 8h16m17-18v20"></path>
              <text x="666" y="140" text-anchor="middle">Earlier edition</text>
              <text x="666" y="160" text-anchor="middle" class="ee-memory__aside-note">Retained history</text>
            </g>
            <g class="ee-memory__scope-box">
              <rect x="594" y="211" width="142" height="168" rx="16"></rect>
              <path d="M657 269v-8a9 9 0 0 1 18 0v8m-23 0h28v21h-28z"></path>
              <text x="666" y="324" text-anchor="middle">Outside scope</text>
              <text x="666" y="344" text-anchor="middle" class="ee-memory__aside-note">Access closed</text>
            </g>
          </g>
        </svg>
        </div>
        <div class="ee-memory__legend">
          <span><i></i> Tree branches</span>
          <span><i></i> Similarity links</span>
          <span><i></i> Query mass</span>
          <strong class="ee-memory__reused" data-reused hidden>Same map and PDF edition</strong>
        </div>
        <div class="ee-memory__boundary-note" data-boundary hidden>
          <span>Earlier edition · retained history</span><span>Outside scope · access closed</span>
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
        <div class="ee-memory__outcome" data-outcome aria-live="polite"></div>
      </aside>
    </div>
    </div>
    <details class="ee-memory__support" id="ee-memory-evidence">
      <summary>Open the supporting record</summary>
      <div class="ee-memory__readout"></div>
      <button class="ee-memory__mobile-motion" type="button" data-mobile-motion hidden>Play full motion</button>
    </details>
    <details class="ee-memory__mechanism">
      <summary>What the map preserves</summary>
      <p>Figure 3 belongs to the refinement branch. A different branch, Rank and use, carries the answer to this question. <a href="#how">Inspect the earlier claim</a>.</p>
      <dl>
        <div><dt>Persistence</dt><dd>The same passage identifiers survive grouping and repeated questions. Figure 3 remains attached to the refinement claim and its original source.</dd></div>
        <div><dt>Permission</dt><dd>This example fixes the agent’s read scope before spreading weight. Try both access settings to see what can be returned.</dd></div>
        <div><dt>Provenance</dt><dd>The returned passage names its page, equation and the SHA-256 fingerprint of the published PDF.</dd></div>
      </dl>
      <p>In this illustration, one unit of query mass is distributed across the admitted topics and then among their children. At passage level, every round keeps 48% and distributes 52% along weighted similarity links. The rings on parent groups sum the mass of their descendants. The example uses illustrative weights. The horizontal resolution line takes visual inspiration from <a href="https://arxiv.org/abs/2611.02955" target="_blank" rel="noopener">Garnier-Brun and colleagues, Figs. 1 and 4(a)</a>, whose paper studies reverse generative diffusion.</p>
    </details>
  `;

  const $ = selector => mount.querySelector(selector);
  const stage = $('.ee-memory__graph');
  const canvas = $('.ee-memory__canvas');
  const playButton = $('[data-play]');
  const motionButtons = [$('[data-motion]'), $('[data-mobile-motion]')];
  const readout = $('.ee-memory__readout');
  const outcome = $('[data-outcome]');
  const phaseSelect = $('[data-phase-select]');
  const support = $('#ee-memory-evidence');
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

  const treeNodes = [
    { id: 0, point: [298, 82], depth: 0, label: 'Paper' },
    ...topics.map((topic, group) => ({
      id: topicId(group), parent: 0, point: [topic.x, 145], depth: 1, group, label: topic.name,
    })),
    ...topics.flatMap((topic, group) => topic.children.map((label, family) => ({
      id: familyId(group, family), parent: topicId(group), point: [familyX(topic, family), 215],
      depth: 2, group, family, label,
    }))),
  ];
  const treeEdges = [
    ...treeNodes.slice(1).map(({ parent, id }) => [parent, id]),
    ...records.map(record => [familyId(record.group, record.family), leafId(record.id)]),
  ];
  const groups = topics.map((topic, group) => {
    const region = svg('g', layers.panels, { class: 'ee-memory__tree-group', 'data-topic': group });
    svg('rect', region, { x: topic.x - 63, y: 156, width: 126, height: 182, rx: 12 });
    const families = topic.children.map((_, family) =>
      svg('rect', region, { x: familyX(topic, family) - 17, y: 250, width: 34, height: 76, rx: 9, class: 'ee-memory__family-box' })
    );
    return { region, families };
  });

  const scanner = svg('g', layers.scan, { class: 'ee-memory__scanner' });
  svg('rect', scanner, { x: -64, y: 84, width: 64, height: 258, rx: 6, fill: 'url(#ee-memory-scan)' });
  svg('line', scanner, { x1: 0, x2: 0, y1: 84, y2: 342 });

  const front = svg('g', layers.scan, { class: 'ee-memory__front' });
  svg('rect', front, { x: 24, y: -12, width: 548, height: 24 });
  svg('path', front, { d: 'M29 0H568' });

  const branches = [
    { path: 'M538 70Q568 75 592 106', kind: 'retired', mark: [592, 106] },
    { path: 'M571 303Q581 301 588 293', kind: 'closed', mark: [588, 293] },
  ].map(branch => {
    const role = svg('g', layers.gate, { class: 'ee-memory__branch ee-memory__branch--' + branch.kind });
    const path = svg('path', role, { d: branch.path, pathLength: 1 });
    const sign = svg('path', role, { d: `M${branch.mark[0]} ${branch.mark[1] - 7}v14` });
    return { role, path, sign };
  });

  const ancestry = treeEdges.map(() => svg('path', layers.edges, { class: 'ee-memory__ancestry' }));
  const edgeNodes = links.map(() => svg('path', layers.edges, { class: 'ee-memory__similarity' }));
  const levelNodes = treeNodes.map(node => {
    const wrap = svg('g', layers.nodes, { class: 'ee-memory__level', 'data-level': node.depth, 'data-group': node.group ?? '' });
    const ring = svg('circle', wrap, { class: 'ee-memory__level-mass' });
    const point = svg('circle', wrap, { r: [7.8, 6.9, 4.6][node.depth], class: 'ee-memory__level-point' });
    const offset = node.depth === 2 ? 18 : -13;
    const label = svg('text', wrap, {
      x: node.depth === 0 ? 14 : 0,
      y: node.depth === 0 ? 5 : offset,
      'text-anchor': node.depth === 0 ? 'start' : 'middle',
    }, node.label);
    return { wrap, ring, point, label };
  });

  const dots = records.map(record => {
    const wrap = svg('g', layers.nodes, { class: 'ee-memory__node', 'data-record': record.id });
    const card = svg('g', wrap, { class: 'ee-memory__card' });
    svg('rect', card, { x: -9, y: -12, width: 18, height: 24, rx: 2, class: 'ee-memory__doc' });
    svg('path', card, { d: 'M-5 -5H5 M-5 0H5 M-5 5H3', class: 'ee-memory__doc-lines' });
    const signal = svg('circle', wrap, { class: 'ee-memory__signal' });
    const point = svg('circle', wrap, { r: 3.6, class: 'ee-memory__dot' });
    return { wrap, card, point, signal };
  });

  const motionDots = Array.from({ length: links.length * 2 + treeEdges.length }, () =>
    svg('circle', layers.flows, { r: 2.35, class: 'ee-memory__flow', opacity: 0 })
  );
  let drawnFlows = 0;

  const receipt = svg('g', layers.nodes, { class: 'ee-memory__return-mark' });
  svg('circle', receipt, { r: 13, class: 'ee-memory__return-ring' });
  svg('circle', receipt, { r: 5, class: 'ee-memory__return-core' });
  const receiptLine = svg('path', receipt, { class: 'ee-memory__receipt-line' });
  const receiptTitle = svg('text', receipt, { x: 0, y: 25, 'text-anchor': 'middle' });

  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  const mix = (from, to, t) => from + (to - from) * t;
  const smooth = t => clamp(t) ** 2 * (3 - 2 * clamp(t));
  const admitted = item => state.role === 'paper' || item.figure;
  const familyAllowed = (group, family) => admitted(records[group * 12 + family * 4]);
  const nodeCount = leafBase + records.length;

  function makeDiffusion() {
    const weights = [
      topics.map((_, group) => ({ from: 0, to: topicId(group), weight: [16, 19, 54, 11][group] })),
      topics.flatMap((topic, group) => topic.weights.flatMap((weight, family) =>
        familyAllowed(group, family) ? [{ from: topicId(group), to: familyId(group, family), weight }] : []
      )),
      records.filter(admitted).map(({ id, group, family, index }) => ({
        from: familyId(group, family), to: leafId(id),
        weight: group === occupation ? [9, 1, 2, 1][index] : 1,
      })),
    ];
    const initial = Array(nodeCount).fill(0);
    initial[0] = 1;
    const frames = [initial];
    const transfers = [];

    function distribute(edges, retain) {
      const prior = frames.at(-1);
      const next = prior.map(amount => amount * retain);
      const flow = [];
      const outgoing = Array.from({ length: nodeCount }, () => []);
      edges.forEach(edge => outgoing[edge.from].push(edge));
      prior.forEach((amount, node) => {
        if (!amount) return;
        const available = outgoing[node];
        if (!available.length) {
          next[node] += amount * (1 - retain);
          return;
        }
        const denominator = available.reduce((sum, edge) => sum + edge.weight, 0);
        available.forEach(({ from, to, weight }) => {
          const moved = amount * (1 - retain) * weight / denominator;
          next[to] += moved;
          flow.push({ from, to, moved });
        });
      });
      frames.push(next);
      transfers.push(flow);
    }

    weights.forEach(edges => distribute(edges, 0));
    const similarity = records.filter(admitted).flatMap(({ id }) => adjacency[id]
      .filter(index => admitted(records[index]))
      .map(index => ({ from: leafId(id), to: leafId(index), weight: index === 30 || index === 34 ? 4 : 1 }))
    );
    for (let round = 0; round < 5; round += 1) distribute(similarity, .48);

    const final = frames.at(-1);
    const winner = records.filter(admitted).reduce((best, row) =>
      final[leafId(row.id)] > final[leafId(best.id)] ? row : best
    );
    return { frames, transfers, winner };
  }

  function modelTime(time) {
    if (time < spreadAt) return clamp((time - resolutionAt) / tierTime, 0, 3);
    return 3 + clamp((time - spreadAt) / spreadRound, 0, 5);
  }

  function subtreeMass(mass) {
    const total = mass.slice(0, leafBase);
    records.forEach(row => { total[familyId(row.group, row.family)] += mass[leafId(row.id)]; });
    treeNodes.filter(node => node.depth === 2).forEach(node => { total[node.parent] += total[node.id]; });
    total[0] += topics.reduce((sum, _, group) => sum + total[topicId(group)], 0);
    return total;
  }

  function branchPath(from, to) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const bend = mix(y1, y2, .57);
    return `M${x1} ${y1}C${x1} ${bend} ${x2} ${bend} ${x2} ${y2}`;
  }

  function similarityPath(from, to, bridge) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    if (!bridge) return `M${x1} ${y1}L${x2} ${y2}`;
    const bend = Math.max(y1, y2) + 24;
    return `M${x1} ${y1}C${x1} ${bend} ${x2} ${bend} ${x2} ${y2}`;
  }

  function pointAlong(from, to, progress, branch, bridge) {
    if (!branch && !bridge) return from.map((value, i) => mix(value, to[i], progress));
    const middle = branch ? mix(from[1], to[1], .57) : Math.max(from[1], to[1]) + 24;
    const remaining = 1 - progress;
    return from.map((value, i) => (
      remaining ** 3 * value + 3 * remaining ** 2 * progress * (i ? middle : value) +
      3 * remaining * progress ** 2 * (i ? middle : to[i]) + progress ** 3 * to[i]
    ));
  }

  function draw(time) {
    const fold = smooth((time - 2040) / 2200);
    const scoped = time >= phases[2].at;
    const routing = time >= resolutionAt;
    const gate = smooth((time - phases[2].at) / 1050);
    const scan = clamp((time - 110) / 1420);
    const t = modelTime(time);
    const iteration = Math.min(7, Math.floor(t));
    const progress = t - iteration;
    const prior = diffusion.frames[iteration];
    const next = diffusion.frames[iteration + 1];
    const mass = prior.map((amount, index) => mix(amount, next[index], progress));
    const rolled = subtreeMass(mass);
    const positions = [
      ...treeNodes.map(node => node.point),
      ...records.map(({ list, map, id }) => {
        const movement = smooth((time - 2040 - (id % 12) * 37 - Math.floor(id / 12) * 63) / 1650);
        return list.map((value, axis) => mix(value, map[axis], movement));
      }),
    ];

    stage.dataset.resolution = String(t);
    stage.dataset.mass = mass.reduce((sum, amount) => sum + amount, 0).toFixed(9);
    stage.dataset.restrictedMass = records.reduce((sum, row) => sum + (admitted(row) ? 0 : mass[leafId(row.id)]), 0).toFixed(9);
    scanner.setAttribute('opacity', state.full ? Math.min(smooth(scan * 7), 1 - smooth((scan - .92) / .08)) : 0);
    scanner.setAttribute('transform', `translate(${mix(194, 528, scan)},0)`);
    catalogueLabels.forEach(label => label.setAttribute('opacity', 1 - smooth(fold / .43)));
    stage.classList.toggle('is-scoped', scoped);
    branches.forEach(({ role, path, sign }) => {
      role.setAttribute('opacity', gate);
      path.setAttribute('stroke-dasharray', gate < 1 ? `${gate} 1` : '');
      sign.setAttribute('opacity', smooth((gate - .76) / .24));
    });

    const frontier = t < 1 ? mix(86, 144, t) : t < 2 ? mix(144, 213, t - 1) : t < 3 ? mix(213, 290, t - 2) : 290;
    front.setAttribute('transform', `translate(0,${frontier})`);
    front.setAttribute('opacity', routing ? 1 - smooth((time - 16250) / 470) : 0);

    groups.forEach(({ region, families }, group) => {
      region.setAttribute('opacity', fold * (routing ? .55 + rolled[topicId(group)] * 1.2 : .7));
      region.classList.toggle('is-focussed', routing && group === occupation);
      families.forEach((panel, family) => {
        panel.classList.toggle('is-closed', scoped && !familyAllowed(group, family));
      });
    });

    ancestry.forEach((edge, index) => {
      const [from, to] = treeEdges[index];
      const target = treeNodes[to];
      const closed = scoped && (target?.depth === 2 ? !familyAllowed(target.group, target.family) : !target && !admitted(records[to - leafBase]));
      const signal = routing ? (to < leafBase ? rolled[to] : mass[to]) : 0;
      edge.setAttribute('d', branchPath(positions[from], positions[to]));
      edge.setAttribute('opacity', fold * (closed ? .13 : .51 + Math.min(.49, signal * 1.8)));
      edge.classList.toggle('is-closed', closed);
      edge.classList.toggle('is-lit', signal > .045);
    });

    edgeNodes.forEach((path, index) => {
      const [a, b] = links[index];
      const bridge = Math.floor(a / 4) !== Math.floor(b / 4);
      const closed = scoped && (!admitted(records[a]) || !admitted(records[b]));
      const lit = time >= spreadAt && !closed && (mass[leafId(a)] + mass[leafId(b)]) > .043;
      path.setAttribute('d', similarityPath(positions[leafId(a)], positions[leafId(b)], bridge));
      path.setAttribute('opacity', fold * (closed ? .075 : lit ? .9 : bridge ? .25 : .52));
      path.classList.toggle('is-lit', lit);
    });

    levelNodes.forEach(({ wrap, ring, point, label }, index) => {
      const node = treeNodes[index];
      const closed = scoped && node.depth === 2 && !familyAllowed(node.group, node.family);
      const weight = routing && !closed ? rolled[index] : 0;
      const shown = smooth((fold - .4) / .6);
      wrap.setAttribute('transform', `translate(${node.point.join(',')})`);
      wrap.setAttribute('opacity', closed ? shown * .29 : shown);
      wrap.classList.toggle('is-closed', closed);
      point.classList.toggle('has-mass', weight > .025);
      ring.setAttribute('r', 7 + 25 * Math.sqrt(weight));
      ring.setAttribute('opacity', Math.min(.8, weight * 2.8));
      if (node.depth === 2) label.textContent = closed ? 'Closed' : node.label;
    });

    dots.forEach(({ wrap, card, point, signal }, index) => {
      const [x, y] = positions[leafId(index)];
      const row = records[index];
      const scanned = scan >= (index % 12 + 1) / 13;
      const allowed = !scoped || admitted(row);
      const strength = routing && allowed ? Math.sqrt(mass[leafId(index)]) : 0;
      wrap.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      wrap.setAttribute('opacity', allowed ? 1 : .19);
      wrap.classList.toggle('is-figure', index === figure3 && allowed);
      wrap.classList.toggle('is-read', scanned && time < 2650);
      wrap.classList.toggle('is-closed', !allowed);
      card.setAttribute('opacity', (1 - fold) * (scanned ? 1 : .61));
      point.setAttribute('opacity', fold * (.76 + strength * .24));
      point.setAttribute('r', 3.6 + strength * 8);
      signal.setAttribute('opacity', Math.min(.81, strength * 1.9));
      signal.setAttribute('r', 5 + strength * 28);
    });

    const flows = routing && state.full ? diffusion.transfers[iteration].filter(({ moved }) => moved > .0013) : [];
    flows.forEach(({ from, to, moved }, index) => {
      const branch = from < leafBase;
      const bridge = !branch && Math.floor((from - leafBase) / 4) !== Math.floor((to - leafBase) / 4);
      const [x, y] = pointAlong(positions[from], positions[to], progress, branch, bridge);
      const dot = motionDots[index];
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('opacity', Math.min(1, Math.sqrt(moved) * 6) * Math.sin(progress * Math.PI));
    });
    for (let index = flows.length; index < drawnFlows; index += 1) motionDots[index].setAttribute('opacity', 0);
    drawnFlows = flows.length;

    const winner = diffusion.winner;
    const [x, y] = positions[leafId(winner.id)];
    const visibility = smooth((time - 16400) / 500);
    receipt.setAttribute('transform', `translate(${x},${y})`);
    receipt.setAttribute('opacity', visibility);
    receipt.classList.toggle('is-context', state.role === 'figures');
    receiptTitle.setAttribute('x', topics[winner.group].x - x);
    receiptTitle.setAttribute('y', 360 - y);
    receiptTitle.textContent = state.role === 'paper' ? 'Equation 46 · page 13' : 'Figure 6 · page 14';
    receiptLine.setAttribute('d', `M0 13L${topics[winner.group].x - x} ${342 - y}`);
    if (visibility === 1) {
      stage.dataset.winner = winner.id;
      stage.dataset.winnerMass = diffusion.frames.at(-1)[leafId(winner.id)].toFixed(9);
    } else {
      delete stage.dataset.winner;
      delete stage.dataset.winnerMass;
    }
    const round = $('[data-round]');
    if (round) {
      const label = t < 1 ? 'Across topics' : t < 2 ? 'Across smaller groups' : t < 3
        ? 'Into individual passages' : `Passage diffusion · round ${Math.max(1, Math.ceil(t - 3))} of 5`;
      if (round.textContent !== label) round.textContent = label;
    }
  }

  function compactOutcome(phase) {
    const full = state.role === 'paper';
    if (phase === 0) return '<strong>The published original</strong><p>Each card keeps its source address.</p>';
    if (phase === 1) return '<strong>Topics → groups → passages</strong><p>The same cards form the leaves of the tree.</p>';
    if (phase === 2) return full
      ? '<strong>Sections and figures admitted</strong><p>A separate collection stays closed.</p>'
      : '<strong>Only figures admitted</strong><p>Section text stays closed.</p>';
    if (phase === 3) return '<strong>One unit of query mass</strong><p>Gold shows its distribution over eligible branches.</p>';
    if (!full) return `<strong>Figure 6 · context only</strong><p>No original passage returned. <a href="${paper}&amp;page=14">Open page 14</a></p>`;
    return `<strong>A power law</strong><p class="ee-memory__compact-formula">p(r | λ) = r<sup>−λ</sup> / Z<sub>R</sub>(λ)</p><p><a href="${paper}&amp;page=13">Open the original · Eq. 46, p. 13</a></p>`;
  }

  function body(phase) {
    const full = state.role === 'paper';
    const versionLabel = `<code title="SHA-256: ${version}">${version.slice(0, 12)}…</code>`;
    if (phase === 0) return `<h3>Start with the original</h3><p>The published paper is the record. Its retained passages have their own addresses.</p><p class="ee-memory__detail">Edition fingerprint · ${versionLabel}</p>`;
    if (phase === 1) return '<h3>Keep the same passages</h3><p>The cards gather into topics. Each topic opens into smaller groups of passages.</p><p class="ee-memory__detail">Figure 3 keeps its place inside Refinement.</p>';
    if (phase === 2) return '<h3>Set the read scope</h3><p>Check access before opening a passage. This read can return one supporting passage.</p><p class="ee-memory__detail">A separate collection stays closed.</p>';
    if (phase === 3) return `<h3>Follow the question</h3><p>The question puts weight on several topics. It then reaches smaller groups and individual passages. Gold shows where the weight travels along links the agent can use.</p><ol class="ee-memory__path"><li>The Cost of Complexity</li><li>Rank and use</li><li>${full ? 'Rank ensemble' : 'Usage figures'}</li></ol><p class="ee-memory__detail" data-round aria-live="off"></p>`;

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

  function clearFade() {
    if (!state.fading) return;
    state.fading.animation.cancel();
    state.fading.cover.remove();
    state.fading = null;
  }

  function crossfade() {
    clearFade();
    if (!stage.animate) return;
    const cover = stage.cloneNode(true);
    cover.removeAttribute('role');
    cover.removeAttribute('aria-label');
    cover.removeAttribute('data-phase');
    cover.setAttribute('aria-hidden', 'true');
    cover.querySelector('defs')?.remove();
    cover.querySelectorAll('[data-record]').forEach(node => node.removeAttribute('data-record'));
    cover.classList.add('ee-memory__crossfade');
    canvas.append(cover);
    const animation = cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 310, easing: 'linear' });
    state.fading = { animation, cover };
    animation.onfinish = () => {
      if (state.fading?.cover === cover) clearFade();
    };
  }

  function render(time, playback = false) {
    state.time = clamp(time, 0, duration);
    state.phase = phases.findLastIndex(({ at }) => state.time >= at);
    if (priorPhase !== state.phase) {
      steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === state.phase)));
      phaseSelect.value = String(state.phase);
      priorPhase = state.phase;
      if (state.phase === 4) observed.add(state.role);
      outcome.innerHTML = compactOutcome(state.phase);
      readout.innerHTML = body(state.phase);
      stage.dataset.phase = state.phase;
      $('[data-scene-title]').textContent = phases[state.phase].scene;
      $('[data-boundary]').hidden = state.phase < 2;
      $('[data-see-evidence]').hidden = state.phase !== phases.length - 1;
      stage.setAttribute('aria-label', phases[state.phase].label + '. Public paper: Representation, Refinement, Rank and use, and Erasure.');
    }

    const scene = playback && !state.full
      ? reducedFrames.findLast(([at]) => state.time >= at)[1]
      : state.time;
    if (scene !== state.drawn) {
      if (playback && !state.full && state.drawn >= 0) crossfade();
      draw(scene);
      state.drawn = scene;
    }
    const scanned = Math.round(clamp((scene - 100) / 1450) * records.length);
    const level = modelTime(scene);
    const notes = [
      `${scanned} of ${records.length} cards retained`,
      'Same passages, finer groups',
      'History kept · scope checked',
      level < 1 ? 'Resolve the topics' : level < 2 ? 'Resolve their groups' : level < 3 ? 'Resolve individual passages' : `Diffusion · round ${Math.max(1, Math.ceil(level - 3))} of 5`,
      state.role === 'paper' ? 'Original · p. 13' : 'Context · p. 14',
    ];
    const note = $('[data-scene-note]');
    if (note.textContent !== notes[state.phase]) note.textContent = notes[state.phase];
  }

  function refreshControls() {
    playButton.textContent = state.playing ? 'Pause' : state.time >= duration ? 'Replay' : state.time ? 'Resume' : 'Play';
    motionButtons.forEach(button => {
      button.hidden = !reduced.matches;
      button.textContent = state.full ? 'Use reduced motion' : 'Play full motion';
    });
    mount.dataset.motion = state.full ? 'full' : 'reduced';
  }

  function suspend() {
    if (state.frame !== null) cancelAnimationFrame(state.frame);
    state.frame = null;
    state.priorTime = null;
  }

  function stop() {
    state.playing = false;
    suspend();
    refreshControls();
  }

  function tick(now) {
    if (!state.visible || document.hidden || !state.playing) {
      suspend();
      return;
    }
    const elapsed = state.priorTime === null ? 0 : Math.min(80, now - state.priorTime);
    state.priorTime = now;
    render(state.time + elapsed, true);
    if (state.time >= duration) {
      stop();
      return;
    }
    state.frame = requestAnimationFrame(tick);
  }

  function continueInView() {
    if (state.frame !== null || !state.playing || !state.visible || document.hidden) return;
    state.frame = requestAnimationFrame(tick);
  }

  function play() {
    state.begun = true;
    if (state.time >= duration) {
      $('[data-reused]').hidden = true;
      clearFade();
      render(0);
    }
    state.playing = true;
    refreshControls();
    continueInView();
  }

  function restart() {
    stop();
    clearFade();
    $('[data-reused]').hidden = true;
    state.drawn = -1;
    render(0);
    play();
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
    state.drawn = -1;
    clearFade();
    repeat(false);
  }

  function repeat(allowFade = true) {
    $('[data-reused]').hidden = false;
    stop();
    if (!state.full && allowFade) crossfade();
    render(phases[2].at);
    play();
  }

  function fitDiagram() {
    clearFade();
    stage.setAttribute('viewBox', narrow.matches ? '0 26 590 356' : '0 0 760 406');
  }

  const stoppedFrames = [1720, 4660, 7350, 13540, duration];
  function selectPhase(phase) {
    state.begun = true;
    stop();
    if (!state.full) crossfade();
    if (phase < 2) $('[data-reused]').hidden = true;
    render(stoppedFrames[phase]);
    refreshControls();
  }

  phaseSelect.addEventListener('change', () => selectPhase(Number(phaseSelect.value)));
  mount.addEventListener('click', event => {
    if (event.target.closest('[data-see-evidence]')) support.open = true;
    const button = event.target.closest('button');
    if (!button) return;
    state.begun = true;
    if (button.hasAttribute('data-play')) {
      if (state.playing) stop();
      else play();
    } else if (button.hasAttribute('data-replay')) {
      restart();
    } else if (button.hasAttribute('data-motion') || button.hasAttribute('data-mobile-motion')) {
      state.full = !state.full;
      restart();
    } else if (button.hasAttribute('data-phase')) {
      selectPhase(Number(button.dataset.phase));
    } else if (button.hasAttribute('data-repeat')) {
      repeat();
      playButton.focus({ preventScroll: true });
    } else if (button.hasAttribute('data-role')) {
      switchRole(button.dataset.role);
    }
  });
  reduced.addEventListener('change', () => {
    state.full = !reduced.matches;
    clearFade();
    state.drawn = -1;
    render(state.time, state.playing);
    refreshControls();
  });
  narrow.addEventListener('change', fitDiagram);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) suspend();
    else continueInView();
  });

  mount.dataset.role = state.role;
  diffusion = makeDiffusion();
  fitDiagram();
  render(0);
  refreshControls();

  if ('IntersectionObserver' in window) {
    const exhibit = $('.ee-memory__exhibit');
    let timer = 0;
    let framed = false;
    function startWhenSettled() {
      clearTimeout(timer);
      if (framed && !state.begun && !document.hidden) {
        timer = setTimeout(() => {
          if (framed && !state.begun && !document.hidden) play();
        }, 500);
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.intersectionRatio >= .42;
      framed = entry.intersectionRatio >= .96;
      if (!state.visible) suspend();
      else if (state.begun) continueInView();
      startWhenSettled();
    }, { rootMargin: '-62px 0px -4px 0px', threshold: [0, .42, .96] });
    observer.observe(exhibit);
    window.addEventListener('scroll', startWhenSettled, {passive:true});
  } else {
    state.visible = true;
    play();
  }
})();
