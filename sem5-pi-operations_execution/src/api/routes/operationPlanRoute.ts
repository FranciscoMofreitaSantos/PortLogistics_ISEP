import { Router } from "express";
import { Container } from "typedi";
import { celebrate, Joi } from "celebrate";

import CreateOperationPlanController from "../../controllers/operationPlan/createOperationPlanController";
import GetOperationPlansController from "../../controllers/operationPlan/getOperationPlansController";
import OperationPlanUpdateController from "../../controllers/operationPlan/operationPlanUpdateController";
import GetOperationPlansByPhysicalResourceController from "../../controllers/operationPlan/getOperationPlansByPhysicalResourceController";

const route = Router();

/**
 * @openapi
 * tags:
 *   - name: OperationPlans
 *     description: Scheduling and management of cargo operations (loading/unloading)
 *
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Invalid input
 *
 *     Operation:
 *       type: object
 *       description: Represents a single move or task within the plan
 *       properties:
 *         id:
 *           type: string
 *           example: OP-001
 *         type:
 *           type: string
 *           enum: [LOADING, UNLOADING]
 *           example: LOADING
 *         containerId:
 *           type: string
 *           example: CONT-1234567
 *         timeWindow:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date-time
 *             end:
 *               type: string
 *               format: date-time
 *
 *     OperationPlan:
 *       type: object
 *       description: The calculated schedule for a vessel visit
 *       properties:
 *         id:
 *           type: string
 *           example: PLAN-2026-001
 *         planDate:
 *           type: string
 *           format: date-time
 *           example: "2026-01-01T00:00:00Z"
 *         status:
 *           type: string
 *           example: Generated
 *         algorithm:
 *           type: string
 *           example: Genetic
 *         totalDelay:
 *           type: number
 *           description: Estimated total delay in minutes
 *           example: 45
 *         operations:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Operation"
 *         author:
 *           type: string
 *           example: system_test
 *
 *     CreatePlanRequest:
 *       type: object
 *       required: [algorithm, status, planDate]
 *       properties:
 *         algorithm:
 *           type: string
 *           example: Genetic
 *         status:
 *           type: string
 *           example: Generated
 *         planDate:
 *           type: string
 *           format: date-time
 *           example: "2026-01-05T08:00:00Z"
 *         totalDelay:
 *           type: number
 *           example: 30
 *         operations:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/Operation"
 *         author:
 *           type: string
 *           example: operator@port.com
 *
 *     UpdateVVNRequest:
 *       type: object
 *       required: [planDomainId, vvnId, reasonForChange, author, operations]
 *       properties:
 *         planDomainId:
 *           type: string
 *           example: PLAN-123
 *         vvnId:
 *           type: string
 *           example: VVN-2025-001
 *         reasonForChange:
 *           type: string
 *           example: Crane breakdown adjustment
 *         author:
 *           type: string
 *           example: manager@port.com
 *         operations:
 *           type: array
 *           description: List of updated operations
 *           items:
 *             $ref: "#/components/schemas/Operation"
 *
 *     BatchUpdateRequest:
 *       type: object
 *       required: [planDomainId, reasonForChange, author, updates]
 *       properties:
 *         planDomainId:
 *           type: string
 *           example: PLAN-123
 *         reasonForChange:
 *           type: string
 *           example: Shift change optimization
 *         author:
 *           type: string
 *           example: manager@port.com
 *         updates:
 *           type: array
 *           items:
 *             type: object
 *             required: [vvnId, operations]
 *             properties:
 *               vvnId:
 *                 type: string
 *                 example: VVN-001
 *               operations:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Operation"
 */

