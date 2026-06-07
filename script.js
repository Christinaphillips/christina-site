// Nav active state on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        link.style.opacity = '';
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.style.color = 'var(--lime)';
          link.style.opacity = '1';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => observer.observe(s));

// Subtle card tilt on mouse move
document.querySelectorAll('.project-card, .vibe-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Fade-in on scroll
const fadeEls = document.querySelectorAll('.project-card, .vibe-card, .about-grid, .section-title, .contact-inner');
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  fadeObserver.observe(el);
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.visible').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
});

// Stagger fade for grid children
document.querySelectorAll('.portfolio-grid, .vibes-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 80}ms`;
  });
});

// Add visible class helper
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: none !important; }`;
document.head.appendChild(style);
