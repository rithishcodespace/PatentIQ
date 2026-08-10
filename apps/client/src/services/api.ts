import axios from "axios";
import type { PatentSearchPayload } from "../types/search";
import type { SearchHistoryRecord } from "../types/history";

const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

export const loginUser = async (email: string, password: string): Promise<any> => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (email: string, password: string, name: string): Promise<any> => {
  const response = await apiClient.post("/auth/register", { email, password, name });
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data?.data?.user || null;
  } catch {
    return null;
  }
};

/**
 * Executes a semantic prior-art search and novelty analysis against the backend.
 * Uses /api/rag/analyze or /api/upload/compare based on payload input method.
 */
export const searchPatent = async (payload?: PatentSearchPayload): Promise<any> => {
  const queryText =
    payload?.pastedText ||
    [payload?.title, payload?.abstract, payload?.claims, payload?.keywords]
      .filter(Boolean)
      .join("\n\n") ||
    "Autonomous drone sensor fusion and wireless charging system";

  try {
    if (payload?.method === "upload" && payload.file) {
      return await compareInventionFile(payload.file, payload.advanced?.maxResults || 10);
    }

    const response = await apiClient.post("/rag/analyze", {
      query: queryText,
      topK: payload?.advanced?.maxResults || 10,
    });

    return response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Search execution failed";
    console.error("[PatentIQ API] Search patent error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Uploads a document file (PDF, DOCX, TXT) and executes end-to-end section extraction,
 * vector embedding generation, and Pinecone prior-art comparison.
 */
export const compareInventionFile = async (file: File, topK: number = 10): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // 1. Process document file to extract text sections
    const processRes = await apiClient.post("/upload/process", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const standardDoc = processRes.data?.data;

    if (standardDoc) {
      // 2. Run comparison pipeline with extracted document
      const compareRes = await apiClient.post("/upload/compare", {
        document: standardDoc,
        topK,
      });

      return compareRes.data;
    }

    throw new Error("Failed to process document file");
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Document upload/compare failed";
    console.error("[PatentIQ API] Document upload/compare error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Directly compares JSON text input (Title, Abstract, Claims) against the patent index.
 */
export const compareDirectText = async (
  document: { title: string; abstract: string; claims: string; keywords?: string[] },
  topK: number = 10
): Promise<any> => {
  try {
    const response = await apiClient.post("/upload/compare", {
      document,
      topK,
    });
    return response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Direct text comparison failed";
    console.error("[PatentIQ API] Direct text comparison error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Extracts sections from an uploaded document file without running vector search.
 */
export const processDocumentFile = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/upload/process", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Section extraction failed";
    console.error("[PatentIQ API] Section extraction error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches search history records from PostgreSQL database via /api/history.
 */
export const fetchSearchHistory = async (page = 1, limit = 20): Promise<SearchHistoryRecord[]> => {
  try {
    const response = await apiClient.get("/history", {
      params: { page, limit },
    });
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Search history fetch failed";
    console.error("[PatentIQ API] Search history fetch error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Deletes a search history record from PostgreSQL database.
 */
export const deleteSearchHistoryRecord = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/history/${id}`);
    return true;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Failed to delete history record";
    console.error("[PatentIQ API] Failed to delete history record error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Dynamically fetches OpenAPI route definitions from Fastify server (/docs/json or /api/docs/json).
 */
export const fetchOpenApiRoutes = async (): Promise<{ method: string; path: string; summary: string }[]> => {
  try {
    const response = await axios.get("/docs/json");
    if (response.data && response.data.paths) {
      const routes: { method: string; path: string; summary: string }[] = [];
      const pathsObj = response.data.paths;

      for (const pathKey of Object.keys(pathsObj)) {
        const methodsObj = pathsObj[pathKey];
        for (const methodKey of Object.keys(methodsObj)) {
          const methodUpper = methodKey.toUpperCase();
          if (["GET", "POST", "PUT", "DELETE", "PATCH"].includes(methodUpper)) {
            const summary =
              methodsObj[methodKey].summary ||
              methodsObj[methodKey].description ||
              `${methodUpper} route on ${pathKey}`;
            routes.push({
              method: methodUpper,
              path: pathKey,
              summary,
            });
          }
        }
      }

      if (routes.length > 0) {
        return routes;
      }
    }
    return [
      { method: "POST", path: "/api/search", summary: "Execute vector similarity search over patent prior art" },
      { method: "POST", path: "/api/rag/analyze", summary: "Grounded 7-section novelty analysis & claim overlap detection" },
      { method: "GET", path: "/api/history", summary: "List persisted search history records with pagination" },
      { method: "POST", path: "/api/upload/process", summary: "Parse patent document file (PDF, DOCX, TXT)" },
      { method: "POST", path: "/api/upload/compare", summary: "End-to-end document vector embedding & prior-art comparison" },
      { method: "GET", path: "/api/analytics/overview", summary: "Aggregated search metrics & IPC distributions" },
      { method: "GET", path: "/api/admin/status", summary: "Infrastructure health status check (PSQL, Ollama, Pinecone)" },
    ];
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Failed to fetch OpenAPI routes";
    console.error("[PatentIQ API] Failed to fetch OpenAPI routes error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches infrastructure health status (PostgreSQL, Pinecone, Ollama, BullMQ).
 */
export const fetchAdminStatus = async (): Promise<{
  pineconeHealthy: boolean;
  ollamaHealthy: boolean;
  databaseHealthy: boolean;
  pendingJobsCount: number;
}> => {
  try {
    const response = await apiClient.get("/admin/status");
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Admin status fetch failed";
    console.error("[PatentIQ API] Admin status fetch error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Triggers background vector re-indexing job via /api/admin/reindex.
 */
export const triggerAdminReindex = async (forceAll = false, batchSize = 50): Promise<{ message: string; jobId: string }> => {
  try {
    const response = await apiClient.post("/admin/reindex", { forceAll, batchSize });
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Reindex trigger failed";
    console.error("[PatentIQ API] Reindex trigger error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Flushes system cached queries via /api/admin/clear-cache.
 */
export const clearAdminCache = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post("/admin/clear-cache");
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Clear cache failed";
    console.error("[PatentIQ API] Clear cache error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches analytics overview metrics & IPC category distribution via /api/analytics/overview.
 */
export const fetchAnalyticsOverview = async (): Promise<{
  totalSearches: number;
  averageLatencyMs: number;
  topCategories: Array<{ ipc: string; count: number }>;
}> => {
  try {
    const response = await apiClient.get("/analytics/overview");
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Analytics overview fetch failed";
    console.error("[PatentIQ API] Analytics overview fetch error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches real-time automated ingestion pipeline status via /api/patents/ingestion/status.
 */
export const fetchIngestionStatus = async (): Promise<any> => {
  try {
    const response = await apiClient.get("/patents/ingestion/status");
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Ingestion status fetch failed";
    console.error("[PatentIQ API] Ingestion status fetch error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Triggers batch dataset ingestion pipeline via /api/patents/ingestion/run.
 */
export const triggerIngestionRun = async (batchSize = 20): Promise<any> => {
  try {
    const response = await apiClient.post("/patents/ingestion/run", { batchSize });
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Ingestion run trigger failed";
    console.error("[PatentIQ API] Ingestion run trigger error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Configures scheduled continuous dataset synchronization timer via /api/patents/ingestion/schedule.
 */
export const configureIngestionSchedule = async (intervalMinutes: number, enabled: boolean): Promise<any> => {
  try {
    const response = await apiClient.post("/patents/ingestion/schedule", { intervalMinutes, enabled });
    return response.data?.data || response.data;
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "Ingestion schedule configuration failed";
    console.error("[PatentIQ API] Ingestion schedule configuration error:", errorMsg);
    throw new Error(errorMsg);
  }
};

/**
 * Fetches Element-Level Novelty Overlap Matrix via /api/search/novelty-matrix.
 */
export const fetchNoveltyMatrix = async (payload: { query?: string; text?: string; features?: any[]; topK?: number }): Promise<any> => {
  try {
    const response = await apiClient.post("/search/novelty-matrix", payload);
    return response.data;
  } catch (error: any) {
    console.warn("[PatentIQ API] Novelty matrix fetch warning:", error?.message);
    return null;
  }
};

/**
 * Fetches AI Design-Around R&D Recommendations via /api/rag/design-around.
 */
export const fetchDesignAround = async (payload: { query?: string; text?: string; features?: any[]; topK?: number }): Promise<any> => {
  try {
    const response = await apiClient.post("/rag/design-around", payload);
    return response.data?.data || response.data;
  } catch (error: any) {
    console.warn("[PatentIQ API] Design-Around fetch warning:", error?.message);
    return null;
  }
};

/**
 * Generates and downloads an Attorney-Ready Prior-Art PDF Report via /api/reports/export-pdf.
 */
export const exportAttorneyPdfReport = async (payload: {
  inventionTitle?: string;
  msmeName?: string;
  submissionDate?: string;
  overallRiskLevel?: string;
  noveltyRiskScore?: number;
  executiveRationale?: string;
  featureMatrix?: any[];
  priorArtCitations?: any[];
  designAround?: any[];
}): Promise<void> => {
  try {
    const response = await apiClient.post("/reports/export-pdf", payload, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `PatentIQ_Attorney_Report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || error?.message || "PDF Report export failed";
    console.error("[PatentIQ API] Attorney PDF export error:", errorMsg);
    throw new Error(errorMsg);
  }
};