import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IComplementaryTaskService from "../../services/IServices/IComplementaryTaskService";

@Service()
export default class GetAllCTController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskService")
        private ctService: IComplementaryTaskService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/complementary-tasks");

        try {
            this.logger.debug("Calling ctService.getAllAsync().");
            const result = await this.ctService.getAllAsync();


            if (result.isFailure) {
                this.logger.warn("CT fetch failed at Service level.", {
                    reason: result.error,
                });

                return this.clientError(
                    result.error?.toString() ?? "Unknown error at service level"
                );
            }

            this.logger.info("Successfully fetched all CTs. Sending HTTP 200 OK.");
            return this.ok(this.res, result.getValue());

        } catch (e) {


            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getAll CTC", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unhandled error in GetAllCTController", {
                error: (e as Error).message || e,
                stack: (e as Error).stack
            });

            return this.fail("Internal server error");
        }
    }
}