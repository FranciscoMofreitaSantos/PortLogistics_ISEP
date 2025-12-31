export interface DockLoadInfoDto {
    dock: string;
    totalDurationHours: number;
}

export interface DockLoadChangeDto {
    dock: string;
    before: number;
    after: number;
    difference: number;
}

export interface DockRebalanceCandidateDto {
    vvnId: string;
    vesselName: string;
    currentDock: string;
    estimatedTimeArrival: string;
    estimatedTimeDeparture: string;
    operationDurationHours: number;
    allowedDocks: string[];
}

export interface DockRebalanceAssignmentDto {
    id: string;
    dock: string;
}

export interface DockRebalanceFinalDto {
    day: string;
    loadsBefore: DockLoadInfoDto[];
    loadsAfter: DockLoadInfoDto[];
    loadDifferences: DockLoadChangeDto[];
    candidates: DockRebalanceCandidateDto[];
    assignments: DockRebalanceAssignmentDto[];
    balanceScore: number;
    varianceBefore: number;
    improvementPercent: number;
    stdDevBefore: number;
    stdDevAfter: number;
}