import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VesselTypeCreateModal from "../components/modals/VesselTypeCreateModal";
import toast from "react-hot-toast";
import { apiCreateVesselType } from "../services/vesselTypeService";
import { toCreateVesselTypeDto } from "../mappers/vesselTypeMapper";

vi.mock("react-hot-toast", () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock("../services/vesselTypeService", () => ({
    apiCreateVesselType: vi.fn().mockResolvedValue({}),
}));

vi.mock("../mappers/vesselTypeMapper", () => ({
    toCreateVesselTypeDto: vi.fn((input) => input),
}));

const mockedToast = toast as any;
const mockedApiCreate = apiCreateVesselType as any;
const mockedToCreateDto = toCreateVesselTypeDto as any;

describe("VesselTypeCreateModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("não renderiza nada quando open = false", () => {
        const { container } = render(
            <VesselTypeCreateModal open={false} onClose={() => {}} onCreated={() => {}} />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renderiza o formulário quando open = true", () => {
        render(
            <VesselTypeCreateModal open={true} onClose={() => {}} onCreated={() => {}} />
        );

        expect(screen.getByText("vesselTypes.add")).toBeTruthy();
        expect(screen.getByText("vesselTypes.details.name *")).toBeTruthy();
        expect(screen.getByText("vesselTypes.details.bays *")).toBeTruthy();
        expect(screen.getByText("vesselTypes.details.rows *")).toBeTruthy();
        expect(screen.getByText("vesselTypes.details.tiers *")).toBeTruthy();
    });

    it("se o nome estiver vazio, mostra erro e NÃO chama API nem callbacks", async () => {
        const onClose = vi.fn();
        const onCreated = vi.fn();

        render(
            <VesselTypeCreateModal open={true} onClose={onClose} onCreated={onCreated} />
        );

        const saveBtn = screen.getByText("vesselTypes.save");
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockedToast.error).toHaveBeenCalledTimes(1);
        });

        expect(mockedApiCreate).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(onCreated).not.toHaveBeenCalled();
    });

    it("quando os dados são válidos, chama mapper, API, mostra sucesso e chama onCreated/onClose", async () => {
        const onClose = vi.fn();
        const onCreated = vi.fn();

        render(
            <VesselTypeCreateModal open={true} onClose={onClose} onCreated={onCreated} />
        );

        const inputs = screen.getAllByRole("textbox");
        const nameInput = inputs[0];
        const descInput = inputs[1];

        fireEvent.change(nameInput, { target: { value: "Panamax" } });
        fireEvent.change(descInput, { target: { value: "Medium ship" } });

        const numberInputs = screen.getAllByRole("spinbutton");
        fireEvent.change(numberInputs[0], { target: { value: "12" } });
        fireEvent.change(numberInputs[1], { target: { value: "14" } });
        fireEvent.change(numberInputs[2], { target: { value: "6" } });

        const saveBtn = screen.getByText("vesselTypes.save");
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockedToCreateDto).toHaveBeenCalledTimes(1);
            expect(mockedApiCreate).toHaveBeenCalledTimes(1);
            expect(mockedToast.success).toHaveBeenCalledTimes(1);
            expect(onCreated).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("botão Cancel fecha o modal sem chamar API", () => {
        const onClose = vi.fn();

        render(
            <VesselTypeCreateModal open={true} onClose={onClose} onCreated={() => {}} />
        );

        const cancelBtn = screen.getByText("vesselTypes.cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockedApiCreate).not.toHaveBeenCalled();
    });
});
