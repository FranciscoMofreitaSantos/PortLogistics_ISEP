import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// limpa o DOM entre testes
afterEach(() => cleanup());

// matchers extra
expect.extend(matchers);

// mock i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) =>
            opts?.count !== undefined ? `${key} (${opts.count})` : key,
    }),
}));

// mock react-hot-toast
vi.mock("react-hot-toast", () => {
    return {
        default: {
            success: vi.fn(),
            error: vi.fn(),
            loading: vi.fn(() => "toast-id"),
            dismiss: vi.fn(),
        },
    };
});
