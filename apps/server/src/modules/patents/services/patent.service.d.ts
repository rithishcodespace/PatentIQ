import type { IPatentService } from '../interfaces/patents-service.interface.js';
import type { CreatePatentDto, PatentQueryFilterDto } from '../dto/patents.dto.js';
import type { CleanedPatentRecord } from '../types/patent.types.js';
import { PatentsRepository } from '../repositories/patents.repository.js';
import { PatentParserService } from './patent-parser.service.js';
export declare class PatentService implements IPatentService {
    private readonly patentsRepository;
    private readonly patentParserService;
    constructor(patentsRepository: PatentsRepository, patentParserService: PatentParserService);
    createPatent(dto: CreatePatentDto): Promise<CleanedPatentRecord>;
    getPatentById(id: string): Promise<CleanedPatentRecord>;
    getPatentByNumber(patentNumber: string): Promise<CleanedPatentRecord>;
    listPatents(filter: PatentQueryFilterDto): Promise<CleanedPatentRecord[]>;
    processRawPatent(rawFileBuffer: Buffer, fileName: string): Promise<CleanedPatentRecord>;
}
//# sourceMappingURL=patent.service.d.ts.map