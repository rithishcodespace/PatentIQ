export declare class PatentCleanerUtils {
    /**
     * Sanitizes and cleans raw patent text:
     * 1. Strips HTML tags and decodes common HTML entities (&amp;, &lt;, &gt;, &nbsp;, &quot;, &#39;)
     * 2. Removes non-printable/Unicode control characters
     * 3. Normalizes carriage returns (\r\n -> \n, \r -> \n)
     * 4. Reduces inline duplicate spaces/tabs to single space while preserving line structure
     * 5. Reduces excess blank lines to max double newlines
     */
    static cleanText(rawText: string): string;
    /**
     * Automatically extracts and normalizes IPC (International Patent Classification) codes from text.
     * Format: Section (A-H) Class (2 digits) Subclass (1 letter) Main Group (1-4 digits) / Subgroup (1-6 digits)
     * Examples: G06F 17/30, H04L 29/06, A61K 31/00, B64C 27/08
     */
    static extractIpcCodes(rawText: string): string[];
}
//# sourceMappingURL=patent-cleaner.utils.d.ts.map