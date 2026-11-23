/* The site's own research object: every node, what it holds, what it links to, and who is building it.
   This file is the map. A node's art, exhibit and words come from eigenengine/<slug>/node.js (see dispatch/CONTRACT.md). */
window.EIGEN_GRAPH = {
  root: 'eigen',
  nodes: {
    eigen:      { title: 'EigenEngine', line: 'An integrated research environment for people and AI agents.', children: ['object', 'reading', 'change', 'interface', 'network', 'theory', 'made'], owner: 'pattern', page: '/eigenengine.html' },
    object:     { title: 'The research object', children: ['build', 'conceptric', 'search'], owner: 'pattern', page: '/eigenengine/research-object/' },
    build:      { title: 'Built in stages', question: 'What does it build?', slug: 'built-in-stages', owner: 'build', says: 'An idea becomes claims; claims rest on premises and operations; these are tied to the literature, to numerics and to figures. A durable object, of which a paper or talk is one projection.' },
    conceptric: { title: 'The conceptric', question: 'What is a conceptric?', slug: 'conceptric', owner: 'conceptric', says: 'A relational envelope: recursive, nestable, no preferred level. A set of them can be clustered along different axes, so the order of the hierarchy depends on the axis: a tree that changes shape with the question. The Cost of Complexity motivates the self-similarity and sets the degree of splitting.' },
    search:     { title: 'Navigating conceptrics', question: 'How do you search it?', slug: 'query-diffusion', owner: 'search', says: 'Query diffusion: because the tree changes shape with the question, the question spreads through the links and finds its own way down. Example questions come out with a recommended reading order.' },
    reading:    { title: 'From conceptrics to papers', question: 'How does it become a paper or a talk?', slug: 'projection', owner: 'reading', says: 'Projection of the graph into a linear sequence through a receiver state: the intended audience, what may be assumed, and the sequence of state transitions from that starting point to the results. A manuscript or a talk.' },
    change:     { title: 'Keeping it consistent', question: 'What happens when something changes?', slug: 'revision', owner: 'change', says: 'State machines: a change along a relational axis is flagged by a change of state, forcing attention on neighbours, so a change such as terminology propagates through the whole and consistency is kept.' },
    interface:  { title: 'The human interface', question: 'How does a person work on it?', slug: 'interface', ground: 'interface', owner: 'interface', says: 'Green. The interface (never "the Writing App"): human and agent work on the same object in conjugate representations. The old pages under /demo/writing/ (the film, the simulation, the project record) are upgraded and aligned to the same standard.' },
    network:    { title: 'The research network', question: 'How do projects join up?', slug: 'network', owner: 'network', says: 'The system is self-similar and agnostic to what it holds, so research objects link into a knowledge network: a living, adaptive research effort shaped by scientists working with agents. The earlier article stays at /eigenengine/networked-research/.' },
    theory:     { title: 'Why it scales', question: 'Why should it scale?', children: ['cost', 'phases', 'memory'], owner: 'pattern' },
    cost:       { title: 'The Cost of Complexity', slug: 'cost-paper', ground: 'cost', owner: 'cost', says: 'Gold. A visual overview of the paper, outlining what feeds the design of EigenEngine: why nesting, how far to split. Keep the Hilbert card exactly. Existing page and Kalmár companion are in this directory and beside it.' },
    phases:     { title: 'The Phases of Hierarchy', slug: 'phases-of-hierarchy', ground: 'phases', owner: 'phases', says: 'Red. A visual overview of the paper, outlining what feeds the design: how deep a hierarchy should be, and how a change travels through layers. PDF: /assets/docs/the-phases-of-hierarchy.pdf.' },
    memory:     { title: 'Dynamic Memory', slug: 'dynamic-memory', ground: 'memory', owner: 'memory', says: 'Blue. A visual overview of an early experiment: what a question costs and what a correction disturbs. Lighter than the other two.' },
    made:       { title: 'What it has made', question: 'What has it made so far?', slug: 'made', owner: 'made', says: 'A timeline, its own section, in the order made. Each item is itself a node with its real cover or running animation.' }
  },
  links: [   // [from, to, kind]: from "requires" to, or a paper "supports" an idea
    ['conceptric', 'build', 'requires'], ['search', 'conceptric', 'requires'], ['reading', 'object', 'requires'], ['change', 'object', 'requires'], ['change', 'reading', 'requires'],
    ['interface', 'reading', 'requires'], ['interface', 'change', 'requires'], ['network', 'object', 'requires'], ['network', 'search', 'requires'],
    ['cost', 'conceptric', 'supports'], ['cost', 'search', 'supports'], ['phases', 'change', 'supports'], ['phases', 'conceptric', 'supports'], ['memory', 'search', 'supports'], ['memory', 'change', 'supports'],
    ['made', 'eigen', 'shown by']
  ]
};
