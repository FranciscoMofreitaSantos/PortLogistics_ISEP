import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class ActivateComplementaryTaskCategoryController
    extends BaseController {

    constructor(
        @Inject("ComplementaryTaskCategoryService")
        private ctcService: IComplementaryTaskCategoryService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<void> {
        const code = this.req.params.code;

        try {
            const dto = await this.ctcService.activateAsync(code);

            this.ok(this.res, dto);
            return;

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation", {
                    message: e.message,
                    details: e.details
                });

                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error activating category", { e });

            this.fail("Internal server error");
            return;
        }
    }
}