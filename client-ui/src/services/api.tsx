// src/api.ts
import axios from "axios";

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

        // 401 → token expirado ou inválido
        if (status === 401) {
            console.warn("[Auth] Sessão expirada, redirecionando...");
            localStorage.removeItem("access_token");
            // opcional: envia evento global ou redireciona
            window.dispatchEvent(new Event("sessionExpired"));
            // window.location.href = "/login";
        }

        if (status === 403) {
            console.warn("[Auth] Acesso negado (403).");
        }

        if (!error.response) {
            console.error("[Network] Falha de conexão com o servidor API.");
        }

        return Promise.reject(error);
    }
);

export default api;
