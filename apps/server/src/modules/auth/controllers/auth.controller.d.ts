import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAuthService } from '../interfaces/auth-service.interface.js';
import type { LoginDto, RegisterDto } from '../dto/auth.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: IAuthService);
    register(request: FastifyRequest<{
        Body: RegisterDto;
    }>, reply: FastifyReply): Promise<void>;
    login(request: FastifyRequest<{
        Body: LoginDto;
    }>, reply: FastifyReply): Promise<void>;
    logout(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getMe(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map