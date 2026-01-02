import {UniqueEntityID} from "../../core/domain/UniqueEntityID";
import {Entity} from "../../core/domain/Entity";

export class DockReassignmentLogId extends Entity<any> {

    get id(): UniqueEntityID {
        return this._id;
    }

    private constructor(id?: UniqueEntityID) {
        super(null, id);
    }

    public static create(id: string | UniqueEntityID): DockReassignmentLogId {
        return new DockReassignmentLogId(
            typeof id === "string" ? new UniqueEntityID(id) : id
        );
    }
}