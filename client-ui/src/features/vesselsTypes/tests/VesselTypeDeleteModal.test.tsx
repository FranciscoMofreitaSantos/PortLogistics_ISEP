import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { VesselType } from "../domain/vesselType";
import VesselTypeDeleteModal from "../components/modals/VesselTypeDeleteModal";
import toast from "react-hot-toast";
import { apiDeleteVesselType } from "../services/vesselTypeService";

vi.mock("react-hot-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock("../services/vesselTypeService", () => ({
    apiDeleteVesselType: vi.fn().mockResolvedValue({}),
}));

const mockedToast = toast as any;
const mockedApiDelete = apiDeleteVesselType as any;

const sample: VesselType = {
    id: "vt-1",
    name: "Feeder",
    description: "Small ship",
    maxBays: 5,
    maxRows: 6,
    maxTiers: 3,
    capacityTeu: 1000,
};

describe("VesselTypeDeleteModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VesselTypeDeleteModal
                open={false}
                vesselType={sample}
                onClose={() => {}}
                onDeleted={() => {}}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it("não renderiza quando vesselType = null", () => {
        const { container } = render(
            <VesselTypeDeleteModal
                open={true}
                vesselType={null}
                onClose={() => {}}
                onDeleted={() => {}}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    

    it("botão Cancel chama apenas onClose", () => {
        const onClose = vi.fn();
        const onDeleted = vi.fn();

        render(
            <VesselTypeDeleteModal
                open={true}
                vesselType={sample}
                onClose={onClose}
                onDeleted={onDeleted}
            />
        );

        const cancelBtn = screen.getByText("vesselTypes.cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(onDeleted).not.toHaveBeenCalled();
        expect(mockedApiDelete).not.toHaveBeenCalled();
    });

    it("botão Delete chama API, mostra sucesso, onDeleted e onClose", async () => {
        const onClose = vi.fn();
        const onDeleted = vi.fn();

        render(
            <VesselTypeDeleteModal
                open={true}
                vesselType={sample}
                onClose={onClose}
                onDeleted={onDeleted}
            />
        );

        // existe título "delete" e botão "delete": apanho o último (botão)
        const deleteButtons = screen.getAllByText("vesselTypes.delete");
        const deleteBtn = deleteButtons[deleteButtons.length - 1];
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockedApiDelete).toHaveBeenCalledTimes(1);
            expect(mockedApiDelete).toHaveBeenCalledWith("vt-1");
            expect(mockedToast.success).toHaveBeenCalledTimes(1);
            expect(onDeleted).toHaveBeenCalledTimes(1);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });
});
