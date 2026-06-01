---
# The Laws of Learning — a talk for reservoir physicists. ~60 minutes.
#
# SELF-EXPERIMENT. This deck was authored by an AI agent acting AS the author
# (Gerard McCaul), 2026-06-01, as an exercise of the `talk_smith` / `visual_director`
# pipeline. It is a draft to be fine-tuned and iterated by the author. Provenance:
# claude-acting-as-author. See README.md and STORYBOARD.md.
#
# Re-architected for an hour and for a visual medium: Act 0 is a broad, almost
# maths-free grounding in learning-as-adaptation; Act II sets the model up slowly,
# one motivated piece at a time; the later acts (figures, the turn, the conceptric,
# the laws) are the v1's, re-paced. Animations carry the global ideas.
#
# Substrate decides the theme: the ANF figures are paper-light REVTeX (Okabe-Ito),
# so the deck is `class: paper`, accent = the figures' own data blue #0072b2.
theme: ./theme
title: The Laws of Learning
info: |
  The Laws of Learning - what decides whether a learning system fades, computes, or
  runs away. Built for reservoir physicists. ~60 min, visual-first. SELF-EXPERIMENT,
  claude-acting-as-author, 2026-06-01. Source: the ANF results R1-R5 and the build
  record of these sessions.
class: paper text-center
layout: center
highlighter: shiki
mdc: true
fonts:
  serif: Lora
  sans: Inter
  mono: JetBrains Mono
---

<div class="kicker">What decides whether a learning system fades, computes, or runs away?</div>

# The Laws of Learning

<div class="eq-note">One number sets the phases. You already know it in one guise. Here is the law behind it.</div>

<div class="accent-rule" style="background:#7eb8da;width:90px;height:2px;margin:1.4rem auto;"></div>

<div class="author" style="color:#9ca3af;">Gerard McCaul</div>

<div class="corner-eq">

$$\rho(W) \,\lessgtr\, 1$$

</div>

<!--
Open on the question, not the apparatus. The room is full of people building reservoirs.
By the end, the number on their reservoir and a number I am about to derive will be the
same shape of law. But I am NOT going to start there. I am going to start much wider -
with learning itself, as a thing that happens in evolution, in markets, in brains, in
gradient descent - and only earn my way to the maths once the shape is in the room.

Timing: this is an hour. The first ten minutes buy nothing but intuition. Resist the urge
to rush to the equations - the whole point of the rebuild is that the slow runway is what
makes the payoff land. SELF-EXPERIMENT note (for the author): AI-drafted pass, everything
traces to R1-R5 or the build record. See STORYBOARD.md for per-slide provenance.
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act 0 — learning is one phenomenon with many faces</div>

# Before the Maths

<div class="eq-note" style="margin-top:1.2rem;">Forget reservoirs for ten minutes. Let us talk about learning itself.</div>

<!--
A title card for the act, so the audience knows the contract: the next ten minutes are
deliberately wide and deliberately light on equations. I am asking them to hold the
reservoir thought in their pocket and come with me somewhere more general first. The
promise: everything here will pay off when we come back. This is the act the rebuild adds -
the v1 jumped to the loop by slide 4 and the audience never got the intuition that the loop
is a GENERAL object, not an ANF gadget. Spend the time. It is bought back with interest.
-->

---
layout: center
class: paper text-center
---

# What Do These Have in Common?

<div class="grid-faces" v-click>

<div class="face-chip">A species <span>evolving</span></div>
<div class="face-chip">A model on a <span>loss surface</span></div>
<div class="face-chip">A market finding a <span>price</span></div>
<div class="face-chip">A brain <span>adapting</span></div>
<div class="face-chip">A reservoir being <span>trained</span></div>

</div>

<div class="eq-note" v-click style="margin-top:1.6rem;">Five systems that look nothing like each other. I claim they are the same shape.</div>

<!--
Pose the puzzle before the answer. Read the five out loud - a peregrine falcon, a neural
net mid-training, a fish market at dawn, a cortex, a reservoir on a bench. The audience's
instinct is "these are analogies, loose ones". Hold that thought. The wit is the breadth -
a falcon and a fish market in the same breath. The claim on the second click is deliberately
strong: not "they rhyme", but "they are the same shape". I will spend the act earning the
word SAME. Do not define the shape yet - let them sit in the puzzle for a beat.
-->

---
layout: center
class: paper embed-slide
---

# The Same Loop, Wearing Different Clothes

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/many-faces.html" :height="430" caption="Four faces of learning, each running its own little simulation - and the one loop they all turn out to be. Click a face to hold it, or 'All four' to see the shared structure." />
</div>

<!--
THE ACT-0 CENTREPIECE. This is the most important new asset in the rebuild. Let it autoplay
through the four faces while you talk - do NOT narrate every panel, let the animation do it.

What it shows: evolution (a population cloud climbing a landscape it pushes around), gradient
descent (a ball rolling on a loss surface that tilts under it), a market (a price chasing an
equilibrium it shifts), a reservoir (an output chasing a target its own dynamics generate).
On the right, the SAME four-node ring lights up for each: a slow control, the environment it
sets, the fast state living there, a coarse delayed measurement, back to the control.

The line to land, pointing at the ring: "every one of these is a thing that senses, updates,
and then acts back into the world it is sensing." Then hit "All four" and let the four little
systems sit beside the one diagram. That is the whole act in one picture. Spend two or three
minutes here. This is where the intuition is built. (Grounded in the ANF loop, R1; the four
faces are the spine's cast, Beat 2, plus gradient descent as the audience's own bread and butter.)
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

It carries a **slow control** - the thing it adjusts. A trait distribution, a weight, a price, a policy.

</div>

<div class="define">

