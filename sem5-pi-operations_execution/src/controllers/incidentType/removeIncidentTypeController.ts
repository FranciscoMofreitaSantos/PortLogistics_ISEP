import {BaseController} from "../../core/infra/BaseController";
import {Inject, Service} from "typedi";
import IIncidentTypeService from "../../services/IServices/IIncidentTypeService";
import {Logger} from "winston";
import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class RemoveIncidentTypeController extends BaseController{

    constructor(
        @Inject("IncidentTypeService") private incidentTypeService: IIncidentTypeService,
        @Inject("logger") private logger: Logger

    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const code = this.req.params.code;

        try {
            const result = await this.incidentTypeService.removeAsync(code);

            if (result.isFailure) {

                return this.clientError(result.errorValue() as string);
            }

            return this.res.status(204).send();

        } catch (e) {
            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on delete", {
                    message: e.message,
                    details: e.details
                });


                return this.clientError(e.message);
            }

            this.logger.error("Unexpected error delete IncidentType", { e });
            return this.fail("Internal server error");
        }
    }
}