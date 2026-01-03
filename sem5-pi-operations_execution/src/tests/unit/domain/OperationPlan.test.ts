import { describe, it, expect } from "vitest";
import { OperationPlan } from "../../../domain/operationPlan/operationPlan";
import { BusinessRuleValidationError } from "../../../core/logic/BusinessRuleValidationError";

describe("OperationPlan Domain", () => {
    const mockOperation = {
        vvnId: "VVN-123",
        vessel: "Navio Teste",
        dock: "Dock 1",
        startTime: 0,
        endTime: 60,
        loadingDuration: 30,
        unloadingDuration: 30,
        crane: "Crane A",
        craneCountUsed: 1,
        totalCranesOnDock: 2,
        optimizedOperationDuration: 60,
        realDepartureTime: 60,
        realArrivalTime: 0,
        departureDelay: 0,
        staffAssignments: []
    };

    const baseProps = {
        planDate: new Date("2025-01-01T08:00:00Z"),
        algorithm: "Genetic_Algorithm_V1",
        totalTime: 120,
        totalDelay: 0,
        status: "GENERATED",
        operations: [mockOperation],
        author: "System Admin",
        createdAt: new Date()
    };

    it("should create a valid operation plan", () => {
        const result = OperationPlan.create(baseProps);

        expect(result.isSuccess).toBe(true);

        const plan = result.getValue();

        expect(plan.algorithm).toBe("Genetic_Algorithm_V1");
        expect(plan.totalDelay).toBe(0);
        expect(plan.status).toBe("GENERATED");
    });

    it("should fail creation with empty algorithm name", () => {
        const result = OperationPlan.create({ ...baseProps, algorithm: "" });
        expect(result.isFailure).toBe(true);
    });

    it("should fail creation with negative total delay", () => {
        const result = OperationPlan.create({ ...baseProps, totalDelay: -5 });
        expect(result.isFailure).toBe(true);
    });

    it("should fail creation with empty author", () => {
        const result = OperationPlan.create({ ...baseProps, author: "" });
        expect(result.isFailure).toBe(true);
    });

    it("should fail creation without operations", () => {
        const result = OperationPlan.create({ ...baseProps, operations: [] });
        expect(result.isFailure).toBe(true);
    });

    it("should fail if plan date is invalid", () => {
        const result = OperationPlan.create({ ...baseProps, planDate: new Date("invalid-date-string") });
        expect(result.isFailure).toBe(true);
    });

});