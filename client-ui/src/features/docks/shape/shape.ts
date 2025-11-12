import type { DockApi, Dock } from "../types/dock";

// "foo" | 123 | { value: "foo" } -> "foo"
export const val = (x: any): string =>
    typeof x === "string" || typeof x === "number" ? String(x) : x?.value ?? "";

// [ "a", { value: "b" } ] -> ["a", "b"]
const vals = (arr?: any[]) => (arr ?? []).map(val);

// 0/1/2 ou "Available" -> "Available" | "Unavailable" | "Maintenance"
const statusLabel = (s: string | number | undefined): string => {
    if (s === undefined || s === null) return "";
    if (typeof s === "number") return ["Available", "Unavailable", "Maintenance"][s] ?? String(s);
    const up = s.toString().toLowerCase();
    if (["available", "unavailable", "maintenance"].includes(up))
        return up[0].toUpperCase() + up.slice(1);
    return s.toString();
};

// API -> UI (achatado)
export const toDock = (d: DockApi): Dock => ({
    id: val(d.id),
    code: val(d.code),
    location: d.location,
    status: statusLabel(d.status),
    physicalResourceCodes: vals(d.physicalResourceCodes),
    vesselTypeIds: vals(d.allowedVesselTypeIds),
    lengthM: d.lengthM,     // 👈 novo
    depthM: d.depthM,       // 👈 novo
    maxDraftM: d.maxDraftM, // 👈 novo
});
