import {AggregateRoot} from "../../core/domain/AggregateRoot";
import {UniqueEntityID} from "../../core/domain/UniqueEntityID";
import {Result} from "../../core/logic/Result";
import {Guard} from "../../core/logic/Guard";
import { ComplementaryTaskCategoryId } from "./complementaryTaskCategoryId";
import { Category } from "./category";

interface ComplementaryTaskCategoryProps{
    code:string,
    category: Category,
    duration: number
}

export class ComplementaryTaskCategory extends AggregateRoot<ComplementaryTaskCategoryProps>{
    get id():UniqueEntityID{
        return this._id;
    }

    get categoryId():ComplementaryTaskCategoryId{
        return ComplementaryTaskCategoryId.caller(this.id);
    }

    get code():string{
        return this.props.code;
    }

    get category():Category{
        return this.props.category;
    }

    get duration():number{
        return this.props.duration;
    }


    set code(value:string){
        this.props.code=value;
    }

    set category(value:Category){
        this.props.category=value;
    }

    set duration(value:number){
        this.props.duration=value;
    }

    private constructor(props: ComplementaryTaskCategoryProps, id?: UniqueEntityID) {
        super(props, id);
    }

    private static isValidCodeFormat(code: string): boolean {
        const regex = /^CTC\d{3}$/;
        return regex.test(code);
    }

    public static create(props: ComplementaryTaskCategoryProps, id?: UniqueEntityID): Result<ComplementaryTaskCategory> {
            //console.log("USER.CREATE INPUT:", props);
            const guardedProps = [
                {argument: props.code, argumentName: 'code'},
                {argument: props.category, argumentName: 'category'},
                {argument: props.duration, argumentName: 'duration'}
            ];
    
            const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);
    
            if (!guardResult.succeeded) {
                return Result.fail<ComplementaryTaskCategory>(guardResult.message)
            } else {
                if (!this.isValidCodeFormat(props.code)) {
                    return Result.fail<ComplementaryTaskCategory>(
                        "Code must follow the format CTC### (e.g., CTC001)"
                    );
                }

                const cat = new ComplementaryTaskCategory({
                    ...props
                }, id);
    
                return Result.ok<ComplementaryTaskCategory>(cat);
            }
        }
}