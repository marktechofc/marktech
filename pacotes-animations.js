// Pacotes Animation System
// Animações suaves para os cards de pacote com efeito stagger

class PacotesAnimationController {
    constructor() {
        this.init();
    }

    init() {
        this.setupStaggerAnimation();
        this.setupCardInteractions();
        this.setupScrollReveal();
    }

    // Animação de entrada com efeito stagger
    setupStaggerAnimation() {
        const cards = document.querySelectorAll('.pacote-card');
        
        cards.forEach((card, index) => {
            // Estado inicial
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px) scale(0.95)';
            
            // Animação de entrada com delay escalonado
            setTimeout(() => {
                card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                
                // Adicionar classe para animação interna
                this.animateCardContent(card, index);
            }, 300 + (index * 150)); // Stagger de 150ms
        });
    }

    // Animar conteúdo interno de cada card
    animateCardContent(card, cardIndex) {
        const elements = card.querySelectorAll('h3, .preco, ul li, .prazo-entrega, .btn-contratar');
        
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 50));
        });

        // Destaque especial para o card featured
        if (card.classList.contains('featured')) {
            this.animateSeloDestaque(card);
        }
    }

    // Animar selo de destaque
    animateSeloDestaque(card) {
        const selo = card.querySelector('.selo-destaque');
        if (!selo) return;

        selo.style.transform = 'scale(0) rotate(-180deg)';
        selo.style.opacity = '0';
        
        setTimeout(() => {
            selo.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            selo.style.transform = 'scale(1) rotate(0deg)';
            selo.style.opacity = '1';
        }, 600);
    }

    // Microinterações nos cards
    setupCardInteractions() {
        const cards = document.querySelectorAll('.pacote-card');
        
        cards.forEach(card => {
            // Efeito de tilt sutil no hover
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateY = ((x - centerX) / centerX) * 3;
                const rotateX = -((y - centerY) / centerY) * 2;
                
                if (!card.classList.contains('featured')) {
                    card.style.transform = `
                        translateY(-8px) 
                        scale(1.03) 
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg)
                    `;
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(-8px) scale(1.03)';
            });

            // Efeito de ripple no botão
            const btn = card.querySelector('.btn-contratar');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    this.createButtonRipple(e, btn);
                });
            }
        });
    }

    // Efeito de ripple no botão
    createButtonRipple(e, button) {
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: rippleEffect 0.8s ease-out;
            pointer-events: none;
            left: ${e.clientX - rect.left - 15}px;
            top: ${e.clientY - rect.top - 15}px;
            width: 30px;
            height: 30px;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 800);
    }

    // Scroll reveal para animação quando entrar na viewport
    setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    
                    // Resetar e animar novamente
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(40px) scale(0.95)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 100);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.pacote-card').forEach(card => {
            observer.observe(card);
        });
    }
}

// Adicionar CSS para animações
const pacotesAnimationCSS = `
@keyframes rippleEffect {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(4);
        opacity: 0;
    }
}

/* Performance optimization */
.pacote-card {
    will-change: transform, opacity;
}

.btn-contratar {
    will-change: transform, box-shadow;
}
`;

// Injetar CSS
const style = document.createElement('style');
style.textContent = pacotesAnimationCSS;
document.head.appendChild(style);

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new PacotesAnimationController();
});

// Exportar global
window.PacotesAnimationController = PacotesAnimationController;
