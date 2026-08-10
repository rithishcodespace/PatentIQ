import type { ReindexEmbeddingsDto, SystemStatusDto } from '../dto/admin.dto.js';
export interface IAdminService {
    getSystemStatus(): Promise<SystemStatusDto>;
    triggerReindex(dto: ReindexEmbeddingsDto): Promise<{
        jobId: string;
        queuedAt: Date;
    }>;
    clearCache(): Promise<boolean>;
}
//# sourceMappingURL=admin-service.interface.d.ts.map