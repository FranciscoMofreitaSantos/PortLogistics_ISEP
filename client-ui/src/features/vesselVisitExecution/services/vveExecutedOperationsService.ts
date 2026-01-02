import { operationsApi } from "../../../services/api.tsx";

export type ResourceUsedDto = {
    resourceId: string;
    hours?: number;
    quantity?: number;
};

export type ExecutedOperationDto = {
    plannedOperationId: string;
    actualStart?: string;
    actualEnd?: string;
    resourcesUsed?: ResourceUsedDto[];
    status?: "started" | "completed" | "delayed";
    note?: string;
};

export type UpdateExecutedOperationsDto = {
    executedOperations: ExecutedOperationDto[];
    updaterEmail: string;
};

export async function updateExecutedOperationsVVE(id: string, dto: UpdateExecutedOperationsDto) {
    const res = await operationsApi.put(`/api/vve/${id}/operations`, dto);
    return res.data;
}
