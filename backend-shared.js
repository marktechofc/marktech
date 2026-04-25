import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { auth, db } from "./firebase-config.js";

const LOCAL_ORDERS_KEY = "pedidos";
const LOCAL_ADMIN_KEY = "adminBootstrapLocal";
const LOGIN_PAGE = "cadastro.html";
const HOME_PAGE = "index.html";
const ADMIN_BOOTSTRAP_PATH = ["adminConfig", "bootstrap"];
const localOrderSubscribers = new Set();

export const PACKAGE_CATALOG = {
    basico: {
        key: "basico",
        label: "B\u00e1sico",
        priceNumber: 149.9,
        priceLabel: "R$ 149,90",
        eta: "3 a 5 dias",
        page: "pedido-basico.html"
    },
    intermediario: {
        key: "intermediario",
        label: "Intermedi\u00e1rio",
        priceNumber: 299.9,
        priceLabel: "R$ 299,90",
        eta: "5 a 7 dias",
        page: "pedido-intermediario.html"
    },
    avancado: {
        key: "avancado",
        label: "Avan\u00e7ado",
        priceNumber: 479.9,
        priceLabel: "R$ 479,90",
        eta: "5 a 10 dias",
        page: "pedido-avancado.html"
    }
};

const FIELD_LABELS = {
    name: "Nome Completo",
    email: "E-mail",
    siteType: "Tipo de Site",
    pages: "Quantidade de P\u00e1ginas",
    style: "Estilo Desejado",
    description: "Descri\u00e7\u00e3o Detalhada",
    includeLogin: "Sistema de Login",
    includeRating: "Sistema de Avalia\u00e7\u00e3o",
    includePayment: "Integra\u00e7\u00e3o com Pagamento"
};

const SITE_TYPE_LABELS = {
    institucional: "Site Institucional",
    portfolio: "Portf\u00f3lio",
    landing: "Landing Page",
    blog: "Blog",
    ecommerce: "E-commerce",
    marketplace: "Marketplace",
    sistema: "Sistema Empresarial",
    dashboard: "Dashboard Corporativo",
    plataforma: "Plataforma Web",
    outro: "Outro"
};

function getBootstrapDoc() {
    return doc(db, ADMIN_BOOTSTRAP_PATH[0], ADMIN_BOOTSTRAP_PATH[1]);
}

function nowIso() {
    return new Date().toISOString();
}

function toIso(value) {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value.toDate === "function") {
        return value.toDate().toISOString();
    }

    return null;
}

function parseCurrency(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return 0;
    }

    const cleaned = value
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");

    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
    const numeric = Number.isFinite(value) ? value : parseCurrency(value);
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(numeric);
}

function isPermissionError(error) {
    return error && (
        error.code === "permission-denied" ||
        error.code === "failed-precondition" ||
        String(error.message || "").toLowerCase().includes("missing or insufficient permissions") ||
        String(error.message || "").toLowerCase().includes("permission")
    );
}

function safeTrim(value) {
    return typeof value === "string" ? value.trim() : value;
}

function removeUndefinedEntries(value) {
    if (Array.isArray(value)) {
        return value.map((entry) => removeUndefinedEntries(entry));
    }

    if (!value || typeof value !== "object") {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([, entryValue]) => entryValue !== undefined)
            .map(([entryKey, entryValue]) => [entryKey, removeUndefinedEntries(entryValue)])
    );
}

function coerceOptionalBoolean(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
}

