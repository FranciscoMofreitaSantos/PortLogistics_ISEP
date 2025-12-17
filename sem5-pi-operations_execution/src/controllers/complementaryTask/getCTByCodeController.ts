import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IComplementaryTaskService from "../../services/IServices/IComplementaryTaskService";
import {ComplementaryTaskCode} from "../../domain/complementaryTask/ComplementaryTaskCode";

@Service()
export default class GetCTByCodeController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskService")
        private ctService: IComplementaryTaskService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        this.logger.info("HTTP GET /api/complementary-tasks/code");
        const code = this.req.params.code;
        console.log("RAW PARAM:", code);

        try {
            this.logger.debug("Calling ctService.getByCodeAsync().");
            if (!code) {
                return this.clientError("Code is required");
            }

            const result = await this.ctService.getByCodeAsync(ComplementaryTaskCode.createFromString(code));
            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on get CT by code", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error(
                "Unexpected error fetching ComplementaryTask by code",
                { e }
            );

            return this.fail("Internal server error");
        }
    }
}