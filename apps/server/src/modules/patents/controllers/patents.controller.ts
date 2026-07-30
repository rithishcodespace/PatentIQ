import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IPatentService } from '../interfaces/patents-service.interface.js';
import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import { ResponseFormatter } from '../../../common/utils/response.formatter.js';

export class PatentsController {
  constructor(private readonly patentService: IPatentService) {}

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
}
