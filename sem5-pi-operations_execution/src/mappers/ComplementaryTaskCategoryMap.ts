import { Mapper } from "../core/infra/Mapper";
import { ComplementaryTaskCategory } from "../domain/complementaryTaskCategory/complementaryTaskCategory";
import { UniqueEntityID } from "../core/domain/UniqueEntityID";
import { IComplementaryTaskCategoryDTO } from "../dto/IComplementaryTaskCategoryDTO";

export class ComplementaryTaskCategoryMap extends Mapper<ComplementaryTaskCategory> {

    public static toDTO(cat: ComplementaryTaskCategory): IComplementaryTaskCategoryDTO {
        return {
            code: cat.code,
            category: cat.category,
            duration: cat.duration
        };
    }

    public static async toDomain(raw: any): Promise<ComplementaryTaskCategory | null> {
        const categoryOrError = ComplementaryTaskCategory.create(
            {
                code: raw.code,
                category: raw.category,
                duration: raw.duration
            },
            new UniqueEntityID(raw.domainId)
        );

        if (categoryOrError.isFailure) {
            console.error(categoryOrError.error);
            return null;
        }

        return categoryOrError.getValue();
    }

    public static toPersistence(cat: ComplementaryTaskCategory): any {
        return {
            domainId: cat.id.toString(),
            code: cat.code,
            category: cat.category,
            duration: cat.duration
        };
    }
}
