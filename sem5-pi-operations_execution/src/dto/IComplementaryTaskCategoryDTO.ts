import { Category } from "../domain/complementaryTaskCategory/category";

export interface IComplementaryTaskCategoryDTO{
    code:string,
    category: Category,
    duration: number
}