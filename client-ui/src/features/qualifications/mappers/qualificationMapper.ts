import type { Qualification } from "../domain/qualification";
import type { CreateQualificationRequest, UpdateQualificationRequest } from "../dtos/qualification";


export function mapToQualificationDomain(apiResponse: any): Qualification {
    return {
        id: String(apiResponse.id),
        code: apiResponse.code,
        name: apiResponse.name,
    };
}

export function mapToUpdateQualificationRequest(data: Partial<Qualification>): UpdateQualificationRequest {
    return {
        code: data.code,
        name: data.name,
    };
}

export function mapToCreateQualificationRequest(data: { name: string, code?: string }): CreateQualificationRequest {
    return {
        code: data.code,
        name: data.name,
    };
}