import { Inject, Service } from "typedi";
import IUserController from "./IControllers/IUserController";
import { BaseController } from "../core/infra/BaseController";
import IUserService from "../services/IServices/IUserService";
import { NextFunction, Request, Response } from "express";
import { IUserDTO } from "../dto/IUserDTO";
import { Result } from "../core/logic/Result";
import config from "../config";

@Service("UserController")
export default class UserController extends BaseController implements IUserController {

    constructor(
        @Inject(config.services.user.name)
        private userServiceInstance: IUserService
    ) {
        super();
    }

    public async createOrSyncUser(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const dto = req.body as IUserDTO;

            const existingOrError = await this.userServiceInstance.getUser(dto.email);

            let result;

            if (existingOrError.isFailure) {
                result = await this.userServiceInstance.createUser(dto);
            } else {
                result = await this.userServiceInstance.updateUser(dto);
            }

            if (result.isFailure) {
                return res.status(400).json({ error: result.errorValue() });
            }

            return res.status(200).json(result.getValue());

        } catch (e) {
            return next(e);
        }
    }


    public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userDTO = (req as any).currentUser;

            if (!userDTO) {
                this.unauthorized("No user info available.");
                return;
            }

            this.ok(res, userDTO);

        } catch (e: any) {
            this.fail(e instanceof Error ? e.message : String(e));
        }
    }

    protected executeImpl(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}