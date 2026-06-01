# The Laws of Learning - derivation spine (step-1 decompression, DRAFT for sign-off)

The motivated, ordered backbone the talk is rebuilt from, and the structure the conceptric graph
is built on. The compressed artefacts stated the results - this restores the connective tissue:
WHY each piece is there and WHERE each equation comes from.

**Discipline.** ANF vocabulary throughout (`theta, h=Pi(theta), m, e_k, chi_N, psi, lambda_0, K_N`).
The Phases-of-Hierarchy lineage is quarantined reference - every result is re-derived here in ANF
terms with provenance noted, its prose and framing not transplanted (the firewall holds).

**Reading order = dependency order.** Each beat rests only on the beats above it. This is the
teaching order, and it is the conceptric graph's edge structure - the graph is this list, drawn.

Each beat: **idea / why (the recovered motivation) / move (the derivation) / provenance / status.**

---

## B0 - The loop, and why it is not optimisation
- **Idea:** an adaptive system is a slow control `theta` that periodically reparametrises the
  constraints a fast population evolves under, then updates from a delayed, coarse measurement of it.
- **Why:** the keystone distinction the artefacts dropped - the slow level does NOT pick an action
  and does NOT set the macro-state. It reparametrises the constraint functional the fast level lives
  under. That one move separates this from passive optimisation and from multi-agent choice.
- **Move:** name the four parts - `theta` (slow control), `h=Pi(theta)` (generated environment), `N`
  fast parts relaxing to `rho_h`, `m=<O>` (coarse, delayed, finite-N measurement).
- **Provenance:** ANF `model.md` §1-2, `02_model.tex`. Motivation recovered from PoH intro (firewalled).
- **Status:** settled.

## B1 - Endogeneity is the one defining feature
- **Idea:** the control reaches the fast scale ONLY through the environment it generates, `h=Pi(theta)`.
  The system cannot step outside the field it is making.
- **Why:** this single arrow (A5) is what makes the loop adaptive rather than driven. Everything
  downstream is its consequence.
- **Provenance:** A5, `model.md` line 18.
- **Status:** settled.

## B2 - The assumptions, as the "this is fine because"
- **Idea:** seven assumptions fix the model, each a justified choice, not a decree.
- **Why:** the talk asserted the model - these are why each piece is fine. A1 scale separation (one
  memory factor `r=e^{-T/tau}`); A2 conditional ergodicity (`rho_h`); A3 coarse noisy measurement
  (scalar `m`, `N^{-1/2}` noise); A4 gradient slow law (a Lyapunov candidate, so ALL non-equilibrium
  behaviour comes from delay + noise, not the slow law); A5 endogeneity; A6 `Gamma`-equivariance
  (kills even nonlinearities, leading term cubic); A7 self-similarity / RG closure (multiscale is
  DEFINED by this closure).
- **Provenance:** `model.md` §3, `02_model.tex` 79-106.
- **Status:** settled. (A4 non-gradient/solenoidal extension parked - see GAPS.)

## B3 - The relaxation time tau
- **Idea:** between updates the fast level relaxes toward its constrained optimum with relaxation
  time `tau`; the memory factor `r=e^{-T/tau}` measures how stale the reading is.
- **Why:** `tau` was never introduced and is crucial. Scalar model `F(x;theta)=(h/2)(x-s theta)^2`
  gives `xdot=-h(x-s theta)`, `tau=1/h`; over interval `T`, `x_{k+1}=r x_k+(1-r)s theta_k`,
  `r=e^{-T/tau}`. `T` large vs `tau` -> `r->0` (equilibrated, fresh read); `T` small -> `r->1` (stale).
- **Provenance:** PoH `06_scalar_model.tex` 11-13 (firewalled, re-derived); ANF A1.
- **Status:** settled. (`tau` is non-universal.)

## B3.5 - See the transition before explaining it (phenomenology first)
- **Idea:** before solving anything, RUN the two-level loop and vary `N` and `tau`. Below threshold
  it settles; above it the order parameter starts to oscillate. The transition appears empirically,
  in the simplest model, with no theory yet.
- **Why:** the motivation the talk never gave - we do not ASSERT a phase transition, we OBSERVE one
  as the two knobs turn, and only then is there something the mathematics must explain. Phenomenon
  first, theory second. It grounds why the whole derivation (B4 onward) is needed.
- **Move:** numerically iterate the two-level loop (the model of B0-B3) over a sweep of `(N, tau)`;
  show settle-vs-ring and the empirical boundary emerging. No new physics - just running the model
  already defined.
- **Asset:** a NEW interactive two-level `(N, tau)` explorer - crank `N` and `tau`, watch the series
  settle or ring, see the boundary appear. Pre-solution phenomenology, distinct from the A3
  viable-window (which is the SOLVED model). Folds into the build as a new applet.
