/**
 * BLOQUEIO TOTAL + REDIRECIONAMENTO INTELIGENTE
 * Proteção da página de pedido e interceptação de cards
 */

// Importar Firebase Auth
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Função para interceptar clique nos cards de pacote
function interceptPackageCards() {
  // Procurar por todos os cards de pacote
  const packageCards = document.querySelectorAll('[data-package-id], .package-card, .card-pacote, .pacote-card');
  
  packageCards.forEach(card => {
    // Remove event listeners anteriores para evitar duplicação
    card.removeEventListener('click', handlePackageClick);
    
    // Adiciona novo event listener
    card.addEventListener('click', handlePackageClick);
  });
  
  console.log(`Proteção aplicada em ${packageCards.length} cards de pacote`);
}

// Função para tratar clique no pacote
function handlePackageClick(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Obter ID do pacote de diferentes formas
  let packageId = null;
  
  // Tentar obter de data attribute
  packageId = e.currentTarget.getAttribute('data-package-id');
  
  // Se não encontrar, tentar obter de outras formas
  if (!packageId) {
    packageId = e.currentTarget.getAttribute('id');
    if (packageId && packageId.includes('pacote')) {
      packageId = packageId.replace('pacote-', '');
    }
  }
  
  // Se ainda não encontrar, usar fallback
  if (!packageId) {
    // Tentar obter do texto ou classe
    const text = e.currentTarget.textContent || e.currentTarget.innerText;
    if (text.includes('Básico')) packageId = 'basico';
    else if (text.includes('Profissional')) packageId = 'profissional';
    else if (text.includes('Premium')) packageId = 'premium';
    else if (text.includes('Enterprise')) packageId = 'enterprise';
    else packageId = 'default';
  }
  
  console.log('Pacote clicado:', packageId);
  
  // Verificar se usuário está logado
  if (window.marktechAuth && window.marktechAuth.isUserLoggedIn()) {
    // Usuário logado - redirecionar para pedido
    console.log('Usuário logado, redirecionando para pedido');
    window.location.href = `pedido.html?pacote=${packageId}`;
  } else {
    // Usuário não logado - salvar pacote e redirecionar para cadastro
    console.log('Usuário não logado, salvando pacote e redirecionando');
    localStorage.setItem("pacoteSelecionado", packageId);
    window.location.href = "cadastro.html";
  }
}

// Função para bloquear acesso direto à página de pedido
function blockDirectAccessToPedido() {
  // Verificar se estamos na página de pedido
  if (window.location.pathname.includes('pedido.html') || 
      window.location.href.includes('pedido.html')) {
    
    console.log('Verificando acesso à página de pedido...');
    
    // Verificar se há parâmetro de pacote
    const urlParams = new URLSearchParams(window.location.search);
    const pacoteParam = urlParams.get('pacote');
    
    if (!pacoteParam) {
      console.log('Acesso direto sem pacote - redirecionando');
      window.location.href = "index.html";
      return;
    }
    
    // Verificar autenticação (assíncrono)
    if (window.marktechAuth && window.marktechAuth.isUserLoggedIn()) {
      console.log('Usuário autenticado, acesso permitido');
    } else {
      console.log('Usuário não autenticado, redirecionando para cadastro');
      // Salvar o pacote atual para redirecionamento após login
      localStorage.setItem("pacoteSelecionado", pacoteParam);
      window.location.href = "cadastro.html";
    }
  }
}

// Função para bloquear criação de pedido sem login
function blockOrderCreation() {
  // Procurar por formulários de pedido
  const orderForms = document.querySelectorAll('form[data-order-form], .pedido-form, #form-pedido');
  
  orderForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!window.marktechAuth || !window.marktechAuth.isUserLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        
        alert("Você precisa estar logado para criar um pedido");
        window.location.href = "cadastro.html";
        return false;
      }
    });
  });
}

// Inicializar proteções quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando sistema de proteção de pedidos...');
  
  // Aguardar um pouco para garantir que o auth.js carregou
  setTimeout(() => {
    // Interceptar clique nos cards
    interceptPackageCards();
    
    // Bloquear acesso direto à página de pedido
    blockDirectAccessToPedido();
    
    // Bloquear criação de pedido sem login
    blockOrderCreation();
    
    console.log('Sistema de proteção inicializado com sucesso');
  }, 100);
});

// Monitorar mudanças de autenticação para reaplicar proteções
if (typeof window !== 'undefined') {
  // Se o auth.js estiver disponível, usar onAuthStateChanged
  setTimeout(() => {
    if (window.marktechAuth && window.marktechAuth.isUserLoggedIn()) {
      console.log('Usuário logado detectado, reaplicando proteções');
      interceptPackageCards();
    }
  }, 1000);
}
