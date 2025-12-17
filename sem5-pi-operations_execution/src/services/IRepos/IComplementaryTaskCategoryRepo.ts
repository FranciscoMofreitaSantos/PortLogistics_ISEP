import { Repo } from "../../core/infra/Repo";
import { ComplementaryTaskCategory } from "../../domain/complementaryTaskCategory/complementaryTaskCategory";
import { Category } from "../../domain/complementaryTaskCategory/category";
import {ComplementaryTaskCategoryId} from "../../domain/complementaryTaskCategory/complementaryTaskCategoryId";

export default interface IComplementaryTaskCategoryRepo extends Repo<ComplementaryTaskCategory> {

    findByCode(code: string): Promise<ComplementaryTaskCategory | null>;
    findById(id: ComplementaryTaskCategoryId): Promise<ComplementaryTaskCategory | null>;
    findByName(name: string): Promise<ComplementaryTaskCategory[]>;
    findByDescription(description: string): Promise<ComplementaryTaskCategory[]>;
    findByCategory(category: Category): Promise<ComplementaryTaskCategory[]>;
    getTotalCategories(): Promise<number>;
    findAll(): Promise<ComplementaryTaskCategory[]>;
}