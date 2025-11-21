// src/features/storageAreas/tests/StorageAreaMainPanel.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaMainPanel } from "../components/StorageAreaMainPanel";
import type { StorageAreaDto } from "../dto/storageAreaDtos";
import type { TFunction } from "i18next";

// mock de t com o tipo certo
const tMock = ((key: string, _opts?: any) => key) as unknown as TFunction;

const selected: StorageAreaDto = {
    id: "A1",
    name: "Yard A",
    description: "Main yard",
    type: "Yard",
    maxBays: 2,
    maxRows: 1,
    maxTiers: 1,
    maxCapacityTeu: 10,
    currentCapacityTeu: 5,
    physicalResources: ["Crane"],
    distancesToDocks: [{ dockCode: "D1", distance: 100 }],
};

const slices: boolean[][][] = [
    [
        [true, false], // tier 0, row 0, bays 0/1
    ],
];

describe("StorageAreaMainPanel", () => {
    it("quando selected = null mostra mensagem para selecionar", () => {
        render(
            <StorageAreaMainPanel
                selected={null}
                slices={[]}
                t={tMock}
                onOpenDistances={() => {}}
                onCellClick={() => {}}
            />
        );

        expect(
            screen.getByText("storageAreas.list.selectOne")
        ).toBeTruthy();
    });

    it("mostra info da storage area e KPIs", () => {
        render(
            <StorageAreaMainPanel
                selected={selected}
                slices={slices}
                t={tMock}
                onOpenDistances={() => {}}
                onCellClick={() => {}}
            />
        );

        expect(
            screen.getByText("storageAreas.enums.types.yard")
        ).toBeTruthy();
        expect(screen.getByText("Main yard")).toBeTruthy();
        expect(
            screen.getByText("storageAreas.format.teu")
        ).toBeTruthy();

        const btn = screen.getByText("storageAreas.list.viewDistances");
        expect(btn).toBeTruthy();
    });

    it("clicar numa célula ocupada chama onCellClick com as coordenadas", () => {
        const onCellClick = vi.fn();

        const { container } = render(
            <StorageAreaMainPanel
                selected={selected}
                slices={slices}
                t={tMock}
                onOpenDistances={() => {}}
                onCellClick={onCellClick}
            />
        );

        const cell = container.querySelector(
            ".sa-cell.filled"
        ) as HTMLElement;
        expect(cell).toBeTruthy();

        fireEvent.click(cell);

        expect(onCellClick).toHaveBeenCalledTimes(1);
        expect(onCellClick).toHaveBeenCalledWith(0, 0, 0);
    });

    it("botão de distâncias chama onOpenDistances", () => {
        const onOpenDistances = vi.fn();

        render(
            <StorageAreaMainPanel
                selected={selected}
                slices={slices}
                t={tMock}
                onOpenDistances={onOpenDistances}
                onCellClick={() => {}}
            />
        );

        const btn = screen.getByText("storageAreas.list.viewDistances");
        fireEvent.click(btn);

        expect(onOpenDistances).toHaveBeenCalledTimes(1);
    });
});
