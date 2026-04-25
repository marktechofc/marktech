import {
    deleteOrderById,
    ensureAdminAccess,
    escapeHtml,
    getOrderDisplayFields,
    logoutToHome,
    statusFromProgress,
    updateOrder,
    watchAllOrders
} from "./backend-shared.js";

let orders = [];
let ordersUnsubscribe = null;
let salesChartInstance = null;
let ordersChartInstance = null;

function parseOrderAmount(order) {
    return Number(order.valorNumero) || 0;
}

function buildUniqueCustomers(orderList) {
    const customerMap = new Map();

    orderList.forEach((order) => {
        if (!order.userId) {
            return;
        }

        if (!customerMap.has(order.userId)) {
            customerMap.set(order.userId, {
                id: order.userId,
                name: order.userName || order.name || "Cliente",
                email: order.userEmail || order.email || "",
                status: "Ativo",
                date: order.data || "-"
            });
        }
    });

    return Array.from(customerMap.values());
}

function updateAdminIdentity(user) {
    const avatar = document.querySelector(".admin-user-avatar");
    const name = document.querySelector(".admin-user-name");
    const role = document.querySelector(".admin-user-role");

    if (avatar) {
        avatar.textContent = (user.displayName || user.email || "A").trim().charAt(0).toUpperCase();
    }

    if (name) {
        name.textContent = user.displayName || user.email || "Administrador";
    }

    if (role) {
        role.textContent = "Administrator";
    }
}

function initializeNavigation() {
    const navItems = document.querySelectorAll(".admin-nav-item");
    const sections = document.querySelectorAll(".admin-section");
    const sectionTitle = document.getElementById("sectionTitle");

    navItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            event.preventDefault();

            navItems.forEach((navItem) => navItem.classList.remove("active"));
            sections.forEach((section) => {
                section.classList.remove("active");
                section.style.display = "none";
            });

            item.classList.add("active");

            const targetSection = document.getElementById(item.dataset.section);
            if (targetSection) {
                targetSection.classList.add("active");
                targetSection.style.display = "block";
            }

            if (sectionTitle) {
                const label = item.querySelector("span");
                sectionTitle.textContent = label ? label.textContent : "Dashboard";
            }
        });
    });
}

function renderProductsPlaceholder() {
    const container = document.getElementById("productsContainer");
    if (!container) {
        return;
    }

    container.innerHTML = `
        <div style="text-align: center; padding: var(--space-2xl); color: var(--text-secondary); grid-column: 1 / -1;">
            <i class="fas fa-box" style="font-size: 3rem; margin-bottom: var(--space-md); opacity: 0.5;"></i>
            <div style="font-size: 1.2rem; margin-bottom: var(--space-xs);">Nenhum produto cadastrado</div>
            <div style="font-size: 0.9rem; opacity: 0.7;">A integra\u00e7\u00e3o de pedidos foi conectada. Produtos continuam sem cadastro pr\u00f3prio.</div>
        </div>
    `;
}

