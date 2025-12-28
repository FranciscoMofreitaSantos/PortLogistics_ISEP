import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComplementaryTaskSearch from "../../components/ComplementaryTaskSearch";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe("ComplementaryTaskSearch", () => {
    it("should call onSearch with correct value when searching by code", async () => {
        const onSearch = vi.fn();
        render(<ComplementaryTaskSearch onSearch={onSearch} />);

        await userEvent.selectOptions(screen.getByRole("combobox"), "code");

        const input = screen.getByPlaceholderText("common.search");
        await userEvent.type(input, "TASK123");
        await userEvent.click(screen.getByTitle("actions.search"));

        expect(onSearch).toHaveBeenCalledWith("code", "TASK123");
    });

    it("should switch to date inputs when range filter is selected", async () => {
        const { container } = render(<ComplementaryTaskSearch onSearch={vi.fn()} />);
        await userEvent.selectOptions(screen.getByRole("combobox"), "range");

        await waitFor(() => {
            const inputs = container.querySelectorAll('input[type="datetime-local"]');
            expect(inputs).toHaveLength(2);
        });
    });

    it("should clear filters when clicking clear button", async () => {
        const onSearch = vi.fn();
        render(<ComplementaryTaskSearch onSearch={onSearch} />);

        const input = screen.getByPlaceholderText("actions.search");
        await userEvent.click(screen.getByTitle("actions.clear"));

        expect(input).toHaveValue("");
        expect(onSearch).toHaveBeenCalledWith("all", "");
    });
});