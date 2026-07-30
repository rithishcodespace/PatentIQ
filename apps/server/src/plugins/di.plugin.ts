import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';

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

// Services
import { AuthService } from '../modules/auth/services/auth.service.js';
import { UsersService } from '../modules/users/services/users.service.js';
import { PatentParserService } from '../modules/patents/services/patent-parser.service.js';
import { PatentService } from '../modules/patents/services/patent.service.js';
import { EmbeddingsService } from '../modules/embeddings/services/embeddings.service.js';
import { SearchService } from '../modules/search/services/search.service.js';
import { RagService } from '../modules/rag/services/rag.service.js';
import { ReportsService } from '../modules/reports/services/reports.service.js';
import { UploadsService } from '../modules/uploads/services/uploads.service.js';
import { AnalyticsService } from '../modules/analytics/services/analytics.service.js';
import { AdminService } from '../modules/admin/services/admin.service.js';

// Controllers
import { AuthController } from '../modules/auth/controllers/auth.controller.js';
import { UsersController } from '../modules/users/controllers/users.controller.js';
import { PatentsController } from '../modules/patents/controllers/patents.controller.js';
import { EmbeddingsController } from '../modules/embeddings/controllers/embeddings.controller.js';
import { SearchController } from '../modules/search/controllers/search.controller.js';
import { RagController } from '../modules/rag/controllers/rag.controller.js';
import { ReportsController } from '../modules/reports/controllers/reports.controller.js';
import { UploadsController } from '../modules/uploads/controllers/uploads.controller.js';
import { AnalyticsController } from '../modules/analytics/controllers/analytics.controller.js';
import { AdminController } from '../modules/admin/controllers/admin.controller.js';

export interface DIContainer {
  controllers: {
    auth: AuthController;
    users: UsersController;
    patents: PatentsController;
    embeddings: EmbeddingsController;
    search: SearchController;
    rag: RagController;
    reports: ReportsController;
    uploads: UploadsController;
    analytics: AnalyticsController;
    admin: AdminController;
  };
  services: {
    auth: AuthService;
    users: UsersService;
    patent: PatentService;
    embeddings: EmbeddingsService;
    search: SearchService;
    rag: RagService;
    reports: ReportsService;
    uploads: UploadsService;
    analytics: AnalyticsService;
    admin: AdminService;
  };
}

declare module 'fastify' {
  interface FastifyInstance {
    diContainer: DIContainer;
  }
}

export default fp(async (fastify: FastifyInstance) => {
  // 1. Instantiate Providers
  const vectorStoreProvider = new PineconeVectorStoreProvider();
  const llmProvider = new OllamaLLMProvider();
  const embeddingProvider = new OllamaEmbeddingProvider();
  const storageProvider = new LocalStorageProvider();

  // 2. Instantiate Repositories
  const authRepo = new AuthRepository();
  const usersRepo = new UsersRepository();
  const patentsRepo = new PatentsRepository();
  const reportsRepo = new ReportsRepository();

  // 3. Instantiate Services (Injecting Provider & Repository Dependencies)
  const authService = new AuthService(authRepo);
  const usersService = new UsersService(usersRepo);
  const patentParserService = new PatentParserService();
  const patentService = new PatentService(patentsRepo, patentParserService);
  const embeddingsService = new EmbeddingsService(embeddingProvider, vectorStoreProvider);
  const searchService = new SearchService(embeddingProvider, vectorStoreProvider, patentsRepo);
  const ragService = new RagService(searchService, llmProvider);
  const reportsService = new ReportsService(reportsRepo, llmProvider, patentService);
  const uploadsService = new UploadsService(storageProvider, patentService);
  const analyticsService = new AnalyticsService();
  const adminService = new AdminService(vectorStoreProvider, llmProvider);

  // 4. Instantiate Controllers
  const authController = new AuthController(authService);
  const usersController = new UsersController(usersService);
  const patentsController = new PatentsController(patentService);
  const embeddingsController = new EmbeddingsController(embeddingsService);
  const searchController = new SearchController(searchService);
  const ragController = new RagController(ragService);
  const reportsController = new ReportsController(reportsService);
  const uploadsController = new UploadsController(uploadsService);
  const analyticsController = new AnalyticsController(analyticsService);
  const adminController = new AdminController(adminService);

  // 5. Decorate Fastify Instance with DI Container
  fastify.decorate('diContainer', {
    controllers: {
      auth: authController,
      users: usersController,
      patents: patentsController,
      embeddings: embeddingsController,
      search: searchController,
      rag: ragController,
      reports: reportsController,
      uploads: uploadsController,
      analytics: analyticsController,
      admin: adminController,
    },
    services: {
      auth: authService,
      users: usersService,
      patent: patentService,
      embeddings: embeddingsService,
      search: searchService,
      rag: ragService,
      reports: reportsService,
      uploads: uploadsService,
      analytics: analyticsService,
      admin: adminService,
    },
  });
});
