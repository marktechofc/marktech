/**
 * SCRIPT DE FALLBACK PARA CORREÇÃO AUTOMÁTICA DE ROTAS
 * Sistema resiliente a erros de navegação
 */

// Função para corrigir URLs inválidas em tempo de execução
function correctInvalidUrls() {
    // Corrigir links com barra inicial
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('/')) {
            // Remover barra inicial
            const correctedHref = href.substring(1);
            link.setAttribute('href', correctedHref);
            console.log('Corrigido link:', href, '->', correctedHref);
        }
    });

    // Corrigir links que contêm /marktech-main/
    document.querySelectorAll('a[href*="/marktech-main/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            // Remover /marktech-main/ e manter apenas o arquivo
            const correctedHref = href.replace('/marktech-main/', '');
            link.setAttribute('href', correctedHref);
            console.log('Corrigido link:', href, '->', correctedHref);
        }
    });

    // Corrigir onclick handlers dinâmicos
    document.querySelectorAll('[onclick]').forEach(element => {
        const onclick = element.getAttribute('onclick');
        if (onclick && (onclick.includes('location.href = "/') || onclick.includes('/marktech-main/'))) {
            // Corrigir onclick com rotas inválidas
            const correctedOnclick = onclick
                .replace(/location\.href\s*=\s*"\/([^"]*)"/g, 'location.href = "$1"')
                .replace(/\/marktech-main\//g, '');
            
            element.setAttribute('onclick', correctedOnclick);
            console.log('Corrigido onclick:', onclick, '->', correctedOnclick);
        }
    });
}

// Interceptador de navegação para corrigir URLs em tempo real
function interceptNavigation() {
    // Sobrescrever window.location.href para correção automática
    const originalLocationHref = window.location.href;
    let locationSetter = Object.getOwnPropertyDescriptor(window.location, 'href')?.set;
    
    if (!locationSetter) {
        // Fallback para navegadores mais antigos
        Object.defineProperty(window.location, 'href', {
            set: function(value) {
                if (typeof value === 'string') {
                    // Corrigir URL se necessário
                    let correctedValue = value;
                    
                    // Remover barra inicial
                    if (correctedValue.startsWith('/')) {
                        correctedValue = correctedValue.substring(1);
                    }
                    
                    // Remover /marktech-main/
                    if (correctedValue.includes('/marktech-main/')) {
                        correctedValue = correctedValue.replace('/marktech-main/', '');
                    }
                    
                    console.log('Corrigida navegação:', value, '->', correctedValue);
                    
                    // Usar o método original para navegar
                    window.location.assign(correctedValue);
                }
            },
            get: function() {
                return originalLocationHref;
            }
        });
    }
}

// Função para corrigir URLs armazenadas no localStorage
function correctStoredUrls() {
    const keysToCheck = ['redirectAfterLogin', 'pacoteSelecionado'];
    
    keysToCheck.forEach(key => {
        const value = localStorage.getItem(key);
        if (value && (value.startsWith('/') || value.includes('/marktech-main/'))) {
            let correctedValue = value;
            
            // Remover barra inicial
            if (correctedValue.startsWith('/')) {
                correctedValue = correctedValue.substring(1);
            }
            
            // Remover /marktech-main/
            if (correctedValue.includes('/marktech-main/')) {
                correctedValue = correctedValue.replace('/marktech-main/', '');
            }
            
            localStorage.setItem(key, correctedValue);
            console.log('Corrigido localStorage:', key, value, '->', correctedValue);
        }
    });
}

// Função para corrigir URLs em eventos de clique
function correctClickEvents() {
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Verificar se é um link
        if (target.tagName === 'A' && target.href) {
            let href = target.href;
            
            // Corrigir URL se necessário
            if (href.includes('/marktech-main/')) {
                e.preventDefault();
                const correctedHref = href.replace('/marktech-main/', '');
                console.log('Corrigido clique:', href, '->', correctedHref);
                window.location.href = correctedHref;
            } else if (href.includes(window.location.origin + '/')) {
                e.preventDefault();
                const correctedHref = href.replace(window.location.origin + '/', '');
                console.log('Corrigido clique:', href, '->', correctedHref);
                window.location.href = correctedHref;
            }
        }
    });
}

// Inicializar sistema de fallback quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de fallback de rotas...');
    
    // Corrigir URLs existentes
    correctInvalidUrls();
    
    // Corrigir URLs armazenadas
    correctStoredUrls();
    
    // Interceptar navegação
    interceptNavigation();
    
    // Corrigir eventos de clique
    correctClickEvents();
    
    console.log('Sistema de fallback de rotas inicializado com sucesso');
});

// Também inicializar imediatamente para URLs que possam ser processadas antes do DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', correctInvalidUrls);
} else {
    correctInvalidUrls();
}

// Exportar funções para uso global
window.routeFallback = {
    correctInvalidUrls,
    correctStoredUrls,
    interceptNavigation,
    correctClickEvents
};