function packageKeyFromValue(value) {
    if (!value) {
        return "basico";
    }

    const normalized = String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    if (normalized.includes("intermedi")) {
        return "intermediario";
    }

    if (normalized.includes("avanc")) {
        return "avancado";
    }

    return "basico";
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function statusFromProgress(progress) {
    const numeric = Math.max(0, Math.min(100, Number(progress) || 0));

    if (numeric === 0) {
        return "Cancelado";
    }

    if (numeric >= 100) {
        return "Conclu\u00eddo";
    }

    if (numeric >= 75) {
        return "Em finaliza\u00e7\u00e3o";
    }

    if (numeric >= 45) {
        return "Em desenvolvimento";
    }

    if (numeric >= 20) {
        return "Em an\u00e1lise";
    }

    return "Pendente";
}

function buildStoredUser(user) {
    if (!user) {
        return null;
    }

    return {
        uid: user.uid,
        nome: user.displayName || user.email || "Usu\u00e1rio",
        email: user.email || "",
        foto: user.photoURL || "",
        photoURL: user.photoURL || ""
    };
}

export function syncStoredUser(user) {
    try {
        if (!user) {
            localStorage.removeItem("user");
            return;
        }

        localStorage.setItem("user", JSON.stringify(buildStoredUser(user)));
    } catch (error) {
        console.warn("N\u00e3o foi poss\u00edvel sincronizar o usu\u00e1rio localmente.", error);
    }
}

onAuthStateChanged(auth, (user) => {
    syncStoredUser(user);
});

export function waitForCurrentUser() {
    if (auth.currentUser) {
        return Promise.resolve(auth.currentUser);
    }

    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user || null);
        });
    });
}

export async function requireAuthenticatedUser(options = {}) {
    const redirectTo = options.redirectTo || LOGIN_PAGE;
    const user = await waitForCurrentUser();

    if (user) {
        return user;
    }

    if (redirectTo) {
        window.location.replace(redirectTo);
    }

    const error = new Error("AUTH_REQUIRED");
    error.code = "auth-required";
    throw error;
}

export async function logoutToHome() {
    try {
        await signOut(auth);
    } catch (error) {
        console.warn("Falha ao encerrar sess\u00e3o no Firebase.", error);
    }

    try {
        localStorage.removeItem("selectedPackage");
        sessionStorage.removeItem("redirectAfterLogin");
    } catch (error) {
        console.warn("Falha ao limpar o estado local.", error);
    }

    syncStoredUser(null);
    window.location.replace(HOME_PAGE);
}

export function getPackageConfig(packageKey) {
    return PACKAGE_CATALOG[packageKey] || PACKAGE_CATALOG.basico;
}

export function validateRequiredFields(fieldIds) {
    let hasErrors = false;

    fieldIds.forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(`${fieldId}Error`);

        if (!field) {
            return;
        }

        const value = safeTrim(field.value);
        const isEmpty = value === "";
        const isInvalid = typeof field.checkValidity === "function" ? !field.checkValidity() : false;

        if (isEmpty || isInvalid) {
            hasErrors = true;
            field.style.borderColor = "#ff4444";

            if (error) {
                error.style.display = "block";
            }
        } else {
            field.style.borderColor = "";

            if (error) {
                error.style.display = "none";
            }
        }
    });

    return !hasErrors;
}

export function readFormFields(form) {
    const fields = {};
    const elements = Array.from(form.elements || []);

    elements.forEach((element) => {
        if (!element.name || element.disabled) {
            return;
        }

        if (element.type === "checkbox") {
            fields[element.name] = Boolean(element.checked);
            return;
        }

        if (element.type === "radio") {
            if (!Object.prototype.hasOwnProperty.call(fields, element.name)) {
                fields[element.name] = "";
            }

            if (element.checked) {
                fields[element.name] = element.value;
            }

            return;
        }

        fields[element.name] = element.value;
    });

    return fields;
}

function readLocalOrders() {
    try {
        const raw = JSON.parse(localStorage.getItem(LOCAL_ORDERS_KEY) || "[]");
        return Array.isArray(raw) ? raw : [];
    } catch (error) {
        console.warn("Falha ao ler o cache local de pedidos.", error);
        return [];
    }
}

function writeLocalOrders(orders) {
    try {
        localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    } catch (error) {
        console.warn("Falha ao gravar o cache local de pedidos.", error);
    }

    notifyLocalOrderSubscribers();
}

