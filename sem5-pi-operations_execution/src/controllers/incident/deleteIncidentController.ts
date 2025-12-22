import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import IIncidentService from "../../services/IServices/IIncidentService";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class DeleteIncidentController extends BaseController {
    constructor(
        @Inject("IncidentService") private incidentService: IIncidentService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const incidentCode = String(
            this.req.params.code ?? this.req.query.incidentCode ?? ""
        ).trim();

        if (!incidentCode) {
            return this.clientError("incident code is required");
        }

        try {
            const result = await this.incidentService.deleteAsync(incidentCode);

            if (result.isFailure) {
                return this.clientError(result.errorValue() as string);
            }

            return this.res.status(204).send();
        } catch (e) {
            if (e instanceof BusinessRuleValidationError) {
                return this.clientError(e.message);
            }

            this.logger.error("Unexpected error deleting Incident", { e });

            // evita tentar responder depois de já ter respondido
            if (this.res.headersSent) return;

            return this.fail("Internal server error");
        }
    }
}
