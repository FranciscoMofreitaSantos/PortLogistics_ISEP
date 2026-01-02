import {Mapper} from "../core/infra/Mapper";
import {IDockReassignmentLogDTO} from "../dto/IDockReassignmentLogDTO";
import {IDockReassignmentLogPersistence} from "../dataschema/IDockReassignmentLogPersistence";
import {DockReassignmentLog} from "../domain/dockReassignmentLog/dockReassignmentLog";
import {UniqueEntityID} from "../core/domain/UniqueEntityID";

export default class DockReassignmentLogMap extends Mapper<DockReassignmentLog, IDockReassignmentLogDTO, IDockReassignmentLogPersistence> {
    toDTO(domain: DockReassignmentLog): IDockReassignmentLogDTO {
        return {
            id: domain.id.toString(),
            vvnId: domain.vvnId,
            vesselName: domain.vesselName,
            originalDock: domain.originalDock,
            updatedDock: domain.updatedDock,
            officerId: domain.officerId,
            timestamp: domain.timestamp.toISOString()
        }
    }

    toDomain(raw: IDockReassignmentLogPersistence): DockReassignmentLog | null {
        return DockReassignmentLog.create(
            {
                vvnId: raw.vvnId,
                vesselName: raw.vesselName,
                originalDock: raw.originalDock,
                updatedDock: raw.updatedDock,
                officerId: raw.officerId,
                timestamp: raw.timestamp
            },
            new UniqueEntityID(raw.domainId)
        )
    }

    toPersistence(domain: DockReassignmentLog): IDockReassignmentLogPersistence {
        return {
            domainId : domain.id.toString(),
            vvnId : domain.vvnId,
            vesselName : domain.vesselName,
            originalDock : domain.originalDock,
            updatedDock : domain.updatedDock,
            officerId : domain.officerId,
            timestamp : domain.timestamp
        }
    }

}