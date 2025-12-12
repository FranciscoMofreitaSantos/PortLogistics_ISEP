import { Category } from "../domain/complementaryTaskCategory/category";

export interface IComplementaryTaskCategoryPersistance{
    _id:string,
    code:string,
    category: Category,
    duration: Number
}