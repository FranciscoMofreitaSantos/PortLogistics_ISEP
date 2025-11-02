import axios from "axios";
import { notifyError } from "../utils/notify";

function extractApiError(error: any): string {
    const data = error?.response?.data;

    // Falha de rede / servidor offline
    if (!error.response)
        return "Servidor indisponível. Verifique a ligação.";

    // ProblemDetails (.NET default)
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;

    // Custom backend message
    if (data?.message) return data.message;

    // Axios / fallback
    return error?.message || "Erro inesperado ao comunicar com o servidor.";
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5008",
    timeout: 20000, // 20 segundos
    headers: { "Content-Type": "application/json" },
});

// === REQUEST INTERCEPTOR ===
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// === RESPONSE INTERCEPTOR ===
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;
        const message = extractApiError(error);

        switch (status) {
            case 400:
                notifyError(message || "Pedido inválido.");
                break;

            case 401:
                notifyError("Sessão expirada. Faça login novamente.");
                localStorage.removeItem("access_token");
                window.dispatchEvent(new Event("sessionExpired"));
                break;

            case 403:
                notifyError(message || "Acesso negado.");
                break;

            case 404:
                notifyError(message || "Recurso não encontrado.");
                break;

            case 500:
                notifyError("Erro interno do servidor.");
                break;

            default:
                notifyError(message);
        }

        return Promise.reject(error);
    }
);

export default api;