function readLocalAdminBootstrap() {
    try {
        const raw = JSON.parse(localStorage.getItem(LOCAL_ADMIN_KEY) || "null");
        return raw && typeof raw === "object" ? raw : null;
    } catch (error) {
        console.warn("Falha ao ler o admin local.", error);
        return null;
    }
}

function writeLocalAdminBootstrap(data) {
    try {
        localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn("Falha ao gravar o admin local.", error);
    }
}

export function normalizeOrderData(documentId, rawOrder = {}) {
    const packageKey = rawOrder.pacoteKey || packageKeyFromValue(rawOrder.pacote);
    const packageConfig = getPackageConfig(packageKey);
    const dataISO =
        rawOrder.dataISO ||
        rawOrder.createdAtIso ||
        toIso(rawOrder.createdAt) ||
        nowIso();
    const formFields = {
        ...(rawOrder.formFields || {})
    };

    if (rawOrder.name && !Object.prototype.hasOwnProperty.call(formFields, "name")) {
        formFields.name = rawOrder.name;
    }

    if (rawOrder.email && !Object.prototype.hasOwnProperty.call(formFields, "email")) {
        formFields.email = rawOrder.email;
    }

    if (rawOrder.siteType && !Object.prototype.hasOwnProperty.call(formFields, "siteType")) {
        formFields.siteType = rawOrder.siteType;
    }

    if (rawOrder.pages && !Object.prototype.hasOwnProperty.call(formFields, "pages")) {
        formFields.pages = rawOrder.pages;
    }

    if (rawOrder.style && !Object.prototype.hasOwnProperty.call(formFields, "style")) {
        formFields.style = rawOrder.style;
    }

    if (rawOrder.description && !Object.prototype.hasOwnProperty.call(formFields, "description")) {
        formFields.description = rawOrder.description;
    }

    ["includeLogin", "includeRating", "includePayment"].forEach((fieldName) => {
        const normalizedBoolean = coerceOptionalBoolean(rawOrder[fieldName]);

        if (
            normalizedBoolean !== undefined &&
            !Object.prototype.hasOwnProperty.call(formFields, fieldName)
        ) {
            formFields[fieldName] = normalizedBoolean;
        }
    });

    const valorNumero = Number.isFinite(rawOrder.valorNumero)
        ? Number(rawOrder.valorNumero)
        : parseCurrency(rawOrder.valor || packageConfig.priceLabel);

    const normalized = {
        id: rawOrder.id || rawOrder.orderId || documentId,
        orderId: rawOrder.orderId || rawOrder.id || documentId,
        firestoreId: documentId,
        userId: rawOrder.userId || "",
        userEmail: rawOrder.userEmail || formFields.email || rawOrder.email || "",
        userName: rawOrder.userName || formFields.name || rawOrder.name || "Usu\u00e1rio",
        pacoteKey: packageKey,
        pacote: rawOrder.pacote || packageConfig.label,
        valorNumero,
        valor: rawOrder.valor || formatCurrency(valorNumero || packageConfig.priceNumber),
        status: rawOrder.status || "Pendente",
        progresso: Math.max(0, Math.min(100, Number(rawOrder.progresso) || 10)),
        prazo: rawOrder.prazo || packageConfig.eta,
        data: rawOrder.data || new Date(dataISO).toLocaleDateString("pt-BR"),
        dataISO,
        formFields,
        createdAtIso: dataISO
    };

    normalized.name = formFields.name || rawOrder.name || "";
    normalized.email = formFields.email || rawOrder.email || normalized.userEmail;
    normalized.siteType = formFields.siteType || rawOrder.siteType || "";
    normalized.pages = formFields.pages || rawOrder.pages || "";
    normalized.style = formFields.style || rawOrder.style || "";
    normalized.description =
        formFields.description ||
        rawOrder.description ||
        rawOrder.descricao ||
        "";

    ["includeLogin", "includeRating", "includePayment"].forEach((fieldName) => {
        const formValue = coerceOptionalBoolean(formFields[fieldName]);
        const rawValue = coerceOptionalBoolean(rawOrder[fieldName]);
        const normalizedBoolean = formValue !== undefined ? formValue : rawValue;

        if (normalizedBoolean !== undefined) {
            normalized[fieldName] = normalizedBoolean;
            normalized.formFields[fieldName] = normalizedBoolean;
        }
    });

    return normalized;
}

