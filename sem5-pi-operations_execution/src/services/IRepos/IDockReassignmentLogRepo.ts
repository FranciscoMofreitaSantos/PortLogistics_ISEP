import { Repo } from "../../core/infra/Repo";
import {DockReassignmentLog} from "../../domain/dockReassignmentLog/dockReassignmentLog";

export default interface IDockReassignmentLogRepo extends Repo<DockReassignmentLog> {
    findAll(): Promise<DockReassignmentLog[]>;
}