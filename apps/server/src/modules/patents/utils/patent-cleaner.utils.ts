export class PatentCleanerUtils {
  static cleanText(rawText: string): string {
    // TODO: Sanitize HTML, remove special noise characters, normalize whitespaces
    return rawText.trim().replace(/\s+/g, ' ');
  }

  static extractIpcCodes(rawText: string): string[] {
    // TODO: Regex pattern to extract IPC codes (e.g., G06F 17/30, H04L 29/06)
    const regex = /[A-H]\d{2}[A-Z]\s*\d+\/\d+/gi;
    return rawText.match(regex) || [];
  }
}
