export interface VesselVisitExecutionDTO {
    id: string;
    code: string;
    vvnId: string;
    vesselImo: string;
    actualArrivalTime: string | Date;
    status: string;
    creatorEmail: string;

    actualBerthTime?: string | Date;
    actualDockId?: string;

    dockDiscrepancyNote?: string;
    note?: string;
}


export interface CreateVesselVisitExecutionDto {
    vesselVisitNotificationId: string;
    actualArrivalTime: string;
    creatorEmail: string;
}