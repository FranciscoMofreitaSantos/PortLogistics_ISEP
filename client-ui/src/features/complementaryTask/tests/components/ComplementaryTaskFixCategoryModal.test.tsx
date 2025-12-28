import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplementaryTaskFixCategoryModal from "../../components/ComplementaryTaskFixCategoryModal";
import * as service from "../../services/complementaryTaskService";
import * as ctcService from "../../../complementaryTaskCategory/services/complementaryTaskCategoryService";
import type { ComplementaryTask } from "../../domain/complementaryTask";
import type { ComplementaryTaskCategory } from "../../../complementaryTaskCategory/domain/complementaryTaskCategory";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock("react-hot-toast");

describe("ComplementaryTaskFixCategoryModal", () => {
    const mockTask: ComplementaryTask = {
        id: "1",
        code: "CT-FIX",
        category: "InactiveCat",
        staff: "Worker1",
        vve: "VVE1",
        status: "Scheduled",
        timeStart: new Date()
    };

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn() },
            writable: true,
        });
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(ctcService, "getAllCTC").mockResolvedValue([
            { id: "1", code: "NEW_CODE", name: "New Category", isActive: true }
        ] as ComplementaryTaskCategory[]);
    });

    it("should show warning about inactive category", async () => {
        render(<ComplementaryTaskFixCategoryModal isOpen={true} onClose={vi.fn()} onFixed={vi.fn()} task={mockTask} />);

        // Using waitFor handles the async update from loadActiveCategories and clears the act() warning
        await waitFor(() => {
            expect(screen.getByText("ct.fixCategoryMessage")).toBeInTheDocument();
        });
    });

    it("should call updateCT using selected category code", async () => {
        const updateSpy = vi.spyOn(service, "updateCT").mockResolvedValue(mockTask);
        render(<ComplementaryTaskFixCategoryModal isOpen={true} onClose={vi.fn()} onFixed={vi.fn()} task={mockTask} />);

        // Wait for categories to appear in the select
        await waitFor(() => screen.getByText("New Category"));

        await userEvent.selectOptions(screen.getByRole("combobox"), "NEW_CODE");
        await userEvent.click(screen.getByText("ct.actions.fix"));

        expect(updateSpy).toHaveBeenCalledWith("CT-FIX", expect.objectContaining({
            category: "NEW_CODE"
        }));
    });
});