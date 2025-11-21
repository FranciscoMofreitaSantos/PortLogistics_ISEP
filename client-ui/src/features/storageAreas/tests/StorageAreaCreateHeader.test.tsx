import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StorageAreaCreateHeader } from "../components/StorageAreaCreateHeader";

// mock simples do i18n
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("StorageAreaCreateHeader", () => {
    it("renderiza título e botão de voltar", () => {
        const onBack = vi.fn();

        render(<StorageAreaCreateHeader onBack={onBack} />);

        // título com ícone antes → usar regex
        const title = screen.getByText(/storageAreas\.create\.title/);
        expect(title).toBeTruthy();

        // botão com seta + texto → usar role+name
        const btn = screen.getByRole("button", {
            name: /storageAreas\.create\.btnBack/,
        });
        expect(btn).toBeTruthy();

        fireEvent.click(btn);
        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
