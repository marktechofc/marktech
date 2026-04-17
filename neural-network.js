
// Rede Neural Animada - Efeito Tecnológico no Fundo
class NeuralNetwork {
    constructor() {
        this.container = document.getElementById('neuralNetwork');
        this.nodes = [];
        this.connections = [];
        this.nodeCount = 15;
        this.animationId = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        // Criar nós da rede neural
        this.createNodes();
        // Criar conexões
        this.createConnections();
        // Iniciar animação
        this.animate();
    }
    
    createNodes() {
        for (let i = 0; i < this.nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            
            // Posição aleatória
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            node.style.left = `${x}%`;
            node.style.top = `${y}%`;
            node.style.animationDelay = `${Math.random() * 4}s`;
            
            this.container.appendChild(node);
            this.nodes.push({
                element: node,
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 0.02,
                vy: (Math.random() - 0.5) * 0.02
            });
        }
    }
    
    createConnections() {
        // Criar conexões entre nós próximos
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const distance = this.calculateDistance(
                    this.nodes[i].x, this.nodes[i].y,
                    this.nodes[j].x, this.nodes[j].y
                );
                
                // Conectar apenas nós próximos
                if (distance < 30) {
                    this.createConnection(this.nodes[i], this.nodes[j]);
                }
            }
        }
    }
    
    createConnection(node1, node2) {
        const line = document.createElement('div');
        line.className = 'neural-line';
        
        // Calcular posição e ângulo da linha
        const dx = node2.x - node1.x;
        const dy = node2.y - node1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        line.style.width = `${distance}%`;
        line.style.left = `${node1.x}%`;
        line.style.top = `${node1.y}%`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        line.style.animationDelay = `${Math.random() * 8}s`;
        
        this.container.appendChild(line);
        this.connections.push({
            element: line,
            node1: node1,
            node2: node2
        });
    }
    
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    animate() {
        const updatePositions = () => {
            // Atualizar posições dos nós
            this.nodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;
                
                // Bounce nas bordas
                if (node.x <= 0 || node.x >= 100) node.vx *= -1;
                if (node.y <= 0 || node.y >= 100) node.vy *= -1;
                
                // Manter dentro dos limites
                node.x = Math.max(0, Math.min(100, node.x));
                node.y = Math.max(0, Math.min(100, node.y));
                
                // Atualizar elemento DOM
                node.element.style.left = `${node.x}%`;
                node.element.style.top = `${node.y}%`;
            });
            
            // Atualizar conexões
            this.connections.forEach(connection => {
                const dx = connection.node2.x - connection.node1.x;
                const dy = connection.node2.y - connection.node1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                connection.element.style.width = `${distance}%`;
                connection.element.style.left = `${connection.node1.x}%`;
                connection.element.style.top = `${connection.node1.y}%`;
                connection.element.style.transform = `rotate(${angle}deg)`;
            });
            
            this.animationId = requestAnimationFrame(updatePositions);
        };
        
        updatePositions();
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // Limpar elementos
        this.container.innerHTML = '';
        this.nodes = [];
        this.connections = [];
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new NeuralNetwork();
});
