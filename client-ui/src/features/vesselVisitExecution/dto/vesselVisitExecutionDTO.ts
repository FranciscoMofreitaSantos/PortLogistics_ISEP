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
    actualUnBerthTime?: Date;
    actualLeavePortTime?: Date;
    note?: string;
}


export interface CreateVesselVisitExecutionDto {
    vesselVisitNotificationId: string;
    actualArrivalTime: string;
    creatorEmail: string;
}

export interface CompleteVVEDto {
    id: string;
    actualUnBerthTime: string;
    actualLeavePortTime: string;
    updaterEmail: string;
}
