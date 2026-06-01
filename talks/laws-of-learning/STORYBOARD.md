# Storyboard — The Laws of Learning (hour-long, visual-first)

The spine made visual. One row per slide - what it shows, how, and the provenance back to
a source result (R1-R5), the engine narrative, or the grounded source. The arc is the work.
The slides are its projection.

**This is the re-architected deck.** The v1 (16 slides, ~25 min) rushed into the ANF loop by
slide 4. This pass honours three author corrections: (1) it is an HOUR - the runway and depth
fill ~60 min; (2) it is a VISUAL medium - animations carry the global ideas, text is minimised;
(3) it opens with a broad grounding (Act 0) on learning-as-adaptation before ANY ANF maths, then
sets the model up SLOWLY (Act II, staged move-by-move). The v1's strong later acts are kept and
re-paced.

**Audience.** Student physicists, mostly quantum, building reservoir computers, without deep
background. Open WIDE (evolution, gradient descent, markets, brains), land in their world
(echo-state, spectral radius), build the model slowly, pay it off (the viable window they can
drive), turn it on itself (the conceptric), close on the laws.

**Message (one sentence).** Learning is a loop adapting to an environment it helps generate, and
one eigenvalue prices its phases - the same shape of law that fixes your reservoir's spectral
radius - and the theory of it is itself a thing that learns.

---

## The full spine — acts, slides, minute budget (~60 min)

