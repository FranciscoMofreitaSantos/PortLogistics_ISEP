import { describe, it, expect, beforeEach, vi } from "vitest";

// Controllers
import CreateOperationPlanController from "../../../controllers/operationPlan/createOperationPlanController";
import GetOperationPlansController from "../../../controllers/operationPlan/getOperationPlansController";

// Mocks
const mockService = {
    createPlanAsync: vi.fn(),
    getPlansAsync: vi.fn()
};
const createMockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
};

describe("OperationPlan Controllers (Unit)", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ------------------------------------------------------------------
    // CREATE OPERATION PLAN
    // ------------------------------------------------------------------
    describe("CreateOperationPlanController", () => {
        let controller: CreateOperationPlanController;

        beforeEach(() => {
            controller = new CreateOperationPlanController(mockService as any);
        });

        it("returns 200 and DTO on success", async () => {
            const req: any = {
                body: {
                    algorithm: "Genetic",
                    total_delay: 100,
                    status: "Generated",
                    best_sequence: ["OP1"],
                    planDate: "2024-01-01"
                },
                currentUser: { email: "admin@test.com" }
            };
            const res = createMockRes();

            const fakeDTO = { id: "plan-1", algorithm: "Genetic" };

            mockService.createPlanAsync.mockResolvedValue({
                isFailure: false,
                getValue: () => fakeDTO
            });

            await controller.execute(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeDTO);
            expect(mockService.createPlanAsync).toHaveBeenCalledWith(expect.objectContaining({
                algorithm: "Genetic",
                author: "admin@test.com"
            }));
        });

        it("returns 400/ClientError if service returns failure", async () => {
            const req: any = { body: {} };
            const res = createMockRes();

            mockService.createPlanAsync.mockResolvedValue({
                isFailure: true,
                errorValue: () => "Invalid data"
            });

            await controller.execute(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Invalid data"
            }));
        });

        it("returns 500 if service throws exception", async () => {
            const req: any = { body: {} };
            const res = createMockRes();

            mockService.createPlanAsync.mockRejectedValue(new Error("Database boom"));

            await controller.execute(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // ------------------------------------------------------------------
    // GET OPERATION PLANS
    // ------------------------------------------------------------------
    describe("GetOperationPlansController", () => {
        let controller: GetOperationPlansController;

        beforeEach(() => {
            controller = new GetOperationPlansController(mockService as any);
        });

        it("returns 200 and list on success", async () => {
            const req: any = {
                query: { startDate: "2024-01-01", endDate: "2024-01-31", vessel: "IMO123" }
            };
            const res = createMockRes();

            const fakeList = [{ id: "plan-1" }, { id: "plan-2" }];

            mockService.getPlansAsync.mockResolvedValue({
                isFailure: false,
                getValue: () => fakeList
            });

            await controller.execute(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeList);
            expect(mockService.getPlansAsync).toHaveBeenCalledWith("2024-01-01", "2024-01-31", "IMO123");
        });

        it("returns 400 if service returns failure", async () => {
            const req: any = { query: {} };
            const res = createMockRes();

            mockService.getPlansAsync.mockResolvedValue({
                isFailure: true,
                errorValue: () => "Invalid filters"
            });

            await controller.execute(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});