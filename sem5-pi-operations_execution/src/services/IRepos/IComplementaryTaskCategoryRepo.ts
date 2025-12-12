import { Repo } from "../../core/infra/Repo";
import { ComplementaryTaskCategory } from "../../domain/complementaryTaskCategory/complementaryTaskCategory";


export default interface IComplementaryTaskRepo extends Repo<ComplementaryTaskCategory> {
    findByCode(code: string): Promise<ComplementaryTaskCategory | null>;

    getTotalCategories(): Promise<number>;
}