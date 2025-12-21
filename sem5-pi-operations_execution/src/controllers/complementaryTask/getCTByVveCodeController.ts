import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IComplementaryTaskService from "../../services/IServices/IComplementaryTaskService";
import {VesselVisitExecutionCode} from "../../domain/vesselVisitExecution/vesselVisitExecutionCode";

@Service()
export default class GetCTByVveCodeController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskService")
        private ctService: IComplementaryTaskService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/complementary-tasks/vveCode");
        const vve = this.req.query.vve as string;


        try {
            this.logger.debug("Calling ctService.getByVveCodeAsync().");
            if (!vve) {
                return this.clientError("VVE code is required");
            }

            const result = await this.ctService.getByVveCodeAsync(VesselVisitExecutionCode.create(vve));

            if (result.isFailure) {
                this.logger.warn("CT fetch failed at Service level.", {
                    reason: result.error,
                });

                return this.clientError(
                    result.error?.toString() ?? "Unknown error at service level"
                );
            }

            this.logger.info("Successfully fetched by vve code CTs. Sending HTTP 200 OK.");
            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getByVveCode CT", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unhandled error in GetCTByVveCodeController", {
                error: (e as Error).message || e,
                stack: (e as Error).stack
            });

            return this.fail("Internal server error");
        }
    }
}