function sortOrdersDescending(orders) {
    return [...orders].sort((left, right) => {
        return String(right.dataISO || "").localeCompare(String(left.dataISO || ""));
    });
}

function notifyLocalOrderSubscribers() {
    const orders = getCachedOrders();

    localOrderSubscribers.forEach((listener) => {
        try {
            listener(orders);
        } catch (error) {
            console.warn("Falha ao notificar atualizacao local de pedidos.", error);
        }
    });
}

function subscribeToLocalOrders(listener) {
    if (typeof listener !== "function") {
        return () => {};
    }

    localOrderSubscribers.add(listener);

    function handleStorage(event) {
        if (event && event.key && event.key !== LOCAL_ORDERS_KEY) {
            return;
        }

        listener(getCachedOrders());
    }

    window.addEventListener("storage", handleStorage);

    return () => {
        localOrderSubscribers.delete(listener);
        window.removeEventListener("storage", handleStorage);
    };
}

function upsertLocalOrder(order) {
    const current = readLocalOrders()
        .map((entry) => normalizeOrderData(entry.id || entry.orderId || "", entry))
        .filter((entry) => entry.id !== order.id);

    current.unshift(order);
    writeLocalOrders(current);
}

function replaceLocalOrders(orders) {
    writeLocalOrders(sortOrdersDescending(orders));
}

function replaceUserLocalOrders(userId, orders) {
    const normalizedOrders = sortOrdersDescending(
        orders.map((entry) => normalizeOrderData(entry.id || entry.orderId || "", entry))
    );
    const preservedOrders = getCachedOrders().filter((order) => order.userId !== userId);

    writeLocalOrders(sortOrdersDescending([...preservedOrders, ...normalizedOrders]));
}

export function getCachedOrders() {
    return sortOrdersDescending(
        readLocalOrders().map((entry) => normalizeOrderData(entry.id || entry.orderId || "", entry))
    );
}