- **Provenance:** simulation of the B0-B3 model; the boundary it reveals is what R1/R3 then explain.
- **Status:** new motivating beat (author, this session). Precedes the solve.

## B4 - Self-consistency gives the return map and the gain. THE FOUNDATION.
- **Idea:** linearise the loop about its self-consistent fixed point and the fast mode eliminates
  exactly, leaving a 1-D return map `e_{k+1}=(r-K_N)e_k` with loop gain `K_N=alpha chi_N g`.
- **Why:** this is where the equations COME FROM - the talk stated the map as given. The fixed point
  FP2 is self-consistent: `m(theta*)=O-hat(theta*)`, the mandate consistent with the statistics it
  induces. The phases are the stability types of FP2.
- **Move (the load-bearing order):** fast relaxes under the OLD field (`h_k=Pi(theta_k)` fixed at
  period start) -> slow updates `theta_{k+1}=theta_k+alpha g e_k` -> new field set. The
  self-consistency relation `d_theta O-hat = chi_N Pi' = g` at FP2 (both derivatives equal `g`) is
  the one non-trivial input. Three-line collapse: `e_{k+1}=r(dm-g dtheta)-alpha g^2 e_k=(r-alpha chi_N g)e_k`.
  The ordered timing is what gives the clean `(r-K_N)` with no `r*alpha` cross-term. Then `Gamma=Z_2`
  forbids the quadratic: `e_{k+1}=(r-K_N)e_k - alpha c_N e_k^3`, `c_N>0`, a supercritical flip.
- **Provenance:** R1_derivation.md (full argument, machine-verified to <1e-13); `03_return_map.tex`.
- **Status:** settled (established, no unresolved steps).

## B5 - The stability condition, and the (tau, N) instability
- **Idea:** stable iff `K_N < K_c = r+1`. The eigenvalue `r-K_N` can only be pushed DOWN, so
  instability is a flip at `r-K_N=-1`, never a blow-up.
- **Why:** this is the echo-state rhyme - the SAME shape of law as `rho(W) <> 1`, a different
  operator. It couples `tau` and `N`: the boundary `K_N=K_c` sets a critical `N_c`, and updating
  faster than the system relaxes ("policy flapping", `T<tau`) sits in the dangerous regime.
- **Move:** flip condition `K_N=K_c=r+1` -> `N_c` from `K_N(N)=r+1`.
- **Provenance:** R3; PoH `06_scalar` (firewalled).
- **Status:** settled, and CHECKED. The chain commits to the exact fast-mode elimination (B4), so the
  object is the 1-D map with eigenvalue `r-K_N`. The upper bound `r-K_N<1` never binds (`K_N>0`), so
  the only boundary is the flip `r-K_N=-1`, i.e. **`K_c=r+1`** - rising with `r`, matching the
  machine-verified R3 (`N_c~816.8`). The PoH Jury form `K_c(T)=2(1+r)/[(1+r)b-(1-r)s]` is the
  UN-reduced 2-mode version - it differs in r-monotonicity because the exact elimination integrates
  out the very mode whose lag carries "policy flapping". So `K_c=r+1` is what is consistent through
  THIS chain. The flapping / destabilise-by-fast-updating story lives only in the 2-mode model and
  must NOT sit on the reduced map - if the (tau,N) slide wants it, that slide keeps both modes.
  Default: reduced, `K_c=r+1`.

## B6 - The sqrt(N) gain: why N amplifies
- **Idea:** `N` fast parts aggregated by majority give a response `chi_N ~ sqrt(N)` - more parts
  sharpen the collective into a high-gain threshold device.
- **Why:** the SEED of the transition. Majority CLT: `R_N(e)~erf(beta e sqrt(N/2))`,
  `chi_N=beta sqrt(2N/pi)`. The tension: more `N` reduces majority noise (Condorcet) AND raises the
  gain (instability) - two sides of one scaling.
- **Provenance:** PoH `05_majority` (firewalled, re-derived); R2. Robustness: correlated beliefs give
  `N_eff -> 1/rho-bar` - the transition can vanish if beliefs are too correlated (flag).
- **Status:** settled (worked corner).

## B7 - Add layers -> decimation -> lambda_0. Depth is RG time.
- **Idea:** stack self-similar majority layers; each multiplies the gain by a fixed factor; iterating
  one decimation operator `R` is the renormalisation flow, eigenvalue `lambda_0=R'(m*)`, exponent
  `psi=log_n lambda_0`.
- **Why (the motivation the talk skipped entirely):** the flat `sqrt(N)` gain is a catastrophe.
  Intervening layers are introduced as a GAIN-ATTENUATION device - each majority layer multiplies the
  small-error gain by `sqrt(2/pi)<1`. Because the layer operation is self-similar, depth = iterating
  one operator -> the RG picture. `chi_{nN}=lambda_0 chi_N` -> `chi_N ~ A N^psi`. `R` acts on the
  response profile, not the microstate.
