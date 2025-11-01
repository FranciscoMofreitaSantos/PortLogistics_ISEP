import { useEffect } from "react";
import { logout } from "../services/auth";
import { FaSignOutAlt } from "react-icons/fa";
import "./css/logout.css";

export default function Logout() {

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
      window.location.href = "/";
    }, 1500); // 1.5s para mostrar a animação

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="logout-container">
      <div className="logout-card">
        <FaSignOutAlt className="logout-icon-2" />
        <h2>A terminar sessão...</h2>
        <p>Por favor aguarde um momento</p>

        <div className="spinner"></div>
      </div>
    </div>
  );
}
