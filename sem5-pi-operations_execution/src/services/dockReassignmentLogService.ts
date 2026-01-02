import IDockReassignmentLogService from "./IServices/IDockReassignmentLogService";
import {Inject, Service} from "typedi";
import IDockReassignmentLogRepo from "./IRepos/IDockReassignmentLogRepo";
import DockReassignmentLogMap from "../mappers/DockReassignmentLogMap";
import {Logger} from "winston";
import {IDockReassignmentLogDTO} from "../dto/IDockReassignmentLogDTO";
import {Result} from "../core/logic/Result";
import {BusinessRuleValidationError} from "../core/logic/BusinessRuleValidationError";
import {DockReassignmentLog} from "../domain/dockReassignmentLog/dockReassignmentLog";
import {DockReassignmentLogErrors} from "../domain/dockReassignmentLog/errors/dockReassignmentLogErrors";

@Service()
export default class DockReassignmentLogService implements IDockReassignmentLogService {
    constructor(
        @Inject("DockReassignmentLogRepo")
        private repo: IDockReassignmentLogRepo,
        @Inject("DockReassignmentLogMap")
        private map: DockReassignmentLogMap,
        @Inject("logger")
        private logger: Logger
    ) {}

    public async createAsync(logDTO: IDockReassignmentLogDTO): Promise<Result<IDockReassignmentLogDTO>> {
        this.logger.info("Creating DockReassignmentLog", { id: logDTO.id });


        const log = DockReassignmentLog.create({
            vvnId : logDTO.vvnId,
            vesselName : logDTO.vesselName,
            originalDock : logDTO.originalDock,
            updatedDock : logDTO.updatedDock,
            officerId : logDTO.officerId,
            timestamp : new Date(logDTO.timestamp)
        });

        const saved = await this.repo.save(log);
        if (!saved) {
            throw new BusinessRuleValidationError(
                DockReassignmentLogErrors.PersistError,
                "Error saving dock reassignment log"
            );
        }

        return Result.ok(this.map.toDTO(saved));
    }

    public async getAllAsync(): Promise<Result<IDockReassignmentLogDTO[]>> {
        const logs = await this.repo.findAll();
        return Result.ok(logs.map(t => this.map.toDTO(t)));
    }

}