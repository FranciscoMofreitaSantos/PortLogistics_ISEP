

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
    optimizedOperationDuration: number;
    realDepartureTime: number;
    departureDelay: number;
}


export interface DailyScheduleResultDto {
    operations: SchedulingOperationDto[];
}


export interface MultiCraneComparisonResultDto {
    singleCraneSchedule: DailyScheduleResultDto;
    singleCraneProlog: any;
    multiCraneProlog: any;
    singleTotalDelay: number;
    multiTotalDelay: number;

    delayImprovement: number;

    singleCraneHours: number;
    multiCraneHours: number;
}