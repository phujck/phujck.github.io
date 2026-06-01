# Substrate: The Laws of Learning (the derivation spine, drawn)

<!-- The talk's OWN conceptric graph. It is the DERIVATION_SPINE made navigable:
     nodes are the 11 beats B0-B10 and their key objects, edges are the "rests on"
     dependencies. Reading order = dependency order = the graph's edge structure.

     Form follows the ANF substrate the laplace viewer already renders. The three
     coarse roots are the OUTSIDE DOORS the build is sourced through, exactly as in
     ANF:
       - endogenous  = what the talk posits from within (the loop, the seven
                       assumptions, the objects they commit to: theta, h, m, e_k).
       - exogenous   = the firewalled Phases-of-Hierarchy lineage and its borrowed
                       colour - provenance, re-derived in ANF terms, never transplanted.
       - intrinsic   = the model's own machinery it leans on (RG/decimation,
                       stability, the flip bifurcation, self-consistency).
     The beats that DERIVE a result (B4-B10) are `kind:result` nodes; each `draws`
     the beats and objects above it - that draws-edge IS the "rests on" relation.
     A coarse node stands in for its interior; the viewer zooms it open.

     LAUNCH (local, clickable):
       python -m laplace.viewer --source substrate \
         --path C:\Users\gerar\VScodeProjects\phujck.github.io\talks\laws-of-learning\conceptric-source.md \
         --port 8766
       -> http://localhost:8766

     This is graph (1) of the Act IV / slide-31 close. The other two slot in as
     SEPARATE viewer sources, no renderer change:
       (2) the engine WIKI, name-only:  python -m laplace.viewer --source canon
       (3) the SKILL layer: already built, public/viz/engine-facsimile.html
     Three live graphs, one viewer. See the note at the foot of this file. -->

## endogenous | What the talk posits: the loop and its parts
summary: The keystone the artefacts dropped. The slow control does not pick an action and does not set the macro-state - it reparametrises the constraint functional the fast level lives under. That one move (and the seven assumptions that fix it) separates this from optimisation and from multi-agent choice. The objects here are committed to from within; their motivation is recovered from the firewalled PoH intro.
- object #theta: theta - the slow control, periodically reparametrising the constraints | draws: endogeneity
- object #field_h: h = Pi(theta) - the environment the control generates (the one arrow that closes the loop)
- object #measure_m: m = <O> - the coarse, delayed, finite-N measurement of the fast population
- assumption #scale_sep: A1 scale separation - one memory factor r = e^{-T/tau}
- assumption #ergodicity: A2 conditional ergodicity - the fast level relaxes to rho_h
- assumption #coarse_meas: A3 coarse noisy measurement - scalar m, N^{-1/2} noise
- assumption #gradient_law: A4 gradient slow law - a Lyapunov candidate, so all non-equilibrium behaviour comes from delay and noise, not the slow law
- assumption #endogeneity: A5 endogeneity - the control reaches the fast scale ONLY through h = Pi(theta)
- assumption #equivariance: A6 Gamma-equivariance - kills the even nonlinearities, leading term cubic
- assumption #rg_closure: A7 self-similarity / RG closure - multiscale is DEFINED by this closure

## exogenous | The firewalled lineage: provenance, not transplant
summary: The Phases-of-Hierarchy ancestry and its borrowed colour. Every result downstream is RE-DERIVED in ANF terms with provenance noted - the prose and framing are quarantined, the firewall holds. All cross-domain mappings (bank, parliament, cortex, platform) are structural assignments, not measurements - psi is unmeasured for real domains. Universality is structural: any system meeting A1-A7 is in the class.
- knowledge #poh_scalar: PoH 06_scalar_model - the scalar relaxation and the Jury stability form (re-derived)
- knowledge #poh_majority: PoH 05_majority - the majority-CLT response (re-derived)
- knowledge #poh_hierarchy: PoH 09_hierarchy - the decimation / depth construction (re-derived)
- knowledge #poh_window: PoH 07_window - the viable window and its energetic ceiling (re-derived)
- knowledge #condorcet: Condorcet reversal - aggregation noise vs gain (borrowed colour, provisional)
- knowledge #uv_catastrophe: the UV-catastrophe / Planck reading (borrowed colour, provisional)

