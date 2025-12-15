import {Severity} from "../domain/incidentTypes/severity";

export interface IIncidentTypePersistence {
    domainId: string;
    code: string;
    name : string;
    description : string;
    severity : Severity;
    parent : string | null;
    createdAt: Date;
    updatedAt: Date | null;
}