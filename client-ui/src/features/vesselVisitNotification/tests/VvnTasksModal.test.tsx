import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VvnTasksModal } from "../components/modals/VvnTasksModal";
import type { TaskDto } from "../dto/vvnTypesDtos";

// mock i18n -> t(key) devolve a própria key
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("VvnTasksModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnTasksModal open={false} onClose={() => {}} tasks={[]} />,
        );

        expect(container.firstChild).toBeNull();
    });

    it("mostra texto de vazio quando não há tasks", () => {
        render(
            <VvnTasksModal open={true} onClose={() => {}} tasks={[]} />,
        );

        // usa directamente a key de tradução
        expect(screen.getByText("vvn.modals.tasks.empty")).toBeTruthy();
    });

    it("renderiza lista de tasks quando existem", () => {
        const tasks: TaskDto[] = [
            { id: "t1", title: "Task 1", description: "Desc 1", status: "Open" },
            { id: "t2", title: "Task 2", description: "Desc 2", status: "Done" },
        ];

        render(
            <VvnTasksModal open={true} onClose={() => {}} tasks={tasks} />,
        );

        expect(screen.getByText("Task 1")).toBeTruthy();
        expect(screen.getByText("Task 2")).toBeTruthy();
        expect(screen.getByText("Desc 1")).toBeTruthy();
        expect(screen.getByText("Desc 2")).toBeTruthy();
    });
});
