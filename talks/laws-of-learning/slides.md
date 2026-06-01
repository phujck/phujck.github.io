---
# The Laws of Learning - a talk for reservoir physicists. ~60 minutes.
#
# SELF-EXPERIMENT. This deck was authored by an AI agent acting AS the author
# (Gerard McCaul), 2026-06-01, as an exercise of the `talk_smith` / `visual_director`
# pipeline. Restaged 2026-06-01 (joint fine-tune) to DERIVATION_SPINE.md (the beat
# order B0->B10) and FINETUNE_LOG.md (per-slide ledger + global rules).
#
# Reading order = dependency order = the conceptric graph's edge structure.
# Voice: impersonal, no second person; no "X not Y" antithesis; text only cues the
# speaker and orients the room; the canvas carries the ideas.
#
# Substrate decides the theme: the ANF figures are paper-light REVTeX (Okabe-Ito),
# rendered onto the dark site palette; accent = the figures' own data blue.
theme: ./theme
title: The Laws of Learning
info: |
  The Laws of Learning - what decides whether a learning system fades, computes, or
  runs away. Built for reservoir physicists. ~60 min, visual-first. SELF-EXPERIMENT,
  claude-acting-as-author, restaged 2026-06-01. Source: the ANF results R1-R5 and the
  derivation spine.
class: paper text-center
layout: center
highlighter: shiki
mdc: true
fonts:
  serif: Lora
  sans: Inter
  mono: JetBrains Mono
---

# The Laws of Learning

<div class="accent-rule" style="background:#7eb8da;width:90px;height:2px;margin:1.4rem auto;"></div>

<div class="author" style="color:#9ca3af;">Gerard McCaul</div>

<!-- ART SLOT (fine-tune 2026-06-01): title-page art goes here, generated at the END once the
whole talk's content is settled - algorithmic p5.js or image-gen - to make the title pop.
Title + name only, per author. LEAVE AS-IS - the title slide is already stripped. -->

<!--
Open on the question, not the apparatus. The room is full of people building reservoirs.
By the end, the number on the reservoir and a number derived here are the same shape of
law. The talk does not start there. It starts much wider - with learning itself, as a
thing that happens in evolution, in markets, in brains, in gradient descent - and earns
its way to the maths once the shape is in the room.

Timing: this is an hour. The first ten minutes buy nothing but intuition. The slow runway
is what makes the payoff land.
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act 0 - learning is one phenomenon with many faces</div>

# Before the Maths

<!--
The act card. The next ten minutes are deliberately wide and deliberately light on
equations. Ask the room to hold the reservoir thought in their pocket and come somewhere
more general first. Everything here pays off when the talk comes back. This is the act the
rebuild adds - so the loop arrives as a GENERAL object, not an ANF gadget. Spend the time.
-->

---
layout: center
class: paper text-center
---

# What Do These Have in Common?

<div class="grid-faces" v-click>

<div class="face-chip">A model on a <span>loss surface</span></div>
<div class="face-chip">A market finding a <span>price</span></div>
<div class="face-chip">A reservoir being <span>trained</span></div>
<div class="face-chip">A brain <span>adapting</span></div>
<div class="face-chip">A species <span>evolving</span></div>

</div>

<!--
Pose the puzzle before the answer. Read the five out loud, in order - they are arranged as
a GRADIENT, from the simple and algebraic (gradient descent on a loss surface) out to the
large and many-bodied (a cortex, a species). Five systems that look nothing like each other.
The wit is the breadth - a loss surface and a peregrine falcon in the same list. Let the room
sit in the puzzle for a beat. Do not name the shared shape yet - the act earns the word "same".

(Nice-to-have, parked: a right-hand schematic that MORPHS from one object into the next as
each chip appears - heavy animation, low priority.)
-->

---
layout: center
class: paper embed-slide
---

# Four Faces, One Loop

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/many-faces.html" :height="450" />
</div>

<!--
THE ACT-0 CENTREPIECE, and the most important new asset in the rebuild. Let it autoplay
through the four faces - do not narrate every panel, let the animation carry it.

What it shows: gradient descent (a ball on a loss surface that tilts under it), a market (a
price chasing an equilibrium it shifts), a reservoir (an output chasing a target its own
dynamics generate), evolution (a population cloud climbing a landscape it pushes around). On
the right, the SAME four-node ring lights up for each: a slow control, the environment it sets,
the fast state living there, a coarse delayed measurement, back to the control.

