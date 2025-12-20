export interface VesselVisitExecutionDTO {
    id: string;
    code: string;
    vvnId: string;
    vesselImo: string;
    actualArrivalTime: Date;
    status: string;
    creatorEmail: string;
}