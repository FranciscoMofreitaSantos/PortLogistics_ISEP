import {BusinessRuleValidationError} from "../../core/logic/BusinessRuleValidationError";

export const Category = {
    SafetyAndSecurity: "Safety and Security",
    Maintenance: "Maintenance",
    CleaningAndHousekeeping: "Cleaning and Housekeeping"
} as const;


export type Category = typeof Category[keyof typeof Category];

export class CategoryFactory {
    static fromString(value: string): Category {
        if (Object.values(Category).includes(value as Category)) {
            return value as Category;
        }

        throw new BusinessRuleValidationError(
            "Invalid category",
            `Category '${value}' is not supported`
        );
    }
}