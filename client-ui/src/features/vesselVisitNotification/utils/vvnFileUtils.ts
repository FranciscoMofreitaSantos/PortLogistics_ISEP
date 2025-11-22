import toast from "react-hot-toast";

export type AnyJson = Record<string, any>;

export async function readJsonFile(f: File | null): Promise<AnyJson | null> {
    if (!f) return null;
    const text = await f.text();
    try {
        return JSON.parse(text);
    } catch {
        toast.error(`Invalid JSON: ${f.name}`);
        return null;
    }
}

export function downloadTemplate(filename: string, obj: AnyJson) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== TEMPLATES =====
export const crewTemplate: AnyJson = {
    totalCrew: 12,
    captainName: "John Smith",
    crewMembers: [
        { name: "Alice", role: "Captain", nationality: "Portugal", citizenId: "A12345" },
        { name: "Bob", role: "ChiefOfficer", nationality: "Spain", citizenId: "B98765" },
    ],
};

export const cargoTemplateLoading: AnyJson = {
    type: "Loading",
    createdBy: "agent@example.com",
    entries: [
        {
            bay: 1,
            row: 0,
            tier: 0,
            storageAreaName: "Warehouse B",
            container: {
                isoCode: "MSCU6639870",
                description: "Electronics Loading",
                type: "General",
                weightKg: 9000,
            },
        },
    ],
};

export const cargoTemplateUnloading: AnyJson = {
    type: "Unloading",
    createdBy: "agent@example.com",
    entries: [
        {
            bay: 0,
            row: 0,
            tier: 0,
            storageAreaName: "Yard A",
            container: {
                isoCode: "CSQU3054383",
                description: "Furniture Loading",
                type: "General",
                weightKg: 12000,
            },
        },
    ],
};
