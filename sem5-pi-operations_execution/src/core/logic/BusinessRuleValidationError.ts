export class BusinessRuleValidationError extends Error {
    public readonly details?: string;

    constructor(message: string, details?: string) {
        super(message);
        this.name = "BusinessRuleValidationError";
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}