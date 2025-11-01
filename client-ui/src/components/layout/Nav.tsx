import { Link } from "react-router-dom";
import { useAppStore } from "../../app/store";
import { Roles } from "../../app/types";
import { useTranslation } from "react-i18next";

export default function Nav() {
    const { t } = useTranslation();
    const user = useAppStore((s) => s.user);

    const baseMenu = [{ label: t("menu.home"), path: "/" }];

    const privateMenu = user ? [
        { label: t("menu.vvn"), path: "/vvn" },
        { label: t("menu.storage"), path: "/storage-areas" },
    ] : [];

    const adminMenu = user?.roles.includes(Roles.Administrator)
        ? [
            { label: t("menu.vesselTypes"), path: "/vessel-types" },
            { label: t("menu.admin"), path: "/admin" },
        ]
        : [];

    const menu = [...baseMenu, ...privateMenu, ...adminMenu];

    return (
        <nav className="nav">
            <ul>
                {menu.map((i) => (
                    <li key={i.path}><Link to={i.path}>{i.label}</Link></li>
                ))}

                {!user ? (
                    <li><Link to="/login">{t("menu.login")}</Link></li>
                ) : (
                    <li><Link to="/logout">{t("menu.logout")}</Link></li>
                )}
            </ul>
        </nav>
    );
}
