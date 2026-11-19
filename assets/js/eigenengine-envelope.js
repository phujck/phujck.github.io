(() => {
  'use strict';

  const mount = document.querySelector('#ee-envelope');
  if (!mount || mount.dataset.ready) return;
  mount.dataset.ready = 'true';

  const paper = '/demo/view/?asset=cost-paper';
  const records = {
    section: {
      label: 'Geometry of refinement', kind: 'Section', tone: 'gold',
      summary: 'Each square is a register for its children and a symbol in its parent register. Open a quadrant to repeat the same four-way choice.',
      next: ['register', 'claim'], page: 9,
    },
    register: {
      label: 'Four-way split', kind: 'Construction', tone: 'gold',
      summary: 'The Hilbert path visits all the cells in one quadrant before entering the next. The path repeats inside each quadrant, rotated or reflected to keep consecutive cells adjacent.',
      next: ['cell', 'count'], page: 10,
    },
    cell: {
      label: 'Selected cell', kind: 'Detail', tone: 'gold',
      summary: 'Following one branch identifies a cell. Figure 4 follows the third child through three levels, with each selected child becoming the register for the next choice.',
      page: 11,
    },
    count: {
      label: 'Four times as many', kind: 'Premise', tone: 'blue',
      summary: 'At each level every register divides into four. The next level therefore has four times as many divisions to pay for.',
      page: 10,
    },
    width: {
      label: 'Width per register', kind: 'Premise', tone: 'blue',
      summary: 'On the square, each child is half as wide as its parent. That leaves one quarter of its area. Figure 4 keeps the same nesting and varies the width contraction.',
      next: ['fig3', 'fig4'], page: 9,
    },
    price: {
      label: 'Area or wall length', kind: 'Condition', tone: 'blue',
      summary: 'A division can be priced by the area being divided or by the length of the walls that divide it. On the square, area quarters but wall length halves with each step down.',
      next: ['fig3'], page: 10,
    },
    claim: {
      label: 'Constant cost per level', kind: 'Claim', tone: 'teal',
      summary: 'On the square, area pricing makes each round cost the same. Four times as many divisions cost one quarter as much each. Wall-length pricing makes each round cost twice as much.',
      next: ['fig3', 'fig4'], page: 10,
    },
    fig3: {
      label: 'Figure 3', kind: 'Evidence', tone: 'teal',
      summary: 'The upper panels show successive levels on the square. Below, the blue area-priced curve rises by the same amount each time. The orange wall-length curve has increments of 1, 2 and 4.',
      caption: 'The composition correction as geometry', page: 10,
    },
    fig4: {
      label: 'Figure 4', kind: 'Evidence', tone: 'teal',
      summary: 'A related construction keeps the rank order and nesting while thinning the geometry. At dimension one, even wall-length pricing gives a constant increment because the width quarters.',
      caption: 'The Hilbert order at non-integer dimension', page: 11,
    },
  };
  const ids = Object.keys(records);
  const lenses = {
    membership: {
      help: 'Nested outlines show which objects belong to the section and how the Hilbert register repeats.',
      relation: 'Solid lines show membership.',
      positions: {
        section: [-2.6, 1.9, 0.15], register: [-0.95, 0.65, 0.25], cell: [-1.2, -1.1, -1],
        count: [0.6, 1.35, 1.1], width: [2.32, 1.55, 0.65], price: [2.18, 0.05, 1],
        claim: [0, -0.53, -0.65], fig3: [1.55, -1.43, 0.04], fig4: [2.65, -0.64, -0.75],
      },
      edges: [
        ['section', 'register'], ['register', 'cell'], ['section', 'count'], ['section', 'width'],
        ['section', 'price'], ['section', 'claim'], ['section', 'fig3'], ['section', 'fig4'],
      ],
    },
    inference: {
      help: 'The claim moves above the premises it uses. The section and figures stay in view.',
      relation: 'Arrows point from the claim to its premises.',
      positions: {
        section: [-3.0, 1.05, 0.75], register: [-2.3, -0.7, 0.5], cell: [-1.6, -1.45, 0.2],
        count: [-1.05, 0.0, 0.1], width: [0.15, -0.8, 0.1], price: [1.6, -1.2, -0.8],
        claim: [0.1, 1.55, -0.1], fig3: [2.8, 0.75, 0.8], fig4: [2.6, -0.65, -0.4],
      },
      edges: [['claim', 'count'], ['claim', 'width'], ['claim', 'price']],
    },
    evidence: {
      help: 'Figure 3 documents the square calculation. Figure 4 shows how the result changes with geometry.',
      relation: 'Dotted arrows lead to the figures.',
      positions: {
        section: [-3.15, 1.05, 0.85], register: [-2.4, -0.7, 0.45], cell: [-1.7, -1.6, 0.25],
        count: [-1.15, 0.8, -0.45], width: [0.1, -1.0, -1.0], price: [-0.3, 1.95, 0.8],
        claim: [0.0, 0.5, 0.0], fig3: [1.8, 1.15, 0.4], fig4: [2.35, -0.75, -0.65],
      },
      edges: [['claim', 'fig3'], ['price', 'fig3'], ['width', 'fig3'], ['register', 'fig4']],
    },
  };
  const phases = [
    {
      lens: 'inference', ids: ['price', 'count', 'width'],
      edges: [['price', 'claim'], ['count', 'claim'], ['width', 'claim']],
      status: 'The square fixes the count and width changes. Compare how the two prices scale.',
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
  const traceSources = [
    { label: 'Square refinement passage', eligible: true, links: [1, 2] },
    { label: 'Figure 3 · area pricing', eligible: true, links: [0] },
    { label: 'Figure 3 · wall-length pricing', eligible: true, links: [0] },
    { label: 'Figure 4 · other geometries', eligible: false, links: [] },
  ];
  const fingerprints = ['a88446a9727338fc7b079226c89a5473eb25f49c6a38e9f0ef16dd62a11a332a', 'd6b6f1ef03c58b2ec978eef177e423291cb170158eed512d233d035a9e5348df'];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const baseAngle = { membership: -0.36, inference: 0.13, evidence: 0.54 };
  const defaultTilt = 0.43;
  const state = {
    lens: 'membership', selected: 'section', role: 'reader', phase: -1,
    source: 0, accepted: 0, prior: null, preview: false,
    yaw: baseAngle.membership, pitch: defaultTilt, spinning: null, drag: null,
    positions: structuredClone(lenses.membership.positions), timers: [],
    pulseFrame: null, engaged: false, lid: 0, closeUp: false, introTimer: null,
  };

  mount.innerHTML = `
    <div class="ee-envelope__toolbar">
      <div class="ee-envelope__lens" role="group" aria-label="Show relationships">
        <button type="button" data-lens="membership" aria-pressed="true">Where it belongs</button>
        <button type="button" data-lens="inference" aria-pressed="false">What it requires</button>
        <button type="button" data-lens="evidence" aria-pressed="false">What supports it</button>
      </div>
      <div class="ee-envelope__orbit" role="group" aria-label="Rotate the graph">
        <button type="button" data-orbit="-1" aria-label="Rotate left" title="Rotate left">↶</button>
        <button type="button" data-orbit="1" aria-label="Rotate right" title="Rotate right">↷</button>
        <button type="button" data-orbit="0" aria-label="Reset view">Reset view</button>
        <button type="button" data-cover aria-pressed="false">Close-up</button>
      </div>
    </div>
    <div class="ee-envelope__workspace">
      <div class="ee-envelope__visual">
        <div class="ee-envelope__stage" aria-label="Interactive graph of the Hilbert construction">
          <svg class="ee-envelope__svg" viewBox="0 0 760 440" aria-hidden="true">
            <defs>
              <radialGradient id="ee-envelope-field">
                <stop offset="0" stop-color="#203858" stop-opacity=".72"/>
                <stop offset="1" stop-color="#101c2d" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="ee-envelope-card" x2="0" y2="1" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#dcb981" stop-opacity=".085" />
                <stop offset="1" stop-color="#79b6da" stop-opacity=".045" />
              </linearGradient>
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
            <ellipse cx="370" cy="215" rx="345" ry="200" fill="url(#ee-envelope-field)" />
            <g data-layer="grid"></g>
            <g data-layer="volumes"></g>
            <g data-layer="edges"></g>
            <g data-layer="pulse"></g>
            <g data-layer="stations"></g>
          </svg>
          <div class="ee-envelope__cover" aria-hidden="true">
            <div class="ee-envelope__sheet ee-envelope__sheet--material">
              <span>Material</span><b aria-hidden="true">▦</b><strong>Registers, premises and figures</strong>
            </div>
            <div class="ee-envelope__sheet ee-envelope__sheet--grounds">
              <span>Grounds</span><strong>Square construction · Fig. 3</strong>
            </div>
            <div class="ee-envelope__sheet ee-envelope__sheet--interface">
              <span>Section</span><strong>Geometry of refinement</strong>
              <span class="ee-envelope__face-operation">Open section · Read source</span>
              <span class="ee-envelope__face-revision">Source revision <code data-face-hash></code></span>
            </div>
          </div>
          <div class="ee-envelope__points"></div>
        </div>
        <div class="ee-envelope__legend">
          <span><i aria-hidden="true"></i><span data-relation></span></span>
          <span>Drag to rotate <span aria-hidden="true">·</span> Select a node</span>
        </div>
        <label class="ee-envelope__node-picker">Inspect a node
          <select aria-label="Inspect a node">
            ${ids.map(id => `<option value="${id}">${records[id].label}</option>`).join('')}
          </select>
        </label>
      </div>
      <aside class="ee-envelope__inspector" aria-label="Selected graph object">
        <nav class="ee-envelope__crumb" aria-label="Object path"></nav>
        <div class="ee-envelope__detail" aria-live="polite"></div>
      </aside>
    </div>
    <p class="ee-envelope__lens-note" data-lens-note></p>
    <div class="ee-envelope__exercises">
      <section class="ee-envelope__exercise">
        <h3>Follow a question</h3>
        <p>In the square construction, which pricing rule makes every round cost the same?</p>
        <button type="button" data-run>Trace the answer</button>
        <div class="ee-envelope__query-result" aria-live="polite"></div>
      </section>
      <section class="ee-envelope__exercise">
        <div class="ee-envelope__exercise-top">
          <h3>Check the source revision</h3>
          <div class="ee-envelope__role" role="group" aria-label="Example role">
            <button type="button" data-role="reader" aria-pressed="true">Reader</button>
            <button type="button" data-role="editor" aria-pressed="false">Editor</button>
          </div>
        </div>
        <div class="ee-envelope__revision" aria-live="polite"></div>
      </section>
    </div>
    <details class="ee-envelope__mechanics">
      <summary>How Eigen builds the map, follows a question and checks its grounds</summary>
      <p>At ingestion, diffusion over related sources helps build groups at several levels of detail. A compiled question sets its conditions, narrows the groups, and follows the selected relationships to exact passages. On structured fields, conditional queries also pass filter messages through a graph of shared continuations.</p>
      <p>A claim fingerprint covers its source and direct prerequisites. Work can carry a review requirement farther through declared prerequisite links. In the example above, the sample correction travels from a source passage to the premise about width and reaches the answer that used it.</p>
    </details>
    <p class="ee-envelope__caption">Relationships follow the published paper. Source revision controls use a sample passage.</p>
  `;

  const $ = (selector, element = mount) => element.querySelector(selector);
  const stage = $('.ee-envelope__stage');
  const points = $('.ee-envelope__points');
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
    button.innerHTML = `<span class="ee-envelope__dot" aria-hidden="true"></span><span class="ee-envelope__label">${record.label}</span>`;
    points.append(button);
    return [id, button];
  }));

  const grids = [];
  for (let i = -5; i <= 5; i += 1) {
    const n = i * 0.8;
    grids.push([[n, -2.0, -2.8], [n, -2.0, 3]]);
  }
  for (let i = -3; i <= 3; i += 1) {
    const n = i * 0.92;
    grids.push([[-4.0, -2.0, n], [4.0, -2.0, n]]);
  }
  const gridLines = grids.map(() => {
    const line = document.createElementNS(svgNS, 'line');
    layers.grid.append(line);
    return line;
  });

  function project([x, y, z]) {
    const c = Math.cos(state.yaw);
    const s = Math.sin(state.yaw);
    const depth = -x * s + z * c;
    const factor = 12 / (12 + depth);
    return [
      380 + (x * c + z * s) * 74 * factor,
      194 - (y * Math.cos(state.pitch) + depth * Math.sin(state.pitch)) * 71 * factor,
      depth,
    ];
  }

  function xy(point) {
    return `${point[0].toFixed(1)},${point[1].toFixed(1)}`;
  }

  function rectangle(x, z, width, length, y) {
    return [
      [x, y, z], [x + width, y, z], [x + width, y, z + length], [x, y, z + length],
    ].map(project);
  }

  function prism(x, z, width, length, low, high, emphasis = false) {
    const top = rectangle(x, z, width, length, high);
    const bottom = rectangle(x, z, width, length, low);
    const v = p => p.map(xy).join(' ');
    const faces = top.map((point, i) => {
      const j = (i + 1) % top.length;
      return `<polygon points="${v([point, top[j], bottom[j], bottom[i]])}" />`;
    }).join('');
    return `<g class="ee-envelope__volume${emphasis ? ' is-emphasized' : ''}">${faces}<polygon class="ee-envelope__volume-top" points="${v(top)}"/></g>`;
  }

  function lineBetween(a, b) {
    const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const clip = Math.min(0.29, 12 / Math.max(1, distance));
    return [
      [a[0] + (b[0] - a[0]) * clip, a[1] + (b[1] - a[1]) * clip],
      [b[0] + (a[0] - b[0]) * clip, b[1] + (a[1] - b[1]) * clip],
    ];
  }

  function draw() {
    const projected = Object.fromEntries(ids.map(id => [id, project(state.positions[id])]));
    const needsReview = state.source !== state.accepted;
    state.projected = projected;
    gridLines.forEach((line, i) => {
      const [a, b] = grids[i].map(project);
      line.setAttribute('x1', a[0]);
      line.setAttribute('y1', a[1]);
      line.setAttribute('x2', b[0]);
      line.setAttribute('y2', b[1]);
    });
    let volumes = '';
    if (state.lens === 'membership') {
      const lit = ['register', 'cell'].includes(state.selected);
      volumes = prism(-3.45, -1.4, 6.7, 3.7, -1.86, 1.28 - state.lid * 0.43)
        + prism(-2.84, -1.18, 2.22, 2.10, -1.83, -0.32 + state.lid * 0.74, lit)
        + prism(-2.79, -1.14, 1.05, 0.97, -1.82, -0.52, state.selected === 'cell')
        + prism(-1.70, -1.14, 1.05, 0.97, -1.82, -0.52)
        + prism(-2.79, -0.13, 1.05, 0.97, -1.82, -0.52)
        + prism(-1.70, -0.13, 1.05, 0.97, -1.82, -0.52);
    } else if (state.lens === 'inference') {
      volumes = prism(-1.7, -1.35, 3.75, 2.38, -1.96, -1.38)
        + prism(-0.65, -0.71, 1.35, 1.25, 1.02, 1.69, state.selected === 'claim');
    } else {
      volumes = prism(1.19, -1.33, 1.82, 2.7, -1.85, -1.31)
        + prism(1.49, -1.01, 1.4, .82, -.99, -.61, state.selected === 'fig4')
        + prism(1.12, .17, 1.43, .83, .62, 1.21, state.selected === 'fig3');
    }
    layers.volumes.innerHTML = volumes;
    const active = phases[state.phase]?.ids;
    layers.edges.innerHTML = lenses[state.lens].edges.map(([from, to]) => {
      const [a, b] = lineBetween(projected[from], projected[to]);
      const marker = state.lens === 'membership' ? '' : ` marker-end="url(#ee-envelope-arrow-${state.lens === 'evidence' ? 'teal' : 'blue'})"`;
      const near = (active?.includes(from) && active?.includes(to)) || state.selected === from || state.selected === to;
      const affected = needsReview && from === 'claim' && to === 'width';
      return `<path class="ee-envelope__edge ee-envelope__edge--${state.lens}${near ? ' is-near' : ''}${affected ? ' is-affected' : ''}" d="M${xy(a)} L${xy(b)}"${marker}/>`;
    }).join('');
    layers.stations.innerHTML = ids.map(id => {
      const [x, y, depth] = projected[id];
      const feet = project([state.positions[id][0], -2.0, state.positions[id][2]]);
      const radius = id === state.selected ? 15 : 9;
      return `<g class="ee-envelope__station" data-tone="${records[id].tone}">
        <path d="M${xy([x, y])} L${xy(feet)}"/>
        <ellipse cx="${feet[0]}" cy="${feet[1]}" rx="${10 - depth * 0.7}" ry="3.5"/>
        <circle cx="${x}" cy="${y}" r="${radius}"/>
      </g>`;
    }).join('');
    ids.forEach(id => {
      const [x, y, depth] = projected[id];
      const button = buttons[id];
      button.style.left = `${x / 7.6}%`;
      button.style.top = `${y / 4.4}%`;
      button.style.zIndex = state.selected === id ? '35' : String(Math.round(18 - depth * 2));
      button.classList.toggle('is-selected', state.selected === id);
      button.classList.toggle('is-review-required', needsReview && id === 'claim');
      button.classList.toggle('is-on-route', Boolean(active?.includes(id)));
      button.classList.toggle('is-off-route', Boolean(active && !active.includes(id)));
      button.setAttribute('aria-pressed', String(state.selected === id));
      if (id === 'claim') {
        button.setAttribute('aria-label', needsReview ? 'Claim: Constant cost per level, review required' : 'Claim: Constant cost per level');
      }
    });
  }

  function moveTo(lens, yaw = state.yaw, pitch = state.pitch, duration = 420) {
    cancelAnimationFrame(state.spinning);
    const start = performance.now();
    const from = { yaw: state.yaw, pitch: state.pitch, lid: state.lid, positions: structuredClone(state.positions) };
    const destination = lenses[lens].positions;
    const turn = Math.atan2(Math.sin(yaw - from.yaw), Math.cos(yaw - from.yaw));
    const open = ['register', 'cell'].includes(state.selected) ? 1 : 0;
    function step(now) {
      const t = motion.matches ? 1 : Math.min(1, (now - start) / duration);
      const weight = 1 - (1 - t) ** 3;
      state.yaw = from.yaw + turn * weight;
      state.pitch = from.pitch + (pitch - from.pitch) * weight;
      state.lid = from.lid + (open - from.lid) * weight;
      ids.forEach(id => {
        state.positions[id] = destination[id].map((value, index) =>
          from.positions[id][index] + (value - from.positions[id][index]) * weight);
      });
      draw();
      if (t < 1) state.spinning = requestAnimationFrame(step);
    }
    if (motion.matches) step(start);
    else state.spinning = requestAnimationFrame(step);
  }

  function pulseEdges(edges, tone) {
    cancelAnimationFrame(state.pulseFrame);
    layers.pulse.innerHTML = '';
    if (motion.matches) return;
    const start = performance.now();
    function frame(now) {
      const elapsed = now - start;
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

  function showCover(visible) {
    state.closeUp = visible;
    stage.classList.toggle('is-close-up', visible);
    const button = $('[data-cover]');
    button.setAttribute('aria-pressed', String(visible));
    button.textContent = visible ? 'Show graph' : 'Close-up';
    points.inert = visible;
  }

  function openGraph() {
    clearTimeout(state.introTimer);
    if (!state.closeUp) return;
    showCover(false);
    moveTo(state.lens, baseAngle[state.lens], defaultTilt, 1100);
    if (state.lens === 'membership') pulseEdges([['section', 'register'], ['register', 'cell']], 'gold');
  }

  function detail(id) {
    const item = records[id];
    const inSection = id !== 'section';
    const parent = id === 'cell' ? 'register' : ['fig3', 'fig4'].includes(id) ? 'claim' : null;
    return {
      path: `${inSection ? '<button type="button" data-open="section">Section</button><span aria-hidden="true">›</span>' : '<span>Paper</span><span aria-hidden="true">›</span>'}
        ${parent ? `<button type="button" data-open="${parent}">${records[parent].kind}</button><span aria-hidden="true">›</span>` : ''}
        <span aria-current="location">${item.kind}</span>`,
      body: `<p class="ee-envelope__kind" data-tone="${item.tone}">${item.kind}</p>
        <h3 tabindex="-1">${item.label}</h3>
        <p>${item.summary}</p>
        ${item.caption ? `<p class="ee-envelope__figure-caption">${item.caption}</p>` : ''}
        ${item.next ? `<div class="ee-envelope__open">${item.next.map(next => `<button type="button" data-open="${next}">Open ${records[next].kind === 'Evidence' ? records[next].label : records[next].kind.toLowerCase()} <span aria-hidden="true">→</span></button>`).join('')}</div>` : ''}
        <a href="${paper}&amp;page=${item.page}">Read ${item.caption ? 'figure and caption' : 'the source passage'} <span aria-hidden="true">↗</span></a>`,
    };
  }

  function select(id, focus = false) {
    if (!records[id]) return;
    const prior = state.selected;
    state.selected = id;
    picker.value = id;
    const view = detail(id);
    $('.ee-envelope__crumb').innerHTML = view.path;
    const selected = $('.ee-envelope__detail');
    selected.innerHTML = view.body;
    if (focus) $('h3', selected).focus({ preventScroll: true });
    draw();
    if (state.lens === 'membership' && (['register', 'cell'].includes(id) || ['register', 'cell'].includes(prior))) {
      moveTo(state.lens);
    }
    if (focus && prior !== id) pulseEdges([[prior, id]], records[id].tone);
  }

  function stopQuestion() {
    if (state.timers.length && state.phase === 0) $('.ee-envelope__query-result').textContent = '';
    state.timers.forEach(clearTimeout);
    state.timers = [];
    $('[data-run]').disabled = false;
  }

  function sourceWeights(rounds) {
    let weights = [1, 0, 0, 0];
    const share = 0.4;
    for (let round = 0; round < rounds; round += 1) {
      const next = weights.map(weight => (1 - share) * weight);
      traceSources.forEach((source, index) => {
        const neighbours = source.links.filter(other => traceSources[other].eligible);
        if (!neighbours.length) next[index] += share * weights[index];
        else neighbours.forEach(other => { next[other] += share * weights[index] / neighbours.length; });
      });
      weights = next;
    }
    return `<div class="ee-envelope__allocation">
      <p>Illustrative source weights · square construction</p>
      <ul>${traceSources.map((source, i) => {
        const percent = Math.round(100 * weights[i]);
        return `<li><span>${source.label}</span><span>${source.eligible ? `${percent}%` : 'Outside scope'}</span>
          <span class="ee-envelope__weight" aria-hidden="true"><i style="width:${percent}%"></i></span></li>`;
      }).join('')}</ul>
    </div>`;
  }

  function runQuestion() {
    stopQuestion();
    openGraph();
    $('[data-run]').disabled = true;
    const answer = $('.ee-envelope__query-result');
    const advance = phase => {
      state.phase = phase;
      const step = phases[phase];
      displayLens(step.lens);
      moveTo(step.lens, baseAngle[step.lens]);
      pulseEdges(step.edges, phase ? 'teal' : 'gold');
      answer.innerHTML = `<p><strong>Area pricing.</strong> Each round divides four times as many squares, each with one quarter of the area. Under wall-length pricing the cost per round doubles.</p>
        <p>${step.status}</p>${sourceWeights(phase + 1)}
        <a href="#refinement">Compare the cost curves ↓</a>
        <a href="${paper}&amp;page=10">Open Figure 3 ↗</a>`;
      if (phase !== phases.length - 1) return;
      select('claim');
      answer.insertAdjacentHTML('beforeend', `<blockquote>“a price set by area (γ = 2) adds the same increment … at every depth”</blockquote>
        <a href="/demo/writing/#proposal">Review the wording in the app ↗</a>`);
      const run = $('[data-run]');
      run.textContent = 'Trace again';
      run.disabled = false;
      state.timers = [];
    };
    if (motion.matches) advance(phases.length - 1);
    else {
      advance(0);
      state.timers.push(setTimeout(() => advance(1), 1150));
    }
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
      ${(state.preview || !current) ? `<div class="ee-envelope__preview">
        <p><strong>Earlier passage</strong> ${samples[0]}</p><p><strong>${applied ? 'Current passage' : 'Proposed passage'}</strong> ${samples[1]}</p>
      </div>` : ''}
      <div class="ee-envelope__revision-actions">
        ${!editable ? '<span>Reader access · Open and check sources</span>' : !applied && !state.preview
          ? '<button type="button" data-revision="preview">Preview source correction</button>' : !applied
            ? '<button type="button" data-revision="apply">Apply sample correction</button>' : !current
              ? '<button type="button" data-revision="review">Record a fresh review</button>' : ''}
        ${applied || state.preview ? '<button type="button" data-revision="reset">Reset sample</button>' : ''}
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
        moveTo(state.lens, baseAngle.inference);
        pulseEdges([['width', 'claim']], 'amber');
      }
      if (action === 'review' && state.source !== state.accepted) {
        stopQuestion();
        state.prior = state.accepted;
        state.accepted = state.source;
        displayLens('evidence');
        select('claim');
        moveTo(state.lens, baseAngle.evidence);
        pulseEdges([['fig3', 'claim']], 'teal');
      }
    }
    revision();
    const next = action === 'preview' ? 'apply' : action === 'apply' ? 'review' : action === 'review' ? 'reset' : 'preview';
    $(`[data-revision="${next}"]`)?.focus({ preventScroll: true });
  }

  function startDrag(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    if (event.target.closest('button') || state.closeUp) return;
    state.engaged = true;
    cancelAnimationFrame(state.spinning);
    state.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: state.yaw, pitch: state.pitch, turned: false };
  }

  function drag(event) {
    const tracking = state.drag;
    if (!tracking || tracking.id !== event.pointerId) return;
    const dx = event.clientX - tracking.x;
    const dy = event.clientY - tracking.y;
    if (!tracking.turned && Math.abs(dx) < 5) return;
    if (!tracking.turned) {
      tracking.turned = true;
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
    if (turned) moveTo(state.lens);
  }

  mount.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    state.engaged = true;
    if (button.hasAttribute('data-cover')) {
      clearTimeout(state.introTimer);
      if (state.closeUp) openGraph();
      else {
        stopQuestion();
        state.phase = -1;
        showCover(true);
        select('section');
      }
    } else if (button.hasAttribute('data-lens')) {
      openGraph();
      stopQuestion();
      state.phase = -1;
      displayLens(button.dataset.lens);
      moveTo(state.lens, baseAngle[state.lens]);
    } else if (button.hasAttribute('data-orbit')) {
      openGraph();
      const delta = Number(button.dataset.orbit);
      if (delta) moveTo(state.lens, state.yaw + delta * 0.38);
      else moveTo(state.lens, baseAngle[state.lens], defaultTilt);
    } else if (button.dataset.point) {
      select(button.dataset.point);
    } else if (button.dataset.open) {
      select(button.dataset.open, true);
      openGraph();
    } else if (button.hasAttribute('data-run')) {
      runQuestion();
    } else if (button.dataset.role) {
      state.role = button.dataset.role;
      state.preview = false;
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
    state.engaged = true;
    openGraph();
    select(picker.value);
  });
  displayLens(state.lens);
  select(state.selected);
  revision();

  if (!motion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (state.engaged || motion.matches) return;
      showCover(true);
      state.yaw = baseAngle.membership - 0.71;
      state.pitch = 0.73;
      state.lid = 0.65;
      ids.forEach(id => {
        const [x, y, z] = state.positions[id];
        state.positions[id] = [x * 0.86, y * 0.48, z * 0.64];
      });
      draw();
      state.introTimer = setTimeout(openGraph, 1420);
    }, { threshold: 0.33 });
    observer.observe(stage);
  }
})();
