export type InputMethod = "form" | "paste" | "upload";

export interface AdvancedSearchOptions {
  similarityThreshold: number; // 50-100
  maxResults: number; // 10 | 20 | 50
  databases: string[]; // subset of "Google Patents" | "USPTO" | "WIPO"
  includeKeywords: boolean;
}

export interface PatentSearchPayload {
  method: InputMethod;
  // "form" method
  title?: string;
  abstract?: string;
  claims?: string;  
  keywords?: string;
  // "paste" method
  pastedText?: string;
  // "upload" method
  file?: File;
  advanced: AdvancedSearchOptions;
}

export const DEFAULT_ADVANCED_OPTIONS: AdvancedSearchOptions = {
  similarityThreshold: 75,
  maxResults: 20,
  databases: ["Google Patents", "USPTO", "WIPO"],
  includeKeywords: true,
};