## intrinsic | The machinery the model leans on
summary: What the model simply knows and uses, surfaced so the reasoning traces back rather than being taken on trust. Self-consistency is the load-bearing one - the whole return map and the gain are defined through it.
- intrinsic #self_consistency: self-consistency - the mandate consistent with the statistics it induces (the FP2 fixed point)
- intrinsic #stability: linear stability of a fixed point and the eigenvalue criterion
- intrinsic #flip: the flip (period-doubling) bifurcation and the sqrt(N - N_c) branch
- intrinsic #rg: renormalisation group - decimation, block-spin coarse-graining, the self-similar fixed point
- intrinsic #clt: the central-limit / majority aggregation that turns N parts into a response

## B0 | B0 - The loop, and why it is not optimisation | kind:result | source:author | link:linked
summary: An adaptive system is a slow control theta that periodically reparametrises the constraints a fast population evolves under, then updates from a delayed coarse measurement of it. Name the four parts - theta (slow control), h = Pi(theta) (generated environment), N fast parts relaxing to rho_h, m = <O> (coarse delayed finite-N measurement). The slow level does NOT pick an action and does NOT set the macro-state. Provenance: ANF model.md 1-2, 02_model.tex. Status: settled.
draws: theta, field_h, measure_m

## B1 | B1 - Endogeneity is the one defining feature | kind:result | source:author | link:linked
summary: The control reaches the fast scale ONLY through the environment it generates, h = Pi(theta). The system cannot step outside the field it is making. This single arrow (A5) is what makes the loop adaptive rather than driven - everything downstream is its consequence. Provenance: A5, model.md line 18. Status: settled.
draws: B0, endogeneity

## B2 | B2 - The assumptions, as the "this is fine because" | kind:result | source:author | link:linked
summary: Seven assumptions fix the model, each a justified choice not a decree. A1 scale separation; A2 conditional ergodicity; A3 coarse noisy measurement; A4 gradient slow law (so ALL non-equilibrium behaviour comes from delay + noise, not the slow law); A5 endogeneity; A6 Gamma-equivariance (cubic leading term); A7 self-similarity / RG closure (multiscale is DEFINED by this). Provenance: model.md 3, 02_model.tex 79-106. Status: settled (A4 solenoidal extension parked).
draws: B1, scale_sep, ergodicity, coarse_meas, gradient_law, endogeneity, equivariance, rg_closure

## B3 | B3 - The relaxation time tau | kind:result | source:author | link:linked
summary: Between updates the fast level relaxes toward its constrained optimum with relaxation time tau; the memory factor r = e^{-T/tau} measures how stale the reading is. Scalar model F(x;theta)=(h/2)(x - s theta)^2 gives xdot=-h(x - s theta), tau=1/h; over interval T, x_{k+1}=r x_k+(1-r) s theta_k. T large vs tau -> r->0 (fresh read); T small -> r->1 (stale). Provenance: PoH 06_scalar (re-derived), ANF A1. Status: settled (tau is non-universal).
draws: B2, scale_sep, poh_scalar
- object #tau: tau - the fast relaxation time, tau = 1/h in the scalar model
- object #memory_r: r = e^{-T/tau} - the memory factor, how stale the reading is

## B3p5 | B3.5 - See the transition before explaining it (phenomenology first) | kind:result | source:author | link:linked
summary: Before solving anything, RUN the two-level loop and vary N and tau - below threshold it settles, above it the order parameter rings. The transition appears EMPIRICALLY, in the simplest model, with no theory yet. We do not ASSERT a phase transition, we OBSERVE one as the two knobs turn - only then is there something the mathematics must explain. Phenomenon first, theory second. Grounds why the whole derivation (B4 onward) is needed. Provenance: simulation of the B0-B3 model - the boundary it reveals is what B4/B8 explain. Status: new motivating beat (author, this session).
draws: B3, tau, memory_r
- object #two_level_explorer: the two-level (N, tau) phenomenology explorer - crank the knobs, watch settle vs ring, the boundary emerges (public/viz/two-level-phenomenology.html)

## B4 | B4 - Self-consistency gives the return map and the gain. THE FOUNDATION. | kind:result | source:author | link:linked
summary: Linearise the loop about its self-consistent fixed point FP2 and the fast mode eliminates EXACTLY, leaving a 1-D return map e_{k+1}=(r - K_N) e_k with loop gain K_N = alpha chi_N g. This is where the equations COME FROM. FP2 is self-consistent: m(theta*) = O-hat(theta*). Load-bearing order: fast relaxes under the OLD field -> slow updates theta_{k+1}=theta_k+alpha g e_k -> new field set. The relation d_theta O-hat = chi_N Pi' = g at FP2 is the one non-trivial input. Three-line collapse: e_{k+1}=r(dm - g dtheta) - alpha g^2 e_k=(r - alpha chi_N g) e_k. The ordered timing gives the clean (r - K_N) with no r*alpha cross-term. Then Gamma=Z_2 forbids the quadratic: e_{k+1}=(r - K_N) e_k - alpha c_N e_k^3, c_N>0, a supercritical flip. Provenance: R1_derivation.md (machine-verified <1e-13), 03_return_map.tex. Status: settled.
draws: B3p5, self_consistency, equivariance, tau, memory_r
- object #fixed_point: FP2 - the self-consistent fixed point, m(theta*) = O-hat(theta*)
- equation #eq_returnmap: e_{k+1} = (r - K_N)\,e_k - \alpha\,c_N\,e_k^{3} + \cdots
- equation #eq_gain: K_N = \alpha\,\chi_N\,g
- object #error_e: e_k - the error coordinate, the 1-D return-map state after exact fast-mode elimination

