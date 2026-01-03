import { describe, it, expect, vi, beforeEach } from "vitest";

// Serviço a testar
import OperationPlanService from "../../../services/operationPlanService";

// Dependências
import { Result } from "../../../core/logic/Result";
import { IOperationPlanDTO } from "../../../dto/IOperationPlanDTO";
import { OperationPlan } from "../../../domain/operationPlan/operationPlan";

// --- MOCKS ---

const mockRepo = {
    save: vi.fn(),
    findByDomainId: vi.fn(),
    search: vi.fn(),
    searchByCraneAndInterval: vi.fn(),
    findOperationByVvnId: vi.fn(),
    exists: vi.fn()
};

const mockMapper = {
    toDTO: vi.fn(),
    toDomain: vi.fn(),
    toPersistence: vi.fn()
};

const mockAuditRepo = {
    append: vi.fn()
};

// --- SETUP ---

let service: OperationPlanService;

beforeEach(() => {
    vi.clearAllMocks();

    service = new OperationPlanService(
        mockRepo as any,
        mockMapper as any,
        mockAuditRepo as any
    );
});

// --- DADOS FAKE ---

const fakeOperationDTO = {
    vvnId: "VVN-123",
    vessel: "Vessel A",
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

const fakePlanDTO: IOperationPlanDTO = {
    domainId: "PLAN-001",
    algorithm: "Genetic_V1",
    totalDelay: 0,
    status: "GENERATED",
    operations: [fakeOperationDTO],
    planDate: new Date("2025-01-01"),
    author: "Admin"
};

// Helper para criar uma instância de domínio válida (mockada)
const makeFakePlanDomain = () => {
    const planOrError = OperationPlan.create({
        algorithm: "Genetic_V1",
        totalDelay: 0,
        status: "GENERATED",
        operations: [fakeOperationDTO],
        planDate: new Date("2025-01-01"),
        author: "Admin",
        createdAt: new Date()
    });
    return planOrError.getValue();
};

// ==========================================================
// CREATE PLAN
// ==========================================================

describe("OperationPlanService - createPlanAsync", () => {

    it("should create a valid plan successfully", async () => {
        // Arrange
        mockRepo.save.mockResolvedValue(makeFakePlanDomain());
        mockMapper.toDTO.mockReturnValue(fakePlanDTO);

        // Act
        const result = await service.createPlanAsync(fakePlanDTO);

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(mockRepo.save).toHaveBeenCalled();
        expect(result.getValue().domainId).toBe("PLAN-001");
    });

    it("should fail if domain creation fails (invalid data)", async () => {
        // Arrange: DTO inválido (sem algoritmo)
        const invalidDTO = { ...fakePlanDTO, algorithm: "" };

        // Act
        const result = await service.createPlanAsync(invalidDTO);

        // Assert
        expect(result.isFailure).toBe(true);
        expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it("should return fail on unexpected error", async () => {
        // Arrange
        mockRepo.save.mockRejectedValue(new Error("Database error"));

        // Act
        const result = await service.createPlanAsync(fakePlanDTO);

        // Assert
        expect(result.isFailure).toBe(true);
        expect(result.error).toContain("Database error");
    });
});



// ==========================================================
// GET PLANS (SEARCH)
// ==========================================================

describe("OperationPlanService - getPlansAsync", () => {

    it("should return list of plans", async () => {
        // Arrange
        const fakePlan = makeFakePlanDomain();
        mockRepo.search.mockResolvedValue([fakePlan]);
        mockMapper.toDTO.mockReturnValue(fakePlanDTO);

        // Act
        const result = await service.getPlansAsync("2025-01-01", "2025-01-31");

        // Assert
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().length).toBe(1);
        expect(mockRepo.search).toHaveBeenCalled();
    });

    it("should handle repo errors gracefully", async () => {
        mockRepo.search.mockRejectedValue(new Error("Search failed"));

        const result = await service.getPlansAsync();

        expect(result.isFailure).toBe(true);
        expect(result.error).toContain("Search failed");
    });
});

// ==========================================================
// GET PLANS BY CRANE
// ==========================================================

describe("OperationPlanService - getPlansByCraneAsync", () => {

    it("should return plans filtered by crane", async () => {
        const fakePlan = makeFakePlanDomain();
        mockRepo.searchByCraneAndInterval.mockResolvedValue([fakePlan]);
        mockMapper.toDTO.mockReturnValue(fakePlanDTO);

        const result = await service.getPlansByCraneAsync("Crane A", "2025-01-01", "2025-01-02");

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().length).toBe(1);
    });

    it("should fail if dates are missing", async () => {
        // Act
        // @ts-ignore (simulando chamada inválida de JS)
        const result = await service.getPlansByCraneAsync("Crane A");

        expect(result.isFailure).toBe(true);
        expect(result.error).toContain("required");
    });
});

// ==========================================================
// GET OPERATION BY VVN
// ==========================================================

describe("OperationPlanService - getOperationByVvnAsync", () => {

    it("should return operation if found", async () => {
        mockRepo.findOperationByVvnId.mockResolvedValue(fakeOperationDTO);

        const result = await service.getOperationByVvnAsync("VVN-123");

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().vessel).toBe("Vessel A");
    });

    it("should fail if not found", async () => {
        mockRepo.findOperationByVvnId.mockResolvedValue(null);

        const result = await service.getOperationByVvnAsync("VVN-999");

        expect(result.isFailure).toBe(true);
        expect(result.error).toContain("No operation found");
    });
});