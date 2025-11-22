import type { Iso6346Code } from "../dto/vvnTypesDtos";

export const GUID_RE =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export function isoToLocalInput(s?: string | null): string {
    if (!s) return "";
    const d = new Date(s);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export function shortDT(s?: string | null): string {
    if (!s) return "-";
    const d = new Date(s);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${dd}/${mm}`;
}

export function fmtDT(s?: string | null): string {
    if (!s) return "-";
    const d = new Date(s);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export function dtLocalToIso(s: string): string {
    if (!s) return "";
    return s.length === 16 ? `${s}:00` : s;
}

/** aceita Iso6346Code | string */
export function isoString(x: Iso6346Code | string | undefined | null): string {
    if (!x) return "-";
    if (typeof x === "string") return x;
    return (x as any).value || (x as any).Value || "-";
}
