// User Authentication System
// Sistema de login simulado com localStorage

class UserAuthController {
    constructor() {
        this.init();
    }

    init() {
        this.checkUserStatus();
        this.setupEventListeners();
    }

    checkUserStatus() {
        const user = localStorage.getItem('user');
        const userProfile = document.getElementById('userProfile');
        const premiumBtn = document.querySelector('.premium-btn');
        const navMenu = document.querySelector('.nav-menu');

        if (user && userProfile) {
            // Usuário logado - mostrar perfil
            const userData = JSON.parse(user);
            
            // Garantir que o perfil não quebre o layout
            userProfile.style.display = 'flex';
            userProfile.style.flexShrink = '0'; // Impedir que encolha
            userProfile.style.marginLeft = 'var(--space-md)';
            
            const profileImg = userProfile.querySelector('.profile-img');
            if (profileImg) {
                profileImg.src = userData.foto;
                profileImg.alt = userData.nome;
            }

            // Manter botão "Começar" visível para não quebrar layout
            if (premiumBtn) {
                premiumBtn.style.display = 'block';
            }

        } else {
            // Usuário não logado - esconder perfil
            if (userProfile) {
                userProfile.style.display = 'none';
            }
            
            // Mostrar botão "Começar" normal
            if (premiumBtn) {
                premiumBtn.style.display = 'block';
            }
        }
    }

    setupEventListeners() {
        const userProfile = document.getElementById('userProfile');
        
        if (userProfile) {
            // Logout ao clicar na foto
            userProfile.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    logout() {
        // Remover usuário do localStorage
        localStorage.removeItem('user');
        
        // Recarregar página
        window.location.reload();
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new UserAuthController();
});

// Exportar global
window.UserAuthController = UserAuthController;
