export interface IOperationPlanPersistence {
    domainId: string;
    algorithm: string;
    totalDelay: number;
    status: string;
    planDate: Date;
    author: string;
    operations: any[];
    createdAt: Date;
    updatedAt: Date;
}