The line to land, pointing at the ring: each of these senses, updates, and acts back into the
world it is sensing. Then hold all four beside the one diagram - the whole act in one picture.
Two or three minutes here. This is where the intuition is built. (ANF loop, R1; the four faces
are the spine's cast, B0.)
-->

---
layout: two-cols-header
class: paper
---

# A Learning System Has Four Moving Parts

::left::

Strip any of them down and the same four things appear.

<v-clicks>

<div class="define">

A **slow control** - the thing it adjusts. A trait distribution, a weight, a price, a policy.

</div>

<div class="define">

The control sets an **environment** - the world its fast parts then live in.

</div>

<div class="define">

A **coarse, delayed measurement** of how that went.

</div>

<div class="define">

It **updates** the control. Round again.

</div>

</v-clicks>

::right::

<div class="loop-legend" v-click>

<div class="leg leg-ctrl">slow control</div>
<div class="leg-arrow">sets ↓</div>
<div class="leg leg-env">the environment</div>
<div class="leg-arrow">shapes ↓</div>
<div class="leg leg-state">the fast state</div>
<div class="leg-arrow">measured as ↓</div>
<div class="leg leg-meas">a coarse signal</div>
<div class="leg-arrow">↺ updates the control</div>

</div>

<!--
Name the parts, slowly, one click each. This is the vocabulary the whole talk runs on, so
plant it here in plain words before any symbol appears. Use the four faces from the last slide
as the examples - the slow control is the trait distribution for the falcon, the weights for
the net, the price for the market. The right-hand stack is colour-coded: gold control,
vermilion environment, green state, blue measurement - the SAME colours the animation just used
and that reappear on the loop figure and every animation after. The last arrow closes the loop
back to the top - the feedback is drawn, not just named. One idea: a learning system is a
four-part loop. No maths yet. (R1 model, in words; B0.)
-->

---
layout: two-cols-header
class: paper
---

# The Part That Makes It Interesting

::left::

A thermostat senses and acts. So does a falling stone. Neither is learning.

<v-clicks>

The difference is one arrow.

<div class="define">

A **driven** system responds to a world that is simply there. Something outside sets the field.

</div>

<div class="define">

A **learning** system sets the world it then responds to. The control generates its own environment, and measures itself through it.

</div>

That arrow is **endogeneity**. The system runs inside the field it is making.

</v-clicks>

::right::

<div class="eq-hero" v-click>

$$h \;=\; \Pi(\theta)$$

</div>

<div class="eq-note" v-after>

The environment $h$ is a function of the control $\theta$. The one arrow the rest of the talk hangs on.

</div>

<div class="embed-frame" v-click style="margin-top:0.7rem;">
  <Embed src="/viz/adaptive-loop.html" :height="360" />
</div>

<!--
MERGED slide (old 6 + 7): the endogeneity framing and the adaptive-loop applet, one unit. This
is the conceptual hinge of Act 0 - slow right down. Driven systems have an EXOGENOUS field: the
wind on a bridge, the input to a passive reservoir. A learning system is ENDOGENOUS - it supplies
its own field, then measures itself through it, at a delay. Evolution reshapes the fitness
landscape it climbs. A big trader moves the price they trade against. A model's own predictions
become the data it next learns from. Give two or three out loud.

h = Pi(theta) is the only symbol in the act, and it earns its place because it IS the arrow.

Then the applet (A1). The button toggles driven vs adaptive. Driven first: the control tracks an
external command smoothly, the feedback leg greyed out. Then adaptive: the feedback leg lights up
and the control RINGS - it chases a measurement that lags its own action. The point: nothing
changed inside the system, only whether it listens to itself, and listening at a delay is enough
to make a stable thing oscillate. That is the seed of the whole instability story, in pictures,
no algebra. The delay slider makes the ringing worse. One clean contrast - calm vs ringing - is
the beat. (R1 endogeneity A5 + delayed feedback; B1, and the qualitative seed of B4/B8.)
-->

---
layout: center
class: paper text-center
---

# Act 0, in one sentence

<div class="eq-hero" v-click style="margin-top:1rem;">

Learning is a **loop** adapting to an environment it helps **generate**.

</div>

<div class="turn-quotes" style="margin-top:1.4rem;">

<div class="turn-quote" v-click>

One object across evolution, markets, brains and machines - a **slow control**, a **generated environment**, a **fast state**, a **coarse measurement**.

</div>

<div class="turn-quote" v-click>

Because it is endogenous, **stability is not guaranteed**. That is where the physics begins.

</div>

</div>

<!--
Close the act by banking the intuition explicitly - the next two acts cash it. The one-sentence
form is the thing to leave the room remembering, so say it twice and let it sit. Then the recap:
one object with four parts; endogenous, therefore stability is a question, not a gift.

This is the handover from feel to physics. The last line is the bridge: a system that makes its
own environment can tear itself apart, and now the talk gets to ask precisely when. Pause. Then
turn to the one place in the room where the audience already lives with this. (Synthesis of Act 0;
the endogeneity-to-instability bridge, B1 to B4.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act I - the model, on the bench</div>

# Now, the Model

<!--
Act I card - the turn into formal modelling. The spirit is "now, the model", not "let us talk
about our model". The audience has spent ten minutes on falcons and markets; reward them by
landing in their own world and showing that the formal object is already on the bench. Short, then go.

(FINETUNE: old Act I pivot slide "You Already Tune One of These" is replaced by this clean turn -
the author disliked the old framing; the Act I IDEA stays, the framing is the model turn.)
-->

---
layout: two-cols-header
class: paper
---

# A Reservoir Is a Physical System Computing

::left::

A signal goes in. The reservoir churns. A linear map is read off.

<v-clicks>

<div class="define">

One number decides its fate - the **spectral radius** $\rho(W)$ of the recurrent weights.

</div>

- $\rho(W) < 1$ - the **echo-state property**. Inputs fade, the reservoir forgets. Usable memory.
- $\rho(W) > 1$ - perturbations grow. The state runs away into chaos.
- The useful regime sits at the **edge of chaos**, $\rho(W)\to 1$.

</v-clicks>

There is one quantity that governs the behaviour. {.eq-note}

::right::

<div class="embed-frame" v-click>
  <Embed src="/viz/phase-portrait.html" :height="380" />
</div>

<!--
Their world, in their words. Echo-state property, spectral radius, edge of chaos - week-one
reading. The embed is a reservoir SCHEMATIC, not the lifted paper phase-portrait: an input, what
the recurrent transformation does, the loop fed back on itself, and the one quantity governing it -
the spectral radius rho(W) - deciding whether the looped signal contracts or grows. Drive it live.
The punchline rho(W) < 1 lands last: ONE number, three fates.

Connect it to Act 0 explicitly: the reservoir is the fast state, its recurrent dynamics are the
environment, training the readout is the slow control. It is the loop. The whole second half
rhymes with this slide. (Reservoir-computing canon: echo-state / Jaeger, edge of chaos / Maass.
FINETUNE: "Your" dropped from the title; embed is now a proper reservoir schematic.)
-->

---
layout: center
class: paper text-center
---

# The Question of the Talk

<div class="eq-hero" v-click>

$$\rho(W) \;\lessgtr\; 1$$

</div>

<div class="turn-quotes" style="margin-top:1rem;">

<div class="turn-quote" v-click>

Is the edge of chaos a **fact about reservoirs**?

</div>

<div class="turn-quote" v-click>

Or one face of a **law of learning** - the same shape that governs a falcon, a market, a brain?

</div>

</div>

<!--
The hinge of the talk, as a clean question. The room has two things in hand: the general loop from
Act 0, and the reservoir's own eigenvalue from Act I. The question fuses them - is rho(W) parochial,
or a special case of something general? Make the stakes honest: the claim is the same SHAPE of law,
worked out over the rest of the talk. Then move into Act II.

(FINETUNE: cut "then we will see if your eigenvalue is an instance of it" - second person + an
eigenvalue with no referent yet; cut the "derive it all from scratch" promise - said too soon.
The old Act-I slide-11 eigenvalue/trichotomy foreshadow is KILLED entirely - it jumped the gun;
slide-24's "same figure as Act I" callback is removed in consequence.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act II - build the model</div>

# Earning the Equations

<!--
Act II card, minimal - Act II is the model. (FINETUNE: the methodology recitation is stripped;
act cards carry content, not the design-contract language that generated them.)

State the SCOPE first, out loud, before any slide: the talk takes this as effectively the LOCAL
(single-layer) version of the model, with the higher-order [variational] parameter held in
reserve - layers come later, as the escape. Establish that scope, then build the loop.
-->

---
layout: two-cols-header
class: paper
---

# The Relaxation Time

::left::

Between updates, the fast level relaxes toward its constrained optimum. That takes a time $\tau$.

<v-clicks>

<div class="define">

A scalar fast part in field $h$: $\;\dot x = -h\,(x - s\theta)$, so it relaxes with **$\tau = 1/h$**.

</div>

<div class="define">

Read once per interval $T$. The reading carries a **memory** of the last one:

</div>

<div class="eq-hero">

$$x_{k+1} = r\,x_k + (1-r)\,s\theta_k, \qquad r = e^{-T/\tau}$$

</div>

- $T \gg \tau$ - $r \to 0$. Equilibrated, a fresh read.
- $T \ll \tau$ - $r \to 1$. The reading is stale.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$r = e^{-T/\tau}$$

</div>

<div class="stage-note">

how stale the reading is - the loop's analogue of a reservoir's leak

</div>

</div>

<!--
NEW slide for the missing model component (FINETUNE: tau was never introduced and is crucial).
Keep it physical and short. The fast level does not read instantly - it relaxes with time tau,
and the update period T sets how stale the reading is through the single memory factor r = exp(-T/tau).
r is the loop's leaky-integration rate - a real rhyme with the reservoir's leak, not a forced one.
This memory r is what carries the lag that makes the closed loop able to overshoot. (B3; PoH
06_scalar, re-derived; ANF A1. tau is non-universal.)
-->

---
layout: center
class: paper embed-slide
---

# See the Transition Before Explaining It

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/two-level-phenomenology.html" :height="440" />
</div>

<!--
NEW phenomenology slide (B3.5) - phenomenon first, theory second. Before solving anything, RUN
the two-level loop (the model of the last few slides) and turn two knobs, N and tau. Below
threshold it settles; above it the order parameter starts to oscillate. The transition appears
EMPIRICALLY, in the simplest model, with no theory yet.

The line to land: nothing here is asserted - the boundary is OBSERVED as the knobs turn, and only
then is there something the mathematics must explain. This grounds why the whole derivation from
here on is needed. Crank N up, crank tau, watch the series cross from settle to ring and the
boundary appear. Distinct from the Act III viable-window applet, which is the SOLVED model - this
one is pre-solution. Spend a moment; let the room see the phenomenon. (B3.5; simulation of the
B0-B3 model. The boundary it reveals is what the self-consistency solve and the trichotomy explain.)
-->

---
layout: center
class: paper embed-slide
---

# The Loop, Part by Part

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/adaptive-loop.html" :height="430" />
</div>

<!--
THE SPINE OF ACT II, collapsed from the old four "move" slides into ONE zoomable loop (FINETUNE).
The figure - control / environment / fast state / order parameter - is the central object; click
through it by ZOOMING IN on each part in turn, each reveal saying WHY the model describes that part
that way and WHAT governs it. The maths hangs off the loop's parts, in the load-bearing order:

  1. theta, the slow control, and h = Pi(theta), the field it generates - the control acts through
     the field, never on the parts directly (the Act-0 arrow, now named).
  2. the N fast parts relaxing under the OLD field h_k (fixed at the period start), scale-separated.
  3. m = <O>, the coarse, noisy, delayed average - one number off the crowd, noise of order N^{-1/2}.
  4. the update: theta_{k+1} = theta_k + alpha g e_k - the measurement moves the control, closing
     the loop endogenously (leg four feeds leg one).

This is where the equations come from. Drive the zoom slowly, one part per click; for each, say why
this captures the essential detail. The next slide does the collapse. (B0-B4 assembled on one figure;
R1. Spine: the loop slide is the visual spine, the maths hangs off its parts.)
-->

---
layout: two-cols-header
class: paper
---

# Self-Consistency Gives the Return Map

::left::

The fixed point is **self-consistent** - the mandate agrees with the statistics it induces, $m(\theta^*) = \hat O(\theta^*)$.

<v-clicks>

<div class="define">

Linearise the loop there. Track only the **error** $e_k$ - how far the reading sits from consistency.

</div>

<div class="define">

The one non-trivial input: at the fixed point both response slopes agree, $\;d_\theta \hat O = \chi_N\,\Pi' = g$.

</div>

The fast mode eliminates **exactly**. A four-part loop becomes one scalar recurrence.

</v-clicks>

::right::

<div class="eq-hero" v-click>

$$e_{k+1} = (r - K_N)\,e_k \;-\; \alpha\,c_N\,e_k^{3}\;+\;\cdots$$

</div>

<div class="eq-note" v-after>

The ordered timing - fast relaxes, then slow updates - gives the clean $(r-K_N)$ with no cross-term. A $\mathbb{Z}_2$ symmetry forbids the quadratic, so the first nonlinearity is cubic.

</div>

<div class="eq-hero" v-click>

$$K_N \;=\; \alpha\,\chi_N\,g$$

</div>

<div class="eq-note" v-after>

The loop **gain**, built from the **susceptibility** $\chi_N$ - how hard the collective answers a nudge.

</div>

<!--
THE FOUNDATION (FINETUNE: the deepest author-fork - the self-consistency derivation was missing).
This is where e_{k+1} and the gain K_N come FROM, not stated as given. Do not grind the algebra on
the slide - state what makes it work and that it is derived (and machine-verified) in the paper.

The fixed point FP2 is self-consistent: the mandate is consistent with the statistics it induces.
Linearise there, track the error e_k. The load-bearing order is the timing: the fast parts relax
under the OLD field, THEN the slow law updates - which is what gives the clean (r - K_N) eigenvalue
with no r*alpha cross-term. The self-consistency relation (both derivatives equal g at FP2) is the
one non-trivial input. The Z_2 symmetry kills the quadratic, so the leading nonlinearity is cubic -
a supercritical flip.

Two things to bank: the memory r = exp(-T/tau) is the loop's leak, a real rhyme with reservoir
leaky integration; and the whole fate of the system now rides in K_N, which is built from chi_N. The
entire stability question has been funnelled into one object - how does chi_N behave? (B4; R1_derivation,
machine-verified <1e-13; 03_return_map.)
-->

---
layout: two-cols-header
class: paper
---

# The Stability Condition

::left::

A 1-D map. Its fixed point is stable when the slope there sits inside the unit interval.

<v-clicks>

<div class="define">

The eigenvalue is $r - K_N$. It can only be pushed **down** - $K_N > 0$ - so the upper bound never binds.

</div>

The one boundary is a **flip**, at $r - K_N = -1$:

<div class="eq-hero">

$$K_N \;<\; K_c = r+1$$

</div>

- Below threshold - perturbations relax. The loop holds course.
- Above threshold - the equilibrium flips. The order parameter starts to ring.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$|\,r - K_N\,| \;<\; 1$$

</div>

<div class="stage-note">

the slope of the return map at its fixed point - the echo-state condition, in a different letter

</div>

</div>

<div class="stage-card" v-click style="border-left-color:#e0875a;">

<div class="stage-note" style="margin-top:0;">

Couples $\tau$ and $N$: the boundary $K_N{=}K_c$ sets a critical $N_c$, and updating faster than the system relaxes ($T<\tau$) sits in the dangerous regime - the $(\tau, N)$ instability the phenomenology already showed.

</div>

</div>

<!--
The slide where the reservoir rhyme bites (FINETUNE: drop "embarrassingly simple" from the title).
The stability of a 1-D map is the slope at the fixed point - known cold from the logistic map. The
eigenvalue r - K_N only ever moves DOWN because K_N > 0, so the only way out is a flip at -1, never a
blow-up. The condition is structurally the SAME statement as |rho(W)| < 1: a slope inside the unit
interval contracts. Say it plainly - this is the echo-state condition for the loop, same inequality,
a different operator. The threshold K_c = r + 1 rises with r and depends only on the memory.

Second card: this couples tau and N. The flip boundary K_N = K_c sets a critical N_c, and updating
faster than the system relaxes (T < tau) is the dangerous corner - the (tau, N) instability the
phenomenology slide already SHOWED empirically, now pinned to a condition. (B5; R3, machine-verified
N_c ~ 816.8. K_c = r+1 is the reduced-map form - the 2-mode "policy flapping" Jury form is NOT put
on the reduced map; AUTHOR FORK: K_c reconcile left to the author.)
-->

---
layout: center
class: paper text-center
---

# Everything Now Hangs on One Question

<div class="eq-hero" v-click>

$$K_N = \alpha\,\chi_N\,g \quad\Longrightarrow\quad \text{fate} = \text{fate}\big(\chi_N(N)\big)$$

</div>

<div class="turn-quotes" style="margin-top:1rem;">

<div class="turn-quote" v-click>

The constants are fixed. **The susceptibility carries the size dependence.** How does $\chi_N$ scale as the system grows?

</div>

<div class="turn-quote" v-click>

If $\chi_N$ shrinks with $N$, the gain stays tame, safe at any size. If it grows, the gain climbs and crosses $K_c$.

</div>

</div>

<div class="eq-note" v-click style="margin-top:1.2rem;">One scaling law decides the fate of the whole family.</div>

<!--
A funnel slide - the whole problem narrows to one point. From falcons and markets, through a
four-part loop, to a return map, and now the entire fate of the system is one function: chi_N(N),
the susceptibility versus size. Pose it as a genuine question - does answering a nudge get louder
or quieter as parts are added? - because the answer is not obvious, and it is exactly what comes
next. (B5 to B6 bridge; R1 to R2.)
-->

---
layout: two-cols-header
class: paper
---

# Why N Amplifies

::left::

$N$ fast parts, aggregated by **majority**. Each adds a vote; the crowd sharpens into a threshold device.

<v-clicks>

<div class="define">

Majority of $N$ noisy votes, by the central limit theorem:

</div>

<div class="eq-hero">

$$R_N(e)\sim \mathrm{erf}\!\big(\beta e\sqrt{N/2}\big), \qquad \chi_N = \beta\sqrt{2N/\pi}$$

</div>

So the bare susceptibility grows: $\;\chi_N \sim \sqrt{N}$.

The tension in one scaling: more $N$ **reduces** majority noise, and **raises** the gain. {.eq-note}

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$\chi_N \sim \sqrt{N}$$

</div>

<div class="stage-note">

more parts answer a nudge more loudly - the seed of the transition

</div>

</div>

<!--
The seed of the transition, the two-level (local) result FIRST (FINETUNE reorder: specific
two-level model before any hierarchy). N votes aggregated by majority: the CLT gives an erf
response, and its slope at the origin - the susceptibility - grows as sqrt(N). More parts sharpen
the collective into a high-gain threshold device. The tension worth naming: the SAME sqrt(N) that
reduces majority error (Condorcet) also raises the gain toward instability - two sides of one
scaling. So in the flat two-level model the gain GROWS with size, and the flip is coming.

This sets up the problem the next slides solve: a flat sqrt(N) gain is a catastrophe at large N.
(B6; PoH 05_majority re-derived, R2. Robustness: correlated beliefs give N_eff -> 1/rho-bar, the
transition can vanish if beliefs are too correlated - flag if asked. Provisional colour: Condorcet
reversal - author's call whether to deploy.)
-->

---
layout: center
class: paper embed-slide
---

# Add Layers - and Look at What Stays the Same

<div class="embed-lead" v-click>

A flat $\sqrt{N}$ gain runs away. Insert **intervening layers**, self-similar, each a majority of the last - each multiplying the small-error gain by $\sqrt{2/\pi} < 1$, a **gain-attenuation device**. The layer operation is self-similar, so depth is **iterating one operator** $R$:&nbsp; $m_\ell(e) = \mathrm{erf}\!\big(\sqrt{n_\ell/2}\;m_{\ell-1}(e)\big)$, $\;R[m^*]=m^*$.

</div>

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/coarse-graining.html" :height="400" />
</div>

<!--
THE MISSING BRIDGE, now built (FINETUNE: the RG/decimation jump was unmotivated). The motivation
the talk skipped: the flat sqrt(N) gain is a catastrophe, so intervening layers are introduced as a
GAIN-ATTENUATION device - each majority layer multiplies the small-error gain by sqrt(2/pi) < 1.
Because the layer operation is SELF-SIMILAR, depth = iterating ONE operator R. That is the
renormalisation flow - and it arrives motivated, as the fix for the catastrophe, not parachuted in.

R acts on the response PROFILE, not the microstate. The applet (A2) is the zoom-in / zoom-out - it
all looks the same - that makes the self-similarity watchable: group n parts into one, level by
level, and the structure repeats. The RG intuition comes FIRST here and motivates; the power law
follows on the next slide. Plant the phrase "depth is renormalisation time". (B7; PoH 09_hierarchy
re-derived, R2/R4. STATIC gain-attenuation only - real layers add dynamic lag that can destabilise,
a named GAP. Note: the susceptibilities come out of a SELF-CONSISTENT solution, not self-similar.)
-->

---
layout: two-cols-header
class: paper
---

# The Susceptibility Is a Power Law

::left::

Iterating the decimation operator $R$ has a fixed point. Its slope there is one number, $\lambda_0$.

<v-clicks>

<div class="define">

Each grouping step multiplies the susceptibility by $\lambda_0 = R'(m^*)$ - so over scales it is a power law:

</div>

<div class="eq-hero">

$$\chi_N \sim A\,N^{\psi}, \qquad \psi = \log_n \lambda_0$$

</div>

The exponent is the **logarithm of the decimation eigenvalue** - the destination the flow runs to.

Worked corner: $n=2$, $\lambda_0 = \sqrt 2$, so $\psi = \tfrac12$. {.eq-note}

</v-clicks>

::right::

<Fig src="/figs/fig2a_r2_powerlaw.png" alt="susceptibility power law, psi=1/2 slope triangle, finite-size correction inset" v-click class="fig-click" />

<div class="figcap">

Fig 2a - measured $\chi_N$ on the predicted law $A\,N^{\psi}$. The slope triangle reads $\psi=\tfrac12$ here - one worked corner. Inset: the finite-size correction collapsing.

</div>

<!--
The power law FOLLOWS the RG picture now (FINETUNE order: RG intuition motivates, then the
susceptibility law). One decimation step scales chi_N by lambda_0 = R'(m*); iterate and the result
is a power law with exponent log_n(lambda_0). lambda_0 is the decimation EIGENVALUE - the slope of
the coarse-graining map at its fixed point, the destination the flow runs to. The exponent is
structural, from the fixed point, not a fit.

CAVEAT (a), out loud, pointing at the slope triangle: psi = 1/2 is ONE worked corner. The LAW is
"chi is a power law and psi is the log of the decimation eigenvalue"; the number 1/2 is just one
instance - do not let it ossify into a law of nature. (B7; R2, fig2a; caveat a.)
-->

---
layout: center
class: paper text-center
---

# What We Have Built

<div class="ladder" v-click>
<div class="rung"><b>θ, h</b>slow control,<br>generated field</div>
<div class="rung"><b>τ, r</b>relaxation,<br>memory</div>
<div class="rung"><b>K_N</b>one gain,<br>one return map</div>
<div class="rung"><b>χ_N ∼ N^ψ</b>one scaling law,<br>one exponent</div>
</div>

<div class="eq-hero" v-click>

$$K_N \;\sim\; N^{\psi}, \qquad \psi \;=\; \log_n \lambda_0$$

</div>

<div class="turn-quotes" style="margin-top:0.6rem;">

<div class="turn-quote" v-click>

Any system meeting the same assumptions lands in one **universality class** - the setup is built to be insensitive to the particular dynamics.

</div>

</div>

<div class="closing-line" v-click>

A learning loop became **one exponent**. [Now watch what that exponent decides.]{.accent}

</div>

<!--
A breather and a recap - mark the end of the model build. Walk the ladder: a slow control and its
field; a relaxation time and a memory; the loop closed and collapsed to one gain and return map; the
gain governed by one scaling exponent psi. The room should feel they EARNED psi, step by step.

ADD universality (FINETUNE): this is the place to say the system falls into a universality class -
the whole reason for the setup is to be largely insensitive to the particular dynamics. Any system
meeting the assumptions is in the class. (FINETUNE also: K_N ~ N^psi rendered as raw text before -
now proper display maths.) Pause, then: everything from here is consequences. (Synthesis of Act II;
B3-B7.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act III - the payoff</div>

# One Exponent, Three Fates

<!--
Act III card, concise (FINETUNE: trim the act-card text). The exponent psi - earned across Act II -
now does the work. The strong, true claim: the SIGN of one number sorts every system in the family
into one of three fates. Straight into the trichotomy.
-->

---
layout: two-cols-header
class: paper
---

# The Trichotomy

::left::

Put the scaling law into the gain, $K_N \sim N^{\psi}$. The **sign** of $\psi$ is everything.

<v-clicks>

- $\psi < 0$ - gain **shrinks** with size. **Unconditionally stable** at all $N$.
- $\psi = 0$ - gain is size-**independent**. **Self-organised critical** - it sits at the edge.
- $\psi > 0$ - gain **grows** with size. **Destabilises** at a finite $N_c$.

</v-clicks>

<div class="eq-note" v-click>

The fate is written into the RG eigenvalue of the microscopic law - settled before the collective is even assembled.

</div>

::right::

<Fig src="/figs/fig2b_trichotomy.png" alt="return map with three slopes at the fixed point, slope = lambda_0 = n^psi" v-click class="fig-click" />

<div class="figcap">

Fig 2b - the return map at the self-consistent fixed point $m^*$. The slope there *is* $\lambda_0 = n^{\psi}$ - below 1 the error relaxes to the fixed-point **attractor**; above 1 it flips to a two-cycle.

</div>

<!--
The heart of the result. The sign of psi classifies completely: contracting, marginal, amplifying.
Hold up two fingers - rho(W) for the reservoir, lambda_0 = n^psi for the loop - the same three-way
split: a slope below 1 contracts, above 1 runs away, at 1 is the edge. The reservoir's fade/compute/
chaos and the loop's stable/critical/runaway are the same trichotomy.

ADD (FINETUNE): make the point with m* and relate the three fates to ATTRACTORS - below 1 the error
relaxes onto the fixed-point attractor m*, above 1 that attractor loses stability and the two-cycle
takes over. The fate is decided by the RG eigenvalue of the MICROSCOPIC law, before the collective is
even assembled. Caveat (a) stands: the sign is what matters, the specific values are corner-dependent.
(B8; R3, fig2b. FINETUNE: the old "same figure from Act I" callback is REMOVED - the slide-11
foreshadow it paid off is gone.)
-->

---
layout: two-cols-header
class: paper
---

# Too Flat Destabilises - a Flip at Finite Size

::left::

For $\psi>0$, the gain crosses threshold at a **finite critical size** $N_c$. What happens there is specific.

<div class="eq-hero" v-click>

$$N_c \sim \left(\frac{r+1}{\alpha\,g\,A}\right)^{1/\psi}$$

</div>

<v-clicks>

- A **flip bifurcation** - the slope passes through $-1$.
- The state does not blow up. It **oscillates**, period two.
- Amplitude grows as $\sqrt{N-N_c}$ - the classic square-root branch.

</v-clicks>

::right::

<Fig src="/figs/fig2c_r3_flip.png" alt="flat at zero below N_c, two-cycle fork above, amplitude sqrt(N - N_c)" v-click class="fig-click" />

<div class="figcap">

Fig 2c - below $N_c$ the equilibrium is flat and stable. Above it, the order parameter forks into a two-cycle. Here $N_c\approx 817$ - one worked corner.

</div>

<!--
The destabilisation has a name and a fingerprint - a flip (period-doubling) bifurcation, the
two-cycle opening as sqrt(N - N_c). Connect it back to the adaptive-loop and phenomenology applets:
this is the ringing the room saw when the loop closed, now with exactly when it starts and what it
looks like. The phase boundary is an observable - cross N_c and the period-2 wobble appears.

Caveat (a): N_c ~ 817 is the worked corner, not universal. Honest long-time caveat for questions: in
the full closed loop the two-cycle SELF-QUENCHES along the slow drift (the marginal theta-direction)
- do NOT sell a long-time finite-window oscillation. (B8; R3, fig2c; caveats a and the self-quench.
FINETUNE: this slide was fine as-is - only N_c numerator made consistent with K_c = r+1.)
-->

---
layout: center
class: paper embed-slide
---

# Drive It Yourself

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/viable-window.html" :height="440" />
</div>

<!--
A3, THE INTERACTIVE PAYOFF - the asset the RC audience remembers because they can DRIVE it. Hand it
to the room or drive it live. Left: the return map and its cobweb. Drag psi from negative (blue,
contracting - STABLE, fades) up through critical (gold, tangent to the diagonal - EDGE OF CHAOS) into
positive (vermilion, the iterate flips to a period-2 cycle - RUNAWAY). The verdict chip names the
regime live. Right: the (N, L) viable window - raise psi and watch the floor L_min ~ log N rise and
the green band pinch shut. The trichotomy and the depth law in one instrument.

ADD (FINETUNE): two PRESETS for the talk - one-click "stable" and "edge of chaos" regime states - so
the transition can be shown without fumbling the slider. Drag slowly through so the room SEES the
slope cross 1. (B8 + B9; R3 trichotomy + R4/R5 window. Spend time here.)
-->

---
layout: two-cols-header
class: paper
---

# The Escape - and Why It Is Logarithmic

::left::

For $\psi>0$ the flat loop dies at $N_c$. No more measurements, no rewriting the parts. One move is left - **stack levels**.

<div class="eq-hero" v-click>

$$N_c^{(L)} = N_c^{(1)}\,\lambda_0^{\,L-1}$$

</div>

<v-clicks>

- Each level multiplies the critical size by $\lambda_0$. Adding depth is one step of coarse-graining.
- So the depth needed grows only **logarithmically**:

  $$L_{\min}(N) \sim \log_{\lambda_0} N$$

- This is the derivation of how much depth - why stacked reservoirs work.

</v-clicks>

::right::

<Fig src="/figs/fig3b_r4_staircase.png" alt="geometric depth staircase, each riser a factor times lambda_0" v-click class="fig-click" />

<div class="figcap">

Fig 3b - the staircase rises in equal steps of $\log N$ - each tread a factor $\times\lambda_0$ wide. Simulated points sit on the predicted treads.

</div>

<!--
The first tight link to their world, and it is real. "Depth is renormalisation time" now cashes - the
room saw it built in the A2 applet, here is the consequence. Each level of hierarchy buys a factor
lambda_0 of critical size, so to govern size N needs depth ~ log N. Deep reservoirs, deep nets stack
because one layer cannot hold a large problem - here is how much depth, not a rule of thumb. The
staircase rhymes with the spectral staircase known from layered reservoirs. The treads ARE the
staircase from the A2 applet, now with simulated points. (B9; R4, fig3b. R4 <-> deep reservoirs is a
tight, load-bearing link. FINETUNE: killed "derived, not decreed" antithesis.)
-->

---
layout: two-cols-header
class: paper
---

# The Other Wall - Deep Loops Freeze

::left::

So just add levels forever? No. A deep autonomous loop does not destabilise - it **calcifies**.

<v-clicks>

- The spectral radius $\rho(L)$ falls, then **locks at 1** and stays.
- Marginally stable - it neither oscillates nor adjusts. Inert.
- Reconfiguring it then costs $\mathcal{E}_{\min}=\lambda_0^{\,L-1}$ - exponential in depth.

</v-clicks>

The ceiling is **energetic**, set by reconfiguration cost - and the *same* $\lambda_0$ prices it. {.eq-note}

::right::

<Fig src="/figs/fig4c_r5_freeze.png" alt="eigenvalues retreating to marginal +1; spectral radius vs depth locking at rho = 1" v-click class="fig-card" />

<div class="figcap">

Fig 4c - right: the spectral radius versus depth, **freezing at $\rho=1$**. Left: the dominant eigenvalue retreating to the marginal $+1$ inside $|z|=1$ as depth grows.

</div>

<!--
The second tight link, and the slide that makes the room sit up. The whole talk has been about one
eigenvalue. Here it is literally: the spectral radius of the deep loop, locking at 1 - the edge of
chaos, derived as the FATE of a deep hierarchy, not assumed as a tuning target. Right panel: rho vs
depth flattening at 1. Left panel: the dominant eigenvalue creeping to the marginal +1 inside the
unit circle.

There is no dynamical upper wall - deep loops do not blow up, they freeze. So the ceiling on depth
comes from ENERGY: reconfiguring a deep hierarchy costs lambda_0^(L-1), exponential in depth. That
sets the second wall, and the SAME lambda_0 prices it. (B9; R5, fig4c. R5 <-> edge of chaos is the
second tight link. FINETUNE: figcap kept tight; panels read on the figure. GAP: R5 energy figure
pending final runs. fig-card used so the eigenvalue panel reads cleanly.)
-->

---
layout: two-cols-header
class: paper
---

# The Viable Window

::left::

<Fig src="/figs/fig4a_wedge.png" alt="viable wedge in the (N, L) plane: flat-unstable below, frozen above, viable between" v-click class="fig-click" />

::right::

<div class="eq-hero" v-click style="margin-top:5.5rem;">

$$L_{\min}(N) \;\le\; L \;\le\; \Lambda$$

</div>

<div class="eq-note" v-after style="margin-top:1.2rem;">

Floor from stability **(R4)**, $\,L_{\min}\sim\log_{\lambda_0}N$. Ceiling from the energy budget **(R5)**, $\,\mathcal{E}_{\min}=\lambda_0^{L-1}$. Both walls priced by the *same* $\lambda_0$ - one currency.

</div>

<div class="eq-note" v-after style="margin-top:1rem;">

Too flat and it flips. Too deep and it freezes. Between them, a window where the system holds a state and still moves.

</div>

<!--
The payoff of Act III. Too flat and it flips (R3). Too deep and it freezes (R5). Between them a wedge
in the (N, L) plane where the system can hold a state AND still move. The thing to land: the SAME
number lambda_0 builds both walls - the depth that stabilises is log_{lambda_0} N, the energy that
reconfigures is lambda_0^{L-1}. One currency, two walls. For a reservoir person, the edge of chaos is
promoted from a tuning heuristic to a phase boundary that can be computed and a window to sit inside
by design. Let the window sit for a beat - it is what the first three acts were built to earn.
(B9; R4+R5, fig4a. The Holling K-phase name for the frozen region is provisional colour - author's
call, use only if asked.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act IV - the turn</div>

# The Loop, Turned on Itself

<div class="turn-quotes" style="margin-top:1.2rem;">

<div class="turn-quote" v-click>

The whole construction is a **self-consistent fixed point** - a process acting on itself until the mandate agrees with what it induces.

</div>

<div class="turn-quote" v-click>

Apply the same principle to the most advanced learning machine in reach - the **AI itself**. Find the fixed point, recur.

</div>

<div class="turn-quote" v-click>

The harness - the author steering the engine toward a consistent result - **is** that fixed point.

</div>

</div>

<!--
The turn, reconceived (FINETUNE: "Now the strange part" rejected). The POINT: the talk built a
universal model of the phases of adaptive systems by treating them as SELF-CONSISTENT FIXED-POINT
solutions of a thing acting on itself - that was the B4 move. Now turn the same principle on itself.
Apply it to the most advanced learning machine in reach, the AI ("something like the thing giving this
talk"): find the fixed point, recur. The harness - the author steering the engine toward "doing what I
want" - IS that self-consistent fixed point.

The next slides give a schematic of how the engine works AND show that learning these rules lets one
build engines that do this. Two-step: the live graph, then the engine that built it. Do not apologise
for the recursion - it is the point. (B10; the engine narrative and this session.)
-->

---
layout: center
class: paper embed-slide
---

# The Conceptric - the Graph That Built This Talk

<div class="embed-frame embed-wide" v-click>
  <Embed src="/figs/conceptric_snapshot.html" :height="430" />
</div>

<div class="eq-note" v-click style="margin-top:0.5rem;">

Live, local: <code>python -m laplace.viewer --source substrate --path …/laws-of-learning/conceptric-source.md --port 8766</code>. The published deck needs the static-export step.

</div>

<!--
THE CLIMAX, graph (1) of three. This is the talk's OWN conceptric - the DERIVATION_SPINE made
navigable: nodes are the beats B0-B10 and their objects, edges are the "rests on" dependencies, so
the reading order IS the graph's edge structure. It is LIVE and TRUE - the real graph, not the static
facsimile the old draft shipped.

PRESENTING LOCALLY: launch the viewer first -
  python -m laplace.viewer --source substrate \
    --path C:\Users\gerar\VScodeProjects\phujck.github.io\talks\laws-of-learning\conceptric-source.md \
    --port 8766
then this iframe (http://localhost:8766) is fully interactive: descend into a result (say B4, the
self-consistency foundation), climb back, see what each beat draws on. Scale-local - run through the
levels, here are the levels at one point, here at the next.

ON-SLIDE NOTE (kept, per spec): the PUBLISHED deck needs the static-export step before this is live
off-localhost - until then it degrades when the viewer is not running. That export is the open build
task. (B10; conceptric-source.md; laplace.viewer --source substrate.)
-->

---
layout: center
class: paper embed-slide
---

# The Engine Behind It - the Wiki

<div class="embed-frame embed-wide" v-click>
  <Embed src="/figs/conceptric_snapshot.html" :height="430" />
</div>

<div class="eq-note" v-click style="margin-top:0.5rem;">

Live, local: <code>python -m laplace.viewer --source canon</code> - every node of the live canon, name-only.

</div>

<!--
Graph (2) of three: the engine WIKI, name-only - all the many nodes of the live canon, read straight
from the engine. Launch the default source:
  python -m laplace.viewer --source canon --port 8765
then this iframe (http://localhost:8765) renders the whole canon scale-local - coarse nodes stand in
for their clusters (voice_corpus, domains, skills...). Accurate by construction, no snapshot. This is
"the many nodes of the wiki" - the breadth behind the single talk-graph. Name-only is the point here:
the shape and scale of what the engine knows, not its prose. (B10 close; laplace.viewer --source canon.)
-->

---
layout: center
class: paper embed-slide
---

# The Engine Behind It - the Skills

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/engine-facsimile.html" :height="430" />
</div>

<!--
Graph (3) of three: the SKILL LAYER - the engine's skills, clustered by activity (generating, staging,
evaluating). This one ships in the deck (public/viz/engine-facsimile.html) and is embedded as-is. The
facsimile is HONEST here - it IS the skill layer, name-only by design - which is different from the old
draft's error of letting the facsimile stand in for the LIVE engine graph. Graphs (1) and (2) now
supply the live truth; this is the skills, drawn.

The line across the three: the talk is a graph, the engine that built it is a graph - the wiki it knows
and the skills it runs. The build is the talk is the engine, shown in three real graphs. (B10 close;
public/viz/engine-facsimile.html, embedded as-is per spec.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act V - the laws, under construction</div>

# The Laws of Learning

<div class="laws">

<div class="law" v-click>

<span class="law-n">I</span> One eigenvalue prices the phases.

$\psi$ for the loop, $\rho(W)$ for the reservoir - fade, compute, or run away. {.law-sub}

</div>

<div class="law" v-click>

<span class="law-n">II</span> Learning groups primitives, and depth is renormalisation time.

$L_{\min}\sim\log N$ - the staircase and the stacked reservoir are the same law. {.law-sub}

</div>

<div class="law" v-click>

<span class="law-n">III</span> Evaluation is endogenous.

The system that learns is part of what it learns about, so consistency with its sources is the only guard. {.law-sub}

</div>

</div>

<div class="eq-note" v-click style="margin-top:1.2rem;">Under construction - there is far more to say. This is what there was time to put together.</div>

<!--
The laws, EARNED from what the talk showed, and framed as UNDER CONSTRUCTION (FINETUNE: explicitly
not a definitive closed set - honest work-in-progress, this is what there was time for). Law I is the
trichotomy plus the opener rhyme (R2/R3) - one eigenvalue, three fates, driven by hand on the A3
applet. Law II is the depth result plus the turn (R4 and the grouping-primitives move) - the staircase
the room watched build. Law III is the engine's epistemic spine, kept LIGHT - endogenous evaluation,
tied back to the endogeneity arrow from Act 0 - the system that learns is inside the loop it studies,
so consistency with its sources is the guard.

Do not over-claim Law III - it is the frame, not a theorem. The open author sign-offs (N_0, "phases of
hierarchy", UEC) are deliberately NOT here - the author's to coin. (Synthesis of R1-R5 + engine;
caveat d. FINETUNE: killed "closure is provenance, not completion" antithesis from old Law III.)
-->

---
layout: center
class: paper text-center
---

# Thank You

<div class="turn-quotes" style="margin-top:1rem;">

<div class="turn-quote" v-click>

$\psi$ is to the loop what $\rho(W)$ is to the reservoir. A locally reasonable rule, summed and fed back over a large system, has phases - and one number names them.

</div>

</div>

<div class="eq-note" v-click style="margin-top:1.2rem;">

With thanks to everyone who shaped this - the collaborators, the lineage it re-derives, and the engine it was built with.

</div>

<div class="kicker" v-click style="margin-top:1.6rem;">gmccaul.co.uk · the build is the talk is the engine</div>

<!--
The close (FINETUNE: keep gmccaul.co.uk and "the build is the talk is the engine"; ADD a thank-you /
acknowledgements). Bring the arc home: Act 0 said learning is an endogenous loop; Act I showed the
reservoir is one; Act II built it and found the exponent; Act III showed the exponent prices the phases
and the window; Act IV turned the principle on the engine that built the talk; the laws are what stands,
under construction. Thank the room and the people.

The UV-catastrophe / Planck framing (a locally correct rule, lethal summed over modes; a classifier
resolves it) is available as colour HERE if the room is warm and there is time - caveat (c): narrative
colour, NOT load-bearing, deploy-or-drop. Author's call on which provisional colour to use. The real
close is the rhyme: one number, the phases of learning. (Synthesis; caveat c; exact close at the
agent's discretion per FINETUNE - landed as a thank-you on the rhyme.)
-->
