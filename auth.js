// Importações Firebase via CDN oficial
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// CONFIG Firebase real fornecido pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyDJ51q10wnS3M44FN5ynEa448iaFIHF3vw",
  authDomain: "marktech-a89b4.firebaseapp.com",
  projectId: "marktech-a89b4",
  storageBucket: "marktech-a89b4.appspot.com",
  messagingSenderId: "174835858964",
  appId: "1:174835858964:web:f01fdc8158606274dcb101"
};

// Inicialização Firebase (ANTES de qualquer uso)
let app;
let auth;
let provider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  provider = new GoogleAuthProvider();
  
  // Inicializar Firestore
  const db = getFirestore(app);
  console.log('Firebase inicializado com sucesso:', firebaseConfig.projectId);
  
  // Tornar db disponível globalmente
  window.marktechDB = db;
  
} catch (error) {
  console.error('Erro na inicialização do Firebase:', error);
}

// Função para verificar se usuário está logado
function isUserLoggedIn() {
  return auth && auth.currentUser;
}

// Controle de acesso global (ANTES de qualquer ação)
function requireAuth() {
  if (!isUserLoggedIn()) {
    // Salvar URL atual para redirecionamento após login
    localStorage.setItem("redirectAfterLogin", window.location.href);
    
    // Redirecionar para cadastro
    window.location.href = 'cadastro.html';
    return false;
  }
  return true;
}

// Redirecionamento inteligente após login (SEM admin.html)
function handlePostLoginRedirect() {
  const redirect = localStorage.getItem("redirectAfterLogin");
  if (redirect) {
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } else {
    // Redirecionamento padrão para home (NUNCA admin)
    window.location.href = 'index.html';
  }
}

// Função para redirecionar para cadastro se não estiver logado (mantida para compatibilidade)
function requireAuthForPackage(packageId) {
  if (!isUserLoggedIn()) {
    // Salvar pacote selecionado
    localStorage.setItem("pacoteSelecionado", packageId);
    
    // Redirecionar para cadastro
    window.location.href = 'cadastro.html';
    return false;
  }
  return true;
}

// Função para criar pedido no Firestore
async function createOrder(packageData, description) {
  if (!isUserLoggedIn()) {
    console.error('Usuário não autenticado para criar pedido');
    return null;
  }
  
  try {
    const user = auth.currentUser;
    const orderData = {
      userId: user.uid,
      nome: user.displayName,
      email: user.email,
      pacote: packageData,
      descricao: description,
      status: "pendente",
      createdAt: new Date()
    };
    
    const docRef = await addDoc(collection(window.marktechDB, "pedidos"), orderData);
    console.log('Pedido criado com sucesso:', docRef.id);
    return docRef.id;
    
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return null;
  }
}

// Função para listar pedidos do usuário
async function getUserOrders() {
  if (!isUserLoggedIn()) {
    console.error('Usuário não autenticado para listar pedidos');
    return [];
  }
  
  try {
    const user = auth.currentUser;
    const q = query(
      collection(window.marktechDB, "pedidos"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Pedidos do usuário:', orders);
    return orders;
    
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    return [];
  }
}

// Monitorar mudanças de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuário logado:', user.displayName);
    
    // Verificar se há pacote selecionado primeiro (prioridade)
    const pacote = localStorage.getItem("pacoteSelecionado");
    if (pacote) {
      console.log('Redirecionando para pacote:', pacote);
      localStorage.removeItem("pacoteSelecionado");
      
      // Mapear pacotes para páginas corretas
      const paginaMap = {
        'basico': 'pedido-basico.html',
        'intermediario': 'pedido-intermediario.html', 
        'avancado': 'pedido-avancado.html'
      };
      
      const pagina = paginaMap[pacote] || 'pedido-basico.html';
      
      // Redirecionar para página específica do pedido
      setTimeout(() => {
        window.location.href = `${pagina}?pacote=${pacote}`;
      }, 1000);
      return;
    }
    
    // Verificar se há destino salvo para redirecionar
    const redirect = localStorage.getItem("redirectAfterLogin");
    if (redirect) {
      console.log('Redirecionando para destino:', redirect);
      localStorage.removeItem("redirectAfterLogin");
      
      // Redirecionar para destino salvo
      setTimeout(() => {
        window.location.href = redirect;
      }, 1000);
    }
  } else {
    console.log('Usuário não logado');
  }
});

// Esperar DOM carregar (CRÍTICO)
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM carregado, configurando botão Google...');
  
  // Botão Google existente (NÃO criar outro)
  const botao = document.querySelector("#googleLoginBtn");

  // Garantir execução segura
  if (botao) {
    console.log('Botão Google encontrado, adicionando evento...');
    
    botao.addEventListener("click", async () => {
      try {
        // Validação de segurança
        if (!auth) {
          console.error("Auth não inicializado");
          alert("Sistema de autenticação não disponível. Tente novamente.");
          return;
        }

        console.log('Iniciando login com Google...');
        const result = await signInWithPopup(auth, provider);
        console.log("Login sucesso:", result.user);
        
        // Salvar dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL
        }));

        // Usar redirecionamento inteligente após login
        handlePostLoginRedirect();
        
      } catch (error) {
        console.error("Erro Firebase:", error.code, error.message);
        
        // Tratamento simples de erros
        if (error.code === 'auth/popup-closed-by-user') {
          console.log('Login cancelado pelo usuário');
        } else if (error.code === 'auth/popup-blocked') {
          alert('Popup bloqueado. Permita popups para este site.');
        } else if (error.code === 'auth/unauthorized-domain') {
          alert('Domínio não autorizado. Configure no Firebase Console.');
        } else {
          alert('Erro ao fazer login. Tente novamente.');
        }
      }
    });
  } else {
    console.error('Botão Google não encontrado');
  }
});

// Tornar funções e auth disponíveis globalmente
window.marktechAuth = {
  isUserLoggedIn,
  requireAuth,
  requireAuthForPackage,
  auth  // Expor auth para acesso global
};

// Também expor auth diretamente no window
window.auth = auth;
