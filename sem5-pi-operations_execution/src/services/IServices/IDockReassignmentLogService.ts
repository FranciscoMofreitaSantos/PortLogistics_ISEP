import {Result} from "../../core/logic/Result";
import {IDockReassignmentLogDTO} from "../../dto/IDockReassignmentLogDTO";

export default interface IDockReassignmentLogService {
    createAsync(logDTO: IDockReassignmentLogDTO): Promise<Result<IDockReassignmentLogDTO>>;

    getAllAsync(): Promise<Result<IDockReassignmentLogDTO[]>>;
}