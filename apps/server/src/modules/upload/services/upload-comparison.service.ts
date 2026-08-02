import fs from 'fs/promises';
import type { IUploadComparisonService } from '../interfaces/upload-comparison.interface.js';
import type { CompareDocumentRequestDto, CompareDocumentResponseDto, ComparisonPatentMatch } from '../dto/upload.dto.js';
import type { IDocumentProcessorService, StandardPatentDocument } from '../interfaces/upload-processor.interface.js';
import type { IUploadService } from '../interfaces/upload.interface.js';
import type { IEmbeddingsService } from '../../embeddings/interfaces/embeddings-service.interface.js';
import type { ISearchService } from '../../search/interfaces/search.interface.js';
import type { IRagService } from '../../rag/interfaces/rag.interface.js';
import type { IHistoryService } from '../../history/interfaces/history.interface.js';
import { BadRequestError, NotFoundError, InternalServerError } from '../../../common/errors/http-errors.js';

export class UploadComparisonService implements IUploadComparisonService {
  constructor(
    private readonly uploadService: IUploadService,
    private readonly documentProcessorService: IDocumentProcessorService,
    private readonly embeddingsService: IEmbeddingsService,
    private readonly searchService: ISearchService,
    private readonly ragService: IRagService,
    private readonly historyService?: IHistoryService
  ) {}

  async compareDocument(dto: CompareDocumentRequestDto): Promise<CompareDocumentResponseDto> {
    const totalStart = Date.now();
    const topK = dto.topK && dto.topK > 0 ? dto.topK : 10;

    let targetDoc: StandardPatentDocument | undefined = dto.document;
    let extractionTimeMs = 0;

    // 1. Retrieve & Extract Document if documentId was passed
    if (!targetDoc && dto.documentId) {
      const extractionStart = Date.now();
      const record = await this.uploadService.getMetadata(dto.documentId);
      if (!record) {
        throw new NotFoundError(`Uploaded document with ID '${dto.documentId}' not found.`);
      }

      let fileBuffer: Buffer;
      try {
        fileBuffer = await fs.readFile(record.storagePath);
      } catch (err: any) {
        throw new BadRequestError(`Failed to read stored document file from disk: ${err.message}`);
      }

      targetDoc = await this.documentProcessorService.processFile({
        filename: record.originalFileName,
        mimetype: record.mimeType,
        buffer: fileBuffer,
        size: record.size,
      });
      extractionTimeMs = Date.now() - extractionStart;
    }

    if (!targetDoc) {
      throw new BadRequestError('Must provide either a valid document object or a valid documentId in request body.');
    }

    if (!targetDoc.title && !targetDoc.abstract && !targetDoc.claims) {
      throw new BadRequestError('Patent document contains no valid text sections (title, abstract, claims) for comparison.');
    }

    // 2. Generate Embeddings using existing Embedding Service
    const embeddingStart = Date.now();
    try {
      await this.embeddingsService.generatePatentDocumentEmbeddings(targetDoc);
    } catch (err: any) {
      console.error(`[UploadComparisonService] Embedding generation failed: ${err.message}`);
      throw err;
    }
    const embeddingTimeMs = Date.now() - embeddingStart;

    // 3. Prepare query for Search and RAG pipeline
    const queryText = targetDoc.fullText || [targetDoc.title, targetDoc.abstract, targetDoc.claims].filter(Boolean).join('\n\n');

    // 4. Run RAG Pipeline (which uses SearchService for vector search and Qwen for novelty/overlap analysis)
    const ragStart = Date.now();
    let ragResponse: any;
    try {
      ragResponse = await this.ragService.analyze({ query: queryText, topK });
    } catch (err: any) {
      console.error(`[UploadComparisonService] RAG novelty analysis failed: ${err.message}`);
      throw new InternalServerError(`RAG comparison pipeline execution failed: ${err.message}`);
    }
    const ragTimeMs = Date.now() - ragStart;
    const retrievalTimeMs = ragResponse.metrics?.retrievalTimeMs ?? 0;

    // 5. Map Matches preserving Pinecone similarity ranking order
    const retrievedPatents = ragResponse.retrievedPatents || [];
    const overlapItems = ragResponse.overlapAnalysis || [];

    const matches: ComparisonPatentMatch[] = retrievedPatents.map((p: any, idx: number) => {
      const overlapMatch = overlapItems.find((item: any) => item.patentId === p.patentId);
      const matchingSections: string[] = overlapMatch?.relevantSections
        ? overlapMatch.relevantSections.map((s: any) => typeof s === 'string' ? s : s.section)
        : ['Abstract', 'Claims'];

      return {
        rank: idx + 1,
        patentId: p.patentId,
        title: p.title || `Patent ${p.patentId}`,
        similarityScore: p.score,
        ipc: p.ipc,
        country: 'US',
        publicationDate: undefined,
        matchingSections: matchingSections.length > 0 ? matchingSections : ['Abstract', 'Claims'],
      };
    });

    // 6. Save comparison history atomically if HistoryService is available
    let searchHistoryId: string | undefined;
    if (this.historyService) {
      try {
        const historyRecord = await this.historyService.saveCompleteSearchAndAnalysis({
          searchQuery: targetDoc.title || queryText.slice(0, 100),
          topK,
          appliedFilters: null,
          totalResults: matches.length,
          searchLatency: retrievalTimeMs,
          retrievedPatents: matches.map((m) => ({
            patentId: m.patentId,
            title: m.title,
            similarityScore: m.similarityScore,
            ipc: m.ipc,
            country: m.country,
          })),
          noveltyAnalysis: {
            summary: ragResponse.analysis.summary,
            confidenceScore: ragResponse.confidence?.overall?.score ?? 80,
            analysisModel: 'qwen2.5:3b',
            rawAnalysisJson: ragResponse.analysis,
          },
        });
        if (historyRecord?.id) {
          searchHistoryId = historyRecord.id;
        }
      } catch (err: any) {
        console.warn(`[UploadComparisonService] Failed to persist comparison history: ${err.message}`);
      }
    }

    const totalComparisonTimeMs = Date.now() - totalStart;

    console.log(
      `[UploadComparisonService] Comparison pipeline completed successfully | document="${targetDoc.title}" | matchesCount=${matches.length} | extractionMs=${extractionTimeMs}ms | embeddingMs=${embeddingTimeMs}ms | retrievalMs=${retrievalTimeMs}ms | ragMs=${ragTimeMs}ms | totalMs=${totalComparisonTimeMs}ms`
    );

    return {
      success: true,
      document: {
        id: dto.documentId,
        title: targetDoc.title,
      },
      retrieval: {
        topK,
        retrievalConfidence: ragResponse.confidence?.retrieval?.score ?? 80,
      },
      matches,
      analysis: {
        summary: ragResponse.analysis.summary || 'Novelty analysis completed.',
        novelty: Array.isArray(ragResponse.analysis.novelAspects)
          ? ragResponse.analysis.novelAspects.join('; ')
          : String(ragResponse.analysis.novelAspects || ''),
        overlappingClaims: ragResponse.analysis.overlappingClaims || [],
        recommendations: ragResponse.analysis.recommendations || [],
      },
      searchHistoryId,
    };
  }
}
