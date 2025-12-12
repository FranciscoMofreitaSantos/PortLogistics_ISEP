import { Inject, Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/infra/BaseController";
import IComplementaryTaskService from "../services/IServices/IComplementaryTaskService";
import { IComplementaryTaskDTO } from "../dto/IComplementaryTaskDTO";
import { Result } from "../core/logic/Result";

@Service()
export default class ComplementaryTaskController extends BaseController {
    constructor(
        @Inject("ComplementaryTaskService") private complementaryTaskService: IComplementaryTaskService
    ) {
        super();
    }

    /**
     * Create a new complementary task.
     * Generates a code if not provided or validates provided code.
     */
    public async createComplementaryTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const dto = req.body as IComplementaryTaskDTO;

            // If code is missing, generate one based on your regex
            if (!dto.code) {
                dto.code = this.generateCode();
            }

            const result = await this.complementaryTaskService.createComplementaryTask(dto);

            if (result.isFailure) {
                return res.status(400).json({ error: result.errorValue()?.toString() ?? "Unknown error" });
            }

            return res.status(201).json(result.getValue());
        } catch (e) {
            console.error("Create Complementary Task error:", e);
            return next(e);
        }
    }

    /**
     * Update an existing complementary task.
     */
    public async updateComplementaryTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const dto = req.body as IComplementaryTaskDTO;
            const result = await this.complementaryTaskService.updateComplementaryTask(dto);

            if (result.isFailure) {
                return res.status(400).json({ error: result.errorValue()?.toString() ?? "Unknown error" });
            }

            return res.status(200).json(result.getValue());
        } catch (e) {
            console.error("Update Complementary Task error:", e);
            return next(e);
        }
    }

    /**
     * Get a complementary task by code.
     */
    public async getComplementaryTask(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const code = req.params.code;
            const result = await this.complementaryTaskService.getComplementaryTask(code);

            if (result.isFailure) {
                return res.status(404).json({ error: result.errorValue()?.toString() ?? "Complementary task not found" });
            }

            return res.status(200).json(result.getValue());
        } catch (e) {
            console.error("Get Complementary Task error:", e);
            return next(e);
        }
    }

    /**
     * Generate a valid code based on the regex in ComplementaryTask.
     * Example format: CT-2025-00001
     */
    private generateCode(): string {
        const year = new Date().getFullYear();
        const randomNumber = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
        return `CT-${year}-${randomNumber}`;
    }

    protected executeImpl(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
