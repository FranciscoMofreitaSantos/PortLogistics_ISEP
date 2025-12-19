import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IVesselVisitExecutionService from "../../services/IServices/IVesselVisitExecutionService";
import {VesselVisitExecutionId} from "../../domain/vesselVisitExecution/vesselVisitExecutionId";

@Service()
export default class GetVVEByIdController extends BaseController {

    constructor(
        @Inject("VesselVisitExecutionService")
        private vveService: IVesselVisitExecutionService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const id = this.req.params.id;

        if (!id) {
            return this.clientError("VVE id is required");
        }

        try {
            const result = await this.vveService.getByIdAsync(
                VesselVisitExecutionId.create(id)
            );

            return this.ok(this.res, result.getValue());

        } catch (e) {
            if (e instanceof BusinessRuleValidationError) {
                return this.clientError(e.message);
            }

            this.logger.error("Unexpected error fetching VVE by id", { e });
            return this.fail("Internal server error");
        }
    }
}