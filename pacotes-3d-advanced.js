// Pacotes 3D Advanced Animation System
// Efeitos 3D premium e animações avançadas para cards de pacote

class Pacotes3DAdvancedController {
    constructor() {
        this.init();
    }

    init() {
        this.setup3DMouseTracking();
        this.setupAdvancedAnimations();
        this.setupPremiumInteractions();
        this.setupPerformanceOptimization();
    }

    // Efeito 3D leve baseado no mouse
    setup3DMouseTracking() {
        const cards = document.querySelectorAll('.pacote-card');
        
        cards.forEach(card => {
            let isHovering = false;
            let mouseX = 50;
            let mouseY = 50;

            // Mouse tracking para efeito 3D
            card.addEventListener('mousemove', (e) => {
                if (!isHovering) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calcular rotação suave (muito leve)
                const rotateY = ((x - centerX) / centerX) * 5; // -5deg a +5deg
                const rotateX = -((y - centerY) / centerY) * 3; // -3deg a +3deg
                
                // Atualizar variáveis CSS para iluminação dinâmica
                mouseX = (x / rect.width) * 100;
                mouseY = (y / rect.height) * 100;
                
                card.style.setProperty('--mouse-x', `${mouseX}%`);
                card.style.setProperty('--mouse-y', `${mouseY}%`);
                
                // Aplicar transformação 3D leve
                if (!card.classList.contains('featured')) {
                    card.style.transform = `
                        translateY(-12px) 
                        scale(1.04) 
                        perspective(1000px) 
                        rotateX(${rotateX}deg) 
                        rotateY(${rotateY}deg)
                    `;
                } else {
                    // Card featured com transformação mais intensa
                    card.style.transform = `
                        scale(1.07) 
                        translateY(-12px)
                        perspective(1000px) 
                        rotateX(${rotateX * 0.7}deg) 
                        rotateY(${rotateY * 0.7}deg)
                    `;
                }
                
                // Atualizar sombra dinâmica
                this.updateDynamicShadow(card, rotateY, rotateX);
            });

            // Hover states
            card.addEventListener('mouseenter', () => {
                isHovering = true;
                card.style.transition = 'transform 0.1s ease-out';
            });

            card.addEventListener('mouseleave', () => {
                isHovering = false;
                card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                
                // Resetar transformação suavemente
                if (!card.classList.contains('featured')) {
                    card.style.transform = 'translateY(0) scale(1)';
                } else {
                    card.style.transform = 'scale(1.03)';
                }
                
                // Resetar sombra
                this.resetShadow(card);
            });
        });
    }

    // Atualizar sombra dinâmica
    updateDynamicShadow(card, rotateY, rotateX) {
        const shadowX = -rotateY * 3;
        const shadowY = rotateX * 3;
        const baseShadow = card.classList.contains('featured') ? 
            '0 30px 100px rgba(0, 0, 0, 0.6), 0 0 80px rgba(0, 255, 136, 0.5), 0 0 160px rgba(0, 255, 136, 0.25)' :
            '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(0, 255, 136, 0.35), 0 0 120px rgba(0, 255, 136, 0.15)';
        
        card.style.boxShadow = `
            ${shadowX}px ${shadowY}px 120px rgba(0, 0, 0, 0.7),
            ${baseShadow},
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `;
    }

    // Resetar sombra
    resetShadow(card) {
        if (card.classList.contains('featured')) {
            card.style.boxShadow = `
                0 20px 70px rgba(0, 0, 0, 0.5),
                0 0 60px rgba(0, 255, 136, 0.3),
                0 0 120px rgba(0, 255, 136, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 255, 136, 0.15)
            `;
        } else {
            card.style.boxShadow = `
                0 15px 50px rgba(0, 0, 0, 0.4),
                0 0 40px rgba(0, 255, 136, 0.15),
                0 0 80px rgba(0, 255, 136, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.15),
                inset 0 -1px 0 rgba(0, 255, 136, 0.1)
            `;
        }
    }

    // Animações avançadas de entrada
    setupAdvancedAnimations() {
        const cards = document.querySelectorAll('.pacote-card');
        
        cards.forEach((card, index) => {
            // Estado inicial
            card.style.opacity = '0';
            card.style.transform = 'translateY(60px) scale(0.9)';
            
            // Animação de entrada com delay escalonado
            setTimeout(() => {
                card.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                card.style.opacity = '1';
                card.style.transform = card.classList.contains('featured') ? 
                    'scale(1.03)' : 'scale(1)';
                
                // Animar conteúdo interno
                this.animateCardContent(card, index);
            }, 200 + (index * 200)); // Stagger de 200ms
        });
    }

