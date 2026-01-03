import { describe, it, beforeEach, expect, vi } from "vitest";
import CreateVVEController from "../../../../controllers/vve/createVVEController";

import { BusinessRuleValidationError }
    from "../../../../core/logic/BusinessRuleValidationError";

import { mockRes } from "../../../helpers/mockHttp";

// Mocks
const mockService = { createAsync: vi.fn() };
const mockLogger = { warn: vi.fn(), error: vi.fn() };

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {
        body: {
            vvnId: "vvn-123",
            actualArrivalTime: "2025-01-01T14:30:00Z",
            creatorEmail: "fallback@test.com"
        },
        currentUser: { email: "admin@test.com" }
    };

    res = mockRes();

    controller = new CreateVVEController(
        mockService as any,
        mockLogger as any
    );
});

describe("CreateVVEController", () => {

    it("returns 200 on success", async () => {
        // Arrange
        const expectedValue = { id: "vve-new", status: "IN_PORT" };

        mockService.createAsync.mockResolvedValue({
            getValue: () => expectedValue
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expectedValue);

        expect(mockService.createAsync).toHaveBeenCalledWith({
            vvnId: "vvn-123",
            actualArrivalTime: expect.any(Date),
            creatorEmail: "admin@test.com"
        });
    });

    it("returns 200 on success using creatorEmail from body when currentUser is missing", async () => {
        // Arrange
        req.currentUser = undefined;
        req.body.creatorEmail = "manual@test.com";

        mockService.createAsync.mockResolvedValue({
            getValue: () => ({ code: "OK" })
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockService.createAsync).toHaveBeenCalledWith(expect.objectContaining({
            creatorEmail: "manual@test.com"
        }));
    });

    it("returns 400 if email is missing (no currentUser and no body email)", async () => {
        // Arrange
        req.currentUser = undefined;
        req.body.creatorEmail = undefined;

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "E-mail do utilizador é obrigatório."
        }));
    });

    it("returns 400 on BusinessRuleValidationError", async () => {
        // Arrange
        mockService.createAsync.mockRejectedValue(
            new BusinessRuleValidationError("Date invalid")
        );

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 on generic string error", async () => {
        // Arrange
        mockService.createAsync.mockRejectedValue("Erro genérico string");

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 500 on unexpected error", async () => {
        // Arrange
        const error = new Error("Database connection failed");
        mockService.createAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(mockLogger.error).toHaveBeenCalledWith("Erro inesperado ao criar VVE", { e: error });
    });
});