import {BaseController} from "../../core/infra/BaseController";
import {Inject, Service} from "typedi";
import IIncidentTypeService from "../../services/IServices/IIncidentTypeService";
import {Logger} from "winston";
import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";
import {IIncidentTypeDTO} from "../../dto/IIncidentTypeDTO";

@Service()
export default class CreateITController extends BaseController{

    constructor(
        @Inject("IncidentTypeService") private incidentTypeService: IIncidentTypeService,
        @Inject("logger") private logger: Logger

    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const dto = this.req.body as IIncidentTypeDTO;

        try {
            const result = await this.incidentTypeService.createAsync(dto);

            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on create", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error(
                "Unexpected error creating IncidentType",
                { e }
            );

            return this.fail("Internal server error");
        }
    }
}