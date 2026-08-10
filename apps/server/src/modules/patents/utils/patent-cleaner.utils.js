export class PatentCleanerUtils {
    /**
     * Sanitizes and cleans raw patent text:
     * 1. Strips HTML tags and decodes common HTML entities (&amp;, &lt;, &gt;, &nbsp;, &quot;, &#39;)
     * 2. Removes non-printable/Unicode control characters
     * 3. Normalizes carriage returns (\r\n -> \n, \r -> \n)
     * 4. Reduces inline duplicate spaces/tabs to single space while preserving line structure
     * 5. Reduces excess blank lines to max double newlines
     */
    static cleanText(rawText) {
        if (!rawText)
            return '';
        let text = rawText;
        // 1. Remove HTML tags (<p>, <br>, <div...>, etc.)
        text = text.replace(/<[^>]*>/g, ' ');
        // 2. Decode HTML entities
        text = text
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&apos;/gi, "'");
        // 3. Remove non-printable control characters
        text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFEFF]/g, '');
        // 4. Standardize line endings
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // 5. Clean whitespace line by line
        const lines = text.split('\n').map((line) => {
            return line.replace(/\t/g, ' ').replace(/ +/g, ' ').trim();
        });
        // 6. Join lines and collapse 3+ newlines to double newlines (\n\n)
        const cleaned = lines.join('\n').replace(/\n{3,}/g, '\n\n');
        return cleaned.trim();
    }
    /**
     * Automatically extracts and normalizes IPC (International Patent Classification) codes from text.
     * Format: Section (A-H) Class (2 digits) Subclass (1 letter) Main Group (1-4 digits) / Subgroup (1-6 digits)
     * Examples: G06F 17/30, H04L 29/06, A61K 31/00, B64C 27/08
     */
    static extractIpcCodes(rawText) {
        if (!rawText)
            return [];
        // IPC Regex Pattern: [A-H]\d{2}[A-Z]\s*\d{1,4}\/\d{1,6}
        const regex = /\b([A-H]\d{2}[A-Z])\s*(\d{1,4}\/\d{1,6})\b/gi;
        const matches = rawText.matchAll(regex);
        const result = new Set();
        for (const match of matches) {
            if (!match[1] || !match[2])
                continue;
            const sectionClassSubclass = match[1].toUpperCase();
            const groupSubgroup = match[2];
            const normalizedCode = `${sectionClassSubclass} ${groupSubgroup}`;
            result.add(normalizedCode);
        }
        return Array.from(result);
    }
}
//# sourceMappingURL=patent-cleaner.utils.js.map