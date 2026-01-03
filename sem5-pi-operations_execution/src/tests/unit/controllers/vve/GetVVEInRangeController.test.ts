import { describe, it, beforeEach, expect, vi } from "vitest";
import GetVVEInRangeController from "../../../../controllers/vve/getVVEInRangeController";
import { BusinessRuleValidationError } from "../../../../core/logic/BusinessRuleValidationError";
import { mockRes } from "../../../helpers/mockHttp";

// Mocks
const mockService = {
    getInRangeAsync: vi.fn()
};
const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

let req: any;
let res: any;
let controller: any;

beforeEach(() => {
    vi.clearAllMocks();

    req = {
        query: {
            timeStart: "1704067200000",
            timeEnd: "1704153600000"
        }
    };
    res = mockRes();

    controller = new GetVVEInRangeController(
        mockService as any,
        mockLogger as any
    );
});

describe("GetVVEInRangeController", () => {

    it("returns 200 and the list of VVEs on success", async () => {
        // Arrange
        const mockResult = [
            { id: "vve-1", actualArrivalTime: "2024-01-01T12:00:00Z" }
        ];

        mockService.getInRangeAsync.mockResolvedValue({
            getValue: () => mockResult
        });

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);

        expect(mockService.getInRangeAsync).toHaveBeenCalledWith(
            expect.any(Date),
            expect.any(Date)
        );
    });

    it("returns 400 if 'timeStart' or 'timeEnd' is missing", async () => {
        // Arrange
        req.query.timeStart = undefined; // Remove um dos params

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "timeStart and timeEnd are required"
        }));
        expect(mockService.getInRangeAsync).not.toHaveBeenCalled();
    });

    it("returns 400 if date formats are invalid (NaN)", async () => {
        // Arrange
        req.query.timeStart = "invalid-date-string";

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Invalid date range."
        }));
    });

    it("returns 400 on BusinessRuleValidationError (e.g. start > end) and logs warning", async () => {
        // Arrange
        const errorMsg = "Start date cannot be after end date";
        mockService.getInRangeAsync.mockRejectedValue(
            new BusinessRuleValidationError(errorMsg)
        );

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: errorMsg
        }));

        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining("Business rule violation"),
            expect.anything()
        );
    });

    it("returns 500 on unexpected error and logs error", async () => {
        // Arrange
        const error = new Error("DB Crash");
        mockService.getInRangeAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "Internal server error"
        }));

        expect(mockLogger.error).toHaveBeenCalledWith(
            "Unhandled error in GetVVEInRangeController",
            expect.objectContaining({
                error: "DB Crash"
            })
        );
    });
});