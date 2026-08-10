/**
 * Raw patent record read from cleaned CSV file.
 */
export interface CleanedCSVRow {
    patnum?: string;
    title?: string;
    abstract?: string;
    claims?: string;
    ipc?: string;
    ipcver?: string;
    pubdate?: string;
    appnum?: string;
    appdate?: string;
    [key: string]: string | undefined;
}
/**
 * Standardized structured patent section entity.
 */
export interface ExtractedPatentSection {
    patentId: string;
    title: string;
    abstract: string;
    claims: string;
    ipc: string;
    ipcVersion: string;
    publicationDate: string;
    applicationNumber: string;
    applicationDate: string;
}
/**
 * Options for the section extraction process.
 */
export interface ExtractionOptions {
    inputPath: string;
    outputPath: string;
    logInterval?: number;
}
/**
 * Performance and extraction statistics.
 */
export interface ExtractionStats {
    totalProcessed: number;
    durationSeconds: number;
    averageSpeedRowsPerSec: number;
    startTime: number;
    endTime: number;
}
/**
 * Patent Section Extractor Service.
 */
export declare class PatentSectionExtractor {
    /**
     * Normalizes text by trimming whitespace, stripping ASCII control characters,
     * and collapsing multiple space sequences into a single space.
     */
    static normalizeText(text: string | undefined | null): string;
    /**
     * Transforms raw CSV row into structured JSON Patent Section object.
     */
    static extractSections(row: CleanedCSVRow): ExtractedPatentSection;
    /**
     * Reads cleaned CSV dataset via stream and writes structured JSON array stream.
     */
    extractDatasetSections(options: ExtractionOptions): Promise<ExtractionStats>;
    /**
     * Prints final summary report upon extraction completion.
     */
    private printSummaryReport;
}
//# sourceMappingURL=extractPatentSections.d.ts.map