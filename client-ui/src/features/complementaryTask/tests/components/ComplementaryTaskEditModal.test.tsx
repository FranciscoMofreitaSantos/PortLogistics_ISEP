import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplementaryTaskEditModal from "../../components/ComplementaryTaskEditModal";
import * as service from "../../services/complementaryTaskService";
import * as ctcService from "../../../complementaryTaskCategory/services/complementaryTaskCategoryService";
import type { ComplementaryTask } from "../../domain/complementaryTask";
import type { VesselVisitExecutionDTO } from "../../../vesselVisitExecution/dto/vesselVisitExecutionDTO";
import type { ComplementaryTaskCategory } from "../../../complementaryTaskCategory/domain/complementaryTaskCategory";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-hot-toast");

describe("ComplementaryTaskEditModal", () => {
    const mockResource: ComplementaryTask = {
        id: "1",
        code: "CT-99",
        category: "cat-id",
        staff: "Original Staff",
        vve: "vve-id",
        status: "Scheduled",
        timeStart: new Date("2023-10-10T10:00:00")
    };

    const mockVveList: VesselVisitExecutionDTO[] = [
        { id: "vve-id", code: "VVE-001" } as VesselVisitExecutionDTO
    ];

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
            writable: true,
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock category loading to prevent Network Error
        vi.spyOn(ctcService, "getAllCTC").mockResolvedValue([
            { id: "cat-id", name: "Cleaning", code: "CLN", isActive: true }
        ] as ComplementaryTaskCategory[]);
    });

    it("should populate form with resource data", async () => {
        render(
            <ComplementaryTaskEditModal
                isOpen={true}
                onClose={vi.fn()}
                onUpdated={vi.fn()}
                resource={mockResource}
                vveList={mockVveList}
            />
        );

        // Wait for categories to load to avoid act() warnings
        await waitFor(() => expect(screen.getByDisplayValue("Original Staff")).toBeInTheDocument());
        expect(screen.getByDisplayValue("CT-99")).toBeDisabled();
    });

    it("should call updateCT with correct code and data", async () => {
        const updateSpy = vi.spyOn(service, "updateCT").mockResolvedValue(mockResource);
        render(
            <ComplementaryTaskEditModal
                isOpen={true}
                onClose={vi.fn()}
                onUpdated={vi.fn()}
                resource={mockResource}
                vveList={mockVveList}
            />
        );

        // Wait for component to be ready
        const staffInput = await screen.findByLabelText("ct.form.staff");

        await userEvent.clear(staffInput);
        await userEvent.type(staffInput, "New Staff");

        await userEvent.click(screen.getByText("actions.save"));

        expect(updateSpy).toHaveBeenCalledWith("CT-99", expect.objectContaining({
            staff: "New Staff"
        }));
    });
});