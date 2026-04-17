// Dashboard 3D Animation System
// Mouse tracking e rotação 360° apenas para o card hero

class Dashboard3DController {
    constructor() {
        this.init();
    }

    init() {
        this.setupDashboard3D();
        this.setupMouseTracking();
        this.setupRotation360();
        this.setupProgressAnimation();
    }

    // Configurar animação 3D do dashboard
    setupDashboard3D() {
        const dashboardFrame = document.querySelector('.dashboard-frame');
        if (!dashboardFrame) return;

        // Variáveis para controle
        let isHovering = false;
        let hoverTimeout;
        let mouseX = 50;
        let mouseY = 50;

        // Mouse tracking
        dashboardFrame.addEventListener('mousemove', (e) => {
            const rect = dashboardFrame.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcular rotação baseada na posição do mouse
            const rotateY = ((x - centerX) / centerX) * 15; // -15deg a +15deg
            const rotateX = -((y - centerY) / centerY) * 10; // -10deg a +10deg
            
            // Atualizar variáveis CSS para iluminação dinâmica
            mouseX = (x / rect.width) * 100;
            mouseY = (y / rect.height) * 100;
            
            dashboardFrame.style.setProperty('--mouse-x', `${mouseX}%`);
            dashboardFrame.style.setProperty('--mouse-y', `${mouseY}%`);
            
            // Aplicar transformação 3D
            if (isHovering) {
                dashboardFrame.style.transform = `
                    perspective(1000px) 
                    rotateY(${rotateY}deg) 
                    rotateX(${rotateX}deg) 
                    scale(1.03)
                `;
                
                // Atualizar sombra dinâmica
                const shadowX = -rotateY * 2;
                const shadowY = rotateX * 2;
                dashboardFrame.style.boxShadow = `
                    ${shadowX}px ${shadowY}px 120px rgba(0, 0, 0, 0.8),
                    0 0 80px rgba(0, 255, 136, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25)
                `;
            }
        });

        // Hover states
        dashboardFrame.addEventListener('mouseenter', () => {
            isHovering = true;
            clearTimeout(hoverTimeout);
        });

        dashboardFrame.addEventListener('mouseleave', () => {
            isHovering = false;
            // Resetar transformação suavemente
            dashboardFrame.style.transform = `
                perspective(1000px) 
                rotateY(-5deg) 
                rotateX(5deg)
            `;
            dashboardFrame.style.boxShadow = `
                0 30px 90px rgba(0, 0, 0, 0.7),
                0 0 60px rgba(0, 255, 136, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
            `;
        });
    }

    // Configurar rotação 360° ao clique ou hover prolongado
    setupRotation360() {
        const dashboardFrame = document.querySelector('.dashboard-frame');
        if (!dashboardFrame) return;

        let hoverTimer;
        let isRotating = false;

        // Rotação ao clique
        dashboardFrame.addEventListener('click', () => {
            if (!isRotating) {
                this.rotate360(dashboardFrame);
            }
        });

        // Rotação ao hover prolongado (2 segundos)
        dashboardFrame.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => {
                if (!isRotating) {
                    this.rotate360(dashboardFrame);
                }
            }, 2000);
        });

        dashboardFrame.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
        });

        // Prevenir múltiplas rotações simultâneas
        dashboardFrame.addEventListener('animationend', () => {
            isRotating = false;
            dashboardFrame.classList.remove('rotating');
        });
    }

    // Executar rotação 360°
    rotate360(element) {
        if (element.classList.contains('rotating')) return;
        
        this.isRotating = true;
        element.classList.add('rotating');
        
        // Adicionar efeito de brilho durante rotação
        const originalBoxShadow = element.style.boxShadow;
        element.style.boxShadow = `
            0 0 120px rgba(0, 255, 136, 0.6),
            0 0 200px rgba(0, 255, 136, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
        `;
        
        // Restaurar shadow após animação
        setTimeout(() => {
            element.style.boxShadow = originalBoxShadow;
        }, 1000);
    }

    // Configurar animação da barra de progresso
    setupProgressAnimation() {
        const progressFill = document.querySelector('.progress-fill');
        if (!progressFill) return;

        // Animação contínua da barra de progresso
        let progress = 0;
        let direction = 1;

        const animateProgress = () => {
            progress += direction * 0.5;
            
            if (progress >= 100) {
                progress = 100;
                direction = -1;
            } else if (progress <= 0) {
                progress = 0;
                direction = 1;
            }
            
            progressFill.style.width = `${progress}%`;
            requestAnimationFrame(animateProgress);
        };

        // Iniciar animação após um pequeno delay
        setTimeout(animateProgress, 1000);
    }

    // Adicionar stagger animation nos elementos internos
    setupStaggerAnimation() {
        const elements = document.querySelectorAll('.dash-features li, .dash-stat, .dash-btn');
        
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard3DController();
});

// Exportar para uso global
window.Dashboard3DController = Dashboard3DController;
