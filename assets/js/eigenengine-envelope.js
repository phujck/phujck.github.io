(() => {
  'use strict';

  const mount = document.querySelector('#ee-envelope');
  if (!mount || mount.dataset.ready) return;
  mount.dataset.ready = 'true';

  const paper = '/demo/view/?asset=cost-paper';
  const records = {
    section: {
      region: 'cost-geometry', label: 'Geometry of refinement', kind: 'Section', tone: 'gold',
      summary: 'Each square is a register for its children and a symbol in its parent register. Open a quadrant to repeat the same four-way choice.',
      next: ['register', 'claim'], page: 9,
    },
    register: {
      region: 'cost-fig-3a', label: 'Four-way split', kind: 'Construction', tone: 'gold',
      summary: 'The Hilbert path visits all the cells in one quadrant before entering the next. The path repeats inside each quadrant, rotated or reflected to keep consecutive cells adjacent.',
      next: ['cell', 'count'], page: 10,
    },
    cell: {
      region: 'cost-fig-4b', label: 'Selected cell', kind: 'Detail', tone: 'gold',
      summary: 'Following one branch identifies a cell. Figure 4 follows the third child through three levels, with each selected child becoming the register for the next choice.',
      page: 11,
    },
    count: {
      region: 'cost-fig-3a', label: 'Four times as many', kind: 'Premise', tone: 'blue',
      summary: 'At each level every register divides into four. The next level therefore has four times as many divisions to pay for.',
      page: 10,
    },
    width: {
      region: 'cost-width', label: 'Width per register', kind: 'Premise', tone: 'blue',
      summary: 'On the square, each child is half as wide as its parent. That leaves one quarter of its area. Figure 4 keeps the same nesting and varies the width contraction.',
      next: ['fig3', 'fig4'], page: 9,
    },
    price: {
      region: 'cost-fig-3b', label: 'Area or wall length', kind: 'Condition', tone: 'blue',
      summary: 'A division can be priced by the area being divided or by the length of the walls that divide it. On the square, area quarters but wall length halves with each step down.',
      next: ['fig3'], page: 10,
    },
    claim: {
      region: 'cost-fig-3b', label: 'Constant cost per level', kind: 'Claim', tone: 'teal',
      summary: 'On the square, area pricing makes each round cost the same. Four times as many divisions cost one quarter as much each. Wall-length pricing makes each round cost twice as much.',
      next: ['fig3', 'fig4'], page: 10,
    },
    fig3: {
      region: 'cost-fig-3', label: 'Figure 3', kind: 'Evidence', tone: 'teal',
      summary: 'The upper panels show successive levels on the square. Below, the blue area-priced curve rises by the same amount each time. The orange wall-length curve has increments of 1, 2 and 4.',
      caption: 'The composition correction as geometry', page: 10,
    },
    fig4: {
      region: 'cost-fig-4', label: 'Figure 4', kind: 'Evidence', tone: 'teal',
      summary: 'A related construction keeps the rank order and nesting while thinning the geometry. At dimension one, even wall-length pricing gives a constant increment because the width quarters.',
      caption: 'The Hilbert order at non-integer dimension', page: 11,
    },
  };
  const ids = Object.keys(records);
  const lenses = {
    membership: {
      help: 'The section contains the claim, its assumptions and the figures. The four-way split contains the selected cell.',
      relation: 'Solid lines show membership.',
      positions: {
        section: [.50, .15, .1], register: [.18, .37, 1], cell: [.18, .60, -.8],
        count: [.50, .37, .25], width: [.50, .60, .45], price: [.50, .82, .6],
        claim: [.82, .37, .85], fig3: [.82, .60, 0], fig4: [.82, .82, -.5],
      },
      groups: [
        { members: ids, tone: 'gold' },
        { members: ['register', 'cell'], tone: 'gold', nested: true },
      ],
      edges: [
        ['section', 'register'], ['register', 'cell'], ['section', 'count'], ['section', 'width'],
        ['section', 'price'], ['section', 'claim'], ['section', 'fig3'], ['section', 'fig4'],
      ],
    },
    inference: {
      help: 'The claim turns toward three premises: how many registers divide, how their widths contract and how a division is priced.',
      relation: 'Arrows point from the claim to its premises.',
      positions: {
        section: [.18, .65, -.7], register: [.50, .65, -.65], cell: [.82, .65, -.7],
        count: [.18, .40, .55], width: [.50, .40, .1], price: [.82, .40, -.35],
        claim: [.50, .15, 1.2], fig3: [.34, .86, -.85], fig4: [.66, .86, -.95],
      },
      groups: [
        { members: ['count', 'width', 'price'], tone: 'blue', label: 'Premises' },
      ],
      edges: [['claim', 'count'], ['claim', 'width'], ['claim', 'price']],
    },
    evidence: {
      help: 'Figure 3 documents the square calculation. Figure 4 shows how the result changes when the same construction uses different geometry.',
      relation: 'Dotted arrows lead to the figures.',
      positions: {
        section: [.18, .84, -.9], register: [.50, .62, .18], cell: [.50, .84, -.85],
        count: [.18, .62, -.55], width: [.50, .39, -.18], price: [.18, .39, .2],
        claim: [.18, .16, .55], fig3: [.82, .34, 1.2], fig4: [.82, .69, .65],
      },
      groups: [
        { members: ['fig3', 'fig4'], tone: 'teal', label: 'Figures' },
      ],
      edges: [['claim', 'fig3'], ['price', 'fig3'], ['width', 'fig3'], ['register', 'fig4']],
    },
  };
  const ports = ['section', 'claim', 'price', 'fig3'];
  const revealFrom = { register: 'section', cell: 'section', count: 'section', width: 'section', fig4: 'section' };
  const phases = [
    {
      lens: 'inference', ids: ['claim', 'price', 'count', 'width'],
      edges: lenses.inference.edges,
      status: 'The claim requires three things: four children, their widths and the price of a division.',
    },
    {
      lens: 'evidence', ids: ['claim', 'fig3'],
      edges: [['claim', 'fig3']],
      status: 'Follow the comparison to the curves in Figure 3.',
    },
  ];
  const samples = [
    'On the square, each child is half as wide as its parent.',
    'On the square, each child is half as wide as its parent and has one quarter of its area.',
  ];
  const fingerprints = ['a88446a9727338fc7b079226c89a5473eb25f49c6a38e9f0ef16dd62a11a332a', 'd6b6f1ef03c58b2ec978eef177e423291cb170158eed512d233d035a9e5348df'];
  const svgNS = 'http://www.w3.org/2000/svg';
  const baseAngle = { membership: -0.63, inference: 0.79, evidence: -0.94 };
  const defaultTilt = 0.43;
  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const ease = t => t * t * (3 - 2 * t);
  const state = {
    lens: 'membership', selected: 'claim', role: 'reader', phase: -1,
    source: 0, accepted: 0, prior: null, preview: false,
    yaw: baseAngle.membership, pitch: defaultTilt, spinning: null, drag: null,
    positions: structuredClone(lenses.membership.positions), question: null,
    pulseFrame: null, engaged: false, visible: false, story: null, storyFrame: null,
    scene: 'sealed', flap: 0, extraction: 0, cardScale: 1, turn: 1,
    size: { width: 1, height: 1, card: 90 },

  };

  mount.innerHTML = `
    <div class="ee-envelope__exhibit">
    <div class="ee-envelope__toolbar" tabindex="-1" role="group" aria-label="Graph controls">
      <div class="ee-envelope__lens" role="group" aria-label="Show relationships">
        <button type="button" data-lens="membership" aria-pressed="true" aria-label="Where it belongs"><span class="env-wide">Where it belongs</span><span class="env-short">Belongs to</span></button>
        <button type="button" data-lens="inference" aria-pressed="false" aria-label="What it requires"><span class="env-wide">What it requires</span><span class="env-short">Requires</span></button>
        <button type="button" data-lens="evidence" aria-pressed="false" aria-label="What supports it"><span class="env-wide">What supports it</span><span class="env-short">Evidence</span></button>
      </div>
      <div class="ee-envelope__orbit" role="group" aria-label="Graph motion">
        <button type="button" data-orbit="-1" aria-label="Rotate left" title="Rotate left">↶</button>
        <button type="button" data-orbit="1" aria-label="Rotate right" title="Rotate right">↷</button>
        <button type="button" data-orbit="0" aria-label="Reset view"><span class="env-wide">Reset view</span><span class="env-short">Reset</span></button>
        <button type="button" data-cover>Open envelope</button>
      </div>
    </div>
    <div class="ee-envelope__workspace">
      <div class="ee-envelope__visual">
        <div class="ee-envelope__stage" role="group" aria-label="Interactive graph of the Hilbert construction" aria-describedby="ee-envelope-scene-note">
          <svg class="ee-envelope__svg" viewBox="0 0 760 440" aria-hidden="true">
            <defs>
              <radialGradient id="ee-envelope-field">
                <stop offset="0" stop-color="#203858" stop-opacity=".72"/>
                <stop offset="1" stop-color="#101c2d" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="ee-envelope-pulse">
                <stop offset="0" stop-color="white" stop-opacity=".74" />
                <stop offset="1" stop-color="white" stop-opacity="0" />
              </radialGradient>
              <marker id="ee-envelope-arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9" stroke="#79b6da" fill="none" stroke-width="1.8" />
              </marker>
              <marker id="ee-envelope-arrow-teal" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9" stroke="#65b99a" fill="none" stroke-width="1.8" />
              </marker>
            </defs>
            <g data-layer="grid"></g>
            <g data-layer="volumes"></g>
            <g data-layer="edges"></g>
            <g data-layer="pulse"></g>
            <g data-layer="stations"></g>
          </svg>
          <div class="ee-envelope__cover" aria-hidden="true">
            <div class="ee-envelope__liner"></div>
            <div class="ee-envelope__paper"></div>
            <div class="ee-envelope__shell">
              <p>Claim envelope <span>The Cost of Complexity</span></p>
              <p class="ee-envelope__face-revision">Sample revision <code data-face-hash></code></p>
            </div>
            <div class="ee-envelope__flap"></div>
          </div>
          <div class="ee-envelope__points"></div>
        </div>
        <div class="ee-envelope__legend">
          <span><i aria-hidden="true"></i><span data-relation></span></span>
          <span id="ee-envelope-scene-note" data-scene-note></span>
        </div>
        <div class="ee-envelope__node-picker"><label for="ee-object-picker">Object</label>
          <select id="ee-object-picker" aria-label="Inspect a node">
            ${ids.map(id => `<option value="${id}">${records[id].label}</option>`).join('')}
          </select>
          <button type="button" data-inspect aria-expanded="false" aria-controls="ee-full-record">Details</button>
        </div>
        <p class="ee-envelope__short-result" data-object-result></p>
      </div>
      <aside id="ee-full-record" class="ee-envelope__inspector" aria-label="Selected graph object">
        <nav class="ee-envelope__crumb" aria-label="Object path"></nav>
        <div class="ee-envelope__detail" aria-live="polite"></div>
      </aside>
    </div>
    </div>
    <p class="ee-envelope__lens-note" data-lens-note></p>
    <div class="ee-envelope__exercises">
      <section class="ee-envelope__exercise">
        <h3>Provenance of the claim</h3>
        <p>Which assumption gives equal cost per round, and where is it shown?</p>
        <button type="button" data-run>Trace the claim to Figure 3</button>
        <div class="ee-envelope__query-result" aria-live="polite"></div>
      </section>
      <section class="ee-envelope__exercise">
        <div class="ee-envelope__exercise-top">
          <h3>Change a source revision</h3>
          <div class="ee-envelope__role" role="group" aria-label="Example role">
            <button type="button" data-role="reader" aria-pressed="true">Reader</button>
            <button type="button" data-role="editor" aria-pressed="false">Editor</button>
          </div>
        </div>
        <div class="ee-envelope__revision" aria-live="polite"></div>
      </section>
    </div>
    <details class="ee-envelope__mechanics">
      <summary>How the revision check works</summary>
      <p>A claim fingerprint covers its source and direct prerequisites. Work can carry a review requirement farther through declared prerequisite links. In the example above, the sample correction travels from a source passage to the premise about width and reaches the answer that used it.</p>
    </details>
    <p class="ee-envelope__caption">The nodes represent the published section and Figures 3–4. The revision check uses a working copy of its width premise. <a href="/demo/writing/simulation/#simulation-stale">See the app flag an actual change to a figure’s input ↗</a></p>
  `;

  const $ = (selector, element = mount) => element.querySelector(selector);
  const stage = $('.ee-envelope__stage');
  const points = $('.ee-envelope__points');
  const cover = $('.ee-envelope__cover');
  const coverButton = $('[data-cover]');
  const sceneNote = $('[data-scene-note]');
  const svg = $('.ee-envelope__svg');
  const picker = $('.ee-envelope__node-picker select');
  const layers = Object.fromEntries([...mount.querySelectorAll('[data-layer]')]
    .map(element => [element.dataset.layer, element]));
  const buttons = Object.fromEntries(ids.map(id => {
    const record = records[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.point = id;
    button.dataset.tone = record.tone;
    button.className = 'ee-envelope__point';
    button.setAttribute('aria-label', `${record.kind}: ${record.label}`);
    button.innerHTML = `<span class="ee-envelope__dot" aria-hidden="true"></span>
      <span class="ee-envelope__identity"><span class="ee-envelope__node-kind">${record.kind}</span>
      <span class="ee-envelope__label">${record.label}</span></span>`;
    points.append(button);
    return [id, button];
  }));

  const cardHeight = 53;
  const mix = (a, b, at) => a + (b - a) * at;
  const xy = p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

  function measure() {
    const width = stage.clientWidth || 1;
    const height = stage.clientHeight || 1;
    const card = Math.min(151, (width - 42) / 3);
    state.size = { width, height, card };
    stage.style.setProperty('--ee-card-width', `${card}px`);
    stage.style.setProperty('--ee-card-height', `${cardHeight}px`);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    draw();
  }

  function project([x, y, z]) {
    const { width, height, card } = state.size;
    const sin = Math.sin(state.yaw);
    const cos = Math.cos(state.yaw);
    // Reserve each row's label clearance while letting depth shift the stations.
    const horiz = Math.max(0, Math.min(18, (.31 * width - card - 6) / 2));
    const vert = Math.min(16, height * .024);
    const depth = z * cos - (x - .5) * sin * 2;
    return [
      x * width + clamp((z * sin + (x - .5) * (cos - 1)), -1, 1) * horiz,
      y * height - clamp(depth * Math.sin(state.pitch), -1, 1) * vert,
      depth,
    ];
  }

  function envelope() {
    const { width, height } = state.size;
    const w = Math.min(width * .88, 441);
    const h = Math.min(226, Math.max(174, height * .49));
    const x = width / 2;
    const y = Math.max(height * .55, Math.min(h, height - h / 2 - 12));
    return { w, h, x, y, ports: Object.fromEntries(ports.map((id, index) => [
      id, [x + w * (index % 2 ? .255 : -.255), y + h * (index < 2 ? -.15 : .19), 0],
    ])) };
  }

  function rectRay(dx, dy) {
    const { card } = state.size;
    return 1 / Math.max(Math.abs(dx) / (card / 2 + 2), Math.abs(dy) / (cardHeight / 2 + 3), 1);
  }

  function link(a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const inset = rectRay(dx, dy);
    if (inset >= .497) return '';
    return `M${xy([a[0] + dx * inset, a[1] + dy * inset])} L${xy([b[0] - dx * inset, b[1] - dy * inset])}`;
  }

  function relationalPath(from, to, positions) {
    const a = positions[from], b = positions[to];
    if (state.turn !== 1 || state.scene !== 'graph') return link(a, b);
    const { card } = state.size;
    if (state.lens === 'membership' && from === 'section' && ['width', 'price', 'fig3', 'fig4'].includes(to)) {
      // Share a line between the columns. It bypasses the intervening records
      // so membership can't be mistaken for a relationship between those rows.
      const right = to === 'fig3' || to === 'fig4';
      const neighbours = right ? ['count', 'claim'] : ['register', 'count'];
      const gutter = (positions[neighbours[0]][0] + positions[neighbours[1]][0]) / 2;
      const departure = [gutter, a[1] + cardHeight * .76];
      const inset = rectRay(departure[0] - a[0], departure[1] - a[1]);
      const start = [mix(a[0], departure[0], inset), mix(a[1], departure[1], inset)];
      return `M${xy(start)} L${xy(departure)} V${b[1]} H${b[0] + (right ? -1 : 1) * (card / 2 + 2)}`;
    }
    if (state.lens === 'evidence' && from === 'price' && to === 'fig3') {
      const gutter = Math.min(a[1], positions.width[1]) - cardHeight / 2 - 10;
      const endY = clamp(gutter, b[1] - cardHeight / 2 + 5, b[1] + cardHeight / 2 - 5);
      return `M${a[0]},${a[1] - cardHeight / 2 - 3} V${gutter}
        H${b[0] - card / 2 - 13} L${b[0] - card / 2 - 2},${endY}`;
    }
    return link(a, b);
  }

  function groupShape(group, positions) {
    const { width, height, card } = state.size;
    const coords = group.members.map(id => positions[id]);
    const near = group.nested ? 7 : 14;
    const crop = 7;
    const cardTop = Math.min(...coords.map(p => p[1])) - cardHeight / 2;
    const top = clamp(cardTop - (group.label ? 28 : near), crop, height);
    const bottom = clamp(Math.max(...coords.map(p => p[1])) + cardHeight / 2 + near, 0, height - crop);
    const left = clamp(Math.min(...coords.map(p => p[0])) - card / 2 - near, crop, width);
    const right = clamp(Math.max(...coords.map(p => p[0])) + card / 2 + near, 0, width - crop);
    const depth = Math.sin(state.yaw) * (group.nested ? 8 : 15);
    const fall = 6 + Math.sin(state.pitch) * 11;
    const outline = [
      [left, top + Math.max(0, depth)], [right, top + Math.max(0, -depth)],
      [right, bottom - Math.max(0, depth)], [left, bottom - Math.max(0, -depth)],
    ];
    const dropped = outline.slice(2).map(([x, y]) => [x - depth * .24, clamp(y + fall, 1, height - 2)]);
    return `<g class="ee-envelope__volume${group.nested ? ' is-nested' : ''}" data-tone="${group.tone}">
      <polygon class="ee-envelope__volume-side" points="${[...outline.slice(2), ...dropped.reverse()].map(xy).join(' ')}"/>
      <polygon class="ee-envelope__volume-top" points="${outline.map(xy).join(' ')}"/>
      ${group.label && state.turn >= .96 ? `<text x="${left + 9}" y="${Math.max(12, cardTop - 6)}">${group.label}</text>` : ''}
    </g>`;
  }

  function draw() {
    const { width, height, card } = state.size;
    const casing = envelope();
    const graph = state.scene === 'graph';
    const leaving = state.scene === 'release';
    const needsReview = state.source !== state.accepted;
    const activity = phases[state.phase]?.ids;
    const target = Object.fromEntries(ids.map(id => [id, project(state.positions[id])]));
    const projected = {};
    let paths = '';
    let markers = '';
    const full = state.extraction;
    const animating = graph && state.turn < 1;
    const turnSize = state.cardScale;
    const frames = ids.map(id => {
      const own = ports.indexOf(id);
      const progress = graph ? 1 : !leaving ? 0 : own >= 0
        ? ease(clamp((full - own * .065) / .80))
        : ease(clamp((full - .68) / .32));
      const end = target[id];
      const origin = casing.ports[id] || casing.ports[revealFrom[id]];
      const show = graph || own >= 0 || leaving && full >= .72;
      const arc = leaving ? Math.sin(Math.PI * progress) * (own < 0 ? 0 : (own < 2 ? -22 : 27)) : 0;
      const position = graph ? [...end] : [
        mix(origin[0], end[0], progress), mix(origin[1], end[1], progress) + arc, end[2],
      ];
      if (leaving && own >= 0 && progress > 0 && progress < 1) {
        paths += `<path class="ee-envelope__egress" data-tone="${records[id].tone}" d="M${xy(origin)} Q${xy([origin[0], position[1]])} ${xy(position)}"/>`;
      }
      if (show && (leaving || graph)) {
        const [x, y] = position;
        const foot = [x - Math.sin(state.yaw) * position[2] * 11, Math.min(height - 8, y + 35 + position[2] * 4)];
        markers += `<g class="ee-envelope__station" data-tone="${records[id].tone}">
          <path d="M${xy([x, y + 8])} L${xy(foot)}"/>
          <ellipse cx="${foot[0]}" cy="${foot[1]}" rx="${Math.min(18, 10 + position[2] * 4)}" ry="3"/>
        </g>`;
      }
      projected[id] = position;
      return { id, own, show, position, progress };
    });

    // Condense lower-priority stations during crossings, retaining their colour and identity.
    const occupied = [];
    for (const { id, own, show, position, progress } of frames.sort((a, b) =>
      Number(b.id === state.selected) - Number(a.id === state.selected) ||
      (b.own >= 0) - (a.own >= 0))) {
      const [x, y, depth] = position;
      const moving = leaving || animating;
      const blocked = moving && occupied.some(box =>
        Math.abs(box.x - x) < (box.width + card) / 2 + 5 &&
        Math.abs(box.y - y) < (box.height + cardHeight) / 2 + 5);
      const scale = blocked ? .40 : turnSize;
      const button = buttons[id];
      const emergence = own >= 0 || graph ? 1 : progress;
      button.hidden = !show;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
      button.style.setProperty('--node-scale', scale);
      button.style.setProperty('--node-alpha', emergence);
      button.style.zIndex = state.selected === id ? '44' : String(Math.round(20 - depth * 2));
      button.classList.toggle('is-port', own >= 0 && !graph && progress < .72);
      button.classList.toggle('is-compact', blocked || scale < .72);
      button.classList.toggle('is-selected', state.selected === id);
      button.classList.toggle('is-review-required', needsReview && id === 'claim');
      button.classList.toggle('is-on-route', Boolean(activity?.includes(id)));
      button.classList.toggle('is-off-route', Boolean(activity && !activity.includes(id)));
      button.setAttribute('aria-pressed', String(state.selected === id));
      if (show && emergence > .28) occupied.push({ x, y, width: card * scale, height: cardHeight * scale });
      if (id === 'claim') button.setAttribute('aria-label',
        needsReview ? 'Claim: Constant cost per level, review required' : 'Claim: Constant cost per level');
    }
    state.projected = projected;
    stage.style.setProperty('--ee-flap-turn', `${state.flap * 155}deg`);
    stage.style.setProperty('--ee-extraction', full);
    cover.style.width = `${casing.w}px`;
    cover.style.height = `${casing.h}px`;
    cover.style.left = `${casing.x}px`;
    cover.style.top = `${casing.y}px`;
    cover.hidden = graph;
    const backdrop = graph ? ease(clamp((state.turn - .32) / .52)) : ease(clamp((full - .48) / .52));
    layers.grid.style.opacity = backdrop;
    layers.grid.innerHTML = `<ellipse cx="${width * .5}" cy="${height * .49}" rx="${width * .48}" ry="${height * .49}" fill="url(#ee-envelope-field)"/>`;
    layers.volumes.style.opacity = backdrop;
    layers.volumes.innerHTML = lenses[state.lens].groups.map(group => groupShape(group, target)).join('');
    layers.edges.innerHTML = paths + (backdrop > 0 ? lenses[state.lens].edges.map(([from, to]) => {
      const path = relationalPath(from, to, projected);
      const marker = state.lens === 'membership' ? '' : ` marker-end="url(#ee-envelope-arrow-${state.lens === 'evidence' ? 'teal' : 'blue'})"`;
      const near = (activity?.includes(from) && activity?.includes(to)) || state.selected === from || state.selected === to;
      const affected = needsReview && from === 'claim' && to === 'width';
      return path ? `<path data-from="${from}" data-to="${to}" class="ee-envelope__edge ee-envelope__edge--${state.lens}${near ? ' is-near' : ''}${affected ? ' is-affected' : ''}" style="--edge-alpha:${backdrop}" d="${path}"${marker}/>` : '';
    }).join('') : '');
    layers.stations.style.opacity = Math.max(backdrop, full * .48);
    layers.stations.innerHTML = markers;
  }

  let sourceOpenedAt = null;
  let sourceReadingTime = 0;
  let resumeTurn, resumePulse;
  const animationTime = now => (sourceOpenedAt ?? now) - sourceReadingTime;

  function moveTo(lens, yaw = state.yaw, pitch = state.pitch, duration = 780, regroup = false) {
    cancelAnimationFrame(state.spinning);
    const start = animationTime(performance.now());
    const from = { yaw: state.yaw, pitch: state.pitch, positions: structuredClone(state.positions) };
    const destination = lenses[lens].positions;
    const turn = Math.atan2(Math.sin(yaw - from.yaw), Math.cos(yaw - from.yaw));
    const initialScale = state.cardScale;
    function step(now) {
      if (sourceOpenedAt !== null) { resumeTurn = step; return; }
      const t = clamp((animationTime(now) - start) / duration);
      const weight = ease(t);
      state.yaw = from.yaw + turn * weight;
      state.pitch = mix(from.pitch, pitch, weight);
      state.turn = regroup ? t : 1;
      state.cardScale = regroup && t < .5
        ? mix(initialScale, .42, ease(2 * t))
        : mix(regroup ? .42 : initialScale, 1, regroup ? ease(2 * t - 1) : weight);
      ids.forEach(id => {
        const bend = regroup ? Math.sin(Math.PI * t) * (from.positions[id][0] - destination[id][0]) * .16 : 0;
        const [x, y, z] = destination[id].map((value, index) => mix(from.positions[id][index], value, weight));
        state.positions[id] = [x, y + bend, z];
      });
      draw();
      if (t < 1) state.spinning = requestAnimationFrame(step);
    }
    state.spinning = requestAnimationFrame(step);
  }

  function pulseEdges(edges, tone) {
    cancelAnimationFrame(state.pulseFrame);
    layers.pulse.innerHTML = '';
    const start = animationTime(performance.now());
    function frame(now) {
      if (sourceOpenedAt !== null) { resumePulse = frame; return; }
      const elapsed = animationTime(now) - start;
      layers.pulse.innerHTML = edges.map(([source, target], index) => {
        const t = Math.max(0, Math.min(1, (elapsed - index * 95) / 700));
        const a = state.projected[source];
        const b = state.projected[target];
        const x = a[0] + (b[0] - a[0]) * t;
        const y = a[1] + (b[1] - a[1]) * t;
        const alpha = Math.sin(Math.PI * t) ** 0.24;
        return `<g class="ee-envelope__signal" data-tone="${tone}" opacity="${alpha}">
          <path d="M${xy(a)} L${xy([x, y])}"/>
          <circle cx="${x}" cy="${y}" r="16" fill="url(#ee-envelope-pulse)"/>
          <circle cx="${x}" cy="${y}" r="4.5" fill="currentColor"/>
        </g>`;
      }).join('');
      if (elapsed < 760 + edges.length * 95) state.pulseFrame = requestAnimationFrame(frame);
      else layers.pulse.innerHTML = '';
    }
    state.pulseFrame = requestAnimationFrame(frame);
  }

  function displayLens(lens) {
    state.lens = lens;
    mount.dataset.lens = lens;
    mount.querySelectorAll('[data-lens]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.lens === lens));
    });
    $('[data-relation]').textContent = lenses[lens].relation;
    $('[data-lens-note]').textContent = lenses[lens].help;
  }

  const storyNotes = {
    sealed: 'The exterior names the claim and its ports.',
    open: 'The open envelope shows the records behind its ports.',
    release: 'The same named records become stations in the network.',
    graph: 'Drag to rotate · Select a card to inspect its source.',
  };

  function scene(name) {
    if (state.scene === name && stage.dataset.scene === name) return;
    state.scene = name;
    stage.dataset.scene = name;
    mount.dataset.envelopeScene = name;
    sceneNote.textContent = storyNotes[name];
  }

  function updateStoryControls() {
    const command = state.story ? 'Skip opening' : state.scene === 'graph' ? 'Replay opening' : 'Open envelope';
    const compact = state.story ? 'Skip' : state.scene === 'graph' ? 'Replay' : 'Open';
    coverButton.setAttribute('aria-label', command);
    coverButton.innerHTML = `<span class="env-wide">${command}</span><span class="env-short">${compact}</span>`;
  }

  function openGraph() {
    if (!state.story && state.scene === 'graph') return;
    cancelAnimationFrame(state.storyFrame);
    state.storyFrame = null;
    state.story = null;
    state.flap = 1;
    state.extraction = 1;
    state.turn = 1;
    state.cardScale = 1;
    scene('graph');
    updateStoryControls();
    draw();
  }

  function advanceStory(now) {
    const story = state.story;
    if (!story) return;
    state.storyFrame = null;
    if (!state.visible || document.hidden || sourceOpenedAt !== null) {
      story.tick = null;
      return;
    }
    story.elapsed += story.tick == null ? 0 : Math.min(70, now - story.tick);
    story.tick = now;
    const t = story.elapsed;
    state.flap = ease(clamp((t - 1020) / 660));
    state.extraction = ease(clamp((t - 2090) / 1980));
    scene(t < 1130 ? 'sealed' : t < 2100 ? 'open' : 'release');
    if (t >= 4090) return openGraph();
    draw();
    state.storyFrame = requestAnimationFrame(advanceStory);
  }

  function playStory() {
    cancelAnimationFrame(state.storyFrame);
    cancelAnimationFrame(state.spinning);
    cancelAnimationFrame(state.pulseFrame);
    layers.pulse.innerHTML = '';
    state.story = { elapsed: 0, tick: null };
    state.extraction = 0;
    state.flap = 0;
    state.turn = 1;
    state.cardScale = 1;
    state.positions = structuredClone(lenses[state.lens].positions);
    scene('sealed');
    updateStoryControls();
    draw();
    state.storyFrame = requestAnimationFrame(advanceStory);
  }

  function detail(id) {
    const item = records[id];
    const inSection = id !== 'section';
    const parent = ['cell', 'fig4'].includes(id) ? 'register' : id === 'fig3' ? 'claim' : null;
    return {
      path: `${inSection ? '<button type="button" data-open="section">Section</button><span aria-hidden="true">›</span>' : '<span>Paper</span><span aria-hidden="true">›</span>'}
        ${parent ? `<button type="button" data-open="${parent}">${records[parent].kind}</button><span aria-hidden="true">›</span>` : ''}
        <span aria-current="location">${item.kind}</span>`,
      body: `<p class="ee-envelope__kind" data-tone="${item.tone}">${item.kind}</p>
        <h3 tabindex="-1">${item.label}</h3>
        <p>${item.summary}</p>
        ${item.caption ? `<p class="ee-envelope__figure-caption">${item.caption}</p>` : ''}
        ${item.next ? `<div class="ee-envelope__open">${item.next.map(next => `<button type="button" data-open="${next}">Open ${records[next].kind === 'Evidence' ? records[next].label : records[next].kind.toLowerCase()} <span aria-hidden="true">→</span></button>`).join('')}</div>` : ''}
        <a data-source-region="${item.region}" target="_blank" rel="noopener" href="${paper}&amp;page=${item.page}">Read ${item.caption ? 'figure and caption' : 'the source passage'} <span aria-hidden="true">↗</span></a>`,
    };
  }

  const shortResults = {
    section: 'This section groups the claim, its construction and its figures.',
    register: 'The same four-way choice repeats inside each square.',
    cell: 'A sequence of choices identifies one cell.',
    count: 'The number of squares to split quadruples each round.',
    width: 'Each child is half as wide and has a quarter of its parent’s area.',
    price: 'The pricing rule decides what each split costs.',
    claim: 'Under area pricing, the total cost per round stays constant.',
    fig3: 'Figure 3 shows equal increments for area pricing.',
    fig4: 'Figure 4 varies the geometry while keeping the order of the cells.'
  };
  $('[data-inspect]').addEventListener('click', event => {
    const opened = mount.classList.toggle('inspect-record');
    event.currentTarget.setAttribute('aria-expanded', String(opened));
    event.currentTarget.textContent = opened ? 'Hide details' : 'Details';
    if (opened) $('#ee-full-record').scrollIntoView({block:'nearest', behavior:'instant'});
  });

  function select(id, focus = false) {
    if (!records[id]) return;
    const prior = state.selected;
    state.selected = id;
    picker.value = id;
    const shortResult = $('[data-object-result]');
    shortResult.textContent = shortResults[id];
    const item = records[id];
    const source = document.createElement('a');
    source.dataset.sourceRegion = item.region;
    source.target = '_blank';
    source.rel = 'noopener';
    source.href = paper + '&page=' + item.page;
    source.textContent = item.caption ? 'Open ' + item.label + ' ↗' : 'Read p. ' + item.page + ' ↗';
    shortResult.append(' ', source);
    const view = detail(id);
    $('.ee-envelope__crumb').innerHTML = view.path;
    const selected = $('.ee-envelope__detail');
    selected.innerHTML = view.body;
    if (focus) $('h3', selected).focus({ preventScroll: true });
    draw();
    if (focus && prior !== id && state.scene === 'graph') {
      const connection = lenses[state.lens].edges.find(([from, to]) =>
        from === prior && to === id || from === id && to === prior);
      if (connection) pulseEdges([connection], records[id].tone);
    }
  }

  function stopQuestion() {
    if (state.question && state.phase === 0) $('.ee-envelope__query-result').textContent = '';
    clearTimeout(state.question?.timer);
    state.question = null;
    if (state.phase >= 0) {
      state.phase = -1;
      cancelAnimationFrame(state.pulseFrame);
      layers.pulse.replaceChildren();
      draw();
    }
    $('[data-run]').disabled = false;
  }

  function scheduleQuestion() {
    const q = state.question;
    if (!q) return;
    if (sourceOpenedAt !== null) {
      clearTimeout(q.timer);
      if (q.timer !== null) q.remaining = Math.max(0, q.remaining - (performance.now() - q.started));
      q.timer = null;
    } else {
      q.started = performance.now();
      q.timer = setTimeout(q.next, q.remaining);
    }
  }

  function runQuestion() {
    const toolbar = $('.ee-envelope__toolbar');
    const top = document.querySelector('.nav')?.getBoundingClientRect().height || 0;
    const visual = $('.ee-envelope__visual').getBoundingClientRect();
    if (toolbar.getBoundingClientRect().top < top || visual.bottom > innerHeight) {
      toolbar.scrollIntoView({block:'start', behavior:'instant'});
    }
    stopQuestion();
    openGraph();
    toolbar.focus({preventScroll: true});
    $('[data-run]').disabled = true;
    const answer = $('.ee-envelope__query-result');
    const advance = phase => {
      state.phase = phase;
      const step = phases[phase];
      displayLens(step.lens);
      moveTo(step.lens, baseAngle[step.lens], defaultTilt, 780, true);
      pulseEdges(step.edges, phase ? 'teal' : 'gold');
      answer.innerHTML = `<p><strong>Area pricing.</strong> Each round divides four times as many squares, each with one quarter of the area. Under wall-length pricing the cost per round doubles.</p>
        <p>${step.status}</p>
        <a href="/eigenengine/cost-of-complexity/#refinement">Compare the cost curves in the paper ↗</a>
        <a data-source-region="cost-fig-3" target="_blank" rel="noopener" href="${paper}&amp;page=10">Open Figure 3 ↗</a>`;
      if (phase !== phases.length - 1) return;
      select('fig3');
      answer.insertAdjacentHTML('beforeend', `<blockquote>“a price set by area (γ = 2) adds the same increment … at every depth”</blockquote>
        <a href="/demo/writing/">Watch the Writing App film ↗</a>`);
      const run = $('[data-run]');
      run.textContent = 'Trace again';
      run.disabled = false;
      state.question = null;
    };
    advance(0);
    state.question = { next: () => advance(1), remaining: 1900, timer: null };
    scheduleQuestion();
  }

  function revision() {
    const current = state.source === state.accepted;
    const editable = state.role === 'editor';
    const same = state.prior === null;
    const digest = index => fingerprints[index].slice(0, 12);
    const applied = state.source === 1;
    $('[data-face-hash]').textContent = digest(state.source);
    $('.ee-envelope__revision').innerHTML = `
      <p class="ee-envelope__status ${current ? 'is-current' : 'is-review'}"><i aria-hidden="true"></i>
        ${current ? 'Current basis' : 'Review required'}</p>
      <dl class="ee-envelope__hashes" aria-label="Source SHA-256 fingerprint prefixes">
        <div><dt>Answer used</dt><dd><code title="SHA-256: ${fingerprints[state.accepted]}">${digest(state.accepted)}</code></dd></div>
        <div><dt>Source now</dt><dd><code title="SHA-256: ${fingerprints[state.source]}">${digest(state.source)}</code></dd></div>
      </dl>
      ${!same ? `<p class="ee-envelope__history">Earlier review · <code>${digest(state.prior)}</code></p>` : ''}
      <p>${current
        ? 'The answer applies to the square construction. Its reviewed source revision matches the current passage.'
        : 'The answer still cites its earlier source revision. Review the current passage before accepting a new basis.'}</p>
      ${((state.preview && editable) || !current) ? `<div class="ee-envelope__preview">
        <p><strong>Earlier passage</strong> ${samples[0]}</p><p><strong>${applied ? 'Current passage' : 'Proposed passage'}</strong> ${samples[1]}</p>
      </div>` : ''}
      <div class="ee-envelope__revision-actions">
        ${!editable ? '<span>Reader access · Open and check sources</span>' : !applied && !state.preview
          ? '<button type="button" data-revision="preview">Preview source correction</button>' : !applied
            ? '<button type="button" data-revision="apply">Apply sample correction</button>' : !current
              ? '<button type="button" data-revision="review">Record a fresh review</button>' : ''}
        ${applied || (state.preview && editable) ? '<button type="button" data-revision="reset">Reset sample</button>' : ''}
      </div>
      ${!current ? '<p class="ee-envelope__history">The source fingerprint changed. The width premise and the answer that uses it are ready for review.</p>' : ''}
    `;
    mount.querySelectorAll('[data-role]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.role === state.role));
    });
    draw();
  }

  function revisionAction(action) {
    if (action === 'reset') {
      state.source = 0;
      state.accepted = 0;
      state.prior = null;
      state.preview = false;
    } else if (state.role === 'editor') {
      if (action === 'preview') state.preview = true;
      if (action === 'apply' && state.preview) {
        stopQuestion();
        state.source = 1;
        state.preview = false;
        openGraph();
        state.phase = -1;
        displayLens('inference');
        select('width');
        moveTo(state.lens, baseAngle.inference, defaultTilt, 780, true);
        pulseEdges([['width', 'claim']], 'amber');
      }
      if (action === 'review' && state.source !== state.accepted) {
        stopQuestion();
        state.prior = state.accepted;
        state.accepted = state.source;
        displayLens('evidence');
        select('claim');
        moveTo(state.lens, baseAngle.evidence, defaultTilt, 780, true);
        pulseEdges([['claim', 'fig3']], 'teal');
      }
    }
    revision();
    const next = action === 'preview' ? 'apply' : action === 'apply' ? 'review' : action === 'review' ? 'reset' : 'preview';
    $(`[data-revision="${next}"]`)?.focus({ preventScroll: true });
  }

  function startDrag(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (event.target.closest('button') || state.scene !== 'graph' || state.story || state.turn < 1) return;
    state.engaged = true;
    state.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: state.yaw, pitch: state.pitch, turned: false };
  }

  function drag(event) {
    const tracking = state.drag;
    if (!tracking || tracking.id !== event.pointerId) return;
    const dx = event.clientX - tracking.x;
    const dy = event.clientY - tracking.y;
    if (!tracking.turned && Math.abs(dx) < 5) return;
    if (!tracking.turned) {
      stopQuestion();
      tracking.turned = true;
      cancelAnimationFrame(state.spinning);
      tracking.yaw = state.yaw;
      tracking.pitch = state.pitch;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    }
    state.yaw = tracking.yaw + dx / 155;
    state.pitch = Math.max(0.08, Math.min(0.88, tracking.pitch - dy / 350));
    draw();
  }

  function endDrag(event) {
    if (state.drag?.id !== event.pointerId) return;
    const turned = state.drag.turned;
    state.drag = null;
    stage.classList.remove('is-dragging');
    if (turned) moveTo(state.lens, state.yaw, state.pitch);
  }

  mount.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-cover')) {
      state.engaged = true;
      stopQuestion();
      if (state.story) openGraph();
      else playStory();
    } else if (button.hasAttribute('data-lens')) {
      if (state.lens === button.dataset.lens) return;
      state.engaged = true;
      stopQuestion();
      openGraph();
      displayLens(button.dataset.lens);
      moveTo(state.lens, baseAngle[state.lens], defaultTilt, 970, true);
    } else if (button.hasAttribute('data-orbit')) {
      state.engaged = true;
      stopQuestion();
      openGraph();
      const delta = Number(button.dataset.orbit);
      if (delta) moveTo(state.lens, state.yaw + delta * 0.38);
      else moveTo(state.lens, baseAngle[state.lens], defaultTilt);
    } else if (button.dataset.point) {
      if (state.selected === button.dataset.point && !state.question) return;
      stopQuestion();
      select(button.dataset.point);
    } else if (button.dataset.open) {
      state.engaged = true;
      stopQuestion();
      openGraph();
      select(button.dataset.open, true);
    } else if (button.hasAttribute('data-run')) {
      state.engaged = true;
      runQuestion();
    } else if (button.dataset.role) {
      if (state.role === button.dataset.role) return;
      state.role = button.dataset.role;
      revision();
    } else if (button.dataset.revision) {
      revisionAction(button.dataset.revision);
    }
  });

  stage.addEventListener('pointerdown', startDrag);
  stage.addEventListener('pointermove', drag);
  stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('pointerup', endDrag);
  picker.addEventListener('change', () => {
    stopQuestion();
    if (!ports.includes(picker.value)) {
      state.engaged = true;
      openGraph();
    }
    select(picker.value);
  });
  measure();
  displayLens(state.lens);
  scene('sealed');
  select(state.selected);
  revision();
  updateStoryControls();
  new ResizeObserver(measure).observe(stage);
  function syncStoryClock() {
    if (!state.story) return;
    if (!state.visible || document.hidden || sourceOpenedAt !== null) {
      cancelAnimationFrame(state.storyFrame);
      state.storyFrame = null;
      state.story.tick = null;
    } else if (state.storyFrame === null) {
      state.storyFrame = requestAnimationFrame(advanceStory);
    }
  }
  document.addEventListener('visibilitychange', syncStoryClock);
  document.addEventListener('eigenengine-source-preview', ({ detail }) => {
    if (detail.open) {
      sourceOpenedAt = performance.now();
    } else if (sourceOpenedAt !== null) {
      sourceReadingTime += performance.now() - sourceOpenedAt;
      sourceOpenedAt = null;
      if (resumeTurn) state.spinning = requestAnimationFrame(resumeTurn);
      if (resumePulse) state.pulseFrame = requestAnimationFrame(resumePulse);
      resumeTurn = resumePulse = null;
    }
    syncStoryClock();
    scheduleQuestion();
  });

  if ('IntersectionObserver' in window) {
    let started = false;
    const observer = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting && entry.intersectionRatio >= .42;
      if (state.visible && !started) {
        started = true;
        if (!state.engaged && !state.story && state.scene !== 'graph') playStory();
      }
      syncStoryClock();
    }, { threshold: [0, .42] });
    observer.observe(stage);
  } else {
    state.visible = true;
    playStory();
  }
})();