function renderCustomersTable(orderList) {
    const tbody = document.getElementById("customersTableBody");
    if (!tbody) {
        return;
    }

    const customers = buildUniqueCustomers(orderList);

    if (!customers.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: var(--space-xl); color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 2rem; margin-bottom: var(--space-sm); opacity: 0.5;"></i>
                    <div style="margin-bottom: var(--space-xs);">Nenhum cliente encontrado</div>
                    <div style="font-size: 0.85rem; opacity: 0.7;">Os clientes aparecer\u00e3o aqui quando existirem pedidos.</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = customers
        .map((customer) => {
            return `
                <tr>
                    <td>${escapeHtml(customer.name)}</td>
                    <td>${escapeHtml(customer.email)}</td>
                    <td><span class="admin-badge pago">${escapeHtml(customer.status)}</span></td>
                    <td>${escapeHtml(customer.date)}</td>
                    <td>
                        <button class="admin-btn" onclick="viewCustomer('${escapeHtml(customer.id)}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function updateDashboard(orderList) {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + parseOrderAmount(order), 0);
    const totalCustomers = buildUniqueCustomers(orderList).length;
    const completedOrders = orderList.filter((order) =>
        String(order.status || "").toLowerCase().includes("concl")
    ).length;
    const completionRate = totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0;

    const counters = document.querySelectorAll(".admin-card-value");
    if (counters[0]) {
        counters[0].textContent = String(totalOrders);
    }

    if (counters[1]) {
        counters[1].textContent = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(totalRevenue);
    }

    if (counters[2]) {
        counters[2].textContent = String(totalCustomers);
    }

    if (counters[3]) {
        counters[3].textContent = `${completionRate}%`;
    }
}

function buildOrderDetailsMarkup(order) {
    return getOrderDisplayFields(order)
        .map((field) => {
            return `
                <div style="margin-bottom: 12px;">
                    <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 4px;">
                        ${escapeHtml(field.label)}
                    </div>
                    <div style="font-weight: 500; white-space: ${field.multiline ? "pre-wrap" : "normal"};">
                        ${escapeHtml(field.value)}
                    </div>
                </div>
            `;
        })
        .join("");
}

function openOrderModal(order) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.cssText = [
        "position: fixed",
        "top: 0",
        "left: 0",
        "width: 100%",
        "height: 100%",
        "background: rgba(0,0,0,0.9)",
        "z-index: 10000",
        "display: flex",
        "justify-content: center",
        "align-items: center",
        "padding: 24px"
    ].join(";");

    modal.innerHTML = `
        <div style="background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%); border: 1px solid rgba(0,255,136,0.3); border-radius: 12px; padding: 30px; max-width: 720px; width: 100%; max-height: 85vh; overflow-y: auto; color: #e0e0e0; box-shadow: 0 0 40px rgba(0,255,136,0.2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(0,255,136,0.3); padding-bottom: 12px;">
                <h2 style="margin: 0; color: #00ff88; font-family: 'Orbitron', sans-serif; font-size: 1.3rem;">
                    <i class="fas fa-file-invoice"></i> Detalhes do Pedido
                </h2>
                <button type="button" style="background: transparent; border: 1px solid #00ff88; color: #00ff88; padding: 8px 15px; border-radius: 6px; cursor: pointer;">Fechar</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 20px;">
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #00ff88;">
                    <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">ID</div>
                    <div style="font-weight: 600; color: #00ff88;">${escapeHtml(order.id)}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #00ff88;">
                    <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">Status</div>
                    <div style="font-weight: 600;">${escapeHtml(order.status)}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #00ff88;">
                    <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">Pacote</div>
                    <div style="font-weight: 600;">${escapeHtml(order.pacote)}</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border-left: 3px solid #00ff88;">
                    <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">Valor</div>
                    <div style="font-weight: 600;">${escapeHtml(order.valor)}</div>
                </div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 18px; border-left: 3px solid #00ff88;">
                <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 10px; font-weight: 600;">
                    <i class="fas fa-user"></i> Cliente
                </div>
                <div style="margin-bottom: 8px;"><span style="color: #888;">Nome:</span> <span style="color: #fff;">${escapeHtml(order.userName)}</span></div>
                <div><span style="color: #888;">E-mail:</span> <span style="color: #fff;">${escapeHtml(order.userEmail)}</span></div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border-left: 3px solid #00a8ff;">
                ${buildOrderDetailsMarkup(order)}
            </div>
        </div>
    `;

    const closeButton = modal.querySelector("button");
    closeButton.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

function renderOrdersTable(orderList) {
    const tbody = document.getElementById("ordersTableBody");
    if (!tbody) {
        return;
    }

    if (!orderList.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: var(--space-xl); color: var(--text-secondary);">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: var(--space-sm); opacity: 0.5;"></i>
                    <div style="margin-bottom: var(--space-xs);">Nenhum pedido encontrado</div>
                    <div style="font-size: 0.85rem; opacity: 0.7;">Os pedidos aparecer\u00e3o aqui quando forem criados.</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orderList
        .map((order) => {
            const normalizedStatus = String(order.status || "").toLowerCase();
            const statusClass = normalizedStatus.includes("cancel")
                ? "cancelado"
                : normalizedStatus.includes("concl")
                    ? "pago"
                    : "pendente";

            return `
                <tr>
                    <td>${escapeHtml(order.id)}</td>
                    <td>${escapeHtml(order.userName)}</td>
                    <td>${escapeHtml(order.pacote)}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(order.description)}">
                        ${escapeHtml(order.description || "-")}
                    </td>
                    <td><span class="admin-badge ${statusClass}">${escapeHtml(order.status)}</span></td>
                    <td style="font-family: 'Orbitron', monospace; color: var(--neon-green);">${escapeHtml(order.valor)}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range" min="0" max="100" value="${Math.max(0, Math.min(100, Number(order.progresso) || 0))}"
                                onchange="updateProgress('${escapeHtml(order.id)}', this.value)"
                                style="width: 80px; cursor: pointer;">
                            <span style="font-size: 0.8rem; color: var(--neon-green); min-width: 35px;">${escapeHtml(String(order.progresso))}%</span>
                        </div>
                    </td>
                    <td>
                        <button class="admin-btn" onclick="viewOrder('${escapeHtml(order.id)}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="admin-btn" onclick="deleteOrder('${escapeHtml(order.id)}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");
}

function updateCharts(orderList) {
    const salesCanvas = document.getElementById("salesChart");
    const ordersCanvas = document.getElementById("ordersChart");

    if (!salesCanvas || !ordersCanvas || typeof Chart === "undefined") {
        return;
    }

    const today = new Date();
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - index));
        return date;
    });

    const salesLabels = lastSevenDays.map((date) =>
        date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    );
    const salesData = lastSevenDays.map((date) => {
        const targetDay = date.toISOString().slice(0, 10);

        return orderList
            .filter((order) => String(order.dataISO || "").slice(0, 10) === targetDay)
            .reduce((sum, order) => sum + parseOrderAmount(order), 0);
    });

    const statusBuckets = {
        Pendente: 0,
        "Em an\u00e1lise": 0,
        "Em desenvolvimento": 0,
        Conclu\u00eddo: 0,
        Cancelado: 0
    };

    orderList.forEach((order) => {
        const currentStatus = statusBuckets[order.status] !== undefined ? order.status : "Pendente";
        statusBuckets[currentStatus] += 1;
    });

    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(salesCanvas.getContext("2d"), {
        type: "line",
        data: {
            labels: salesLabels,
            datasets: [
                {
                    label: "Vendas",
                    data: salesData,
                    borderColor: "#00ff88",
                    backgroundColor: "rgba(0, 255, 136, 0.1)",
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(255, 255, 255, 0.1)"
                    },
                    ticks: {
                        color: "#888888",
                        callback(value) {
                            return new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                },
                x: {
                    ticks: {
                        color: "#888888"
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.05)"
                    }
                }
            }
        }
    });

    if (ordersChartInstance) {
        ordersChartInstance.destroy();
    }

    ordersChartInstance = new Chart(ordersCanvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: Object.keys(statusBuckets),
            datasets: [
                {
                    data: Object.values(statusBuckets),
                    backgroundColor: ["#ffd700", "#00a8ff", "#007bff", "#00ff88", "#ff6b6b"],
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#888888"
                    }
                }
            }
        }
    });
}

