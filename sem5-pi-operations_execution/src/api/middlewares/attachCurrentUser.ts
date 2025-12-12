import { Container } from 'typedi';
import winston from 'winston';
import config from '../../config';
import IUserService from '../../services/IServices/IUserService';


const attachCurrentUser = async (req: any, res: any, next: any) => {
    const Logger = Container.get('logger') as winston.Logger;

    const userEmail = req.token ? req.token.email : null;

    try {
        if (!userEmail) {
            Logger.warn('JWT payload is missing email claim.');
            return res.status(401).send({ message: "Token JWT inválido ou incompleto (falta email)." });
        }

        const userService = Container.get(config.services.user.name) as IUserService;

        const userOrError = await userService.getUser(userEmail);

        if (userOrError.isFailure) {
            Logger.warn(`Local User not found for email: ${userEmail}. Authorization denied.`);
            return res.status(401).send({ message: "Not sync user or role not defined." });
        }

        req.currentUser = userOrError.getValue();

        next();

    } catch (e) {
        Logger.error('Error attaching user to req: %o', e);
        return next(e);
    }
};

export default attachCurrentUser;