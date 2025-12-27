import { vi } from "vitest";

export const mockRes = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
});