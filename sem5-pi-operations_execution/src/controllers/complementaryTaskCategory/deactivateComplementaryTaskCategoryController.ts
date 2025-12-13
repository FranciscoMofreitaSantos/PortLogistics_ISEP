import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class DeactivateComplementaryTaskCategoryController
    extends BaseController {

    constructor(
        @Inject("ComplementaryTaskCategoryService")
        private ctcService: IComplementaryTaskCategoryService,
        @Inject("logger")
        private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<void> {
        try {
            const code = this.req.params.code;

            const result = await this.ctcService.deactivateAsync(code);

            this.ok(this.res, result);

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on deactivate", {
                    message: e.message,
                    details: e.details
                });

                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error deactivating ComplementaryTaskCategory", { e });
            this.fail("Internal server error");
        }
    }
}