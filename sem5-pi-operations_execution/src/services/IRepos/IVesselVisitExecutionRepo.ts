import { Repo } from "../../core/infra/Repo";
import { VesselVisitExecution } from "../../domain/vesselVisitExecution/vesselVisitExecution";

export default interface IVesselVisitExecutionRepo extends Repo<VesselVisitExecution> {
    save(vve: VesselVisitExecution): Promise<VesselVisitExecution>;
    findByVvnId(vvnId: string): Promise<VesselVisitExecution | null>;
    getNextSequenceNumber(): Promise<number>;
    findAll(): Promise<VesselVisitExecution[]>;
}