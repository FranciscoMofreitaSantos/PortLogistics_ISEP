import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplementaryTaskCreateModal from "../../components/ComplementaryTaskCreateModal";
import * as service from "../../services/complementaryTaskService";
import * as ctcService from "../../../complementaryTaskCategory/services/complementaryTaskCategoryService";
import toast from "react-hot-toast";
import type { VesselVisitExecutionDTO } from "../../../vesselVisitExecution/dto/vesselVisitExecutionDTO";
import type { ComplementaryTaskCategory } from "../../../complementaryTaskCategory/domain/complementaryTaskCategory";
import type { ComplementaryTask } from "../../domain/complementaryTask";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-hot-toast");

describe("ComplementaryTaskCreateModal", () => {
    const mockVveList: VesselVisitExecutionDTO[] = [
        { id: "v1", code: "VVE-001" } as VesselVisitExecutionDTO
    ];

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
            writable: true,
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ctcService, "getAllCTC").mockResolvedValue([
            { id: "cat-1", name: "Cleaning", isActive: true },
            { id: "cat-2", name: "Inactive", isActive: false }
        ] as ComplementaryTaskCategory[]);
    });

    it("should load only active categories in select", async () => {
        render(<ComplementaryTaskCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} vveList={mockVveList} />);
        await waitFor(() => {
            expect(screen.getByText("Cleaning")).toBeInTheDocument();
            expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
        });
    });

    it("should call createCT with form data on submit", async () => {
        const createSpy = vi.spyOn(service, "createCT").mockResolvedValue({} as ComplementaryTask);
        render(<ComplementaryTaskCreateModal isOpen={true} onClose={vi.fn()} onCreated={vi.fn()} vveList={mockVveList} />);

        await waitFor(() => screen.getByText("Cleaning"));

        const categorySelect = screen.getByLabelText("ct.form.category");
        await userEvent.selectOptions(categorySelect, "cat-1");

        const vveSelect = screen.getByLabelText("ct.form.vve");
        await userEvent.selectOptions(vveSelect, "v1");

        await userEvent.type(screen.getByLabelText("ct.form.staff"), "John");
        await userEvent.type(screen.getByLabelText("ct.form.startTime"), "2023-12-25T10:00");

        await userEvent.click(screen.getByText("ct.actions.create"));

        await waitFor(() => {
            expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
                category: "cat-1",
                staff: "John"
            }));
            expect(toast.success).toHaveBeenCalled();
        });
    });
});