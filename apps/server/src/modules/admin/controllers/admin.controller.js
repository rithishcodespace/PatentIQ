import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class AdminController {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getStatus(_request, reply) {
        const status = await this.adminService.getSystemStatus();
        reply.send(ResponseFormatter.success(status));
    }
    async triggerReindex(request, reply) {
        const result = await this.adminService.triggerReindex(request.body);
        reply.status(202).send(ResponseFormatter.success(result, 'Reindexing job queued'));
    }
    async clearCache(_request, reply) {
        await this.adminService.clearCache();
        reply.send(ResponseFormatter.success(null, 'System cache cleared'));
    }
}
//# sourceMappingURL=admin.controller.js.map