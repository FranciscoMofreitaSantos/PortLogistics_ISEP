import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* O App */}
        <App />

        {/* O Toaster global — fica por cima da UI toda */}
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: { fontSize: "14px" },
                success: { iconTheme: { primary: "#22c55e", secondary: "white" } },
                error:   { iconTheme: { primary: "#ef4444", secondary: "white" } },
            }}
        />
    </React.StrictMode>
);
