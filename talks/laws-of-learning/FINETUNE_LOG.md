# Fine-tune log - The Laws of Learning

The author-driven iteration of the self-experiment draft. Each entry: what changed, why, and
status. This log is the friction record the dreamer reads to forge `talk_smith` v2 - keep it
honest, keep it current.

**Session 2026-06-01 (author at the wheel, joint fine-tune).** The v1 self-experiment deck
(`claude-acting-as-author`) is the draft. The author drives the changes by eye, slide by slide.

## Decisions parked
- **Environment.** Author to the Slidev rail the deck already lives in - per-slide routing,
  presenter mode, v-click reveals, deploys to the site like `dynamics-as-computation`. Iterate
  in the local Slidev environment, touch the wider site only at deploy.
- **Deferred title art.** The title-page art is generated at the END, once the whole talk's
  content is known so it reflects it (algorithmic p5.js or image-gen). Not before.

## Changes
- **[DONE] Slide 1 (title) - stripped.** Removed the top kicker, the eq-note subtitle, and the
  corner equation `\rho(W) \lessgtr 1` (a cold-open with no referent). Now title + name only,
  with the art slot marked for the end. Author: "too much text ... title, name, and then a
  piece of art."
- **[OPEN] Act 0 - too much text.** The broad-open-on-a-question move is right and stays. The
  specific card(s) to thin are to be pointed at on the live deck. The exact direction was lost
  to a mic dropout after "I like performance" - re-elicit on the live view.

## Global presentation principles (author narration, 2026-06-01)
Standing rules for the whole deck, not one slide. Apply on the final fix pass.
- **Impersonal voice, no second person.** Strip "you / your" address throughout. Prefer impersonal
  phrasing, no pronouns where possible. Exceptions allowed but rare - the default is impersonal.
  (NB for the forge: this OVERRIDES the talks-axiom latitude for "direct address" - the author's
  taste is impersonal-academic, not second-person. A real signal for talk_smith v2.)
