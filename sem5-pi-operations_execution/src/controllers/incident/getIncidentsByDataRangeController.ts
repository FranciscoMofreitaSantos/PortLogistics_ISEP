import { Inject, Service } from "typedi";
import { BaseController } from "../../core/infra/BaseController";
import { Logger } from "winston";
import IIncidentService from "../../services/IServices/IIncidentService";

@Service()
export default class GetIncidentsByDataRangeController extends BaseController {
    constructor(
        @Inject("IncidentService") private incidentService: IIncidentService,
        @Inject("logger") private logger: Logger
    ) {
        super();
    }

    protected async executeImpl(): Promise<any> {
        try {
            const start = new Date(this.req.query.start as string);
            const end = new Date(this.req.query.end as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return this.clientError("Invalid date format. Use ISO 8601, e.g. 2025-12-20T10:00:00Z");
            }

            const result = await this.incidentService.getByDataRangeAsync(start, end);

            if (result.isFailure) {
                return this.clientError(result.errorValue() as string);
            }

            return this.ok(this.res, result.getValue());
        } catch (e) {
            this.logger.error("Unexpected error getting incident by dataRange", { e });
            return this.fail("Internal server error");
        }
    }
}
