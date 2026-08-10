import fp from 'fastify-plugin';
// Infrastructure Providers
import { PineconeVectorStoreProvider } from '../providers/vectorstore/pinecone-vectorstore.provider.js';
import { OllamaLLMProvider } from '../providers/llm/ollama-llm.provider.js';
import { OllamaEmbeddingProvider } from '../providers/embedding/ollama-embedding.provider.js';
import { LocalStorageProvider } from '../storage/local-storage.provider.js';
// Repositories
import { AuthRepository } from '../modules/auth/repositories/auth.repository.js';
import { UsersRepository } from '../modules/users/repositories/users.repository.js';
import { PatentsRepository } from '../modules/patents/repositories/patents.repository.js';
import { ReportsRepository } from '../modules/reports/repositories/reports.repository.js';
import { SearchRepository } from '../modules/search/repositories/search.repository.js';
import { HistoryRepository } from '../modules/history/repositories/history.repository.js';
// Services
import { AuthService } from '../modules/auth/services/auth.service.js';
import { UsersService } from '../modules/users/services/users.service.js';
import { PatentParserService } from '../modules/patents/services/patent-parser.service.js';
import { PatentService } from '../modules/patents/services/patent.service.js';
import { IngestionPipelineService } from '../modules/patents/services/ingestion-pipeline.service.js';
import { EmbeddingsService } from '../modules/embeddings/services/embeddings.service.js';
import { SearchService } from '../modules/search/services/search.service.js';
import { BenchmarkService } from '../modules/search/services/benchmark.service.js';
import { RagService } from '../modules/rag/services/rag.service.js';
import { ReportsService } from '../modules/reports/services/reports.service.js';
import { UploadsService } from '../modules/uploads/services/uploads.service.js';
import { AnalyticsService } from '../modules/analytics/services/analytics.service.js';
import { AdminService } from '../modules/admin/services/admin.service.js';
import { HistoryService } from '../modules/history/services/history.service.js';
import { ConfidenceService } from '../modules/confidence/services/confidence.service.js';
// Controllers
import { AuthController } from '../modules/auth/controllers/auth.controller.js';
import { UsersController } from '../modules/users/controllers/users.controller.js';
import { PatentsController } from '../modules/patents/controllers/patents.controller.js';
import { EmbeddingsController } from '../modules/embeddings/controllers/embeddings.controller.js';
import { SearchController } from '../modules/search/controllers/search.controller.js';
import { BenchmarkController } from '../modules/search/controllers/benchmark.controller.js';
import { RagController } from '../modules/rag/controllers/rag.controller.js';
import { ReportsController } from '../modules/reports/controllers/reports.controller.js';
import { UploadsController } from '../modules/uploads/controllers/uploads.controller.js';
import { AnalyticsController } from '../modules/analytics/controllers/analytics.controller.js';
import { AdminController } from '../modules/admin/controllers/admin.controller.js';
import { HistoryController } from '../modules/history/controllers/history.controller.js';
// Upload Module
import { UploadRepository } from '../modules/upload/repositories/upload.repository.js';
import { UploadService } from '../modules/upload/services/upload.service.js';
import { DocumentProcessorService } from '../modules/upload/services/document-processor.service.js';
import { UploadController } from '../modules/upload/controllers/upload.controller.js';
import { FeatureDeconstructionService } from '../modules/rag/services/feature-deconstruction.service.js';
import { NoveltyMatrixService } from '../modules/rag/services/novelty-matrix.service.js';
import { DesignAroundService } from '../modules/rag/services/design-around.service.js';
import { UploadComparisonService } from '../modules/upload/services/upload-comparison.service.js';
export default fp(async (fastify) => {
    // 1. Instantiate Providers
    const vectorStoreProvider = new PineconeVectorStoreProvider();
    const llmProvider = new OllamaLLMProvider();
    const embeddingProvider = new OllamaEmbeddingProvider();
    const storageProvider = new LocalStorageProvider();
    // 2. Instantiate Repositories
    const authRepo = new AuthRepository(fastify.prisma);
    const usersRepo = new UsersRepository(fastify.prisma);
    const patentsRepo = new PatentsRepository(fastify.prisma);
    const reportsRepo = new ReportsRepository(fastify.prisma);
    const searchRepo = new SearchRepository();
    const historyRepo = new HistoryRepository(fastify.prisma);
    const uploadRepo = new UploadRepository(fastify.prisma);
    // 3. Instantiate Services (Injecting Provider & Repository Dependencies)
    const confidenceService = new ConfidenceService();
    const featureDeconstructionService = new FeatureDeconstructionService(llmProvider);
    const authService = new AuthService(authRepo, (payload) => fastify.jwt.sign(payload));
    const usersService = new UsersService(usersRepo);
    const patentParserService = new PatentParserService();
    const patentService = new PatentService(patentsRepo, patentParserService);
    const historyService = new HistoryService(historyRepo);
    const embeddingsService = new EmbeddingsService(embeddingProvider, vectorStoreProvider);
    const searchService = new SearchService(embeddingProvider, searchRepo, historyService, confidenceService);
    const noveltyMatrixService = new NoveltyMatrixService(searchService, llmProvider, featureDeconstructionService);
    const designAroundService = new DesignAroundService(noveltyMatrixService, llmProvider, featureDeconstructionService);
    const benchmarkService = new BenchmarkService(searchService);
    const ragService = new RagService(searchService, llmProvider, undefined, undefined, undefined, historyService, confidenceService);
    const reportsService = new ReportsService(reportsRepo, llmProvider, patentService);
    const uploadsService = new UploadsService(storageProvider, patentService);
    const uploadService = new UploadService(uploadRepo);
    const documentProcessorService = new DocumentProcessorService();
    const uploadComparisonService = new UploadComparisonService(uploadService, documentProcessorService, embeddingsService, searchService, ragService, historyService);
    const analyticsService = new AnalyticsService(fastify.prisma);
    const adminService = new AdminService(vectorStoreProvider, llmProvider, undefined, fastify.prisma, embeddingsService);
    const ingestionPipelineService = new IngestionPipelineService(fastify.prisma, patentParserService, embeddingProvider, vectorStoreProvider);
    // 4. Instantiate Controllers
    const authController = new AuthController(authService);
    const usersController = new UsersController(usersService);
    const patentsController = new PatentsController(patentService, ingestionPipelineService);
    const embeddingsController = new EmbeddingsController(embeddingsService);
    const benchmarkController = new BenchmarkController(benchmarkService);
    const searchController = new SearchController(searchService, benchmarkController, noveltyMatrixService);
    const ragController = new RagController(ragService, designAroundService);
    const reportsController = new ReportsController(reportsService);
    const uploadsController = new UploadsController(uploadsService);
    const uploadController = new UploadController(uploadService, documentProcessorService, embeddingsService, uploadComparisonService);
    const analyticsController = new AnalyticsController(analyticsService);
    const adminController = new AdminController(adminService);
    const historyController = new HistoryController(historyService);
    // 5. Decorate Fastify Instance with DI Container
    fastify.decorate('diContainer', {
        controllers: {
            auth: authController,
            users: usersController,
            patents: patentsController,
            embeddings: embeddingsController,
            search: searchController,
            benchmark: benchmarkController,
            rag: ragController,
            reports: reportsController,
            uploads: uploadsController,
            upload: uploadController,
            analytics: analyticsController,
            admin: adminController,
            history: historyController,
        },
        services: {
            auth: authService,
            users: usersService,
            patent: patentService,
            embeddings: embeddingsService,
            search: searchService,
            benchmark: benchmarkService,
            rag: ragService,
            reports: reportsService,
            uploads: uploadsService,
            upload: uploadService,
            documentProcessor: documentProcessorService,
            analytics: analyticsService,
            admin: adminService,
            history: historyService,
            confidence: confidenceService,
        },
    });
});
//# sourceMappingURL=di.plugin.js.map