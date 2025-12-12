import { CTStatus } from "../domain/complementaryTask/ctstatus";
import { ComplementaryTaskCategory } from "../domain/complementaryTaskCategory/complementaryTaskCategory";

export interface IComplementaryTaskDTO{
    code: string,
    category: string,
    staff: string,
    timeStart: Date,
    timeEnd: Date,
    status: CTStatus,
    //vve: vve
}