The control sets an **environment** - the world its fast parts then live in.

</div>

<div class="define">

It takes a **coarse, delayed measurement** of how that went.

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
<div class="leg-arrow">updates ↑ the control</div>

</div>

<!--
Now name the parts, slowly, one click each. This is the vocabulary the whole talk runs on,
so plant it here in plain words BEFORE any symbol appears. Use the four faces from the last
slide as the examples - "the slow control is the trait distribution for the falcon, the
weights for the net, the price for the market". The right-hand column is a colour-coded
stack, not a graph - the colours (gold control, vermilion environment, green state, blue
measurement) are the SAME colours the animation just used and will reappear on the loop
figure and in every animation after. Consistency of colour is doing pedagogical work. One
idea: a learning system is a four-part loop. No maths yet. (R1 model, stated in words.)
-->

---
layout: two-cols-header
class: paper
---

# The Part That Makes It Interesting

::left::

A thermostat senses and acts. So does a falling stone. Neither is what I mean by learning.

<v-clicks>

The difference is one arrow.

<div class="define">

A **driven** system responds to a world that is just *there*. Something outside sets the field.

</div>

<div class="define">

A **learning** system sets the world it then responds to. The control generates its own environment.

</div>

The system cannot step outside the field it is busy creating. That is **endogeneity**.

</v-clicks>

::right::

<div class="eq-hero" v-click>

the field is **not** given - it is **made**

</div>

<div class="eq-note" v-after>

$$h \;=\; \Pi(\theta)$$

The environment $h$ is a function of the control $\theta$. The one arrow the rest of the talk hangs on.

</div>

<!--
This is the conceptual hinge of Act 0 and it is worth slowing right down. The distinction is
driven vs adaptive. A driven system has an EXOGENOUS field - the wind on a bridge, the input
to a passive reservoir. A learning system is ENDOGENOUS - it supplies its own field, then
measures itself through it, at a delay. Evolution reshapes the fitness landscape it climbs.
A big trader moves the price they are trading against. A model's own predictions become the
data it next learns from. Give two or three of these out loud.

The single equation h = Pi(theta) is the only symbol in the whole act, and it earns its place
because it IS the arrow. Mark it. Say: every strange thing in the second half of this talk -
why big systems go unstable, why you need hierarchy, why deep systems freeze - traces back to
this one arrow. The system is inside its own loop. (R1 model sec 3, endogeneity A5; spine Beat 4.)
-->

---
layout: two-cols-header
class: paper
---

# Watch the Loop Close

::left::

Same machine, two wirings.

<v-clicks>

<div class="define">

**Driven.** Set the field from outside. The fast parts just settle into it. Calm. Predictable.

</div>

<div class="define">

**Adaptive.** Let the control read its own measurement and update. Now the loop is closed.

</div>

A closed loop reacting to a *stale* read of itself can **overshoot** - and ring. Stability is no longer free.

</v-clicks>

::right::

<div class="embed-frame" v-click>
  <Embed src="/viz/adaptive-loop.html" :height="370" caption="Driven: the parts settle. Adaptive: the control reads its own delayed measurement and the loop can oscillate. The red arrow is endogeneity, made visible." />
</div>

<!--
A1, the adaptive-loop animation. The button toggles driven vs adaptive. Show driven first -
the control tracks an external command smoothly, the agents sit in the well, the feedback leg
is greyed out (open). Then click adaptive: the feedback leg lights up, and the control starts
to RING - it swings, because it is chasing a measurement that lags behind its own action.

The point, pointing at the two traces: "nothing changed inside the system. The only thing I
changed is whether it listens to itself. And listening to yourself, at a delay, is enough to
make a stable thing oscillate." That is the seed of the whole instability story - planted here,
in pictures, with no algebra. The delay slider lets you make the ringing worse. Do not over-talk
it - one clean contrast (calm vs ringing) is the whole beat. (R1 endogeneity + delayed feedback;
this is the qualitative seed of the return-map instability, Beat 5/9.)
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

It is **not** an analogy across evolution, markets, brains and machines. It is one object.

</div>

<div class="turn-quote" v-click>

The object has a **slow control**, a **generated environment**, a **fast state**, a **coarse measurement**.

</div>

<div class="turn-quote" v-click>

Because it is endogenous, **stability is not guaranteed**. That is where the physics begins.

</div>

</div>

<!--
Close the act by banking the intuition explicitly, because the next two acts will cash it.
The one-sentence form is the thing I want them to leave the room remembering, so say it twice
and let it sit. Then three clicks that restate the act: one object not an analogy; four parts;
endogenous, therefore stability is a question not a gift.

