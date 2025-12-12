export const Role = {
    Administrator: "Administrator",
    PortAuthorityOfficer: "PortAuthorityOfficer",
    LogisticsOperator: "LogisticsOperator",
    ShippingAgentRepresentative: "ShippingAgentRepresentative",
    ProjectManager: "ProjectManager",
    PortOperationsSupervisor: "PortOperationsSupervisor"
} as const;

export type Role = typeof Role[keyof typeof Role];

export class RoleFactory {
    static fromString(value: string): Role {
        if (Object.values(Role).includes(value as Role)) {
            return value as Role;
        }

        throw new Error(`Invalid role: ${value}`);
    }
}