    // Animar conteúdo interno com efeito premium
    animateCardContent(card, cardIndex) {
        const elements = card.querySelectorAll('h3, .preco, ul li, .prazo-entrega, .btn-contratar');
        
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                
                // Adicionar efeito de brilho pós-animação
                if (el.classList.contains('preco')) {
                    setTimeout(() => {
                        el.style.filter = 'brightness(1.2)';
                        setTimeout(() => {
                            el.style.filter = 'brightness(1)';
                        }, 300);
                    }, 200);
                }
            }, 150 + (index * 80)); // Stagger interno de 80ms
        });

        // Animação especial para selo featured
        if (card.classList.contains('featured')) {
            this.animateSeloPremium(card);
        }
    }

    // Animar selo premium
    animateSeloPremium(card) {
        const selo = card.querySelector('.selo-destaque');
        if (!selo) return;

        selo.style.transform = 'scale(0) rotate(-180deg)';
        selo.style.opacity = '0';
        
        setTimeout(() => {
            selo.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            selo.style.transform = 'scale(1) rotate(0deg)';
            selo.style.opacity = '1';
            
            // Efeito de pulso pós-entrada
            setTimeout(() => {
                selo.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    selo.style.transform = 'scale(1)';
                }, 200);
            }, 400);
        }, 800);
    }

    // Microinterações premium
    setupPremiumInteractions() {
        const cards = document.querySelectorAll('.pacote-card');
        
        cards.forEach(card => {
            // Efeito de energia no botão
            const btn = card.querySelector('.btn-contratar');
            if (btn) {
                this.setupButtonEnergy(btn);
            }

            // Hover nos itens da lista
            const listItems = card.querySelectorAll('ul li');
            listItems.forEach(item => {
                this.setupListItemHover(item);
            });

            // Efeito de brilho contínuo
            this.setupContinuousGlow(card);
        });
    }

    // Efeito de energia no botão
    setupButtonEnergy(button) {
        button.addEventListener('click', (e) => {
            this.createEnergyRipple(e, button);
            this.createButtonShockwave(button);
        });
    }

    // Criar ripple de energia
    createEnergyRipple(e, button) {
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(0, 255, 136, 0.8) 0%, transparent 70%);
                    transform: scale(0);
                    animation: energyRipple 1.2s ease-out;
                    pointer-events: none;
                    left: ${e.clientX - rect.left - 20}px;
                    top: ${e.clientY - rect.top - 20}px;
                    width: 40px;
                    height: 40px;
                `;
                button.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 1200);
            }, i * 100);
        }
    }

    // Criar shockwave no botão
    createButtonShockwave(button) {
        const shockwave = document.createElement('div');
        shockwave.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 16px;
            border: 2px solid rgba(0, 255, 136, 0.8);
            transform: scale(1);
            animation: shockwave 0.6s ease-out;
            pointer-events: none;
        `;
        button.appendChild(shockwave);
        
        setTimeout(() => shockwave.remove(), 600);
    }

    // Hover nos itens da lista
    setupListItemHover(item) {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.textShadow = '0 0 20px rgba(0, 255, 136, 1)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.6)';
            }
        });
    }

    // Efeito de brilho contínuo
    setupContinuousGlow(card) {
        let glowIntensity = 0;
        let glowDirection = 1;
        
        const animateGlow = () => {
            glowIntensity += glowDirection * 0.01;
            
            if (glowIntensity >= 0.3) {
                glowIntensity = 0.3;
                glowDirection = -1;
            } else if (glowIntensity <= 0) {
                glowIntensity = 0;
                glowDirection = 1;
            }
            
            if (card.classList.contains('featured')) {
                card.style.filter = `brightness(${1 + glowIntensity * 0.3})`;
            }
            
            requestAnimationFrame(animateGlow);
        };
        
        // Iniciar animação após entrada
        setTimeout(() => {
            animateGlow();
        }, 1000 + Array.from(document.querySelectorAll('.pacote-card')).indexOf(card) * 200);
    }

    // Otimização de performance
    setupPerformanceOptimization() {
        // Adicionar will-change para elementos animados
        const cards = document.querySelectorAll('.pacote-card');
        cards.forEach(card => {
            card.style.willChange = 'transform, box-shadow, filter';
            
            const btn = card.querySelector('.btn-contratar');
            if (btn) {
                btn.style.willChange = 'transform, box-shadow';
            }
        });

        // Remover will-change após animações
        setTimeout(() => {
            cards.forEach(card => {
                card.style.willChange = 'auto';
                
                const btn = card.querySelector('.btn-contratar');
                if (btn) {
                    btn.style.willChange = 'auto';
                }
            });
        }, 3000);
    }
}

// CSS para animações premium
const pacotes3DCSS = `
@keyframes energyRipple {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(4);
        opacity: 0;
    }
}

@keyframes shockwave {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(1.2);
        opacity: 0;
    }
}

/* Performance optimizations */
.pacote-card {
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
}

.btn-contratar {
    transform: translateZ(0);
    backface-visibility: hidden;
}
`;

// Injetar CSS
const style = document.createElement('style');
style.textContent = pacotes3DCSS;
document.head.appendChild(style);

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new Pacotes3DAdvancedController();
});

// Exportar global
window.Pacotes3DAdvancedController = Pacotes3DAdvancedController;
