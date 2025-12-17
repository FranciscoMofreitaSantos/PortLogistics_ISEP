import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IComplementaryTaskService from "../../services/IServices/IComplementaryTaskService";

@Service()
export default class GetInRangeCTController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskService")
        private ctService: IComplementaryTaskService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/complementary-tasks/in-range");

        const { timeStart, timeEnd } = this.req.query;

        if (!timeStart || !timeEnd) {
            return this.clientError("timeStart and timeEnd are required");
        }

        const startDate = new Date(Number(timeStart));
        const endDate = new Date(Number(timeEnd));

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return this.clientError("Invalid date range.");
        }

        try {
            const result = await this.ctService.getInRangeAsync(startDate, endDate);

            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getInRange CT", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unhandled error in GetInRangeCTController", {
                error: (e as Error).message,
                stack: (e as Error).stack
            });

            return this.fail("Internal server error");
        }
    }
}