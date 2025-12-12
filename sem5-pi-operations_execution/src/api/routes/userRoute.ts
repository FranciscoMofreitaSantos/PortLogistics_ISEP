import { Router } from 'express';
import { Container } from 'typedi';
import { celebrate, Joi } from 'celebrate';
import middlewares from "../middlewares";
import config from '../../config';
import UserController from '../../controllers/userController';

const route = Router();

export default (app: Router) => {
    app.use('/users', route);

    const ctrl = Container.get(
        config.controllers.user.name
    ) as UserController;

    route.get(
        '/me',
        middlewares.injectUser,
        (req, res) => ctrl.execute(req, res)
    );

    route.post(
        '/sync',
        celebrate({
            body: Joi.object({
                email: Joi.string().email().required(),
                role: Joi.string().required(),
                auth0UserId: Joi.string().required(),
                name: Joi.string().required(),
                isActive: Joi.boolean().required(),
                isEliminated: Joi.boolean().required()
            }),
        }),
        (req, res) => ctrl.execute(req, res)
    );

    route.post(
        '/logout',
        (_req, res) => res.sendStatus(200)
    );
};