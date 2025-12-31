export interface VesselVisitExecutionDTO {
    id: string;
    code: string;
    vvnId: string;
    vesselImo: string;
    actualArrivalTime: Date;
    status: string;
    creatorEmail: string;
}

export interface CreateVesselVisitExecutionDto {
    vesselVisitNotificationId: string;
    actualArrivalTime: string;
    creatorEmail: string;
}