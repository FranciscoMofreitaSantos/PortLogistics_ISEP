import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockHeader } from "../components/DockHeader";

describe("DockHeader", () => {
    it("renderiza o título, subtítulo e count", () => {
        render(
            <DockHeader
                count={5}
                onCreateClick={vi.fn()}
                title="Lista de Docks"
                subtitle="Existem {{count}} docks"
            />
        );

        expect(screen.getByText(/Lista de Docks/)).toBeInTheDocument();

        expect(screen.getByText("Existem 5 docks")).toBeInTheDocument();
    });

    it("renderiza o botão de criação", () => {
        render(
            <DockHeader
                count={0}
                onCreateClick={vi.fn()}
                title="Docks"
                subtitle="Total {{count}}"
            />
        );

        expect(screen.getByText("Adicionar Dock")).toBeInTheDocument();
    });

    it("chama onCreateClick quando se clica no botão", () => {
        const onCreateClick = vi.fn();

        render(
            <DockHeader
                count={1}
                onCreateClick={onCreateClick}
                title="Docks"
                subtitle="Tem {{count}} dock"
            />
        );

        const button = screen.getByText("Adicionar Dock");

        fireEvent.click(button);

        expect(onCreateClick).toHaveBeenCalledTimes(1);
    });
});
