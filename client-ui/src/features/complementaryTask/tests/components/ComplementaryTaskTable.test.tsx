import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplementaryTaskTable from "../../components/ComplementaryTaskTable";
import type { ComplementaryTask } from "../../domain/complementaryTask";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe("ComplementaryTaskTable", () => {
    const mockTasks: ComplementaryTask[] = [
        {
            id: "1",
            code: "CT001",
            category: "CAT1",
            staff: "Staff A",
            vve: "VVE1",
            status: "InProgress",
            timeStart: new Date("2023-10-10T10:00:00Z"),
        },
        {
            id: "2",
            code: "CT002",
            category: "CAT2",
            staff: "Staff B",
            vve: "VVE2",
            status: "Completed",
            timeStart: new Date("2023-10-10T11:00:00Z"),
            timeEnd: new Date("2023-10-10T12:00:00Z"),
        },
    ];

    const mockHandlers = {
        onEdit: vi.fn(),
        onViewCategory: vi.fn(),
        onViewVve: vi.fn(),
        onFixCategory: vi.fn(),
        onStatusChange: vi.fn(),
    };

    it("should display no data message when tasks are empty", () => {
        render(<ComplementaryTaskTable {...mockHandlers} tasks={[]} categories={[]} vves={[]} />);
        expect(screen.getByText("ct.noData")).toBeInTheDocument();
    });

    it("should render table rows correctly", () => {
        render(<ComplementaryTaskTable {...mockHandlers} tasks={mockTasks} categories={[]} vves={[]} />);
        expect(screen.getByText("CT001")).toBeInTheDocument();
        expect(screen.getByText("Staff B")).toBeInTheDocument();
    });

    it("should call onStatusChange when clicking complete button", async () => {
        render(<ComplementaryTaskTable {...mockHandlers} tasks={mockTasks} categories={[]} vves={[]} />);
        const completeBtn = screen.getByText("ct.actions.complete");
        await userEvent.click(completeBtn);
        expect(mockHandlers.onStatusChange).toHaveBeenCalledWith("CT001", "Completed");
    });

    it("should disable edit button if task is completed", () => {
        render(<ComplementaryTaskTable {...mockHandlers} tasks={mockTasks} categories={[]} vves={[]} />);
        const editBtns = screen.getAllByText("ct.actions.edit");
        expect(editBtns[1]).toBeDisabled();
    });
});