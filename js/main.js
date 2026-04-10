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

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });

  // Close on nav link click (mobile)
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
  const imgs  = galleryEl.querySelectorAll('img');
  const dots  = galleryEl.querySelectorAll('.gallery-dot');
  const prev  = galleryEl.querySelector('.gallery-btn.prev');
  const next  = galleryEl.querySelector('.gallery-btn.next');
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

  // Touch/swipe
  let startX = 0;
  galleryEl.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  galleryEl.addEventListener('touchend', function (e) {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) show(diff > 0 ? current + 1 : current - 1);
  }, { passive: true });

  // Auto-advance (only for featured gallery)
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
    const offset = 80; // header height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  });
});

/* ---------- Lazy-load images (fallback for older browsers) ---------- */
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
      }
    });
  });
  lazyImages.forEach(function (img) { observer.observe(img); });
}
