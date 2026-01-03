import { describe, it, expect, beforeAll, afterEach } from "vitest";
import mongoose, { Document, Model } from "mongoose";

// Repos e Mappers
import OperationPlanRepo from "../../../repos/operationPlanRepo";
import OperationPlanMap from "../../../mappers/OperationPlanMap";

// Domínio
import { OperationPlan } from "../../../domain/operationPlan/operationPlan";
import { IOperationPlanDTO } from "../../../dto/IOperationPlanDTO";
import { UniqueEntityID } from "../../../core/domain/UniqueEntityID";

describe("OperationPlanRepo", () => {

    let repo: OperationPlanRepo;
    let schema: Model<IOperationPlanDTO & Document>;

    beforeAll(async () => {
        const schemaDefinition = new mongoose.Schema({
            domainId: String,
            planDate: Date,
            algorithm: String,
            totalTime: Number,
            totalDelay: Number,
            status: String,
            operations: Array,
            author: String,
            createdAt: Date,
            updatedAt: Date
        });

        schema = mongoose.models.OperationPlan_RepoTest
            ? mongoose.model<IOperationPlanDTO & Document>("OperationPlan_RepoTest")
            : mongoose.model<IOperationPlanDTO & Document>("OperationPlan_RepoTest", schemaDefinition);

        repo = new OperationPlanRepo(
            schema,
            new OperationPlanMap()
        );
    });

    afterEach(async () => {
        await schema.deleteMany({});
    });

    function makeOperation(overrides: any = {}) {
        return {
            vvnId: overrides.vvnId || "VVN-DEFAULT",
            vessel: overrides.vessel || "Test Vessel",
            dock: "Dock 1",
            startTime: 0,
            endTime: 60,
            loadingDuration: 30,
            unloadingDuration: 30,
            crane: overrides.crane || "Crane A",
            craneCountUsed: 1,
            totalCranesOnDock: 2,
            optimizedOperationDuration: 60,
            realDepartureTime: 60,
            realArrivalTime: 0,
            departureDelay: 0,
            staffAssignments: []
        };
    }
    function makePlan({
                          date = new Date("2025-01-01T08:00:00Z"),
                          algo = "Genetic_V1",
                          operations = [makeOperation()], // Default: 1 operação
                          id = new UniqueEntityID()
                      } = {}) {

        const props = {
            planDate: date,
            algorithm: algo,
            totalTime: 120,
            totalDelay: 0,
            status: "GENERATED",
            operations: operations,
            author: "Test Admin",
            createdAt: new Date()
        };

        return OperationPlan.create(props, id).getValue();
    }

    // --- TESTES ---

    it("should save and retrieve an OperationPlan by DomainID", async () => {
        const plan = makePlan();

        await repo.save(plan);

        const found = await repo.findByDomainId(plan.id.toString());

        expect(found).not.toBeNull();
        expect(found?.algorithm).toBe(plan.algorithm);
        expect(new Date(found?.planDate!).toISOString()).toBe(plan.planDate.toISOString());
    });

    it("should return true if plan exists", async () => {
        const plan = makePlan();
        await repo.save(plan);

        const exists = await repo.exists(plan);
        expect(exists).toBe(true);
    });

    it("should update an existing record instead of duplicating", async () => {
        const plan = makePlan();
        await repo.save(plan);

        const updatedOps = [makeOperation({ vessel: "Updated Vessel" })];


        const updatedProps = {
            ...plan.props,
            status: "APPROVED",
            operations: updatedOps
        };

        const updatedPlan = OperationPlan.create(updatedProps, plan.id).getValue();

        await repo.save(updatedPlan);

        const all = await schema.find({});
        expect(all.length).toBe(1); // Garante que não duplicou
        expect(all[0].status).toBe("APPROVED");
        expect(all[0].operations[0].vessel).toBe("Updated Vessel");
    });

    // --- TESTES DO MÉTODO SEARCH ---

    it("should search by date range", async () => {
        const planJan = makePlan({ date: new Date("2025-01-10T12:00:00Z") });
        const planFeb = makePlan({ date: new Date("2025-02-10T12:00:00Z") });

        await repo.save(planJan);
        await repo.save(planFeb);

        const results = await repo.search(
            new Date("2025-01-01"),
            new Date("2025-01-31")
        );

        expect(results.length).toBe(1);
        expect(results[0].id.toString()).toBe(planJan.id.toString());
    });

    it("should search by vessel name", async () => {
        const op1 = makeOperation({ vessel: "Evergreen" });
        const op2 = makeOperation({ vessel: "Titanic" });

        const plan1 = makePlan({ operations: [op1] });
        const plan2 = makePlan({ operations: [op2] });

        await repo.save(plan1);
        await repo.save(plan2);

        const results = await repo.search(undefined, undefined, "Evergreen");

        expect(results.length).toBe(1);
        expect(results[0].operations[0].vessel).toBe("Evergreen");
    });

    // --- TESTES DO MÉTODO SEARCH BY CRANE ---

    it("should search by crane and interval", async () => {
        const opCraneA = makeOperation({ crane: "Crane-A" });
        const opCraneB = makeOperation({ crane: "Crane-B" });

        const planA = makePlan({ date: new Date("2025-03-01"), operations: [opCraneA] });
        const planB = makePlan({ date: new Date("2025-03-01"), operations: [opCraneB] });

        await repo.save(planA);
        await repo.save(planB);

        const results = await repo.searchByCraneAndInterval(
            new Date("2025-03-01"),
            new Date("2025-03-02"),
            "Crane-A"
        );

        expect(results.length).toBe(1);
        expect((results[0].operations[0] as any).crane).toBe("Crane-A");
    });

    // --- TESTES DO MÉTODO FIND OPERATION BY VVN ID ---

    it("should find a specific operation by VVN ID", async () => {
        const targetVVN = "VVN-TARGET-999";
        const op = makeOperation({ vvnId: targetVVN });
        const plan = makePlan({ operations: [op] });

        await repo.save(plan);

        const foundOp = await repo.findOperationByVvnId(targetVVN);

        expect(foundOp).not.toBeNull();
        expect(foundOp?.vvnId).toBe(targetVVN);
    });

    it("should return null if VVN ID does not exist", async () => {
        const foundOp = await repo.findOperationByVvnId("NON-EXISTENT");
        expect(foundOp).toBeNull();
    });

    it("should throw error if plan has multiple operations for VVN search", async () => {
        const op1 = makeOperation({ vvnId: "VVN-1" });
        const op2 = makeOperation({ vvnId: "VVN-2" });

        const plan = makePlan({ operations: [op1, op2] });
        await repo.save(plan);

        await expect(repo.findOperationByVvnId("VVN-1"))
            .rejects
            .toThrow(/Expected exactly one operation/);
    });

});