import IUserRepo from "./IRepos/IUserRepo";
import {Inject, Service} from "typedi";
import {User} from "../domain/user";
import {IUserPersistence} from "../dataschema/IUserPersistence";
import {Document, Model} from 'mongoose';
import {UserId} from "../domain/userId";
import {UserMap} from "../mappers/UserMap";

@Service()
export default class UserRepo implements IUserRepo {

    constructor(
        @Inject('userSchema') private userSchema: Model<IUserPersistence & Document>,
        @Inject('logger') private logger: any
    ) {
    }


    public async exists(userId: UserId | string): Promise<boolean> {

        const idX = userId instanceof UserId
            ? (<UserId>userId).id.toValue()
            : userId;

        const query = {domainId: idX};
        const userDocument = await this.userSchema.findOne(query);

        return !!userDocument === true;
    }

    public async save(user: User): Promise<User | null> {
        const query = {domainId: user.id.toString()};

        const userDocument = await this.userSchema.findOne(query);

        try {
            if (userDocument === null) {
                const rawUser: any = UserMap.toPersistence(user);
                const userCreated = await this.userSchema.create(rawUser);

                return UserMap.toDomain(userCreated);
            } else {
                userDocument.name = user.name;
                userDocument.role = user.role;

                await userDocument.save();

                return user;
            }
        } catch (err) {
            this.logger.error('Error in UserRepo.save:', err);
            throw err;
        }
    }


    public async findByEmail(email: string): Promise<User | null> {
        const query = {email: email.toString()};
        const userRecord = await this.userSchema.findOne(query);

        if (userRecord != null) {
            return UserMap.toDomain(userRecord);
        } else
            return null;
    }

}