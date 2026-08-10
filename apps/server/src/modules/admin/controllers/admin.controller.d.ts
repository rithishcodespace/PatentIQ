import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto } from '../dto/admin.dto.js';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: IAdminService);
    getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
    triggerReindex(request: FastifyRequest<{
        Body: ReindexEmbeddingsDto;
    }>, reply: FastifyReply): Promise<void>;
    clearCache(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=admin.controller.d.ts.map