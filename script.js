/* ==========================================================================
   AURUM & LUMEN — Premium Product Showcase JavaScript
   ========================================================================== */

// --- Configuration ---
const CONFIG = {
    cursorGlow: { enabled: true, size: 400 },
    scrollReveal: { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    parallax: { enabled: true, intensity: 0.3 },
    nav: { hideOnScroll: true, threshold: 100 },
    particles: { enabled: true, count: 30 },
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

// --- State ---
const state = {
    cursor: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scrollY: 0,
    lastScrollY: 0,
    navVisible: true,
    particles: [],
    animationId: null
};

// --- DOM Elements ---
const elements = {
    cursorGlow: document.querySelector('.cursor-glow'),
    nav: document.querySelector('.nav'),
    navToggle: document.querySelector('.nav-toggle'),
    navLinks: document.querySelector('.nav-links'),
    hero: document.querySelector('.hero'),
    heroOrbs: document.querySelectorAll('.hero-orb'),
    productSections: document.querySelectorAll('.product'),
    visualCores: document.querySelectorAll('.visual-core'),
    visualRings: document.querySelectorAll('.visual-ring'),
    revealElements: document.querySelectorAll('.reveal, .product, .philosophy-card, .craft-item'),
    contactForm: document.querySelector('.contact-form'),
    footerYear: document.querySelector('.copyright')
};

// --- Utility Functions ---
const lerp = (start, end, factor) => start + (end - start) * factor;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const throttle = (fn, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

// --- Cursor Glow ---
function initCursorGlow() {
    if (!CONFIG.cursorGlow.enabled || CONFIG.reducedMotion) return;

    const glow = elements.cursorGlow;
    if (!glow) return;

    document.addEventListener('mousemove', (e) => {
        state.cursor.targetX = e.clientX;
        state.cursor.targetY = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseenter', () => glow.classList.add('active'));
    document.addEventListener('mouseleave', () => glow.classList.remove('active'));

    function animateGlow() {
        state.cursor.x = lerp(state.cursor.x, state.cursor.targetX, 0.15);
        state.cursor.y = lerp(state.cursor.y, state.cursor.targetY, 0.15);

        glow.style.transform = `translate(${state.cursor.x - CONFIG.cursorGlow.size / 2}px, ${state.cursor.y - CONFIG.cursorGlow.size / 2}px)`;

        state.animationId = requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

// --- Navigation ---
function initNavigation() {
    const { nav, navToggle, navLinks } = elements;
    if (!nav || !navToggle || !navLinks) return;

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
        document.body.style.overflow = isExpanded ? '' : 'hidden';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Scroll behavior
    if (CONFIG.nav.hideOnScroll) {
        const handleScroll = throttle(() => {
            state.scrollY = window.scrollY;
            const shouldHide = state.scrollY > CONFIG.nav.threshold && state.scrollY > state.lastScrollY;
            const atTop = state.scrollY <= CONFIG.nav.threshold;

            if (atTop || state.scrollY < state.lastScrollY) {
                nav.classList.remove('nav-hidden');
                state.navVisible = true;
            } else if (shouldHide && state.navVisible) {
                nav.classList.add('nav-hidden');
                state.navVisible = false;
            }

            // Update background opacity based on scroll
            const opacity = clamp(state.scrollY / 200, 0, 1);
            nav.style.background = `rgba(10, 10, 11, ${0.85 + opacity * 0.1})`;
            nav.style.borderBottomColor = `rgba(39, 39, 42, ${clamp(opacity * 2, 0, 1)})`;

            state.lastScrollY = state.scrollY;
        }, 16);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinksItems = navLinks.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinksItems.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

// --- Hero Parallax ---
function initHeroParallax() {
    if (!CONFIG.parallax.enabled || CONFIG.reducedMotion) return;

    const { hero, heroOrbs } = elements;
    if (!hero) return;

    const handleScroll = throttle(() => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        const progress = clamp(scrollY / heroHeight, 0, 1);

        heroOrbs.forEach((orb, index) => {
            const speed = (index === 0 ? 0.3 : -0.2) * CONFIG.parallax.intensity;
            const y = scrollY * speed;
            orb.style.transform = `translate3d(0, ${y}px, 0)`;
        });

        // Fade hero content
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = 1 - progress * 1.5;
            heroContent.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
        }
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// --- Scroll Reveal ---
function initScrollReveal() {
    if (CONFIG.reducedMotion) {
        elements.revealElements.forEach(el => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, CONFIG.scrollReveal);

    // Add reveal classes to elements
    const revealSelectors = [
        '.product',
        '.philosophy-card',
        '.craft-item',
        '.contact-form .form-group',
        '.footer-column'
    ];

    revealSelectors.forEach((selector, index) => {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('reveal');
            if (i < 4) el.classList.add(`reveal-delay-${i + 1}`);
        });
    });

    elements.revealElements.forEach(el => observer.observe(el));
}

// --- Product Visual Interactions ---
function initProductInteractions() {
    if (CONFIG.reducedMotion) return;

    const visualCores = elements.visualCores;
    const productSections = elements.productSections;

    productSections.forEach((section, sectionIndex) => {
        const core = section.querySelector('.visual-core');
        const rings = section.querySelectorAll('.visual-ring');
        const frame = section.querySelector('.media-frame');

        if (!core || !frame) return;

        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        let isHovering = false;

        frame.addEventListener('mousemove', (e) => {
            const rect = frame.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            isHovering = true;
        });

        frame.addEventListener('mouseleave', () => {
            isHovering = false;
            mouseX = 0;
            mouseY = 0;
        });

        function animateCore() {
            currentX = lerp(currentX, isHovering ? mouseX * 8 : 0, 0.08);
            currentY = lerp(currentY, isHovering ? mouseY * 8 : 0, 0.08);

            core.style.transform = `translate(${currentX}px, ${currentY}px)`;

            rings.forEach((ring, i) => {
                const factor = (i + 1) * 0.5;
                ring.style.transform = `translate(${currentX * factor}px, ${currentY * factor}px)`;
            });

            requestAnimationFrame(animateCore);
        }

        animateCore();
    });
}

// --- Particle System ---
function initParticles() {
    if (!CONFIG.particles.enabled || CONFIG.reducedMotion) return;

    const productSections = elements.productSections;

    productSections.forEach(section => {
        const container = section.querySelector('.product-particles');
        if (!container) return;

        const isPurple = section.classList.contains('product-purple');
        const particleCount = CONFIG.particles.count;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                border-radius: 50%;
                background: ${isPurple ?
                    `rgba(${Math.random() > 0.5 ? '168, 85, 247' : '192, 132, 252'}, ${Math.random() * 0.5 + 0.2})` :
                    `rgba(${Math.random() > 0.5 ? '139, 92, 246' : '167, 139, 250'}, ${Math.random() * 0.5 + 0.2})`};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                pointer-events: none;
                animation: particle-drift ${20 + Math.random() * 30}s linear infinite;
                animation-delay: ${Math.random() * -50}s;
            `;
            container.appendChild(particle);
            state.particles.push(particle);
        }
    });

    // Add particle animation keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particle-drift {
            0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate3d(${Math.random() * 100 - 50}px, ${Math.random() * -100 - 50}px, 0) scale(1.5); opacity: 1; }
            50% { transform: translate3d(${Math.random() * -100 - 50}px, ${Math.random() * 100 - 50}px, 0) scale(0.5); opacity: 0.2; }
            75% { transform: translate3d(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px, 0) scale(1); opacity: 0.6; }
            100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
}

// --- Smooth Scroll ---
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const navHeight = elements.nav?.offsetHeight || 72;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without scrolling
            history.pushState(null, '', targetId);
        });
    });
}

// --- Contact Form ---
function initContactForm() {
    const form = elements.contactForm;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.form-submit');
        const originalText = submitBtn.querySelector('.submit-text').textContent;

        // Validate
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) return;

        // Submit simulation
        submitBtn.disabled = true;
        submitBtn.querySelector('.submit-text').textContent = 'Sending...';

        await new Promise(resolve => setTimeout(resolve, 1500));

        submitBtn.querySelector('.submit-text').textContent = 'Request Sent';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.querySelector('.submit-text').textContent = originalText;
            submitBtn.style.background = '';
        }, 3000);
    });

    // Real-time validation feedback
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required')) {
                field.style.borderColor = field.value.trim() ? '' : '#ef4444';
            }
        });

        field.addEventListener('input', () => {
            if (field.style.borderColor === 'rgb(239, 68, 68)') {
                field.style.borderColor = '';
            }
        });
    });
}

// --- Scroll Progress Indicator ---
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--color-purple), var(--color-violet));
        z-index: ${1000};
        transform-origin: left;
        transform: scaleX(0);
        pointer-events: none;
    `;
    document.body.appendChild(progressBar);

    const handleScroll = throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = clamp(scrollTop / docHeight, 0, 1);
        progressBar.style.transform = `scaleX(${progress})`;
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
}

// --- Text Reveal Animation ---
function initTextReveal() {
    if (CONFIG.reducedMotion) return;

    const textElements = document.querySelectorAll('.hero-title, .section-title .title-main, .product-name');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                const words = text.split(' ');

                if (words.length > 1) {
                    element.innerHTML = words.map((word, i) =>
                        `<span style="display: inline-block; opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: ${i * 80}ms;">${word}</span>`
                    ).join(' ');

                    requestAnimationFrame(() => {
                        element.querySelectorAll('span').forEach(span => {
                            span.style.opacity = '1';
                            span.style.transform = 'translateY(0)';
                        });
                    });
                }

                observer.unobserve(element);
            }
        });
    }, { threshold: 0.5 });

    textElements.forEach(el => observer.observe(el));
}

// --- Magnetic Buttons ---
function initMagneticButtons() {
    if (CONFIG.reducedMotion) return;

    const magneticElements = document.querySelectorAll('.product-cta, .form-submit, .nav-cta');

    magneticElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            element.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    });
}

// --- Image Loading ---
function initImageLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => observer.observe(img));
}

// --- Keyboard Navigation ---
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape closes mobile menu
        if (e.key === 'Escape') {
            const navToggle = elements.navToggle;
            const navLinks = elements.navLinks;
            if (navLinks?.classList.contains('active')) {
                navToggle?.setAttribute('aria-expanded', 'false');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        // Tab focus visible
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
}

// --- Performance Monitor ---
function initPerformanceMonitor() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const fps = document.createElement('div');
        fps.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 8px 12px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            font-family: monospace;
            font-size: 12px;
            color: var(--color-purple);
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(fps);

        let frames = 0;
        let lastTime = performance.now();

        function countFrames() {
            frames++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                fps.textContent = `${frames} FPS`;
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(countFrames);
        }

        countFrames();
    }
}

// --- Initialize Everything ---
function init() {
    // Set copyright year
    if (elements.footerYear) {
        elements.footerYear.textContent = elements.footerYear.textContent.replace('2026', new Date().getFullYear().toString());
    }

    // Initialize modules
    initCursorGlow();
    initNavigation();
    initHeroParallax();
    initScrollReveal();
    initProductInteractions();
    initParticles();
    initSmoothScroll();
    initContactForm();
    initScrollProgress();
    initTextReveal();
    initMagneticButtons();
    initImageLoading();
    initKeyboardNavigation();
    initPerformanceMonitor();

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Recalculate positions if needed
            state.cursor.targetX = window.innerWidth / 2;
            state.cursor.targetY = window.innerHeight / 2;
        }, 250);
    }, { passive: true });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (state.animationId) {
                cancelAnimationFrame(state.animationId);
            }
        } else {
            if (!state.animationId && CONFIG.cursorGlow.enabled) {
                initCursorGlow();
            }
        }
    });

    console.log('Aurum & Lumen — Initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.AurumLumen = {
    state,
    elements,
    CONFIG
};