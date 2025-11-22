import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DockSearchBar } from "../components/DockSearchBar";

describe("DockSearchBar", () => {
    it("renderiza o input com placeholder correto", () => {
        render(
            <DockSearchBar
                value=""
                placeholder="Procurar docks..."
                onChange={vi.fn()}
                onSearch={vi.fn()}
                onClear={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText("Procurar docks...")).toBeInTheDocument();
    });

    it("chama onChange quando o utilizador escreve no input", () => {
        const onChange = vi.fn();

        render(
            <DockSearchBar
                value=""
                placeholder="search"
                onChange={onChange}
                onSearch={vi.fn()}
                onClear={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText("search");

        fireEvent.change(input, { target: { value: "abc" } });

        expect(onChange).toHaveBeenCalledWith("abc");
    });

    it("mostra o botão clear quando existe texto", () => {
        render(
            <DockSearchBar
                value="dock 1"
                placeholder="search"
                onChange={vi.fn()}
                onSearch={vi.fn()}
                onClear={vi.fn()}
            />
        );

        expect(screen.getByText("✕")).toBeInTheDocument();
    });

    it("oculta o botão clear quando o texto está vazio", () => {
        render(
            <DockSearchBar
                value=""
                placeholder="search"
                onChange={vi.fn()}
                onSearch={vi.fn()}
                onClear={vi.fn()}
            />
        );

        expect(screen.queryByText("✕")).toBeNull();
    });

    it("chama onClear quando o botão de limpar é clicado", () => {
        const onClear = vi.fn();

        render(
            <DockSearchBar
                value="X"
                placeholder="search"
                onChange={vi.fn()}
                onSearch={vi.fn()}
                onClear={onClear}
            />
        );

        fireEvent.click(screen.getByText("✕"));

        expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("chama onSearch quando o botão de pesquisa é clicado", () => {
        const onSearch = vi.fn();

        render(
            <DockSearchBar
                value=""
                placeholder="search"
                onChange={vi.fn()}
                onSearch={onSearch}
                onClear={vi.fn()}
            />
        );

        const btn = screen.getByRole("button", { name: "" }); // o ícone não tem texto

        fireEvent.click(btn);

        expect(onSearch).toHaveBeenCalledTimes(1);
    });

    it("chama onSearch quando o utilizador pressiona Enter", () => {
        const onSearch = vi.fn();

        render(
            <DockSearchBar
                value="x"
                placeholder="search"
                onChange={vi.fn()}
                onSearch={onSearch}
                onClear={vi.fn()}
            />
        );

        const input = screen.getByPlaceholderText("search");

        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSearch).toHaveBeenCalledTimes(1);
    });
});
