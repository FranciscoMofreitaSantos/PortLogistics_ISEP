import {Severity} from "./severity"
import {AggregateRoot} from "../../core/domain/AggregateRoot";
import {UniqueEntityID} from "../../core/domain/UniqueEntityID";
import {IncidentTypeId} from "./incidentTypeId"
import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";
import {SeverityError} from "./errors/severityErrors";
import { Guard } from "../../core/logic/Guard";
import {CTCError} from "../complementaryTaskCategory/errors/ctcErrors";

interface IncidentTypeProps {
    code :string;
    name : string;
    description : string;
    severity : Severity;
    parent : string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export class IncidentType
    extends AggregateRoot<IncidentTypeProps>{

    get id(): UniqueEntityID{
        return this._id;
    }

    get incidentTypeId():  IncidentTypeId{
        return IncidentTypeId.caller(this.id);
    }

    get code() : string {
        return this.props.code;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string{
        return this.props.description;
    }

    get severity(): Severity{
        return this.props.severity;
    }

    get parentCode() : string | null{
        return this.props.parent;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date | null {
        return this.props.updatedAt;
    }

    private constructor(
        props: IncidentTypeProps,
        id?: UniqueEntityID,
    ) {
        super(props,id);
    }

    public changeName(name: string): void {
        if (!name){
            throw new BusinessRuleValidationError(
                SeverityError.InvalidInput,
                "Invalid incident type details",
                "Name is required"
            )
        }
        this.props.name = name;
        this.touch()
    }

    public changeDescription(description: string): void {
        if (!description){
            throw new BusinessRuleValidationError(
                SeverityError.InvalidInput,
                "Invalid incident type details",
                "Description is required"
            )
        }
        this.props.description = description;
        this.touch()
    }

    public changeSeverity(severity: Severity): void {
        this.props.severity = severity;
        this.touch()
    }

    public changeParent(parentCode: string): void {
        if (!IncidentType.isValidCodeFormat(parentCode)) {
            throw new BusinessRuleValidationError(
                SeverityError.InvalidCodeFormat,
                "Invalid code format",
                "Code must follow the format T-INC###"
            )
        }
        this.props.parent = parentCode;
        this.touch()
    }


    public static creat(
        props: IncidentTypeProps,
        id?: UniqueEntityID,
    ): IncidentType {
        const guardedProps = [
            { argument: props.code, argumentName: "code" },
            { argument: props.name, argumentName: "name" },
            { argument: props.description, argumentName: "description" },
            { argument: props.severity, argumentName: "severity" },
            { argument: props.createdAt, argumentName: "createdAt" }
        ]

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
        if (!guardResult.succeeded) {
            throw new BusinessRuleValidationError(
                SeverityError.InvalidInput,
                "Invalid incident type details",
                guardResult.message ?? "Invalid input"
            )
        }

        if (!this.isValidCodeFormat(props.code)) {
            throw new BusinessRuleValidationError(
                SeverityError.InvalidCodeFormat,
                "Invalid code format",
                "Code must follow the format T-INC###"
            );
        }

        if(props.parent != null) {
            if(!this.isValidCodeFormat(props.parent)) {
                throw new BusinessRuleValidationError(
                    SeverityError.InvalidCodeFormat,
                    "Invalid parent code format",
                    "Parent code must follow the format T-INC###"
                );
            }
        }

        return new IncidentType({...props, updatedAt: props.updatedAt ?? null}, id);
    }


    private static isValidCodeFormat(code: string): boolean {
        return /^T-INC\d{3}$/.test(code);
    }
    private touch(): void {
        this.props.updatedAt = new Date();
    }
}