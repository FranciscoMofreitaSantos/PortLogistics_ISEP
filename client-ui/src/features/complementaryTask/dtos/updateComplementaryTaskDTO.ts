import type {CTStatus} from "../domain/complementaryTask.ts";

export interface UpdateComplementaryTaskDTO {
    category: string;
    staff: string;
    status: CTStatus;
    timeStart: Date;
    vve: string;
}