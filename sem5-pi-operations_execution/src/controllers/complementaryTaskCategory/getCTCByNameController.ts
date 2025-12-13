import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../../services/IServices/IComplementaryTaskCategoryService";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";

@Service()
export default class GetCTCByNameController extends BaseController {

    constructor(
        @Inject("ComplementaryTaskCategoryService")
        private ctcService: IComplementaryTaskCategoryService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<void> {
        const name = this.req.query.name as string;

        try {
            const result = await this.ctcService.getByNameAsync(name);

            this.ok(this.res, result);
        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation while getting CTC by name", {
                    message: e.message,
                    details: e.details
                });

                this.clientError(e.message);
                return;
            }

            this.logger.error("Unexpected error getting CTC by name", { e });

            this.fail("Internal server error");
        }
    }
}