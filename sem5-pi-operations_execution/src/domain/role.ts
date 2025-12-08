export const Role = {
    Administrator: "Administrator",
    PortAuthorityOfficer: "PortAuthorityOfficer",
    LogisticsOperator: "LogisticsOperator",
    ShippingAgentRepresentative: "ShippingAgentRepresentative",
    ProjectManager: "ProjectManager",
} as const;

export type Role = typeof Role[keyof typeof Role];