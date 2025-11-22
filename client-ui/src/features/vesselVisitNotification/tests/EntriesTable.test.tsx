import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { EntriesTable } from "../components/EntriesTable";
import type { CargoManifestEntryDto } from "../dto/vvnTypesDtos";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("EntriesTable", () => {
    it("mostra mensagem vazia quando entries é null/undefined", () => {
        render(<EntriesTable entries={null} />);
        expect(screen.getByText("vvn.modals.loading.empty")).toBeInTheDocument();
    });

    it("renderiza linhas com dados dos containers", () => {
        const entries: CargoManifestEntryDto[] = [
            {
                id: "e1",
                bay: 1,
                row: 2,
                tier: 3,
                storageAreaName: "A1",
                container: {
                    id: "c1",
                    isoCode: "MSCU1234567",
                    description: "Sample",
                    type: "General",
                    status: "Full",
                    weightKg: 1000,
                },
            },
            {
                id: "e2",
                bay: 5,
                row: 1,
                tier: 1,
                storageAreaName: "B2",
                container: {
                    id: "c2",
                    isoCode: "TGHU7654321",
                    description: "Another",
                    type: "Reefer",
                    status: "Empty",
                    weightKg: 2000,
                },
            },
        ];

        render(<EntriesTable entries={entries} />);

        expect(screen.getByText("A1")).toBeInTheDocument();
        expect(screen.getByText("B2")).toBeInTheDocument();
        expect(screen.getByText("MSCU1234567")).toBeInTheDocument();
        expect(screen.getByText("TGHU7654321")).toBeInTheDocument();
        expect(screen.getByText("General")).toBeInTheDocument();
        expect(screen.getByText("Reefer")).toBeInTheDocument();
    });
});
