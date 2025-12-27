import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import CreateOperationPlanController from '../../controllers/operationPlan/createOperationPlanController';
import middlewares from '../middlewares';

const route = Router();

export default (app: Router) => {
    app.use('/operation-plans', route);

    const ctrl = Container.get("CreateOperationPlanController") as CreateOperationPlanController;

    route.post(
        '/',
        //middlewares.attachCurrentUser,
        celebrate({
            body: Joi.object({
                algorithm: Joi.string().required(),
                total_delay: Joi.number().optional(),
                totalDelay: Joi.number().optional(),
                status: Joi.string().required(),
                planDate: Joi.date().required(),
                best_sequence: Joi.array().optional(),
                operations: Joi.array().optional(),
                author: Joi.string().optional()
            }).unknown(true)
        }),
        (req, res) => ctrl.execute(req, res)
    );
};