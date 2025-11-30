import {webApi} from "../../../services/api";
import type { Qualification } from "../domain/qualification";
import type { CreateQualificationRequest, UpdateQualificationRequest } from "../dtos/qualification";
import { mapToQualificationDomain } from "../mappers/qualificationMapper"; 

export async function getQualifications(): Promise<Qualification[]> {
    const res = await webApi.get("/api/Qualifications");
    return res.data.map(mapToQualificationDomain);
}

export async function getQualificationByName(name: string): Promise<Qualification> {
    const res = await webApi.get(`/api/Qualifications/name/${name}`);
    return mapToQualificationDomain(res.data);
}

export async function getQualificationByCode(code: string): Promise<Qualification> {
    const res = await webApi.get(`/api/Qualifications/code/${code}`);
    return mapToQualificationDomain(res.data);
}

export async function getQualificationById(id: string): Promise<Qualification> {
    const res = await webApi.get(`/api/Qualifications/id/${id}`);
    return mapToQualificationDomain(res.data);
}

export async function createQualification(data: CreateQualificationRequest): Promise<Qualification> {
    const res = await webApi.post("/api/Qualifications", data);
    return mapToQualificationDomain(res.data);
}

export async function updateQualification(id: string, data: UpdateQualificationRequest): Promise<Qualification> {
    const res = await webApi.patch(`/api/Qualifications/${id}`, data);
    return mapToQualificationDomain(res.data);
}