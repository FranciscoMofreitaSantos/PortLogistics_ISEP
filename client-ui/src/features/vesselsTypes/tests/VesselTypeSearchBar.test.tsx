import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import VesselTypeSearchBar from "../components/VesselTypeSearchBar";
import type { VesselType } from "../domain/vesselType";
import { apiGetVesselTypeByName } from "../services/vesselTypeService";

// mock do service
vi.mock("../services/vesselTypeService", () => ({
    apiGetVesselTypeByName: vi.fn(),
}));

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
        name: "Post-Panamax",
        description: "Bigger vessel",
        maxBays: 15,
        maxRows: 18,
        maxTiers: 7,
        capacityTeu: 8000,
    },
];

describe("VesselTypeSearchBar", () => {
    it("faz pesquisa local e devolve resultados filtrados", () => {
        const onFilteredChange = vi.fn();

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );
        fireEvent.change(input, { target: { value: "post" } });

        const searchButton = screen.getByTitle("Search");
        fireEvent.click(searchButton);

        expect(onFilteredChange).toHaveBeenCalledTimes(1);
        const arg = onFilteredChange.mock.calls[0][0] as VesselType[];
        expect(arg).toHaveLength(1);
        expect(arg[0].name).toBe("Post-Panamax");
    });

    it("quando o valor está vazio, devolve a lista original", () => {
        const onFilteredChange = vi.fn();

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );
        fireEvent.change(input, { target: { value: "" } });

        const searchButton = screen.getByTitle("Search");
        fireEvent.click(searchButton);

        expect(onFilteredChange).toHaveBeenCalledTimes(1);
        const arg = onFilteredChange.mock.calls[0][0] as VesselType[];
        expect(arg).toHaveLength(mockTypes.length);
        expect(arg.map((v) => v.id)).toEqual(["1", "2"]);
    });

    it("botão de limpar (✕) repõe o texto e a lista original", () => {
        const onFilteredChange = vi.fn();

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );
        fireEvent.change(input, { target: { value: "pan" } });

        // deve aparecer o botão de clear
        const clearBtn = screen.getByText("✕");
        fireEvent.click(clearBtn);

        // input fica vazio
        expect(
            (screen.getByPlaceholderText(
                "vesselTypes.searchPlaceholder"
            ) as HTMLInputElement).value
        ).toBe("");

        // callback chamado com lista original
        expect(onFilteredChange).toHaveBeenCalledTimes(1);
        const arg = onFilteredChange.mock.calls[0][0] as VesselType[];
        expect(arg).toHaveLength(mockTypes.length);
    });

    it("ENTER no input dispara pesquisa local com a lista completa quando não há texto", () => {
        const onFilteredChange = vi.fn();

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );

        // não mexemos no valor → continua vazio
        fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

        expect(onFilteredChange).toHaveBeenCalledTimes(1);
        const arg = onFilteredChange.mock.calls[0][0] as VesselType[];
        expect(arg).toHaveLength(mockTypes.length);
        expect(arg.map((v) => v.id)).toEqual(["1", "2"]);
    });

    it("faz pesquisa remota por name e chama a API com o termo introduzido", async () => {
        const onFilteredChange = vi.fn();

        // mock da API: devolve DTO simples
        (apiGetVesselTypeByName as any).mockResolvedValue({
            id: "3",
            name: "Feeder",
            description: "Small feeder vessel",
            maxBays: 8,
            maxRows: 9,
            maxTiers: 4,
            capacity: 1500,
        });

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        // mudar para modo Name
        const nameModeBtn = screen.getByText("Name");
        fireEvent.click(nameModeBtn);

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );
        fireEvent.change(input, { target: { value: "Feeder" } });

        const searchButton = screen.getByTitle("Search");
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(apiGetVesselTypeByName).toHaveBeenCalledTimes(1);
            expect(apiGetVesselTypeByName).toHaveBeenCalledWith("Feeder");
        });

        // comportamento atual: não está a chamar onFilteredChange em modo remoto
        expect(onFilteredChange).not.toHaveBeenCalled();
    });

    it("quando a pesquisa remota falha, a API é chamada e o erro é tratado (sem chamar onFilteredChange)", async () => {
        const onFilteredChange = vi.fn();

        (apiGetVesselTypeByName as any).mockRejectedValue(
            new Error("Network error")
        );

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const nameModeBtn = screen.getByText("Name");
        fireEvent.click(nameModeBtn);

        const input = screen.getByPlaceholderText(
            "vesselTypes.searchPlaceholder"
        );
        fireEvent.change(input, { target: { value: "GhostType" } });

        const searchButton = screen.getByTitle("Search");
        fireEvent.click(searchButton);

        await waitFor(() => {
            // pode ser chamada mais do que uma vez, não nos importamos
            expect(apiGetVesselTypeByName).toHaveBeenCalled();
            expect(apiGetVesselTypeByName).toHaveBeenCalledWith("GhostType");
        });

        // segundo o comportamento atual, callback não é usado em erro
        expect(onFilteredChange).not.toHaveBeenCalled();
    });


    it("começa em modo local por defeito", () => {
        const onFilteredChange = vi.fn();

        render(
            <VesselTypeSearchBar
                items={mockTypes}
                onFilteredChange={onFilteredChange}
            />
        );

        const localBtn = screen.getByText("Local");
        const nameBtn = screen.getByText("Name");

        expect(localBtn.className).toContain("active");
        expect(nameBtn.className).not.toContain("active");
    });
});
