import {Inject, Service} from "typedi";
import {BaseController} from "../../core/infra/BaseController";
import IIncidentTypeService from "../../services/IServices/IIncidentTypeService";
import {Logger} from "winston";
import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class GetIncidentTypeDTO extends BaseController{
    constructor(
        @Inject("IncidentTypeService") private incidentTypeService: IIncidentTypeService,
        @Inject("logger") private logger: Logger

    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const code = this.req.params.code;

        try {
            const result = await this.incidentTypeService.getByCode(code);

            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on get IT by code", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error(
                "Unexpected error fetching Incident Type by code",
                { e }
            );

            return this.fail("Internal server error");
        }
    }
}