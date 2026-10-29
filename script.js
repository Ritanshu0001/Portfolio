/**
 * Portfolio setup:
 * To add a live demo, find the project's HTML link in index.html and set
 * data-demo-url="https://your-project.example". The link becomes active.
 * Replace assets/projects/*.svg with real images if you have screenshots.
 */
(function () {
  'use strict';
  const nav = document.querySelector('#site-nav');
  const menu = document.querySelector('.menu-toggle');
  if (nav && menu) {
    menu.addEventListener('click', () => {
      const next = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(next));
      menu.setAttribute('aria-label', next ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', next);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('open');
    }));
  }

  // Empty demo URLs intentionally remain disabled; no fake or dead links.
  document.querySelectorAll('[data-demo-url]').forEach(link => {
    const url = (link.dataset.demoUrl || '').trim();
    if (/^https?:\/\//i.test(url)) {
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.removeAttribute('aria-disabled');
      link.removeAttribute('title');
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('title', 'Coming soon');
      link.setAttribute('tabindex', '0');
      const label = link.firstChild;
      if (label && label.nodeType === Node.TEXT_NODE) {
        const originalLabel = label.textContent;
        const showComingSoon = () => { label.textContent = 'Coming soon '; };
        const restoreLabel = () => {
          if (!link.matches(':hover, :focus')) label.textContent = originalLabel;
        };
        link.addEventListener('mouseenter', showComingSoon);
        link.addEventListener('focus', showComingSoon);
        link.addEventListener('mouseleave', restoreLabel);
        link.addEventListener('blur', restoreLabel);
      }
      link.removeAttribute('href');
    }
  });

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const slides = Array.from(carousel.querySelectorAll('.carousel-slides img'));
    const previous = carousel.querySelector('[data-carousel-previous]');
    const next = carousel.querySelector('[data-carousel-next]');
    const caption = carousel.querySelector('[data-carousel-caption]');
    let activeIndex = 0;
    if (slides.length < 2 || !previous || !next || !caption) return;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
        slide.setAttribute('aria-hidden', slideIndex === activeIndex ? 'false' : 'true');
      });
      caption.textContent = slides[activeIndex].dataset.caption || '';
    };

    previous.addEventListener('click', () => showSlide(activeIndex - 1));
    next.addEventListener('click', () => showSlide(activeIndex + 1));
    showSlide(activeIndex);
  });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

const canvas = document.getElementById('network');
  if (!canvas) return;

  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  const hero = canvas.parentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = { x: 0, y: 0, active: false };
  let width = 0, height = 0, nodes = [];
  let raf = null, visible = false, previous = null;

  function random(n) {
    const x = Math.sin(n * 12.9898 + 7) * 43758.5453;
    return x - Math.floor(x);
  }

  function setup() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.min(74, Math.max(28,
      Math.floor(width * height / 14000)));

    nodes = Array.from({ length: count }, (_, i) => ({
      x: width * random(i * 4 + 1),
      y: height * random(i * 4 + 2),
      vx: (random(i * 4 + 3) - .5) * 6,
      vy: (random(i * 4 + 4) - .5) * 6,
      radius: i % 10 === 0 ? 1.8 : 1.2,
      offsetX: 0,
      offsetY: 0
    }));
    draw(0);
  }

  function draw(delta) {
    context.clearRect(0, 0, width, height);
    const range = width < 700 ? 115 : 170;
    const ease = 1 - Math.exp(-6 * delta);

    nodes.forEach(node => {
      node.x += node.vx * delta;
      node.y += node.vy * delta;
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;

      const dx = node.x - mouse.x;
      const dy = node.y - mouse.y;
      const distance = Math.hypot(dx, dy);
      node.glow = mouse.active && !motion.matches
        ? Math.max(0, 1 - distance / 190) : 0;

      const push = node.glow * 30 / (distance || 1);
      node.offsetX += (dx * push - node.offsetX) * ease;
      node.offsetY += (dy * push - node.offsetY) * ease;
      node.px = node.x + node.offsetX;
      node.py = node.y + node.offsetY;
    });

    nodes.forEach((a, i) => {
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const distance = Math.hypot(a.px - b.px, a.py - b.py);
        if (distance > range) continue;

        const alpha = Math.pow(1 - distance / range, 1.4)
          * (.2 + Math.max(a.glow, b.glow) * .65);
        context.strokeStyle = `rgba(140,157,186,${alpha})`;
        context.lineWidth = .75;
        context.beginPath();
        context.moveTo(a.px, a.py);
        context.lineTo(b.px, b.py);
        context.stroke();
      }

      if (a.glow > 0) {
        context.strokeStyle = `rgba(242,100,112,${a.glow * .65})`;
        context.beginPath();
        context.moveTo(mouse.x, mouse.y);
        context.lineTo(a.px, a.py);
        context.stroke();
      }

      context.fillStyle = i % 12 === 0
        ? `rgba(242,100,112,${.65 + a.glow * .35})`
        : `rgba(143,168,197,${.45 + a.glow * .55})`;
      context.beginPath();
      context.arc(a.px, a.py, a.radius + a.glow * 1.6, 0, Math.PI * 2);
      context.fill();
    });
  }

  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    mouse.x = event.clientX - bounds.left;
    mouse.y = event.clientY - bounds.top;
    mouse.active = true;
  }, { passive: true });

  const clearPointer = () => { mouse.active = false; };
  hero.addEventListener('pointerleave', clearPointer);
  hero.addEventListener('pointercancel', clearPointer);
  window.addEventListener('blur', clearPointer);
  window.addEventListener('scroll', clearPointer, { passive: true });

  function loop(timestamp) {
    raf = null;
    if (!visible || document.hidden || motion.matches) return;
    const delta = previous === null
      ? 0 : Math.min((timestamp - previous) / 1000, .05);
    previous = timestamp;
    draw(delta);
    raf = requestAnimationFrame(loop);
  }

  function syncAnimation() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    previous = null;
    clearPointer();
    if (visible && !document.hidden && !motion.matches) {
      raf = requestAnimationFrame(loop);
    } else {
      nodes.forEach(node => {
        node.offsetX = 0;
        node.offsetY = 0;
      });
      draw(0);
    }
  }

  setup();
  new ResizeObserver(setup).observe(hero);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncAnimation();
  }).observe(hero);
  document.addEventListener('visibilitychange', syncAnimation);
  motion.addEventListener('change', syncAnimation);
})();
