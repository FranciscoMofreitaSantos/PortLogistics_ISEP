import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";
import {IncidentTypeError} from "./errors/incidentTypeErrors"

export const Severity = {
    Minor: "Minor",
    Major: "Major",
    Critical: "Critical",
}as const;

export type Severity = typeof Severity[keyof typeof Severity];

export class SeverityFactory{
    static fromString(value:string): Severity {
        if(Object.values(Severity).includes(value as Severity)){
            return value as Severity;
        }

        throw new BusinessRuleValidationError(
            IncidentTypeError.InvalidSeverity,
            "Invalid Severity",
            `Category '${value}' is not supported`
        )
    }
}