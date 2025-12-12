import { CTStatus } from "../domain/complementaryTask/ctstatus";

export interface IComplementaryTaskPersistance{
    _id:string,
    code: string,
    category: string,
    staff: string,
    timeStart: Date,
    timeEnd: Date,
    status: CTStatus,
    //vve: vve
}