export async function saveOrderFromForm({ form, packageKey }) {
    const user = await requireAuthenticatedUser();
    const packageConfig = getPackageConfig(packageKey);
    const fields = readFormFields(form);
    const currentIso = nowIso();
    const orderId = `PED_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const normalizedFields = {
        ...fields
    };

    ["name", "email", "siteType", "pages", "style", "description"].forEach((fieldName) => {
        if (typeof normalizedFields[fieldName] === "string") {
            normalizedFields[fieldName] = normalizedFields[fieldName].trim();
        }
    });

    const orderPayload = removeUndefinedEntries({
        id: orderId,
        orderId,
        userId: user.uid,
        userEmail: user.email || normalizedFields.email || "",
        userName: user.displayName || normalizedFields.name || user.email || "Usu\u00e1rio",
        pacoteKey: packageConfig.key,
        pacote: packageConfig.label,
        valorNumero: packageConfig.priceNumber,
        valor: packageConfig.priceLabel,
        status: "Pendente",
        progresso: 10,
        prazo: packageConfig.eta,
        data: new Date(currentIso).toLocaleDateString("pt-BR"),
        dataISO: currentIso,
        formFields: normalizedFields,
        name: normalizedFields.name || "",
        email: normalizedFields.email || "",
        siteType: normalizedFields.siteType || "",
        pages: normalizedFields.pages || "",
        style: normalizedFields.style || "",
        description: normalizedFields.description || "",
        includeLogin: normalizedFields.includeLogin,
        includeRating: normalizedFields.includeRating,
        includePayment: normalizedFields.includePayment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    const normalizedOrder = normalizeOrderData(orderId, orderPayload);
    
    try {
        await setDoc(doc(db, "pedidos", orderId), orderPayload);
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }

        console.warn("Firestore sem permiss\u00e3o para escrita. Pedido salvo apenas no cache local.", error);
    }

    upsertLocalOrder(normalizedOrder);
    localStorage.removeItem("selectedPackage");

    return normalizedOrder;
}

export async function fetchCurrentUserOrders() {
    const user = await requireAuthenticatedUser();
    
    try {
        const ordersQuery = query(collection(db, "pedidos"), where("userId", "==", user.uid));
        const snapshot = await getDocs(ordersQuery);
        const orders = snapshot.docs.map((entry) => normalizeOrderData(entry.id, entry.data()));
        const sortedOrders = sortOrdersDescending(orders);

        replaceUserLocalOrders(user.uid, sortedOrders);
        return sortedOrders;
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }

        return getCachedOrders().filter((order) => order.userId === user.uid);
    }
}

export async function fetchAllOrders() {
    try {
        const snapshot = await getDocs(collection(db, "pedidos"));
        const orders = snapshot.docs.map((entry) => normalizeOrderData(entry.id, entry.data()));
        const sortedOrders = sortOrdersDescending(orders);

        replaceLocalOrders(sortedOrders);
        return sortedOrders;
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }

        return getCachedOrders();
    }
}

export async function watchCurrentUserOrders(callback, onError) {
    const user = await requireAuthenticatedUser();
    const ordersQuery = query(collection(db, "pedidos"), where("userId", "==", user.uid));
    let localUnsubscribe = null;

    const remoteUnsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
            const orders = sortOrdersDescending(
                snapshot.docs.map((entry) => normalizeOrderData(entry.id, entry.data()))
            );

            replaceUserLocalOrders(user.uid, orders);
            callback(orders);
        },
        (error) => {
            if (!isPermissionError(error)) {
                if (typeof onError === "function") {
                    onError(error);
                }

                return;
            }

            if (localUnsubscribe) {
                return;
            }

            localUnsubscribe = subscribeToLocalOrders((orders) => {
                callback(orders.filter((order) => order.userId === user.uid));
            });

            callback(getCachedOrders().filter((order) => order.userId === user.uid));
        }
    );

    return () => {
        remoteUnsubscribe();

        if (localUnsubscribe) {
            localUnsubscribe();
        }
    };
}

export async function watchAllOrders(callback, onError) {
    let localUnsubscribe = null;

    const remoteUnsubscribe = onSnapshot(
        collection(db, "pedidos"),
        (snapshot) => {
            const orders = sortOrdersDescending(
                snapshot.docs.map((entry) => normalizeOrderData(entry.id, entry.data()))
            );

            replaceLocalOrders(orders);
            callback(orders);
        },
        (error) => {
            if (!isPermissionError(error)) {
                if (typeof onError === "function") {
                    onError(error);
                }

                return;
            }

            if (localUnsubscribe) {
                return;
            }

            localUnsubscribe = subscribeToLocalOrders((orders) => {
                callback(orders);
            });

            callback(getCachedOrders());
        }
    );

    return () => {
        remoteUnsubscribe();

        if (localUnsubscribe) {
            localUnsubscribe();
        }
    };
}

export async function updateOrder(orderId, patch) {
    const documentRef = doc(db, "pedidos", orderId);
    const normalizedPatch = removeUndefinedEntries({
        ...patch,
        updatedAt: serverTimestamp()
    });

    try {
        await updateDoc(documentRef, normalizedPatch);

        const snapshot = await getDoc(documentRef);
        if (!snapshot.exists()) {
            return null;
        }

        const normalizedOrder = normalizeOrderData(snapshot.id, snapshot.data());
        upsertLocalOrder(normalizedOrder);
        return normalizedOrder;
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }

        const fallbackOrder = getCachedOrders().find((order) => order.id === orderId);
        if (!fallbackOrder) {
            return null;
        }

        const mergedOrder = normalizeOrderData(orderId, {
            ...fallbackOrder,
            ...patch,
            formFields: {
                ...(fallbackOrder.formFields || {}),
                ...((patch && patch.formFields) || {})
            }
        });

        upsertLocalOrder(mergedOrder);
        return mergedOrder;
    }
}

export async function deleteOrderById(orderId) {
    try {
        await deleteDoc(doc(db, "pedidos", orderId));
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }
    }

    const remaining = getCachedOrders().filter((order) => order.id !== orderId);
    replaceLocalOrders(remaining);
}

export async function ensureAdminAccess() {
    const user = await requireAuthenticatedUser();
    const bootstrapRef = getBootstrapDoc();
    const localBootstrap = readLocalAdminBootstrap();

    try {
        let bootstrapSnapshot = await getDoc(bootstrapRef);

        if (!bootstrapSnapshot.exists()) {
            await setDoc(bootstrapRef, {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                createdAt: serverTimestamp(),
                createdAtIso: nowIso()
            });

            bootstrapSnapshot = await getDoc(bootstrapRef);
        }

        const bootstrapData = bootstrapSnapshot.exists() ? bootstrapSnapshot.data() : null;

        if (!bootstrapData || bootstrapData.uid !== user.uid) {
            const error = new Error("ADMIN_REQUIRED");
            error.code = "permission-denied";
            throw error;
        }

        writeLocalAdminBootstrap({
            uid: bootstrapData.uid,
            email: bootstrapData.email || "",
            displayName: bootstrapData.displayName || ""
        });

        return {
            user,
            bootstrap: bootstrapData
        };
    } catch (error) {
        if (!isPermissionError(error)) {
            throw error;
        }

        if (!localBootstrap) {
            const fallbackBootstrap = {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                createdAtIso: nowIso()
            };

            writeLocalAdminBootstrap(fallbackBootstrap);

            return {
                user,
                bootstrap: fallbackBootstrap
            };
        }

        if (localBootstrap.uid !== user.uid) {
            const adminError = new Error("ADMIN_REQUIRED");
            adminError.code = "permission-denied";
            throw adminError;
        }

        return {
            user,
            bootstrap: localBootstrap
        };
    }
}

export function getStatusClass(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized.includes("cancel")) {
        return "status-cancelado";
    }

    if (normalized.includes("concl")) {
        return "status-concluido";
    }

    if (normalized.includes("desenvolvimento") || normalized.includes("finaliza")) {
        return "status-desenvolvimento";
    }

    return "status-analise";
}

export function formatFieldValue(fieldName, value) {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    if (typeof value === "boolean") {
        return value ? "Sim" : "N\u00e3o";
    }

    if (fieldName === "siteType") {
        return SITE_TYPE_LABELS[value] || String(value);
    }

    if (fieldName === "pages") {
        return `${value} p\u00e1gina${String(value) === "1" ? "" : "s"}`;
    }

    return String(value);
}

export function getOrderDisplayFields(order) {
    const orderedFieldNames = [
        "name",
        "email",
        "siteType",
        "pages",
        "style",
        "description",
        "includeLogin",
        "includeRating",
        "includePayment"
    ];
    const collected = [];
    const seen = new Set();
    const sourceFields = order.formFields || {};

    orderedFieldNames.forEach((fieldName) => {
        if (!Object.prototype.hasOwnProperty.call(sourceFields, fieldName)) {
            return;
        }

        const rawValue = sourceFields[fieldName];
        const formattedValue = formatFieldValue(fieldName, rawValue);

        if (formattedValue === "") {
            return;
        }

        seen.add(fieldName);
        collected.push({
            name: fieldName,
            label: FIELD_LABELS[fieldName] || fieldName,
            value: formattedValue,
            multiline: fieldName === "description"
        });
    });

    Object.entries(sourceFields).forEach(([fieldName, rawValue]) => {
        if (seen.has(fieldName)) {
            return;
        }

        const formattedValue = formatFieldValue(fieldName, rawValue);

        if (formattedValue === "") {
            return;
        }

        collected.push({
            name: fieldName,
            label: FIELD_LABELS[fieldName] || fieldName,
            value: formattedValue,
            multiline: false
        });
    });

    return collected;
}
