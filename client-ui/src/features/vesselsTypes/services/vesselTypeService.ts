import {webApi} from "../../../services/api";
import type {
    VesselTypeResponseDto,
    CreateVesselTypeDto,
    UpdateVesselTypeDto,
} from "../dto/vesselTypesDtos";

export async function apiGetVesselTypes(): Promise<VesselTypeResponseDto[]> {
    const res = await webApi.get("/api/VesselType");
    return res.data;
}

export async function apiGetVesselTypeById(id: string): Promise<VesselTypeResponseDto> {
    const res = await webApi.get(`/api/VesselType/id/${id}`);
    return res.data;
}

export async function apiGetVesselTypeByName(name: string): Promise<VesselTypeResponseDto> {
    const res = await webApi.get(`/api/VesselType/name/${name}`);
    return res.data;
}

export async function apiCreateVesselType(dto: CreateVesselTypeDto): Promise<VesselTypeResponseDto> {
    const res = await webApi.post("/api/VesselType", dto);
    return res.data;
}

export async function apiUpdateVesselType(id: string, dto: UpdateVesselTypeDto): Promise<VesselTypeResponseDto> {
    const res = await webApi.put(`/api/VesselType/${id}`, dto);
    return res.data;
}

export async function apiDeleteVesselType(id: string): Promise<void> {
    await webApi.delete(`/api/VesselType/${id}`);
}
