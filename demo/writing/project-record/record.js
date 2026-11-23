/* The work behind the paper: which tools did the work, counted from the project's own receipts
   (/assets/data/cost-project-record.json). Choosing a kind of attempt re-ranks the tools, and each row travels to
   its new place on a spring while its bar changes length, so the reader sees the order change and not only the numbers. */
(() => {
  'use strict';
  const I = window.IFC, EM = window.EigenMotion, M = window.EG_MOTION; if (!I || !EM) return;
  const $ = I.$, $$ = I.$$, list = $('#ee-bars'); if (!list) return;
  const names = {
    'authoring/proposal-preview': 'Preview a proposed edit', source: 'Read manuscript source', help: 'Look up tool help', web_fetch: 'Fetch a web page', repository: 'Inspect the repository',
    literature_import: 'Import a paper', web_search: 'Search the web', build_status: 'Check a build', apply_revision: 'Apply a revision', reference_text: 'Read a reference', literature_lookup: 'Look up literature',
    concept: 'Inspect a concept', structure: 'Read manuscript structure', reference_fetch: 'Fetch a reference', author_history: 'Read project history', build: 'Build the manuscript', propose_revision: 'Propose a revision',
    'authoring/proposal-decision': 'Record an edit decision', concept_change: 'Revise a concept', structure_change: 'Revise structure', references_attached: 'List attached references', 'authoring/proposals': 'List proposals',
    literature_bind: 'Bind evidence to a passage', references: 'List references', section_change: 'Revise a section', logical_plan_change: 'Revise the logical plan', visual_create: 'Create a visual', concept_tree: 'Explore the concept tree',
    'corpus/friction-report': 'Record a project issue', literature_scope: 'Inspect literature scope', store_artifact: 'Save an artifact', logical_plan: 'Read the logical plan', block_change: 'Revise a text block',
    conversation_history: 'Read conversation history', document: 'Read the document', literature_discover: 'Discover literature', project: 'Inspect the project', read_artifact: 'Read an artifact', visuals: 'List visuals',
    author_changes: 'Inspect author changes', literature_uses: 'Inspect uses of a source', project_metadata: 'Read project metadata', research: 'Inspect research', task: 'Work on a task', task_status: 'Record task status'
  };
  const words = { total: 'recorded attempts', read: 'recorded reads', action: 'recorded actions', failure: 'recorded failures' }, kinds = ['read', 'action', 'failure'];
  const filters = $('#ee-filters'), all = $('#ee-all-tools'), subtitle = $('#ee-frequency-total');
  let channel = 'total', expanded = false, rows = [], rowH = 28, picked = null, data0 = null;
  const says = $('#ee-says'), word = n => ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] || String(n), fmt = n => n.toLocaleString('en-GB');
  const name = d => names[d.operation] || d.operation;
  /* one sentence beneath the legend: what the ranking now on screen says, or the counts of the tool the reader pressed */
  const say = ranked => {
    const t = data0.receipt_types, top = ranked[0] && ranked[0].d; let text;
    const many = (n, w) => `${n ? fmt(n) : 'no'} ${w}${n === 1 ? '' : 's'}`;
    if (picked) text = `${name(picked.d)}: ${many(picked.d.read, 'read')}, ${many(picked.d.action, 'action')} and ${many(picked.d.failure, 'failure')}.`;
    else if (channel === 'total') text = `Most of the work was reading: ${fmt(t.read)} of the ${fmt(data0.tool_attempts)} attempts, or about ${word(Math.round(t.read / t.action))} reads for each action.`;
    else if (channel === 'read') text = `${name(top)} leads the reads, with ${fmt(top.read)}.`;
    else if (channel === 'action') text = `${name(top)} was the commonest action, taken ${fmt(top.action)} times.`;
    else text = `${name(top)} failed most often: ${fmt(top.failure)} of its ${fmt(top.total)} attempts.`;
    if (says.textContent !== text) { says.style.opacity = 0; setTimeout(() => { says.textContent = text; says.style.opacity = 1; }, M.off ? 0 : 180); }
    rows.forEach(r => r.li.classList.toggle('is-picked', r === picked));
  };

  /* the three counts rise to their values once, when the page opens */
  $$('.ifc-metric dd').forEach((dd, k) => { const to = +dd.dataset.count, s = new EM.Spring(0, 40, 13); s.to(to); I.tickers.add(dt => { const moving = I.stepAll([s], dt); dd.textContent = Math.round(EM.clamp(s.v, 0, to)); return moving; }); });

  const place = animate => {
    const ranked = rows.filter(r => r.d[channel] > 0).sort((a, b) => b.d[channel] - a.d[channel] || a.d.operation.localeCompare(b.d.operation)), top = ranked.length ? ranked[0].d[channel] : 1, shown = expanded ? ranked : ranked.slice(0, Math.max(4, Math.floor(list.clientHeight / rowH)));
    subtitle.textContent = ranked.reduce((s, r) => s + r.d[channel], 0).toLocaleString('en-GB') + ' ' + words[channel] + ' across ' + ranked.length + ' tools.';
    rows.forEach(r => { const k = shown.indexOf(r); r.y.to(k >= 0 ? k * rowH : Math.min(r.y.g || 0, list.clientHeight) + (ranked.includes(r) ? rowH * 2 : 0)); r.o.to(k >= 0 ? 1 : 0); kinds.forEach(t => r.w[t].to(channel === 'total' || channel === t ? 100 * r.d[t] / top : 0)); r.n.to(r.d[channel]); if (!animate) [r.y, r.o, r.n, ...kinds.map(t => r.w[t])].forEach(s => s.snap(s.g)); });
    list.classList.toggle('is-all', expanded); spacer.style.height = shown.length * rowH + 'px'; say(ranked);
    all.textContent = expanded ? 'Show the most used' : `Show all ${ranked.length} tools`; all.setAttribute('aria-expanded', expanded); all.hidden = !expanded && ranked.length <= shown.length; I.wake();
  };
  const spacer = document.createElement('li'); spacer.setAttribute('aria-hidden', 'true'); spacer.style.cssText = 'position:static;visibility:hidden;height:0;display:block';
  const build = data => {
    data0 = data; list.textContent = '';
    rows = data.tools.map(d => {
      const li = document.createElement('li'); li.tabIndex = 0; li.setAttribute('role', 'button');
      li.innerHTML = `<span>${names[d.operation] || d.operation}</span><span class="ifc-bar-track" aria-hidden="true">${kinds.map(t => `<i class="ifc-k-${t}"></i>`).join('')}</span><b></b>`; list.appendChild(li);
      const bits = $$('i', li); return { d, li, bits, num: $('b', li), y: new EM.Spring(0, 70, 16.8), o: new EM.Spring(0, 90, 19), n: new EM.Spring(0, 60, 16), w: Object.fromEntries(kinds.map(t => [t, new EM.Spring(0, 90, 19)])) };
    });
    list.appendChild(spacer); rowH = rows[0].li.offsetHeight || 28;
    rows.forEach(r => { const pick = () => { picked = picked === r ? null : r; place(true); }; r.li.addEventListener('click', pick); r.li.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } }); });
    rows.forEach((r, k) => { r.y.snap(k * rowH + 40); });
    I.tickers.add(dt => {
      const moving = I.stepAll(rows.flatMap(r => [r.y, r.o, r.n, r.w.read, r.w.action, r.w.failure]), dt);
      rows.forEach(r => { const o = EM.clamp(r.o.v); r.li.style.transform = `translateY(${r.y.v.toFixed(2)}px)`; r.li.style.opacity = o.toFixed(3); r.li.style.visibility = o < .01 ? 'hidden' : 'visible'; kinds.forEach((t, i) => r.bits[i].style.width = Math.max(0, r.w[t].v).toFixed(3) + '%'); r.num.textContent = Math.max(0, Math.round(r.n.v)); });
      return moving;
    });
    place(true);                                                                        // every bar grows from nothing, and every row rises into its rank
    filters.hidden = false; I.wake();
    $$('button', filters).forEach(b => b.addEventListener('click', () => { channel = b.dataset.count; picked = null; $$('button', filters).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); list.scrollTop = 0; place(true); }));
    all.addEventListener('click', () => { expanded = !expanded; list.scrollTop = 0; place(true); });
    new ResizeObserver(() => place(true)).observe(list);
  };
  fetch('/assets/data/cost-project-record.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(build).catch(() => { /* the authored list above stays as it is */ });
})();
