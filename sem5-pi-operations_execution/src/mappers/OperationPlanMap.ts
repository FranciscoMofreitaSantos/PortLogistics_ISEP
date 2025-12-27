import { Mapper } from "../core/infra/Mapper";
import { OperationPlan } from "../domain/operationPlan/operationPlan";
import { IOperationPlanDTO } from "../dto/IOperationPlanDTO";
import { UniqueEntityID } from "../core/domain/UniqueEntityID";
import {IOperationPlanPersistence} from "../dataschema/IOperationPlanPersistence";

export default class OperationPlanMap extends Mapper<OperationPlan, IOperationPlanDTO, IOperationPlanPersistence> {

    toDTO(plan: OperationPlan): IOperationPlanDTO {
        return {
            domainId: plan.id.toString(),
            algorithm: plan.algorithm,
            totalDelay: plan.totalDelay,
            status: plan.status,
            planDate: plan.planDate,
            author: plan.author,
            operations: plan.operations,
            createdAt: plan.createdAt
        } as IOperationPlanDTO;
    }

    toDomain(raw: any): OperationPlan | null {

        const planOrError = OperationPlan.create({
            algorithm: raw.algorithm,
            totalDelay: raw.totalDelay,
            status: raw.status,
            planDate: new Date(raw.planDate),
            author: raw.author,
            operations: raw.operations,
            createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date()
        }, new UniqueEntityID(raw.domainId));

        planOrError.isFailure ? console.log(planOrError.error) : '';

        return planOrError.isSuccess ? planOrError.getValue() : null;
    }

    toPersistence(plan: OperationPlan): any {
        return {
            domainId: plan.id.toString(),
            algorithm: plan.algorithm,
            totalDelay: plan.totalDelay,
            status: plan.status,
            planDate: plan.planDate,
            author: plan.author,
            operations: plan.operations,
            createdAt: plan.createdAt
        };
    }
}