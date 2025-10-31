import { Link } from "react-router-dom";
import { useAppStore } from "../../app/store";
import { Roles } from "../../app/types";

export default function Nav() {
    const user = useAppStore((s) => s.user);

    const baseMenu = [{ label: "Início", path: "/" }];

    const privateMenu = user ? [
        { label: "VVNs", path: "/vvn" },
        { label: "Storage Areas", path: "/storage-areas" },
    ] : [];

    const adminMenu = user?.roles.includes(Roles.Administrator)
        ? [{ label: "Admin", path: "/admin" }]
        : [];

    const menu = [...baseMenu, ...privateMenu, ...adminMenu];

    return (
        <nav className="nav">
            <ul>
                {menu.map((i) => (
                    <li key={i.path}><Link to={i.path}>{i.label}</Link></li>
                ))}

                {!user ? (
                    <li><Link to="/login">Login</Link></li>
                ) : (
                    <li><Link to="/logout">Sair</Link></li>
                )}
            </ul>
        </nav>
    );
}
