(() => {
  'use strict';

  const cover = document.querySelector('#nr-project-cover');
  const canvas = cover?.querySelector('svg');
  if (!canvas) return;

  const namespace = 'http://www.w3.org/2000/svg';
  const duration = 8500;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = amount => clamp(amount) ** 2 * (3 - 2 * clamp(amount));
  const mix = (from, to, amount) => from + (to - from) * amount;

  function svg(parent, tag, attrs, text) {
    const node = document.createElementNS(namespace, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    parent.append(node);
    return node;
  }

  canvas.replaceChildren();
  canvas.removeAttribute('aria-hidden');
  canvas.setAttribute('viewBox', '0 0 620 340');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Conceptual drawing. A project opens into branches, one marked correction crosses a bridge, and the next project attaches the correction to one of its branches.');

  const defs = svg(canvas, 'defs', {});
  const grid = svg(defs, 'pattern', { id: 'nr-cover-grid', width: 17, height: 17, patternUnits: 'userSpaceOnUse' });
  svg(grid, 'circle', { cx: 2, cy: 2, r: .75, fill: '#81acd0', opacity: .35 });
  const haze = svg(defs, 'radialGradient', { id: 'nr-cover-haze', cx: '52%', cy: '43%', r: '66%' });
  svg(haze, 'stop', { offset: '0', 'stop-color': '#223e56' });
  svg(haze, 'stop', { offset: '1', 'stop-color': '#0d1a2a' });
  svg(canvas, 'rect', { width: 620, height: 340, fill: 'url(#nr-cover-haze)' });
  svg(canvas, 'rect', { width: 620, height: 340, fill: 'url(#nr-cover-grid)', opacity: .77 });

  function hull(points, colour) {
    const data = points.map((point, index) => (index === 0 ? 'M' : 'L') + point.join(' ')).join('') + 'Z';
    svg(canvas, 'path', { d: data, class: 'nr-cover-plane nr-cover-plane--shadow', transform: 'translate(0 9)' });
    return svg(canvas, 'path', { d: data, class: `nr-cover-plane nr-cover-plane--${colour}` });
  }

  const leftPlane = hull([[25, 230], [190, 186], [289, 225], [120, 278]], 'left');
  const rightPlane = hull([[342, 235], [505, 191], [599, 233], [427, 284]], 'right');
  const paths = svg(canvas, 'g', {});
  const leftTrace = svg(paths, 'path', { class: 'nr-cover-front' });
  const rightTrace = svg(paths, 'path', { class: 'nr-cover-front' });
  const bridgeD = 'M222 219C271 186 282 101 338 108S426 181 472 218';
  const bridge = svg(paths, 'path', { class: 'nr-cover-bridge', d: bridgeD });
  const bridgeTrack = svg(paths, 'path', { class: 'nr-cover-bridge-track', d: bridgeD, pathLength: 1 });
  const length = bridge.getTotalLength();
  const content = svg(canvas, 'g', {});
  const labelledSource = svg(canvas, 'text', { x: 146, y: 44, class: 'nr-cover-project' }, 'Source project');
  const labelledTarget = svg(canvas, 'text', { x: 470, y: 44, class: 'nr-cover-project' }, 'Next project');

  function shape(parent, style, size) {
    const node = svg(parent, 'g', { class: `nr-cover-node nr-cover-node--${style}` });
    svg(node, 'path', {
      d: `M${-size} 0L0 ${size * .51}L${size} 0v5L0 ${size * .51 + 5}L${-size} 5Z`,
      class: 'nr-cover-node-shadow'
    });
    svg(node, 'path', {
      d: `M${-size} 0L0 ${-size * .53}L${size} 0L0 ${size * .53}Z`,
      class: 'nr-cover-node-top'
    });
    return node;
  }

  function buildGraph(rootPoint, families, correctionPoint) {
    const root = shape(content, 'root', 24);
    root.setAttribute('transform', `translate(${rootPoint.join(' ')})`);
    const groups = families.map(({ point, leaves }, index) => ({
      point,
      stem: svg(paths, 'path', { class: 'nr-cover-stem' }),
      marker: shape(content, 'family', index === 2 ? 12 : 10),
      leaves: leaves.map(end => ({
        end,
        stem: svg(paths, 'path', { class: 'nr-cover-stem nr-cover-stem--fine' }),
        marker: shape(content, 'leaf', 6)
      }))
    }));
    return { root, rootPoint, groups, correctionPoint };
  }

  const left = buildGraph([146, 80], [
    { point: [69, 143], leaves: [[44, 189], [80, 200]] },
    { point: [119, 156], leaves: [[103, 216], [133, 223], [151, 199]] },
    { point: [190, 155], leaves: [[175, 212], [198, 235], [222, 219]] },
    { point: [237, 141], leaves: [[243, 194], [259, 214]] }
  ], [222, 219]);
  const right = buildGraph([470, 80], [
    { point: [387, 147], leaves: [[373, 212], [400, 214], [421, 202]] },
    { point: [471, 155], leaves: [[446, 223], [472, 218], [497, 232]] },
    { point: [548, 146], leaves: [[525, 211], [553, 212], [578, 224]] }
  ], [472, 218]);

  const packet = svg(canvas, 'g', { class: 'nr-cover-packet' });
  const halo = svg(packet, 'circle', { r: 28, class: 'nr-cover-halo' });
  const packageShape = shape(packet, 'package', 13);
  svg(packet, 'circle', { r: 3.6, class: 'nr-cover-distinction' });
  const annotation = svg(canvas, 'text', { class: 'nr-cover-annotation', x: 221, y: 272 }, 'Author’s correction');

  function stem(from, point, progress) {
    const x = mix(from[0], point[0], progress);
    const y = mix(from[1], point[1], progress);
    const bend = mix(from[1], y, .59);
    return { point: [x, y], path: `M${from[0]} ${from[1]}C${from[0]} ${bend} ${x} ${bend} ${x} ${y}` };
  }

  function paintGraph(graph, opening, leaves, distinguish) {
    graph.root.setAttribute('opacity', .73 + opening * .27);
    graph.groups.forEach(({ point, stem: edge, marker, leaves: nodes }, i) => {
      const revealed = smooth((opening - i * .08) / .77);
      const parent = stem(graph.rootPoint, point, revealed);
      edge.setAttribute('d', parent.path);
      edge.setAttribute('opacity', revealed);
      marker.setAttribute('transform', `translate(${parent.point.join(' ')}) scale(${.55 + revealed * .45})`);
      marker.setAttribute('opacity', revealed);
      nodes.forEach(({ end, stem: wire, marker: leaf }, j) => {
        const share = smooth((leaves - i * .09 - j * .07) / .59);
        const child = stem(parent.point, end, share);
        const special = end[0] === graph.correctionPoint[0] && end[1] === graph.correctionPoint[1];
        wire.setAttribute('d', child.path);
        wire.setAttribute('opacity', share * (special ? .5 + distinguish * .5 : .7));
        leaf.setAttribute('transform', `translate(${child.point.join(' ')}) scale(${.3 + .7 * share})`);
        leaf.setAttribute('opacity', share);
      });
    });
  }

  function draw(time) {
    const opening = smooth(time / 1730);
    const unfolding = smooth((time - 820) / 1720);
    const marked = smooth((time - 2180) / 910);
    const packed = smooth((time - 3160) / 1030);
    const travelled = smooth((time - 4090) / 2430);
    const unpacked = smooth((time - 6720) / 1360);
    const available = smooth((time - 4300) / 1230);
    const received = smooth((time - 5740) / 2220);

    paintGraph(left, opening, unfolding, 1 - travelled);
    paintGraph(right, .48 + available * .52, .18 + received * .82, unpacked);
    leftPlane.setAttribute('opacity', .3 + unfolding * .6);
    rightPlane.setAttribute('opacity', .32 + received * .58);
    leftTrace.setAttribute('d', `M${mix(129, 35, opening)} ${mix(97, 222, unfolding)}H${mix(163, 270, opening)}`);
    leftTrace.setAttribute('opacity', .65 * Math.sin(Math.PI * opening) + .42 * Math.sin(Math.PI * unfolding));
    rightTrace.setAttribute('d', `M${mix(455, 354, available)} ${mix(88, 221, received)}H${mix(490, 590, available)}`);
    rightTrace.setAttribute('opacity', .65 * Math.sin(Math.PI * available) + .38 * Math.sin(Math.PI * received));
    bridge.setAttribute('opacity', .27 + packed * .48);
    bridgeTrack.setAttribute('stroke-dasharray', `${travelled} 1`);
    bridgeTrack.setAttribute('opacity', travelled > 0 ? .82 : 0);
    const point = bridge.getPointAtLength(travelled * length);
    packet.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${.84 + packed * .05 - unpacked * .24})`);
    packet.setAttribute('opacity', marked);
    halo.setAttribute('r', 28 - packed * 11 + unpacked * 5);
    halo.setAttribute('opacity', .82 - packed * .39 + unpacked * .39);
    packageShape.setAttribute('opacity', packed * (1 - unpacked));
    annotation.setAttribute('opacity', marked * (1 - smooth((time - 3740) / 650)) + unpacked);
    annotation.setAttribute('x', unpacked ? right.correctionPoint[0] : left.correctionPoint[0]);
    labelledSource.setAttribute('opacity', .77 + opening * .23);
    labelledTarget.setAttribute('opacity', .68 + received * .32);
    canvas.dataset.progress = time.toFixed(1);
    canvas.dataset.transfer = travelled.toFixed(6);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nr-cover-toggle';
  cover.append(toggle);

  let time = reduced.matches ? duration : 0;
  let active = !reduced.matches;
  let inView = false;
  let previewOpen = Boolean(document.querySelector('.ee-source-preview[open]'));
  let request = 0;
  let prior = null;

  function controls() {
    toggle.hidden = reduced.matches;
    const label = time >= duration ? 'Replay' : active ? 'Pause' : 'Resume';
    toggle.textContent = label;
    toggle.setAttribute('aria-label', label + ' the conceptual animation');
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

  function tick(now) {
    request = 0;
    if (prior !== null) time = Math.min(duration, time + Math.max(0, Math.min(90, now - prior)));
    prior = now;
    draw(time);
    if (time >= duration) controls();
    resume();
  }

  toggle.addEventListener('click', () => {
    if (time >= duration) {
      time = 0;
      active = true;
      draw(time);
    } else {
      active = !active;
    }
    controls();
    resume();
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .45;
      resume();
    }, { threshold: [.45, .65] });
    observer.observe(canvas);
  } else {
    inView = true;
  }

  reduced.addEventListener('change', () => {
    time = reduced.matches ? duration : 0;
    active = !reduced.matches;
    draw(time);
    controls();
    resume();
  });
  document.addEventListener('visibilitychange', resume);
  document.addEventListener('eigenengine-source-preview', event => {
    previewOpen = Boolean(event.detail?.open);
    resume();
  });

  draw(time);
  controls();
  resume();
})();
