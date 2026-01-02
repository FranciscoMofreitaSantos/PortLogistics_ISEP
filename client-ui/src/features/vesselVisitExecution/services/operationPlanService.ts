import { operationsApi } from "../../../services/api";

export interface IOperationDTO {
    vvnId: string;
    vessel?: string;
    dock?: string;
    crane?: string;

    startTime: number;
    endTime: number;
    loadingDuration: number;
    unloadingDuration: number;
    craneCountUsed: number;
    totalCranesOnDock: number;
}

export interface IOperationPlanDTO {
    id: string;
    algorithm: string;
    totalDelay: number;
    status: string;
    operations: IOperationDTO[];
    planDate: string;
    createdAt: string;
    author: string;
}

export async function getOperationPlans(params: { startDate: string; endDate: string }) {
    const res = await operationsApi.get("/api/operation-plans", { params });
    return res.data as IOperationPlanDTO[];
}

export async function getLatestPlanWithVvnOps(vvnId: string, windowDays = 14) {
    const now = new Date();
    const start = new Date(now); start.setDate(start.getDate() - windowDays);
    const end = new Date(now); end.setDate(end.getDate() + windowDays);

    const plans = await getOperationPlans({ startDate: start.toISOString(), endDate: end.toISOString() });

    const candidates = (plans ?? [])
        .filter(p => (p.operations ?? []).some(op => op.vvnId === vvnId))
        .sort((a, b) => new Date(b.planDate).getTime() - new Date(a.planDate).getTime());

    return candidates[0] ?? null;
}