- **Minimal ancillary text.** Keep on-slide helper text to a minimum - applet captions, "click X"
  instructions, editorial subtitles. It is a talk, do not overload the room. Text earns its place
  two ways only - remind the speaker what to say, and orient the audience to what they are looking
  at. Beyond that it is overload. The talk is visual. CALIBRATION (author softened this): much of the
  talk text IS useful - the target is the PADDING / filler specifically (the "great point, how can I
  help" register), not all text. Cut the padding, keep the substance.
- **No antithetical parallelism ("X not Y").** Forbid constructions whose only content is "not X,
  it is Y" / "X, not Y" - e.g. "the field is not given, it is made". State the claim directly and
  declaratively instead. (This is the Laplace Voice's existing ban on forced parallelism - the
  self-experiment draft violated it. Forge signal: the talk pipeline must enforce the voice's
  no-slop rule, not only physics provenance.)

## Act 0 - author narration (2026-06-01) [TO FIX AT END]
- **Slide 2 (Before the Maths).** Drop "Forget reservoirs for ten minutes" from the subtitle.
- **Slide 3 (What Do These Have in Common?).** Keep the five examples. Reorder them as a GRADIENT
  from simple / algebraic to larger, more complex systems. Drop the subtitle "I claim they are the
  same shape." Ambitious nice-to-have (low priority, heavy animation): the five appear as a list on
  the left over time, with a right-hand animation that MORPHS from one object's schematic into the
  next as each appears.
- **Slide 4 (The Same Loop, Wearing Different Clothes - the many-faces A0 embed).**
  - Reconsider the title (author unsure of "The Same Loop, Wearing Different Clothes").
  - The animation CONCEPT is loved - the execution needs rework:
    - **Fit the frame.** The embed does not fit the slide, it requires scrolling up and down. Must
      sit seamlessly in the slide, no scroll. (Top pain point.)
    - **Crispness.** Resolution and fonts are grainy - render crisp.
    - **No overlaps.** Labels overlap the visuals ("measure", "environment", "fitness landscape",
      "who survives", "fast points"). Fix the collisions. (Strong dislike.)
    - **Pace (clarified).** Slow ONLY the feedback-loop panel's transit - the highlight cycling
      control -> environment -> state -> measure - which was too fast to follow. The other panels
      (the four face simulations) were well-paced, keep their speeds. NOT a blanket slow-down.
    - **Per-panel legibility.** Gradient descent: the ball sits at the bottom the whole time, which
      is confusing. Evolution: unclear what it depicts. Market and reservoir: hard to disambiguate.
      Each panel should read clearly on its own.
    - **Trim text.** Strip the instructional captions ("click a face", "autoplay cycles the phases",
      "click a phase to hold it") to a minimum.
- **Slide 5 (A Learning System Has Four Moving Parts).** Content and schematic: happy. Fixes: (1)
  the slide uses only the top half - dead horizontal space underneath. Use the full canvas. (2) Draw
  the feedback as an actual LOOP on the figure (close the "updates the control" arrow round the
  figure) rather than a text line, so the feedback reads visually.
- **Slide 6 (The Part That Makes It Interesting).** Author unsure of the slide - too wordy. The
  thermostat / falling-stone framing reads as conversational prompt-response filler - tighten hard.
  Kill "the field is not given, it is made" (covered by the global no-antithesis rule above).
- **Slides 6 + 7 - MERGE.** Bring "The Part That Makes It Interesting" (6, endogeneity) together with
  "Watch the Loop Close" (7, the adaptive-loop A1 applet) into one polished unit: a little framing on
  endogeneity, then the applet embedded so it reads cleanly on the slide. Consolidate, put the work
  in, polish.
- **Slide 7 (Watch the Loop Close - adaptive-loop A1 embed).** Concept nice, execution horrible -
  the same pain points as slide 4: too much text scattered around, not clean. Polish the applet,
  embed it so it fits and reads on the slide. Minimal orienting text only.

### Act 0 close + Act I
- **Slide 8 (Act 0, in one sentence - the bridge to physics).** Mostly fine. The recap reads well
  (slow control / generated environment / fast state / coarse measurement, then "because it is
  endogenous, stability is not guaranteed - that is where the physics begins"). KILL the "it is not
  an analogy" line - another antithesis, and it does not land for the author.
- **Slide 9 (Act I pivot - "You Already Tune One of These") - DEFERRED, revisit.** Author dislikes
  everything about the slide as it stands. The Act I IDEA is good, but the framing is wrong: Act I
  should read as the turn into the formal model / formal modelling (the spirit of "now, the model",
  NOT literally "let's talk about our model"). Flagged to come back to for the detail.
- **Slide 10 (Your Reservoir Is a Physical System Computing - phase-portrait embed).** Drop "Your"
  from the title (no second person). KEEP the echo-state-property + spectral-radius framing - that is
  the right content. But the phase-portrait embed is LAZY - lifted straight from the paper, and it
  does not actually show what a reservoir does. Replace it with a proper reservoir SCHEMATIC
  (interactive or static) that captures the idea: an input, what the reservoir transformation
  actually does, the loop fed back on itself, and the one quantity that governs it - the spectral
  radius rho(W) - deciding whether the looped signal contracts or grows. The point to land: there is
  one important quantity governing the reservoir's behaviour.
- **Slide 11 (One Eigenvalue Already Governs Your Reservoir - trichotomy foreshadow) - KILL.**
  Terrible slide, jumps the gun on the eigenvalue / trichotomy badly, before it is earned. Delete it.
  KNOCK-ON: this was the Act-I foreshadow of fig2b_trichotomy that "pays off" at slide 24 ("SAME
  figure as Act I"). With the foreshadow gone, slide 24's callback framing must be adjusted on the
  fix pass - it no longer pays off an Act-I plant.
- **Slide 12 (The Question of the Talk) - KEEP CORE, two cuts.** The core question stays (edge of
  chaos: a fact about reservoirs, or one face of a law of learning - the same shape governing the
  falcon, the market, the brain). Slightly portentous in tone, flag as a possible later tone pass.
  CUT two things: (1) "then we will see if your eigenvalue is an instance of it" - hated: second
  person, and it references an eigenvalue the audience has no referent for yet (assumes knowledge
  not established). (2) the closing "derive it all from scratch" promise - said too soon, cut the
  last part of the slide.

### Act II - build the model
- **[NEW SLIDE] Phenomenology before the solve.** Before the derivation, a slide that runs the
  two-level loop and varies `N` and `tau` - it settles, then rings - so the transition is SEEN
  before it is explained. Grounds why the maths is needed. New applet (two-level N-tau explorer),
  distinct from A3. See `DERIVATION_SPINE.md` B3.5. Slots after the model setup, before the
  self-consistency solve.
- **Slide 13 (Act II card - "Now We Earn the Equations").** Strip the methodology recitation - it
  just repeats the design instruction back ("earn the equations one piece at a time, each motivated
  before the next"). That is scaffolding, not slide content. The act card should be minimal: Act II
  is the model. (Pattern: the draft leaked its own design-contract / methodology language onto the
  act cards - Act 0 "contract", Act II "contract". Slides carry content, not the meta-instructions
  that generated them. Forge signal for talk_smith.)
- **Slides 14-17 (the four "moves") - RESTRUCTURE into one zoomable loop.** Today: four separate
  "move" slides naming the parts, with a figure shared across moves 3-4. Instead: make the LOOP
  itself the central slide - the figure (control / environment / fast state / order parameter) - and
  click through it by ZOOMING IN on each part in turn, each reveal explaining what that part is and
  the equation that governs it. The loop is the visual spine of Act II, the maths hangs off its
  parts. (Today the equations are on the slide but hard to interpret - zoom-and-explain fixes that.)
  Author note: the current version is a fair first pass given it was built from results, not a
  finished paper - this is exactly what the fine-tune is for.
- **Act II framing - state the model is the LOCAL version.** Right at the start of the model build,
  say we are taking this as effectively only the local (single-layer) version, with the higher-order
  [variational] parameter. Establish that scope before anything else.
- **CRITICAL GAP - the RG / decimation jump is unmotivated.** Later the talk goes STRAIGHT to
  renormalisation and decimation with no motivation. The missing bridge: "what happens if we add
  intervening layers, in a self-similar way?" That step is completely absent - missing because the
  draft worked directly from the results (R1-R5), not a finished paper, so it skips the connective
  motivation. CONSEQUENCE: the middle section does not earn its keep - it paces slowly but never
  shows WHERE THE EQUATIONS ACTUALLY COME FROM. The fix pass must insert the self-similar-layering
  motivation that earns the decimation/RG move. NB: that argument is the author's physics - scaffold
  it, do not invent it.
- **DEEPER GAP - the self-consistency derivation is missing (the foundation).** Extends the above.
  The whole return-map derivation comes from a SELF-CONSISTENCY argument the draft never makes: where
  does `e_{k+1}` come from? That is where the gain `K_N` is defined - and the rest of the paper hangs
  off it. The draft states the return map and gain as given (from R1) without deriving them, so the
  slow build never shows their origin. Desired Act II flow on the loop slide: for each stage of the
  loop, say WHY we describe it this way and HOW it captures the essential details -> then the
  susceptibility -> then define the gain and bring it together as "this is what says where the system
  is living" (the regime) -> then justify the modelling assumptions ("these are the things we do with
  the model, and here is why this is fine"). This is the deepest author-fork in the talk: where do
  the equations come from, why, and how to present the end results so they stand on their own. Think
  it through carefully and jointly at the fix pass - do not paper over it.
- **Slide 18 (The Stability Condition Is Embarrassingly Simple).** Retitle to just "The Stability
  Condition" (drop "embarrassingly simple"). Uses only half the real estate (same as slide 5) but
  the author does not mind it here - low priority.
- **Slides 19-21 (chi_N scaling -> power law -> decimation) - REORDER, the heart of the recontext.**
  The draft jumps straight to the hierarchical / RG picture ("one scaling law defines the fate of the
  whole family", group n parts into one, repeat at a self-similar fixed point, each step x a fixed
  factor). Premature. Correct order:
  1. The specific TWO-LEVEL (local) model first - just N microscopic + the variational principle.
  2. THEN generalise: what happens when we add intervening layers that look like a hierarchy.
  3. THEN the renormalisation picture emerges - and EXPLAIN what lambda_0 (the decimation eigenvalue,
     the RG "destination") actually is.
  - The susceptibilities are pulled out via a SELF-CONSISTENT solution (author corrected himself:
    self-consistent, NOT self-similar). Show that - it is how the equations get set up.
  - RG animation: lean into zoom-in / zoom-out, "it all looks the same" self-similarity (the
    coarse-graining A2 asset is the seed, rework toward this). The RG intuition comes FIRST and
    motivates, THEN the susceptibility power law follows from it.
- **PROCESS GATE for the fix pass.** Before editing ANY slides in this middle section, the FIRST
  deliverable is a PLAN: how the derivation and RG bit get re-explained and re-contextualised
  (two-level -> add layers -> RG, with self-consistency producing the susceptibilities and lambda_0
  explained). Present that approach, get sign-off, THEN touch slides.
- **Slide 21 (Depth Is Renormalisation Time - coarse-graining A2 applet).** Love the idea, hate the
  execution - all the recurring applet problems (grainy fonts, label overlaps, unreadable, does not
  fit). AND it presupposes the hierarchical / RG context that was never built, so it lands without
  the motivation (the missing bridge again). Once the recontextualisation (two-level -> add layers ->
  RG) is in place this applet pays off, until then it is unmotivated. Reinforces the teaching
  principle: the audience does not have full maths context, so explain step by step from the pieces
  we take, and do it visually so they can follow.

- **Slide 22 (What We Have Built - recap).** Two things. (1) ADD universality: this is the place to
  say the system falls into a UNIVERSALITY CLASS, and the whole reason for the setup is to be largely
  insensitive to the particular dynamics. (2) FIX broken maths - `K_N ~ N^psi` renders as raw text
  (k_n, n caret psi), KaTeX not applied. Make it proper display maths. Also needs the missing
  derivation pieces (per the Act II recontext above).

### Act III - the payoff
- **Slide 23 (Act III card - "One Exponent, Three Fates" / "the payoff").** Too much text. Give the
  act card a more sensible, concise name. (Same act-card overload pattern as slide 13.)
- **Slide 24 (The Trichotomy).** (a) The name "trichotomy" is slightly weird - consider renaming, but
  the author is largely okay with it (low priority). (b) ADD: make the point with `m*` and relate the
  three fates to the notion of ATTRACTORS. (c) LAYOUT: the text takes only half the real estate while
  the figure takes the whole slide - they compete. Compose them properly. (Also: slide 24 was the
  trichotomy "payoff" of the killed slide-11 foreshadow - its "same figure as Act I" framing is now
  moot, see the slide-11 knock-on.)
- **Slide 25 (Too Flat Destabilises - a Flip at Finite Size).** FINE as is. No change.
- **Slide 26 (Drive It Yourself - viable-window A3 interactive).** Love the idea, same applet
  execution problems as the others. ADD a couple of PRESETS for the talk - one-click "stable" and
  "edge of chaos" regime states.

- **Slide 27 (The Escape - and Why It Is Logarithmic, R4 staircase).** The stacking-levels / RG
  material is not fully consistent and not introduced in a logical order (reinforces the recontext).
  KILL "derived, not decreed" (antithesis - global rule). The slide itself is good enough, and the
  "how do we fix the instability as the system grows" idea is liked.
- **CRUCIAL MISSING MODEL COMPONENT - the relaxation time tau.** The model updates the upper level
  PERIODICALLY, with a relaxation time tau - it is not just "looping". Never introduced, and crucial.
  Logical order to fix: introduce tau -> show the (tau, N) PHASE DIAGRAM revealing where the
  instability arises -> THEN present the amelioration (adding hierarchical levels = the escape). The
  hierarchical / escape material must come AFTER the tau-N instability is established. (NB: tau
  already exists as a slider in the A1 adaptive-loop applet but was never introduced as a concept -
  asset ahead of narrative.)
- **Slide 28 (The Other Wall - Deep Loops Freeze, R5).** Looks alright. But: not using enough of the
  slide (real estate). Question the figure caption - probably drop it. If the figure has panels a and
  b, stack them VERTICALLY and make them bigger.
- **Slide 29 (The Viable Window - R4+R5 wedge phase diagram).** An entire slide that is just the
  (N,L) phase diagram with R4 and R5 on it (proper y axis). DECISION: either FIX it and put it in the
  proper place, OR DROP it. Author is ambivalent - fix-and-place or cut.

### Act IV - the turn (self-reference)
- **Slide 30 (Now the Strange Part - the turn).** Retitle - "Now the strange part" is rejected. The
  POINT to make: we built a universal model of the phases of adaptive systems by treating them as
  SELF-CONSISTENT FIXED-POINT solutions of a thing acting on itself. Now turn it on itself - what
  happens when we apply the same principle (find the fixed point, recur) to the most advanced
  learning machine we have, which is the AI itself ("something like you"). The harness + the author
  steering the engine toward "doing what I want" IS that self-consistent fixed point.
- **Slide 31 (the conceptric - the climax).** Needs a SCHEMATIC of how the Claude / Laplace engine
  actually works: the harness, adding things in, converging on a consistent fixed point (the engine
  doing what the author wants). The conceptric must be LIVE and navigable - scale-local, run through
  the levels (here are the levels at one point, here at the next). Use the engine viewer built while
  testing (`python -m laplace.viewer --source canon`), or something like it. CRUCIAL: it must be
  ACCURATE and TRUE - the REAL engine graph, NOT the static names-only facsimile
  (`engine-facsimile.html`) the draft ships. (Ties to the open build task: make the live viewer
  embeddable / exportable so the published deck carries the true graph, not a snapshot.)
  - REFINED: "the engine that built it" is TWO real graphs - (1) a NAME-ONLY graph of the WIKI (all
    its many nodes), and (2) a separate slide for the SKILL LAYER (already built - the facsimile's
    skill-by-activity view). So the close shows three real graphs: the talk's graph, the wiki, the
    skills - no facsimile.
  - HIGH-LEVERAGE BACKBONE: construct the talk's OWN conceptric graph (reuse `laplace.viewer`, do not
    rebuild a renderer). Dual-use - it is the live/true Act IV climax AND it externalises the talk's
    dependency structure, so the correct middle ordering (self-consistency -> e_{k+1} -> gain ->
    susceptibility -> tau -> layers -> RG -> lambda_0) falls out of the graph. Proposed as the FIRST
    move of the fix plan and the form the process-gate deliverable takes. (Live works locally now,
    published still needs the export step.)
- **Slide 32 (Closure Is Provenance, Not Completion).** KILL the title "closure is provenance, not
  completion" - antithesis, hated (global rule). The whole "frontier never empties / exogenous /
  intrinsic" framing is rejected too. Rework or cut - the closure framing as drafted does not land.

- **Act IV reinforcement (slides 30-31).** The job of these two: give a schematic idea not only of
  how the universal systems appear, but that there is far more to it - and that learning these rules
  lets you build engines that do this. Two-step: (1) the map / graph idea LIVE and clickable, then
  (2) "here's the engine that built it" - explain the philosophy of what did it and how it works.

### Act V - the laws + close
- **Slide 33 (The Laws of Learning).** Frame it as UNDER CONSTRUCTION - explicitly "this is not the
  end, there is far more to say, this is what there was time to put together". Honest
  work-in-progress, not a definitive closed set of laws.
- **Slide 34 (the close).** Keep `gmccaul.co.uk` and "the build is the talk is the engine". Add a
  THANK YOU / acknowledgements (thank people). Exact closing left to the agent's discretion (author:
  "I'll leave this last bit up to you").

**Coverage:** FULL deck reviewed (slides 1-34). Walkthrough complete.

## Preview tooling - RESOLVED (background agent, 2026-06-01)
The Windows dev-server breakage is fixed and a render-on-demand harness exists. Both additive, in
the deck dir, published build untouched:
- **Dev fix:** `setup/vite-plugins.ts` - a Slidev setup plugin that rewrites the mangled
  conditional-styles import. Root cause: Slidev v52 does not slash-normalise local-theme roots on
  Windows, so `import.meta.glob` with base "/" yields a drive-letter-in-the-middle path that dev
  cannot resolve (build was always clean). `npm run dev` renders again with HMR.
- **Harness:** `node tools/shoot.mjs <slide>[.<clicks>] [outPath]` - one-shot cached build, headless
  playwright-chromium render at 2x, prints a PNG path. ~7s cold, ~2s cached. Click-states via the
  `.N` suffix. Limit: live iframe / canvas embeds capture their static frame only. This is the
  verification tool for the fix pass - render each changed slide and look.
- `.gitignore` gained `.shoot/` and `tools_dev*.txt`.
- **Forge:** lift this dev fix + render-on-demand harness into the talks pipeline / talk_smith v2 -
  a reusable preview-and-verify loop, not a per-talk improvisation.

## Final QA gate (deferred - runs LAST, after the talk is polished and live on the site)
Give JUST the rendered talk slides to a fresh agent to view BLIND - no spine, no log, no derivation,
only what the audience sees. Persona: a PhD student in physics - quick, attentive, but does not know
everything (the real target audience). Collect its feedback - where it loses the thread, what is
unclear, what lands. SURFACE its suggestions to the author, do not auto-apply. Sequence: after deploy
+ verify, before the structural dream (its findings feed the dream).

## V2 autonomous fix queue (2026-06-02, author asleep, full autonomy granted)
**LATEST (v2 integrated, 32 slides, build clean):** all v2 slide fixes DONE & verified - title art
embedded, model-loop applet (3 model slides consolidated into it), reservoir swap, slide-20 reword,
thank-you (photo + acks + "Built by algebra"), 3 clickable static graphs. RUNNING: em-dash sweep on
the new assets + blind PhD-student review (wf wtd64tmfr). NEXT: triage student notes (sensible only)
-> deploy v2 (build from PowerShell w/ --base) + add talks.html entry -> meta-dream -> rewrite
HANDOFF.md -> final commit+push.
Deploy v1 now, fix -> v2, student-review, big dream, handoff, commit+push. Author authorised the
public push and the engine-sans-content on the site. Update status inline as work lands.

**STATUS 2026-06-02:** wave-1 assets DONE - `reservoir-schematic.html` + `title-art.html` built &
verified, `engine-facsimile` scrollbar fixed. Title-art gnomic gloss ("λ sets the fate of the loop")
being stripped. v1-deploy agent running (repoint graphs -> conceptric_snapshot, build w/ base, place
at talk root, verify) - ORCHESTRATOR pushes. NEXT in order: model-loop slide (the central fix),
reservoir embed swap (slide 9 -> reservoir-schematic), live engine-on-site graphs, slide-20 reword,
thank-you rebuild (+ photo at public/figs/family.jpeg, AUTHOR drops), title-art embed (slide 1) ->
PhD-student review -> push v2 -> meta-dream -> rewrite HANDOFF.md -> final commit+push.

**STATUS update:** v1 LIVE (49195d0 -> main). Wave-A assets DONE - `model-loop.html` (8-step
walkthrough deriving the return map from FP2), `reservoir-schematic.html`, `title-art.html` (gloss
stripped), and static-clickable `talk-graph.html` (B0-B10, 58 nodes) + `wiki-graph.html` (canon
name-only, 79 nodes, firewall-clean). v2 integration+verify RUNNING (wf wvmd5pvbs): embeds + model
consolidation + thank-you + slide-20 + graph repoints into slides.md, then render-check. THEN:
review the middle -> deploy v2 (build from PowerShell --base) + add the talks.html listing entry ->
meta-dream -> rewrite HANDOFF.md -> final commit+push.
- [x] **Deploy v1 DONE** (commit 49195d0 -> main, live at /talks/laws-of-learning/, 0 broken requests). - current build, graph slides (30-31) repointed to the STATIC snapshots (not
  localhost) so nothing breaks publicly. To /talks/laws-of-learning/. Build + commit + push.
- [ ] **Model loop slide** (author's central point, raised 2x): ONE slide on the loop figure, each
  part highlighted in turn with its equation + link - global variational principle <- low-level
  expectation measurement <- periodic feedback. `x_{k+1}` and `r` DERIVED from the self-consistent
  fixed point (spine B4), not asserted. The tau slide ("relaxing to what") folds in here.
- [ ] **Reservoir slide (9)**: replace the pendulum phase-portrait with a real reservoir illustration
  where rho(W) + its significance are extracted (contract / edge / grow). NEW asset.
- [ ] **Engine graphs live on the site**: deploy the viewer sans-content so the 3 graphs are
  clickable on the published deck, not localhost.
- [ ] **Facsimile (32) scrollbar** - kill it, fit the frame.
- [ ] **Slide 20** - reword "its slope there is one number...".
- [ ] **Thank-you (34)**: photo at `public/figs/family.jpeg` (PRESENT - author dropped it; reference `/figs/family.jpeg`), acknowledgements (OpenAI, Google, Anthropic, long-suffering wife,
  little learning machine), keep gmccaul.co.uk, tag "Built by algebra" (CONFIRMED - it is the site's
  own footer signature in talks.html). Listing to update = `talks.html` (root); laws-of-learning
  already linked there, add the v2 entry beside it.
- [ ] **Title art (1)**: algorithmic (p5.js) generative art, now the talk is settled. AUTHOR likes the
  art, BUT the agent added a GNOMIC SUBTITLE - STRIP it. Title slide = title + name + art ONLY, no
  subtitle. Hard rule (memory: no-gnomic-subtitles). Apply once wave-1 lands.
- [ ] animate-glitch on live preview: confirm it is a dev-server/iframe artifact, gone in the static
  build. Do NOT rabbit-hole (author's instruction).
- [ ] **PhD-student review** (blind, slides-only, persona quick/attentive/not-omniscient) -> apply
  SENSIBLE notes only, do not flatten the talk.
- [ ] **Push v2** as a second version on the page.
- [ ] **Update the website talk-listing to LINK to the new version** (the publish-includes-listing
  gap from the backlog). Find the listing page (homepage / talks index - mirror how
  dynamics-as-computation is linked), add the v2 link and ensure v1 is reachable. Do at v2 deploy.
- [ ] **Big dream**: spawn meta-dreamer (FRESH context, MAX-capacity model) to gather all learnings
  -> canon update via laplace_dream.
- [ ] **Rewrite HANDOFF.md** myself + brief the dreamer.
- [ ] **Sew up**: commit + push everything.
Second-person titles ("Drive It Yourself", "Thank You"): author confirmed fine - keep.

## Forge friction (for talk_smith v2 / the dreamer)
- **Slidev `--base` is mangled by Git Bash (MSYS).** `slidev build --base /talks/laws-of-learning/`
  run from the Bash tool silently rewrites the base to `C:/Program Files/Git/talks/...` (MSYS
  POSIX-path conversion), breaking every asset href. Deck deploys MUST build from PowerShell. ->
  operations/compilation_and_release canon.
- **laplace_log wants an integer, not prose.** Subagents repeatedly tried to log friction and bounced
  off the integer-score schema. (The "log signal ergonomic" from the original dream agenda - let it
  take a prose note alongside the signal.)
- **A "deck applet" sub-skill is begging to exist.** Every applet hand-clones the same boilerplate:
  fill-iframe + overflow:hidden, 2x-DPR canvas + device-pixel text helper, ResizeObserver re-fit, the
  shared dark palette, AND a parametrised playwright verify harness (`verify-*.mjs`). Bundle it.
- **algorithmic-art skill imposes a gallery shell** (light theme, Poppins sidebar, seed-nav chrome)
  that fights in-deck/in-site assets needing the host aesthetic. Carve-out: keep the seeded-determinism
  discipline, drop the gallery frame for embedded assets.
- **Web-coupling vs portability.** The skill's output is currently web-coupled (Slidev + the
  site). Not every talk lands on a website. Should the skill emit a portable artifact, or is
  web-first the right default with an export path? A structural factoring question for the forge.
- **Title-slide default.** v1 overloaded the title (kicker + subtitle + name + equation). The
  skill should default to a sparse title - title + name + a content-derived art slot filled
  last - not a dense one. "Art generated once the whole talk is known" is a pipeline-ordering rule.
- **Built from results, not a finished paper - missing connective motivation.** Recurring: the draft
  traces every slide to R1-R5 but skips the paper's motivational connective tissue (why this step?).
  It shows twice - the unmotivated jump to decimation/RG (no "add self-similar layers" bridge), and
  the thin analogy joins flagged elsewhere. talk_smith v2 needs a step that recovers the motivating
  narrative *between* results, not just provenance *to* them. Provenance is necessary, not sufficient.