function refreshAdminData(orderList) {
    orders = orderList;
    renderOrdersTable(orderList);
    renderCustomersTable(orderList);
    updateDashboard(orderList);
    updateCharts(orderList);
}

function exposeWindowActions() {
    window.toggleSidebar = function toggleSidebar() {
        const sidebar = document.getElementById("adminSidebar");
        const main = document.getElementById("adminMain");

        if (sidebar) {
            sidebar.classList.toggle("collapsed");
            sidebar.classList.toggle("active");
        }

        if (main) {
            main.classList.toggle("expanded");
        }
    };

    window.updateProgress = async function updateProgress(orderId, progress) {
        try {
            await updateOrder(orderId, {
                progresso: Number(progress),
                status: statusFromProgress(progress)
            });
        } catch (error) {
            console.error("N\u00e3o foi poss\u00edvel atualizar o progresso do pedido.", error);
            alert("N\u00e3o foi poss\u00edvel atualizar o progresso do pedido.");
        }
    };

    window.deleteOrder = async function deleteOrder(orderId) {
        if (!window.confirm(`Tem certeza que deseja excluir o pedido ${orderId}?`)) {
            return;
        }

        try {
            await deleteOrderById(orderId);
        } catch (error) {
            console.error("N\u00e3o foi poss\u00edvel excluir o pedido.", error);
            alert("N\u00e3o foi poss\u00edvel excluir o pedido.");
        }
    };

    window.viewOrder = function viewOrder(orderId) {
        const order = orders.find((item) => item.id === orderId);

        if (!order) {
            return;
        }

        openOrderModal(order);
    };

    window.handleLogout = function handleLogout() {
        if (window.confirm("Deseja realmente sair do painel admin?")) {
            logoutToHome();
        }
    };

    window.openAddProductModal = function openAddProductModal() {
        alert("A integra\u00e7\u00e3o de produtos ainda n\u00e3o foi configurada.");
    };

    window.viewCustomer = function viewCustomer(customerId) {
        const customer = buildUniqueCustomers(orders).find((item) => item.id === customerId);

        if (!customer) {
            return;
        }

        alert(`Cliente: ${customer.name}\nE-mail: ${customer.email}\nPrimeiro pedido: ${customer.date}`);
    };

    window.saveSettings = function saveSettings() {
        alert("As configura\u00e7\u00f5es visuais do painel ainda n\u00e3o possuem persist\u00eancia dedicada.");
    };

    window.toggleMaintenance = function toggleMaintenance(element) {
        element.classList.toggle("active");
    };

    window.toggleNotifications = function toggleNotifications(element) {
        element.classList.toggle("active");
    };
}

async function initializeAdmin() {
    try {
        const { user } = await ensureAdminAccess();
        updateAdminIdentity(user);
        exposeWindowActions();
        initializeNavigation();
        renderProductsPlaceholder();

        ordersUnsubscribe = await watchAllOrders(
            (liveOrders) => {
                refreshAdminData(liveOrders);
            },
            (error) => {
                console.error("Falha ao sincronizar o painel admin.", error);
            }
        );
    } catch (error) {
        console.error("Acesso negado ao painel admin.", error);

        if (error.code === "permission-denied") {
            alert("Acesso negado. Apenas a conta administradora pode abrir este painel.");
        } else {
            alert("N\u00e3o foi poss\u00edvel carregar o painel admin.");
        }

        window.location.replace("index.html");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeAdmin();
});

window.addEventListener("beforeunload", () => {
    if (typeof ordersUnsubscribe === "function") {
        ordersUnsubscribe();
    }
});
