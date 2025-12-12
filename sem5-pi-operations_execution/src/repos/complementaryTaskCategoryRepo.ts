import IComplementaryTaskCategoryRepo from "../services/IRepos/IComplementaryTaskCategoryRepo";
import { Inject, Service } from "typedi";
import { ComplementaryTaskCategory } from "../domain/complementaryTaskCategory/complementaryTaskCategory";
import { IComplementaryTaskCategoryPersistance } from "../dataschema/IComplementaryTaskCategoryPersistance"
import { Document, Model } from "mongoose";
import { ComplementaryTaskCategoryMap } from "../mappers/ComplementaryTaskCategoryMap";

@Service()
export default class ComplementaryTaskCategoryRepo implements IComplementaryTaskCategoryRepo {
    constructor(
        @Inject("complementaryTaskCategorySchema") private complementaryTaskCategorySchema: Model<IComplementaryTaskCategoryPersistance & Document>,
        @Inject("logger") private logger: any
    ) {}

    public async exists(category: ComplementaryTaskCategory): Promise<boolean> {
        const id = category.id.toString();
        const record = await this.complementaryTaskCategorySchema.findOne({ domainId: id });
        return !!record;
    }

    public async save(category: ComplementaryTaskCategory): Promise<ComplementaryTaskCategory | null> {
        try {
            const rawCategory = ComplementaryTaskCategoryMap.toPersistence(category);
            const existing = await this.complementaryTaskCategorySchema.findOne({ code: rawCategory.code });
            let persistedDoc;

            if (existing) {
                existing.category = rawCategory.category;
                existing.duration = rawCategory.duration;
                await existing.save();
                persistedDoc = existing;
            } else {
                const created = await this.complementaryTaskCategorySchema.create(rawCategory);
                persistedDoc = created;
            }

            return ComplementaryTaskCategoryMap.toDomain(persistedDoc);
        } catch (err) {
            this.logger.error("Error in ComplementaryTaskCategoryRepo.save:", err);
            throw err;
        }
    }

    public async findByCode(code: string): Promise<ComplementaryTaskCategory | null> {
        const categoryRecord = await this.complementaryTaskCategorySchema.findOne({ code });
        return categoryRecord ? ComplementaryTaskCategoryMap.toDomain(categoryRecord) : null;
    }


    public async getTotalCategories(): Promise<number> {
        try {
            const count = await this.complementaryTaskCategorySchema.countDocuments({});
            return count;
        } catch (err) {
            this.logger.error("Error in ComplementaryTaskCategoryRepo.getTotalCategories:", err);
            return 0;
        }
    }
}
