(() => {
  'use strict';

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
  const clocks = [];
  let previewOpen = false;

  function animationClock() {
    let frame = null;
    let paint;
    let duration;
    let elapsed;
    let previous;

    function suspend() {
      cancelAnimationFrame(frame);
      frame = null;
      previous = undefined;
    }

    function resume() {
      if (paint && frame === null && !previewOpen) frame = requestAnimationFrame(tick);
    }

    function tick(now) {
      frame = null;
      elapsed += now - (previous ?? now);
      previous = now;
      const progress = Math.min(1, elapsed / duration);
      paint(progress);
      if (progress === 1) paint = null;
      resume();
    }

    clocks.push({ suspend, resume });
    return {
      start(milliseconds, draw) {
        suspend();
        elapsed = 0;
        duration = milliseconds;
        paint = draw;
        resume();
      },
      cancel() {
        suspend();
        paint = null;
      }
    };
  }

  function delayClock() {
    let timer = null;
    let action;
    let remaining;
    let due;

    function suspend() {
      if (timer === null) return;
      clearTimeout(timer);
      timer = null;
      remaining = Math.max(0, due - performance.now());
    }

    function resume() {
      if (!action || timer !== null || previewOpen) return;
      due = performance.now() + remaining;
      timer = setTimeout(() => {
        const complete = action;
        action = null;
        timer = null;
        complete();
      }, remaining);
    }

    clocks.push({ suspend, resume });
    return {
      start(milliseconds, run) {
        suspend();
        remaining = milliseconds;
        action = run;
        resume();
      },
      cancel() {
        suspend();
        action = null;
      },
      get pending() { return Boolean(action); }
    };
  }

  document.addEventListener('eigenengine-source-preview', event => {
    previewOpen = event.detail.open;
    clocks.forEach(clock => previewOpen ? clock.suspend() : clock.resume());
  });

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
    const description = get('[data-layout-desc]');
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

    function frameLayer(boxes, mask) {
      const layer = svg(frames, 'g', { 'data-frame-mask': mask });
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

    function describe(factors) {
      return factors.length === 1 ? 'One register of sixteen'
        : factors.length === 2 ? `${factors[0]} groups of ${factors[1]}`
          : `${factors.length} levels of choice`;
    }

    function label(mask, factors) {
      const joined = factors.join(' × ');
      const address = addressOf(selected, factors);
      get('[data-layout-name]').textContent = joined;
      get('[data-layout-address]').textContent = address.length === 1
        ? 'Symbol 11 · one register, position 11.'
        : address.length === 2
          ? `Symbol 11 · register ${address[0]}, position ${address[1]}.`
          : `Symbol 11 · successive choices ${address.join(' → ')}.`;
      graph.setAttribute('aria-label', `Layout ${joined}. ${describe(factors)}. Symbol 11 is highlighted.`);
      layoutButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.layout) === mask)));
      gapButtons.forEach(button => button.setAttribute('aria-pressed', String(Boolean(mask & (1 << Number(button.dataset.gap))))));
    }

    let mask = 1;
    const current = arrangement(factorsFor(mask));
    let points = current.points;
    frameLayer(current.boxes, mask);
    const cue = delayClock();
    const animation = animationClock();
    let engaged = false;
    let witnessed = false;

    function choose(next, animate = true) {
      const factors = factorsFor(next);
      const target = arrangement(factors);
      const start = points;
      animation.cancel();
      const layers = [...frames.children];
      let layer = layers.find(node => Number(node.dataset.frameMask) === next);
      if (!layer) {
        layer = frameLayer(target.boxes, next);
        layer.setAttribute('opacity', 0);
        layers.push(layer);
      }
      if (next !== mask) {
        mask = next;
        label(next, factors);
      }

      function finish() {
        frames.replaceChildren(layer);
        layer.setAttribute('opacity', 1);
        points = target.points;
        place(points);
        trail.setAttribute('opacity', 0);
        description.textContent = describe(factors);
      }

      if (!animate) {
        finish();
        return;
      }

      const opacityAtStart = layers.map(node => Number(node.getAttribute('opacity') ?? 1));
      description.textContent = 'Regrouping the same symbols';
      animation.start(1160, time => {
        if (time === 1) {
          finish();
          return;
        }
        const weight = ease(time);
        points = start.map((item, i) => {
          const end = target.points[i];
          return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, between(value, end[key], weight)]));
        });
        const a = start[selected];
        const b = points[selected];
        trail.setAttribute('d', `M${a.x} ${a.y} Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 25} ${b.x} ${b.y}`);
        trail.setAttribute('opacity', Math.sin(time * Math.PI) * .88);
        layers.forEach((node, i) => {
          const fade = node === layer ? Math.max(0, (time - .25) / .75) : Math.min(1, time * 2);
          node.setAttribute('opacity', between(opacityAtStart[i], node === layer ? 1 : 0, fade));
        });
        place(points);
      });
    }

    panel.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      engaged = true;
      cue.cancel();
      if (button === replay) {
        choose(1, false);
        cue.start(660, () => choose(4));
      } else if (button.hasAttribute('data-layout')) {
        const next = Number(button.dataset.layout);
        if (next !== mask) choose(next);
      } else if (button.hasAttribute('data-gap')) {
        choose(mask ^ (1 << Number(button.dataset.gap)));
      }
    });

    place(points);
    label(mask, factorsFor(mask));
    description.textContent = describe(factorsFor(mask));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < .62) {
          if (!engaged && !previewOpen) cue.cancel();
        } else if (!engaged && !witnessed && !cue.pending) {
          cue.start(1100, () => {
            witnessed = true;
            choose(4);
          });
        }
      }, { threshold: [0, .62], rootMargin: '-52px 0px -20px 0px' });
      observer.observe(graph);
    }
  }

  const rho = 1.7286472;
  const branchButtons = [...document.querySelectorAll('[data-branch]')];
  const branchRead = document.querySelector('[data-branch-read]');
  let activeBranch;
  function branch(n) {
    if (n === activeBranch) return;
    activeBranch = n;
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
    const animation = animationClock();
    let activeCase;

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
      if (index === activeCase) return;
      activeCase = index;
      const item = cases[index];
      title.textContent = index ? `Fixed cost ${item.label}` : 'No fixed charge';
      reading.textContent = item.value;
      note.textContent = index === 0
        ? 'Without a fixed charge, the budget count gives the same exponent as Kalmár’s range count.'
        : index === 7 ? 'At this charge the exponent is already close to one.'
          : 'Every additional register pays the charge again.';
      graph.setAttribute('aria-label', `Growth exponent falls toward one. At cost ${item.label}, it is ${item.value}.`);
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      const target = { x: x(item.x), y: y(Number(item.value)) };
      if (!animate) {
        animation.cancel();
        place(target);
        return;
      }
      const start = at;
      animation.start(370, t => {
        place({ x: between(start.x, target.x, ease(t)), y: between(start.y, target.y, ease(t)) });
      });
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
    const timer = delayClock();
    let acted = false;

    function count(levels) {
      rows.forEach((row, i) => row.classList.toggle('is-counted', i < levels));
      const visible = counts.slice(0, levels);
      const sum = visible.reduce((a, b) => a + b, 0);
      total.textContent = visible.length > 1 ? `${visible.join(' + ')} = ${sum} bits` : `${sum} bits`;
    }

    function play() {
      let level = 1;
      count(level);
      function advance() {
        count(++level);
        if (level < counts.length) timer.start(610, advance);
      }
      timer.start(610, advance);
    }

    replay.addEventListener('click', () => {
      acted = true;
      play();
    });
    count(1);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.intersectionRatio < .58) return;
        observer.disconnect();
        if (!acted) play();
      }, { threshold: [.58] });
      observer.observe(panel.querySelector('.km-tower'));
    } else count(4);
  }

  setupLayouts();
  setupCapacity();
  setupTower();
})();
