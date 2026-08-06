import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IPatentService } from '../interfaces/patents-service.interface.js';
import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
import type { IngestionPipelineService } from '../services/ingestion-pipeline.service.js';

export class PatentsController {
  constructor(
    private readonly patentService: IPatentService,
    private readonly ingestionPipelineService?: IngestionPipelineService
  ) {}

  async create(request: FastifyRequest<{ Body: CreatePatentDto }>, reply: FastifyReply): Promise<void> {
    const patent = await this.patentService.createPatent(request.body);
    reply.status(201).send(ResponseFormatter.success(patent, 'Patent created successfully'));
  }

  async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
    const patent = await this.patentService.getPatentById(request.params.id);
    reply.send(ResponseFormatter.success(patent));
  }

  async list(request: FastifyRequest<{ Querystring: PatentQueryFilterDto }>, reply: FastifyReply): Promise<void> {
    const patents = await this.patentService.listPatents(request.query);
    reply.send(ResponseFormatter.success(patents));
  }

  async triggerIngestionPipeline(
    request: FastifyRequest<{ Body?: { batchSize?: number; scheduleIntervalMinutes?: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!this.ingestionPipelineService) {
      reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
      return;
    }
    const status = await this.ingestionPipelineService.triggerPipelineRun(request.body || {});
    reply.status(202).send(ResponseFormatter.success(status, 'Automated batch ingestion pipeline initiated'));
  }

  async getIngestionPipelineStatus(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!this.ingestionPipelineService) {
      reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
      return;
    }
    const status = this.ingestionPipelineService.getPipelineStatus();
    reply.send(ResponseFormatter.success(status));
  }

  async configureIngestionSchedule(
    request: FastifyRequest<{ Body: { intervalMinutes: number; enabled: boolean } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (!this.ingestionPipelineService) {
      reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
      return;
    }
    const { intervalMinutes, enabled } = request.body;
    this.ingestionPipelineService.configureSchedule(intervalMinutes, enabled);
    reply.send(ResponseFormatter.success(this.ingestionPipelineService.getPipelineStatus(), 'Ingestion schedule updated successfully'));
  }
}
