import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IPatentService } from '../interfaces/patents-service.interface.js';
import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import type { IngestionPipelineService } from '../services/ingestion-pipeline.service.js';
export declare class PatentsController {
    private readonly patentService;
    private readonly ingestionPipelineService?;
    constructor(patentService: IPatentService, ingestionPipelineService?: IngestionPipelineService | undefined);
    create(request: FastifyRequest<{
        Body: CreatePatentDto;
    }>, reply: FastifyReply): Promise<void>;
    getById(request: FastifyRequest<{
        Params: {
            id: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    list(request: FastifyRequest<{
        Querystring: PatentQueryFilterDto;
    }>, reply: FastifyReply): Promise<void>;
    triggerIngestionPipeline(request: FastifyRequest<{
        Body?: {
            batchSize?: number;
            scheduleIntervalMinutes?: number;
        };
    }>, reply: FastifyReply): Promise<void>;
    getIngestionPipelineStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
    configureIngestionSchedule(request: FastifyRequest<{
        Body: {
            intervalMinutes: number;
            enabled: boolean;
        };
    }>, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=patents.controller.d.ts.map