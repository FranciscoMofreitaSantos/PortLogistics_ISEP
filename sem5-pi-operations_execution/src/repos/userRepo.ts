import IUserRepo from "../services/IRepos/IUserRepo";
import { Inject, Service } from "typedi";
import { User } from "../domain/user/user";
import { IUserPersistence } from "../dataschema/IUserPersistence";
import { Document, Model } from "mongoose";
import { UserMap } from "../mappers/UserMap";

@Service()
export default class UserRepo implements IUserRepo {

    constructor(
        @Inject("userSchema")
        private userSchema: Model<IUserPersistence & Document>,

        @Inject("UserMap")
        private userMap: UserMap,

        @Inject("logger")
        private logger: any
    ) {}

    public async exists(user: User): Promise<boolean> {
        const id = user.id.toString();
        const record = await this.userSchema.findOne({ domainId: id });
        return !!record;
    }

    public async save(user: User): Promise<User | null> {
        try {
            const rawUser = this.userMap.toPersistence(user);

            const existing = await this.userSchema.findOne({ email: rawUser.email });

            let persistedDoc;

            if (existing) {
                existing.name = rawUser.name;
                existing.role = rawUser.role;
                existing.auth0UserId = rawUser.auth0UserId;
                existing.email = rawUser.email;
                existing.isActive = rawUser.isActive;
                existing.isEliminated = rawUser.isEliminated;

                await existing.save();
                persistedDoc = existing;
            } else {
                const created = await this.userSchema.create(rawUser);
                persistedDoc = created;
            }

            return this.userMap.toDomain(persistedDoc);

        } catch (err) {
            this.logger.error("Error in UserRepo.save:", err);
            throw err;
        }
    }

    public async findByEmail(email: string): Promise<User | null> {
        const userRecord = await this.userSchema.findOne({ email });

        return userRecord ? this.userMap.toDomain(userRecord) : null;
    }
}