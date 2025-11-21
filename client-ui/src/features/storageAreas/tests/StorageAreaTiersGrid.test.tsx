// src/features/storageAreas/tests/StorageAreaTiersGrid.test.tsx
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaTiersGrid } from "../components/StorageAreaTiersGrid";

// mock simples de i18n: devolve só a key
const tMock = (key: string) => key;

const slices: boolean[][][] = [
    // tier 0
    [
        // row 0
        [true, false], // bay 0 ocupado, bay 1 vazio
    ],
];

describe("StorageAreaTiersGrid", () => {
    it("renderiza o header e um slice por tier", () => {
        const { container, getByText } = render(
            <StorageAreaTiersGrid
                slices={slices}
                maxBays={2}
                t={tMock}
                onCellClick={() => {}}
            />
        );

        // header usa as keys de i18n
        expect(getByText("storageAreas.list.tiersMap")).toBeTruthy();
        expect(getByText("storageAreas.list.tiersNote")).toBeTruthy();

        // um slice por tier
        const slicesEls = container.querySelectorAll(".sa-slice");
        expect(slicesEls.length).toBe(1);
    });

    it("clicar numa célula ocupada chama onCellClick com bay,row,tier corretos", () => {
        const onCellClick = vi.fn();

        const { container } = render(
            <StorageAreaTiersGrid
                slices={slices}
                maxBays={2}
                t={tMock}
                onCellClick={onCellClick}
            />
        );

        const cell = container.querySelector(
            ".sa-cell.filled"
        ) as HTMLElement;

        // segurança: garantir que encontrámos mesmo a célula
        expect(cell).toBeTruthy();

        fireEvent.click(cell);

        // tier = 0, row = 0, bay = 0 (pela forma como definimos slices)
        expect(onCellClick).toHaveBeenCalledTimes(1);
        expect(onCellClick).toHaveBeenCalledWith(0, 0, 0);
    });

    it("quando não há slices mostra mensagem de grelha vazia", () => {
        const { getByText, container } = render(
            <StorageAreaTiersGrid
                slices={[]}
                maxBays={0}
                t={tMock}
                onCellClick={() => {}}
            />
        );

        const empty = container.querySelector(".sa-empty");
        expect(empty).toBeTruthy();
        expect(getByText("storageAreas.list.noGrid")).toBeTruthy();
    });
});