| # | Slide title | What it shows | Asset | Provenance | min |
|---|-------------|---------------|-------|------------|-----|
| **0** | **Act 0 — learning is one phenomenon with many faces** | | | | **~11** |
| 1 | The Laws of Learning | Title + the question. Corner eq `\rho(W)`. | Title card | Frame | 1.5 |
| 2 | Before the Maths | Act-0 contract: forget reservoirs, talk about learning. | Title card | Frame | 0.5 |
| 3 | What do these have in common? | Five systems (falcon / loss surface / market / brain / reservoir). Claim: same SHAPE. | Chip grid | Frame; cast from spine Beat 2 | 2 |
| 4 | The same loop, wearing different clothes | The four faces revealed as one loop (sense → update → environment responds). | **EMBED A0 `many-faces.html`** | R1 loop; the four faces | 3 |
| 5 | A learning system has four moving parts | Slow control, generated environment, fast state, coarse measurement - named in plain words. | Colour-coded loop legend | R1 model, in words; Beat 3 | 2 |
| 6 | The part that makes it interesting | Driven vs adaptive. The one arrow: `h=\Pi(\theta)`. Endogeneity. | Text + the single eq | R1 sec 3, A5; Beat 4 | 2 |
| 7 | Watch the loop close | Driven settles; adaptive (closed loop, stale read) rings. | **EMBED A1 `adaptive-loop.html`** | R1 endogeneity + delay; seed of Beat 5/9 | 2 |
| 8 | Act 0, in one sentence | "Learning is a loop adapting to an environment it helps generate." Bridge to physics. | Text reveals | Synthesis; Beat 4→5 bridge | 1 |
| **I** | **Act I — anchor in your world** | | | | **~7** |
| 9 | You already tune one of these | Act-I pivot card. | Title card | Frame | 0.5 |
| 10 | Your reservoir is a physical system computing | Echo-state, spectral radius `\rho(W)`, edge of chaos. | **EMBED `phase-portrait.html`** (live) | RC canon (Jaeger/Maass) | 3 |
| 11 | One eigenvalue already governs your reservoir | Fade / compute / chaos = their daily practice. Foreshadow the trichotomy figure. | **fig2b_trichotomy.png** (foreshadow) | R3 fig2b, used as foreshadow | 2 |
| 12 | The question of the talk | Reservoir fact, or a law of learning? Promise the derivation. | Text + `\rho(W)\lessgtr1` | Central question; caveat (b) | 1.5 |
| **II** | **Act II — build the model, slowly** | | | | **~16** |
| 13 | Now we earn the equations | Act-II contract: one motivated piece at a time. | Title card | Frame | 0.5 |
| 14 | Move one — the slow control and its field | `\theta` (slow) and `h=\Pi(\theta)` (generated). Just these two. | Stage card | R1 model; Beat 3 | 2 |
| 15 | Move two — the fast parts, and a coarse look | `N` fast parts, scale separation; `m=\langle O\rangle` coarse delayed measurement. | Stage card | R1 model; Beat 3/5 | 2.5 |
| 16 | Move three — close the loop | `m` updates `\theta`. Four legs joined, endogenous. | **fig1_adaptive_loop.png** (now earned) | R1 fig1; Beat 3/4 | 2.5 |
| 17 | Move four — it collapses to one number | Track the error; symmetry → cubic; one return map. Gain `K_N=\alpha\chi_N g`. | Two eq-heros | R1 return map + gain; Beat 5 | 3 |
| 18 | The stability condition is embarrassingly simple | `K_N<K_c(r)=r+1`, i.e. `|r-K_N|<1` - the echo-state condition for the loop. | Stage card | R1 stability; caveat (b) | 2 |
| 19 | Everything now hangs on one question | The whole fate = how `\chi_N` scales with `N`. The funnel. | Stage card | R1→R2 bridge; Beat 5→6 | 1.5 |
| 20 | The susceptibility is a power law | `\chi_N\sim AN^\psi`, `\psi=\log_n\lambda_0`. Not fitted - the log of the decimation eigenvalue. | **fig2a_r2_powerlaw.png** | R2 fig2a; caveat (a) | 2 |
| 21 | Depth is renormalisation time | Decimation tree builds; staircase rises; one step = one factor `\lambda_0`. | **EMBED A2 `coarse-graining.html`** | R2/R4 mechanism; Beat 6/10 | 2.5 |
| 22 | What we have built | Recap ladder: θ,h → N,m → K_N → ψ. Breather. | Ladder + eq | Synthesis of Act II | 1 |
| **III** | **Act III — the payoff** | | | | **~13** |
| 23 | One exponent, three fates | Act-III card: sign of ψ is a complete classifier. | Title card | Frame | 0.5 |
| 24 | The trichotomy | ψ<0 stable / ψ=0 SOC / ψ>0 destabilises at finite N_c. SAME figure as Act I. | **fig2b_trichotomy.png** (pays off) | R3 fig2b; Beat 8; caveat (a) | 2.5 |
| 25 | Too flat destabilises - a flip at finite size | `N_c`, flip bifurcation, two-cycle `\sim\sqrt{N-N_c}`. Callback to A1 ringing. | **fig2c_r3_flip.png** | R3 fig2c; caveat (a) | 2.5 |
| 26 | Drive it yourself | Slider ψ → return-map slope crosses 1 → stable/edge/runaway; viable window pinches. | **EMBED A3 `viable-window.html`** | R3+R4+R5; Beats 8/11/13 | 3 |
| 27 | The escape - and why it is logarithmic | `N_c^{(L)}=N_c^{(1)}\lambda_0^{L-1}`, `L_{\min}\sim\log_{\lambda_0}N`. Why you stack reservoirs. | **fig3b_r4_staircase.png** | R4 fig3b; R4↔deep RC (tight) | 2.5 |
| 28 | The other wall - deep loops freeze | `\rho(L)` locks at 1; inert; reconfiguration `\sim\lambda_0^{L-1}`. The literal spectral radius. | **fig4c_r5_freeze.png** | R5 fig4c; R5↔edge of chaos (tight) | 2 |
| 29 | The viable window | `L_{\min}(N)\le L\le\Lambda`. Both walls priced by the SAME `\lambda_0`. | **fig4a_wedge.png** | R4+R5 fig4a; Beat 13 | 2 |
| **IV** | **Act IV — the turn** | | | | **~7** |
| 30 | Now the strange part | Building the theory is itself hierarchical learning. Three model quotes. | Text reveals | Engine narrative; HANDOFF "the spirit" | 2 |
| 31 | The conceptric - the graph that built this talk | The five results inside the engine that built the talk. The climax. | **EMBED conceptric snapshot** (live upgrade option) | Engine; SESSION_HANDOFF_conceptric | 3 |
| 32 | Closure is provenance, not completion | Frontier never empties; consistency is the guard; contradiction is informative. | Text reveals | Engine; HANDOFF "the spirit" 5-6 | 2 |
| **V** | **Act V — the laws + close** | | | | **~5** |
| 33 | The Laws of Learning | Three laws, earned: eigenvalue prices phases / depth is RG time / endogenous evaluation. | Three-rung laws | Synthesis R1-R5 + engine; caveat (d) | 2.5 |
| 34 | One number, the phases of learning | `\psi` is to the loop what `\rho(W)` is to your reservoir. Callback to Act I. | Closing line | Callback; caveat (c) UV hook optional | 2.5 |

**Total ≈ 60 min.** Act 0 ~11, Act I ~7, Act II ~16, Act III ~13, Act IV ~7, Act V ~5, plus
natural pause at the figures and the driven animations. (34 slides/segments including act cards.)

