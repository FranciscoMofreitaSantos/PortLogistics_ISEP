import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaDistancesModal } from "../components/modals/StorageAreaDistancesModal";
import type { StorageArea } from "../domain/storageArea";

const baseArea: StorageArea = {
    id: "A1",
    name: "Yard A",
    description: "",
    type: "Yard",
    maxBays: 1,
    maxRows: 1,
    maxTiers: 1,
    maxCapacityTeu: 10,
    currentCapacityTeu: 0,
    physicalResources: [],
    distancesToDocks: [
        { dockCode: "D1", distance: 100 },
        { dockCode: "D2", distance: 200 },
    ],
};

describe("StorageAreaDistancesModal", () => {
    it("não renderiza se open = false ou storageArea = null", () => {
        const { container, rerender } = render(
            <StorageAreaDistancesModal
                open={false}
                storageArea={baseArea}
                onClose={() => {}}
            />
        );
        expect(container.firstChild).toBeNull();

        rerender(
            <StorageAreaDistancesModal
                open={true}
                storageArea={null}
                onClose={() => {}}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it("mostra as linhas de distância quando aberto", () => {
        const { container } = render(
            <StorageAreaDistancesModal
                open={true}
                storageArea={baseArea}
                onClose={() => {}}
            />
        );

        const rows = container.querySelectorAll(".sa-dock-row");
        expect(rows.length).toBe(2);
        expect(screen.getByText("D1")).toBeTruthy();
        expect(screen.getByText("D2")).toBeTruthy();
    });

    it("botão de fechar chama onClose", () => {
        const onClose = vi.fn();

        render(
            <StorageAreaDistancesModal
                open={true}
                storageArea={baseArea}
                onClose={onClose}
            />
        );

        const btn = screen.getByRole("button", { name: "storageAreas.modal.close" });
        fireEvent.click(btn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
