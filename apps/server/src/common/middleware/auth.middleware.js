import { UnauthorizedError } from '../errors/http-errors.js';
export async function authMiddleware(request, _reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedError('Authorization token required');
        }
    }
    catch (err) {
        throw new UnauthorizedError('Invalid authentication credentials');
    }
}
//# sourceMappingURL=auth.middleware.js.map