*Trim levers if running long:* Act-0 slide 8 (one-sentence recap) can be folded into the act
close; Act-II slide 22 (recap ladder) can be cut; Act-V can drop the UV-catastrophe colour. The
embeds are where to SPEND time, not save it - they are the rebuild's whole point.

---

## Animations — BUILT vs SPEC (the core of this pass)

All four are vanilla JS/canvas, self-contained, deterministic, in the proven `viz/why-algebra`
house style (dark instrument card on the paper deck). All four were opened in a browser and
verified: no console errors, the animation plays / the slider drives the trajectory.

### BUILT and verified

- **A0 — `public/viz/many-faces.html`** *(the most important new asset)*. Four faces of learning
  (evolution / gradient descent / a market / a reservoir), each a live mini-simulation, revealed
  to share ONE four-node loop (control → environment → state → measurement → back). Autoplay
  cycles the faces; "All four" shows the four little systems beside the one shared diagram; click
  a face to hold it. The endogeneity leg ("it makes its own field") is labelled. No maths.
  *Verified: cycles cleanly, "All four" composites the shared loop, no console errors.*

- **A3 — `public/viz/viable-window.html`** *(the interactive payoff)*. Two coupled panels. Left:
  a live return-map cobweb; drag ψ and the slope `r-K_N` crosses 1, driving the iterate through
  STABLE (blue, contracts to 0) → EDGE OF CHAOS (gold, tangent to the diagonal) → RUNAWAY
  (vermilion, a clean bounded period-2 flip). A verdict chip names the regime live. Right: the
  `(N,L)` viable window; the floor `L_{\min}\sim\log_{\lambda_0}N` rises as ψ grows and the green
  viable band pinches shut. Sliders: ψ, size N, memory r; a "Kick it" button. Both walls priced
  by the same `\lambda_0`. *Verified: ψ drives all three regimes, the period-2 flip is bounded
  by the saturating map (amplitude ±0.47, not a numerical blow-up), the window pinches live, no
  console errors.* Model is grounded in the spine: return map `e_{k+1}=(r-K_N)e_k+...`, gain
  `K_N=\alpha\chi_N g`, `\chi_N=AN^\psi`, threshold `K_c=r+1`, `\lambda_0=n^\psi`. The bare cubic
  of the spine was replaced with a `tanh` saturation whose slope at 0 is exactly `r-K_N` - so the
  eigenvalue is faithful and the flip is a clean bounded 2-cycle (a bare `-cx^3` with the spine's
  sign diverges rather than saturating; flagged for the author below).

- **A1 — `public/viz/adaptive-loop.html`** *(endogeneity made visible)*. One loop, two wirings.
  Left: a potential well `h=\Pi(\theta)` with a green swarm of fast agents relaxing into it, and
  a coarse delayed measurement `\langle O\rangle`. Right-top: the four-node loop with the
  measurement→control feedback leg DASHED in driven mode (open) and SOLID in adaptive mode
  (closed). Right-bottom: the θ (slow) and m (coarse) time series. Toggle driven/adaptive; in
  adaptive mode the closed loop reacts to a stale read of itself and RINGS (a visible limit
  cycle, the seed of the R3 flip). A τ-separation slider. *Verified: driven tracks smoothly,
  adaptive oscillates with the measurement lagging the control, the feedback leg lights up, no
  console errors.* Grounded in R1 endogeneity + delayed feedback.

- **A2 — `public/viz/coarse-graining.html`** *(depth is renormalisation time)*. Left: a decimation
  tree builds bottom-up - `n^4` primitives grouped n-at-a-time into coarse units up to a single
  root, each level labelled `\chi\times\lambda_0`. Right: the geometric staircase
  `N_c^{(L)}=N_c^{(1)}\lambda_0^{L-1}` rises one tread per level (each riser `\times\lambda_0`),
  tracking the continuous floor `L_{\min}\sim\log_{\lambda_0}N`. Autoplays the level-by-level
  build; "Coarse-grain ▸" steps it by hand; sliders for n and `\lambda_0`. *Verified: the tree
  and staircase build in lockstep, the reset/step/sliders work, no console errors.* Grounded in
  R2 decimation eigenvalue + R4 hierarchical postponement. Does double duty: explains where ψ
  comes from (the tree) AND foreshadows the depth law (the staircase).

### Asset reuse (fetched verbatim, never recoloured)

- `fig1_adaptive_loop.png` (slide 16), `fig2a_r2_powerlaw.png` (20), `fig2b_trichotomy.png`
  (11 foreshadow + 24 payoff), `fig2c_r3_flip.png` (25), `fig3b_r4_staircase.png` (27),
  `fig4c_r5_freeze.png` (28), `fig4a_wedge.png` (29).
