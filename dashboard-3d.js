// Dashboard 3D Animation System
// Mouse tracking e rotação 360° apenas para o card hero

class Dashboard3DController {
    constructor() {
        this.init();
    }

    init() {
        this.setupDashboard3D();
        if (typeof this.setupMouseTracking === "function") {
            this.setupMouseTracking();
        }
        this.setupRotation360();
        this.setupClickRotation();
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

    // Configurar rotação 360° suave e responsiva ao interagir com o mouse
    setupRotation360() {
        const dashboardFrame = document.querySelector('.dashboard-frame');
        if (!dashboardFrame) return;

        let isRotating = false;
        let mouseVelocityX = 0;
        let lastMouseX = 0;
        let mouseHistory = [];
        let rotationActive = false;

        // Track mouse velocity for smooth rotation
        dashboardFrame.addEventListener('mousemove', (e) => {
            const rect = dashboardFrame.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentTime = Date.now();
            
            // Calculate velocity based on mouse movement history
            mouseHistory.push({ x: currentX, time: currentTime });
            if (mouseHistory.length > 5) mouseHistory.shift();
            
            if (mouseHistory.length > 1) {
                const first = mouseHistory[0];
                const last = mouseHistory[mouseHistory.length - 1];
                const timeDiff = last.time - first.time;
                const distance = last.x - first.x;
                mouseVelocityX = timeDiff > 0 ? distance / timeDiff : 0;
            }
            
            lastMouseX = currentX;
            
            // Activate smooth rotation on hover with mouse movement
            if (!rotationActive && !isRotating && Math.abs(mouseVelocityX) > 0.5) {
                rotationActive = true;
                this.startSmoothRotation(dashboardFrame, mouseVelocityX);
            }
        });

        // Start 360° rotation on hover
        dashboardFrame.addEventListener('mouseenter', () => {
            if (!isRotating) {
                this.rotate360Premium(dashboardFrame);
            }
        });

        // Reset on mouse leave
        dashboardFrame.addEventListener('mouseleave', () => {
            mouseHistory = [];
            mouseVelocityX = 0;
            rotationActive = false;
            clearTimeout(this.rotationTimeout);
        });

        // Handle animation completion
        dashboardFrame.addEventListener('animationend', (e) => {
            if (e.animationName === 'dashboardRotate360') {
                isRotating = false;
                dashboardFrame.classList.remove('rotating');
                dashboardFrame.style.transform = 'perspective(1200px) rotateY(-8deg) rotateX(8deg) scale(1)';
            }
        });
    }

    // Smooth continuous rotation following mouse
    startSmoothRotation(element, velocity) {
        const intensity = Math.min(Math.abs(velocity) * 50, 30);
        const direction = velocity > 0 ? 1 : -1;
        
        element.style.transform = `
            perspective(1200px) 
            rotateY(${-8 + (intensity * direction)}deg) 
            rotateX(${8 - (intensity * 0.3)}deg) 
            scale(1.02)
        `;
    }

    // Premium 360° rotation with enhanced effects
    rotate360Premium(element) {
        if (element.classList.contains('rotating')) return;
        
        element.classList.add('rotating');
        
        // Enhanced glow effect during rotation
        const originalTransition = element.style.transition;
        element.style.transition = 'box-shadow 0.5s ease';
        element.style.boxShadow = `
            0 0 150px rgba(0, 255, 136, 0.5),
            0 0 250px rgba(0, 255, 136, 0.3),
            0 0 350px rgba(0, 255, 136, 0.1),
            inset 0 2px 0 rgba(255, 255, 255, 0.4)
        `;
        
        // Restore after rotation
        setTimeout(() => {
            element.style.transition = originalTransition;
            element.style.boxShadow = '';
        }, 1200);
    }

    // Setup click rotation 360°
    setupClickRotation() {
        const dashboardFrame = document.querySelector('.dashboard-frame');
        if (!dashboardFrame) return;

        let isRotating = false;

        dashboardFrame.addEventListener('click', (e) => {
            // Prevent triggering if already rotating
            if (isRotating || dashboardFrame.classList.contains('rotating-click')) return;
            
            isRotating = true;
            dashboardFrame.classList.add('rotating-click');
            
            // Store original transform
            const originalTransform = dashboardFrame.style.transform;
            
            // Apply 360° rotation animation
            dashboardFrame.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            dashboardFrame.style.transform = `
                perspective(1200px) 
                rotateY(360deg) 
                rotateX(0deg) 
                scale(1.08)
            `;
            
            // Intensify glow during click rotation
            const originalBoxShadow = dashboardFrame.style.boxShadow;
            dashboardFrame.style.boxShadow = `
                0 0 180px rgba(0, 255, 136, 0.6),
                0 0 300px rgba(0, 255, 136, 0.4),
                0 0 450px rgba(0, 255, 136, 0.2),
                inset 0 2px 0 rgba(255, 255, 255, 0.5)
            `;
            
            // After rotation completes, return to original state
            setTimeout(() => {
                dashboardFrame.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                dashboardFrame.style.transform = originalTransform || 'perspective(1200px) rotateY(-8deg) rotateX(8deg) scale(1)';
                dashboardFrame.style.boxShadow = originalBoxShadow;
                
                setTimeout(() => {
                    isRotating = false;
                    dashboardFrame.classList.remove('rotating-click');
                }, 500);
            }, 800);
        });
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
