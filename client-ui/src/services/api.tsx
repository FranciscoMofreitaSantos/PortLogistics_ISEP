// src/api.ts
import axios from "axios";
import { notifyError } from "../utils/notify";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5008",
    timeout: 15000,
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
    async (error) => {
        const status = error?.response?.status;

        // Mensagem padrão amigável
        const message =
            error?.response?.data?.message ||
            error?.response?.statusText ||
            "Erro de comunicação com o servidor";

        // eedback visual amigável
        notifyError(message);

        // 401 → Sessão expirada
        if (status === 401) {
            console.warn("[Auth] Sessão expirada 🚨");
            localStorage.removeItem("access_token");
            window.dispatchEvent(new Event("sessionExpired"));
            // opcional: redirecionar
            // window.location.href = "/login";
        }

        // 403 → Acesso negado
        if (status === 403) {
            console.warn("[Auth] Acesso negado (403) ❌");
        }

        if (!error.response) {
            console.error("[Network] Falha de conexão ao servidor API 🌐");
        }

        return Promise.reject(error);
    }
);

export default api;
