import type {
    DailyScheduleResultDto,
    MultiCraneComparisonResultDto
} from '../dtos/scheduling.dtos';


export type ScheduleResponse = {
    algorithm: 'optimal' | 'greedy' | 'local_search' | 'multi_crane' | 'genetic';
    schedule: DailyScheduleResultDto;
    prolog: any;
    comparisonData?: MultiCraneComparisonResultDto;
};

export type AlgorithmType = 'optimal' | 'greedy' | 'local_search' | 'multi_crane' | 'genetic';

const BASE_URL = import.meta.env.VITE_PLANNING_URL;

export const SchedulingService = {
    async getDailySchedule(
        day: string,
        algorithm: AlgorithmType,
        comparisonAlgorithm: string = 'greedy'
    ): Promise<ScheduleResponse> {

        let endpoint = `api/schedule/daily/${algorithm}`;
        let queryParams = `?day=${day}`;

        if (algorithm === 'multi_crane') {
            endpoint = `api/schedule/daily/multi-crane-comparison`;
            queryParams += `&algorithm=${comparisonAlgorithm}`;
        }

        const url = `${BASE_URL}/${endpoint}${queryParams}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to fetch schedule for ${algorithm}`);
            }

            const rawResult = await response.json();

            if (algorithm === 'multi_crane' && rawResult.multiCraneSchedule) {
                const comparisonDto = rawResult as MultiCraneComparisonResultDto;

                return {
                    algorithm: 'multi_crane',
                    schedule: comparisonDto.multiCraneSchedule,
                    prolog: comparisonDto.multiCraneProlog,
                    comparisonData: comparisonDto
                };
            }

            if (rawResult.schedule) {
                return rawResult as ScheduleResponse;
            }

            if (rawResult.operations) {
                return {
                    algorithm: algorithm as any,
                    schedule: rawResult as DailyScheduleResultDto,
                    prolog: {}
                };
            }

            throw new Error("Formato de resposta desconhecido do servidor.");

        } catch (error) {
            console.error(`Error fetching schedule for ${algorithm}:`, error);
            throw error;
        }
    },

    calculateTotalDelay(schedule: DailyScheduleResultDto): number {
        return schedule.operations.reduce((sum, op) => sum + (op.departureDelay || 0), 0);
    }
};