## B5 | B5 - The stability condition, and the (tau, N) instability | kind:result | source:author | link:linked
summary: Stable iff K_N < K_c = r + 1. The eigenvalue r - K_N can only be pushed DOWN (K_N>0), so the upper bound r - K_N < 1 never binds - instability is a flip at r - K_N = -1, never a blow-up. This is the echo-state rhyme: the SAME shape of law as rho(W) <> 1, a different operator. It couples tau and N: the boundary K_N = K_c sets a critical N_c, and updating faster than the system relaxes (policy flapping, T<tau) sits in the dangerous regime. K_c = r+1 rises with r, matching machine-verified R3 (N_c~816.8). The PoH Jury form is the UN-reduced 2-mode version - the flapping story lives only there and must NOT sit on the reduced map. Default: reduced, K_c = r+1. Provenance: R3, PoH 06_scalar. Status: settled, CHECKED.
draws: B4, stability, eq_gain, error_e
- equation #eq_Kc: K_c = r + 1
- object #flip_boundary: the flip boundary r - K_N = -1 - the only instability the reduced map admits

## B6 | B6 - The sqrt(N) gain: why N amplifies | kind:result | source:author | link:linked
summary: N fast parts aggregated by majority give a response chi_N ~ sqrt(N) - more parts sharpen the collective into a high-gain threshold device. The SEED of the transition. Majority CLT: R_N(e) ~ erf(beta e sqrt(N/2)), chi_N = beta sqrt(2N/pi). The tension: more N reduces majority noise (Condorcet) AND raises the gain (instability) - two sides of one scaling. Robustness: correlated beliefs give N_eff -> 1/rho-bar - the transition can vanish if beliefs are too correlated (flag). Provenance: PoH 05_majority (re-derived), R2. Status: settled (worked corner).
draws: B5, clt, poh_majority, condorcet
- definition #chi_N: chi_N - the order-parameter susceptibility, chi_N = beta sqrt(2N/pi) at the corner
- equation #eq_chiN: \chi_N \sim \beta\sqrt{2N/\pi}

## B7 | B7 - Add layers -> decimation -> lambda_0. Depth is RG time. | kind:result | source:author | link:linked
summary: The flat sqrt(N) gain is a catastrophe. Intervening layers are introduced as a GAIN-ATTENUATION device - each majority layer multiplies the small-error gain by sqrt(2/pi)<1. Because the layer operation is self-similar, depth = iterating one decimation operator R -> the renormalisation flow, eigenvalue lambda_0 = R'(m*), exponent psi = log_n lambda_0. chi_{nN} = lambda_0 chi_N -> chi_N ~ A N^psi. R acts on the response profile, not the microstate. Worked: n=2, lambda_0=sqrt2, psi=1/2. Provenance: PoH 09_hierarchy (re-derived), R2, R4. Status: settled (STATIC). CAVEAT: static gain-attenuation only; real layers add dynamic lag that can destabilise - dynamic-hierarchy stability characterised, not solved (GAP).
draws: B6, rg, poh_hierarchy, chi_N
- definition #lambda0: lambda_0 = R'(m*) - the decimation eigenvalue at the self-similar fixed point
- definition #psi: psi = log_n lambda_0 - the susceptibility exponent
- equation #eq_decimation: m_l(e)=\mathrm{erf}\!\left(\sqrt{n_l/2}\,m_{l-1}(e)\right),\quad R[m^{*}]=m^{*}
- equation #eq_powerlaw: \chi_N \sim A\,N^{\psi},\quad \psi=\log_n \lambda_0