- **Move:** `m_l(e)=erf(sqrt(n_l/2) m_{l-1}(e))`; `R[m*]=m*`; `lambda_0=R'(m*)`; `psi=log_n lambda_0`.
  Worked: `n=2`, `lambda_0=sqrt2`, `psi=1/2`.
- **Provenance:** PoH `09_hierarchy` (firewalled, re-derived); R2, R4.
- **Status:** settled (STATIC). **CAVEAT:** this is static gain-attenuation only; real layers also add
  dynamic lag that can destabilise - dynamic-hierarchy stability is characterised, not solved (GAP).
  Notation reconcile: postponement is `lambda_0^{L-1}` (ANF) vs `(pi/2)^{L-1}` (PoH).

## B8 - The trichotomy: the sign of psi is the whole classifier
- **Idea:** whether `K_N` grows, holds, or decays with `N` is set by `sign(psi)`: `psi>0` amplifying
  (finite `N_c`, depth required), `psi=0` marginal (self-organised criticality, prefactors decide),
  `psi<0` contracting (unconditional stability).
- **Why:** the fate is written into the RG eigenvalue of the microscopic law - decided before the
  collective is assembled, not by its size. `N_c=((r+1)/alpha g A)^{1/psi}`; finite-size flip,
  supercritical, `sqrt(N-N_c)` onset. Codimension `kappa` (flip / Hopf / pitchfork) selected by `r`.
- **Provenance:** R3; PoH `05_phases`.
- **Status:** settled. **FORKS / caveats:** `N_0` (the gain-zero crossing, still stable) is an unsigned
  symbol - confirm before locking. The period-2 is a fork of the FAST subsystem - in the full loop it
  self-quenches (theta drifts, `K` falls back to `K_c`), so do NOT sell a long-time finite-window
  oscillation. "UEC" vocabulary unsettled.

## B9 - The walls and the viable window: one lambda_0 prices both
- **Idea:** `psi>0` systems escape the size catastrophe by adding depth (`L_min ~ log_{lambda_0} N`),
  but depth has a ceiling - not dynamical (deep loops FREEZE, `rho->1^-`, marginal, never cross) but
  ENERGETIC (reconfiguration energy `E_min=lambda_0^{L-1}`). Viable region: a closed wedge
  `L_min(N) <= L <= Lambda`, apex at the maximal governable size.
- **Why:** depth converts a population catastrophe into a logarithmic requirement. The upper wall is
  the negative result - freeze, not instability - so it must be energetic. The SAME `lambda_0` prices
  both walls: depth buys stability and incurs rigidity in one currency.
- **Provenance:** R4, R5; PoH `07_window`. (PoH splits inertia into 3 penalties; ANF keeps one,
  control energy, as the boundary-carrying term.)
- **Status:** settled (freeze established). **GAP:** R5 energy figure pending final runs.

## B10 - The turn: the loop on itself
- **Idea:** the whole construction is the self-consistent fixed point of a process acting on itself.
  Turn it on the most advanced learning machine we have - the AI - and the harness (the author
  steering the engine to a consistent fixed point) IS that object.
- **Why:** the climax. The build is the talk is the engine, and the conceptric graph is this object
  made visible - live, navigable, true.
- **Provenance:** the engine narrative, and this session.
- **Status:** the talk's turn (Act IV).

---

## Author forks - DO NOT settle (your physics / your call)
- The leading title "the phases of hierarchy" (unsigned in the ANF prose).
- The `N_0` symbol for the gain-zero crossing (unsigned judgement call).
- "UEC" promotion from candidate to earned vocabulary.
- **The K_c reconcile (B5):** `r+1` vs the Jury form - opposite monotonicity in `r`. Needs your call / a fresh check.
- The postponement notation (B7): `lambda_0^{L-1}` vs `(pi/2)^{L-1}`.
- Which provisional colour to deploy: UV-catastrophe/Planck, Condorcet reversal.

## Provisional / firewalled (provenance, not transplant)
All cross-domain mappings (central bank, parliament, cortex, platforms) are STRUCTURAL assignments,
not empirical measurements - `psi` is unmeasured for real domains. Condorcet/List-Goodin, the
UV-catastrophe analogy, and the Radner/Holling readings are borrowed-from-Phases colour, flagged
provisional. Universality is structural: any system meeting A1-A7 is in the class.

## Gaps named (absent even in the papers)
- Non-gradient (solenoidal) slow-law / Hopf route: parked, not derived.
- Dynamic-hierarchy stability (`rho(J_L)<1` with lag + attenuation): characterised, not solved. The
  clean `lambda_0^{L-1}` law is static-only.
- `psi` unmeasured for the real domains.
- R5 energy figure pending final numerical runs.
