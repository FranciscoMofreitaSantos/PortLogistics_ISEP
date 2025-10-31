import { useNavigate } from "react-router-dom";
import { useAppStore } from "../app/store";
import { Roles, type Role } from "../app/types";
import "./css/login.css";
import { FaUserShield, FaUserTie, FaUserCog, FaUsers, FaEye } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);

  function loginAs(roleList: Role[]) {
    localStorage.setItem("access_token", "dev-token");

    setUser({
      id: "dev-user",
      name: "Dev User",
      roles: roleList,
    });

    navigate("/");
  }

  const roles = [
    { icon: <FaUserShield />, label: "Administrador", role: Roles.Administrator, color: "#e63946" },
    { icon: <FaUserTie />, label: "Port Authority Officer", role: Roles.PortAuthorityOfficer, color: "#4361ee" },
    { icon: <FaUserCog />, label: "Logistics Operator", role: Roles.LogisticsOperator, color: "#f3722c" },
    { icon: <FaUsers />, label: "Shipping Agent Representative", role: Roles.ShippingAgentRepresentative, color: "#2a9d8f" },
    { icon: <FaEye />, label: "Viewer", role: Roles.Viewer, color: "#6c757d" },
  ];

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2>Bem-vindo ao Sistema ThPA</h2>
        <p>Selecione o perfil para entrar no portal:</p>

        <div className="role-grid">
          {roles.map((r) => (
            <button
              key={r.role}
              className="role-btn"
              style={{ "--btn-color": r.color } as any}
              onClick={() => loginAs([r.role])}
            >
              <span className="icon">{r.icon}</span>
              {r.label}
            </button>
          ))}
        </div>

        <div className="login-footer">
          <small>
            Modo desenvolvimento — autenticação real (OAuth/JWT) será ativada mais tarde
          </small>
        </div>
      </div>
    </div>
  );
}
