import {Result} from "../../core/logic/Result";
import {IComplementaryTaskDTO} from "../../dto/IComplementaryTaskDTO";

export default interface IUserService {
    createComplementaryTask(complementaryTaskCategoryDTO: IComplementaryTaskDTO): Promise<Result<IComplementaryTaskDTO>>;
    updateComplementaryTask(complementaryTaskCategoryDTO: IComplementaryTaskDTO):  Promise<Result<IComplementaryTaskDTO>>;
    getComplementaryTask (code: string): Promise<Result<IComplementaryTaskDTO>>;

}