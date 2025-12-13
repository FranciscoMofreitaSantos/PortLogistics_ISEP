import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class GetCTCByCodeController extends BaseController {

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
            const result = await this.ctcService.getByCodeAsync(code);
            this.ok(this.res, result);
            return;

        } catch (e) {
            if (e instanceof BusinessRuleValidationError) {
                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error fetching category by code", { e });
            this.fail("Internal server error");
        }
    }
}