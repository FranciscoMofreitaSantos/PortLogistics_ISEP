import { Request, Response, NextFunction } from 'express';

export default interface IUserController  {
    createOrSyncUser(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    getMe(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}