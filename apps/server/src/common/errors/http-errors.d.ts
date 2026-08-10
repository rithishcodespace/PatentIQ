import { AppError } from './app-error.js';
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string);
}
export declare class ServiceUnavailableError extends AppError {
    constructor(message?: string);
}
export declare class GatewayTimeoutError extends AppError {
    constructor(message?: string);
}
export declare class UnprocessableEntityError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=http-errors.d.ts.map