import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockCreateModal } from "../components/DockCreateModal";

type CreateStatus = "Available" | "Unavailable" | "Maintenance";

type CreateData = {
    code: string;
    location: string;
    status: CreateStatus;
};

type CreateNums = {
    lengthM: string;
    depthM: string;
    maxDraftM: string;
};

type CreateErrors = {
    code?: string;
    location?: string;
    lengthM?: string;
    depthM?: string;
    maxDraftM?: string;
    vessels?: string;
    numbers?: string;
};

const defaultT = (key: string, opts?: any) =>
    opts?.defaultValue ?? key;

function renderModal(overrides?: Partial<React.ComponentProps<typeof DockCreateModal>>) {
    const onSave = vi.fn();
    const onClose = vi.fn();

    function Wrapper() {
        const [createData, setCreateData] = useState<CreateData>({
            code: "",
            location: "",
            status: "Available",
        });

        const [createNums, setCreateNums] = useState<CreateNums>({
            lengthM: "",
            depthM: "",
            maxDraftM: "",
        });

        const [createPRs, setCreatePRs] = useState<string[]>([]);
        const [createVTs, setCreateVTs] = useState<string[]>([]);
        const [createErrors, setCreateErrors] = useState<CreateErrors>({});

        return (
            <DockCreateModal
                isOpen={true}
                t={defaultT}
                createData={createData}
                setCreateData={setCreateData}
                createNums={createNums}
                setCreateNums={setCreateNums}
                createPRs={createPRs}
                setCreatePRs={setCreatePRs}
                createVTs={createVTs}
                setCreateVTs={setCreateVTs}
                createErrors={createErrors}
                setCreateErrors={setCreateErrors}
                availablePRsForCreate={["PR1", "PR2"]}
                vesselTypes={[{ id: "VT1", name: "Panamax" } as any]}
                allKnownCodes={["DK-0001"]}
                onSave={onSave}
                onClose={onClose}
                {...overrides}
            />
        );
    }

    const utils = render(<Wrapper />);

    return {
        ...utils,
        onSave,
        onClose,
    };
}

describe("DockCreateModal", () => {
    it("não renderiza nada quando isOpen é false", () => {
        const { container } = render(
            <DockCreateModal
                isOpen={false}
                t={defaultT}
                createData={{ code: "", location: "", status: "Available" }}
                setCreateData={vi.fn()}
                createNums={{ lengthM: "", depthM: "", maxDraftM: "" }}
                setCreateNums={vi.fn()}
                createPRs={[]}
                setCreatePRs={vi.fn()}
                createVTs={[]}
                setCreateVTs={vi.fn()}
                createErrors={{}}
                setCreateErrors={vi.fn()}
                availablePRsForCreate={[]}
                vesselTypes={[]}
                allKnownCodes={[]}
                onSave={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renderiza campos principais, PRs e tipos de navio quando aberto", () => {
        renderModal();

        expect(screen.getByText("Adicionar Dock")).toBeInTheDocument();

        expect(screen.getByText("Código *")).toBeInTheDocument();
        expect(screen.getByText("Localização *")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Comprimento (m)")).toBeInTheDocument();
        expect(screen.getByText("Profundidade (m)")).toBeInTheDocument();
        expect(screen.getByText("Calado Máximo (m)")).toBeInTheDocument();

        expect(screen.getByText("Recursos Físicos (disponíveis)")).toBeInTheDocument();
        expect(screen.getByLabelText("PR1")).toBeInTheDocument();
        expect(screen.getByLabelText("PR2")).toBeInTheDocument();

        expect(screen.getByText("Tipos de Navio Permitidos")).toBeInTheDocument();
        expect(screen.getByLabelText("Panamax")).toBeInTheDocument();
    });

    it("mostra erro de formato de código quando o padrão DK-0000 não é respeitado", () => {
        renderModal();

        const codeInput = screen.getByPlaceholderText("DK-0000") as HTMLInputElement;

        fireEvent.change(codeInput, { target: { value: "abc" } });
        fireEvent.blur(codeInput);

        expect(screen.getByText("Formato DK-0000")).toBeInTheDocument();
    });

    it("mostra erro de código duplicado quando já existe na lista allKnownCodes", () => {
        renderModal();

        const codeInput = screen.getByPlaceholderText("DK-0000") as HTMLInputElement;

        fireEvent.change(codeInput, { target: { value: "dk-0001" } });
        fireEvent.blur(codeInput);

        expect(
            screen.getByText("Já existe uma dock com esse código")
        ).toBeInTheDocument();
    });

    it("sanitiza a localização removendo caracteres inválidos e espaços extra", () => {
        renderModal();

        const locationLabel = screen.getByText("Localização *");
        const locationInput = locationLabel.nextElementSibling as HTMLInputElement;

        fireEvent.change(locationInput, {
            target: { value: "  Porto@@  #Central   !! " },
        });

        expect(locationInput.value).toBe("Porto Central");
    });

    it("normaliza valores decimais substituindo vírgula por ponto no blur", () => {
        renderModal();

        const lengthInput = screen.getByText("Comprimento (m)")
            .nextElementSibling as HTMLInputElement;
        const depthInput = screen.getByText("Profundidade (m)")
            .nextElementSibling as HTMLInputElement;
        const draftInput = screen.getByText("Calado Máximo (m)")
            .nextElementSibling as HTMLInputElement;

        fireEvent.change(lengthInput, { target: { value: "10,5" } });
        fireEvent.blur(lengthInput);
        expect(lengthInput.value).toBe("10.5");

        fireEvent.change(depthInput, { target: { value: "3,2" } });
        fireEvent.blur(depthInput);
        expect(depthInput.value).toBe("3.2");

        fireEvent.change(draftInput, { target: { value: "7,0" } });
        fireEvent.blur(draftInput);
        expect(draftInput.value).toBe("7.0");
    });

    it("mostra mensagem quando não há recursos físicos disponíveis", () => {
        renderModal({ availablePRsForCreate: [] });

        expect(screen.getByText("Sem recursos disponíveis")).toBeInTheDocument();
    });

    it("chama onSave e onClose quando se clica nos botões", () => {
        const { onSave, onClose } = renderModal();

        fireEvent.click(screen.getByText("Guardar"));
        fireEvent.click(screen.getByText("Cancelar"));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
