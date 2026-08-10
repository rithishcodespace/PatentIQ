import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IUsersService } from '../interfaces/users-service.interface.js';
import type { UpdateUserProfileDto } from '../dto/users.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: IUsersService);
    getProfile(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    updateProfile(request: FastifyRequest<{
        Params: {
            id: string;
        };
        Body: UpdateUserProfileDto;
    }>, reply: FastifyReply): Promise<void>;
    deleteProfile(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map