import type {
    DailyScheduleResultDto,
    MultiCraneComparisonResultDto,
    PrologFullResultDto,
} from '../dtos/scheduling.dtos';



export type ScheduleResponse = {
    algorithm: 'optimal' | 'greedy' | 'local_search' | 'multi_crane' | 'genetic';
    schedule: DailyScheduleResultDto;
    prolog: PrologFullResultDto;
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

        // A chave de URL para o backend deve ser 'local_search'
        const baseEndpoint = `api/schedule/daily/${algorithm}`;
        let endpointUrl = baseEndpoint.replace('-', '_'); // Fixa local-search -> local_search
        let queryParams = `?day=${day}`;

        if (algorithm === 'multi_crane') {
            const multiCraneEndpoint = `api/schedule/daily/multi-crane-comparison`;
            // Correção para o parâmetro do algoritmo
            const algorithmParam = comparisonAlgorithm.replace('-', '_');
            queryParams += `&algorithm=${algorithmParam}`;
            endpointUrl = multiCraneEndpoint; // O endpoint é o de comparação
        }

        const url = `${BASE_URL}/${endpointUrl}${queryParams}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.message || `Failed to fetch schedule for ${algorithm}`);
            }

            const rawResult = await response.json();

            // Bloco de tratamento para a comparação multi_crane
            if (algorithm === 'multi_crane' && rawResult.multiCraneSchedule) {
                const comparisonDto = rawResult as MultiCraneComparisonResultDto;

                return {
                    algorithm: 'multi_crane',
                    schedule: comparisonDto.multiCraneSchedule,
                    // Conversão explícita para o tipo PrologFullResultDto
                    prolog: comparisonDto.multiCraneProlog as PrologFullResultDto,
                    comparisonData: comparisonDto
                };
            }

            // Bloco de tratamento para algoritmos individuais (Optimal, Greedy, Local Search)
            if (rawResult.schedule) {

                // Mapeia o resultado geral do backend para o tipo ScheduleResponse
                return {
                    ...rawResult,
                    // Garante que o campo prolog tem o tipo correto
                    prolog: rawResult.prolog as PrologFullResultDto
                } as ScheduleResponse;
            }

            // Fallback para respostas não estruturadas
            if (rawResult.operations) {
                return {
                    algorithm: algorithm as any,
                    schedule: rawResult as DailyScheduleResultDto,
                    prolog: { total_delay: 0, best_sequence: [], status: 'partial' } as PrologFullResultDto
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