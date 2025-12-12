import {Result} from "../../core/logic/Result";
import {IComplementaryTaskCategoryDTO} from "../../dto/IComplementaryTaskCategoryDTO";

export default interface IComplementaryTaskCategoryService {
    getTotalCategories(): Promise<Result<number>>;
    createComplementaryTaskCategory(complementaryTaskCategoryDTO: IComplementaryTaskCategoryDTO): Promise<Result<IComplementaryTaskCategoryDTO>>;
    updateComplementaryTaskCategory(complementaryTaskCategoryDTO: IComplementaryTaskCategoryDTO):  Promise<Result<IComplementaryTaskCategoryDTO>>;
    getComplementaryTaskCategory (code: string): Promise<Result<IComplementaryTaskCategoryDTO>>;

}