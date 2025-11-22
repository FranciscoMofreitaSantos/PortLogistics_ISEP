import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockEditModal } from "../components/DockEditModal";
import type { UpdateDockRequest } from "../domain/dock";

const t = (key: string, opts?: any) => opts?.defaultValue ?? key;

type EditNums = {
    lengthM: string;
    depthM: string;
    maxDraftM: string;
};

type EditErrors = {
    location?: string;
    lengthM?: string;
    depthM?: string;
    maxDraftM?: string;
    vessels?: string;
};

function renderModal(overrides?: Partial<React.ComponentProps<typeof DockEditModal>>) {
    const onSave = vi.fn();
    const onClose = vi.fn();

    function Wrapper() {
        const [editData, setEditData] = useState<UpdateDockRequest>({
            id: "D1",
            location: "Porto Velho",
            status: "Available",
        } as any);

        const [editNums, setEditNums] = useState<EditNums>({
            lengthM: "",
            depthM: "",
            maxDraftM: "",
        });

        const [editPRs, setEditPRs] = useState<string[]>(["PR1"]);
        const [editVTs, setEditVTs] = useState<string[]>(["VT1"]);
        const [errors, setErrors] = useState<EditErrors>({});

        return (
            <DockEditModal
                isOpen={true}
                t={t}
                editData={editData}
                setEditData={setEditData}
                editNums={editNums}
                setEditNums={setEditNums}
                editPRs={editPRs}
                setEditPRs={setEditPRs}
                editVTs={editVTs}
                setEditVTs={setEditVTs}
                errors={errors}
                setErrors={setErrors}
                availablePRsForEdit={["PR1", "PR2"]}
                vesselTypes={[{ id: "VT1", name: "Panamax" } as any]}
                onSave={onSave}
                onClose={onClose}
                {...overrides}
            />
        );
    }

    const utils = render(<Wrapper />);

    return { ...utils, onSave, onClose };
}

describe("DockEditModal", () => {
    it("não renderiza nada quando isOpen é false", () => {
        const { container } = render(
            <DockEditModal
                isOpen={false}
                t={t}
                editData={{ id: "X" } as any}
                setEditData={vi.fn()}
                editNums={{ lengthM: "", depthM: "", maxDraftM: "" }}
                setEditNums={vi.fn()}
                editPRs={[]}
                setEditPRs={vi.fn()}
                editVTs={[]}
                setEditVTs={vi.fn()}
                errors={{}}
                setErrors={vi.fn()}
                availablePRsForEdit={[]}
                vesselTypes={[]}
                onSave={vi.fn()}
                onClose={vi.fn()}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renderiza os campos principais", () => {
        renderModal();

        expect(screen.getByText("Editar Dock")).toBeInTheDocument();
        expect(screen.getByText("Localização *")).toBeInTheDocument();
        expect(screen.getByText("Estado")).toBeInTheDocument();
        expect(screen.getByText("Comprimento (m)")).toBeInTheDocument();
        expect(screen.getByText("Profundidade (m)")).toBeInTheDocument();
        expect(screen.getByText("Calado Máximo (m)")).toBeInTheDocument();

        expect(screen.getByText("Recursos Físicos")).toBeInTheDocument();
        expect(screen.getByLabelText("PR1")).toBeInTheDocument();
        expect(screen.getByLabelText("PR2")).toBeInTheDocument();
        expect(screen.getByLabelText("Panamax")).toBeInTheDocument();
    });

    it("sanitiza a localização removendo caracteres inválidos", () => {
        renderModal();

        const locationInput = screen.getByText("Localização *")
            .nextElementSibling as HTMLInputElement;

        fireEvent.change(locationInput, {
            target: { value: "  Porto@@  #Centro!!   " },
        });

        expect(locationInput.value).toBe("Porto Centro");
    });

    it("normaliza valores decimais ao remover vírgulas no blur", () => {
        renderModal();

        const lengthInput = screen.getByText("Comprimento (m)").nextElementSibling as HTMLInputElement;
        const depthInput = screen.getByText("Profundidade (m)").nextElementSibling as HTMLInputElement;
        const maxDraftInput = screen.getByText("Calado Máximo (m)").nextElementSibling as HTMLInputElement;

        fireEvent.change(lengthInput, { target: { value: "10,5" } });
        fireEvent.blur(lengthInput);
        expect(lengthInput.value).toBe("10.5");

        fireEvent.change(depthInput, { target: { value: "3,2" } });
        fireEvent.blur(depthInput);
        expect(depthInput.value).toBe("3.2");

        fireEvent.change(maxDraftInput, { target: { value: "7,0" } });
        fireEvent.blur(maxDraftInput);
        expect(maxDraftInput.value).toBe("7.0");
    });

    it("permite selecionar e remover PRs", () => {
        renderModal();

        const pr2 = screen.getByLabelText("PR2") as HTMLInputElement;

        expect(pr2.checked).toBe(false);

        fireEvent.click(pr2);
        expect(pr2.checked).toBe(true);

        fireEvent.click(pr2);
        expect(pr2.checked).toBe(false);
    });

    it("permite selecionar e remover tipos de navio", () => {
        renderModal();

        const vt1 = screen.getByLabelText("Panamax") as HTMLInputElement;

        expect(vt1.checked).toBe(true);

        fireEvent.click(vt1);
        expect(vt1.checked).toBe(false);
    });

    it("chama onSave e onClose", () => {
        const { onSave, onClose } = renderModal();

        fireEvent.click(screen.getByText("Guardar"));
        expect(onSave).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("Cancelar"));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("mostra mensagem quando não há PRs disponíveis", () => {
        renderModal({ availablePRsForEdit: [] });

        expect(screen.getByText("Sem recursos disponíveis")).toBeInTheDocument();
    });
});
