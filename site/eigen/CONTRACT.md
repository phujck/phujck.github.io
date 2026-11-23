# The node contract

The site is one graph. Its map is `eigenengine/_graph/site-graph.js` in the site repository (read it: ids, titles, children, links, owners). Every node has the same shape at every depth, which is what the site explains:

- an **outside**: an animated card (line art behind a title and one sentence) and its named links to other nodes;
- an **inside**: either more nodes (its children) or one live exhibit that demonstrates the idea.

One recursive pattern (packet `pattern`) draws any node from this contract. Rooted at `eigen` it is the main page; rooted at your node it is your node's own page; drawn small it is the mini-page. So a node is written once and appears in all three.

## What a node session delivers, in `eigenengine/<slug>/`
`node.js` registers:
```js
window.EIGEN_NODES = window.EIGEN_NODES || {};
window.EIGEN_NODES['<id>'] = {
  title: '…',          // a short name, five words at most; not a question
  question: '…',       // the question this node answers; the main page lists these, and asking one highlights and orders the nodes that answer it
  line: '…',           // one sentence for the closed card, 18 words at most
  text: '…',           // the paragraph shown when the node is open, 70 words at most, in his register
  art(svg) { … return { tick(t), destroy() }; },
      // The looping drawing behind the closed card, in the manner of the Hilbert card: line art, a travelling tracer,
      // no text. Draw into the given <svg> (viewBox 0 0 400 300, set by the caller). t is seconds. The loop must have
      // no visible seam. Colours from the --eg-* tokens of the node's ground. It must still read at 200 px wide.
  exhibit: {             // leaves only: the live demonstration of the idea
    steps: [{ label: '…', caption: '…' }, …],   // each step restructures the exhibit visibly; captions two sentences at most
    mount(el, { compact }) { … return { step(i), destroy() }; }
      // Fill el (any size; compact is about 620x460 inside the main page, full is about 1100x640 on the node's page).
      // Everything moves by springs or equivalent continuous motion (EigenMotion.Spring). Links stay attached.
      // The reader can also act on it directly; every control has an immediate visible effect.
  },
  sections: [ { title: '…', mount(el) { … } }, … ]   // optional: further sections for the node's own page
};
```
Also `node.css` (scoped under `.egn-<id>`), any images, and `index.html`: a standalone page for the node that loads the tokens, motion and your node, and shows it whole (card, exhibit at full size, sections). The synthesis will wrap it in the pattern's shell.

Fonts: Lora for text, Outfit for labels and every word inside a figure. No monospace. No text inside `art`.

## The harness
`http://localhost:8123/site/eigen/harness/?node=<id>&slug=<slug>` shows your card at three sizes with the art running, and your exhibit mounted compact and full, with a motion switch. Use it constantly.

## Self-similarity
If your node naturally has parts, make them children: register each as its own node with the same shape. The pattern will nest them. Where the idea itself is recursive (the conceptric, the network), the exhibit must show the recursion happening, not describe it.

## Two levels (added 14:40)
His words: "ideally there should be a toggle on technicality for all the description, so that an expert can have the full equations etc."
Any text field may be given at two levels: `text: { plain: '…', expert: '…' }`, and likewise `line` and each step's `caption`. A plain string counts as both. The expert level may carry equations (write them as LaTeX between `\\(` and `\\)`; the pattern renders them) and the precise statement with its conditions, taken from the paper. The page-wide switch sets `document.documentElement.dataset.level` to `plain` or `expert` and fires a `eigen-level` event on `window`; an exhibit may respond (for example by showing the equation it is computing). The switch is the receiver state made literal: the same object, read out for a different reader.

## Added at synthesis (23 November 2026)
- **Names come from the graph.** `title` and `question` in `eigenengine/_graph/site-graph.js` are the ones shown; the pattern and the shell overwrite a node's own. The main page's "Ask it" list is the nodes' questions.
- **`mount(el, { compact, onStep })`.** When an exhibit changes step by itself (it plays itself, or the reader presses a control inside it) it calls `onStep(i)`, so the host's step buttons and caption follow. It dispatches a bubbling `eigen-exhibit-change` on `el` when the reader acts by hand; the host then stops its own tour.
- **`steps[i].hold`** (milliseconds): how long the host's tour waits on that step. The default is 4.2 s.
- **Classes.** Every rule of `node.css` sits under `.egn-<id>`, with a class prefix no other node uses (list those taken with `grep -oh '^\.[a-z]*-' eigenengine/*/node.css | sort -u`).
- **Two levels** are supplied through `eigenengine/projection/level.js` (`EigenLevel.two(plain, expert)`); see the header of that file.
- **The shell.** A node's `index.html` loads `assets/css/eigen-shell.css` in its head and `assets/js/eigen-shell.js` last in its body. The shell writes the header bar (crumbs from the graph, the level switch if the page has one, the motion switch, the map), rewrites `nav[aria-label="Linked to this"]` from the graph's links, and records the reader's route.
