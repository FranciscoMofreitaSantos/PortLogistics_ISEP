export interface StaffAssignmentDto {
    staffMemberName: string;
    intervalStart: string;
    intervalEnd: string;
}

export interface SchedulingOperationDto {
    vvnId: string;
    vessel: string;
    dock: string;
    startTime: number;
    endTime: number;
    loadingDuration: number;
    unloadingDuration: number;
    crane: string;
    staffAssignments: StaffAssignmentDto[];

    craneCountUsed: number;
    totalCranesOnDock?: number;

    optimizedOperationDuration: number;
    realDepartureTime: number;
    departureDelay: number;

    theoreticalRequiredCranes?: number;
    resourceSuggestion?: string;
}

export interface DailyScheduleResultDto {
    operations: SchedulingOperationDto[];
}

export interface OptimizationStepDto {
    stepNumber: number;
    totalDelay: number;
    totalCranesUsed: number;
    algorithmUsed: string;
    changeDescription: string;
}

export interface MultiCraneComparisonResultDto {
    singleCraneSchedule: DailyScheduleResultDto;
    singleCraneProlog: any;

    multiCraneSchedule: DailyScheduleResultDto;
    multiCraneProlog: any;

    singleTotalDelay: number;
    multiTotalDelay: number;

    singleCraneHours: number;
    multiCraneHours: number;

    optimizationSteps: OptimizationStepDto[];
}