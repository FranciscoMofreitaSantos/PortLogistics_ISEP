import { Request, Response, NextFunction } from "express";
import { Inject, Service } from "typedi";
import IVesselVisitExecutionService from "../../services/IServices/IVesselVisitExecutionService";
import { VesselVisitExecutionId } from "../../domain/vesselVisitExecution/vesselVisitExecutionId";

@Service()
export default class UpdateVVEToCompletedController {
    constructor(
        @Inject("VesselVisitExecutionService")
        private vveService: IVesselVisitExecutionService
    ) {}

    public async execute(req: Request, res: Response, next: NextFunction) {
        try {
            const id = VesselVisitExecutionId.create(req.params.id);

            const {
                actualUnBerthTime,
                actualLeavePortTime,
                updaterEmail
            } = req.body;

            if (!actualUnBerthTime || !actualLeavePortTime || !updaterEmail) {
                return res.status(400).json({
                    message: "actualUnBerthTime, actualLeavePortTime and updaterEmail are required"
                });
            }

            const result = await this.vveService.setCompletedAsync(
                id,
                new Date(actualUnBerthTime),
                new Date(actualLeavePortTime),
                updaterEmail
            );

            if (result.isFailure) {
                return res.status(400).json({
                    message: result.errorValue()
                });
            }

            return res.status(200).json(result.getValue());

        } catch (err) {
            return next(err);
        }
    }
}
