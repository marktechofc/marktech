import {
    requireAuthenticatedUser,
    saveOrderFromForm,
    validateRequiredFields
} from "./backend-shared.js";

export function initOrderPage(config) {
    const requiredFieldIds = config.requiredFieldIds || [];
    let isSubmitting = false;

    async function hydrateUserDefaults() {
        try {
            const user = await requireAuthenticatedUser({ redirectTo: "cadastro.html" });
            const nameField = document.getElementById("name");
            const emailField = document.getElementById("email");

            if (nameField && !nameField.value.trim() && user.displayName) {
                nameField.value = user.displayName;
            }

            if (emailField && !emailField.value.trim() && user.email) {
                emailField.value = user.email;
            }
        } catch (error) {
            if (error.code !== "auth-required") {
                console.error("Falha ao preparar os dados do usu\u00e1rio.", error);
            }
        }
    }

    window.validarPedido = async function validarPedido() {
        if (isSubmitting) {
            return;
        }

        const form = document.getElementById("orderForm");
        const submitButton = document.getElementById("finalizarPedidoBtn");

        if (!form) {
            alert("Formul\u00e1rio do pedido n\u00e3o encontrado.");
            return;
        }

        const isValid = validateRequiredFields(requiredFieldIds);
        if (!isValid) {
            return;
        }

        isSubmitting = true;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.style.opacity = "0.8";
        }

        try {
            await saveOrderFromForm({
                form,
                packageKey: config.packageKey
            });

            alert("Pedido realizado com sucesso");
            window.location.replace("index.html");
        } catch (error) {
            if (error.code === "auth-required") {
                return;
            }

            console.error("Erro ao finalizar pedido.", error);
            alert("N\u00e3o foi poss\u00edvel finalizar o pedido. Tente novamente.");
        } finally {
            isSubmitting = false;

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.style.opacity = "";
            }
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        hydrateUserDefaults();
    });
}
