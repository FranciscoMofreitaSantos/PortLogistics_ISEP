export interface IDockReassignmentLogPersistence {
    domainId: string;
    vvnId: string;
    vesselName: string;
    originalDock: string;
    updatedDock: string;
    officerId: string;
    timestamp: Date;
}