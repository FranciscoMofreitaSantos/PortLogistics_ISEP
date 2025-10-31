export const Roles = {
    Administrator: "Administrator",
    PortAuthorityOfficer: "Port Authority Officer",
    LogisticsOperator: "Logistics Operator",
    ShippingAgentRepresentative: "Shipping Agent Representative",
    Viewer: "Viewer",
} as const;

export type Role = typeof Roles[keyof typeof Roles];

export interface User {
    id: string;
    name: string;
    roles: Role[];
}
