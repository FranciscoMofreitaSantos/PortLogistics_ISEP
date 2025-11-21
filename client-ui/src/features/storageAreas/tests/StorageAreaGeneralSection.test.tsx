// src/features/storageAreas/tests/StorageAreaGeneralSection.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaGeneralSection } from "../components/StorageAreaGeneralSection";
import type { CreatingStorageArea } from "../domain/storageArea";

// mock simples do i18n
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const baseForm: CreatingStorageArea = {
    name: "",
    description: "",
    type: "Yard",
    maxBays: 1,
    maxRows: 1,
    maxTiers: 1,
    physicalResources: [],
    distancesToDocks: [],
};

describe("StorageAreaGeneralSection", () => {
    it("renderiza campos principais do formulário", () => {
        const setField = vi.fn();

        render(
            <StorageAreaGeneralSection
                form={baseForm}
                setField={setField as any}
            />
        );

        // título da secção
        expect(
            screen.getByText("storageAreas.create.generalInfo")
        ).toBeTruthy();

        // inputs por placeholder
        expect(
            screen.getByPlaceholderText("storageAreas.create.name_PH")
        ).toBeTruthy();

        expect(
            screen.getByPlaceholderText("storageAreas.create.description_PH")
        ).toBeTruthy();

        // opções do select de tipo
        expect(screen.getByText("storageAreas.create.yard")).toBeTruthy();
        expect(screen.getByText("storageAreas.create.warehouse")).toBeTruthy();

        // inputs numéricos (bays/rows/tiers)
        const numberInputs = screen.getAllByRole("spinbutton");
        expect(numberInputs.length).toBeGreaterThanOrEqual(3);
    });

    it("alterar name, rows e tiers chama setField com os valores certos", () => {
        const setField = vi.fn();

        const { container } = render(
            <StorageAreaGeneralSection
                form={baseForm}
                setField={setField as any}
            />
        );

        // NAME via placeholder
        const nameInput = screen.getByPlaceholderText(
            "storageAreas.create.name_PH"
        ) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: "Yard B" } });
        expect(setField).toHaveBeenCalledWith("name", "Yard B");

        // ROWS / TIERS: apanhar os inputs numéricos da grelha
        const numberInputs = container.querySelectorAll(
            ".sa-grid-3 .sa-input"
        ) as NodeListOf<HTMLInputElement>;
        expect(numberInputs.length).toBeGreaterThanOrEqual(3);

        const rowsInput = numberInputs[1]; // [0]=bays, [1]=rows, [2]=tiers
        const tiersInput = numberInputs[2];

        fireEvent.change(rowsInput, { target: { value: "3" } });
        fireEvent.change(tiersInput, { target: { value: "4" } });

        expect(setField).toHaveBeenCalledWith("maxRows", 3);
        expect(setField).toHaveBeenCalledWith("maxTiers", 4);
    });
});
