// Começar Redirect Force System
// Redirecionamento forçado para todos os botões "Começar"

class ComecarRedirectController {
    constructor() {
        this.init();
    }

    init() {
        this.forceComecarRedirect();
    }

    forceComecarRedirect() {
        // Forçar redirecionamento para qualquer elemento que contenha "Começar"
        document.querySelectorAll('a, button, span, div').forEach(el => {
            const text = el.textContent.trim();
            
            // Verificar diferentes variações de "Começar"
            if (text === "Começar" || text === "Começar agora") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "cadastro.html";
                });
            }
        });

        // Backup adicional: selecionar por classe específica
        document.querySelectorAll('.premium-btn').forEach(el => {
            const text = el.textContent.trim();
            if (text === "Começar" || text === "Começar agora") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "cadastro.html";
                });
            }
        });

        // Backup extra: selecionar botões específicos
        document.querySelectorAll('.dash-btn').forEach(el => {
            if (el.textContent.trim() === "Começar agora") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "cadastro.html";
                });
            }
        });

        // Mock button específico
        document.querySelectorAll('.mock-btn').forEach(el => {
            if (el.textContent.trim() === "Começar") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "cadastro.html";
                });
            }
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new ComecarRedirectController();
});

// Exportar global
window.ComecarRedirectController = ComecarRedirectController;
