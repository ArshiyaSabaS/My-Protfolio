/* ============================================================
   PORTFOLIO — Arshiya Saba
   Contents:
   1. Utilities
   2. Loader
   3. Page navigation system
   4. Wheel / keyboard / touch input
   5. Mobile menu
   6. Certifications slider
   7. Work slider
   8. Footer year
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. UTILITIES ---------- */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- 2. LOADER ---------- */
  const loader = $('#loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('is-hidden'), 1400);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader.classList.add('is-hidden'), 2600);

  /* ---------- 3. PAGE NAVIGATION ---------- */
  const pages   = $$('.page');
  const navBtns = $$('.nav__link[data-goto]');
  const stage   = $('#stage');
  const counter = $('#counter');
  const TOTAL   = pages.length; // 5

  let currentIndex = 0;
  let isAnimating  = false;

  const pad = (n) => String(n).padStart(2, '0');

   function updateNav(index) {
    $$('.nav__link[data-goto]').forEach((btn, i) => {
      btn.classList.toggle('is-active', i === index);
    });
    counter.textContent = `${pad(index + 1)} / ${pad(TOTAL)}`;
    setNavTheme(index);
  }

  // Per-page nav theme — matches the active page's editorial palette
  const NAV_THEMES = [
    { // 0 HOME — deep ink + gold
      bg: '#1A1A17', text: '#EAE3D7',
      muted: '#B7A27A', dot: '#B7A27A',
      divider: 'rgba(234,227,215,0.15)',
      border:  'rgba(234,227,215,0.10)'
    },
    { // 1 ABOUT — deep plum-brown + gold
      bg: '#2B221E', text: '#EAE3D7',
      muted: '#B7A27A', dot: '#B7A27A',
      divider: 'rgba(234,227,215,0.15)',
      border:  'rgba(234,227,215,0.10)'
    },
    { // 2 WORK — deep olive + gold
      bg: '#2A3221', text: '#EAE3D7',
      muted: '#B7A27A', dot: '#B7A27A',
      divider: 'rgba(234,227,215,0.15)',
      border:  'rgba(234,227,215,0.10)'
    },
    { // 3 EXPERIENCE — deep slate + champagne
      bg: '#1C1F25', text: '#EAE3D7',
      muted: '#B7A27A', dot: '#B7A27A',
      divider: 'rgba(234,227,215,0.15)',
      border:  'rgba(234,227,215,0.10)'
    },
    { // 4 CONTACT — deep charcoal + sage
      bg: '#171717', text: '#EAE3D7',
      muted: '#A7AE98', dot: '#A7AE98',
      divider: 'rgba(234,227,215,0.15)',
      border:  'rgba(234,227,215,0.10)'
    }
  ];

  function setNavTheme(index) {
    const t = NAV_THEMES[index];
    if (!t) return;
    const root = document.documentElement.style;
    root.setProperty('--nav-bg', t.bg);
    root.setProperty('--nav-text', t.text);
    root.setProperty('--nav-muted', t.muted);
    root.setProperty('--nav-dot', t.dot);
    root.setProperty('--nav-divider', t.divider);
    root.setProperty('--nav-border', t.border);
  }

  function goTo(index, direction) {
    if (isAnimating) return;
    if (index < 0 || index >= TOTAL) return;
    if (index === currentIndex) return;

    isAnimating = true;

    const dir = direction || (index > currentIndex ? 'forward' : 'backward');
    const outPage = pages[currentIndex];
    const inPage  = pages[index];

    // Reset incoming page to the correct starting side
    inPage.style.transition = 'none';
    inPage.style.transform  = dir === 'forward' ? 'translateX(100%) scale(0.97)' : 'translateX(-100%) scale(0.97)';
    inPage.style.opacity    = '0';
    inPage.style.visibility = 'visible';
    // Force reflow so the reset takes effect before we animate
    void inPage.offsetWidth;
    inPage.style.transition = '';
    inPage.style.transform  = '';
    inPage.style.opacity    = '';
    inPage.style.visibility = '';

    // Kick out the outgoing page
    outPage.classList.remove('is-active');
    outPage.classList.add(dir === 'forward' ? 'is-leaving-left' : 'is-leaving-right');

    // Bring in the new page
    requestAnimationFrame(() => {
      inPage.classList.add('is-active');
    });

    // Cleanup after transition
    setTimeout(() => {
      outPage.classList.remove('is-leaving-left', 'is-leaving-right');
      // Reset slider scroll positions when leaving Work
      if (currentIndex === 2) resetWorkSlider();
      currentIndex = index;
      updateNav(currentIndex);
      isAnimating = false;
    }, 950);
  }

  // Click navigation (sidebar + in-page CTAs)
  $$('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-goto'), 10);
      if (isNaN(idx)) return;
      // Close mobile menu if open
      closeMenu();
      goTo(idx);
    });
  });

  // Brand link
  const brand = $('.brand');
  if (brand) brand.addEventListener('click', (e) => { e.preventDefault(); goTo(0); });

  /* ---------- 4. WHEEL / KEYBOARD / TOUCH ---------- */
  const WHEEL_THROTTLE = 1100;
  let lastWheel = 0;

  window.addEventListener('wheel', (e) => {
    const now = Date.now();
    if (now - lastWheel < WHEEL_THROTTLE) return;
    if (isAnimating) return;

    const target = e.target;
    const inScrollable = target.closest('.page__inner, .certs__track');
    // If inner content can scroll further, let it scroll
    if (inScrollable && inScrollable.scrollHeight > inScrollable.clientHeight) {
      const atTop = inScrollable.scrollTop <= 0;
      const atBottom = inScrollable.scrollTop + inScrollable.clientHeight >= inScrollable.scrollHeight - 1;
      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }

    lastWheel = now;
    if (e.deltaY > 0) goTo(currentIndex + 1, 'forward');
    else              goTo(currentIndex - 1, 'backward');
  }, { passive: true });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(currentIndex + 1, 'forward'); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goTo(currentIndex - 1, 'backward'); }
    if (e.key === 'Escape') closeMenu();
  });

  // Touch swipe
  let touchStartX = 0, touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goTo(currentIndex + 1, 'forward');
    else        goTo(currentIndex - 1, 'backward');
  }, { passive: true });

  /* ---------- 5. MOBILE MENU ---------- */
  const menuToggle = $('#menuToggle');
  const nav        = $('#nav');

  function openMenu() {
    nav.classList.add('is-open');
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  menuToggle.addEventListener('click', () => {
    nav.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* ---------- 6. CERTIFICATIONS SLIDER ---------- */
  const certsTrack = $('#certsTrack');
  const certsPrev  = $('#certsPrev');
  const certsNext  = $('#certsNext');

  function slideCerts(dir) {
    const card = certsTrack.querySelector('.cert');
    if (!card) return;
    const step = card.offsetWidth + 18; // card + gap
    certsTrack.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  certsPrev.addEventListener('click', () => slideCerts(-1));
  certsNext.addEventListener('click', () => slideCerts(1));

  /* ---------- 7. WORK SLIDER ---------- */
  const workTrack = $('#workTrack');
  const workPrev  = $('#workPrev');
  const workNext  = $('#workNext');
  const workDots  = $$('#workDots .dot');
  const workTotal = $$('.project').length;
  let workIndex   = 0;

  function updateWork() {
    workTrack.style.transform = `translateX(-${workIndex * 100}%)`;
    workDots.forEach((d, i) => d.classList.toggle('is-active', i === workIndex));
  }
  function resetWorkSlider() {
    workIndex = 0;
    updateWork();
  }
  workNext.addEventListener('click', () => {
    workIndex = (workIndex + 1) % workTotal;
    updateWork();
  });
  workPrev.addEventListener('click', () => {
    workIndex = (workIndex - 1 + workTotal) % workTotal;
    updateWork();
  });

  /* ---------- 8. FOOTER YEAR ---------- */
  const year = new Date().getFullYear();
  $$('.year').forEach(el => el.textContent = year);

  /* ---------- INIT ---------- */
  updateNav(0);
  updateWork();
});