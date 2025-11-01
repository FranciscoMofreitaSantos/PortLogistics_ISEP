import api from "../../../services/api";
import type { VesselType, CreateVesselTypeRequest, UpdateVesselTypeRequest } from "../types/vesselType";

export async function getVesselTypes(): Promise<VesselType[]> {
    const res = await api.get("/api/VesselType");
    return res.data;
}

export async function createVesselType(data: CreateVesselTypeRequest): Promise<VesselType> {
    const res = await api.post("/api/VesselType", data);
    return res.data;
}

export async function updateVesselType(id: string, data: UpdateVesselTypeRequest): Promise<VesselType> {
    const res = await api.put(`/api/VesselType/${id}`, data);
    return res.data;
}
