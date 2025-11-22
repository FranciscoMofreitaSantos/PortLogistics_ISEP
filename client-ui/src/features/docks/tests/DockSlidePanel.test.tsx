import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockSlidePanel } from "../components/DockSlidePanel";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => opts?.defaultValue ?? key,
    }),
}));

describe("DockSlidePanel", () => {
    const baseDock = {
        id: "D1",
        code: "DK-1001",
        location: "Porto Sul",
        status: "Available",
        allowedVesselTypeIds: ["VT1", "VT2"],
        physicalResourceCodes: ["PR1", "PR2"],
        lengthM: 250,
        depthM: 15,
        maxDraftM: 12,
    } as any;

    const statusLabel = vi.fn().mockReturnValue("Disponível");
    const vesselTypeNamesFor = vi.fn().mockReturnValue(["Panamax", "Feeder"]);

    it("renderiza o painel com os detalhes do dock", () => {
        render(
            <DockSlidePanel
                dock={baseDock}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        // Código do dock como título
        expect(screen.getByText("DK-1001")).toBeInTheDocument();

        // Localização
        expect(screen.getByText("Localização:")).toBeInTheDocument();
        expect(screen.getByText("Porto Sul")).toBeInTheDocument();

        // Estado
        expect(screen.getByText("Estado:")).toBeInTheDocument();
        expect(screen.getByText("Disponível")).toBeInTheDocument();

        // Tipos de navio
        expect(screen.getByText("Tipos de Navio:")).toBeInTheDocument();
        expect(screen.getByText("Panamax")).toBeInTheDocument();
        expect(screen.getByText("Feeder")).toBeInTheDocument();

        // Recursos físicos
        expect(screen.getByText("Recursos Físicos:")).toBeInTheDocument();
        expect(screen.getByText("PR1")).toBeInTheDocument();
        expect(screen.getByText("PR2")).toBeInTheDocument();

        // Dimensões
        expect(screen.getByText("Dimensões (m):")).toBeInTheDocument();
        expect(screen.getByText("Comprimento: 250")).toBeInTheDocument();
        expect(screen.getByText("Profundidade: 15")).toBeInTheDocument();
        expect(screen.getByText("Calado Máximo: 12")).toBeInTheDocument();
    });

    it("mostra — quando location está vazia", () => {
        const dock = { ...baseDock, location: "" };

        render(
            <DockSlidePanel
                dock={dock}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("mostra — nas VTs quando não há tipos permitidos", () => {
        const dock = { ...baseDock, allowedVesselTypeIds: [] };

        vesselTypeNamesFor.mockReturnValueOnce([]);

        render(
            <DockSlidePanel
                dock={dock}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("não mostra recursos físicos quando physicalResourceCodes está vazio", () => {
        const dock = { ...baseDock, physicalResourceCodes: [] };

        render(
            <DockSlidePanel
                dock={dock}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        expect(screen.queryByText("Recursos Físicos:")).toBeNull();
    });

    it("não mostra Dimensões quando length, depth e maxDraft são undefined", () => {
        const dock = {
            ...baseDock,
            lengthM: undefined,
            depthM: undefined,
            maxDraftM: undefined,
        };

        render(
            <DockSlidePanel
                dock={dock}
                onClose={vi.fn()}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        expect(screen.queryByText("Dimensões (m):")).toBeNull();
    });

    it("chama onClose ao clicar no botão de fechar", () => {
        const onClose = vi.fn();

        render(
            <DockSlidePanel
                dock={baseDock}
                onClose={onClose}
                onEdit={vi.fn()}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        const closeBtn = document.querySelector(".dk-slide-close") as HTMLButtonElement;

        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("chama onEdit com o dock completo", () => {
        const onEdit = vi.fn();

        render(
            <DockSlidePanel
                dock={baseDock}
                onClose={vi.fn()}
                onEdit={onEdit}
                statusLabel={statusLabel}
                vesselTypeNamesFor={vesselTypeNamesFor}
            />
        );

        fireEvent.click(screen.getByText("Editar"));

        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(onEdit).toHaveBeenCalledWith(baseDock);
    });
});
