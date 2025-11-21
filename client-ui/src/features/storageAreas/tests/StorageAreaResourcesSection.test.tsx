import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaResourcesSection } from "../components/StorageAreaResourcesSection";
import type { CreatingStorageArea } from "../domain/storageArea";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const form: CreatingStorageArea = {
    name: "",
    description: "",
    type: "Yard",
    maxBays: 1,
    maxRows: 1,
    maxTiers: 1,
    physicalResources: ["Crane 1"],
    distancesToDocks: [{ dockCode: "D1", distance: 100 }],
};

describe("StorageAreaResourcesSection", () => {
    it("renderiza recursos e docks atuais", () => {
        render(
            <StorageAreaResourcesSection
                form={form}
                newRes=""
                setNewRes={() => {}}
                addRes={() => {}}
                remRes={() => {}}
                newDock=""
                setNewDock={() => {}}
                newDist=""
                setNewDist={() => {}}
                addDock={() => {}}
                remDock={() => {}}
            />
        );

        // usa só parte do texto para evitar stresses com espaços
        expect(screen.getByText(/Crane 1/)).toBeTruthy();
        expect(screen.getByText(/D1: 100m/)).toBeTruthy();
    });

    it("clicar num chip de recurso chama remRes", () => {
        const remRes = vi.fn();

        render(
            <StorageAreaResourcesSection
                form={form}
                newRes=""
                setNewRes={() => {}}
                addRes={() => {}}
                remRes={remRes}
                newDock=""
                setNewDock={() => {}}
                newDist=""
                setNewDist={() => {}}
                addDock={() => {}}
                remDock={() => {}}
            />
        );

        const chip = screen.getByText(/Crane 1/);
        fireEvent.click(chip);

        expect(remRes).toHaveBeenCalledWith("Crane 1");
    });

    it("clicar num chip de dock chama remDock", () => {
        const remDock = vi.fn();

        render(
            <StorageAreaResourcesSection
                form={form}
                newRes=""
                setNewRes={() => {}}
                addRes={() => {}}
                remRes={() => {}}
                newDock=""
                setNewDock={() => {}}
                newDist=""
                setNewDist={() => {}}
                addDock={() => {}}
                remDock={remDock}
            />
        );

        const chip = screen.getByText(/D1: 100m/);
        fireEvent.click(chip);

        expect(remDock).toHaveBeenCalledWith("D1");
    });

    it("botões + chamam addRes e addDock", () => {
        const addRes = vi.fn();
        const addDock = vi.fn();

        render(
            <StorageAreaResourcesSection
                form={form}
                newRes="NewRes"
                setNewRes={() => {}}
                addRes={addRes}
                remRes={() => {}}
                newDock="X1"
                setNewDock={() => {}}
                newDist={20}
                setNewDist={() => {}}
                addDock={addDock}
                remDock={() => {}}
            />
        );

        const plusButtons = screen.getAllByText("+");
        fireEvent.click(plusButtons[0]); // recurso
        fireEvent.click(plusButtons[1]); // dock

        expect(addRes).toHaveBeenCalledTimes(1);
        expect(addDock).toHaveBeenCalledTimes(1);
    });
});