- `phase-portrait.html` - the live opener embed (slide 10).
- `conceptric_snapshot.html` - the static climax fallback (slide 31); live viewer is the upgrade.
- `fig3a_decimation_tree.png` - in `public/figs/` but NOT placed (the A2 animation now carries the
  tree live, and one idea per slide forbids a second static R4 figure). Held in reserve.

---

## Provenance discipline (honesty caveats honoured on-slide)

- **(a)** ψ is a *free* classifier. `\psi=1/2` and `N_c\approx 817` are one worked corner, stated
  as such on slides 20, 24, 25, never sold as universal. The A3 slider makes ψ explicitly a knob.
- **(b)** the reservoir `\rho(W)` and the ANF decimation eigenvalue `\lambda_0` are *different
  operators*. Slides 12 and 18 sell "same shape of law, different operator" and flag the analogy.
  The tight links (R4↔deep reservoirs slide 27, R5↔edge of chaos slide 28) are load-bearing; the
  readout↔grouping link (the turn, slide 30) is the loosest and is not over-claimed.
- **(c)** the UV-catastrophe / Planck framing is narrative colour only (slide 34 speaker notes,
  deploy-or-drop), never load-bearing. Condorcet / Radner / Holling are NOT imported as results
  (Radner's log-N coincidence and Holling's K-phase live only in the speaker notes as optional
  colour, flagged PROVISIONAL).
- **(d)** the open author sign-offs (`N_0`, the title "phases of hierarchy", UEC) are NOT inserted.

This deck is a SELF-EXPERIMENT - authored by an AI agent acting as the author, 2026-06-01.
Provenance: `claude-acting-as-author`. See `README.md`.

---

## Build / verify status

**Build — clean.** `npx slidev build slides.md --base /talks/laws-of-learning/` compiles
(`✓ built`). The only stderr is the harmless upstream `@vueuse/core` `[INVALID_ANNOTATION]`
warning (present in the v1 baseline too; PowerShell reports it as a non-zero code, but Slidev
builds). All five viz files land in `dist/viz/`.

**Render — inspected through a served build.** Act-0 chip grid, the colour-coded loop legend, the
Act-II stage cards, inline + display KaTeX, and the live embeds (many-faces, adaptive-loop,
viable-window, phase-portrait) all render and hydrate. The `Embed`/`Fig` components resolve the
deploy base, so `/viz/x.html` → `/talks/laws-of-learning/viz/x.html` in production.

**Animations — opened and driven.** All four verified in-browser (screenshots + console-error
checks + state probes): A0 cycles and composites, A1 rings when the loop closes, A2 builds tree
+ staircase in lockstep, A3's ψ slider drives the full trichotomy and pinches the window.

---

## What remains LIGHTER-DRAFT (for the fine-tune)

- **Act IV (slides 30-32)** is the v1's text-reveal turn, re-paced but still prose-led. The
  conceptric climax (31) ships the STATIC snapshot - the live viewer needs its localhost server,
  and a static-export / mp4 of the live graph is still the open build task so the PUBLISHED deck
  can be interactive. Until then it degrades to the snapshot.
- **The UV-catastrophe close (slide 34)** is held in the speaker notes as optional colour, not
  built into the slide. The author decides whether to promote it.
- **The A1 ringing** is tuned to oscillate clearly (gain past threshold) but is slightly
  square-wave at the rails rather than a smooth limit cycle - cosmetic, not wrong. A gentler gain
  or a softer saturation would round it if the author prefers.
- The act title cards (2, 9, 13, 23) are deliberately minimal - they could carry a small visual
  if the author wants them less bare.

---

## The single biggest thing the author should decide in the fine-tune

**The A3 nonlinearity sign, and how hard to lean on the return-map ↔ echo-state identity.** The
spine writes the cubic as `-\alpha c_N e_k^3`. With that sign and `slope<-1`, the bare cubic map
*diverges* rather than settling into the bounded period-2 flip the figures (fig2c) show - so A3
uses a `tanh` saturation with `f'(0)=r-K_N` (the eigenvalue is exact; the saturation is the
generic higher-order term that bounds the flip). This is honest and visually correct, but it
quietly assumes the higher-order terms re-stabilise. The author should confirm the supercritical
(stable-2-cycle) reading of the flip is the intended one, and decide how strongly to sell slide
18's "this IS the echo-state condition, different operator" - it is the most load-bearing rhyme
in the talk and the place a sharp reservoir audience will push hardest (alongside the
readout↔grouping analogy in the turn, which is flagged but thin). Everything else is figure- or
R-backed.
