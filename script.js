/* Tavza — lightweight interactions */
const CONFIG = {
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};
const elements = {
  nav: document.querySelector('.nav'),
  navToggle: document.querySelector('.nav-toggle'),
  navLinks: document.querySelector('.nav-links'),
  hero: document.querySelector('.hero'),
  heroOrbs: document.querySelectorAll('.hero-orb'),
  cursorGlow: document.querySelector('.cursor-glow'),
  copyright: document.querySelector('.copyright')
};

function initNavigation() {
  const { nav, navToggle, navLinks } = elements;
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('active', !open);
      document.body.style.overflow = open ? '' : 'hidden';
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    }));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        navToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (nav) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('nav-hidden', y > 140 && y > lastY && !navLinks?.classList.contains('active'));
      nav.style.background = y > 30 ? 'rgba(9,7,17,.96)' : 'rgba(10,10,11,.85)';
      lastY = y;
    }, { passive: true });
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (elements.nav?.offsetHeight || 72);
      window.scrollTo({ top, behavior: CONFIG.reducedMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll('.product, .philosophy-card, .craft-item, .contact-form .form-group, .footer-column');
  if (CONFIG.reducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }), { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  items.forEach((item,index) => {
    item.classList.add('reveal');
    if (index < 4) item.classList.add(`reveal-delay-${index + 1}`);
    observer.observe(item);
  });
}

function initCursorGlow() {
  const glow = elements.cursorGlow;
  if (!glow || CONFIG.reducedMotion || !window.matchMedia('(pointer:fine)').matches) return;
  let x = 0, y = 0, tx = 0, ty = 0, frame;
  document.addEventListener('mousemove', event => { tx = event.clientX; ty = event.clientY; glow.classList.add('active'); }, { passive:true });
  document.addEventListener('mouseleave', () => glow.classList.remove('active'));
  function animate() {
    x += (tx - x) * .12; y += (ty - y) * .12;
    glow.style.transform = `translate(${x - 200}px,${y - 200}px)`;
    frame = requestAnimationFrame(animate);
  }
  animate();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else animate();
  });
}

function initParallax() {
  if (CONFIG.reducedMotion || !elements.hero) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      elements.heroOrbs.forEach((orb,index) => orb.style.transform = `translate3d(0,${y * (index ? -.12 : .16)}px,0)`);
      const content = elements.hero.querySelector('.hero-content');
      if (content) content.style.opacity = String(Math.max(0,1-y/(elements.hero.offsetHeight*.85)));
      ticking = false;
    });
  }, { passive:true });
}

function init() {
  if (elements.copyright) elements.copyright.textContent = `© ${new Date().getFullYear()} Tavza. All rights reserved.`;
  initNavigation();
  initSmoothScroll();
  initReveal();
  initCursorGlow();
  initParallax();
  console.info('Tavza website ready');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
window.Tavza = { init, CONFIG, elements };
