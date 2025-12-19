import { Result } from "../../core/logic/Result";
import { IVesselVisitExecutionDTO } from "../../dto/IVesselVisitExecutionDTO";
import {VesselVisitExecutionId} from "../../domain/vesselVisitExecution/vesselVisitExecutionId";

export default interface IVesselVisitExecutionService {
    createAsync(dto: IVesselVisitExecutionDTO): Promise<Result<IVesselVisitExecutionDTO>>;
    getAllAsync(): Promise<Result<IVesselVisitExecutionDTO[]>>;
    getByIdAsync(id: VesselVisitExecutionId): Promise<Result<IVesselVisitExecutionDTO>>;
}