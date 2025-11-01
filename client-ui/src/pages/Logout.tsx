import { useEffect } from "react";
import { logout } from "../services/auth";
import { FaSignOutAlt } from "react-icons/fa";
import "./css/logout.css";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function Logout() {
    const { t } = useTranslation();

    useEffect(() => {
        const timer = setTimeout(() => {
            logout();
            toast.success(t("logout.success"));

            setTimeout(() => {
                window.location.href = "/";
            }, 800);
        }, 1200); // leve delay para mostrar animação

        return () => clearTimeout(timer);
    }, [t]);

    return (
        <div className="logout-container">
            <div className="logout-card">
                <FaSignOutAlt className="logout-icon-2" />
                <h2>{t("logout.title")}</h2>
                <p>{t("logout.subtitle")}</p>

                <div className="spinner"></div>
            </div>
        </div>
    );
}
