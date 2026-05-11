// Cadastro Redirect Force System
// Redirecionamento forçado à prova de erros para página de cadastro

class CadastroRedirectController {
    constructor() {
        this.init();
    }

    init() {
        this.forceCadastroRedirect();
    }

    forceCadastroRedirect() {
        // Forçar redirecionamento para qualquer elemento que contenha "Cadastro"
        document.querySelectorAll('a, button, span, div').forEach(el => {
            if (el.textContent.trim() === "Cadastro") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = "cadastro.html";
                });
            }
        });

        // Backup adicional: selecionar por href específico
        document.querySelectorAll('a[href="#cadastro"]').forEach(el => {
            el.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = "cadastro.html";
            });
        });

        // Backup extra: selecionar por classe nav-link com texto "Cadastro"
        document.querySelectorAll('.nav-link').forEach(el => {
            if (el.textContent.trim() === "Cadastro") {
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
    new CadastroRedirectController();
});

// Exportar global
window.CadastroRedirectController = CadastroRedirectController;
