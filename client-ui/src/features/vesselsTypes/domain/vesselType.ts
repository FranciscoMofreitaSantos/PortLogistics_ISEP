export interface VesselType {
    id: string;
    name: string;
    description: string | null;
    maxBays: number;
    maxRows: number;
    maxTiers: number;
    capacityTeu: number;
}
