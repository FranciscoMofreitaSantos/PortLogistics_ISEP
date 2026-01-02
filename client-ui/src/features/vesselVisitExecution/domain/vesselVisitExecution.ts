export interface VesselVisitExecution {
    id: string;
    code: string;
    vvnId: string;
    vesselImo: string;
    actualArrivalTime: Date | string;
    status: string;
    creatorEmail: string;

    actualBerthTime?: string;
    actualDockId?: string;
    dockDiscrepancyNote?: string;

    updatedAt?: string;
}
