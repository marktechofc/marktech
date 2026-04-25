import {
    escapeHtml,
    fetchCurrentUserOrders,
    getOrderDisplayFields,
    getStatusClass,
    requireAuthenticatedUser,
    watchCurrentUserOrders
} from "./backend-shared.js";

let orders = [];
let unsubscribeOrders = null;

function createParticles() {
    const particlesOverlay = document.getElementById("particlesOverlay");
    if (!particlesOverlay || particlesOverlay.children.length > 0) {
        return;
    }

    for (let index = 0; index < 20; index += 1) {
        const particle = document.createElement("div");
        particle.className = "tech-particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 25}s`;
        particle.style.animationDuration = `${20 + Math.random() * 15}s`;
        particlesOverlay.appendChild(particle);
    }
}

function buildDetailsMarkup(order) {
    const fields = getOrderDisplayFields(order);

    if (!fields.length) {
        return '<p style="color: rgba(255, 255, 255, 0.7); margin: 0;">Nenhum detalhe adicional encontrado.</p>';
    }

    return fields
        .map((field) => {
            const valueMarkup = field.multiline
                ? `<div style="margin-top: 0.35rem; white-space: pre-wrap;">${escapeHtml(field.value)}</div>`
                : `<span style="margin-left: 0.35rem;">${escapeHtml(field.value)}</span>`;

            return `
                <div style="margin-bottom: 0.85rem; color: rgba(255, 255, 255, 0.82); line-height: 1.55;">
                    <strong style="color: #00ff88;">${escapeHtml(field.label)}:</strong>
                    ${valueMarkup}
                </div>
            `;
        })
        .join("");
}

function buildOrderCard(order) {
    const orderCard = document.createElement("div");
    const detailsId = `detalhes-${order.id}`;
    const detailsMarkup = buildDetailsMarkup(order);

    orderCard.className = "pedido-card";
    orderCard.style.cssText = "cursor: pointer; transition: all 0.3s ease;";
    orderCard.innerHTML = `
        <div class="pedido-header">
            <div class="pedido-info">
                <h3 class="pedido-nome">Pacote ${escapeHtml(order.pacote)}</h3>
                <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.85rem; margin-bottom: 0.5rem;">
                    ${escapeHtml(order.userEmail || order.email || "")}
                </p>
                <div class="pedido-meta">
                    <span class="pedido-data">
                        <i class="far fa-calendar"></i>
                        ${escapeHtml(order.data)}
                    </span>
                    <span class="pedido-id">
                        <i class="fas fa-hashtag"></i>
                        ${escapeHtml(order.id)}
                    </span>
                </div>
            </div>
            <div style="text-align: right;">
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${escapeHtml(order.status)}
                </span>
            </div>
        </div>
        <div class="pedido-package" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 12px; position: relative; z-index: 1;">
            <span class="package-name" style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-box" style="color: #00ff88;"></i>
                ${escapeHtml(order.pacote)}
            </span>
            <span class="package-value" style="font-size: 0.95rem; color: rgba(255, 255, 255, 0.9); display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-tag" style="color: #00ff88;"></i>
                ${escapeHtml(order.valor)}
            </span>
        </div>
        <div style="margin: 1rem 0; position: relative; z-index: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="color: rgba(255, 255, 255, 0.8); font-size: 0.85rem;">Progresso</span>
                <span style="color: #00ff88; font-weight: 600; font-size: 0.85rem;">${escapeHtml(String(order.progresso))}%</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                <div style="width: ${Math.max(0, Math.min(100, Number(order.progresso) || 0))}%; height: 100%; background: linear-gradient(90deg, #00ff88, #00cc66); transition: width 0.3s ease;"></div>
            </div>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin-top: 0.5rem;">
                <i class="far fa-clock"></i> Prazo estimado: ${escapeHtml(order.prazo || "-")}
            </p>
        </div>
        <div id="${detailsId}" style="padding: 1rem; background: rgba(255, 255, 255, 0.03); border-radius: 8px; margin-top: 1rem; position: relative; z-index: 1; display: none;">
            ${detailsMarkup}
        </div>
    `;

    orderCard.addEventListener("click", () => {
        const details = document.getElementById(detailsId);
        const isHidden = details.style.display === "none";

        details.style.display = isHidden ? "block" : "none";
        orderCard.style.transform = isHidden ? "scale(1.02)" : "scale(1)";
        orderCard.style.boxShadow = isHidden ? "0 0 20px rgba(0, 255, 127, 0.3)" : "";
    });

    orderCard.addEventListener("mouseenter", () => {
        const details = document.getElementById(detailsId);

        if (details.style.display === "none") {
            orderCard.style.transform = "translateY(-2px)";
            orderCard.style.boxShadow = "0 8px 25px rgba(0, 255, 127, 0.2)";
        }
    });

    orderCard.addEventListener("mouseleave", () => {
        const details = document.getElementById(detailsId);

        if (details.style.display === "none") {
            orderCard.style.transform = "translateY(0)";
            orderCard.style.boxShadow = "";
        }
    });

    return orderCard;
}

function renderOrders(list = orders) {
    const pedidosList = document.getElementById("pedidosList");
    if (!pedidosList) {
        return;
    }

    pedidosList.innerHTML = "";

    if (!list.length) {
        pedidosList.innerHTML = '<div class="no-results">Nenhum pedido encontrado.</div>';
        return;
    }

    list.forEach((order) => {
        pedidosList.appendChild(buildOrderCard(order));
    });
}

function applySearch(term) {
    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) {
        renderOrders(orders);
        return;
    }

    const filteredOrders = orders.filter((order) => {
        const haystack = [
            order.id,
            order.pacote,
            order.userName,
            order.userEmail,
            order.description
        ]
            .join(" ")
            .toLowerCase();

        return haystack.includes(normalizedTerm);
    });

    renderOrders(filteredOrders);
}

function bindSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", (event) => {
        applySearch(event.target.value);
    });
}

function exposeModalHelpers() {
    window.closeDetailsModal = function closeDetailsModal() {
        const modal = document.getElementById("detailsModal");
        if (modal) {
            modal.classList.remove("active");
        }
    };

    window.closeStatusModal = function closeStatusModal() {
        const modal = document.getElementById("statusModal");
        if (modal) {
            modal.classList.remove("active");
        }
    };

    window.closeAdvancedStatusModal = function closeAdvancedStatusModal() {
        const modal = document.getElementById("advancedStatusModal");
        if (modal) {
            modal.classList.remove("active");
        }
    };
}

async function initializeOrders() {
    try {
        await requireAuthenticatedUser({ redirectTo: "cadastro.html" });
        orders = await fetchCurrentUserOrders();
        renderOrders(orders);

        unsubscribeOrders = await watchCurrentUserOrders(
            (liveOrders) => {
                orders = liveOrders;
                const searchInput = document.getElementById("searchInput");
                applySearch(searchInput ? searchInput.value : "");
            },
            (error) => {
                console.error("Falha ao sincronizar os pedidos do usu\u00e1rio.", error);
            }
        );
    } catch (error) {
        if (error.code !== "auth-required") {
            console.error("N\u00e3o foi poss\u00edvel carregar os pedidos.", error);
            alert("N\u00e3o foi poss\u00edvel carregar seus pedidos agora.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    createParticles();
    bindSearch();
    exposeModalHelpers();
    initializeOrders();
});

window.addEventListener("beforeunload", () => {
    if (typeof unsubscribeOrders === "function") {
        unsubscribeOrders();
    }
});
