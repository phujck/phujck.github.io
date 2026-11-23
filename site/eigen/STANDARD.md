# The EigenEngine pages: the standard (one page)

Written at the synthesis of 23 November 2026 from what twelve sessions built. Each rule names the node that shows it best.
The contract (`CONTRACT.md`) says what a node is; this says how it should look, move and read.

| Aspect | Rule | Shown best by |
|---|---|---|
| Names | A title is a name of five words at most, never a question. The question a node answers is its `question`; the main page asks it. Both live in `eigenengine/_graph/site-graph.js` and nowhere else. | the site graph |
| Words to avoid | "the interface", never "Writing App". The Phases of Hierarchy, never "Laws of Learning" for the paper. Pre-release is said once, on the main page; a paper is "Pre-pre-print · an early example". | `interface`, `cost` |
| Voice | A flat general statement, then the concrete case with small numbers. Define a coined noun by its use. No caveats, no status marks, no balanced pairs, no "you". Numbers up to ninety-nine in words in running text. | `build` (paragraph), `reading` (captions) |
| Lengths | Card line 18 words; open paragraph 70; a step caption two sentences. | all |
| Type | Lora for running text, Outfit for labels and every word inside a figure. No monospace. Nothing under 11 px, at the compact size too. Mathematics only at the expert level (KaTeX). | `search`, `reading` |
| Colour | Tokens only (`eigen-tokens.css`). Gold: selected, and a question's weight. Blue: sources and links out. Teal: computed, current. Coral: changed, needs review. Grounds: Cost gold, Phases red, Dynamic Memory blue, the interface green; every other card on the default ground. | `memory`, `change` |
| Card art | Line art, no text, one travelling tracer, a loop with no seam (8 to 18 s), drawn clear of the lower left where the title sits, readable at 200 px. One bright line carries the picture; the rest is one muted tone. | the Hilbert card (`cost`); `build` |
| Exhibit | One real example, computed in the page and not drawn by hand: every number on screen is read from the run. The shared example is the word frequency law (Theorem 5 of The Cost of Complexity) with `build`'s record names. | `search`, `reading`, `change` |
| Steps and captions | Five to eight steps; each visibly rearranges the exhibit. The caption states what holds at that step in general; a status line inside the exhibit gives the particulars, computed from the state so it cannot contradict a control. | `conceptric`, `search` |
| Controls | Every control acts at once, on the exhibit where it stands. A lit button reports the state, not the last press. Pressing the step showing replays it. A refusal says why. | `reading`, `change` |
| Playing itself | An exhibit may play its steps once when first seen; any press stops it. It tells the host (`onStep`) so buttons and caption follow. | `build` |
| Motion | The shared `EigenMotion.Spring`, stepped in pieces of 9 ms or less. Links are redrawn from their ends every frame. Largest change of step under about 10 px per sixtieth of a second. Nothing scrolls the page. Motion ignores the system setting and obeys the page's own switch. | `build` (6 px), `reading` |
| Sizes | An exhibit works from about 330 x 220 (the main page on a phone) to 1100 x 640 and scales its type for a 2560 px window. When small it drops its own controls and leaves the host's steps. | `network`, `memory` |
| A node's page | One screen at 1440 x 900: header bar (from the shell), the card with the paragraph and links on the left, steps, caption and exhibit on the right. On a phone the card, steps and exhibit come before the paragraph. | `reading`, `change` |
| Two levels | Plain and expert readings of the line, paragraph and captions; the expert reading carries the rule with its conditions, from the paper. The exhibit may answer the switch. Supplied so far by `search`, `reading`, `change`, `interface`, `network`, `memory`, `made`. | `reading` |
| The shell | The header bar, the Map button and the map are drawn by `eigen-shell.js` and sized from the window alone, so they are the same size and in the same place on every page: the bar along the top, the button in the top right corner, the map beneath it. Node pages share one type scale (`html.egs-node`). | the shell |
| The map | On every page; pops out; shows the graph, where the reader is and the route taken. | the shell |

Not yet at this standard (left as built): card art of `conceptric`, `search`, `reading` and `change` is busier or sparser than the Hilbert card;
`build`, `conceptric`, `cost` and `phases` have no expert reading; `search` keeps its own record names ("Rarer words cost more", "The word-frequency law");
step buttons, chips and status lines are styled per node; `build` sets its facsimile sheet in Lora and `reading` sets its pages in Outfit.
