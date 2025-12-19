import { CTStatus } from "../domain/complementaryTask/ctstatus";

export interface IComplementaryTaskDTO {
    id?: string;
    code?: string;
    category: string;
    staff: string;
    status: CTStatus;
    timeStart: Date;
    timeEnd: Date | null;
    vve: string;
}

export interface ICreateComplementaryTaskDTO {
    category: string;
    staff: string;
    timeStart: Date;
    vve: string;
}

export interface IUpdateComplementaryTaskDTO {
    category: string;
    staff: string;
    status: CTStatus;
    timeStart: Date;
    vve: string;
}


