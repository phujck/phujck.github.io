/* Words for the three cards the pattern itself owns (the root and the two that hold others), the main page's
   questions, and its reading orders. Every other card is a node of its own: eigenengine/<slug>/node.js supplies its
   art, words and exhibit. Names and questions are taken from the site graph (eigenengine/_graph/site-graph.js), so a
   node is named in one place only. */
(() => {
  'use strict';
  const T = {
    eigen: { title: 'EigenEngine', line: 'An integrated research environment for people and AI agents.' },
    object: { short: 'object', line: 'A graph of claims, sources, calculations and figures, of which a paper is one reading.', text: 'Research begins with an idea, which has to be sharpened into claims before anyone can argue with it. Each claim rests on premises, a derivation, a passage in the literature, a calculation or a figure. We call the linked whole a <i>research object</i>. The three cards inside ask how it is built, what holds it together and how anything in it is found.', out: [{ href: '/eigenengine/research-object/', label: 'The research object on its own page →' }] },
    theory: { short: 'theory', line: 'Three early papers ask what nesting costs, how deep to go, and what a correction disturbs.', text: 'A design of this kind makes claims that can be checked. Nesting has a price, a hierarchy can be too shallow or too deep, and a memory that is corrected should not have to be rebuilt. Three papers examine these in turn, and their results set how far a level splits, how deep the nesting goes and what a correction may touch. They are pre-pre-prints and early examples, each written with EigenEngine.' },
    reading: { short: 'paper' }, change: { short: 'change' }, interface: { short: 'interface' }, network: { short: 'network' }, made: { short: 'made' }
  };

  window.EIGEN_PATTERN_DATA = {
    alias: { how: 'conceptric', problem: 'conceptric', memory: 'search', 'ee-memory-map': 'search', workspace: 'interface', see: 'made', paper: 'cost', phases: 'phases', 'networked-research': 'network' },
    questions: [],          // filled from the graph below: one question to a node, asked of the whole page
    readers: [
      { id: 'new', label: 'a newcomer', order: ['build', 'conceptric', 'search', 'reading', 'change', 'interface', 'network', 'made'], say: 'Read as a newcomer: eight cards in a line, and each needs only what the earlier ones gave. The papers are set aside.' },
      { id: 'phys', label: 'a physicist', order: ['build', 'cost', 'conceptric', 'search', 'memory', 'reading', 'change', 'phases'], say: 'Read as a physicist: each paper now sits beside the idea it supports, and the cards that add no theory are set aside.' },
      { id: 'use', label: 'someone who will use it', order: ['build', 'reading', 'change', 'interface', 'conceptric', 'search', 'network'], say: 'Read as someone who will use it: what it makes and how a person works on it come first, and the machinery after.' }],
    liftSay: {
      part: 'Lifted by “is part of”: each card sits inside the card it belongs to. This is one hierarchy among several.',
      rests: 'Lifted by “requires”: each card sits above the cards it requires, and the boxes that held them are gone. What was nested three deep is now the foundation.',
      support: 'Lifted by “is supported by”: the three papers rise to the top and the ideas each one supports hang beneath them.' }
  };

  /* Name every node from the graph, fill in the three cards above, and write the page's questions. */
  window.EIGEN_PATTERN_FILL = () => {
    const D = window.EIGEN_NODES = window.EIGEN_NODES || {}, G = window.EIGEN_GRAPH;
    for (const id in T) D[id] = Object.assign({}, T[id], D[id] || {});
    const qs = [];
    for (const id in G.nodes) {
      const g = G.nodes[id], d = D[id] = D[id] || {};
      if (g.title) d.title = g.title;
      if (g.question) d.question = g.question;
      if (g.slug && !d.page) d.page = `/eigenengine/${g.slug}/`;
      if (g.page && id !== G.root && !d.page) d.page = g.page;
      if (d.page && !(d.out || []).some(o => o.href === d.page)) d.out = [{ href: d.page, label: 'This card on its own page →' }].concat(d.out || []);
      if (g.question && id !== G.root) {
        const seed = {}; (g.children && g.children.length ? g.children : [id]).forEach(k => { seed[k] = 1; });
        qs.push({ id: 'q-' + id, label: g.question, seed, say: `It straightens into a reading order for “${g.question}” Open the first card and follow the numbers; the rest is set aside.` });
      }
    }
    window.EIGEN_PATTERN_DATA.questions = qs;
  };
})();
