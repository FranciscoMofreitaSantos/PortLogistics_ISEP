import { Link } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import "./css/forbidden.css";

export default function Forbidden() {
  return (
    <div className="forbidden-container">
      <div className="forbidden-card">
        <FaLock className="forbidden-icon" />
        <h1>403 — Acesso Negado</h1>
        <p>Não possui permissões para visualizar esta página.</p>
        <Link className="forbidden-btn" to="/">Voltar ao início</Link>
      </div>
    </div>
  );
}
