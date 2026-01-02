import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IDockReassignmentLogService from "../../services/IServices/IDockReassignmentLogService";

@Service()
export default class GetAllDockReassignmentLog extends BaseController {

    constructor(
        @Inject("DockReassignmentLogService")
        private service: IDockReassignmentLogService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/dock-reassignment-log");

        try {
            this.logger.debug("Calling service.getAllAsync().");
            const result = await this.service.getAllAsync();


            if (result.isFailure) {
                this.logger.warn("DockReassignmentLog fetch failed at Service level.", {
                    reason: result.error,
                });

                return this.clientError(
                    result.error?.toString() ?? "Unknown error at service level"
                );
            }

            this.logger.info("Successfully fetched all DockReassignmentLog. Sending HTTP 200 OK.");
            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getAll DockReassignmentLog", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unhandled error in GetAllDockReassignmentLog", {
                error: (e as Error).message || e,
                stack: (e as Error).stack
            });

            return this.fail("Internal server error");
        }
    }
}