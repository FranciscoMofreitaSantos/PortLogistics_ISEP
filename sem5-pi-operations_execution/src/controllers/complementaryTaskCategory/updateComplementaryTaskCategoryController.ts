import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { IComplementaryTaskCategoryDTO } from "../../dto/IComplementaryTaskCategoryDTO";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class UpdateComplementaryTaskCategoryController
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
        const dto = this.req.body as IComplementaryTaskCategoryDTO;

        try {
            const updated = await this.ctcService.updateAsync(code, dto);

            this.ok(this.res, updated);
            return;

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation updating ComplementaryTaskCategory", {
                    message: e.message,
                    details: e.details,
                    code
                });

                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error updating ComplementaryTaskCategory", {
                code,
                error: e
            });

            this.fail("Internal server error");
        }
    }
}