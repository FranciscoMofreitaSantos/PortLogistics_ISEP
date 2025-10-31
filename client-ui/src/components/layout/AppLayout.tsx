import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import { FaShip, FaSun, FaMoon } from "react-icons/fa";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import portugalFlag from "../../assets/flags/pt.png";
import ukFlag from "../../assets/flags/uk.png";

export default function AppLayout() {
    const [dark, setDark] = useState(false);
    const { i18n } = useTranslation();

    const toggleTheme = () => {
        const newTheme = dark ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        setDark(!dark);
    };

    const changeLang = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <div className="app">
            <header className="header">
                <div className="brand">
                    <FaShip size={32} color="#1A73E8" />
                    <h1>ThPA Port Management System</h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img
                        src={portugalFlag}
                        alt="PT"
                        width={24}
                        style={{ cursor: "pointer" }}
                        onClick={() => changeLang("pt")}
                    />
                    <img
                        src={ukFlag}
                        alt="EN"
                        width={24}
                        style={{ cursor: "pointer" }}
                        onClick={() => changeLang("en")}
                    />

                    <button
                        onClick={toggleTheme}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "white",
                        }}
                    >
                        {dark ? <FaSun /> : <FaMoon />}
                    </button>
                </div>

                <Nav />
            </header>

            <main className="content">
                <Outlet />
            </main>

            <footer className="footer">
                © 2025 ThPA S.A. — Smart Port Operations Platform
            </footer>
        </div>
    );
}
