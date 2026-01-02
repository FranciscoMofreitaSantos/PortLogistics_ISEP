import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import { BusinessRuleValidationError } from "../../core/logic/BusinessRuleValidationError";
import IDockReassignmentLogService from "../../services/IServices/IDockReassignmentLogService";
import {IDockReassignmentLogDTO} from "../../dto/IDockReassignmentLogDTO";

@Service()
export default class CreateDockReassignmentLogController
    extends BaseController {

    constructor(
        @Inject("DockReassignmentLogService")
        private service: IDockReassignmentLogService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        const dto = this.req.body as IDockReassignmentLogDTO;

        try {
            const result = await this.service.createAsync(dto);

            return this.ok(this.res, result.getValue());

        } catch (e) {

            if (e instanceof BusinessRuleValidationError) {
                this.logger.warn("Business rule violation on create", {
                    message: e.message,
                    details: e.details
                });

                return this.clientError(e.message);
            }

            this.logger.error(
                "Unexpected error creating DockReassignmentLog",
                { e }
            );

            return this.fail("Internal server error");
        }
    }
}