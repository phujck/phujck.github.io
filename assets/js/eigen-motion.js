/* Shared motion for every EigenEngine exhibit: one damped spring and one on/off switch.
   Motion runs unless the visitor turns it off with the page's own control; it does not read the system's
   "reduce motion" setting, because the motion is how these pages explain themselves. */
(() => {
  const M = window.EG_MOTION = window.EG_MOTION || { off: (() => { try { return localStorage.getItem('eg-motion') === 'off'; } catch (e) { return false; } })(), rate: 1 };
  class Spring {                                   // value v follows goal g; a short lag on the target keeps the start soft
    constructor(v = 0, k = 170, c = 26.5) { this.v = v; this.t = v; this.g = v; this.s = 0; this.k = k; this.c = c; }
    to(g) { this.g = g; return this; }
    snap(g) { this.v = this.t = this.g = g; this.s = 0; return this; }
    step(dt) {                                     // dt in seconds; returns true while still moving
      if (M.off) { this.v = this.t = this.g; this.s = 0; return false; }
      this.t += (this.g - this.t) * Math.min(1, dt / .075);
      this.s += (this.k * (this.t - this.v) - this.c * this.s) * dt;
      this.v += this.s * dt;
      return Math.abs(this.g - this.v) > 2e-4 || Math.abs(this.s) > 2e-3;
    }
  }
  window.EigenMotion = { M, Spring, smooth: x => x * x * (3 - 2 * x), clamp: (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)) };
})();
