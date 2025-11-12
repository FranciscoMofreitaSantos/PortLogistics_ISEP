import api from "../../../services/api";
import type { Dock, DockApi, CreateDockRequest, UpdateDockRequest } from "../types/dock";
import { toDock } from "../shape/shape";

export async function getDocks(): Promise<Dock[]> {
    const res = await api.get<DockApi[]>("/api/Dock");
    return res.data.map(toDock);
}

export async function getDockById(id: string): Promise<Dock> {
    const res = await api.get<DockApi>(`/api/Dock/id/${id}`);
    return toDock(res.data);
}

export async function getDockByCode(code: string): Promise<Dock> {
    const res = await api.get<DockApi>(`/api/Dock/code/${encodeURIComponent(code)}`);
    return toDock(res.data);
}

export async function getDocksByVesselType(vesselTypeId: string): Promise<Dock[]> {
    const res = await api.get<DockApi[]>(`/api/Dock/vesseltype/${encodeURIComponent(vesselTypeId)}`);
    return res.data.map(toDock);
}

export async function filterDocks(params: {
    code?: string;
    vesselTypeId?: string;
    location?: string;
    query?: string;
    status?: string;
}): Promise<Dock[]> {
    const res = await api.get<DockApi[]>("/api/Dock/filter", { params });
    return res.data.map(toDock);
}

export async function getDocksByLocation(location: string): Promise<Dock[]> {
    const res = await api.get<DockApi[]>("/api/Dock/location", { params: { value: location } });
    return res.data.map(toDock);
}

export async function createDock(data: CreateDockRequest): Promise<Dock> {
    const res = await api.post<DockApi>("/api/Dock", data);
    return toDock(res.data);
}

export async function patchDockByCode(code: string, data: UpdateDockRequest): Promise<Dock> {
    const res = await api.patch<DockApi>(`/api/Dock/code/${encodeURIComponent(code)}`, data);
    return toDock(res.data);
}

export async function getDockByPhysicalResourceCode(code: string): Promise<Dock> {
    const res = await api.get<DockApi>(`/api/Dock/physical-code/${encodeURIComponent(code)}`);
    return toDock(res.data);
}

export async function getAllDockCodes(): Promise<string[]> {
    const res = await api.get<string[]>("/api/Dock/codes");
    return res.data;
}
