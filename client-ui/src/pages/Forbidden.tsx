import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "./css/forbidden.css";
import { useTranslation } from "react-i18next";

export default function Forbidden() {
    const { t } = useTranslation();

    return (
        <div className="forbidden-container">
            <div className="forbidden-card">
                <FaLock className="forbidden-icon" />
                <h1>{t("forbidden.title")}</h1>
                <p>{t("forbidden.text")}</p>
                <Link className="forbidden-btn" to="/">
                    {t("forbidden.back")}
                </Link>
            </div>
        </div>
    );
}
