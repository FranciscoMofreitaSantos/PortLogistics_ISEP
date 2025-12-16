import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IComplementaryTaskService from "../../services/IServices/IComplementaryTaskService";
import {ComplementaryTaskCategoryId} from "../../domain/complementaryTaskCategory/complementaryTaskCategoryId";

@Service()
export default class GetCTByCategoryController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskService")
        private ctService: IComplementaryTaskService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/complementary-tasks/category");

        const cat = this.req.params.category;

        try {
            this.logger.debug("Calling ctService.getByCategoryAsync().");
            const result = await this.ctService.getByCategoryAsync(ComplementaryTaskCategoryId.caller(cat));

            if (result.isFailure) {
                this.logger.warn("CT fetch failed at Service level.", {
                    reason: result.error,
                });

                return this.clientError(
                    result.error?.toString() ?? "Unknown error at service level"
                );
            }

            this.logger.info("Successfully fetched by category CTs. Sending HTTP 200 OK.");
            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getByCategory CT", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unhandled error in GetCTByCategoryController", {
                error: (e as Error).message || e,
                stack: (e as Error).stack
            });

            return this.fail("Internal server error");
        }
    }
}