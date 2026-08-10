import { PatentsRepository } from '../repositories/patents.repository.js';
import { PatentParserService } from './patent-parser.service.js';
import { NotFoundError } from '../../../common/errors/http-errors.js';
export class PatentService {
    patentsRepository;
    patentParserService;
    constructor(patentsRepository, patentParserService) {
        this.patentsRepository = patentsRepository;
        this.patentParserService = patentParserService;
    }
    async createPatent(dto) {
        return this.patentsRepository.create(dto);
    }
    async getPatentById(id) {
        const patent = await this.patentsRepository.findById(id);
        if (!patent) {
            throw new NotFoundError(`Patent with ID ${id} not found`);
        }
        return patent;
    }
    async getPatentByNumber(patentNumber) {
        const patent = await this.patentsRepository.findByPatentNumber(patentNumber);
        if (!patent) {
            throw new NotFoundError(`Patent number ${patentNumber} not found`);
        }
        return patent;
    }
    async listPatents(filter) {
        return this.patentsRepository.list(filter);
    }
    async processRawPatent(rawFileBuffer, fileName) {
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
//# sourceMappingURL=patent.service.js.map