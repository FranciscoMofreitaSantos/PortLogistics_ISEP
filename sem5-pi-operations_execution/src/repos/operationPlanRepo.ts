import { Service, Inject } from 'typedi';
import { Document, Model } from 'mongoose';
import { IOperationPlanDTO } from '../dto/IOperationPlanDTO';
import { OperationPlan } from '../domain/operationPlan/operationPlan';
import OperationPlanMap from '../mappers/OperationPlanMap';

@Service()
export default class OperationPlanRepo {
    constructor(
        @Inject('operationPlanSchema') private schema: Model<IOperationPlanDTO & Document>,
        @Inject('OperationPlanMap')
        private operationPlanMap: OperationPlanMap
    ) {}

    public async exists(plan: OperationPlan): Promise<boolean> {
        const idX = plan.id instanceof String ? plan.id : plan.id.toValue();
        const query = { domainId: plan.id.toString() };
        const record = await this.schema.findOne(query);
        return !!record;
    }

    public async save(plan: OperationPlan): Promise<OperationPlan> {
        const query = { domainId: plan.id.toString() };
        const persistenceMap = this.operationPlanMap.toPersistence(plan);

        const document = await this.schema.findOne(query);

        if (document) {
            document.set(persistenceMap);
            await document.save();
        } else {
            await this.schema.create(persistenceMap);
        }

        return plan;
    }
}