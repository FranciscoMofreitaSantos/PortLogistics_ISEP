import {Severity} from "../domain/incidentTypes/severity";

export interface IIncidentTypeDTO {
    id?: string,
    code: string,
    name: string,
    description: string,
    severity: Severity,
    parentCode: string | null,
}