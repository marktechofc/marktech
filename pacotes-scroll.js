// Pacotes Smooth Scroll System
// Scroll suave forçado para seção de pacotes

class PacotesScrollController {
    constructor() {
        this.init();
    }

    init() {
        this.forcePacotesScroll();
    }

    forcePacotesScroll() {
        // Forçar scroll suave para qualquer elemento que contenha "Pacotes"
        document.querySelectorAll('a, button, span, div').forEach(el => {
            if (el.textContent.trim() === "Pacotes") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Verificar se a seção existe
                    const pacotesSection = document.getElementById('pacotes');
                    if (pacotesSection) {
                        // Scroll suave
                        pacotesSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        });

        // Backup adicional: selecionar por href específico
        document.querySelectorAll('a[href="#pacotes"]').forEach(el => {
            el.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                
                const pacotesSection = document.getElementById('pacotes');
                if (pacotesSection) {
                    pacotesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Backup extra: selecionar por classe nav-link com texto "Pacotes"
        document.querySelectorAll('.nav-link').forEach(el => {
            if (el.textContent.trim() === "Pacotes") {
                el.addEventListener("click", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const pacotesSection = document.getElementById('pacotes');
                    if (pacotesSection) {
                        pacotesSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            }
        });
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new PacotesScrollController();
});

// Exportar global
window.PacotesScrollController = PacotesScrollController;
