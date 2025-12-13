import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { IComplementaryTaskCategoryDTO } from "../../dto/IComplementaryTaskCategoryDTO";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class CreateComplementaryTaskCategoryController
    extends BaseController {

    constructor(
        @Inject("ComplementaryTaskCategoryService")
        private ctcService: IComplementaryTaskCategoryService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<void> {
        const dto = this.req.body as IComplementaryTaskCategoryDTO;

        try {
            const created = await this.ctcService.createAsync(dto);

            this.ok(this.res, created);
            return;

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on create", {
                    message: e.message,
                    details: e.details
                });

                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error creating ComplementaryTaskCategory", { e });

            this.fail("Internal server error");
        }
    }
}