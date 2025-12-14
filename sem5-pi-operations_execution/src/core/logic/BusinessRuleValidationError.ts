export class BusinessRuleValidationError extends Error {
    public readonly code: string;
    public readonly details?: string;

    constructor(code: string, message?: string, details?: string) {
        super(message ?? code);
        this.name = "BusinessRuleValidationError";
        this.code = code;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
    }
}