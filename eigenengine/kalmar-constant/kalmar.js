(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';

  function svg(parent, tag, attrs = {}, text) {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    parent.append(node);
    return node;
  }

  const ease = t => 1 - (1 - t) ** 3;
  const between = (a, b, t) => a + (b - a) * t;

  function factorsFor(mask) {
    const result = [];
    let bits = 1;
    for (let gap = 0; gap < 3; gap += 1) {
      if (mask & (1 << gap)) {
        result.push(2 ** bits);
        bits = 0;
      }
      bits += 1;
    }
    result.push(2 ** bits);
    return result;
  }

  function addressOf(index, factors) {
    const digits = [];
    for (const radix of factors.slice().reverse()) {
      digits.unshift(1 + index % radix);
      index = Math.floor(index / radix);
    }
    return digits;
  }

  function arrangement(factors) {
    const groups = factors.length === 1 ? 1 : factors[0];
    const size = 16 / groups;
    const groupColumns = groups <= 2 ? 1 : groups / 2;
    const groupRows = groups / groupColumns;
    const innerColumns = Math.min(size, 8);
    const innerRows = size / innerColumns;
    const frameGap = 11;
    const groupWidth = (608 - (groupColumns - 1) * frameGap) / groupColumns;
    const groupHeight = (213 - (groupRows - 1) * frameGap) / groupRows;
    const points = [];
    const boxes = [];

    for (let group = 0; group < groups; group += 1) {
      const x = 16 + Math.floor(group / groupRows) * (groupWidth + frameGap);
      const y = 11 + (group % groupRows) * (groupHeight + frameGap);
      const dx = (groupWidth - 21) / innerColumns;
      const dy = (groupHeight - 34) / innerRows;
      boxes.push({ x, y, width: groupWidth, height: groupHeight, label: `Register ${group + 1}`, first: group * size, count: size });
      for (let item = 0; item < size; item += 1) {
        points.push({
          x: x + 10.5 + (item % innerColumns + .5) * dx,
          y: y + 22 + (Math.floor(item / innerColumns) + .5) * dy,
          w: Math.min(53, dx - 8),
          h: Math.min(46, dy - 16),
        });
      }
    }

    let amount = size;
    for (let depth = 1; depth < factors.length - 1; depth += 1) {
      amount /= factors[depth];
      for (let start = 0; start < 16; start += amount) {
        const tile = points.slice(start, start + amount);
        const padding = 4 / depth;
        const x = Math.min(...tile.map(item => item.x - item.w / 2)) - padding;
        const y = Math.min(...tile.map(item => item.y - item.h / 2)) - padding - depth * 1.5;
        const endX = Math.max(...tile.map(item => item.x + item.w / 2)) + padding;
        const endY = Math.max(...tile.map(item => item.y + item.h / 2)) + padding + depth * 1.5;
        boxes.push({ x, y, width: endX - x, height: endY - y, first: start, count: amount });
      }
    }
    return { points, boxes };
  }

  function setupLayouts() {
    const panel = document.querySelector('[data-layout-demo]');
    const get = selector => panel.querySelector(selector);
    const graph = get('.km-layout-graph');
    const frames = get('[data-frames]');
    const marks = get('[data-symbols]');
    const replay = get('[data-layout-replay]');
    const layoutButtons = [...panel.querySelectorAll('[data-layout]')];
    const gapButtons = [...panel.querySelectorAll('[data-gap]')];
    const selected = 10;
    const trail = svg(marks, 'path', { class: 'km-trail' });
    const glyphs = Array.from({ length: 16 }, (_, i) => {
      const node = svg(marks, 'g', {
        class: 'km-symbol' + (i === selected ? ' is-selected' : ''),
        'data-symbol': i + 1,
      });
      const edge = svg(node, 'rect', { rx: 6 });
      svg(node, 'text', {}, String(i + 1));
      return { node, edge };
    });

    function frameLayer(boxes) {
      const layer = svg(frames, 'g');
      for (const box of boxes) {
        const marked = selected >= box.first && selected < box.first + box.count;
        const className = 'km-group-box' + (box.label ? '' : ' is-nested') + (marked ? ' is-chosen' : '');
        svg(layer, 'rect', { x: box.x, y: box.y, width: box.width, height: box.height, rx: box.label ? 10 : 5, class: className });
        if (box.label) svg(layer, 'text', { x: box.x + 9, y: box.y + 13, class: 'km-label-inside' }, box.label);
      }
      return layer;
    }

    function place(points) {
      glyphs.forEach(({ node, edge }, i) => {
        const { x, y, w, h } = points[i];
        node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        edge.setAttribute('x', -w / 2);
        edge.setAttribute('y', -h / 2);
        edge.setAttribute('width', w);
        edge.setAttribute('height', h);
      });
    }

    function label(mask, factors) {
      const joined = factors.join(' × ');
      const address = addressOf(selected, factors);
      const description = factors.length === 1 ? 'One register of sixteen'
        : factors.length === 2 ? `${factors[0]} groups of ${factors[1]}`
          : `${factors.length} levels of choice`;
      get('[data-layout-name]').textContent = joined;
      get('[data-layout-desc]').textContent = description;
      get('[data-layout-address]').textContent = address.length === 1
        ? 'Symbol 11 · one register, position 11.'
        : address.length === 2
          ? `Symbol 11 · register ${address[0]}, position ${address[1]}.`
          : `Symbol 11 · successive choices ${address.join(' → ')}.`;
      graph.setAttribute('aria-label', `Layout ${joined}. ${description}. Symbol 11 is highlighted.`);
      layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.layout) === mask)));
      gapButtons.forEach(button => button.setAttribute('aria-pressed', String(Boolean(mask & (1 << Number(button.dataset.gap))))));
    }

    let mask = 1;
    const current = arrangement(factorsFor(mask));
    let points = current.points;
    let layer = frameLayer(current.boxes);
    let timer = null;
    let animation = null;
    let engaged = false;
    let witnessed = false;

    function clearPending() {
      clearTimeout(timer);
      timer = null;
    }

    function choose(next, animate = !reduced.matches) {
      const factors = factorsFor(next);
      const target = arrangement(factors);
      const start = points;
      cancelAnimationFrame(animation);
      const prior = layer;
      frames.replaceChildren(prior);
      layer = frameLayer(target.boxes);
      mask = next;
      label(next, factors);

      if (!animate) {
        frames.replaceChildren(layer);
        points = target.points;
        place(points);
        trail.setAttribute('opacity', 0);
        return;
      }

      layer.setAttribute('opacity', 0);
      get('[data-layout-desc]').textContent = 'Regrouping the same symbols';
      const began = performance.now();
      function step(now) {
        const time = Math.min(1, (now - began) / 1160);
        const weight = ease(time);
        points = start.map((item, i) => {
          const end = target.points[i];
          return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, between(value, end[key], weight)]));
        });
        const a = start[selected];
        const b = points[selected];
        trail.setAttribute('d', `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 25} ${b.x} ${b.y}`);
        trail.setAttribute('opacity', Math.sin(time * Math.PI) * .88);
        prior.setAttribute('opacity', Math.max(0, 1 - time * 2));
        layer.setAttribute('opacity', Math.max(0, (time - .25) / .75));
        place(points);
        if (time < 1) animation = requestAnimationFrame(step);
        else {
          frames.replaceChildren(layer);
          label(next, factors);
        }
      }
      animation = requestAnimationFrame(step);
    }

    panel.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      engaged = true;
      clearPending();
      if (button === replay) {
        choose(1, false);
        timer = setTimeout(() => choose(4, true), 660);
      } else if (button.hasAttribute('data-layout')) {
        const next = Number(button.dataset.layout);
        if (next !== mask) choose(next);
      } else if (button.hasAttribute('data-gap')) {
        choose(mask ^ (1 << Number(button.dataset.gap)));
      }
    });

    place(points);
    label(mask, factorsFor(mask));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < .62) {
          if (!engaged) clearPending();
        } else if (!engaged && !witnessed && !reduced.matches && timer === null) {
          timer = setTimeout(() => {
            witnessed = true;
            timer = null;
            choose(4);
          }, 1100);
        }
      }, { threshold: [0, .62], rootMargin: '-52px 0px -20px 0px' });
      observer.observe(graph);
    }
  }

  const rho = 1.7286472;
  const branchButtons = [...document.querySelectorAll('[data-branch]')];
  const branchRead = document.querySelector('[data-branch-read]');
  function branch(n) {
    branchButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.branch) === n)));
    const share = (100 * n ** (-rho)).toFixed(1);
    branchRead.textContent = `Start with ${n} options. This branch has room for N/${n} and accounts for about ${share}% of layouts in the large-range limit.`;
  }
  branchButtons.forEach(button => {
    const n = Number(button.dataset.branch);
    button.addEventListener('click', () => branch(n));
  });
  branch(2);

  const cases = [
    { x: 0, label: '0', value: '1.72865' },
    { x: .25, label: '0.25', value: '1.53928' },
    { x: .5, label: '0.5', value: '1.41313' },
    { x: 1, label: '1', value: '1.25549' },
    { x: 2, label: '2', value: '1.10493' },
    { x: 3, label: '3', value: '1.04298' },
    { x: 5, label: '5', value: '1.00650' },
    { x: 8, label: '8', value: '1.00033' },
  ];

  function setupCapacity() {
    const section = document.querySelector('[data-capacity]');
    const axis = section.querySelector('[data-capacity-chart]');
    const title = section.querySelector('[data-case-name]');
    const reading = section.querySelector('[data-case-value]');
    const note = section.querySelector('[data-case-note]');
    const buttons = [...section.querySelectorAll('[data-case]')];
    const base = 209;
    const x = cost => 55 + cost * 57.7;
    const y = value => base - (value - 1) * 232.5;
    [1, 1.2, 1.4, 1.6, 1.8].forEach(value => {
      const height = y(value);
      svg(axis, 'line', { x1: 49, y1: height, x2: 520, y2: height, class: value === 1 ? 'km-limit' : 'km-gridline' });
      svg(axis, 'text', { x: 38, y: height + 5, 'text-anchor': 'end' }, value.toFixed(1));
    });
    svg(axis, 'path', { d: 'M49 19V216H521', class: 'km-axis' });
    [0, 1, 2, 3, 5, 8].forEach(cost => {
      svg(axis, 'text', { x: x(cost), y: 241, 'text-anchor': 'middle' }, String(cost));
    });
    svg(axis, 'polyline', { points: cases.map(item => `${x(item.x)},${y(Number(item.value))}`).join(' '), class: 'km-case-line' });
    cases.forEach(item => svg(axis, 'circle', { cx: x(item.x), cy: y(Number(item.value)), r: 4.8, class: 'km-case-dot' }));
    const guide = svg(axis, 'line', { class: 'km-case-guide' });
    const marker = svg(axis, 'circle', { r: 7.3, class: 'km-case-marker' });
    const graph = axis.closest('svg');
    let at = { x: x(0), y: y(Number(cases[0].value)) };
    let frame = null;

    function place(next) {
      marker.setAttribute('cx', next.x);
      marker.setAttribute('cy', next.y);
      guide.setAttribute('x1', next.x);
      guide.setAttribute('x2', next.x);
      guide.setAttribute('y1', next.y);
      guide.setAttribute('y2', base);
      at = next;
    }

    function choose(index, animate = false) {
      const item = cases[index];
      title.textContent = index ? `Fixed cost ${item.label}` : 'No fixed charge';
      reading.textContent = item.value;
      note.textContent = index === 0
        ? 'Without a fixed charge, the budget count gives the same exponent as Kalmár’s range count.'
        : index === 7 ? 'At this charge the exponent is already close to one.'
          : 'Every additional register pays the charge again.';
      graph.setAttribute('aria-label', `Growth exponent falls toward one. At cost ${item.label}, it is ${item.value}.`);
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      cancelAnimationFrame(frame);
      const to = { x: x(item.x), y: y(Number(item.value)) };
      if (!animate || reduced.matches) {
        place(to);
        return;
      }
      const start = at;
      const began = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - began) / 370);
        place({ x: between(start.x, to.x, ease(t)), y: between(start.y, to.y, ease(t)) });
        if (t < 1) frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
    }

    buttons.forEach((button, i) => button.addEventListener('click', () => choose(i, true)));
    choose(0);
  }

  function setupTower() {
    const panel = document.querySelector('[data-self]');
    const rows = [...panel.querySelectorAll('[data-bit-row]')];
    const total = panel.querySelector('[data-bit-total]');
    const replay = panel.querySelector('[data-bit-replay]');
    const counts = [4, 3, 2, 1];
    let timer = null;
    let acted = false;

    function count(levels) {
      rows.forEach((row, i) => row.classList.toggle('is-counted', i < levels));
      const visible = counts.slice(0, levels);
      const sum = visible.reduce((a, b) => a + b, 0);
      total.textContent = visible.length > 1 ? `${visible.join(' + ')} = ${sum} bits` : `${sum} bits`;
    }

    function play() {
      clearInterval(timer);
      let level = 1;
      count(level);
      timer = setInterval(() => {
        count(++level);
        if (level === counts.length) {
          clearInterval(timer);
          timer = null;
        }
      }, 610);
    }

    replay.addEventListener('click', () => {
      acted = true;
      play();
    });
    count(reduced.matches ? 4 : 1);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < .58) return;
        observer.disconnect();
        if (!acted && !reduced.matches) play();
      }, { threshold: [.58] });
      observer.observe(panel.querySelector('.km-tower'));
    } else count(4);
  }

  setupLayouts();
  setupCapacity();
  setupTower();
})();
