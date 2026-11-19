(function () {
  const mount = document.querySelector('#project-network');
  const format = 'eigenengine/worked-example-project@1';
  const scriptBase = document.currentScript?.src || document.baseURI;
  const exampleFile = new URL('./examples/kalmar-layouts-v1.json', scriptBase);
  const pace = [1450, 1850, 1600];

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
  }

  function downloadLink(anchor, record) {
    anchor.href = record.embedded
      ? URL.createObjectURL(new Blob([record.bytes], {type: 'application/json'}))
      : record.url.href;
    anchor.download = record.url.pathname.split('/').pop();
  }

  function addAddresses(container, evidence) {
    for (const [registers, positions] of evidence.layouts) {
      const register = 1 + Math.floor((evidence.rank - 1) / positions);
      const position = 1 + (evidence.rank - 1) % positions;
      const row = document.createElement('div');
      const layout = document.createElement('dt');
      const address = document.createElement('dd');
      const binary = document.createElement('code');
      const split = document.createElement('span');
      const description = document.createElement('span');
      const registerBits = (register - 1).toString(2).padStart(Math.log2(registers), '0');
      const positionBits = (position - 1).toString(2).padStart(Math.log2(positions), '0');
      layout.textContent = `${registers} × ${positions}`;
      binary.textContent = registerBits;
      split.textContent = positionBits;
      binary.append(split);
      binary.setAttribute('aria-label', `Binary address ${registerBits} split from ${positionBits}`);
      description.textContent = `Register ${register} → position ${position}`;
      address.append(binary, description);
      row.append(layout, address);
      container.append(row);
    }
  }

  function showFigure(first, target, citation) {
    mount.innerHTML = `
      <div class="pn-figure" data-pn-step="0" data-pn-scope="connected">
        <header class="pn-heading">
          <div><p class="pn-eyebrow">Research question</p><h3 data-pn="question"></h3></div>
          <div class="pn-controls">
            <div class="pn-scope" role="group" aria-label="Where the query can read">
              <button type="button" data-pn="local" aria-pressed="false">This project only</button>
              <button type="button" data-pn="connected" aria-pressed="true">Follow citation</button>
            </div>
            <button type="button" class="pn-pause" data-pn="pause">Pause</button>
          </div>
        </header>
        <div class="pn-scene" role="group" aria-label="Query route">
          <div class="pn-project pn-followup">
            <p class="pn-eyebrow">Follow-up project</p>
            <h4 data-pn="first-title"></h4>
            <div class="pn-tree">
              <div class="pn-node" data-pn="layout-node"><span data-pn="layout-label"></span><b data-pn="layout-weight"></b></div>
              <div class="pn-node" data-pn="cite-node"><span data-pn="cite-label"></span><b data-pn="cite-weight"></b></div>
            </div>
          </div>
          <div class="pn-crossing" data-pn="crossing">
            <a class="pn-cross-source" data-pn="cross-source" aria-label="Open the citation in the caption of the Kalmár paper, page 3">Ref. [1] ↗</a>
            <div class="pn-route" aria-hidden="true"><i></i></div>
            <span class="pn-cross-weight" data-pn="cross-weight"></span>
          </div>
          <div class="pn-project pn-cited" data-pn="cited-project">
            <p class="pn-eyebrow">Cited project</p>
            <h4 data-pn="target-title"></h4>
            <div class="pn-tree">
              <div class="pn-node" data-pn="register-node"><span data-pn="register-label"></span><b data-pn="register-weight"></b></div>
              <div class="pn-node" data-pn="address-node"><span data-pn="address-label"></span><b data-pn="address-weight"></b></div>
            </div>
          </div>
        </div>
        <div class="pn-status"><span data-pn="route-label">Query weight</span><span data-pn="status" role="status"></span></div>
        <div class="pn-evidence" role="group" aria-label="Returned evidence">
          <section class="pn-answer pn-local-answer">
            <p class="pn-eyebrow">Returned from the follow-up</p>
            <p class="pn-answer-wait" data-pn="local-wait">Opening the layout count…</p>
            <div data-pn="layout-evidence" hidden>
              <h4 data-pn="bits"></h4>
              <p data-pn="count"></p>
              <a data-pn="layout-source"></a>
            </div>
          </section>
          <section class="pn-answer pn-cited-answer">
            <p class="pn-eyebrow">Returned from the cited project</p>
            <p class="pn-answer-wait" data-pn="cite-wait"></p>
            <div data-pn="address-evidence" hidden>
              <h4>How each layout reads symbol 11</h4>
              <dl class="pn-addresses" data-pn="addresses"></dl>
              <a data-pn="address-source"></a>
            </div>
          </section>
        </div>
      </div>
      <div class="pn-foot">
        <p>Download the project objects <a data-pn="first-download" download>Kalmár JSON ↓</a> <a data-pn="target-download" download>Cost of Complexity JSON ↓</a></p>
        <details>
          <summary>How this example routes the query</summary>
          <p data-pn="weights-note"></p>
          <p data-pn="verification"></p>
        </details>
      </div>`;

    const shell = mount.querySelector('.pn-figure');
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
    const connectedButton = find('connected');
    const localButton = find('local');
    const pauseButton = find('pause');
    const percent = amount => amount > 0 ? `${Math.round(amount * 100)}%` : '';

    write('question', first.project.question);
    write('first-title', first.project.title);
    write('layout-label', layouts.label);
    write('cite-label', citation.label);
    write('target-title', target?.project.title ?? 'The Cost of Complexity');
    write('register-label', register?.label ?? 'Register address');
    write('address-label', addresses?.label ?? 'Two readings of symbol 11');
    write('bits', `${layoutBits} bits choose the layout`);
    write('count', `${layoutCount} possible layouts for ${layouts.evidence.symbols} symbols.`);
    write('weights-note', `The question starts with one unit of query weight. The example sends ${percent(localMass(1, first, layouts.id))} to the layout count and ${percent(localMass(1, first, citation.id))} to the citation. The citation carries its share across when the cited record is open. Those weights illustrate routing. The papers supply the evidence.`);
    downloadLink(find('first-download'), first);
    sourceLink(find('layout-source'), first, layouts);
    const crossSource = find('cross-source');
    sourceLink(crossSource, first, citation);
    crossSource.textContent = 'Ref. [1] ↗';

    if (target) {
      sourceLink(find('address-source'), target, addresses);
      addAddresses(find('addresses'), addresses.evidence);
      downloadLink(find('target-download'), target);
      write('verification', `This example verifies ${target.project.id} v${target.project.revision} by its SHA-256, then checks the entry and figure in the citation. The downloads also pin the source PDFs by SHA-256.`);
    } else {
      connectedButton.disabled = true;
      find('target-download').hidden = true;
      write('verification', 'The linked project revision could not be verified. The follow-up project and original caption are available.');
    }

    let connected = Boolean(target);
    let begun = false;
    let step = 0;
    let running = false;
    let visible = false;
    let paused = false;
    let timer;
    let started;
    let remaining = pace[0];
    const done = () => step >= (connected ? pace.length : 1);

    function paint() {
      const mass = connected ? connectedMass : localMass;
      const layoutWeight = mass(step, first, layouts.id);
      const citeWeight = mass(step, first, citation.id);
      const registerWeight = target ? mass(step, target, register.id) : 0;
      const addressWeight = target ? mass(step, target, addresses.id) : 0;
      const crossing = connected && step >= 2;
      const message = !step ? 'Entering the Kalmár follow-up.'
        : !target ? 'Citation revision could not be verified.'
        : !connected ? 'Reading the follow-up only.'
        : step === 1 ? 'Count and citation opened.'
        : step === 2 ? 'Verified Cost project opened.'
        : 'Both readings returned.';

      shell.dataset.pnScope = connected ? 'connected' : 'local';
      shell.dataset.pnStep = step;
      shell.dataset.pnPlaying = running;
      shell.style.setProperty('--pn-transfer', crossing ? registerWeight + addressWeight : 0);
      for (const [name, weight] of Object.entries({ layout: layoutWeight, cite: citeWeight, register: registerWeight, address: addressWeight })) {
        const node = find(`${name}-node`);
        node.classList.toggle('pn-lit', weight > 0);
        node.style.setProperty('--pn-node-weight', weight);
        node.title = weight > 0 ? `${percent(weight)} of example query weight` : '';
        write(`${name}-weight`, step === 1 ? percent(weight) : '');
      }
      write('cross-weight', percent(registerWeight + addressWeight));
      write('status', message);
      localButton.setAttribute('aria-pressed', !connected);
      connectedButton.setAttribute('aria-pressed', connected);
      pauseButton.textContent = done() ? 'Replay' : !begun ? 'Play' : paused ? 'Resume' : 'Pause';
      find('layout-evidence').hidden = layoutWeight === 0;
      find('local-wait').hidden = layoutWeight > 0;
      find('address-evidence').hidden = addressWeight === 0;
      find('cite-wait').hidden = addressWeight > 0;
      write('cite-wait', !target ? 'This revision is unavailable.' : connected ? 'Looking up Figure 2…' : 'Follow the citation to open Figure 2.');
    }

    function reschedule() {
      if (running) {
        clearTimeout(timer);
        remaining = Math.max(0, remaining - (performance.now() - started));
      }
      running = begun && visible && !paused && !done() && document.visibilityState !== 'hidden';
      if (running) {
        started = performance.now();
        timer = setTimeout(() => {
          running = false;
          step += 1;
          remaining = pace[step];
          reschedule();
        }, remaining);
      }
      paint();
    }

    function setScope(value) {
      if (connected === value || (value && !target)) return;
      connected = value;
      reschedule();
    }
    localButton.addEventListener('click', () => setScope(false));
    connectedButton.addEventListener('click', () => setScope(true));
    pauseButton.addEventListener('click', () => {
      if (!begun || done()) {
        begun = true;
        step = 0;
        remaining = pace[0];
        paused = false;
      } else {
        paused = !paused;
      }
      reschedule();
    });

    let framed = false, entryTimer;
    function startAfterScroll() {
      clearTimeout(entryTimer);
      if (framed && !begun && !document.hidden) {
        entryTimer = setTimeout(() => {
          if (!framed || begun || document.hidden) return;
          begun = true;
          reschedule();
        }, 420);
      }
    }
    document.addEventListener('visibilitychange', () => { reschedule(); startAfterScroll(); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.intersectionRatio >= .40;
        framed = entry.intersectionRatio >= .96;
        reschedule();
        startAfterScroll();
      }, { rootMargin: '-61px 0px -3px 0px', threshold: [0,.40,.96] });
      observer.observe(shell);
      window.addEventListener('scroll', startAfterScroll, {passive:true});
    } else {
      visible = true;
      begun = true;
      reschedule();
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
