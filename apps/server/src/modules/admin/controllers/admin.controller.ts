import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IAdminService } from '../interfaces/admin-service.interface.js';
import type { ReindexEmbeddingsDto } from '../dto/admin.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class AdminController {
  constructor(private readonly adminService: IAdminService) {}

  async getStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const status = await this.adminService.getSystemStatus();
    reply.send(ResponseFormatter.success(status));
  }

  async triggerReindex(request: FastifyRequest<{ Body: ReindexEmbeddingsDto }>, reply: FastifyReply): Promise<void> {
    const result = await this.adminService.triggerReindex(request.body);
    reply.status(202).send(ResponseFormatter.success(result, 'Reindexing job queued'));
  }

  async clearCache(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.adminService.clearCache();
    reply.send(ResponseFormatter.success(null, 'System cache cleared'));
  }
}
