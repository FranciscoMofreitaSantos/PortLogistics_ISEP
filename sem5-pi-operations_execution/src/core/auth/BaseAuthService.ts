import { Service, Inject } from "typedi";
import IUserRepo from "../../services/IRepos/IUserRepo";
import { Role } from "../../domain/role";
import { Result } from "../logic/Result";

@Service()
export abstract class BaseAuthService {

    constructor(
        @Inject("UserRepo") protected userRepo: IUserRepo
    ) {}


    protected async authorize(email: string, allowedRoles: Role[]): Promise<Result<string>> {
        const user = await this.userRepo.findByEmail(email);

        if (!user) {
            return Result.fail("User not found.");
        }

        if (!user.isActive) {
            return Result.fail("User is not active.");
        }

        if (user.isEliminated) {
            return Result.fail("User has been eliminated.");
        }

        if (!allowedRoles.includes(user.role)) {
            return Result.fail(`User lacks permission. Needed: ${allowedRoles.join(", ")}`);
        }

        return Result.ok("AUTHORIZED");
    }
}