## B8 | B8 - The trichotomy: the sign of psi is the whole classifier | kind:result | source:author | link:linked
summary: Whether K_N grows, holds, or decays with N is set by sign(psi): psi>0 amplifying (finite N_c, depth required), psi=0 marginal (self-organised criticality, prefactors decide), psi<0 contracting (unconditional stability). The fate is written into the RG eigenvalue of the MICROSCOPIC law - decided before the collective is assembled, not by its size. N_c = ((r+1)/alpha g A)^{1/psi}; finite-size flip, supercritical, sqrt(N - N_c) onset. Codimension kappa (flip/Hopf/pitchfork) selected by r. Provenance: R3, PoH 05_phases. Status: settled. FORKS: N_0 (gain-zero crossing) unsigned; the period-2 self-quenches in the full loop (do NOT sell a long-time oscillation); "UEC" vocabulary unsettled.
draws: B7, psi, flip, eq_Kc
- object #trichotomy: the trichotomy - sign(psi) sorts every system into amplifying / marginal / contracting
- definition #Nc: N_c = ((r+1)/(alpha g A))^{1/psi} - the finite critical size where the flip bites
- equation #eq_Nc: N_c \sim \left(\dfrac{r+1}{\alpha\,g\,A}\right)^{1/\psi}

## B9 | B9 - The walls and the viable window: one lambda_0 prices both | kind:result | source:author | link:linked
summary: psi>0 systems escape the size catastrophe by adding depth (L_min ~ log_{lambda_0} N), but depth has a ceiling - not dynamical (deep loops FREEZE, rho->1^-, marginal, never cross) but ENERGETIC (reconfiguration energy E_min = lambda_0^{L-1}). Viable region: a closed wedge L_min(N) <= L <= Lambda, apex at the maximal governable size. Depth converts a population catastrophe into a logarithmic requirement. The upper wall is the negative result - freeze, not instability - so it must be energetic. The SAME lambda_0 prices both walls: depth buys stability and incurs rigidity in one currency. Provenance: R4, R5, PoH 07_window. Status: settled (freeze established). GAP: R5 energy figure pending final runs.
draws: B8, lambda0, Nc, poh_window, uv_catastrophe
consistency: B8 | supports | the lower wall L_min uses the SAME lambda_0 (via N_c and psi) that B8's classifier turns on
- object #lower_wall: the lower wall - minimum depth L_min(N) ~ log_{lambda_0} N to postpone the flip
- object #upper_wall: the upper wall - deep loops FREEZE (rho->1^-), an energetic ceiling Lambda, not a dynamical one
- equation #eq_window: L_{\min}(N) \;\le\; L \;\le\; \Lambda
- equation #eq_Emin: \mathcal{E}_{\min}(L) = \lambda_0^{\,L-1}

## B10 | B10 - The turn: the loop on itself | kind:result | source:author | link:linked
summary: The whole construction is the self-consistent fixed point of a process acting on itself. Turn it on the most advanced learning machine we have - the AI - and the harness (the author steering the engine to a consistent fixed point) IS that object. The climax: the build is the talk is the engine, and THIS conceptric graph is that object made visible - live, navigable, true. The close shows three real graphs: this one (the talk), the engine WIKI name-only, and the SKILL layer. Provenance: the engine narrative, and this session. Status: the talk's turn (Act IV).
draws: B9, self_consistency, rg_closure
consistency: B4 | supports | the turn is B4's self-consistent-fixed-point move applied to the engine that built the talk

<!-- ============================================================================
     THE THREE-GRAPH CLOSE (Act IV / slide 31). One viewer, three sources, no
     renderer change - each is `python -m laplace.viewer` pointed somewhere else:

     (1) THE TALK'S OWN GRAPH  (this file) - the derivation spine, drawn.
         python -m laplace.viewer --source substrate \
           --path C:\Users\gerar\VScodeProjects\phujck.github.io\talks\laws-of-learning\conceptric-source.md
         The Act IV climax: live, navigable, TRUE - not the static facsimile.

     (2) THE ENGINE WIKI, NAME-ONLY  (all nodes of the live canon).
         python -m laplace.viewer --source canon
         The viewer's default source renders the whole canon scale-local; coarse
         nodes stand in for their clusters (voice_corpus, domains, skills...).
         This is the "many nodes of the wiki" graph, read straight from the
         live engine - accurate by construction, no snapshot.

     (3) THE SKILL LAYER  (already built, ships in the deck).
         public/viz/engine-facsimile.html - the 38 skills by activity. A separate
         slide, embedded as-is. The facsimile is honest HERE (it IS the skill
         layer, name-only by design) - what slide 31 forbids is the facsimile
         standing in for the LIVE engine graph, which (1) and (2) now supply.
     ============================================================================ -->
