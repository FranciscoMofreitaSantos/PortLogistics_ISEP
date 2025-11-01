export interface VesselType {
    id: string;
    name: string;
    description: string;
    maxBays: number;
    maxRows: number;
    maxTiers: number;
    capacity: number;
}

export interface CreateVesselTypeRequest {
    name: string;
    description?: string;
    maxBays: number;
    maxRows: number;
    maxTiers: number;
}

export interface UpdateVesselTypeRequest {
    name?: string;
    description?: string;
    maxBays?: number;
    maxRows?: number;
    maxTiers?: number;
}
