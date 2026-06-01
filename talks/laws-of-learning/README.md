# The Laws of Learning — a talk for reservoir physicists (~60 min)

A Slidev deck. What decides whether a learning system fades, computes, or runs away.
Built for student physicists - mostly quantum, mostly building reservoir computers - it
opens WIDE (learning as adaptation, across evolution, gradient descent, markets and brains),
lands in their world (echo-state property, spectral radius, the edge of chaos), builds the
adaptive-loop model SLOWLY, pays it off (a viable-window phase diagram they can drive), turns
the theory on itself (the conceptric), and closes on the laws.

**Hour-long, visual-first.** Animations carry the global ideas; text is minimised. The deck
re-architects an earlier ~25-min v1 to three author corrections: it fills an hour, it is a
visual medium, and it grounds the audience broadly before any ANF maths. See `STORYBOARD.md`
for the full 34-slide spine with a per-act minute budget summing to ~60.

## SELF-EXPERIMENT

**This deck was authored by an AI agent acting AS the author (Gerard McCaul), on
2026-06-01, exercising the `talk_smith` / `visual_director` pipeline.** It is a *draft to
be fine-tuned and iterated by the author*, not a finished talk.

- **Provenance:** `claude-acting-as-author`.
- **Pipeline:** `talk_smith` (primitives → storyboard → asset handoff → styled execution →
  refine). The friction of this first build is the data that fine-tunes the skill.
- **Source of truth:** the ANF results **R1–R5** (`adaptive-normal-form/talk/spine.md`,
  `…/workflow/state/substrate.md`) and the build record of these sessions (the engine /
  conceptric narrative). Every slide traces to a source result, figure, or the engine
  narrative — see `STORYBOARD.md` for per-slide provenance. No invented physics.
- **Theme:** a later pass took the deck **dark** to match the author's dark website (it lives
  on phujck.github.io), inheriting that site's palette. The reused light REVTeX figures are
  inverted at render time so they read on dark. Theming only - no content, spine or physics
  changed. See the `theme/` note under Files.
- **Live copy + the doubled close.** A built static copy is published at `/talks/laws-of-learning/`
  (the committed Slidev build at the talk-dir root, matching how `dynamics-as-computation` ships).
  The final reveal was reworked into a **dual graph close** - the talk's own five results R1-R5 as
  a graph beside the engine that built them as a graph - landing *the build is the talk is the
  engine* in one picture. The engine-graph is a self-contained **facsimile**
  (`public/viz/engine-facsimile.html`) - the canon's ~38 skill *names* clustered by activity
  (generating, staging, evaluating), a facsimile of the shape only, no live server and no canon
  prose. This is the self-experiment closing on itself - the deck shows the engine that drafted it.

## Run it

```bash
npm install
npm run dev          # live, with the v-click reveals
npm run build        # static build → dist/
```

The deck embeds six live assets, all self-contained vanilla-JS canvas under `public/viz/`
(deterministic, no build step, dark instruments that sit natively on the dark deck):

- **A0 `many-faces.html`** (Act 0) — four faces of learning (evolution / gradient descent /
  a market / a reservoir) revealed as one loop. The broad grounding. *The most important new
  asset.*
- **A1 `adaptive-loop.html`** (Act 0) — endogeneity made visible: a driven loop settles, a
  closed (adaptive) loop reacting to a stale read of itself rings.
- **`phase-portrait.html`** (Act I) — a real dynamical system the audience drives (their
  reservoir, made physical).
- **A2 `coarse-graining.html`** (Act II) — the decimation tree and the log-N staircase
  building in lockstep: depth is renormalisation time.
- **A3 `viable-window.html`** (Act III) — *the interactive payoff.* A ψ slider drives a live
  return-map through stable → edge → runaway, and the viable window pinches shut. The RC
  audience can drive the trichotomy.
- **the conceptric** (Act IV) — the recursive learning graph that built this talk.
  - *Published / default:* a static, server-free snapshot
    (`public/figs/conceptric_snapshot.html`) — the R1–R5 theory graph with R2's maths
    feeding into "The Laws of Learning". Always renders.
  - *Live upgrade (presenting locally):* run the viewer and point the conceptric `<Embed>`
    (the climax slide) at it for the fully interactive graph:
    ```bash
    # the polished viewer now supports --source canon directly:
    python -m laplace.viewer --source canon --port 8765
    # or the ANF substrate graph:
    python -m laplace.viewer --source substrate \
      --path .../adaptive-normal-form/workflow/state/substrate.md --port 8765
    # then set the climax-slide Embed src to http://localhost:8765
    ```
  - *Open build task:* a static-export or mp4 step for the live viewer, so the **published**
    deck can be interactive too. Until then the deck degrades gracefully to the snapshot.

## Honesty caveats honoured (do not strip these in the fine-tune)

- **(a)** `\psi` is a *free* classifier. `\psi=1/2` and `N_c\approx 817` are one worked
  corner of parameter space, stated as such on the power-law / trichotomy / flip slides
  (20, 24, 25), never sold as universal. The A3 slider makes ψ explicitly a knob.
- **(b)** the reservoir's `\rho(W)` and the ANF decimation eigenvalue `\lambda_0` are
  *different operators*. The Act-I question (12) and the stability slide (18) sell "same
  **shape** of law, different operator" and flag the analogy as analogy. The tight links
  (R4 ↔ deep reservoirs, R5 ↔ edge of chaos) are the load-bearing ones; the readout ↔
  grouping link (the turn) is the loosest and is not over-claimed.
- **(c)** the UV-catastrophe / Planck framing is narrative colour only (the close, in the
  speaker notes, deploy-or-drop), never load-bearing physics. Condorcet / Radner / Holling
  are not imported as results — they live only in speaker notes, flagged PROVISIONAL.
- **(d)** the open author sign-offs (`N_0`, the title "phases of hierarchy", UEC) are
  deliberately **not** inserted — they are the author's to coin.

## Files

- `slides.md` — the deck (~34 slides/segments, Act 0–V, ~60 min).
- `STORYBOARD.md` — the full spine with per-act minute budget, the BUILT-vs-SPEC animation
  list, provenance, and the author-decision flag.
- `theme/` — dark theme, inheriting the website palette (the deck lives on the dark site at
  phujck.github.io, so it takes the site's own colours from `assets/css/style.css`: deep navy
  ground `#0a0e1a`, warm off-white ink `#e8e6e3`, the gold brand accent `#c9a96e`, the soft-blue
  link `#7eb8da`). This also dissolves the seam with the dark live embeds (the conceptric viewer
  and the canvas instruments sit on the same `#0e1116` family). The reused ANF figures are
  white-background REVTeX, so they are inverted at render time (`invert(1) hue-rotate(180deg)` in
  `Fig.vue` / `paper.css`) - the white field flips to dark while the Okabe-Ito data colours stay
  roughly true - source PNGs untouched. `theme/styles/layout.css` holds the base palette and
  `theme/styles/paper.css` the per-slide furniture (the Act-0 chip grid, the loop legend, the
  Act-II stage cards), now dark. (The `class: paper` name is retained for the per-slide skin
  hook - it is now a dark skin, not a light one.)
- `components/` — `Fig.vue` (verbatim figure reuse), `Embed.vue` (sandboxed live iframe).
- `public/figs/` — the eight ANF figures, verbatim, plus the conceptric snapshot.
- `public/viz/` — the live embeds: `many-faces`, `adaptive-loop`, `phase-portrait`,
  `coarse-graining`, `viable-window`, and `engine-facsimile` (the names-only engine-skill graph
  for the dual close).
