document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('active');
    
    
    const icon = this.querySelector('i');
    if (icon.classList.contains('fa-bars')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.getElementById('mobileMenuBtn');
        const icon = menuBtn.querySelector('i');
        
        nav.classList.remove('active');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    
    if (name && email && subject && message) {
        
        alert(`Thank you, ${name}! Your message has been sent. I'll get back to you soon.`);
        this.reset();
    } else {
        alert('Please fill in all fields.');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

const sections = document.querySelectorAll('section');

const revealSection = () => {
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight - 100) {
            section.classList.add('visible');
            
            
            if (section.id === 'portfolio') {
                const projectCards = document.querySelectorAll('.project-card');
                projectCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animated');
                    }, index * 200);
                });
            }
        }
    });
};

window.addEventListener('scroll', revealSection);
window.addEventListener('load', revealSection);

window.addEventListener('load', () => {
    
    const heroBadge = document.querySelector('.hero-badge');
    const heroTitle = document.querySelector('.hero h1');
    const heroParagraph = document.querySelector('.hero p');
    const heroCTA = document.querySelector('.hero-cta');
    
    if (heroBadge) heroBadge.style.animationPlayState = 'running';
    if (heroTitle) heroTitle.style.animationPlayState = 'running';
    if (heroParagraph) heroParagraph.style.animationPlayState = 'running';
    if (heroCTA) heroCTA.style.animationPlayState = 'running';
    
    
    const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    fadeInElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
        el.style.animationPlayState = 'running';
    });
    
    
    revealSection();
    
    
    const currentYear = new Date().getFullYear();
    document.getElementById('currentYear').textContent = currentYear;
});

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        
        const existingRipples = this.querySelectorAll('.ripple-effect');
        existingRipples.forEach(ripple => ripple.remove());
        
        
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        this.appendChild(ripple);
        
       
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

document.querySelectorAll('.project-buttons .btn').forEach(button => {
    button.addEventListener('click', function() {
        const projectContent = this.closest('.project-content');
        if (!projectContent) return;
        
        const projectTitle = projectContent.querySelector('h3');
        if (!projectTitle) return;
        
        const titleText = projectTitle.textContent;
        
        if (this.textContent.includes('Preview') || this.textContent.includes('Live') || this.textContent.includes('Site')) {
            alert(`Opening preview for: ${titleText}\n\nNote: Project links would be added here in a real implementation.`);
        } else if (this.textContent.includes('GitHub') || this.textContent.includes('Code') || this.textContent.includes('Repo')) {
            alert(`Opening GitHub repository for: ${titleText}\n\nNote: GitHub links would be added here in a real implementation.`);
        }
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);


const profileWrapper = document.querySelector('.profile-image-wrapper');
if (profileWrapper) {
    profileWrapper.addEventListener('mouseenter', () => {
        const overlay = profileWrapper.querySelector('.profile-overlay');
        if (overlay) {
            overlay.style.opacity = '1';
        }
    });
    
    profileWrapper.addEventListener('mouseleave', () => {
        const overlay = profileWrapper.querySelector('.profile-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
        }
    });
}

document.querySelectorAll('.skill').forEach(skill => {
    skill.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    
    skill.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.service-icon');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.service-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

function typeWriterEffect() {
    const heroTitle = document.querySelector('.hero h1');
    if (!heroTitle) return;
    
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const typingSpeed = 50; 
    
    function typeCharacter() {
        if (i < originalText.length) {
            heroTitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeCharacter, typingSpeed);
        }
    }
    
    setTimeout(typeCharacter, 1000);
}

window.addEventListener('scroll', () => {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    heroSection.style.backgroundPosition = `center ${rate}px`;
});

document.addEventListener('DOMContentLoaded', function() {
    
    function highlightNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    
    const body = document.querySelector('body');
    body.classList.add('loaded');
    
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
});