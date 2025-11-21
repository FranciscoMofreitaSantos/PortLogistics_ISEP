import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaContainerModal } from "../components/modals/StorageAreaContainerModal";
import type { ContainerDto } from "../dto/storageAreaDtos";

const info: ContainerDto = {
    id: "C1",
    isoNumber: "MSCU1234567",
    description: "Electronics",
    containerType: "Electronic",
    containerStatus: "Full",
    weight: 12000,
};

describe("StorageAreaContainerModal", () => {
    it("não renderiza se open = false", () => {
        const { container } = render(
            <StorageAreaContainerModal
                open={false}
                loading={false}
                error={null}
                info={null}
                cellPos={null}
                onClose={() => {}}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it("quando loading = true mostra spinner", () => {
        render(
            <StorageAreaContainerModal
                open={true}
                loading={true}
                error={null}
                info={null}
                cellPos={{ bay: 0, row: 0, tier: 0 }}
                onClose={() => {}}
            />
        );

        expect(
            screen.getByLabelText("storageAreas.modal.container.loading")
        ).toBeTruthy();
    });

    it("quando há erro mostra mensagem de erro", () => {
        render(
            <StorageAreaContainerModal
                open={true}
                loading={false}
                error={"Some error"}
                info={null}
                cellPos={{ bay: 0, row: 0, tier: 0 }}
                onClose={() => {}}
            />
        );

        expect(screen.getByText(/Some error/)).toBeTruthy();
    });

    it("quando há info mostra os campos do contentor", () => {
        render(
            <StorageAreaContainerModal
                open={true}
                loading={false}
                error={null}
                info={info}
                cellPos={{ bay: 0, row: 0, tier: 0 }}
                onClose={() => {}}
            />
        );

        expect(
            screen.getByText("storageAreas.modal.container.isoNumber")
        ).toBeTruthy();
        expect(screen.getByText("MSCU1234567")).toBeTruthy();
        expect(screen.getByText("Electronics")).toBeTruthy();
        expect(screen.getByText("Full")).toBeTruthy();
    });

    it("botão de fechar chama onClose", () => {
        const onClose = vi.fn();

        render(
            <StorageAreaContainerModal
                open={true}
                loading={false}
                error={null}
                info={info}
                cellPos={{ bay: 0, row: 0, tier: 0 }}
                onClose={onClose}
            />
        );

        const btn = screen.getByRole("button", { name: "storageAreas.modal.close" });
        fireEvent.click(btn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
