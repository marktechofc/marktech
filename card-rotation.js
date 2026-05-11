// Card Rotation Click System
// Animação de rotação 360° no card ao clique

class CardRotationController {
    constructor() {
        this.init();
    }

    init() {
        this.setupCardRotation();
    }

    setupCardRotation() {
        const dashboardFrame = document.querySelector('.dashboard-frame');
        if (!dashboardFrame) return;

        let isRotating = false;

        // Adicionar evento de clique
        dashboardFrame.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Evitar múltiplas rotações simultâneas
            if (isRotating) return;
            
            isRotating = true;
            
            // Adicionar classe de rotação
            dashboardFrame.classList.add('rotating');
            
            // Configurar will-change para performance
            dashboardFrame.style.willChange = 'transform';
            
            // Remover classe após animação terminar
            setTimeout(() => {
                dashboardFrame.classList.remove('rotating');
                dashboardFrame.style.willChange = 'auto';
                isRotating = false;
            }, 800); // Duração da animação (0.8s)
        });

        // Suporte para touch em mobile
        dashboardFrame.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            if (isRotating) return;
            
            isRotating = true;
            dashboardFrame.classList.add('rotating');
            dashboardFrame.style.willChange = 'transform';
            
            setTimeout(() => {
                dashboardFrame.classList.remove('rotating');
                dashboardFrame.style.willChange = 'auto';
                isRotating = false;
            }, 800);
        });

        // Melhorar cursor para indicar interatividade
        dashboardFrame.style.cursor = 'pointer';
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new CardRotationController();
});

// Exportar global
window.CardRotationController = CardRotationController;
