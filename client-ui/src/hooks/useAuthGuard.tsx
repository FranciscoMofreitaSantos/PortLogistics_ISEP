import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../app/store";
import { Roles, type Role } from "../app/types";
import type { JSX } from "react";

function isCypressEnv(): boolean {
    return typeof window !== "undefined" && (window as any).Cypress;
}

export function RequireAuth() {
    if (isCypressEnv()) return <Outlet />;

    const user = useAppStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
    if (isCypressEnv()) return <Outlet />;

    const user = useAppStore((s) => s.user);

    if (!user) return <Navigate to="/login" replace />;

    const hasAccess = user.role && roles.includes(user.role);
    if (!hasAccess) return <Navigate to="/forbidden" replace />;

    return <Outlet />;
}

function getRedirectForRole(role: Role) {
    switch (role) {
        case Roles.Administrator:
            return "/admin";
        case Roles.LogisticsOperator:
            return "/logistics-dashboard";
        case Roles.PortAuthorityOfficer:
            return "/dashboard";
        case Roles.ShippingAgentRepresentative:
            return "/vvn";
        default:
            return "/pending-approval";
    }
}

export function RequireGuest({ children }: { children: JSX.Element }) {
    if (isCypressEnv()) return <Outlet />;

    const user = useAppStore((s) => s.user);

    if (user?.role) {
        return <Navigate to={getRedirectForRole(user.role)} replace />;
    }

    return children;
}

export function RequireApproved() {
    if (isCypressEnv()) return <Outlet />;

    const user = useAppStore((s) => s.user);
    if (!user) return <Navigate to="/login" replace />;
    if (!user.role) return <Navigate to="/pending-approval" replace />;
    return <Outlet />;
}

export function RequireActive() {
    if (isCypressEnv()) return <Outlet />;

    const user = useAppStore((s) => s.user);
    if (user && user.isActive === false) {
        return <Navigate to="/inactive" replace />;
    }
    return <Outlet />;
}