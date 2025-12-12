import { Service, Inject } from "typedi";
import IComplementaryTaskCategoryService from "../services/IServices/IComplementaryTaskCategoryService";
import IComplementaryTaskCategoryRepo from "../services/IRepos/IComplementaryTaskCategoryRepo";
import { ComplementaryTaskCategory } from "../domain/complementaryTaskCategory/complementaryTaskCategory";
import { ComplementaryTaskCategoryMap } from "../mappers/ComplementaryTaskCategoryMap";
import { IComplementaryTaskCategoryDTO } from "../dto/IComplementaryTaskCategoryDTO";
import { Result } from "../core/logic/Result";
import { GenericAppError } from "../core/logic/AppError";

@Service()
export default class ComplementaryTaskCategoryService implements IComplementaryTaskCategoryService {

    constructor(
        @Inject("ComplementaryTaskRepo") private complementaryTaskCategoryRepo: IComplementaryTaskCategoryRepo
    ) {}

    public async createComplementaryTaskCategory(categoryDTO: IComplementaryTaskCategoryDTO): Promise<Result<IComplementaryTaskCategoryDTO>> {
        try {
            const categoryExists = await this.complementaryTaskCategoryRepo.findByCode(categoryDTO.code);

            if (categoryExists) {
                return Result.fail<IComplementaryTaskCategoryDTO>("Complementary task category with this code already exists.");
            }

            const categoryOrError = ComplementaryTaskCategory.create({
                code: categoryDTO.code,
                category: categoryDTO.category,
                duration: categoryDTO.duration
            });

            if (categoryOrError.isFailure) {
                return Result.fail<IComplementaryTaskCategoryDTO>(String(categoryOrError.errorValue()));
            }

            const category = categoryOrError.getValue();
            const categorySaved = await this.complementaryTaskCategoryRepo.save(category);

            if (!categorySaved) {
                return Result.fail<IComplementaryTaskCategoryDTO>("Error saving complementary task category.");
            }

            const categoryDTOSaved = ComplementaryTaskCategoryMap.toDTO(categorySaved);
            return Result.ok<IComplementaryTaskCategoryDTO>(categoryDTOSaved);

        } catch (e) {
            return Result.fail<IComplementaryTaskCategoryDTO>(
                String(new GenericAppError.UnexpectedError(e).errorValue())
            );
        }
    }

    public async updateComplementaryTaskCategory(categoryDTO: IComplementaryTaskCategoryDTO): Promise<Result<IComplementaryTaskCategoryDTO>> {
        try {
            const category = await this.complementaryTaskCategoryRepo.findByCode(categoryDTO.code);

            if (!category) {
                return Result.fail<IComplementaryTaskCategoryDTO>("Complementary task category not found.");
            }

            category.category = categoryDTO.category;
            category.duration = categoryDTO.duration;

            const categorySaved = await this.complementaryTaskCategoryRepo.save(category);

            if (!categorySaved) {
                return Result.fail<IComplementaryTaskCategoryDTO>("Error updating complementary task category.");
            }

            const categoryDTOSaved = ComplementaryTaskCategoryMap.toDTO(categorySaved);
            return Result.ok<IComplementaryTaskCategoryDTO>(categoryDTOSaved);

        } catch (e) {
            return Result.fail<IComplementaryTaskCategoryDTO>(
                String(new GenericAppError.UnexpectedError(e).errorValue())
            );
        }
    }

    public async getComplementaryTaskCategory(code: string): Promise<Result<IComplementaryTaskCategoryDTO>> {
        try {
            const category = await this.complementaryTaskCategoryRepo.findByCode(code);

            if (!category) {
                return Result.fail<IComplementaryTaskCategoryDTO>(`Complementary task category not found for code: ${code}`);
            }

            const categoryDTO = ComplementaryTaskCategoryMap.toDTO(category);
            return Result.ok<IComplementaryTaskCategoryDTO>(categoryDTO);

        } catch (e) {
            return Result.fail<IComplementaryTaskCategoryDTO>(
                String(new GenericAppError.UnexpectedError(e).errorValue())
            );
        }
    }


    public async getTotalCategories(): Promise<Result<number>> {
        try {
            const total = await this.complementaryTaskCategoryRepo.getTotalCategories();
            return Result.ok<number>(total); // <-- wrap in Result.ok
        } catch (e) {
            console.error("Error getting total categories:", e);
            return Result.fail<number>("Failed to get total categories");
        }
    }
}
