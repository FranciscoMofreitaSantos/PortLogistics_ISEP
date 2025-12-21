import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IVesselVisitExecutionService from "../../services/IServices/IVesselVisitExecutionService";
import {VesselVisitExecutionCode} from "../../domain/vesselVisitExecution/vesselVisitExecutionCode";
@Service()
export default class GetVVEByCodeController extends BaseController {

    constructor(
        @Inject("VesselVisitExecutionService")
        private vveService: IVesselVisitExecutionService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const code = this.req.params.code;

        if (!code) {
            return this.clientError("VVE code is required");
        }

        try {
            const result = await this.vveService.getByCodeAsync(VesselVisitExecutionCode.create(code));

            return this.ok(this.res, result.getValue());

        } catch (e) {
            if (e instanceof BusinessRuleValidationError) {
                return this.clientError(e.message);
            }

            this.logger.error("Unexpected error fetching VVE by code", { e });
            return this.fail("Internal server error");
        }
    }
}


