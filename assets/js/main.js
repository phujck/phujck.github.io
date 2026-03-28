/* ============================================
   Gerard McCaul — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar scroll state ----
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });
    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('open'));
    });
  }

  // ---- Scroll-triggered fade-in ----
  const fadeEls = document.querySelectorAll('.fade-in, .stagger-children');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ---- Back to top ----
  const btn = document.querySelector('.back-to-top');
  if (btn) {
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Publication year filters ----
  const filters = document.querySelectorAll('.pub-filter');
  const yearGroups = document.querySelectorAll('.pub-year-group');

  if (filters.length > 0 && yearGroups.length > 0) {
    filters.forEach(filter => {
      filter.addEventListener('click', () => {
        // Update active state
        filters.forEach(f => f.classList.remove('active'));
        filter.classList.add('active');

        const year = filter.dataset.year;

        yearGroups.forEach(group => {
          if (year === 'all' || group.dataset.year === year) {
            group.style.display = '';
          } else {
            group.style.display = 'none';
          }
        });
      });
    });
  }

  // ---- Active nav link based on current page ----
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '') || '/';
    if (currentPath === href || (currentPath.endsWith(href) && href !== '/')) {
      a.classList.add('active');
    }
  });

});
