(function () {
  'use strict';

  // ── Scroll Reveal
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ── Nav background on scroll
  var nav = document.getElementById('site-nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.style.background = window.scrollY > 60
        ? 'rgba(237,233,224,0.97)'
        : 'rgba(237,233,224,0.92)';
    }, { passive: true });
  }

  // ── Mobile hamburger
  var hamburger = document.getElementById('nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { document.body.classList.remove('nav-open'); hamburger.setAttribute('aria-expanded', 'false'); }
    });
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); hamburger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ── Practice area accordion
  document.querySelectorAll('.pa-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.pa-card');
      var open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      // CSS rotation on .pa-toggle-icon handles the visual +→× change
    });
  });

  // ── Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        var offset = nav ? nav.offsetHeight : 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });

})();
