import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class GetAllComplementaryTaskCategoryController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskCategoryService")
        private ctcService: IComplementaryTaskCategoryService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        try {
            const result = await this.ctcService.getAllAsync();
            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on getAll CTC", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error("Unexpected error fetching all CTCs", { e });
            return this.fail("Internal server error");
        }
    }
}