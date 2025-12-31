export interface LoadChange {
    dock: string;
    before: number;
    after: number;
    difference: number;
}

export interface RebalanceResultEntry {
    vvnId: string;
    vesselName: string;
    originalDock: string;
    proposedDock: string;
    eta: string;
    etd: string;
    duration: number;
    isMoved: boolean;
}

export interface DockRebalanceFinal {
    day: string;
    loadDifferences: LoadChange[];
    results: RebalanceResultEntry[];
    stats: {
        balanceScore: number;
        improvementPercent: number;
        stdDevBefore: number;
        stdDevAfter: number;
    };
}