export default (app: Router) => {
    app.use("/operation-plans", route);

    const ctrl = Container.get(CreateOperationPlanController);
    const listCtrl = Container.get(GetOperationPlansController);
    const updateCtrl = Container.get(OperationPlanUpdateController);
    const byResourceCtrl = Container.get(GetOperationPlansByPhysicalResourceController);

    /**
     * @openapi
     * /api/operation-plans:
     *   post:
     *     tags: [OperationPlans]
     *     summary: Create/Store a new Operation Plan
     *     description: Saves a generated plan (usually from an algorithm execution) into the database.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/CreatePlanRequest"
     *     responses:
     *       201:
     *         description: Plan created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/OperationPlan"
     *       400:
     *         description: Validation Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/ErrorResponse"
     *       500:
     *         description: Internal Server Error
     *   get:
     *     tags: [OperationPlans]
     *     summary: List Operation Plans
     *     description: Search for plans by date range or vessel identifier.
     *     parameters:
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter start date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter end date
     *       - in: query
     *         name: vessel
     *         schema:
     *           type: string
     *         description: Vessel identifier (e.g., IMO)
     *     responses:
     *       200:
     *         description: List of operation plans
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/OperationPlan"
     *       500:
     *         description: Internal Server Error
     */
    route.post(
        "/",
        celebrate({
            body: Joi.object({
                algorithm: Joi.string().required(),
                total_delay: Joi.number().optional(),
                totalDelay: Joi.number().optional(),
                status: Joi.string().required(),
                planDate: Joi.date().required(),
                best_sequence: Joi.array().optional(),
                operations: Joi.array().optional(),
                author: Joi.string().optional(),
            }).unknown(true),
        }),
        (req, res) => ctrl.execute(req, res)
    );

    route.get(
        "/",
        celebrate({
            query: Joi.object({
                startDate: Joi.date().optional(),
                endDate: Joi.date().optional(),
                vessel: Joi.string().optional(),
            }),
        }),
        (req, res) => listCtrl.execute(req, res)
    );

    /**
     * @openapi
     * /api/operation-plans/by-resource:
     *   get:
     *     tags: [OperationPlans]
     *     summary: Get Plans by Physical Resource
     *     description: Retrieve planned operations assigned to a specific resource (e.g., Crane) within a time window.
     *     parameters:
     *       - in: query
     *         name: crane
     *         required: true
     *         schema:
     *           type: string
     *         description: Identifier of the crane/resource
     *         example: CRANE-01
     *       - in: query
     *         name: startDate
     *         required: true
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Start of the time window
     *       - in: query
     *         name: endDate
     *         required: true
     *         schema:
     *           type: string
     *           format: date-time
     *         description: End of the time window
     *     responses:
     *       200:
     *         description: List of operations for the resource
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: "#/components/schemas/Operation"
     *       400:
     *         description: Validation Error
     */
    route.get(
        "/by-resource",
        celebrate({
            query: Joi.object({
                crane: Joi.string().required(),
                startDate: Joi.date().required(),
                endDate: Joi.date().required(),
            }),
        }),
        (req, res) => byResourceCtrl.execute(req, res)
    );

    /**
     * @openapi
     * /api/operation-plans/vvn:
     *   patch:
     *     tags: [OperationPlans]
     *     summary: Update Plan for a specific VVN
     *     description: Modify operations for a specific Vessel Visit within a plan.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/UpdateVVNRequest"
     *     responses:
     *       200:
     *         description: Plan updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/OperationPlan"
     *       400:
     *         description: Validation Error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/ErrorResponse"
     *       404:
     *         description: Plan or VVN not found
     */
    route.patch(
        "/vvn",
        celebrate({
            body: Joi.object({
                planDomainId: Joi.string().required(),
                vvnId: Joi.string().required(),
                reasonForChange: Joi.string().min(3).required(),
                author: Joi.string().min(3).required(),
                operations: Joi.array().min(1).required(),
            }).unknown(true),
        }),
        (req, res, next) => updateCtrl.updateForVvn(req, res, next)
    );

    /**
     * @openapi
     * /api/operation-plans/batch:
     *   patch:
     *     tags: [OperationPlans]
     *     summary: Batch Update Plan
     *     description: Modify operations for multiple Vessel Visits within a plan simultaneously.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: "#/components/schemas/BatchUpdateRequest"
     *     responses:
     *       200:
     *         description: Batch update successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: "#/components/schemas/OperationPlan"
     *       400:
     *         description: Validation Error
     */
    route.patch(
        "/batch",
        celebrate({
            body: Joi.object({
                planDomainId: Joi.string().required(),
                reasonForChange: Joi.string().min(3).required(),
                author: Joi.string().min(3).required(),
                updates: Joi.array()
                    .items(
                        Joi.object({
                            vvnId: Joi.string().required(),
                            operations: Joi.array().min(1).required(),
                        }).required()
                    )
                    .min(1)
                    .required(),
            }).unknown(true),
        }),
        (req, res, next) => updateCtrl.updateBatch(req, res, next)
    );
};