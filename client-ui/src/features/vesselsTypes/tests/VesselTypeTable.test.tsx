import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VesselTypeTable from "../components/VesselTypeTable";
import type { VesselType } from "../domain/vesselType";

const mockTypes: VesselType[] = [
    {
        id: "1",
        name: "Panamax",
        description: "Panamax vessel",
        maxBays: 10,
        maxRows: 12,
        maxTiers: 5,
        capacityTeu: 5000,
    },
    {
        id: "2",
        name: "Feeder",
        description: "Feeder vessel",
        maxBays: 8,
        maxRows: 10,
        maxTiers: 4,
        capacityTeu: 2000,
    },
];

describe("VesselTypeTable", () => {
    it("renderiza linhas com os tipos de navio", () => {
        render(
            <VesselTypeTable
                items={mockTypes}
                loading={false}
                onSelect={() => {}}
            />
        );

        // dados
        expect(screen.getByText("Panamax")).toBeInTheDocument();
        expect(screen.getByText("Feeder")).toBeInTheDocument();

        // header + 2 linhas de dados
        expect(screen.getAllByRole("row")).toHaveLength(1 + mockTypes.length);
    });

    it("chama onSelect ao clicar numa linha", () => {
        const onSelect = vi.fn();

        render(
            <VesselTypeTable
                items={mockTypes}
                loading={false}
                onSelect={onSelect}
            />
        );

        const row = screen.getByText("Panamax").closest("tr")!;
        fireEvent.click(row);

        expect(onSelect).toHaveBeenCalledTimes(1);
        const arg = onSelect.mock.calls[0][0] as VesselType;
        expect(arg.id).toBe("1");
    });

    it("quando não há items e não está a carregar, mostra mensagem de vazio", () => {
        render(
            <VesselTypeTable
                items={[]}
                loading={false}
                onSelect={() => {}}
            />
        );

        // com o mock de i18n, isto deve ser a key
        expect(screen.getByText("vesselTypes.empty")).toBeInTheDocument();

        // e não deve haver tabela
        expect(screen.queryByRole("table")).toBeNull();
    });

    it("quando está em loading, não renderiza tabela nem mensagem de vazio", () => {
        render(
            <VesselTypeTable
                items={mockTypes}
                loading={true}
                onSelect={() => {}}
            />
        );

        // dependendo da tua implementação, pode ser null ou spinner;
        // aqui assumimos que não há tabela nem mensagem "empty"
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.queryByText("vesselTypes.empty")).toBeNull();
    });

    it("snapshot – garante que estrutura da tabela se mantém", () => {
        const { container } = render(
            <VesselTypeTable
                items={mockTypes}
                loading={false}
                onSelect={() => {}}
            />
        );

        expect(container).toMatchSnapshot();
    });
});
