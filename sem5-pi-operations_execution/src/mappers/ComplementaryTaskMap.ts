import { Mapper } from "../core/infra/Mapper";
import { ComplementaryTask } from "../domain/complementaryTask/complementaryTask";
import {IComplementaryTaskDTO} from "../dto/IComplementaryTaskDTO";
import {IComplementaryTaskPersistence} from "../dataschema/IComplementaryTaskPersistence";
import {ComplementaryTaskCode} from "../domain/complementaryTask/ComplementaryTaskCode";
import {UniqueEntityID} from "../core/domain/UniqueEntityID";
import {ComplementaryTaskCategoryId} from "../domain/complementaryTaskCategory/complementaryTaskCategoryId";
import {VesselVisitExecutionId} from "../domain/vesselVisitExecution/vesselVisitExecutionId";



export default class ComplementaryTaskMap extends Mapper<ComplementaryTask, IComplementaryTaskDTO, IComplementaryTaskPersistence> {

    toDTO(domain: ComplementaryTask): IComplementaryTaskDTO {
        return {
            id: domain.id.toString(),
            code : domain.code.value,
            category: domain.category.id.toString(),
            staff: domain.staff,
            timeStart : domain.timeStart,
            timeEnd : domain.timeEnd,
            status : domain.status,
            vve : domain.vve.id.toString(),
        };
    }

    toDomain(raw: IComplementaryTaskPersistence): ComplementaryTask | null {
        return ComplementaryTask.rehydrate(
            {
                code: ComplementaryTaskCode.createFromString(raw.code),
                category: ComplementaryTaskCategoryId.create(raw.category),
                staff: raw.staff,
                timeStart: raw.timeStart,
                timeEnd: raw.timeEnd,
                status: raw.status,
                vve: VesselVisitExecutionId.create(raw.vve),
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt || null
            },
            new UniqueEntityID(raw.domainId)
        )
    }

    toPersistence(domain: ComplementaryTask): IComplementaryTaskPersistence {
        return {
            domainId : domain.id.toString(),
            code : domain.code.value,
            category : domain.category.id.toString(),
            staff : domain.staff,
            timeStart : domain.timeStart,
            timeEnd : domain.timeEnd,
            status : domain.status,
            vve : domain.vve.id.toString(),
            createdAt : domain.createdAt,
            updatedAt : domain.updatedAt
        };
    }


}
