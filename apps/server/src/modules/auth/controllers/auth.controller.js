import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(request, reply) {
        const result = await this.authService.register(request.body);
        if (result.token) {
            reply.setCookie('token', result.token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: false,
                maxAge: 7 * 24 * 60 * 60,
            });
        }
        reply.status(201).send(ResponseFormatter.success({ user: result.user }, 'User registered successfully'));
    }
    async login(request, reply) {
        const result = await this.authService.login(request.body);
        if (result.token) {
            reply.setCookie('token', result.token, {
                httpOnly: true,
                path: '/',
                sameSite: 'lax',
                secure: false,
                maxAge: 7 * 24 * 60 * 60,
            });
        }
        reply.status(200).send(ResponseFormatter.success({ user: result.user }, 'Login successful'));
    }
    async logout(_request, reply) {
        reply.clearCookie('token', { path: '/' });
        reply.status(200).send(ResponseFormatter.success(null, 'Successfully logged out'));
    }
    async getMe(request, reply) {
        const userPayload = request.user;
        if (!userPayload) {
            reply.status(401).send(ResponseFormatter.error('Not authenticated', 'Unauthorized'));
            return;
        }
        reply.status(200).send(ResponseFormatter.success({ user: userPayload }, 'Current user profile fetched successfully'));
    }
}
//# sourceMappingURL=auth.controller.js.map