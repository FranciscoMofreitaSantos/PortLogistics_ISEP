import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { VesselType } from "../domain/vesselType";
import VesselTypeSlideDetails from "../components/VesselTypeSlideDetails";

const sample: VesselType = {
    id: "vt-1",
    name: "Panamax",
    description: "Medium-sized container ship",
    maxBays: 10,
    maxRows: 12,
    maxTiers: 5,
    capacityTeu: 5000,
};

describe("VesselTypeSlideDetails", () => {

    it("renderiza null quando selected é null", () => {
        const { container } = render(
            <VesselTypeSlideDetails
                selected={null}
                onClose={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("mostra os detalhes básicos do VesselType quando selected não é null", () => {
        render(
            <VesselTypeSlideDetails
                selected={sample}
                onClose={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        // Nome
        expect(screen.getByText("Panamax")).toBeTruthy();

        // Labels (como o i18n está mockado, as keys aparecem como texto)
        expect(screen.getByText("vesselTypes.details.description:")).toBeTruthy();
        expect(screen.getByText("Medium-sized container ship")).toBeTruthy();

        expect(screen.getByText("vesselTypes.details.bays:")).toBeTruthy();
        expect(screen.getByText("10")).toBeTruthy();

        expect(screen.getByText("vesselTypes.details.rows:")).toBeTruthy();
        expect(screen.getByText("12")).toBeTruthy();

        expect(screen.getByText("vesselTypes.details.tiers:")).toBeTruthy();
        expect(screen.getByText("5")).toBeTruthy();

        expect(screen.getByText("vesselTypes.details.capacity:")).toBeTruthy();
        expect(screen.getByText("5000")).toBeTruthy();
    });

    it("dispara onClose quando se clica no botão de fechar (X)", () => {
        const onClose = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <VesselTypeSlideDetails
                selected={sample}
                onClose={onClose}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        // é o primeiro botão (o do X)
        const closeBtn = screen.getAllByRole("button")[0];
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("dispara onEdit quando se clica no botão Edit", () => {
        const onClose = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <VesselTypeSlideDetails
                selected={sample}
                onClose={onClose}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        const editBtn = screen.getByText("vesselTypes.edit");
        fireEvent.click(editBtn);

        expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("dispara onDelete quando se clica no botão Delete", () => {
        const onClose = vi.fn();
        const onEdit = vi.fn();
        const onDelete = vi.fn();

        render(
            <VesselTypeSlideDetails
                selected={sample}
                onClose={onClose}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        );

        const deleteBtn = screen.getByText("vesselTypes.delete");
        fireEvent.click(deleteBtn);

        expect(onDelete).toHaveBeenCalledTimes(1);
    });
});
