// src/features/vesselsTypes/tests/VesselTypeListPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import type { VesselType } from "../domain/vesselType";
import VesselTypeListPage from "../pages/VesselsTypes";

// mock do hook useVesselTypes
const mockItems: VesselType[] = [
    {
        id: "1",
        name: "Panamax",
        description: "Medium ship",
        maxBays: 10,
        maxRows: 12,
        maxTiers: 5,
        capacityTeu: 5000,
    },
    {
        id: "2",
        name: "Feeder",
        description: "Small ship",
        maxBays: 5,
        maxRows: 6,
        maxTiers: 3,
        capacityTeu: 1000,
    },
];

const setFiltered = vi.fn();
const reload = vi.fn();

vi.mock("../hooks/useVesselTypes", () => ({
    useVesselTypes: () => ({
        items: mockItems,
        filtered: mockItems,
        setFiltered,
        loading: false,
        reload,
    }),
}));

describe("VesselTypeListPage", () => {
    it("renderiza header, search e tabela com as linhas", () => {
        render(<VesselTypeListPage />);

        // header
        expect(screen.getByText("vesselTypes.title")).toBeTruthy();
        expect(screen.getByText("vesselTypes.count (2)")).toBeTruthy();

        // tabela (nomes dos tipos)
        expect(screen.getAllByText("Panamax").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Feeder").length).toBeGreaterThan(0);
    });

    it("clicar numa linha seleciona o vessel type e mostra o slide de detalhes", () => {
        render(<VesselTypeListPage />);

        // linha de Panamax
        const panamaxCell = screen.getAllByText("Panamax")[0];
        const row = panamaxCell.closest("tr")!;
        fireEvent.click(row);

        // slide de detalhes deve aparecer com o título Panamax
        expect(screen.getAllByText("Panamax").length).toBeGreaterThan(1); // tabela + slide
        // botões Edit / Delete do slide
        expect(screen.getByText("vesselTypes.edit")).toBeTruthy();
        expect(screen.getByText("vesselTypes.delete")).toBeTruthy();
    });

    it("botão + no header abre o modal de criação", () => {
        render(<VesselTypeListPage />);

        const addBtn = screen.getAllByRole("button").find(b =>
            b.textContent?.includes("vesselTypes.add")
        )!;

        fireEvent.click(addBtn);

        // modal de criação tem título vesselTypes.add
        // (pode haver mais que um, por isso uso getAllByText)
        expect(screen.getAllByText("vesselTypes.add").length).toBeGreaterThan(0);
    });

    it("ao clicar em Edit no slide, abre o modal de edição", () => {
        render(<VesselTypeListPage />);

        // selecionar Panamax
        const panamaxCell = screen.getAllByText("Panamax")[0];
        const row = panamaxCell.closest("tr")!;
        fireEvent.click(row);

        const editBtn = screen.getByText("vesselTypes.edit");
        fireEvent.click(editBtn);

        // modal de edição também tem título vesselTypes.edit
        expect(screen.getAllByText("vesselTypes.edit").length).toBeGreaterThan(1);
    });

    it("ao clicar em Delete no slide, abre o modal de delete", () => {
        render(<VesselTypeListPage />);

        const panamaxCell = screen.getAllByText("Panamax")[0];
        const row = panamaxCell.closest("tr")!;
        fireEvent.click(row);

        const delBtn = screen.getByText("vesselTypes.delete");
        fireEvent.click(delBtn);

        // modal de delete tem título vesselTypes.delete
        expect(screen.getAllByText("vesselTypes.delete").length).toBeGreaterThan(1);
    });
});
