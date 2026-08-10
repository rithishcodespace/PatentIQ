import { ResponseFormatter } from '../../../common/utils/response.formatter.js';
export class PatentsController {
    patentService;
    ingestionPipelineService;
    constructor(patentService, ingestionPipelineService) {
        this.patentService = patentService;
        this.ingestionPipelineService = ingestionPipelineService;
    }
    async create(request, reply) {
        const patent = await this.patentService.createPatent(request.body);
        reply.status(201).send(ResponseFormatter.success(patent, 'Patent created successfully'));
    }
    async getById(request, reply) {
        const patent = await this.patentService.getPatentById(request.params.id);
        reply.send(ResponseFormatter.success(patent));
    }
    async list(request, reply) {
        const patents = await this.patentService.listPatents(request.query);
        reply.send(ResponseFormatter.success(patents));
    }
    async triggerIngestionPipeline(request, reply) {
        if (!this.ingestionPipelineService) {
            reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
            return;
        }
        const status = await this.ingestionPipelineService.triggerPipelineRun(request.body || {});
        reply.status(202).send(ResponseFormatter.success(status, 'Automated batch ingestion pipeline initiated'));
    }
    async getIngestionPipelineStatus(_request, reply) {
        if (!this.ingestionPipelineService) {
            reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
            return;
        }
        const status = this.ingestionPipelineService.getPipelineStatus();
        reply.send(ResponseFormatter.success(status));
    }
    async configureIngestionSchedule(request, reply) {
        if (!this.ingestionPipelineService) {
            reply.status(503).send(ResponseFormatter.error('Ingestion pipeline service unavailable'));
            return;
        }
        const { intervalMinutes, enabled } = request.body;
        this.ingestionPipelineService.configureSchedule(intervalMinutes, enabled);
        reply.send(ResponseFormatter.success(this.ingestionPipelineService.getPipelineStatus(), 'Ingestion schedule updated successfully'));
    }
}
//# sourceMappingURL=patents.controller.js.map