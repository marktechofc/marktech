// Premium Mark tech Interactive Experience
document.addEventListener('DOMContentLoaded', function() {
    
    // Premium Mobile Navigation
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Smooth Scrolling with Offset
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.nav-header').offsetHeight;
                const offsetTop = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu
            if (mobileToggle && navMenu) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });

    // Optimized Scroll Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add scroll-reveal to all major elements
    const animateElements = document.querySelectorAll(
        '.services-grid, .benefits-grid, .pricing-grid, .portfolio-grid, .testimonials-grid, .faq-grid'
    );
    
    animateElements.forEach(el => {
        el.classList.add('scroll-reveal');
        scrollObserver.observe(el);
    });

    // Configure scroll-reveal for service cards with stagger
    const serviceCards = document.querySelectorAll('.service-card.scroll-reveal');
    serviceCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.15}s`;
        scrollObserver.observe(card);
    });

    // Premium Navbar Effects
    const navHeader = document.querySelector('.nav-header');
    let lastScrollY = 0;
    
    window.addEventListener('scroll', debounce(function() {
        const currentScrollY = window.pageYOffset;
        
        if (currentScrollY > 100) {
            navHeader.style.background = 'rgba(11, 11, 15, 0.95)';
            navHeader.style.backdropFilter = 'blur(20px)';
            navHeader.style.borderBottomColor = 'rgba(0, 255, 136, 0.1)';
        } else {
            navHeader.style.background = 'rgba(11, 11, 15, 0.8)';
            navHeader.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
        }
        
        lastScrollY = currentScrollY;
    }, 10));

    // Hero 3D Parallax Effect - Fluido e sem bugs
    const heroSection = document.querySelector('.hero-section');
    const heroVisual = document.querySelector('.hero-visual-3d');
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;
    
    if (heroSection && heroVisual && !window.matchMedia('(pointer: coarse)').matches) {
        function updateParallax() {
            // Smooth interpolation (lerp)
            currentX += (mouseX - currentX) * 0.08;
            currentY += (mouseY - currentY) * 0.08;
            
            // Apply to visual container
            heroVisual.style.transform = `perspective(1200px) rotateY(${currentX * 8}deg) rotateX(${-currentY * 8}deg)`;
            
            // Apply to floating elements via CSS variables
            const floatingSites = heroVisual.querySelectorAll('.floating-site, .floating-app, .float-orb');
            floatingSites.forEach((site, index) => {
                const factor = (index + 1) * 8;
                site.style.setProperty('--parallax-x', `${currentX * factor}px`);
                site.style.setProperty('--parallax-y', `${currentY * factor}px`);
            });
            
            rafId = requestAnimationFrame(updateParallax);
        }
        
        heroSection.addEventListener('mousemove', function(e) {
            const rect = heroSection.getBoundingClientRect();
            mouseX = (e.clientX - rect.left) / rect.width - 0.5;
            mouseY = (e.clientY - rect.top) / rect.height - 0.5;
            
            if (!rafId) {
                rafId = requestAnimationFrame(updateParallax);
            }
        });
        
        heroSection.addEventListener('mouseleave', function() {
            mouseX = 0;
            mouseY = 0;
            setTimeout(() => {
                if (Math.abs(currentX) < 0.001 && Math.abs(currentY) < 0.001) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }, 500);
        });
        
        // Start animation loop
        rafId = requestAnimationFrame(updateParallax);
    }
    
    // Section Visuals Interactive Effects
    function initSectionVisuals() {
        // Tech Section - Code typing effect
        const techItems = document.querySelectorAll('.tech-item');
        techItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.15) rotate(5deg)';
                item.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.3)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1) rotate(0)';
                item.style.boxShadow = 'none';
            });
        });
        
        // Portfolio cards hover tilt
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                item.style.transform = `perspective(1000px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
            });
        });
        
        // Benefits pulse on hover
        const benefitItems = document.querySelectorAll('.benefit-item');
        benefitItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.animation = 'pulse 0.6s ease';
            });
            item.addEventListener('animationend', () => {
                item.style.animation = '';
            });
        });
        
        // Testimonial cards float effect
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        testimonialCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
        });
        
        // FAQ expand animation
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const icon = item.querySelector('.faq-icon');
            if (icon) {
                item.addEventListener('mouseenter', () => {
                    icon.style.transform = 'rotate(90deg)';
                });
                item.addEventListener('mouseleave', () => {
                    if (!item.classList.contains('active')) {
                        icon.style.transform = 'rotate(0)';
                    }
                });
            }
        });
        
        // Pricing cards glow
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.borderColor = 'rgba(0, 255, 136, 0.4)';
                card.style.boxShadow = '0 0 40px rgba(0, 255, 136, 0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                card.style.boxShadow = 'none';
            });
        });
    }
    
    initSectionVisuals();

    // Advanced FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const toggle = item.querySelector('.faq-toggle i');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherToggle = otherItem.querySelector('.faq-toggle i');
                if (otherToggle) {
                    otherToggle.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
                if (toggle) {
                    toggle.style.transform = 'rotate(45deg)';
                }
            }
        });
    });

    // Premium Button Interactions
    const premiumButtons = document.querySelectorAll('.premium-btn');
    premiumButtons.forEach(button => {
        // Ripple effect
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
        
        // Magnetic effect on hover
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Portfolio Interactions - Simplificado
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        const overlay = item.querySelector('.portfolio-overlay');
        const image = item.querySelector('.portfolio-image img');
        
        item.addEventListener('mouseenter', function() {
            if (overlay) {
                overlay.style.opacity = '1';
                overlay.style.transition = 'opacity 0.3s ease';
            }
            if (image) {
                image.style.transform = 'scale(1.05)';
                image.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            if (overlay) overlay.style.opacity = '0';
            if (image) image.style.transform = 'scale(1)';
        });
    });

    // Testimonial Auto-Rotate with Smooth Transitions
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial-card');
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            const opacity = i === index ? '1' : '0.6';
            const scale = i === index ? '1' : '0.95';
            const filter = i === index ? 'blur(0px)' : 'blur(2px)';
            
            testimonial.style.transition = 'all 0.6s ease';
            testimonial.style.opacity = opacity;
            testimonial.style.transform = `scale(${scale})`;
            testimonial.style.filter = filter;
        });
    }
    
    // Auto-rotate every 6 seconds
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 6000);

    // Auth Section - Login e Dashboard
    const authSection = document.getElementById('auth-section');
    const loginForm = document.querySelector('.login-form');
    const dashboard = document.querySelector('.dashboard');
    const authForm = document.querySelector('.auth-form');
    const logoutBtn = document.querySelector('.logout-btn');
    
    // Função para mostrar login
    function showLogin() {
        if (authSection) {
            authSection.style.display = 'flex';
            if (loginForm) loginForm.style.display = 'block';
            if (dashboard) dashboard.style.display = 'none';
        }
    }
    
    // Função para mostrar dashboard
    function showDashboard() {
        if (authSection) {
            authSection.style.display = 'block';
            if (loginForm) loginForm.style.display = 'none';
            if (dashboard) dashboard.style.display = 'block';
        }
    }
    
    // Simulação de login
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulação de validação
            if (email && password) {
                showDashboard();
                
                // Atualizar nome do usuário
                const userName = document.querySelector('.user-name');
                if (userName) {
                    userName.textContent = email.split('@')[0];
                }
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            showLogin();
            
            // Limpar formulário
            if (authForm) {
                authForm.reset();
            }
        });
    }
    
    // Botões para testar login (remover em produção)
    const testLoginBtns = document.querySelectorAll('[data-auth="login"]');
    testLoginBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showLogin();
        });
    });

    // Service Categories - Hover sutil
    const serviceCategories = document.querySelectorAll('.service-category');
    serviceCategories.forEach(category => {
        const icon = category.querySelector('.category-icon');
        
        category.addEventListener('mouseenter', function() {
            if (icon) {
                icon.style.transition = 'all 0.2s ease';
                icon.style.background = 'rgba(0, 255, 136, 0.15)';
            }
        });
        
        category.addEventListener('mouseleave', function() {
            if (icon) {
                icon.style.background = '';
            }
        });
    });

    // Simple Loading Animation
    window.addEventListener('load', function() {
        // Remove complex loading for better performance
        document.body.style.opacity = '1';
    });

    // Performance Utilities
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Add minimal CSS
    const minimalStyles = document.createElement('style');
    minimalStyles.textContent = `
        .nav-menu.active {
            display: flex !important;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.98);
            backdrop-filter: blur(20px);
            flex-direction: column;
            padding: 2rem;
            border-top: 1px solid rgba(0, 255, 136, 0.2);
        }
        
        .mobile-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
        
        .scroll-reveal {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.4s ease;
        }
        
        .scroll-reveal.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    
    document.head.appendChild(minimalStyles);
});
