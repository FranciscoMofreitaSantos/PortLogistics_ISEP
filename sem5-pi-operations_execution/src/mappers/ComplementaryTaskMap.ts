import { Mapper } from "../core/infra/Mapper";
import { ComplementaryTask } from "../domain/complementaryTask/complementaryTask";
import { UniqueEntityID } from "../core/domain/UniqueEntityID";
import { ComplementaryTaskCategoryMap } from "./ComplementaryTaskCategoryMap";
import { IComplementaryTaskDTO } from "../dto/IComplementaryTaskDTO";

export class ComplementaryTaskMap extends Mapper<ComplementaryTask> {

    public static toDTO(task: ComplementaryTask): IComplementaryTaskDTO {
        return {
            code: task.code,
            category: task.category,
            staff: task.staff,
            timeStart: task.timeStart,
            timeEnd: task.timeEnd,
            status: task.status
            // vve: task.vve
        };
    }

    public static async toDomain(raw: any): Promise<ComplementaryTask | null> {


        const taskOrError = ComplementaryTask.create(
            {
                code: raw.code,
                category: raw.category,
                staff: raw.staff,
                timeStart: new Date(raw.timeStart),
                timeEnd: new Date(raw.timeEnd),
                status: raw.status
            },
            new UniqueEntityID(raw.domainId)
        );

        if (taskOrError.isFailure) {
            console.error(taskOrError.error);
            return null;
        }

        return taskOrError.getValue();
    }

    public static toPersistence(task: ComplementaryTask): any {
        return {
            domainId: task.id.toString(),
            code: task.code,
            category:task.category,
            staff: task.staff,
            timeStart: task.timeStart.toISOString(),
            timeEnd: task.timeEnd.toISOString(),
            status: task.status
        };
    }
}
