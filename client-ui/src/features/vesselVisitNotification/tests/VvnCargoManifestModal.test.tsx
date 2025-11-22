import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VvnCargoManifestModal } from "../components/modals/VvnCargoManifestModal";
import type { CargoManifestDto } from "../dto/vvnTypesDtos";

// i18n mock
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// mock EntriesTable só para não complicar
vi.mock("../components/EntriesTable", () => ({
    EntriesTable: () => <div>EntriesTableMock</div>,
}));

describe("VvnCargoManifestModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnCargoManifestModal
                open={false}
                onClose={() => {}}
                manifest={null}
                mode="loading"
            />,
        );
        expect(container.firstChild).toBeNull();
    });

    it("mostra mensagem vazia quando não há manifest", () => {
        render(
            <VvnCargoManifestModal
                open={true}
                onClose={() => {}}
                manifest={null}
                mode="loading"
            />,
        );

        expect(screen.getByText("vvn.modals.loading.empty")).toBeTruthy();
    });

    it("renderiza info básica do manifest e EntriesTable", () => {
        const manifest: CargoManifestDto = {
            id: "cm1",
            code: "CM-001",
            type: "Loading",
            createdAt: "2025-11-22T10:00:00Z",
            createdBy: "Tester",
            entries: [],
        };

        render(
            <VvnCargoManifestModal
                open={true}
                onClose={() => {}}
                manifest={manifest}
                mode="loading"
            />,
        );

        expect(screen.getByText("CM-001")).toBeTruthy();
        expect(screen.getByText("Loading")).toBeTruthy();
        expect(screen.getByText("Tester")).toBeTruthy();
        expect(screen.getByText("EntriesTableMock")).toBeTruthy();
    });
});
