import type { Patent } from "./patent.ts";
import type { PatentReport } from "./report.ts";

export interface SearchResponse {
  results: Patent[];
  report: PatentReport;
}

