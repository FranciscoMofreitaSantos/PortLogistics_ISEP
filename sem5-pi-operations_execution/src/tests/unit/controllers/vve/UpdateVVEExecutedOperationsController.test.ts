import { describe, it, beforeEach, expect, vi } from "vitest";

import UpdateVVEExecutedOperationsController from "../../../../controllers/vve/updateVVEExecutedOperationsController";
import { mockRes } from "../../../helpers/mockHttp";

import { VesselVisitExecutionId } from "../../../../domain/vesselVisitExecution/vesselVisitExecutionId";

vi.mock("../../../../domain/vesselVisitExecution/vesselVisitExecutionId", () => {
    return {
        VesselVisitExecutionId: {
            create: vi.fn(),
        },
    };
});

const mockService = {
    updateExecutedOperationsAsync: vi.fn(),
};

let req: any;
let res: any;
let next: any;
let controller: UpdateVVEExecutedOperationsController;

beforeEach(() => {
    vi.clearAllMocks();

    req = { params: {}, body: {} };
    res = mockRes();
    next = vi.fn();

    controller = new UpdateVVEExecutedOperationsController(mockService as any);
});

describe("UpdateVVEExecutedOperationsController.execute", () => {
    it("returns 200 and body when service succeeds", async () => {
        req.params.id = "vve-123";
        req.body = {
            operations: [
                { operationId: "op-1", executedAt: "2025-01-01T10:00:00.000Z" },
                { operationId: "op-2", executedAt: "2025-01-01T11:00:00.000Z" },
            ],
            operatorId: "operator-99",
        };

        (VesselVisitExecutionId.create as any).mockReturnValue("ID_OBJ");

        mockService.updateExecutedOperationsAsync.mockResolvedValue({
            isFailure: false,
            getValue: () => ({ updated: true }),
        });

        await controller.execute(req, res, next);

        expect(VesselVisitExecutionId.create).toHaveBeenCalledWith("vve-123");
        expect(mockService.updateExecutedOperationsAsync).toHaveBeenCalledWith(
            "ID_OBJ",
            req.body.operations,
            "operator-99"
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ updated: true });
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 400 when service returns failure", async () => {
        req.params.id = "vve-123";
        req.body = {
            operations: [{ operationId: "op-1" }],
            operatorId: "operator-99",
        };

        (VesselVisitExecutionId.create as any).mockReturnValue("ID_OBJ");

        mockService.updateExecutedOperationsAsync.mockResolvedValue({
            isFailure: true,
            errorValue: () => "Validation error",
        });

        await controller.execute(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Validation error" });
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next(e) when VesselVisitExecutionId.create throws", async () => {
        req.params.id = "bad-id";
        req.body = {
            operations: [{ operationId: "op-1" }],
            operatorId: "operator-99",
        };

        (VesselVisitExecutionId.create as any).mockImplementation(() => {
            throw new Error("Invalid id");
        });

        await controller.execute(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(res.status).not.toHaveBeenCalled();
    });

    it("calls next(e) when service throws", async () => {
        req.params.id = "vve-123";
        req.body = {
            operations: [{ operationId: "op-1" }],
            operatorId: "operator-99",
        };

        (VesselVisitExecutionId.create as any).mockReturnValue("ID_OBJ");

        mockService.updateExecutedOperationsAsync.mockRejectedValue(
            new Error("DB crash")
        );

        await controller.execute(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
        expect(res.status).not.toHaveBeenCalled();
    });
});
