import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import type { CleanedPatentRecord } from '../types/patent.types.js';

export interface IPatentService {
  createPatent(dto: CreatePatentDto): Promise<CleanedPatentRecord>;
  getPatentById(id: string): Promise<CleanedPatentRecord>;
  getPatentByNumber(patentNumber: string): Promise<CleanedPatentRecord>;
  listPatents(filter: PatentQueryFilterDto): Promise<CleanedPatentRecord[]>;
  processRawPatent(rawFileBuffer: Buffer, fileName: string): Promise<CleanedPatentRecord>;
}
