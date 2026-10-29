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
  const context = canvas.getContext('2d', {alpha: true});
  if (!context) return;
  const hero = canvas.parentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouse = {x: 0, y: 0, active: false};
  let width = 0, height = 0, nodes = [], edges = [], raf = null;
  let visible = false, time = 0, previous = null;
  const random = n => { const x = Math.sin(n * 12.9898 + 7) * 43758.5453; return x - Math.floor(x); };
  const clearPointer = () => { mouse.active = false; };
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || motion.matches) return;
    const bounds = hero.getBoundingClientRect();
    mouse.x = event.clientX - bounds.left;
    mouse.y = event.clientY - bounds.top;
    mouse.active = true;
  }, {passive: true});
  hero.addEventListener('pointerleave', clearPointer);
  hero.addEventListener('pointercancel', clearPointer);
  window.addEventListener('blur', clearPointer);
  window.addEventListener('scroll', clearPointer, {passive: true});

  function setup() {
    width = hero.clientWidth; height = hero.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const layers = width < 700 ? 5 : 7;
    nodes = []; edges = [];
    // Staggered layers keep the structure recognizable as a neural network.
    for (let layer = 0; layer < layers; layer++) {
      const count = layer === 0 || layer === layers - 1 ? 4 : 6;
      for (let row = 0; row < count; row++) {
        const id = nodes.length;
        nodes.push({layer, row, x: width * (.035 + layer / (layers - 1) * .93),
          y: height * (.025 + (row + .5) / count * .95),
          phase: random(id + 1) * Math.PI * 2, radius: 7 + random(id + 2) * 7,
          color: id % 5 === 0 ? '242,100,112' : '55,195,235', glow: 0});
      }
    }
    nodes.forEach((a, i) => nodes.forEach((b, j) => {
      if (b.layer === a.layer + 1 && (Math.abs(a.y - b.y) < height * .3)) {
        edges.push({a: i, b: j, phase: random(i * 31 + j), speed: .08 + random(i + j) * .07,
          bend: (random(i * 17 + j) - .5) * height * .2});
      }
    }));
    clearPointer(); draw(0);
  }
  function point(a, b, bend, t) {
    const u = 1 - t;
    return {x: u*u*u*a.px + 3*u*u*t*(a.px+(b.px-a.px)*.45) +
      3*u*t*t*(b.px-(b.px-a.px)*.45) + t*t*t*b.px,
      y: u*u*u*a.py + 3*u*u*t*(a.py+bend) + 3*u*t*t*(b.py-bend) + t*t*t*b.py};
  }
  function dot(x, y, radius, color, alpha) {
    context.fillStyle = `rgba(${color},${alpha})`;
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI*2); context.fill();
  }
  function draw(delta) {
    context.clearRect(0, 0, width, height);
    nodes.forEach(node => {
      const dx = mouse.x - node.x, dy = mouse.y - node.y;
      const target = mouse.active ? Math.max(0, 1 - Math.hypot(dx, dy) / 210) : 0;
      node.glow += (target - node.glow) * Math.min(1, delta * 9);
      node.px = node.x + Math.sin(time*.3 + node.phase)*9 + dx*node.glow*.055;
      node.py = node.y + Math.cos(time*.4 + node.phase)*12 + dy*node.glow*.055;
      node.activation = 0;
    });
    // Faint background specks add depth without competing with the text.
    for (let i = 0; i < 65; i++) {
      dot(random(i*3+101)*width, (random(i*3+102)*height + time*(2+random(i)*3))%height,
        .6+random(i+103), '55,195,235', .12);
    }
    edges.forEach(edge => {
      const a = nodes[edge.a], b = nodes[edge.b];
      const glow = Math.max(a.glow, b.glow);
      context.lineWidth = .8 + glow;
      context.strokeStyle = `rgba(55,195,235,${.14 + glow*.4})`;
      context.beginPath(); context.moveTo(a.px, a.py);
      context.bezierCurveTo(a.px+(b.px-a.px)*.45, a.py+edge.bend,
        b.px-(b.px-a.px)*.45, b.py-edge.bend, b.px, b.py); context.stroke();
      const progress = (time * edge.speed + edge.phase) % 1;
      for (let tail = 5; tail >= 0; tail--) {
        const t = progress - tail*.012;
        if (t < 0) continue;
        const p = point(a, b, edge.bend, t);
        dot(p.x, p.y, tail === 0 ? 2.3+glow : 1.5, a.color, (1-tail/6)*(.65+glow*.3));
      }
      b.activation = Math.max(b.activation, Math.max(0, (progress-.85)/.15));
    });
    nodes.forEach(node => {
      const energy = .25 + node.activation*.45 + node.glow*.65;
      const radius = node.radius + node.glow*3;
      const halo = context.createRadialGradient(node.px,node.py,0,node.px,node.py,radius*4);
      halo.addColorStop(0, `rgba(${node.color},${energy*.45})`);
      halo.addColorStop(1, `rgba(${node.color},0)`);
      context.fillStyle = halo; context.beginPath();
      context.arc(node.px,node.py,radius*4,0,Math.PI*2); context.fill();
      dot(node.px,node.py,radius,'17,25,36',.95);
      context.strokeStyle = `rgba(${node.color},${Math.min(1,.5+energy*.5)})`;
      context.lineWidth = 1.3 + node.glow;
      context.beginPath(); context.arc(node.px,node.py,radius,0,Math.PI*2); context.stroke();
      dot(node.px,node.py,1.8+node.activation*2,node.color,.6+node.glow*.4);
    });
  }
  function loop(timestamp) {
    raf = null;
    if (!visible || document.hidden || motion.matches) return;
    const delta = previous === null ? 0 : Math.min((timestamp - previous)/1000, .05);
    previous = timestamp; time += delta; draw(delta);
    raf = requestAnimationFrame(loop);
  }
  function syncAnimation() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null; previous = null;
    if (visible && !document.hidden && !motion.matches) raf = requestAnimationFrame(loop);
    else { clearPointer(); nodes.forEach(node => {node.glow = 0;}); draw(0); }
  }
  setup();
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting; syncAnimation();
  }).observe(hero);
  document.addEventListener('visibilitychange', syncAnimation);
  motion.addEventListener('change', syncAnimation);
  new ResizeObserver(setup).observe(hero);
})();
