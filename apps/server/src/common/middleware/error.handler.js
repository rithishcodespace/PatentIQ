import { AppError } from '../errors/app-error.js';
export function errorHandler(error, request, reply) {
    if (error instanceof AppError) {
        reply.status(error.statusCode).send({
            success: false,
            message: error.message,
            error: error.name,
        });
        return;
    }
    request.log.error(error);
    reply.status(error.statusCode || 500).send({
        success: false,
        message: error.message || 'Internal Server Error',
        error: 'InternalServerError',
    });
}
//# sourceMappingURL=error.handler.js.map