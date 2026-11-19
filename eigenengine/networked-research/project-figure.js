(function () {
  const mount = document.querySelector('#project-network');
  const format = 'eigenengine/worked-example-project@1';
  const scriptBase = document.currentScript?.src || document.baseURI;
  const exampleFile = new URL('./examples/kalmar-layouts-v1.json', scriptBase);
  const pace = [2050, 2250, 2550];

  async function readProject(url) {
    const embedded = Array.from(document.querySelectorAll('script[type="application/json"][data-project-record]'))
      .find(script => script.dataset.projectRecord === url.pathname.split('/').pop());
    let bytes;
    if (embedded) {
      bytes = new TextEncoder().encode(embedded.textContent);
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Project download unavailable');
      bytes = await response.arrayBuffer();
    }
    const project = JSON.parse(new TextDecoder().decode(bytes));
    if (project.format !== format) throw new Error('Unsupported project record');
    const nodes = new Map(project.nodes.map(node => [node.id, node]));
    return { project, nodes, url, bytes, embedded };
  }

  async function followReference(first, reference) {
    const url = new URL(reference.file, first.url);
    if (new URL('.', url).href !== new URL('.', first.url).href) return null;
    const target = await readProject(url);
    const digest = await crypto.subtle.digest('SHA-256', target.bytes);
    const hex = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const source = target.nodes.get(reference.evidence)?.source;
    const children = target.nodes.get(target.project.entry)?.children;
    const matches = target.project.id === reference.id && target.project.revision === reference.revision &&
      target.project.entry === reference.entry && hex === reference.sha256 &&
      children?.includes(reference.evidence) && source?.page === reference.page && source?.figure === reference.figure;
    return matches ? target : null;
  }

  // Route only the mass arriving on this step. Evidence nodes absorb it; a
  // citation with no open destination holds its mass on the originating node.
  function diffusion(first, target) {
    const key = (record, node) => `${record.project.id}/${node}`;
    const routes = new Map();
    for (const record of [first, target].filter(Boolean)) {
      for (const node of record.nodes.values()) {
        const exits = (node.routes || []).map(route => ({ to: key(record, route.node), share: route.share }));
        if (node.reference && target) exits.push({ to: key(target, node.reference.entry), share: 1 });
        routes.set(key(record, node.id), exits);
      }
    }
    const entry = key(first, first.project.entry);
    const frames = [new Map([[entry, 1]])];
    let moving = new Map(frames[0]);
    const settled = new Map();
    const add = (mass, node, amount) => mass.set(node, (mass.get(node) || 0) + amount);
    for (const _ of pace) {
      const next = new Map();
      for (const [node, amount] of moving) {
        const exits = routes.get(node);
        if (exits.length === 0) add(settled, node, amount);
        for (const { to, share } of exits) add(next, to, amount * share);
      }
      const frame = new Map(settled);
      for (const [node, amount] of next) add(frame, node, amount);
      frames.push(frame);
      moving = next;
    }
    return (step, record, node) => frames[step].get(key(record, node)) || 0;
  }

  function sourceLink(anchor, record, node) {
    const { file, viewerAsset } = record.project.document;
    const root = mount.dataset.sourceRoot;
    const viewer = mount.dataset.viewer || (root ? '' : '/demo/view/');
    let url;
    if (viewer) {
      url = new URL(viewer, document.baseURI);
      url.searchParams.set('asset', viewerAsset);
      url.searchParams.set('page', node.source.page);
    } else {
      url = new URL(file.replace(/^\//, ''), new URL(root, document.baseURI));
      url.hash = `page=${node.source.page}`;
    }
    anchor.href = url.href;
    anchor.textContent = `${node.source.figure}, p. ${node.source.page} ↗`;
    const region = {
      'eight-layouts': 'kalmar-fig-1a',
      'ref-1': 'kalmar-fig-1-caption',
      'address-in-two-layouts': 'cost-fig-2bc'
    }[node.id];
    if (region) anchor.dataset.sourceRegion = region;
  }

  function downloadLink(anchor, record) {
    anchor.href = record.embedded
      ? URL.createObjectURL(new Blob([record.bytes], {type: 'application/json'}))
      : record.url.href;
    anchor.download = record.url.pathname.split('/').pop();
  }

  function readAddress(rank, [registers, positions]) {
    const register = Math.floor((rank - 1) / positions);
    const position = (rank - 1) % positions;
    return {
      registerBits: register.toString(2).padStart(Math.log2(registers), '0'),
      positionBits: position.toString(2).padStart(Math.log2(positions), '0'),
      register: register + 1,
      position: position + 1
    };
  }

  function addAddresses(container, evidence) {
    for (const sizes of evidence.layouts) {
      const { registerBits, positionBits, register, position } = readAddress(evidence.rank, sizes);
      const row = document.createElement('div');
      const layout = document.createElement('dt');
      const address = document.createElement('dd');
      const binary = document.createElement('code');
      const split = document.createElement('span');
      const description = document.createElement('span');
      layout.textContent = sizes.join(' × ');
      binary.textContent = registerBits;
      split.textContent = positionBits;
      binary.append(split);
      binary.setAttribute('aria-label', `Binary address ${registerBits} split from ${positionBits}`);
      description.className = 'pn-address-description';
      description.textContent = `Register ${register} → position ${position}`;
      binary.title = description.textContent;
      address.append(binary, description);
      row.append(layout, address);
      container.append(row);
    }
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => clamp(value) ** 2 * (3 - 2 * clamp(value));
  const mix = (start, end, amount) => start + (end - start) * amount;
  const stepEnds = [0, ...pace.map((_, index) => pace.slice(0, index + 1).reduce((sum, interval) => sum + interval, 0))];

  function svg(parent, tag, attrs = {}, label) {
    const element = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
    if (label) element.textContent = label;
    parent.append(element);
    return element;
  }

  function branch([x1, y1], [x2, y2]) {
    const shoulder = mix(y1, y2, .52);
    return `M${x1} ${y1}C${x1} ${shoulder} ${x2} ${shoulder} ${x2} ${y2}`;
  }

  function makeScene(canvas, compact, evidence) {
    const width = compact ? 540 : 1000;
    const left = compact ? 13 : 30;
    const hullWidth = compact ? 219 : 414;
    const right = width - left - hullWidth;
    const leftCentre = left + hullWidth / 2;
    const rightCentre = right + hullWidth / 2;
    const positions = {
      origin: [leftCentre, 92],
      layouts: [leftCentre - hullWidth * .235, 171],
      citation: [leftCentre + hullWidth * .235, 171],
      destination: [rightCentre, 92],
      evidence: [rightCentre, 171],
      first: [rightCentre - hullWidth * .245, 266],
      second: [rightCentre + hullWidth * .245, 266]
    };
    const [sourceX, sourceY] = positions.citation;
    const [targetX, targetY] = positions.destination;
    canvas.replaceChildren();
    canvas.setAttribute('viewBox', `0 0 ${width} 355`);

    const defs = svg(canvas, 'defs');
    const grid = svg(defs, 'pattern', { id: 'pn-grid', width: 18, height: 18, patternUnits: 'userSpaceOnUse' });
    svg(grid, 'circle', { cx: 2, cy: 2, r: .8 });
    svg(canvas, 'rect', { class: 'pn-grid-fill', width, height: 355 });

    function hull(x, type) {
      const group = svg(canvas, 'g', { class: `pn-hull pn-hull--${type}` });
      svg(group, 'path', {
        d: `M${x + 13} 33H${x + hullWidth - 12}L${x + hullWidth} 45V315L${x + hullWidth - 13} 330H${x + 12}L${x} 316V47Z`
      });
      return group;
    }
    const localHull = hull(left, 'local');
    const costHull = hull(right, 'cost');
    svg(localHull, 'text', { class: 'pn-project-title', x: leftCentre, y: 59 }, 'Kalmár project');
    svg(costHull, 'text', { class: 'pn-project-title', x: rightCentre, y: 59 }, 'Cost of Complexity');

    function frontier(x) {
      const layer = svg(canvas, 'g', { class: 'pn-frontier', opacity: 0 });
      svg(layer, 'rect', { x: x + 8, y: -9, width: hullWidth - 16, height: 18, rx: 2 });
      svg(layer, 'path', { d: `M${x + 8} 0h${hullWidth - 16}` });
      return layer;
    }
    const localFront = frontier(left);
    const costFront = frontier(right);
    const edges = svg(canvas, 'g', { class: 'pn-edges' });
    const spawn = (from, to) => svg(edges, 'path', { d: branch(positions[from], positions[to]), class: 'pn-containment' });
    const splitLeft = spawn('origin', 'layouts');
    const splitRight = spawn('origin', 'citation');
    const evidenceBranch = spawn('destination', 'evidence');
    const resultEdges = [spawn('evidence', 'first'), spawn('evidence', 'second')];
    const boundary = svg(edges, 'path', {
      d: `M${sourceX} ${sourceY}C${width * .49} ${sourceY} ${width * .51} ${targetY} ${targetX} ${targetY}`,
      class: 'pn-crosslink'
    });
    const mid = boundary.getPointAtLength(boundary.getTotalLength() / 2);
    svg(edges, 'rect', { x: mid.x - 4, y: mid.y - 4, width: 8, height: 8, transform: `rotate(45 ${mid.x} ${mid.y})`, class: 'pn-boundary-diamond' });
    svg(edges, 'text', { x: mid.x, y: mid.y + (compact ? 19 : 24), class: 'pn-reference-label' }, 'Ref. [1]');

    const outcomeGlyph = svg(canvas, 'g', { class: 'pn-layout-glyphs' });
    const bars = evidence.layouts.map((layout, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = left + hullWidth * (.14 + col * .24);
      const y = 242 + row * 49;
      const tileWidth = hullWidth * .625 / 4;
      const wire = svg(outcomeGlyph, 'path', { d: branch(positions.layouts, [x, y]), class: 'pn-branch-fine' });
      const tile = svg(outcomeGlyph, 'g', { transform: `translate(${x} ${y})` });
      svg(tile, 'title', {}, layout.join(' × '));
      svg(tile, 'rect', { x: -tileWidth / 2, y: -8, width: tileWidth, height: 17, rx: 3, class: 'pn-layout-frame' });
      let start = -tileWidth / 2 + 4;
      const bitWidth = (tileWidth - 8) / 4;
      layout.forEach((factor, group) => {
        const length = Math.log2(factor) * bitWidth;
        svg(tile, 'rect', { x: start, y: -3.5, width: Math.max(1, length - 1), height: 8, rx: 1, class: `pn-layout-block pn-layout-block--${group % 2}` });
        start += length;
      });
      return { wire, tile };
    });
    svg(outcomeGlyph, 'text', { class: 'pn-glyph-caption', x: leftCentre, y: 318 }, 'Eight layouts');

    function marker(name, label, root = false) {
      const [x, y] = positions[name];
      const g = svg(canvas, 'g', { class: `pn-marker ${root ? 'pn-marker--root' : ''}`, transform: `translate(${x} ${y})`, 'data-node': name });
      const ring = svg(g, 'circle', { class: 'pn-mass-ring', r: 15, opacity: 0 });
      svg(g, 'circle', { class: 'pn-marker-point', r: root ? 7.5 : 6 });
      const text = svg(g, 'text', { y: root ? 29 : name === 'layouts' || name === 'citation' ? -14 : 29 }, label);
      return { g, ring, text };
    }
    const markers = {
      origin: marker('origin', 'Layout choice', true),
      layouts: marker('layouts', 'Layout count'),
      citation: marker('citation', 'Citation'),
      destination: marker('destination', 'Register address', true),
      evidence: marker('evidence', 'Symbol 11')
    };

    const addresses = ['first', 'second'].map(name => {
      const [x, y] = positions[name];
      const g = svg(canvas, 'g', { class: 'pn-address-glyph', transform: `translate(${x} ${y})` });
      svg(g, 'circle', { r: 5 });
      const bits = svg(g, 'text', { y: 24, class: 'pn-bit-code' });
      const description = svg(g, 'text', { y: 44, class: 'pn-bit-layout' });
      return { g, bits, description };
    });

    const packets = Array.from({ length: 4 }, () => svg(canvas, 'circle', { class: 'pn-packet', r: 4, opacity: 0 }));
    return { localHull, costHull, localFront, costFront, splitLeft, splitRight, evidenceBranch, resultEdges,
      boundary, outcomeGlyph, bars, markers, addresses, packets };
  }

  function paintPacket(dot, path, progress, amount) {
    if (progress <= 0 || progress >= 1 || amount <= 0) {
      dot.setAttribute('opacity', '0');
      return;
    }
    const point = path.getPointAtLength(path.getTotalLength() * progress);
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    dot.setAttribute('r', (2.2 + Math.sqrt(amount) * 3.6).toFixed(2));
    dot.setAttribute('opacity', Math.min(1, Math.sin(progress * Math.PI) * 1.45).toFixed(3));
  }

  function showFigure(first, target, citation) {
    mount.innerHTML = `
      <div class="pn-figure" data-pn-step="0" data-pn-scope="connected">
        <header class="pn-heading">
          <h3 data-pn="question"></h3>
          <div class="pn-controls">
            <div class="pn-scope" role="group" aria-label="Where the query can read">
              <button type="button" data-pn="local" aria-pressed="false">This project only</button>
              <button type="button" data-pn="connected" aria-pressed="true">Follow citation</button>
            </div>
            <button type="button" class="pn-pause" data-pn="pause">Play</button>
          </div>
        </header>
        <div class="pn-scene">
          <svg class="pn-board" role="img" viewBox="0 0 1000 355" aria-label="Two nested project trees with one documentary citation between them"></svg>
          <div class="pn-legend">
            <span class="pn-legend-tree">Contains</span><span class="pn-legend-link">Citation</span><span class="pn-legend-mass">Query weight</span>
          </div>
        </div>
        <p class="pn-status" data-pn="status" role="status"></p>
        <div class="pn-evidence" role="group" aria-label="Returned evidence">
          <section class="pn-answer">
            <h4 data-pn="bits">Layout choice</h4>
            <p data-pn="count">Eight layouts to inspect.</p>
            <a data-pn="layout-source" hidden></a>
          </section>
          <section class="pn-answer pn-cited-answer">
            <h4 data-pn="cite-title">Cited result</h4>
            <p data-pn="cite-wait">Both addresses will appear here.</p>
            <dl class="pn-addresses" data-pn="addresses" hidden></dl>
            <a data-pn="address-source" hidden></a>
          </section>
        </div>
      </div>
      <div class="pn-foot">
        <p>Project records <a data-pn="first-download" download>Kalmár JSON ↓</a> <a data-pn="target-download" download>Cost of Complexity JSON ↓</a> <a data-pn="cross-source">Citation [1] ↗</a></p>
        <details>
          <summary>How the route and evidence are checked</summary>
          <p data-pn="weights-note"></p>
          <p data-pn="verification"></p>
        </details>
      </div>`;

    const shell = mount.querySelector('.pn-figure');
    const canvas = mount.querySelector('.pn-board');
    const find = name => mount.querySelector(`[data-pn="${name}"]`);
    const write = (name, value) => {
      const element = find(name);
      if (element.textContent !== value) element.textContent = value;
    };
    const firstEntry = first.nodes.get(first.project.entry);
    const layouts = first.nodes.get(firstEntry.children[0]);
    const register = target?.nodes.get(target.project.entry);
    const addresses = target?.nodes.get(citation.reference.evidence);
    const layoutCount = layouts.evidence.layouts.length;
    const layoutBits = Math.log2(layoutCount);
    const localMass = diffusion(first, null);
    const connectedMass = diffusion(first, target);
    const countShare = localMass(1, first, layouts.id);
    const citationShare = localMass(1, first, citation.id);
    const connectedButton = find('connected');
    const localButton = find('local');
    const pauseButton = find('pause');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia('(max-width: 575px)');

    write('question', first.project.question);
    write('weights-note', `The animation starts with one unit of query weight. The fixture sends ${Math.round(countShare * 100)}% to the local count and ${Math.round(citationShare * 100)}% to the citation. The local count keeps its share. If the citation may be followed, its share reaches the original evidence. The two addresses are readings of that same evidence. The weights illustrate routing.`);
    downloadLink(find('first-download'), first);
    sourceLink(find('layout-source'), first, layouts);
    const crossSource = find('cross-source');
    sourceLink(crossSource, first, citation);
    crossSource.textContent = 'Citation [1] ↗';

    if (target) {
      sourceLink(find('address-source'), target, addresses);
      downloadLink(find('target-download'), target);
      write('verification', `This example verifies ${target.project.id} v${target.project.revision} by its SHA-256, then checks the entry and figure in the citation. The downloads also pin the source PDFs by SHA-256.`);
    } else {
      connectedButton.disabled = true;
      write('verification', 'The linked project revision could not be verified. The follow-up project and original caption are available.');
    }

    let connected = Boolean(target);
    let begun = false;
    let elapsed = 0;
    let paused = false;
    let visible = false;
    let framed = false;
    let previewOpen = Boolean(document.querySelector('.ee-source-preview[open]'));
    let frame = 0;
    let prior = null;
    let entryTimer;
    let paintedStep = -1;
    let paintedScope;
    let scene = makeScene(canvas, narrow.matches, layouts.evidence);
    const saved = { local: 0, connected: 0 };
    const scope = () => connected ? 'connected' : 'local';
    const limit = () => connected ? stepEnds[3] : stepEnds[1];
    const done = () => elapsed >= limit();

    function stageAt(time) {
      return stepEnds.findLastIndex(end => time >= end);
    }

    function paintGraph(time) {
      const phase = stageAt(time);
      const fraction = phase < 3 ? clamp((time - stepEnds[phase]) / pace[phase]) : 0;
      const localProgress = phase === 0 ? smooth(fraction) : 1;
      const crossing = connected ? phase === 1 ? smooth(fraction) : phase > 1 ? 1 : 0 : 0;
      const resolve = connected ? phase === 2 ? smooth(fraction / .58) : phase === 3 ? 1 : 0 : 0;
      const fan = connected ? phase === 2 ? smooth((fraction - .45) / .55) : phase === 3 ? 1 : 0 : 0;
      const weights = connected ? connectedMass : localMass;
      const available = weights(Math.min(phase + 1, connected ? 3 : 1), first, layouts.id);
      const pathWeights = {
        origin: 1 - localProgress,
        layouts: localProgress * available,
        citation: localProgress * citationShare * (1 - crossing),
        destination: crossing * citationShare * (1 - resolve),
        evidence: resolve * citationShare
      };
      canvas.dataset.mass = Object.values(pathWeights).reduce((sum, weight) => sum + weight, 0).toFixed(8);
      canvas.dataset.progress = String(time);
      const { localFront, costFront } = scene;
      localFront.setAttribute('transform', `translate(0 ${mix(92, 244, localProgress)})`);
      localFront.setAttribute('opacity', phase === 0 && time > 0 ? '.84' : '0');
      costFront.setAttribute('transform', `translate(0 ${mix(92, 279, Math.max(resolve * .55, fan))})`);
      costFront.setAttribute('opacity', connected && phase === 2 ? '.84' : '0');
      scene.costHull.classList.toggle('pn-hull--closed', !connected);
      scene.costHull.classList.toggle('pn-hull--arrived', crossing > .8);
      scene.boundary.setAttribute('opacity', connected ? .50 + crossing * .5 : .26);
      scene.boundary.classList.toggle('pn-crosslink--closed', !connected);
      scene.splitLeft.setAttribute('opacity', .48 + localProgress * .52);
      scene.splitRight.setAttribute('opacity', .48 + localProgress * .52);
      scene.evidenceBranch.setAttribute('opacity', connected ? .23 + resolve * .77 : 0);
      scene.outcomeGlyph.setAttribute('opacity', .15 + .85 * smooth((localProgress - .22) / .78));
      scene.bars.forEach(({ wire, tile }, index) => {
        const opening = smooth((localProgress - .35 - index * .035) / .41);
        wire.setAttribute('opacity', .18 + opening * .82);
        tile.setAttribute('opacity', .38 + opening * .62);
      });
      for (const [name, marker] of Object.entries(scene.markers)) {
        const weight = pathWeights[name];
        marker.ring.setAttribute('r', 9 + Math.sqrt(weight) * 19);
        marker.ring.setAttribute('opacity', Math.min(1, weight * 3.2));
        marker.g.classList.toggle('pn-marker--lit', weight > .02);
        if (name === 'layouts' || name === 'citation') marker.g.setAttribute('opacity', .43 + .57 * localProgress);
      }
      scene.markers.destination.text.textContent = !target ? 'Unverified' : connected ? 'Register address' : 'Outside scope';
      scene.markers.destination.g.setAttribute('opacity', connected ? .55 + crossing * .45 : .55);
      scene.markers.evidence.g.setAttribute('opacity', connected ? .24 + resolve * .76 : 0);
      scene.resultEdges.forEach((path, index) => {
        const rendered = connected && Boolean(addresses);
        const revealed = rendered ? smooth((fan - index * .05) / .9) : 0;
        const glyph = scene.addresses[index];
        path.setAttribute('opacity', rendered ? .18 + .82 * revealed : 0);
        glyph.g.setAttribute('opacity', rendered ? .24 + .76 * revealed : 0);
        const sizes = revealed > .08 ? addresses.evidence.layouts[index] : null;
        const address = sizes ? readAddress(addresses.evidence.rank, sizes) : null;
        const digits = address ? `${address.registerBits}│${address.positionBits}` : '';
        const sizesText = sizes ? sizes.join(' × ') : '';
        if (glyph.bits.textContent !== digits) glyph.bits.textContent = digits;
        if (glyph.description.textContent !== sizesText) glyph.description.textContent = sizesText;
      });

      paintPacket(scene.packets[0], scene.splitLeft, phase === 0 ? localProgress : 0, countShare);
      paintPacket(scene.packets[1], scene.splitRight, phase === 0 ? localProgress : 0, citationShare);
      paintPacket(scene.packets[2], scene.boundary, phase === 1 ? crossing : 0, citationShare);
      paintPacket(scene.packets[3], scene.evidenceBranch, phase === 2 ? resolve : 0, connected ? citationShare : 0);
    }

    function paint() {
      const step = stageAt(elapsed);
      const running = begun && !paused && !done() && visible && !document.hidden && !previewOpen;
      shell.dataset.pnScope = scope();
      shell.dataset.pnStep = step;
      shell.dataset.pnPlaying = running;
      const sceneTime = reduced.matches ? stepEnds[step] : elapsed;
      paintGraph(sceneTime);
      const localReturned = step >= 1;
      const targetReturned = connected && step >= 3;
      if (paintedStep !== step || paintedScope !== connected) {
        paintedStep = step;
        paintedScope = connected;
        write('bits', localReturned ? `${layoutCount} layouts · ${layoutBits} bits` : 'Layout choice');
        write('count', localReturned ? 'Choose how the sixteen symbols are arranged.' : 'The local count will appear here.');
        find('layout-source').hidden = !localReturned;
        write('cite-title', targetReturned ? '4 bits pick symbol 11' : 'Cited result');
        write('cite-wait', !target ? 'The pinned revision is unavailable.' : !connected ? 'The citation stays outside this scope.' : 'Both addresses will appear here.');
        find('cite-wait').hidden = targetReturned;
        const list = find('addresses');
        list.replaceChildren();
        if (targetReturned) addAddresses(list, addresses.evidence);
        list.hidden = !targetReturned;
        find('address-source').hidden = !targetReturned;
        find('target-download').hidden = !connected;
      }
      const message = !begun ? 'Ready to trace the question.'
        : paused && !done() ? 'Paused. Resume to follow the route.'
        : previewOpen && !done() ? 'Paused while the source is open.'
        : !localReturned ? 'The question splits into a local result and a citation.'
        : !target ? 'The local result is available. The citation could not be verified.'
        : !connected ? 'The local result is available. The citation stays outside scope.'
        : step === 1 ? 'The citation leads to the verified Cost project.'
        : step === 2 ? 'The Cost project opens two readings of its evidence.'
        : 'Both projects returned their evidence.';
      write('status', message);
      localButton.setAttribute('aria-pressed', !connected);
      connectedButton.setAttribute('aria-pressed', connected);
      pauseButton.textContent = done() ? 'Replay' : !begun ? 'Play' : paused ? 'Resume' : 'Pause';
    }

    function drive(now) {
      frame = 0;
      if (prior !== null) elapsed = Math.min(limit(), elapsed + Math.max(0, Math.min(90, now - prior)));
      prior = now;
      paint();
      reschedule();
    }

    function reschedule() {
      const canPlay = begun && visible && !paused && !done() && !document.hidden && !previewOpen;
      if (canPlay && !frame) frame = requestAnimationFrame(drive);
      if (!canPlay) {
        cancelAnimationFrame(frame);
        frame = 0;
        prior = null;
      }
    }

    function setScope(value) {
      if (connected === value || (value && !target)) return;
      saved[scope()] = elapsed;
      connected = value;
      elapsed = Math.max(saved[scope()], Math.min(elapsed, limit()));
      prior = null;
      paint();
      reschedule();
    }

    localButton.addEventListener('click', () => setScope(false));
    connectedButton.addEventListener('click', () => setScope(true));
    pauseButton.addEventListener('click', () => {
      if (!begun || done()) {
        begun = true;
        elapsed = 0;
        saved[scope()] = 0;
        paused = false;
      } else {
        paused = !paused;
      }
      paint();
      reschedule();
    });

    function startAfterScroll() {
      clearTimeout(entryTimer);
      if (framed && !begun && !document.hidden && !previewOpen) {
        entryTimer = setTimeout(() => {
          if (!framed || begun || document.hidden || previewOpen) return;
          begun = true;
          paint();
          reschedule();
        }, 500);
      }
    }
    document.addEventListener('visibilitychange', () => { reschedule(); startAfterScroll(); });
    document.addEventListener('eigenengine-source-preview', event => {
      previewOpen = Boolean(event.detail?.open);
      paint();
      reschedule();
      startAfterScroll();
    });
    narrow.addEventListener('change', () => {
      scene = makeScene(canvas, narrow.matches, layouts.evidence);
      paint();
    });
    reduced.addEventListener('change', paint);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.intersectionRatio >= .40;
        framed = entry.intersectionRatio >= .99;
        reschedule();
        startAfterScroll();
      }, { rootMargin: '-61px 0px -3px 0px', threshold: [0, .40, .99] });
      observer.observe(shell);
    } else {
      visible = true;
    }
    paint();
  }

  async function openFigure() {
    const first = await readProject(exampleFile);
    const citation = Array.from(first.nodes.values()).find(node => node.reference);
    const target = await followReference(first, citation.reference).catch(() => null);
    showFigure(first, target, citation);
  }

  if (mount) {
    const fallback = Array.from(mount.childNodes);
    openFigure().catch(() => mount.replaceChildren(...fallback));
  }
})();
