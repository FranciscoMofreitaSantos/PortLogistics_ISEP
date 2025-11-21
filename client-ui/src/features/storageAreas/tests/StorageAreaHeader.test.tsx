import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaHeader } from "../components/StorageAreaHeader";

describe("StorageAreaHeader", () => {
    it("renderiza título, contador, search e botão de criação", () => {
        const onQueryChange = vi.fn();
        const onCreate = vi.fn();

        render(
            <StorageAreaHeader
                count={3}
                query="yard"
                onQueryChange={onQueryChange}
                onCreate={onCreate}
            />
        );

        // título + subtítulo (chaves de i18n)
        expect(screen.getByText("storageAreas.list.title")).toBeTruthy();
        expect(
            screen.getByText("storageAreas.list.registered", { exact: false })
        ).toBeTruthy();

        // input de pesquisa controlado
        const input = screen.getByPlaceholderText(
            "storageAreas.list.searchPlaceholder"
        ) as HTMLInputElement;
        expect(input.value).toBe("yard");

        fireEvent.change(input, { target: { value: "dock" } });
        expect(onQueryChange).toHaveBeenCalledWith("dock");

        // botão de criar
        const btn = screen.getByText("storageAreas.create.btnAdd");
        fireEvent.click(btn);
        expect(onCreate).toHaveBeenCalledTimes(1);
    });
});
