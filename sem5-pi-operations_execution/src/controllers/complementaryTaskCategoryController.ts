import { Inject, Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/infra/BaseController";
import IComplementaryTaskCategoryService from "../services/IServices/IComplementaryTaskCategoryService";
import { IComplementaryTaskCategoryDTO } from "../dto/IComplementaryTaskCategoryDTO";
import { Result } from "../core/logic/Result";

@Service()
export default class ComplementaryTaskCategoryController extends BaseController {
    constructor(
        @Inject("ComplementaryTaskCategoryService") private complementaryTaskCategoryService: IComplementaryTaskCategoryService
    ) {
        super();
    }

    /**
     * Create a new complementary task category.
     * Generates a code if not provided (not restricted by category rules)
     */
    public async createComplementaryTaskCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const dto = req.body as IComplementaryTaskCategoryDTO;

            // If code is missing, generate it
            if (!dto.code) {
                dto.code = await this.generateCode();
            }

            const result = await this.complementaryTaskCategoryService.createComplementaryTaskCategory(dto);

            if (result.isFailure) {
                return res.status(400).json({ error: result.errorValue()?.toString() ?? "Unknown error" });
            }

            return res.status(201).json(result.getValue());
        } catch (e) {
            console.error("Create Complementary Task Category error:", e);
            return next(e);
        }
    }
    /**
     * Update an existing complementary task category.
     */
    public async updateComplementaryTaskCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const dto = req.body as IComplementaryTaskCategoryDTO;

            const result = await this.complementaryTaskCategoryService.updateComplementaryTaskCategory(dto);

            if (result.isFailure) {
                return res.status(400).json({ error: result.errorValue()?.toString() ?? "Unknown error" });
            }

            return res.status(200).json(result.getValue());
        } catch (e) {
            console.error("Update Complementary Task Category error:", e);
            return next(e);
        }
    }

    /**
     * Get a complementary task category by code.
     */
    public async getComplementaryTaskCategory(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response | void> {
        try {
            const code = req.params.code;

            const result = await this.complementaryTaskCategoryService.getComplementaryTaskCategory(code);

            if (result.isFailure) {
                return res.status(404).json({ error: result.errorValue()?.toString() ?? "Complementary task category not found" });
            }

            return res.status(200).json(result.getValue());
        } catch (e) {
            console.error("Get Complementary Task Category error:", e);
            return next(e);
        }
    }

    /**
     * Generate a simple code for complementary task category.
     * Not constrained by regex, just uses CTC + 3-digit random number.
     */
    private async generateCode(): Promise<string> {
    // Get total number of existing categories from repo
        const result = await this.complementaryTaskCategoryService.getTotalCategories();

        if (result.isFailure) {
            throw new Error(result.errorValue()?.toString() ?? "Failed to get total categories");
        }

        const totalCategories = result.getValue(); // <-- now this is a number
        const nextNumber = totalCategories + 1;
        return `CTC${nextNumber.toString().padStart(3, "0")}`;
    }   

    protected executeImpl(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
