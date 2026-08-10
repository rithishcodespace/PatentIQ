/**
 * Interface representing raw patent row read from CSV.
 */
export interface RawPatentRow {
    patnum?: string;
    pubdate?: string;
    appnum?: string;
    appdate?: string;
    ipc?: string;
    ipcver?: string;
    city?: string;
    state?: string;
    country?: string;
    owner?: string;
    claims?: string;
    title?: string;
    abstract?: string;
    gen?: string;
    file?: string;
    [key: string]: string | undefined;
}
/**
 * Interface representing cleaned patent row containing only requested 8 columns.
 */
export interface CleanedPatentRow {
    patnum: string;
    title: string;
    abstract: string;
    claims: string;
    ipc: string;
    pubdate: string;
    appnum: string;
    appdate: string;
}
/**
 * Configuration options for dataset cleaning.
 */
export interface CleaningOptions {
    inputPath: string;
    outputPath: string;
    logInterval?: number;
}
/**
 * Performance and processing statistics.
 */
export interface CleaningStats {
    totalRead: number;
    totalCleaned: number;
    skippedDuplicates: number;
    skippedMissingTitleOrAbstract: number;
    startTime: number;
    endTime: number;
    durationSeconds: number;
}
/**
 * Patent Dataset Cleaner Service.
 */
export declare class PatentDatasetCleaner {
    /**
     * Trims whitespace, removes control characters, and normalizes multiple spaces to a single space.
     */
    static normalizeText(text: string | undefined | null): string;
    /**
     * Sanitizes and extracts only the 8 required columns from a raw patent row.
     */
    static sanitizeRow(rawRow: RawPatentRow): CleanedPatentRow;
    /**
     * Executes dataset cleaning pipeline with high-performance streaming.
     */
    cleanDataset(options: CleaningOptions): Promise<CleaningStats>;
    /**
     * Prints detailed summary report upon script completion.
     */
    private printSummaryReport;
}
//# sourceMappingURL=cleanDataset.d.ts.map