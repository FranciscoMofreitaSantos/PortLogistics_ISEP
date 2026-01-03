import { describe, it, beforeEach, expect, vi } from "vitest";
import GetVVEByIdController from "../../../../controllers/vve/getVVEByIdController";
import { BusinessRuleValidationError } from "../../../../core/logic/BusinessRuleValidationError";
import { mockRes } from "../../../helpers/mockHttp";

// Mock do Serviço e Logger
const mockService = {
    getByIdAsync: vi.fn()
};
const mockLogger = {
    error: vi.fn()
};
vi.mock("../../../../domain/vesselVisitExecution/vesselVisitExecutionId", () => {
    return {
        VesselVisitExecutionId: {
            create: vi.fn((id) => id) // Retorna o ID tal como entrou
        }
    };
});

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {
        params: { id: "vve-123-id" }
    };
    res = mockRes();

    controller = new GetVVEByIdController(
        mockService as any,
        mockLogger as any
    );
});

describe("GetVVEByIdController", () => {

    it("returns 200 and the VVE DTO on success", async () => {
        // Arrange
        const mockResult = {
            id: "vve-123-id",
            actualArrivalTime: "2024-01-01"
        };

        mockService.getByIdAsync.mockResolvedValue({
            getValue: () => mockResult
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
        expect(mockService.getByIdAsync).toHaveBeenCalled();
    });

    it("returns 400 if 'id' parameter is missing", async () => {
        // Arrange
        req.params.id = undefined;

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "VVE id is required"
        }));
        expect(mockService.getByIdAsync).not.toHaveBeenCalled();
    });

    it("returns 400 on BusinessRuleValidationError (Service Layer)", async () => {
        // Arrange
        const errorMessage = "VVE ID not found";

        mockService.getByIdAsync.mockRejectedValue(
            new BusinessRuleValidationError(errorMessage)
        );

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: errorMessage
        }));
    });

    it("returns 500 on unexpected error and logs it", async () => {
        // Arrange
        const error = new Error("DB Connection Lost");
        mockService.getByIdAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal server error"
        }));

        // Verifica o logger
        expect(mockLogger.error).toHaveBeenCalledWith(
            "Unexpected error fetching VVE by id",
            { e: error }
        );
    });
});