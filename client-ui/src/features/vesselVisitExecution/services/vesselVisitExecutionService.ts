import {operationsApi} from "../../../services/api.tsx";

import type {VesselVisitExecution} from "../domain/vesselVisitExecution.ts";
import {mapToVVEDomain} from "../mappers/vesselVisitExecutionMapper.ts";


export async function getAllVVE(): Promise<VesselVisitExecution[]> {
    const res = await operationsApi.get("/api/vve");
    return res.data.map(mapToVVEDomain);
}

export async function getVVEById(id: string): Promise<VesselVisitExecution> {
    const res = await operationsApi.get(`/api/vve/${id}`);
    const data = Array.isArray(res.data) ? res.data[0] : res.data;
    if (!data) throw new Error("VVE not found");
    return data;
}
