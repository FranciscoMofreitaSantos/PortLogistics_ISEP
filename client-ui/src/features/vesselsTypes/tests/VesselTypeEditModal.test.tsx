import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VesselType } from "../domain/vesselType";
import VesselTypeEditModal from "../components/modals/VesselTypeEditModal";
import toast from "react-hot-toast";
import { apiUpdateVesselType } from "../services/vesselTypeService";
import { toUpdateVesselTypeDto } from "../mappers/vesselTypeMapper";

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../services/vesselTypeService", () => ({
    apiUpdateVesselType: vi.fn().mockResolvedValue({}),
}));

vi.mock("../mappers/vesselTypeMapper", () => ({
    toUpdateVesselTypeDto: vi.fn((vt) => vt),
}));

const mockedToast = toast as any;
const mockedApiUpdate = apiUpdateVesselType as any;
const mockedToUpdateDto = toUpdateVesselTypeDto as any;

const sample: VesselType = {
    id: "vt-1",
    name: "Panamax",
    description: "Medium ship",
    maxBays: 10,
    maxRows: 12,
    maxTiers: 5,
    capacityTeu: 5000,
};

describe("VesselTypeEditModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VesselTypeEditModal
                open={false}
                vesselType={sample}
                onClose={() => {}}
                onUpdated={() => {}}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("não renderiza quando vesselType = null", () => {
        const { container } = render(
            <VesselTypeEditModal
                open={true}
                vesselType={null}
                onClose={() => {}}
                onUpdated={() => {}}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("renderiza os campos com os valores iniciais do vesselType", () => {
        render(
            <VesselTypeEditModal
                open={true}
                vesselType={sample}
                onClose={() => {}}
                onUpdated={() => {}}
            />
        );

        const inputsText = screen.getAllByRole("textbox");
        const nameInput = inputsText[0];
        const descInput = inputsText[1];

        expect((nameInput as HTMLInputElement).value).toBe("Panamax");
        expect((descInput as HTMLInputElement).value).toBe("Medium ship");
    });

    it("permite alterar o nome e guarda via API ao clicar Save", async () => {
        const onClose = vi.fn();
        const onUpdated = vi.fn();

        render(
            <VesselTypeEditModal
                open={true}
                vesselType={sample}
                onClose={onClose}
                onUpdated={onUpdated}
            />
        );

        const inputsText = screen.getAllByRole("textbox");
        const nameInput = inputsText[0] as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: "Panamax-X" } });

        const saveBtn = screen.getByText("vesselTypes.save");
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockedToUpdateDto).toHaveBeenCalledTimes(1);
            expect(mockedApiUpdate).toHaveBeenCalledTimes(1);
            expect(mockedApiUpdate.mock.calls[0][0]).toBe("vt-1");
            expect(mockedToast.success).toHaveBeenCalledTimes(1);
            expect(onUpdated).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    it("botão Cancel fecha o modal sem chamar API", () => {
        const onClose = vi.fn();

        render(
            <VesselTypeEditModal
                open={true}
                vesselType={sample}
                onClose={onClose}
                onUpdated={() => {}}
            />
        );

        const cancelBtn = screen.getByText("vesselTypes.cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockedApiUpdate).not.toHaveBeenCalled();
    });
});
