import { describe, it, beforeEach, expect, vi } from "vitest";
import GetVVEByCodeController from "../../../../controllers/vve/getVVEByCodeController";
import { BusinessRuleValidationError } from "../../../../core/logic/BusinessRuleValidationError";
import { mockRes } from "../../../helpers/mockHttp";

// Mock the Service and Logger
const mockService = {
    getByCodeAsync: vi.fn()
};
const mockLogger = {
    error: vi.fn()
};

vi.mock("../../../../domain/vesselVisitExecution/vesselVisitExecutionCode", () => {
    return {
        VesselVisitExecutionCode: {
            create: vi.fn((code) => code)
        }
    };
});

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {
        params: { code: "VVE2024000001" }
    };
    res = mockRes();

    controller = new GetVVEByCodeController(
        mockService as any,
        mockLogger as any
    );
});

describe("GetVVEByCodeController", () => {

    it("returns 200 and the VVE DTO on success", async () => {
        // Arrange
        const mockResult = {
            vvnId: "vvn-123",
            actualArrivalTime: "2024-01-01"
        };

        // Simulate Service Success
        mockService.getByCodeAsync.mockResolvedValue({
            getValue: () => mockResult
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
        expect(mockService.getByCodeAsync).toHaveBeenCalled();
    });

    it("returns 400 if 'code' parameter is missing", async () => {
        // Arrange
        req.params.code = undefined;

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "VVE code is required"
        }));
        expect(mockService.getByCodeAsync).not.toHaveBeenCalled();
    });

    it("returns 400 on BusinessRuleValidationError (Service Layer)", async () => {
        // Arrange
        const errorMessage = "Invalid VVE Code format";

        mockService.getByCodeAsync.mockRejectedValue(
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
        const error = new Error("Database timeout");
        mockService.getByCodeAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal server error"
        }));

        // Verify logger call
        expect(mockLogger.error).toHaveBeenCalledWith(
            "Unexpected error fetching VVE by code",
            { e: error }
        );
    });
});