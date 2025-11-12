export interface CreateDockRequest {
    code: string;
    location?: string;
    vesselTypeId?: string;
    status?: string;
}

export interface UpdateDockRequest {
    location?: string;
    status?: string;
    lengthM?: number;
    depthM?: number;
    maxDraftM?: number;
    physicalResourceCodes?: string[];
    allowedVesselTypeIds?: string[];
}

export interface DockApi {
    id: string | { value: string };
    code: string | { value: string };
    physicalResourceCodes: Array<string | { value: string }>;
    location: string;
    lengthM: number;
    depthM: number;
    maxDraftM: number;
    status: string | number;
    allowedVesselTypeIds: Array<string | { value: string }>;
}

export interface Dock {
    id: string;
    code: string;
    location?: string;
    status?: string;
    vesselTypeIds: string[];
    physicalResourceCodes: string[];
    lengthM?: number;
    depthM?: number;
    maxDraftM?: number;
}


