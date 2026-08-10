import type { FastifyInstance } from 'fastify';
import { AuthService } from '../modules/auth/services/auth.service.js';
import { UsersService } from '../modules/users/services/users.service.js';
import { PatentService } from '../modules/patents/services/patent.service.js';
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
import { UploadService } from '../modules/upload/services/upload.service.js';
import { DocumentProcessorService } from '../modules/upload/services/document-processor.service.js';
import { UploadController } from '../modules/upload/controllers/upload.controller.js';
export interface DIContainer {
    controllers: {
        auth: AuthController;
        users: UsersController;
        patents: PatentsController;
        embeddings: EmbeddingsController;
        search: SearchController;
        benchmark: BenchmarkController;
        rag: RagController;
        reports: ReportsController;
        uploads: UploadsController;
        upload: UploadController;
        analytics: AnalyticsController;
        admin: AdminController;
        history: HistoryController;
    };
    services: {
        auth: AuthService;
        users: UsersService;
        patent: PatentService;
        embeddings: EmbeddingsService;
        search: SearchService;
        benchmark: BenchmarkService;
        rag: RagService;
        reports: ReportsService;
        uploads: UploadsService;
        upload: UploadService;
        documentProcessor: DocumentProcessorService;
        analytics: AnalyticsService;
        admin: AdminService;
        history: HistoryService;
        confidence: ConfidenceService;
    };
}
declare module 'fastify' {
    interface FastifyInstance {
        diContainer: DIContainer;
    }
}
declare const _default: (fastify: FastifyInstance) => Promise<void>;
export default _default;
//# sourceMappingURL=di.plugin.d.ts.map