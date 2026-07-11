/* synthetics.js — the one interaction on the synthetics page: a precision aid.
   The decomposition diagram and the result ladder both read fully at rest with
   this file absent; nothing is revealed by scrolling and nothing animates.
   Hovering or focusing a channel — or an italicised term in the prose — lights
   the prose↔diagram correspondence for that channel, and clears on leave.
   No network references. */
(function () {
  'use strict';

  var diagram = document.getElementById('syn-diagram');
  if (!diagram) return;

  var channels = Array.prototype.slice.call(diagram.querySelectorAll('.syn-channel'));
  var terms = {};
  Array.prototype.forEach.call(
    document.querySelectorAll('.syn-term[data-term]'),
    function (el) { terms[el.getAttribute('data-term')] = el; });

  function clear() {
    channels.forEach(function (c) { c.classList.remove('is-lit'); });
    Object.keys(terms).forEach(function (k) { terms[k].classList.remove('is-lit'); });
  }

  function lite(key) {
    clear();
    channels.forEach(function (c) {
      if (c.getAttribute('data-channel') === key) c.classList.add('is-lit');
    });
    if (terms[key]) terms[key].classList.add('is-lit');
  }

  channels.forEach(function (channel) {
    var key = channel.getAttribute('data-channel');
    channel.setAttribute('tabindex', '0');
    channel.setAttribute('role', 'button');
    channel.addEventListener('mouseenter', function () { lite(key); });
    channel.addEventListener('focus', function () { lite(key); });
    channel.addEventListener('blur', clear);
    channel.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lite(key); }
    });
  });

  Object.keys(terms).forEach(function (key) {
    var el = terms[key];
    el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', function () { lite(key); });
    el.addEventListener('mouseleave', clear);
    el.addEventListener('focus', function () { lite(key); });
    el.addEventListener('blur', clear);
  });

  diagram.addEventListener('mouseleave', clear);
})();
