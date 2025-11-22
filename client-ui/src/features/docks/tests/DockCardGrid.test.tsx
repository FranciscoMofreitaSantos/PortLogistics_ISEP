import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockCardGrid } from "../components/DockCardGrid";
import type { Dock } from "../domain/dock";


vi.mock("../utils/dockValueHelpers", () => ({
    val: (x: any) => (typeof x === "string" ? x : x?.value ?? ""),
    vals: (xs: any) =>
        Array.isArray(xs)
            ? xs.map((x) => (typeof x === "string" ? x : x?.value ?? ""))
            : [],
}));

const docks: Dock[] = [
    {
        id: "1",
        code: "D1",
        status: "ACTIVE",
        location: "North Pier",
        allowedVesselTypeIds: ["VT1", "VT2"] as any,
        physicalResourceCodes: ["PR1", "PR2"] as any,
        lengthM: 100,
        depthM: 10,
        maxDraftM: 8,
    } as Dock,
    {
        id: "2",
        code: { value: "D2" } as any,
        status: "INACTIVE",
        location: "",
        allowedVesselTypeIds: [] as any,
        physicalResourceCodes: [] as any,
    } as Dock,
];

describe("DockCardGrid", () => {
    it("não renderiza nada quando loading é true", () => {
        const { container } = render(
            <DockCardGrid
                docks={docks}
                loading={true}
                onSelect={vi.fn()}
                vesselTypeNamesFor={vi.fn(() => [])}
                statusLabel={vi.fn(() => "Status")}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renderiza um card por cada dock quando não está a carregar", () => {
        const onSelect = vi.fn();
        const vesselTypeNamesFor = vi
            .fn()
            .mockImplementation((ids?: string[]) =>
                (ids ?? []).map(id => `TYPE_${id}`)
            );
        const statusLabel = vi
            .fn()
            .mockImplementation((s?: string | number) =>
                s === "ACTIVE" ? "Ativo" : "Inativo"
            );

        const { container } = render(
            <DockCardGrid
                docks={docks}
                loading={false}
                onSelect={onSelect}
                vesselTypeNamesFor={vesselTypeNamesFor}
                statusLabel={statusLabel}
            />
        );

        expect(container.querySelectorAll(".dk-card").length).toBe(2);

        expect(screen.getByText("D1")).toBeTruthy();
        expect(screen.getByText("D2")).toBeTruthy();

        expect(screen.getByText("Ativo")).toBeTruthy();
        expect(screen.getByText("Inativo")).toBeTruthy();
        expect(statusLabel).toHaveBeenCalledTimes(2);

        expect(screen.getByText("North Pier")).toBeTruthy();
        expect(screen.getAllByText("—").length).toBeGreaterThan(0);

        expect(screen.getByText("TYPE_VT1")).toBeTruthy();
        expect(screen.getByText("TYPE_VT2")).toBeTruthy();

        expect(vesselTypeNamesFor).toHaveBeenCalledWith(["VT1", "VT2"]);
        expect(vesselTypeNamesFor).toHaveBeenCalledWith([]);
    });

    it("clicar num card chama onSelect com o dock correto", () => {
        const onSelect = vi.fn();

        render(
            <DockCardGrid
                docks={docks}
                loading={false}
                onSelect={onSelect}
                vesselTypeNamesFor={() => []}
                statusLabel={() => "Status"}
            />
        );

        const firstCard = screen.getByText("D1").closest(".dk-card")!;
        const secondCard = screen.getByText("D2").closest(".dk-card")!;

        fireEvent.click(firstCard);
        fireEvent.click(secondCard);

        expect(onSelect).toHaveBeenCalledTimes(2);
        expect(onSelect.mock.calls[0][0]).toEqual(docks[0]);
        expect(onSelect.mock.calls[1][0]).toEqual(docks[1]);
    });

    it("mostra recursos físicos e dimensões apenas quando existem", () => {
        render(
            <DockCardGrid
                docks={docks}
                loading={false}
                onSelect={vi.fn()}
                vesselTypeNamesFor={() => []}
                statusLabel={() => "Status"}
            />
        );

        expect(screen.getAllByText("Dock.details.physicalResource").length).toBe(1);
        expect(screen.getByText("PR1")).toBeTruthy();
        expect(screen.getByText("PR2")).toBeTruthy();

        expect(screen.getAllByText("Dock.details.dimensions").length).toBe(1);

        expect(
            screen.getByText("Dock.details.length: 100")
        ).toBeTruthy();
        expect(
            screen.getByText("Dock.details.depth: 10")
        ).toBeTruthy();
        expect(
            screen.getByText("Dock.details.maxdraft: 8")
        ).toBeTruthy();
    });

    it("quando não há docks, não renderiza nenhum card", () => {
        const { container } = render(
            <DockCardGrid
                docks={[]}
                loading={false}
                onSelect={vi.fn()}
                vesselTypeNamesFor={vi.fn(() => [])}
                statusLabel={vi.fn(() => "")}
            />
        );

        expect(container.querySelectorAll(".dk-card").length).toBe(0);
    });
});
