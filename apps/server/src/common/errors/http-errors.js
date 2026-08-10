import { AppError } from './app-error.js';
export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
export class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, 400);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
export class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
export class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
export class ServiceUnavailableError extends AppError {
    constructor(message = 'Service unavailable') {
        super(message, 503);
    }
}
export class GatewayTimeoutError extends AppError {
    constructor(message = 'Gateway timeout') {
        super(message, 504);
    }
}
export class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable entity') {
        super(message, 422);
    }
}
//# sourceMappingURL=http-errors.js.map