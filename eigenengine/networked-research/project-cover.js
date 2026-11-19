(() => {
  'use strict';

  const cover = document.querySelector('#nr-project-cover');
  const canvas = cover?.querySelector('svg');
  if (!canvas) return;

  const namespace = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 650px)');
  const duration = 9300;
  const stages = [
    { label: 'Whole network', time: 0 },
    { label: 'Follow the citation', time: 2050 },
    { label: 'Recover the evidence', time: 6200 },
    { label: 'Explore possible peers', time: duration }
  ];
  const evidence = {
    revision: 1, figure: 'Figure 2(b,c)', page: 5,
    record: '6a609122932f28d4c5ce19296b919598ca7b213d0e7734ecbf41a47d2dadb737'
  };

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => clamp(value) ** 2 * (3 - 2 * clamp(value));
  const mix = (a, b, amount) => a + (b - a) * amount;

  function svg(parent, tag, attrs, text) {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    parent.append(node);
    return node;
  }

  function shape(parent, style, size) {
    const node = svg(parent, 'g', { class: `nr-cover-node nr-cover-node--${style}` });
    svg(node, 'path', { d: `M${-size} 0L0 ${size * .48}L${size} 0v5L0 ${size * .48 + 5}L${-size} 5Z`, class: 'nr-cover-node-shadow' });
    svg(node, 'path', { d: `M${-size} 0L0 ${-size * .49}L${size} 0L0 ${size * .49}Z`, class: 'nr-cover-node-top' });
    return node;
  }

  function position(node, point, scale = 1) {
    node.setAttribute('transform', `translate(${point.join(' ')}) scale(${scale})`);
  }

  function branch(from, to, amount = 1) {
    const x = mix(from[0], to[0], amount);
    const y = mix(from[1], to[1], amount);
    const elbow = mix(from[1], y, .59);
    return { point: [x, y], path: `M${from[0]} ${from[1]}C${from[0]} ${elbow} ${x} ${elbow} ${x} ${y}` };
  }

  function linkCurve(from, to, rise) {
    const span = to[0] - from[0];
    return `M${from.join(' ')}C${from[0] + span * .43} ${from[1] + rise} ${to[0] - span * .40} ${to[1] + rise} ${to.join(' ')}`;
  }

  function makeScene(phone) {
    const size = phone ? [496, 428] : [760, 385];
    const projects = phone ? [
      { name: 'Kalmár follow-up', point: [92, 81], label: [92, 42], side: 'known' },
      { name: 'Cost manuscript', point: [292, 94], label: [292, 49], side: 'cost' },
      { name: 'Search project', point: [104, 366], label: [104, 406], side: 'possible' },
      { name: 'Replication', point: [395, 368], label: [395, 406], side: 'possible' }
    ] : [
      { name: 'Kalmár follow-up', point: [109, 106], label: [109, 48], side: 'known' },
      { name: 'Cost manuscript', point: [360, 97], label: [360, 48], side: 'cost' },
      { name: 'Search project', point: [653, 138], label: [653, 80], side: 'possible' },
      { name: 'Replication', point: [643, 301], label: [643, 361], side: 'possible' }
    ];
    const [kalmar, cost, search, replica] = projects;
    const family = phone ? [[188, 173], [292, 171], [398, 173]] : [[242, 183], [360, 181], [478, 183]];
    const offsets = phone ? [-28, 0, 28] : [-39, 0, 39];
    const bottom = phone ? 252 : 262;
    const evidencePoint = [family[1][0] + offsets[2], bottom + 4];

    canvas.replaceChildren();
    canvas.removeAttribute('aria-hidden');
    canvas.setAttribute('viewBox', `0 0 ${size.join(' ')}`);
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'The Kalmár follow-up cites the Cost manuscript. The Cost manuscript opens into its branches and recovers Figure 2 from the pinned record. Dashed links show two possible uses in a search and a replication project.');

    const defs = svg(canvas, 'defs', {});
    const grid = svg(defs, 'pattern', { id: 'nr-network-cover-grid', width: 19, height: 19, patternUnits: 'userSpaceOnUse' });
    svg(grid, 'circle', { cx: 3, cy: 3, r: .8, fill: '#81adca', opacity: .39 });
    const light = svg(defs, 'radialGradient', { id: 'nr-network-cover-light', cx: '50%', cy: '46%', r: '65%' });
    svg(light, 'stop', { offset: '0', 'stop-color': '#233e56' });
    svg(light, 'stop', { offset: '1', 'stop-color': '#0a1727' });
    svg(canvas, 'rect', { width: size[0], height: size[1], fill: 'url(#nr-network-cover-light)' });
    svg(canvas, 'rect', { width: size[0], height: size[1], fill: 'url(#nr-network-cover-grid)' });

    const planes = svg(canvas, 'g', {});
    const edges = svg(canvas, 'g', {});
    const nodes = svg(canvas, 'g', {});
    const overlays = svg(canvas, 'g', {});
    const [cx, cy] = cost.point;

    const floor = svg(planes, 'g', { class: 'nr-cover-floor' });
    const floorPath = svg(floor, 'path', { class: 'nr-cover-floor-shadow', transform: 'translate(0,9)' });
    const floorTop = svg(floor, 'path', { class: 'nr-cover-floor-top' });
    const boundary = svg(planes, 'path', { class: 'nr-cover-project-boundary' });
    const front = svg(edges, 'path', { class: 'nr-cover-front' });

    function miniature(project, direction) {
      const mini = svg(nodes, 'g', { class: `nr-cover-mini nr-cover-mini--${project.side}` });
      position(mini, project.point);
      const familyY = direction * 33;
      const leafY = direction * 53;
      svg(mini, 'path', {
        class: 'nr-cover-mini-floor',
        d: `M-51 ${leafY}L-4 ${leafY - 11}L49 ${leafY - 2}L4 ${leafY + 11}Z`
      });
      [-30, 0, 30].forEach(x => {
        const parent = [x, familyY];
        svg(mini, 'path', { class: 'nr-cover-mini-wire', d: branch([0, direction * 10], parent).path });
        position(shape(mini, project.side === 'possible' ? 'peer' : 'family', 6.1), parent);
        [-10, 10].forEach(dx => {
          const target = [x + dx, leafY - (x === 0 ? 4 : 0)];
          svg(mini, 'path', { class: 'nr-cover-mini-wire nr-cover-mini-wire--fine', d: branch(parent, target).path });
          position(shape(mini, 'leaf', 3.7), target);
        });
      });
    }

    function drawObject(project, index) {
      if (project.side !== 'cost') miniature(project, index >= (phone ? 2 : 3) ? -1 : 1);
      const marker = svg(nodes, 'g', { class: `nr-cover-object nr-cover-object--${project.side}` });
      position(marker, project.point);
      svg(marker, 'path', { class: 'nr-cover-object-hull', d: 'M-29 -15H28L39 -4V13L27 25H-27L-39 13V-4Z' });
      const layers = project.side === 'cost' ? [6] : [10, 5];
      layers.forEach((vertical, index) => {
        const plate = shape(marker, project.side === 'possible' ? 'peer' : 'root', 19 - index * 4);
        plate.setAttribute('transform', `translate(0 ${vertical})`);
      });
      svg(marker, 'circle', { r: 3.1, class: 'nr-cover-object-mark', cy: -2 });
      svg(nodes, 'text', { x: project.label[0], y: project.label[1], class: 'nr-cover-project' }, project.name);
      if (project.side === 'possible') {
        svg(marker, 'path', { d: 'M-16 16v5m16-5v5m16-5v5', class: 'nr-cover-peer-ports' });
      }
    }

    const referencePath = linkCurve(kalmar.point, cost.point, phone ? -14 : -29);
    const cited = svg(edges, 'path', { class: 'nr-cover-cited', d: referencePath });
    const verified = svg(edges, 'path', { class: 'nr-cover-cited nr-cover-cited--track', d: referencePath, pathLength: 1 });
    const possibilities = [search, replica].map((project, index) => {
      const rise = phone ? (index === 0 ? 37 : 32) : (index === 0 ? -20 : 41);
      const path = svg(edges, 'path', { class: 'nr-cover-possible' });
      const pulse = svg(overlays, 'circle', { class: 'nr-cover-possible-pulse', r: 5, opacity: 0 });
      return { path, pulse, point: project.point, rise };
    });

    projects.forEach(drawObject);
    const clusters = family.map((point, index) => {
      const group = svg(nodes, 'g', { class: 'nr-cover-cluster' });
      const root = shape(group, 'family', index === 1 ? 12 : 10);
      const label = svg(group, 'text', { class: 'nr-cover-group-label', y: -15 }, ['Claims', 'Figures', 'Notes'][index]);
      const edge = svg(edges, 'path', { class: 'nr-cover-stem' });
      const leaves = offsets.map((shift, leafIndex) => {
        const leaf = [point[0] + shift, bottom + (leafIndex === 1 ? -12 : 4)];
        const stem = svg(edges, 'path', { class: 'nr-cover-stem nr-cover-stem--fine' });
        const node = shape(nodes, 'leaf', 7.5);
        return { leaf, stem, node };
      });
      return { point, group, root, label, edge, leaves };
    });

    const citationPacket = svg(overlays, 'circle', { r: 5.9, class: 'nr-cover-citation-packet' });
    const proofPacket = svg(overlays, 'g', { class: 'nr-cover-packet' });
    svg(proofPacket, 'circle', { r: 15, class: 'nr-cover-halo' });
    shape(proofPacket, 'package', 8);
    svg(proofPacket, 'circle', { r: 2.9, class: 'nr-cover-distinction' });

    const proofLegs = [branch(cost.point, family[1]).path, branch(family[1], evidencePoint).path].map(d =>
      svg(edges, 'path', { class: 'nr-cover-proof-leg', d, opacity: 0 })
    );
    const evidenceMark = svg(overlays, 'text', {
      x: evidencePoint[0], y: evidencePoint[1] + (phone ? 29 : 25),
      class: 'nr-cover-annotation'
    }, 'Figure 2');
    return { phone, cx, cy, cost, floorPath, floorTop, boundary, front, cited, verified, possibilities,
      clusters, citationPacket, proofPacket, proofLegs, evidenceMark, evidencePoint };
  }

  function pointOn(path, progress) {
    const point = path.getPointAtLength(path.getTotalLength() * clamp(progress));
    return [point.x, point.y];
  }

  function draw(time) {
    const citation = smooth((time - 210) / 1810);
    const open = smooth((time - 1450) / 2450);
    const leaves = smooth((time - 2500) / 1750);
    const proof = smooth((time - 4220) / 1810);
    const finished = smooth((time - 5750) / 540);
    const peers = smooth((time - 6560) / 2650);
    const { cx, cy, cost } = scene;
    const spread = mix(59, scene.phone ? 147 : 170, open);
    const bottom = mix(cy + 81, scene.phone ? 294 : 315, leaves);
    const surface = `M${cx - spread} ${bottom - 25}L${cx - 14} ${bottom - 61}L${cx + spread} ${bottom - 23}L${cx + 12} ${bottom + 12}Z`;
    scene.floorPath.setAttribute('d', surface);
    scene.floorTop.setAttribute('d', surface);
    scene.boundary.setAttribute('d', `M${cx - spread} ${cy + 37}Q${cx - spread} ${cy + 27} ${cx - spread + 11} ${cy + 27}H${cx + spread - 10}Q${cx + spread} ${cy + 27} ${cx + spread} ${cy + 37}V${bottom - 20}L${cx + spread - 11} ${bottom - 10}H${cx - spread + 11}L${cx - spread} ${bottom - 20}Z`);
    scene.boundary.setAttribute('opacity', .16 + .4 * open);
    const frontY = mix(cy + 21, bottom - 32, (open + leaves) / 2);
    scene.front.setAttribute('d', `M${cx - spread + 3} ${frontY}H${cx + spread - 3}`);
    scene.front.setAttribute('opacity', .72 * Math.sin(Math.PI * ((open + leaves) / 2)));

    scene.verified.setAttribute('stroke-dasharray', `${citation} 1`);
    scene.verified.setAttribute('opacity', citation > 0 ? .88 : 0);
    const [linkX, linkY] = pointOn(scene.cited, citation);
    scene.citationPacket.setAttribute('cx', linkX);
    scene.citationPacket.setAttribute('cy', linkY);
    scene.citationPacket.setAttribute('opacity', Math.min(1, Math.sin(citation * Math.PI) * 1.8));

    let networkExit = cost.point;
    scene.clusters.forEach((cluster, index) => {
      const grown = mix(.33, 1, smooth((open - index * .06) / .86));
      const parent = branch(cost.point, cluster.point, grown);
      cluster.edge.setAttribute('d', parent.path);
      cluster.edge.setAttribute('opacity', .50 + grown * .35);
      cluster.group.setAttribute('opacity', .62 + grown * .38);
      cluster.label.setAttribute('opacity', smooth((open - .3) / .45));
      position(cluster.group, parent.point, .68 + grown * .32);
      cluster.leaves.forEach(({ leaf, stem, node }, childIndex) => {
        const growth = mix(.34, 1, smooth((leaves - index * .07 - childIndex * .055) / .67));
        const spacedLeaf = leaf.map((value, axis) => mix(cost.point[axis], value, growth));
        const child = branch(parent.point, spacedLeaf);
        stem.setAttribute('d', child.path);
        stem.setAttribute('opacity', .4 + .24 * growth);
        node.setAttribute('opacity', .54 + .46 * growth);
        position(node, child.point, .45 + growth * .55);
        if (index === 1 && childIndex === 2) networkExit = child.point;
      });
    });

    scene.proofLegs.forEach((path, index) => path.setAttribute('opacity', clamp(proof * 2 - index) * .9));
    const leg = proof < .5 ? 0 : 1;
    const proofPoint = pointOn(scene.proofLegs[leg], proof * 2 - leg);
    position(scene.proofPacket, proofPoint, mix(.58, 1, finished));
    scene.proofPacket.setAttribute('opacity', proof > 0 ? .3 + .7 * clamp(proof * 5) : 0);
    scene.evidenceMark.setAttribute('opacity', finished);

    scene.possibilities.forEach(({ path, pulse, point, rise }, index) => {
      const share = smooth((peers - index * .13) / .86);
      path.setAttribute('d', linkCurve(networkExit, point, rise));
      path.setAttribute('opacity', .39 + share * .51);
      const [x, y] = pointOn(path, share);
      pulse.setAttribute('cx', x);
      pulse.setAttribute('cy', y);
      pulse.setAttribute('opacity', Math.sin(share * Math.PI) * .88);
    });

    canvas.dataset.progress = time.toFixed(1);
    canvas.dataset.evidence = finished > .8 ? 'pinned' : 'unopened';
    canvas.dataset.peers = peers.toFixed(4);
  }

  const footer = document.createElement('div');
  footer.className = 'nr-cover-footer';
  footer.innerHTML = `
    <div class="nr-cover-legend"><span class="nr-cover-legend-cited">Documented citation</span><span class="nr-cover-legend-possible">Possible link</span></div>
    <div class="nr-cover-inspection">
      <select aria-label="Inspect a stage of the research network">
        ${stages.map(({ label }, index) => `<option value="${index}">${label}</option>`).join('')}
      </select>
      <button type="button" class="nr-cover-toggle"></button>
    </div>
    <div class="nr-cover-receipt">
      <span data-cover-status role="status"></span>
      <a href="/assets/docs/the-cost-of-complexity.pdf#page=${evidence.page}" target="_blank" rel="noopener"
        data-source-region="cost-fig-2bc" hidden title="Pinned Cost project record SHA-256: ${evidence.record}">${evidence.figure}, p. ${evidence.page} · project v${evidence.revision} ↗</a>
    </div>`;
  cover.append(footer);
  const fallbackCaption = cover.querySelector('figcaption');
  if (fallbackCaption) fallbackCaption.hidden = true;
  const toggle = footer.querySelector('button');
  const select = footer.querySelector('select');
  const status = footer.querySelector('[data-cover-status]');
  const source = footer.querySelector('a');

  let scene = makeScene(narrow.matches);
  let time = reduced.matches ? duration : 0;
  let active = !reduced.matches;
  let inView = false;
  let previewOpen = Boolean(document.querySelector('.ee-source-preview[open]'));
  let request = 0;
  let prior = null;
  let shownState = '';

  function controls() {
    toggle.hidden = reduced.matches;
    const label = time >= duration ? 'Trace again' : active ? 'Pause' : 'Resume';
    if (toggle.textContent !== label) toggle.textContent = label;
    toggle.setAttribute('aria-label', time >= duration ? 'Trace the research network again' : label + ' the research network animation');
    const stage = time < 1450 ? 0 : time < 5400 ? 1 : time < 6560 ? 2 : 3;
    const pinned = canvas.dataset.evidence === 'pinned';
    const state = `${stage}:${pinned}`;
    if (shownState === state) return;
    shownState = state;
    select.value = String(stage);
    const messages = [
      'Two documented projects and two possible peers.',
      'The citation opens the Cost manuscript.',
      pinned ? 'Recovered the figure from the pinned manuscript.' : 'Opening Figure 2 in the pinned manuscript.',
      'Kalmár cites Figure 2 in Cost. Two other projects could reuse it.'
    ];
    status.textContent = messages[stage];
    source.hidden = !pinned;
  }

  function resume() {
    const canPlay = active && inView && !previewOpen && !document.hidden && !reduced.matches && time < duration;
    if (canPlay && !request) request = window.requestAnimationFrame(tick);
    if (!canPlay) {
      window.cancelAnimationFrame(request);
      request = 0;
      prior = null;
    }
  }

  function paint() {
    draw(time);
    controls();
  }

  function tick(now) {
    request = 0;
    if (prior !== null) time = Math.min(duration, time + Math.max(0, Math.min(90, now - prior)));
    prior = now;
    paint();
    resume();
  }

  toggle.addEventListener('click', () => {
    if (time >= duration) {
      time = 0;
      active = true;
    } else {
      active = !active;
    }
    paint();
    resume();
  });

  select.addEventListener('change', () => {
    time = stages[Number(select.value)].time;
    active = false;
    paint();
    resume();
  });

  select.addEventListener('focus', () => {
    if (!active || time >= duration) return;
    active = false;
    controls();
    resume();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .54;
      resume();
    }, { threshold: .54 });
    observer.observe(canvas);
  } else {
    inView = true;
  }

  narrow.addEventListener('change', () => {
    scene = makeScene(narrow.matches);
    paint();
  });
  reduced.addEventListener('change', () => {
    time = reduced.matches ? duration : 0;
    active = !reduced.matches;
    paint();
    resume();
  });
  document.addEventListener('visibilitychange', resume);
  document.addEventListener('eigenengine-source-preview', event => {
    previewOpen = Boolean(event.detail?.open);
    resume();
  });

  paint();
  resume();
})();
