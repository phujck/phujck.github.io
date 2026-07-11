/* synthetics.js — interaction for the synthetics page. All behaviour is
   additive: the page reads top to bottom with this file absent. The script
   marks the root `.syn-js` so CSS can switch on the enhanced (start-hidden)
   states only when JS is actually running.

   Three behaviours:
     1. decomposition diagram <-> premise term cross-highlighting + factual card
     2. result-ladder reveal on scroll (rail fill + rungs in sequence)
     3. one-shot count-up on the evidence numbers
   No network references. */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('syn-js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1 · the decomposition diagram ---------- */
  (function decomposition() {
    var diagram = document.getElementById('syn-diagram');
    if (!diagram) return;

    var channels = Array.prototype.slice.call(
      diagram.querySelectorAll('.syn-channel'));
    var terms = {};
    Array.prototype.forEach.call(
      document.querySelectorAll('.syn-term[data-term]'),
      function (el) { terms[el.getAttribute('data-term')] = el; });
    var cards = {};
    Array.prototype.forEach.call(
      document.querySelectorAll('.syn-card[data-card]'),
      function (el) { cards[el.getAttribute('data-card')] = el; });
    var hint = document.querySelector('.syn-card-hint');

    function clear() {
      channels.forEach(function (c) { c.classList.remove('is-lit'); });
      Object.keys(terms).forEach(function (k) { terms[k].classList.remove('is-lit'); });
      Object.keys(cards).forEach(function (k) { cards[k].classList.remove('is-shown'); });
    }

    function lite(key) {
      clear();
      channels.forEach(function (c) {
        if (c.getAttribute('data-channel') === key) c.classList.add('is-lit');
      });
      if (terms[key]) terms[key].classList.add('is-lit');
      if (cards[key]) cards[key].classList.add('is-shown');
      if (hint) hint.classList.add('is-hidden');
    }

    channels.forEach(function (channel) {
      var key = channel.getAttribute('data-channel');
      channel.setAttribute('tabindex', '0');
      channel.setAttribute('role', 'button');
      channel.addEventListener('mouseenter', function () { lite(key); });
      channel.addEventListener('focus', function () { lite(key); });
      channel.addEventListener('click', function () { lite(key); });
      channel.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lite(key); }
      });
    });

    /* driving from the prose side too */
    Object.keys(terms).forEach(function (key) {
      terms[key].addEventListener('mouseenter', function () { lite(key); });
      terms[key].setAttribute('tabindex', '0');
      terms[key].addEventListener('focus', function () { lite(key); });
    });

    diagram.addEventListener('mouseleave', clear);
  })();

  /* ---------- 2 · the result ladder reveal ---------- */
  (function ladder() {
    var ladderEl = document.querySelector('.syn-ladder');
    if (!ladderEl) return;
    var rungs = Array.prototype.slice.call(ladderEl.querySelectorAll('.syn-rung'));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      ladderEl.classList.add('is-revealed');
      rungs.forEach(function (r) { r.classList.add('is-in'); });
      return;
    }

    var ladderObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          ladderEl.classList.add('is-revealed');
          obs.disconnect();
        }
      });
    }, { threshold: 0.15 });
    ladderObs.observe(ladderEl);

    var rungObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var i = rungs.indexOf(entry.target);
          entry.target.style.transitionDelay = Math.min(i, 4) * 90 + 'ms';
          entry.target.classList.add('is-in');
          rungObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    rungs.forEach(function (r) { rungObs.observe(r); });
  })();

  /* ---------- 3 · count-up on the evidence numbers ---------- */
  (function countUp() {
    var nums = Array.prototype.slice.call(document.querySelectorAll('.syn-count[data-count]'));
    if (!nums.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) return; // real value already in DOM

    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      var dur = 650, start = null;
      el.textContent = '0';
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      }
      requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 1 });
    nums.forEach(function (n) { obs.observe(n); });
  })();
})();
