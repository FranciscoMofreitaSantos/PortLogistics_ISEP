import { AggregateRoot } from "../../core/domain/AggregateRoot";
import { UniqueEntityID } from "../../core/domain/UniqueEntityID";
import { Guard } from "../../core/logic/Guard";
import { DockReassignmentLogId } from "./dockReassignmentLogId";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import {DockReassignmentLogErrors} from "./errors/dockReassignmentLogErrors";



interface DockReassignmentLogProps {
    vvnId: string;
    vesselName: string;
    originalDock: string;
    updatedDock: string;
    officerId: string;
    timestamp: Date;
}

export class DockReassignmentLog extends AggregateRoot<DockReassignmentLogProps> {

    get id(): UniqueEntityID {
        return this._id;
    }

    get logId(): DockReassignmentLogId {
        return DockReassignmentLogId.create(this._id.toString());
    }

    get vvnId(): string {
        return this.props.vvnId;
    }

    get vesselName(): string {
        return this.props.vesselName;
    }

    get originalDock(): string {
        return this.props.originalDock;
    }

    get updatedDock(): string {
        return this.props.updatedDock;
    }

    get officerId(): string {
        return this.props.officerId;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    private constructor(
        props: DockReassignmentLogProps,
        id?: UniqueEntityID
    ) {
        super(props, id);
    }

    public static create(
        props: DockReassignmentLogProps,
        id?: UniqueEntityID
    ): DockReassignmentLog {

        const guardedProps = [
            { argument: props.vvnId, argumentName: "vvnId" },
            { argument: props.vesselName, argumentName: "vesselName" },
            { argument: props.originalDock, argumentName: "originalDock" },
            { argument: props.updatedDock, argumentName: "updatedDock" },
            { argument: props.officerId, argumentName: "officerId" },
            { argument: props.timestamp, argumentName: "timestamp" }
        ];

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

        if (!guardResult.succeeded) {
            throw new BusinessRuleValidationError(
                DockReassignmentLogErrors.InvalidInput,
                "Invalid input",
                guardResult.message ?? "All fields are required for Dock Reassignment Log"
            );
        }


        if (!props.vvnId.trim() || !props.vesselName.trim() || !props.officerId.trim()) {
            throw new BusinessRuleValidationError(
                DockReassignmentLogErrors.InvalidInput,
                "Invalid log details",
                "VVN ID, Vessel Name and Officer ID cannot be empty"
            );
        }

        return new DockReassignmentLog(
            {
                ...props
            },
            id
        );
    }
}