import api from "../../../services/api";
import type {
    CreateVesselRequestDto,
    UpdateVesselRequestDto,
    VesselDto
} from "../dto/vesselDtos";

export async function apiGetVessels(): Promise<VesselDto[]> {
    const res = await api.get("/api/Vessel");
    return res.data;
}

export async function apiGetVesselById(id: string): Promise<VesselDto> {
    const res = await api.get(`/api/Vessel/id/${id}`);
    return res.data;
}

export async function apiGetVesselByIMO(imo: string): Promise<VesselDto> {
    const res = await api.get(`/api/Vessel/imo/${imo}`);
    return res.data;
}

export async function apiGetVesselByOwner(owner: string): Promise<VesselDto[]> {
    const res = await api.get(`/api/Vessel/owner/${owner}`);
    return res.data;
}

export async function apiCreateVessel(data: CreateVesselRequestDto): Promise<VesselDto> {
    const res = await api.post("/api/Vessel", data);
    return res.data;
}

export async function apiPatchVesselByIMO(
    imo: string,
    data: UpdateVesselRequestDto
): Promise<VesselDto> {
    const res = await api.patch(`/api/Vessel/imo/${imo}`, data);
    return res.data;
}
