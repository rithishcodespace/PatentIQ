import type { IPatentService } from '../interfaces/patents-service.interface.js';
import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import type { CleanedPatentRecord } from '../types/patent.types.js';
import { PatentsRepository } from '../repositories/patents.repository.js';
import { PatentParserService } from './patent-parser.service.js';
import { NotFoundError } from '../../../common/errors/http-errors.js';

export class PatentService implements IPatentService {
  constructor(
    private readonly patentsRepository: PatentsRepository,
    private readonly patentParserService: PatentParserService
  ) {}

  async createPatent(dto: CreatePatentDto): Promise<CleanedPatentRecord> {
    return this.patentsRepository.create(dto);
  }

  async getPatentById(id: string): Promise<CleanedPatentRecord> {
    const patent = await this.patentsRepository.findById(id);
    if (!patent) {
      throw new NotFoundError(`Patent with ID ${id} not found`);
    }
    return patent;
  }

  async getPatentByNumber(patentNumber: string): Promise<CleanedPatentRecord> {
    const patent = await this.patentsRepository.findByPatentNumber(patentNumber);
    if (!patent) {
      throw new NotFoundError(`Patent number ${patentNumber} not found`);
    }
    return patent;
  }

  async listPatents(filter: PatentQueryFilterDto): Promise<CleanedPatentRecord[]> {
    return this.patentsRepository.list(filter);
  }

  async processRawPatent(rawFileBuffer: Buffer, fileName: string): Promise<CleanedPatentRecord> {
    const parsed = await this.patentParserService.parsePdf(rawFileBuffer);
    return this.patentsRepository.create({
      patentNumber: `FILE-${Date.now()}`,
      title: parsed.title || fileName,
      abstract: parsed.abstract,
      claims: parsed.claims,
      ipcClassifications: parsed.ipcClassifications,
    });
  }
}
