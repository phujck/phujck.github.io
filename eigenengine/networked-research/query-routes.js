(() => {
  'use strict';
  const figure = document.querySelector('#nr-query-routes');
  if (!figure) return;

  const questions = {
    calculation: {
      links: [.1, .1, .8],
      model: [.36, .64],
      simulation: [.45, .55],
      answer: 'The simulation code repeats the subdivision. Its saved table gives the costs plotted in the figure.',
      source: { href: '/demo/writing/simulation/#simulation-result', label: 'Inspect the numerical evidence' },
    },
    assumption: {
      links: [.8, .1, .1],
      model: [.15, .85],
      simulation: [.35, .65],
      answer: 'The model prices each split by its area. That assumption makes each round add the same cost.',
      source: { href: '/assets/docs/the-cost-of-complexity.pdf#page=10', label: 'Inspect the area-pricing result', region: 'cost-fig-3b' },
    },
  };

  const demo = document.createElement('div');
  demo.className = 'query-routes';
  demo.innerHTML = `
    <div class="query-routes__intro">
      <span>Worked example</span>
      <div class="query-routes__controls" role="group" aria-label="Question to ask of the manuscript">
        <button type="button" data-question="calculation" aria-pressed="true">How was the figure calculated?</button>
        <button type="button" data-question="assumption" aria-pressed="false">Which assumption supports the claim?</button>
      </div>
    </div>
    <svg viewBox="0 0 480 157" role="img" aria-label="A manuscript claim links to a model and a simulation. Inside the model are the setup and area rule. The simulation holds the code and cost table."></svg>
    <div class="query-routes__reading">
      <p class="query-routes__legend">The claim sends weight to linked projects, then to their records. Thicker paths carry more.</p>
      <p class="query-routes__answer" role="status"></p>
      <a class="query-routes__source"></a>
    </div>
  `;

  figure.insertBefore(demo, figure.querySelector(':scope > figcaption'));
  const canvas = demo.querySelector('svg');
  const svg = (parent, tag, attrs, text) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    if (text) element.textContent = text;
    parent.append(element);
    return element;
  };

  const boxes = svg(canvas, 'g', { class: 'query-routes__boxes' });
  const paths = svg(canvas, 'g', {});
  const nodes = svg(canvas, 'g', {});
  const claimX = 240;
  const rootY = 63;
  const leafY = 113;

  function project(x, title) {
    svg(boxes, 'rect', { x: x - 72, y: 7, width: 144, height: 142, rx: 8 });
    svg(nodes, 'text', { x, y: 30, class: 'query-routes__title' }, title);
    return svg(nodes, 'circle', { cx: x, cy: rootY, r: 6, class: 'query-routes__node' });
  }

  function edge(d, linked = false) {
    const path = svg(paths, 'path', { d, class: 'query-routes__edge' });
    if (linked) path.classList.add('query-routes__edge--linked');
    return { path, length: path.getTotalLength() };
  }

  function record(x, to, title) {
    const route = edge(`M${x} ${rootY} C${x} 88 ${to} 83 ${to} ${leafY}`);
    route.node = svg(nodes, 'rect', { x: to - 4.5, y: leafY - 4.5, width: 9, height: 9, rx: 2, class: 'query-routes__node' });
    route.label = svg(nodes, 'text', { x: to, y: 138, class: 'query-routes__label' }, title);
    return route;
  }

  const model = project(79, 'Model');
  const claim = project(claimX, 'Manuscript');
  const simulation = project(401, 'Simulation');
  svg(nodes, 'text', { x: claimX, y: 52, class: 'query-routes__claim' }, 'Claim');
  const modelLink = edge(`M${claimX} ${rootY} Q160 84 79 ${rootY}`, true);
  const caption = record(claimX, claimX, 'Caption');
  const simulationLink = edge(`M${claimX} ${rootY} Q320 84 401 ${rootY}`, true);
  const modelRecords = [record(79, 48, 'Setup'), record(79, 110, 'Area rule')];
  const simulationRecords = [record(401, 370, 'Code'), record(401, 432, 'Cost table')];
  const fromClaim = [modelLink, caption, simulationLink];
  const toRecords = [...modelRecords, ...simulationRecords];

  const packets = Array.from({ length: 4 }, () => svg(canvas, 'circle', { class: 'query-routes__packet', opacity: 0 }));
  const buttons = [...demo.querySelectorAll('button')];
  const answer = demo.querySelector('.query-routes__answer');
  const source = demo.querySelector('.query-routes__source');
  const firstStep = 680;
  const duration = 1330;
  let question = 'calculation';
  let elapsed = 0;
  let frame;
  let previous;
  let playing = false;
  let inView = false;
  let seen = false;
  let previewOpen = false;

  function weight(element, value) {
    element.style.setProperty('--query-weight', value);
    element.dataset.emphasis = String(value >= .21);
  }

  function assign(routes, weights) {
    routes.forEach((route, index) => {
      const share = weights[index];
      route.weight = share;
      weight(route.path, share);
      if (route.node) weight(route.node, share);
      if (route.label) weight(route.label, share);
    });
  }

  function setQuestion() {
    const { links, model: modelShares, simulation: simulationShares } = questions[question];
    demo.dataset.question = question;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.question === question)));
    assign(fromClaim, links);
    assign(modelRecords, modelShares.map(share => share * links[0]));
    assign(simulationRecords, simulationShares.map(share => share * links[2]));
    weight(claim, 1);
    weight(model, links[0]);
    weight(simulation, links[2]);
    answer.textContent = questions[question].answer;
    const evidence = questions[question].source;
    source.href = evidence.href;
    source.textContent = evidence.label;
    if (evidence.region) {
      source.target = '_blank';
      source.rel = 'noopener';
      source.dataset.sourceRegion = evidence.region;
    } else {
      source.removeAttribute('target');
      source.removeAttribute('rel');
      delete source.dataset.sourceRegion;
    }
  }

  function paint(routes, fraction) {
    packets.forEach((packet, index) => {
      const route = routes[index];
      if (!route) {
        packet.setAttribute('opacity', 0);
        return;
      }
      const point = route.path.getPointAtLength(route.length * fraction);
      packet.setAttribute('cx', point.x);
      packet.setAttribute('cy', point.y);
      packet.setAttribute('r', 1.3 + 5.2 * Math.sqrt(route.weight));
      packet.setAttribute('opacity', .55 + .45 * Math.sqrt(route.weight));
    });
  }

  function sync() {
    if (playing && inView && !previewOpen && !document.hidden) {
      if (frame === undefined) frame = requestAnimationFrame(step);
    } else {
      cancelAnimationFrame(frame);
      frame = undefined;
      previous = undefined;
    }
  }

  function step(now) {
    frame = undefined;
    elapsed += now - (previous ?? now);
    previous = now;
    if (elapsed < firstStep) paint(fromClaim, elapsed / firstStep);
    else if (elapsed < duration) paint(toRecords, (elapsed - firstStep) / (duration - firstStep));
    else {
      paint([], 0);
      playing = false;
    }
    sync();
  }

  function replay() {
    elapsed = 0;
    previous = undefined;
    playing = true;
    paint([], 0);
    sync();
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.dataset.question === question) return;
    seen = true;
    question = button.dataset.question;
    setQuestion();
    replay();
  }));

  figure.querySelectorAll(':scope > [data-query-fallback]').forEach(node => node.setAttribute('hidden', ''));
  setQuestion();
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('eigenengine-source-preview', event => {
    previewOpen = event.detail.open;
    sync();
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .48;
      if (inView && !seen) {
        seen = true;
        replay();
      }
      sync();
    }, { threshold: [0, .48] }).observe(canvas);
  } else {
    inView = true;
  }
})();
