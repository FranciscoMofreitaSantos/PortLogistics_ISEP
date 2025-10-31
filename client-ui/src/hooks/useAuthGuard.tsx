import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../app/store";
import { type Role } from "../app/types";

export function RequireAuth() {
    const user = useAppStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
    const user = useAppStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;

    const hasAccess = user.roles.some((r) => roles.includes(r));
    if (!hasAccess) return <Navigate to="/forbidden" replace />;

    return <Outlet />;
}
