import api from "./api";
import { useAppStore } from "../app/store";
import { z } from "zod";
import { Roles } from "../app/types";
import type { User } from "../app/types";


const MeSchema = z.object({
    id: z.string(),
    name: z.string(),
    roles: z.array(z.enum([
        Roles.Administrator,
        Roles.PortAuthorityOfficer,
        Roles.LogisticsOperator,
        Roles.ShippingAgentRepresentative,
        Roles.Viewer
    ]))
});


export async function fetchMe(): Promise<User> {
    const { data } = await api.get("/api/me/role");
    const parsed = MeSchema.parse(data);

    const user: User = {
        id: parsed.id,
        name: parsed.name,
        roles: parsed.roles
    };

    useAppStore.getState().setUser(user);
    return user;
}

export async function loginDev(token: string) {
    localStorage.setItem("access_token", token);
    return fetchMe();
}

export function logout() {
    localStorage.removeItem("access_token");
    useAppStore.getState().setUser(null);
}
