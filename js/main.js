/* ============================================================
   Empire Real Estate & Development — Main JS
   ============================================================ */

'use strict';

/* ---------- Mobile Nav Toggle ---------- */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.header-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? '✕' : '☰';
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });

  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });
})();

/* ---------- Active Nav Link ---------- */
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.header-nav a').forEach(function (a) {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ---------- Photo Gallery ---------- */
function initGallery(galleryEl) {
  const imgs = galleryEl.querySelectorAll('img');
  const dots = galleryEl.querySelectorAll('.gallery-dot');
  const prev = galleryEl.querySelector('.gallery-btn.prev');
  const next = galleryEl.querySelector('.gallery-btn.next');
  if (imgs.length <= 1) {
    if (prev) prev.style.display = 'none';
    if (next) next.style.display = 'none';
    return;
  }

  let current = 0;

  function show(idx) {
    imgs[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + imgs.length) % imgs.length;
    imgs[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  if (prev) prev.addEventListener('click', function () { show(current - 1); });
  if (next) next.addEventListener('click', function () { show(current + 1); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { show(i); });
  });

  let startX = 0;
  galleryEl.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  galleryEl.addEventListener('touchend', function (e) {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) show(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  if (galleryEl.classList.contains('apt-gallery-featured')) {
    setInterval(function () { show(current + 1); }, 5000);
  }
}

document.querySelectorAll('.apt-gallery').forEach(initGallery);

/* ---------- Collapsible Amenity Sections ---------- */
document.querySelectorAll('.amenities-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const content = document.getElementById(btn.getAttribute('data-target'));
    if (!content) return;
    const open = content.classList.toggle('open');
    btn.classList.toggle('open', open);
  });
});

/* ---------- Form Handling (Formspree) ---------- */
document.querySelectorAll('form[data-formspree]').forEach(function (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const msg = form.querySelector('.form-message');

    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.reset();
        if (msg) {
          msg.textContent = '✓ Thank you! We\'ll be in touch shortly.';
          msg.className = 'form-message success';
        }
        btn.textContent = 'Sent!';
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (err) {
      if (msg) {
        msg.textContent = 'Something went wrong. Please call us at 570.424.0504.';
        msg.className = 'form-message error';
      }
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });
});

/* ---------- Smooth scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 90;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

/* ============================================================
   ANIMATIONS
   ============================================================ */

/* ---------- Scroll-reveal with staggered cards ---------- */
(function () {
  if (!('IntersectionObserver' in window)) return;

  // Selectors that get the reveal treatment
  const REVEAL_SELECTORS = [
    '.section-heading',
    '.section-subheading',
    '.gold-rule',
    '.feature-card',
    '.photo-feature-card',
    '.apt-card',
    '.apt-card-featured',
    '.lot-card',
    '.home-feature-card',
    '.prev-card',
    '.floor-plan-card',
    '.realtor-info',
    '.contact-sidebar',
    '.footer-brand',
    '.stats-strip .stats-grid > div',
    '.social-links',
    '.locations-list',
  ].join(',');

  // Sets that should stagger (multiple siblings inside a grid/flex parent)
  const STAGGER_PARENTS = [
    '.features-grid',
    '.photo-feature-grid',
    '.apt-grid',
    '.prev-developed-grid',
    '.new-homes-features',
    '.floor-plans',
    '.stats-grid',
    '.social-links',
    '.locations-list',
  ];

  // Mark elements for reveal
  document.querySelectorAll(REVEAL_SELECTORS).forEach(function (el) {
    // Skip elements already in the hero (they animate via CSS keyframes)
    if (el.closest('.hero') || el.closest('.page-hero')) return;
    el.classList.add('reveal');
  });

  // Apply stagger delays to siblings inside stagger parent containers
  STAGGER_PARENTS.forEach(function (parentSel) {
    document.querySelectorAll(parentSel).forEach(function (parent) {
      const children = parent.querySelectorAll('.reveal');
      children.forEach(function (child, i) {
        const delayClass = 'd' + Math.min(i + 1, 6);
        child.classList.add(delayClass);
      });
    });
  });

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
})();

/* ---------- Hero parallax ---------- */
(function () {
  const heroBgs = document.querySelectorAll('.hero-bg');
  if (!heroBgs.length) return;

  // Respect reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    heroBgs.forEach(function (bg) {
      const hero = bg.parentElement;
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      if (scrollY > heroBottom) return; // already past
      const offset = scrollY * 0.38;
      bg.style.transform = 'translateY(' + offset + 'px)';
    });
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();

/* ---------- Stats count-up ---------- */
(function () {
  if (!('IntersectionObserver' in window)) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parse the display value — handles "37+", "200+", "#1", "Monroe", "3", etc.
  function parseTarget(text) {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  }

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCount(el) {
    const original = el.textContent.trim();
    const target   = parseTarget(original);
    if (target === null) return; // non-numeric (e.g. "Monroe", "#1")

    const suffix   = original.replace(/^[\d.]+/, ''); // "+", "/mo", etc.
    const prefix   = original.match(/^[^0-9]*/)[0];   // "#", "$", etc.
    const isFloat  = original.includes('.');
    const duration = 1600;
    const start    = performance.now();

    function step(now) {
      const elapsed  = Math.min(now - start, duration);
      const progress = easeOutQuart(elapsed / duration);
      const current  = target * progress;
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        el.textContent = original; // restore exact original
      }
    }

    requestAnimationFrame(step);
  }

  if (prefersReduced) return;

  const countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(function (el) {
    countObserver.observe(el);
  });
})();
