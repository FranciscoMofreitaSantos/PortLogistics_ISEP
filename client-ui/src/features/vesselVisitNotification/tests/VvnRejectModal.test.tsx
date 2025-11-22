import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VvnRejectModal } from "../components/modals/VvnRejectModal";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe("VvnRejectModal", () => {
    it("não renderiza quando open = false", () => {
        const { container } = render(
            <VvnRejectModal
                open={false}
                onClose={() => {}}
                message=""
                setMessage={() => {}}
                onConfirm={() => {}}
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    it("permite escrever mensagem e confirma", () => {
        const onClose = vi.fn();
        const onConfirm = vi.fn();
        const setMessage = vi.fn();

        render(
            <VvnRejectModal
                open={true}
                onClose={onClose}
                message=""
                setMessage={setMessage}
                onConfirm={onConfirm}
            />,
        );

        const textarea = screen.getByPlaceholderText(
            "vvn.modals.reject.placeholder",
        ) as HTMLTextAreaElement;

        fireEvent.change(textarea, { target: { value: "Reason here" } });
        expect(setMessage).toHaveBeenCalled();

        const confirmBtn = screen.getByText("common.confirm");
        fireEvent.click(confirmBtn);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("botão Cancel chama onClose", () => {
        const onClose = vi.fn();

        render(
            <VvnRejectModal
                open={true}
                onClose={onClose}
                message=""
                setMessage={() => {}}
                onConfirm={() => {}}
            />,
        );

        const cancelBtn = screen.getByText("common.cancel");
        fireEvent.click(cancelBtn);

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
