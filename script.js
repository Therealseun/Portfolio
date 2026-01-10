// Mobile Menu
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        
        // Close menu when clicking links
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }
    
    // Scroll to Top
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Current Year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Copy Email
    const emailElement = document.getElementById('contact-email');
    if (emailElement) {
        emailElement.addEventListener('click', function() {
            const email = this.textContent;
            navigator.clipboard.writeText(email).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
        emailElement.style.cursor = 'pointer';
        emailElement.title = 'Click to copy';
    }
    
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const successMessage = document.getElementById('successMessage');
        const closeSuccessBtn = document.getElementById('closeSuccessMsg');
        const submitBtn = document.getElementById('submitBtn');
        
        // Form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Show loading
            submitBtn.disabled = true;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            try {
                // Get form data
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value.trim(),
                    _subject: 'New Contact - Portfolio Website',
                    _template: 'table',
                    _captcha: 'false'
                };
                
                // Send to FormSubmit.co using AJAX
                const response = await fetch('https://formsubmit.co/ajax/danieloluwasegun488@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success === "true") {
                    // Show success message
                    successMessage.classList.remove('hidden');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Auto-close after 5 seconds
                    setTimeout(() => {
                        if (!successMessage.classList.contains('hidden')) {
                            successMessage.classList.add('hidden');
                            document.body.style.overflow = 'auto';
                        }
                    }, 5000);
                    
                } else {
                    throw new Error('Form submission failed');
                }
                
            } catch (error) {
                console.error('Error:', error);
                // Fallback: Show alert and let user email directly
                alert('Sorry, there was an error sending your message. Please email me directly at danieloluwasegun488@gmail.com');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
        
        // Form validation
        function validateForm() {
            let isValid = true;
            
            // Clear previous errors
            document.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('error');
            });
            
            // Validate name
            const name = document.getElementById('name').value.trim();
            if (!name) {
                document.getElementById('name').classList.add('error');
                isValid = false;
            }
            
            // Validate email
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                document.getElementById('email').classList.add('error');
                isValid = false;
            }
            
            // Validate subject
            const subject = document.getElementById('subject').value;
            if (!subject) {
                document.getElementById('subject').classList.add('error');
                isValid = false;
            }
            
            // Validate message
            const message = document.getElementById('message').value.trim();
            if (!message || message.length < 10) {
                document.getElementById('message').classList.add('error');
                isValid = false;
            }
            
            return isValid;
        }
        
        // Remove error class on input
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
            });
        });
        
        // Close success message button
        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', function() {
                successMessage.classList.add('hidden');
                document.body.style.overflow = 'auto';
            });
        }
        
        // Close success message when clicking outside
        if (successMessage) {
            successMessage.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.add('hidden');
                    document.body.style.overflow = 'auto';
                }
            });
        }
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && successMessage && !successMessage.classList.contains('hidden')) {
                successMessage.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Check if URL has #success and show overlay
if (window.location.hash === '#success') {
    document.getElementById('successOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Function to close success overlay
function closeSuccess() {
    document.getElementById('successOverlay').classList.remove('show');
    document.body.style.overflow = 'auto';
    // Remove #success from URL
    history.replaceState(null, null, ' ');
}

// Close overlay with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSuccess();
    }
});

// Close overlay when clicking outside
document.getElementById('successOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSuccess();
    }
});