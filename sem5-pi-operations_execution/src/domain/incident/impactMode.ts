import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";
import {IncidentError} from "./errors/incidentErrors";

export const ImpactMode = {
    AllOnGoing : "AllOnGoing",
    Specific : "Specific",
    Upcoming : "Upcoming"
}as const;

export type ImpactMode = typeof ImpactMode[keyof typeof ImpactMode];

export class ImpactModeFactory{
    static fromString(value:string): ImpactMode {
          if (Object.values(ImpactMode).includes(value as ImpactMode)) {
              return value as ImpactMode;
          }

          throw new BusinessRuleValidationError(
              IncidentError.InvalidImpactMode,
              "Invalid ImpactMode"  ,
              `Impact Mode ${value} is not supported`
          )
    }
}