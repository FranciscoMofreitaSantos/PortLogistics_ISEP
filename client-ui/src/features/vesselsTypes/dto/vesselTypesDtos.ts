export interface VesselTypeResponseDto {
  id: string;
  name: string;
  description: string | null;
  maxBays: number;
  maxRows: number;
  maxTiers: number;
  capacity: number;
}

export interface CreateVesselTypeDto {
  name: string;
  description?: string | null;
  maxBays: number;
  maxRows: number;
  maxTiers: number;
}

export interface UpdateVesselTypeDto {
  name?: string;
  description?: string | null;
  maxBays?: number;
  maxRows?: number;
  maxTiers?: number;
}
