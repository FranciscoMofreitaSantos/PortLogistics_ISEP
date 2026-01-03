import "reflect-metadata";
import { describe, it, beforeEach, expect, vi } from "vitest";
import CreateOperationPlanController from "../../../../controllers/operationPlan/createOperationPlanController";

const mockService = {
    createPlanAsync: vi.fn()
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

describe("CreateOperationPlanController", () => {
    let controller: CreateOperationPlanController;
    let req: any;
    let res: any;

    beforeEach(() => {
        vi.clearAllMocks();
        res = createMockRes();
        controller = new CreateOperationPlanController(mockService as any);
    });

    it("returns 200 and the DTO on success", async () => {
        req = {
            body: {
                algorithm: "Genetic",
                totalDelay: 100,
                status: "Generated",
                operations: ["A", "B"],
                planDate: "2024-01-01"
            },
            currentUser: { email: "admin@test.com" }
        };

        const expectedResult = { id: "plan-1", ...req.body };

        mockService.createPlanAsync.mockResolvedValue(ResultOk(expectedResult));

        await controller.execute(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expectedResult);

        expect(mockService.createPlanAsync).toHaveBeenCalledWith(expect.objectContaining({
            author: "admin@test.com",
            planDate: expect.any(Date)
        }));
    });

    it("handles Python/Algorithm naming conventions (mapping properties)", async () => {
        req = {
            body: {
                algorithm: "AStar",
                total_delay: 50,
                best_sequence: ["C", "D"],
                status: "Draft",
                author: "manual@test.com"
            }
        };

        mockService.createPlanAsync.mockResolvedValue(ResultOk({}));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(200);

        expect(mockService.createPlanAsync).toHaveBeenCalledWith(expect.objectContaining({
            totalDelay: 50,
            operations: ["C", "D"],
            author: "manual@test.com"
        }));
    });

    it("uses 'system_test' as author fallback when no user or author provided", async () => {
        // Arrange
        req = {
            body: { algorithm: "Genetic" }
        };

        mockService.createPlanAsync.mockResolvedValue(ResultOk({}));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(mockService.createPlanAsync).toHaveBeenCalledWith(expect.objectContaining({
            author: "system_test"
        }));
    });

    it("returns 400 (ClientError) when service fails logic validation", async () => {
        // Arrange
        req = { body: {} };
        const errorMessage = "Invalid algorithm type";

        mockService.createPlanAsync.mockResolvedValue(ResultFail(errorMessage));

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: errorMessage
        }));
    });

    it("returns 500 (Fail) when an unexpected exception occurs", async () => {
        // Arrange
        req = { body: {} };
        const error = new Error("Database connection lost");

        mockService.createPlanAsync.mockRejectedValue(error);

        // Act
        await controller.execute(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        // O método fail do BaseController costuma logar o erro e devolver mensagem genérica ou o erro toString
    });
});