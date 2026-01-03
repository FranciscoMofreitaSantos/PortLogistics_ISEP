import "reflect-metadata";
import { describe, it, beforeEach, expect, vi } from "vitest";
import GetOperationPlansController from "../../../../controllers/operationPlan/getOperationPlansController";

const mockService = {
    getPlansAsync: vi.fn()
};

const createMockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
};

const ResultOk = (value: any) => ({
    isFailure: false,
    getValue: () => value
});

const ResultFail = (error: string) => ({
    isFailure: true,
    errorValue: () => error
});

describe("GetOperationPlansController", () => {
    let controller: GetOperationPlansController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        req = { query: {} };
        res = createMockRes();

        controller = new GetOperationPlansController(mockService as any);
    });

    it("returns 200 and a list of plans on success", async () => {
        // Arrange
        req.query = {
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            vessel: "IMO9999999"
        };

        const mockList = [
            { id: "plan-1", algorithm: "Genetic" },
            { id: "plan-2", algorithm: "AStar" }
        ];

        // Simula o serviço retornando sucesso com a lista
        mockService.getPlansAsync.mockResolvedValue(ResultOk(mockList));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockList);

        expect(mockService.getPlansAsync).toHaveBeenCalledWith(
            "2024-01-01",
            "2024-01-31",
            "IMO9999999"
        );
    });

    it("handles missing query parameters (calls service with undefined)", async () => {
        // Arrange
        req.query = {};

        mockService.getPlansAsync.mockResolvedValue(ResultOk([]));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(mockService.getPlansAsync).toHaveBeenCalledWith(undefined, undefined, undefined);
    });

    it("returns 400 (ClientError) when service returns failure (Logic Error)", async () => {
        // Arrange
        req.query = { startDate: "invalid-date" };
        const errorMessage = "Invalid date format supplied.";

        mockService.getPlansAsync.mockResolvedValue(ResultFail(errorMessage));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: errorMessage
        }));
    });

    it("returns 500 (Fail) on unexpected exception", async () => {
        // Arrange
        req.query = { vessel: "IMO123" };
        const error = new Error("Database connection timeout");

        mockService.getPlansAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
    });
});