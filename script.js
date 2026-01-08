const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('navLinks');

toggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('active');
  });
});

const reveals = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.2 });

reveals.forEach(el => observer.observe(el));