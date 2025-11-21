import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaStrip } from "../components/StorageAreaStrip";
import type { StorageArea } from "../domain/storageArea";

const baseAreas: StorageArea[] = [
    {
        id: "A1",
        name: "Yard A",
        description: "Main yard",
        type: "Yard",
        maxBays: 5,
        maxRows: 4,
        maxTiers: 3,
        maxCapacityTeu: 100,
        currentCapacityTeu: 40,
        physicalResources: ["Crane 1"],
        distancesToDocks: [],
    },
    {
        id: "A2",
        name: "Warehouse B",
        description: "Covered",
        type: "Warehouse",
        maxBays: 3,
        maxRows: 3,
        maxTiers: 2,
        maxCapacityTeu: 60,
        currentCapacityTeu: 10,
        physicalResources: [],
        distancesToDocks: [],
    },
];

describe("StorageAreaStrip", () => {
    it("quando loading = true mostra skeletons", () => {
        const { container } = render(
            <StorageAreaStrip
                items={[]}
                loading={true}
                selectedId={null}
                onSelect={() => {}}
            />
        );

        const skeletons = container.querySelectorAll(".sa-strip-skeleton");
        expect(skeletons.length).toBeGreaterThan(0);
    });

    it("quando não há resultados mostra mensagem de vazio", () => {
        render(
            <StorageAreaStrip
                items={[]}
                loading={false}
                selectedId={null}
                onSelect={() => {}}
            />
        );

        expect(screen.getByText("storageAreas.list.noResults")).toBeTruthy();
    });

    it("renderiza cards e permite selecionar um storage area", () => {
        const onSelect = vi.fn();

        const { container } = render(
            <StorageAreaStrip
                items={baseAreas}
                loading={false}
                selectedId={"A2"}
                onSelect={onSelect}
            />
        );

        const cards = container.querySelectorAll(".sa-card-mini");
        expect(cards.length).toBe(2);

        // verifica que o selecionado tem a classe active
        expect(cards[1].classList.contains("active")).toBe(true);

        // clicar no primeiro chama onSelect com o item correto
        fireEvent.click(cards[0]);
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect.mock.calls[0][0].id).toBe("A1");
    });
});