This is the handover from "feel" to "physics". The last line is the bridge: a system that
makes its own environment can tear itself apart, and now we get to ask precisely when. Pause.
Then: "so - let us go to the one place in this room where you already live with this." Turn to
their world. (Synthesis of Act 0; the endogeneity-to-instability bridge is spine Beat 4 to 5.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act I — anchor in your world</div>

# You Already Tune One of These

<div class="eq-note" style="margin-top:1.2rem;">A reservoir is a learning loop. And you already live with the number that governs it.</div>

<!--
Act I title card. The pivot from the general to the specific. The audience has spent ten
minutes on falcons and markets - now reward them by landing in exactly their world, and show
that everything Act 0 said was secretly about the thing on their bench. Short. Then go.
-->

---
layout: two-cols-header
class: paper
---

# Your Reservoir Is a Physical System Computing

::left::

You feed it a signal. It churns. You read off a linear map.

<v-clicks>

<div class="define">

One number decides its fate - the **spectral radius** $\rho(W)$ of the recurrent weights.

</div>

- $\rho(W) < 1$ - the **echo-state property**. Inputs fade, the reservoir forgets. Usable memory.
- $\rho(W) > 1$ - perturbations grow. The state runs away into chaos.
- The useful regime sits at the **edge of chaos**, $\rho(W)\to 1$.

</v-clicks>

::right::

<div class="embed-frame" v-click>
  <Embed src="/viz/phase-portrait.html" :height="380" caption="A physical system computing - click the phase space to launch a trajectory. Damping is live." />
</div>

<!--
Their world, in their words. Echo-state property, spectral radius, edge of chaos - Jaeger and
Maass, week-one reading. Let someone in the front row click the phase portrait. The live embed
is a real dynamical system they drive - damping is the leak. The punchline rho(W) < 1 lands
last: ONE number, three fates.

Connect it back to Act 0 explicitly: "your reservoir is the fast state. Its recurrent dynamics
are the environment. Training the readout is the slow control. It is the loop - you have just
never been made to see it that way." Hold here. The whole second half is going to rhyme with
this slide. (Reservoir-computing canon: echo-state / Jaeger, edge of chaos / Maass.)
-->

---
layout: two-cols-header
class: paper
---

# One Eigenvalue Already Governs Your Reservoir

::left::

You do not tune a thousand things. You tune the radius and the rest follows.

<v-clicks>

- Too small - the echoes die before they are useful. **Fading.**
- Too large - the state never forgets, it just churns. **Chaos.**
- In between - rich, long-lived dynamics. **Computation.**

The trichotomy is not exotic. **It is your daily practice.**

</v-clicks>

::right::

<Fig src="/figs/fig2b_trichotomy.png" alt="return map with three slopes at the fixed point; the same trichotomy the reservoir lives in" v-click class="fig-click" />

<div class="figcap">

The same three-way split you already know - too cold, too hot, just right - drawn as a return map. Hold this picture.

</div>

<!--
Slow this down - it is the rhyme the whole talk is built on, so plant the trichotomy now in
THEIR language before it is a theorem. Fade / compute / chaos is something they tune by hand
every week. I am showing the trichotomy figure here, early and lightly, NOT to derive it but
to say "remember this shape" - because in Act III the very same figure comes back as a derived
result about a general loop. Foreshadowing with a real asset. Reuse, do not recolour - fig2b
is the R3 return map, its own data colour is the accent. Do not say "renormalisation" yet.
(Reservoir trichotomy in their practice; the figure is R3 / fig2b, used here as foreshadow.)
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

Or is it one face of a **law of learning** - the same shape that governs a falcon, a market, a brain?

</div>

</div>

<div class="closing-line text-lg" v-click>

I am going to derive that law from scratch. [Then we will see if your eigenvalue was an instance of it.]{.accent}

</div>

<!--
The hinge of the whole talk, stated as a clean question. The audience now has two things in
hand: the general loop from Act 0, and their own eigenvalue from Act I. The question fuses them:
is rho(W) parochial, or is it a special case? Make the stakes honest - I am NOT going to claim
the reservoir's operator and my operator are literally the same (they are not, and I will say
so when we get there). I am going to claim the same SHAPE of law. Promise the derivation, then
deliver it slowly. End on the terminal line and move into Act II. (The talk's central question;
honesty caveat (b) is foreshadowed - same shape, not same operator.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act II — build the model, slowly</div>

# Now We Earn the Equations

<div class="eq-note" style="margin-top:1.2rem;">One piece at a time. Each piece motivated before the next. No wall of algebra.</div>

<!--
Act II title card and a contract with the audience: we are going to build the model carefully,
and every symbol will be introduced because we need it, not dumped. This is the second big fix
in the rebuild - the v1 collapsed the loop to a return map in a single rushed slide. Here it is
staged across several. Tell them: "I will build a machine in four moves, then watch it collapse
to a single number. Stay with me - the slowness is the point." Then go piece by piece.
-->

---
layout: two-cols-header
class: paper
---

# Move One — The Slow Control and Its Field

::left::

Start with the two timescales. They are the spine of everything.

<v-clicks>

<div class="define">

**$\theta$ - the control. Slow.** The thing the system adjusts. It moves on a long timescale.

</div>

<div class="define">

**$h = \Pi(\theta)$ - the field. Generated.** The control does not act on the parts directly. It sets the world they live in.

</div>

This is the Act-0 arrow, now named. The mandate sets the weather. It does not push each raindrop.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$\theta \;\xrightarrow{\;\;\Pi\;\;}\; h$$

</div>

<div class="stage-note">

slow control → the field everything else feels

</div>

</div>

<!--
Move one of four. Introduce ONLY theta and h. Resist adding anything else. The key idea to
keep alive: the control acts through the field, not directly - that indirection is what makes
the loop a loop rather than a lever. Use the weather metaphor - a policy or a price sets the
conditions, and the conditions are what the population actually responds to. This is the same
h = Pi(theta) from Act 0, so the audience should feel recognition, not novelty. One symbol pair,
fully motivated. (R1 model, theta and the environment map Pi; spine Beat 3.)
-->

---
layout: two-cols-header
class: paper
---

# Move Two — The Fast Parts, and a Coarse Look

::left::

The field is felt by many fast parts. We never see them all.

<v-clicks>

<div class="define">

**$N$ fast parts.** Each responds locally to the field $h$. They equilibrate quickly - **scale separation**.

</div>

<div class="define">

**$m = \langle O \rangle$ - the measurement.** A coarse, noisy, delayed average. Not the microstate - just one number off it.

</div>

We watch the crowd through a blurry, late camera. Noise of order $N^{-1/2}$. Delay $T$.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$h \;\to\; \{x_1,\dots,x_N\} \;\to\; m=\langle O\rangle$$

</div>

<div class="stage-note">

the field drives many fast parts → we read one coarse, delayed number off them

</div>

</div>

<!--
Move two. Add the fast parts and the measurement. Two honest assumptions enter here, both
physical: scale separation (the parts settle fast relative to the control - so we can treat the
microstate as equilibrated at each theta) and coarse measurement (we observe an average, with
noise and delay, not the full state). Both are things the audience accepts instantly - no
institution, brain or reservoir reads its own microstate. The blurry-late-camera image is the
load-bearing metaphor. Now we have three of the four legs. (R1 model, the microstate and the
order parameter m; scale separation A-assumption; spine Beat 3/5.)
-->

---
layout: two-cols-header
class: paper
---

# Move Three — Close the Loop

::left::

The measurement updates the control. That is the fourth leg, and it shuts the circle.

<v-clicks>

<div class="define">

The control descends on what it measures - gradient on a reasonable objective. $m$ in, new $\theta$ out.

</div>

Four legs, now joined:

- $\theta$ sets the field $h$,
- $h$ drives the fast parts,
- the parts give the measurement $m$,
- $m$ updates $\theta$.

The loop from Act 0, fully assembled - and endogenous, because leg one feeds leg four.

</v-clicks>

::right::

<Fig src="/figs/fig1_adaptive_loop.png" alt="the four-leg adaptive loop: mandate, environment, fast state, order parameter, with governing equations" v-click class="fig-click" />

<div class="figcap">

Fig 1 - the loop, as one object: slow control $\theta$, generated environment $h=\Pi(\theta)$, fast state $\rho_h$, coarse measurement $m$.

</div>

<!--
Move three closes the loop, and here the real R1 figure arrives - the four colour-coded boxes,
the four verbs. The audience has now BUILT this diagram leg by leg, so when it appears whole it
should feel inevitable rather than imposed. That is the difference from the v1, which showed
this figure cold on slide 4. Point at the arrow from theta to h and remind them it is the
endogenous one - leg one and leg four are the same system talking to itself. Do not read the
equations on the figure aloud. The figure IS the claim. (R1, fig1; spine Beat 3/4.)
-->

---
layout: two-cols-header
class: paper
---

# Move Four — It Collapses to One Number

::left::

Four legs look complicated. Near the loop's own fixed point, they are not.

<v-clicks>

- Track only the **error** $e_k$ - how far the measurement sits from where the loop is consistent with itself.
- Scale separation plus a symmetry collapse the whole machine to **one scalar recurrence**.
- Everything the system's fate depends on rides in a single **gain** $K_N$.

</v-clicks>

::right::

<div class="eq-hero" v-click>

$$e_{k+1} = (r - K_N)\,e_k \;-\; \alpha\,c_N\,e_k^{3}\;+\;\cdots$$

</div>

<div class="eq-note" v-after>

One recurrence. The memory $r=e^{-T/\tau}$ is the loop's analogue of your reservoir's leak.

</div>

<div class="eq-hero" v-click>

$$K_N \;=\; \alpha\,\chi_N\,g$$

</div>

<div class="eq-note" v-after>

The gain is built from the **susceptibility** $\chi_N$ - how hard the collective answers a nudge.

</div>

<!--
The reduction - the move physicists trust. Do NOT derive it on the slide. State what makes it
work and that it IS derived in the paper: track the error from the self-consistent fixed point;
a symmetry (the action is equivariant) kills the quadratic term so the first nonlinearity is
cubic; scale separation lets the fast parts be slaved. A four-leg loop becomes a 1-D return map.

Two things to land. First, the memory r = exp(-T/tau) is the loop's leak rate - a REAL rhyme
with their reservoir's leaky integration, not a forced one. Second, the whole fate of the
system rides in K_N, and K_N is built from chi_N. So the entire question of stability has been
funnelled into one object: how does the susceptibility chi_N behave? That is the next move, and
it is where the renormalisation comes in. (R1, the reduced return map and the gain; spine Beat 5.)
-->

---
layout: two-cols-header
class: paper
---

# The Stability Condition Is Embarrassingly Simple

::left::

A 1-D map. Its fixed point is stable when the slope at that point sits inside the unit interval.

<v-clicks>

<div class="define">

The equilibrium holds while the gain stays below a threshold set only by the memory:

</div>

<div class="eq-hero">

$$K_N \;<\; K_c(r) = r+1$$

</div>

- Below threshold - perturbations relax. The loop holds course.
- Above threshold - the equilibrium loses stability. Something gives.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$|\,r - K_N\,| \;<\; 1$$

</div>

<div class="stage-note">

the slope of the return map at its fixed point - exactly the echo-state condition, wearing a different letter

</div>

</div>

<!--
This is the slide that first makes the reservoir rhyme bite. The stability of a 1-D map is
controlled by the slope at the fixed point - they know this cold from the logistic map and from
linear stability. The condition |r - K_N| < 1 is structurally the SAME statement as |rho(W)| < 1:
a slope inside the unit interval means perturbations contract. Say it plainly: "this is the
echo-state condition for the loop. Same inequality, different operator." That is the honest
framing - same shape, and I am flagging that the operator differs. The threshold K_c = r + 1 is
clean and depends only on the memory. Now the only question left is whether K_N actually crosses
it - which depends on how K_N grows with size. (R1 stability; the reservoir parallel, caveat (b).)
-->

---
layout: two-cols-header
class: paper
---

# Everything Now Hangs on One Question

::left::

The gain is $K_N = \alpha\,\chi_N\,g$. The constants are fixed. The susceptibility is not.

<v-clicks>

<div class="define">

**How does $\chi_N$ scale as the system grows?** Add more parts - does the collective answer a nudge more loudly, or less?

</div>

- If $\chi_N$ shrinks with $N$, the gain stays tame. The loop is safe at any size.
- If $\chi_N$ grows with $N$, the gain climbs - and will eventually cross $K_c$.

One scaling law decides the fate of the whole family.

</v-clicks>

::right::

<div class="stage-card" v-click>

<div class="stage-eq">

$$K_N = \alpha\,\chi_N\,g \quad\Longrightarrow\quad \text{fate} = \text{fate}\big(\chi_N(N)\big)$$

</div>

<div class="stage-note">

the entire question of stability is now the question of one scaling law

</div>

</div>

<!--
A funnel slide - make the audience feel the whole problem narrow to a single point. We started
with falcons and markets, built a four-leg loop, collapsed it to a return map, and now the
ENTIRE fate of the system is the behaviour of one function: chi_N(N), the susceptibility as a
function of size. This is the dramatic setup for the renormalisation move. Pose it as a genuine
question - does answering a nudge get louder or quieter as you add parts? - because the answer
is not obvious, and it is exactly what the next slide computes. Keep it tight. (R1 to R2 bridge;
spine Beat 5 to 6.)
-->

---
layout: two-cols-header
class: paper
---

# The Susceptibility Is a Power Law

::left::

Here is the move physicists have a name for - **coarse-graining**. Group $n$ parts into one. Repeat.

<v-clicks>

<div class="define">

At the self-similar fixed point, each grouping step multiplies the susceptibility by a fixed factor $\lambda_0$.

</div>

<div class="eq-hero">

$$\chi_N \sim A\,N^{\psi}, \qquad \psi = \log_n \lambda_0$$

</div>

The exponent is **not fitted**. It is the **logarithm of the decimation eigenvalue**.

</v-clicks>

::right::

<Fig src="/figs/fig2a_r2_powerlaw.png" alt="susceptibility power law, psi=1/2 slope triangle, finite-size correction inset" v-click class="fig-click" />

<div class="figcap">

Fig 2a - measured $\chi_N$ on the predicted law $A\,N^{\psi}$. The slope triangle reads $\psi=\tfrac12$ here - one worked corner, not a universal value. Inset: the finite-size correction collapsing.

</div>

<!--
The engine room, conveyed by figure not derivation. The renormalisation group is just
"coarse-grain and look at what stays invariant" - they have met it in critical phenomena, even
if lightly. One decimation step (group n parts, integrate them out) scales chi_N by a factor
lambda_0. Iterate that and you get a power law whose exponent is log_n(lambda_0). The exponent
is structural - it comes from the fixed point of the coarse-graining map, not from a fit.

CAVEAT (a), say it out loud and point at the slope triangle: psi = 1/2 is ONE worked corner of
parameter space. It is not a universal value. Do not let psi = 1/2 ossify into a law of nature -
the LAW is "chi is a power law and psi is the log of the decimation eigenvalue", the NUMBER 1/2
is just one instance. The next slide animates where this comes from. (R2, fig2a; caveat (a).)
-->

---
layout: center
class: paper embed-slide
---

# Depth Is Renormalisation Time

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/coarse-graining.html" :height="420" caption="Group n parts into one, level by level. Each step multiplies the susceptibility by λ₀ - and builds one tread of a geometric staircase. The exponent ψ = log_n λ₀ is the same factor seen two ways." />
</div>

<!--
A2, the coarse-graining animation - the mechanism behind the power law, made watchable. Let it
autoplay: the decimation tree builds bottom-up (primitives grouped n-at-a-time into coarse
units, up to a single root), and beside it the geometric staircase rises, one tread per level,
each riser a factor lambda_0 wide.

The line to land: "one step of coarse-graining is one factor of lambda_0. That is the whole
content of the exponent - psi is just log_n of that factor." This animation does double duty -
it explains where psi comes from (left tree) AND foreshadows the depth result of Act III (right
staircase), because adding a level of hierarchy and doing a step of renormalisation are the SAME
operation. Plant that phrase now - "depth is renormalisation time" - and it pays off in Act III.
You can step it by hand with the button if the room wants to see one fold at a time. (R2/R4
mechanism; the staircase is fig3b's content, animated; spine Beat 6/10.)
-->

---
layout: center
class: paper text-center
---

# What We Have Built

<div class="ladder" v-click>
<div class="rung"><b>θ, h</b>slow control,<br>generated field</div>
<div class="rung"><b>N, m</b>fast parts,<br>coarse measure</div>
<div class="rung"><b>K_N</b>one gain,<br>one return map</div>
<div class="rung"><b>χ_N ~ N^ψ</b>one scaling law,<br>one exponent</div>
</div>

<div class="eq-hero" v-click>

$$\psi \;=\; \log_n \lambda_0$$

</div>

<div class="closing-line" v-click>

Four moves, and a learning loop became **one exponent**. [Now watch what that exponent decides.]{.accent}

</div>

<!--
A breather and a recap - explicitly mark the end of the model build. Walk the ladder left to
right: we named a slow control and its field, added fast parts and a coarse measurement, closed
the loop and collapsed it to a single gain and return map, and found the gain is governed by one
scaling exponent psi. That is the whole apparatus. The audience should feel they EARNED psi,
move by move, rather than being handed it. This is the seam between Act II (build) and Act III
(payoff). Pause here, let them breathe, then: "everything from here is consequences." (Synthesis
of Act II; spine Beats 3-6.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act III — the payoff</div>

# One Exponent, Three Fates

<div class="eq-note" style="margin-top:1.2rem;">The sign of ψ is a complete classifier. Give me ψ and I tell you the fate at every size.</div>

<!--
Act III title card. This is the part the audience came for, even if they did not know it. The
exponent psi - earned across Act II - now does all the work. The framing "a complete classifier"
is the strong, true claim: the SIGN of one number sorts every system in the family into one of
three fates. Short card, then straight into the trichotomy.
-->

---
layout: two-cols-header
class: paper
---

# The Trichotomy

::left::

Put the scaling law into the gain. $K_N \sim N^{\psi}$. The sign of $\psi$ is everything.

<v-clicks>

- $\psi < 0$ - gain **shrinks** with size. **Unconditionally stable** at all $N$.
- $\psi = 0$ - gain is size-**independent**. **Self-organised critical** - it sits at the edge.
- $\psi > 0$ - gain **grows** with size. **Destabilises** at a finite $N_c$.

</v-clicks>

::right::

<Fig src="/figs/fig2b_trichotomy.png" alt="return map with three slopes at the fixed point, slope = lambda_0 = n^psi" v-click class="fig-click" />

<div class="figcap">

Fig 2b - the return map at the self-consistent fixed point. The slope there *is* $\lambda_0 = n^{\psi}$ - below 1 it relaxes, above 1 it flips. **The same figure from Act I.**

</div>

<!--
The heart of the result, and the payoff of the foreshadowing. THIS IS THE SAME FIGURE the
audience saw in Act I as "your reservoir's trichotomy". Now it returns as a DERIVED result about
a general adaptive loop. Make that explicit - "remember this picture? You met it as your daily
practice. Here it is again, earned." Hold up two fingers: rho(W) for their reservoir, lambda_0 =
n^psi for the loop, the same three-way split - a slope below 1 contracts, above 1 runs away, at 1
is the edge. The reservoir's fade/compute/chaos and the loop's stable/critical/runaway are the
same trichotomy. Caveat (a) still stands - psi is a free classifier, the sign is what matters,
the specific values are corner-dependent. (R3, fig2b; the Act-I rhyme pays off; spine Beat 8.)
-->

---
layout: two-cols-header
class: paper
---

# Too Flat Destabilises - a Flip at Finite Size

::left::

For $\psi>0$, the gain crosses threshold at a **finite critical size** $N_c$. What happens there is specific.

<div class="eq-hero" v-click>

$$N_c \sim \left(\frac{K_c}{\alpha\,g\,A}\right)^{1/\psi}$$

</div>

<v-clicks>

- A **flip bifurcation** - the slope passes through $-1$.
- The system does not blow up. It **oscillates**, period two.
- Amplitude grows as $\sqrt{N-N_c}$ - the classic square-root branch.

</v-clicks>

::right::

<Fig src="/figs/fig2c_r3_flip.png" alt="flat at zero below N_c, two-cycle fork above, amplitude sqrt(N - N_c)" v-click class="fig-click" />

<div class="figcap">

Fig 2c - below $N_c$ the equilibrium is flat and stable. Above it, the order parameter forks into a two-cycle. Here $N_c\approx 817$ - again, one worked corner.

</div>

<!--
The destabilisation has a name and a fingerprint - a flip (period-doubling) bifurcation, the
two-cycle opening as sqrt(N - N_c). Connect it back to the adaptive-loop animation in Act 0:
"this is the ringing you saw when we closed the loop - now we know exactly when it starts and
what it looks like." That callback ties the picture to the maths. This is what you would measure
in a real system: cross N_c and the period-2 wobble appears - the phase boundary is an
observable, not a theoretical fiction.

Caveat (a) again: N_c ~ 817 is the worked corner, not a universal number. There is also an
honest long-time caveat - in the full closed loop the two-cycle self-quenches along the slow
drift (the marginal theta-direction). Keep that for questions unless someone pushes - it is in
spine Beat 9, and being precise about it is a strength, not a weakness. (R3, fig2c; caveat (a).)
-->

---
layout: center
class: paper embed-slide
---

# Drive It Yourself

<div class="embed-frame embed-wide" v-click>
  <Embed src="/viz/viable-window.html" :height="430" caption="Drag ψ through zero. The return-map slope crosses 1, and the loop goes stable → edge → runaway. The right panel is the viable window - both walls priced by the same λ₀." />
</div>

<!--
A3, THE INTERACTIVE PAYOFF. This is the asset the RC audience will remember because they can
DRIVE it. Hand it to the room - or drive it live. Left panel: the return map and its cobweb.
Drag psi from negative (blue, contracting staircase - STABLE, fades) up through the critical
value (gold S-curve tangent to the diagonal - EDGE OF CHAOS) into positive (vermilion, the
iterate flips into a period-2 cycle - RUNAWAY). The verdict chip names the regime live.

Right panel: the (N, L) viable window. As you raise psi, watch the floor L_min ~ log N rise and
the green viable band pinch shut. That is the trichotomy and the depth law in one instrument.
Let it breathe - drag slowly through the transition so the room SEES the slope cross 1. This is
the moment the abstract becomes tactile: "this is your edge of chaos, and now you can move it
with one knob." The memory slider r and the kick button are there for play. Spend time here.
(R3 trichotomy + R4/R5 window; the audience payoff; spine Beats 8/11/13.)
-->

---
layout: two-cols-header
class: paper
---

# The Escape - and Why It Is Logarithmic

::left::

For $\psi>0$ the flat loop dies at $N_c$. You cannot take more measurements. You cannot rewrite the parts. One move is left - **stack levels**.

<div class="eq-hero" v-click>

$$N_c^{(L)} = N_c^{(1)}\,\lambda_0^{\,L-1}$$

</div>

<v-clicks>

- Each level multiplies the critical size by $\lambda_0$. **Adding depth is one step of coarse-graining.**
- So the depth you need grows only **logarithmically**:

  $$L_{\min}(N) \sim \log_{\lambda_0} N$$

- This is why you stack reservoirs. **Derived, not decreed.**

</v-clicks>

::right::

<Fig src="/figs/fig3b_r4_staircase.png" alt="geometric depth staircase, each riser a factor times lambda_0" v-click class="fig-click" />

<div class="figcap">

Fig 3b - the staircase rises in equal steps of $\log N$ - each tread a factor $\times\lambda_0$ wide. Simulated points sit on the predicted treads.

</div>

<!--
The first tight link to their world, and it is real. The phrase "depth is renormalisation time"
now cashes - the audience saw it built in the A2 animation, and here is the consequence. Each
level of hierarchy buys a factor lambda_0 of critical size, so to govern size N you need depth
~ log N. Deep reservoirs, deep nets - you stack because one layer cannot hold a large problem,
and here is the derivation of how much depth, not a rule of thumb. The staircase rhymes with the
spectral staircase they know from layered and hierarchical reservoirs - say that out loud. The
figure's treads ARE the staircase from the A2 animation, now with simulated points on them.
(R4, fig3b; R4 ↔ deep reservoirs is a tight, load-bearing link; spine Beat 10.)
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
- The loop is marginally stable - it neither oscillates nor adjusts. It is **inert**.
- Reconfiguring it then costs $\mathcal{E}_{\min}=\lambda_0^{\,L-1}$ - exponential in depth.

</v-clicks>

::right::

<Fig src="/figs/fig4c_r5_freeze.png" alt="eigenvalues retreating to marginal +1; spectral radius vs depth locking at rho = 1" v-click class="fig-click" />

<div class="figcap">

Fig 4c - right: the spectral radius versus depth - it **freezes at $\rho=1$**. Left: the dominant eigenvalue retreating to the marginal $+1$ inside $|z|=1$ as depth grows.

</div>

<!--
The second tight link, and the slide that should make the room sit up. The whole talk has been
about one eigenvalue. Here it is, LITERALLY: the spectral radius of the deep loop, locking at 1 -
the edge of chaos, derived as the FATE of a deep hierarchy, not assumed as a tuning target.
Panel (b) is rho vs depth flattening at 1; panel (a) is the dominant eigenvalue creeping to the
marginal +1 inside the unit circle they draw every day.

There is no dynamical upper wall - deep loops do not blow up, they freeze. So where does the
ceiling on depth come from? Not from the dynamics. From energy: reconfiguring a deep hierarchy
costs lambda_0^(L-1), exponential in depth. That sets the second wall. Next slide closes the
window. (R5, fig4c; R5 ↔ edge of chaos is the second tight link; spine Beat 11/12.)
-->

---
layout: center
class: paper text-center
---

# The Viable Window

<div class="fig" v-click>
  <Fig src="/figs/fig4a_wedge.png" alt="viable wedge in the (N, L) plane: flat-unstable below, frozen above, viable between" />
</div>

<div class="eq-hero" v-click>

$$\boxed{\; L_{\min}(N) \;\le\; L \;\le\; \Lambda \;}$$

</div>

<div class="eq-note" v-after>

Floor from stability **(R4)**. Ceiling from the energy budget **(R5)**. Both walls priced by the *same* $\lambda_0$. The edge of chaos, drawn as a computable phase diagram.

</div>

<!--
The payoff of Act III, and the thing the audience can take home and play with (it is exactly
what the A3 animation lets them drive). Too flat and you flip (R3). Too deep and you freeze (R5).
Between them, a wedge in the (N, L) plane where the system can hold a state AND still move. The
thing to land: the SAME number lambda_0 builds both walls - the depth that stabilises is
log_{lambda_0} N, the energy that reconfigures is lambda_0^{L-1}. One currency, two walls.

For a reservoir person: this is the edge of chaos promoted from a tuning heuristic to a phase
boundary you can compute and a window you can sit inside by design. Let the boxed window sit for
a beat - it is the result the first three acts were built to earn. (R4+R5, fig4a; spine Beat 13.
The Holling K-phase name for the frozen region is provisional colour - use only if asked.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act IV — the turn</div>

# Now the Strange Part

<div class="eq-note" style="margin-bottom:1.4rem; margin-top:1rem;">Building the theory of this is itself a hierarchical learning problem.</div>

<div class="turn-quotes">

<div class="turn-quote" v-click>

Learning is **grouping primitives into a usable higher concept**.

</div>

<div class="turn-quote" v-click>

A coarse node **stands in for** the subgraph beneath it.

</div>

<div class="turn-quote" v-click>

The interaction between two concepts is **computed** from the primitives they share.

</div>

</div>

<div class="closing-line text-lg" v-click>

The loop does not stop at the physics. [The thing that studies learning is a thing that learns.]{.accent}

</div>

<!--
The self-referential climax, named without apology - that is the voice. Everything so far was
the OBJECT level: loops, exponents, windows. Now the meta level. The way this theory got built -
grouping results into concepts, a coarse node standing in for the detail beneath it, edges
weighted by what concepts share - is the SAME move as the hierarchy in the physics. Coarse-
graining is not just IN the model. It is in HOW we came to know the model. The three lines are
exactly the three operations from Act II's coarse-graining, now applied to ideas instead of
parts. Do not apologise for the recursion. It is the point. (Engine narrative: HANDOFF "the
spirit"; SESSION_HANDOFF_conceptric "the model in one paragraph".)
-->

---
layout: center
class: paper embed-slide
---

# The Conceptric - The Graph That Built This Talk

<div class="embed-frame embed-wide" v-click>
  <Embed src="/figs/conceptric_snapshot.html" :height="430" caption="The five results, inside the engine that built the talk - R2 feeds into 'The Laws of Learning'. Live viewer at localhost:8765." />
</div>

<!--
THE CLIMAX. The talk showing you the engine that built it - the conceptric, the recursive
learning graph, with the five results R1-R5 you just met sitting in it as nodes. The edge
weights are the shared primitives: R2 and R4 share psi, lambda_0, RG - the heaviest edge.
Click R2 and you see its maths and "feeds into: The Laws of Learning". The build is the talk
is the engine - this slide is the literal demonstration of the line on the previous slide.

EMBED / DEGRADATION (build note): the slide ships the STATIC snapshot
(public/figs/conceptric_snapshot.html) so the published deck always renders - server-free,
crisp, KaTeX maths. When presenting locally with the live viewer running
(`python -m laplace.viewer --source canon` or `--source substrate --path <ANF>\workflow\state\
substrate.md --port 8765`), swap the Embed src to "http://localhost:8765" for the fully
interactive graph - descend into a result, climb back, reproject substrate/theory/artefact.
The viewer agent has polished it and added --source canon. A static-export or mp4 of the live
viewer is the open build task so the PUBLISHED deck can be live too. Until then it degrades
gracefully to this snapshot. (Engine: laplace viewer_app.html; SESSION_HANDOFF_conceptric.)
-->

---
layout: center
class: paper text-center
---

# Closure Is Provenance, Not Completion

<div class="turn-quotes">

<div class="turn-quote" v-click>

The frontier never empties. The exogenous and intrinsic doors stay **open**.

</div>

<div class="turn-quote" v-click>

**Consistency** with everything a node touches is the only guard.

</div>

<div class="turn-quote" v-click>

A **contradiction** is the most informative edge you will find.

</div>

</div>

<div class="closing-line" v-click>

A closed loop that never checks itself is not knowledge. [Execution runs top-down. Meaning runs bottom-up.]{.accent}

</div>

<!--
The epistemic spine of the engine, and the honest answer to "is the theory finished?" No - and
"finished" is the wrong target. A learning system is DONE when every node is sourced (nothing
from nowhere), not when the frontier empties - it never does. The guard against a self-
referential system fooling itself is consistency with everything it touches, and the most
valuable thing it can find is a contradiction. This is also the honest frame for the whole talk:
these are draft laws, accountable to their sources, not sealed truths. This deck is itself a
worked example - an AI drafted it, the author is the guard. Tie it to endogeneity from Act 0:
the system that studies learning is inside the loop it studies, so it cannot stand outside and
declare itself done - it can only stay consistent. (Engine: HANDOFF "the spirit" 5-6.)
-->

---
layout: center
class: paper text-center
---

<div class="kicker">Act V — the laws, earned</div>

# The Laws of Learning

<div class="laws">

<div class="law" v-click>

<span class="law-n">I</span> One eigenvalue prices the phases.

$\psi$ for the loop, $\rho(W)$ for your reservoir - fade, compute, or run away. {.law-sub}

</div>

<div class="law" v-click>

<span class="law-n">II</span> Learning is grouping primitives, and depth is renormalisation time.

$L_{\min}\sim\log N$ - the staircase and the stacked reservoir are the same law. {.law-sub}

</div>

<div class="law" v-click>

<span class="law-n">III</span> Evaluation is endogenous - closure is provenance, not completion.

The system that learns is part of what it learns about, so consistency is the only guard. {.law-sub}

</div>

</div>

<!--
The laws, EARNED from what the talk showed, not imported. Law I is the trichotomy plus the
opener rhyme (R2/R3) - one eigenvalue, three fates, and the audience drove it themselves on the
A3 animation. Law II is the depth result plus the turn (R4, and the grouping-primitives model) -
the staircase they watched build. Law III is the engine's epistemic spine, kept LIGHT - the
"endogenous evaluation" generalisation from the synthetics programme, stated plainly, not dressed
in machinery, and tied straight back to the endogeneity arrow from Act 0. Three laws, one per
click. Each one points back at a slide the room has already seen and felt.

Do not over-claim Law III - it is the frame, not a theorem. Caveat (d): the open author sign-offs
(N_0, "phases of hierarchy", UEC) are deliberately NOT here - those are the author's to coin.
(Synthesis of R1-R5 + engine; caveat (d).)
-->

---
layout: center
class: paper text-center
---

# One Number, the Phases of Learning

<div class="eq-hero" v-click>

$$\psi \;\;\text{is to the loop what}\;\; \rho(W) \;\;\text{is to your reservoir.}$$

</div>

<div class="eq-note" v-after>

A locally reasonable rule, summed and fed back over a large system, has phases. One number names them.

</div>

<div class="closing-line text-lg" v-click>

You came in tuning a spectral radius to the edge of chaos. [You leave with the law that edge obeys.]{.accent}

</div>

<div class="kicker" v-click style="margin-top:1.6rem;">gmccaul.co.uk · the build is the talk is the engine</div>

<!--
Close on the callback to Act I - the spectral radius they walked in with, now one face of a law
they can derive AND drove with their own hands. Bring the whole arc home: Act 0 said learning is
an endogenous loop; Act I showed their reservoir is one; Act II built the loop and found the
exponent; Act III showed the exponent prices the phases and the window; Act IV showed the theory
is itself such a loop; and the laws are what is left standing.

The UV-catastrophe / Planck-cutoff framing (Rayleigh-Jeans: a locally correct rule, lethal summed
over modes; Planck: a classifier resolves it) is available as colour HERE if the room is warm and
there is time - it is the original ANF hook, spine Beat 1/18. But caveat (c): it is narrative
colour, NOT load-bearing physics - deploy it as a closing flourish or drop it. The real close is
the rhyme: one number, the phases of learning. End on the terminal line, not a thank-you slide.
-->
