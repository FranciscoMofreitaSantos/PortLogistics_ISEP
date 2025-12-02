import { useAuth0 } from "@auth0/auth0-react";
import "../styles/login-port.css";

export default function LoginPort() {
    const { loginWithRedirect } = useAuth0();

    const handleLogin = async () => {
        await loginWithRedirect({
            appState: { returnTo: window.location.pathname },
            authorizationParams: { prompt: "select_account" }
        });
    };

    return (
        <div className="port-container">
            <div className="radar-scope">
                <div className="radar-sweep"></div>
                <div className="radar-grid"></div>
            </div>

            <div className="shipping-lane">
                <svg className="ship-silhouette cargo-ship-large" viewBox="0 0 600 150">
                    <path d="M50,140 L550,140 L580,110 L20,110 Z" className="ship-body" />
                    <rect x="80" y="70" width="80" height="40" className="ship-cargo" />
                    <rect x="170" y="70" width="80" height="40" className="ship-cargo" />
                    <rect x="260" y="60" width="80" height="50" className="ship-cargo" />
                    <polygon points="450,110 450,40 520,40 540,110" className="ship-bridge" />
                </svg>

                <svg className="ship-silhouette tanker-ship-small" viewBox="0 0 400 120">
                    <path d="M30,110 L370,110 L390,80 L10,80 Z" className="ship-body" />
                    <rect x="50" y="60" width="200" height="20" className="ship-cargo" />
                    <polygon points="300,80 300,30 350,30 360,80" className="ship-bridge" />
                </svg>
            </div>

            <div className="interface-layer">
                <div className="glass-panel">
                    <h1 className="system-title">Port<span>Logistics</span></h1>
                    <p className="system-status">SYSTEM READY // WAITING FOR AUTH</p>

                    <button onClick={handleLogin} className="activate-btn">
                        <span className="btn-text">Login</span>
                        <div className="btn-glitch"></div>
                    </button>
                </div>
            </div>

            <div className="noise-overlay"></div>
        </div>
    );
}