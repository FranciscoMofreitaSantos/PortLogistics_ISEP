export interface CreateQualificationRequest {
    name: string,
    code?: string
}

export interface UpdateQualificationRequest {
    name?: string,
    code?: string
}

export interface QualificationsListResponse {
    qualificationsCodes: string[]
}