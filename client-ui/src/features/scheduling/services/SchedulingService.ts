import type {
    DailyScheduleResultDto,
} from '../dtos/scheduling.dtos';

export type ScheduleResponse = {
    algorithm: 'optimal' | 'greedy' | 'local_search';
    schedule: DailyScheduleResultDto;
    prolog: any;
};

export type AlgorithmType = 'optimal' | 'greedy' | 'local-search';

const BASE_URL = 'http://localhost:5296/api/schedule';


export const SchedulingService = {
    async getDailySchedule(
        day: string,
        algorithm: AlgorithmType,
    ): Promise<ScheduleResponse> {
        const endpoint = `daily/${algorithm}`;
        const url = `${BASE_URL}/${endpoint}?day=${day}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch schedule for ${algorithm}`);
        }

        const result: ScheduleResponse = await response.json();
        return result;
    },


};