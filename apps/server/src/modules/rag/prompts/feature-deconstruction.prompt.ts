import type { ExtractedFeature, InventionDeconstructionResult } from '../interfaces/rag.interface.js';

export class FeatureDeconstructionPromptBuilder {
  /**
   * System prompt instructing LLM to act as a patent examiner and extract structured invention features.
   */
  public static getSystemPrompt(): string {
    return `You are a senior patent attorney and technical analyst.
Your task is to analyze an invention description or patent disclosure text and deconstruct it into discrete technical features, infer its primary IPC (International Patent Classification) technical domains, and summarize a refined technical title.

STRICT RULES:
1. Break down the invention into 3 to 7 specific, distinct technical features/components (e.g., F1: Sensing Mechanism, F2: Fluid Micro-Channel, F3: Dynamic Feedback Algorithm).
2. For each feature, determine its category (e.g., Hardware, Software, Process, Chemical, Mechanical) and assign an importance level: CRITICAL, HIGH, MEDIUM, or LOW.
3. Infer 1 to 3 relevant IPC classification codes (e.g., "G06F 16/30", "A61B 5/00", "H04L 9/00").
4. Output raw JSON only. Do NOT include markdown code blocks or explanations outside the JSON.`;
  }

  /**
   * Builds prompt payload with user invention text.
   */
  public static buildPrompt(inventionText: string): string {
    const cleanedText = inventionText ? inventionText.trim() : '';

    return `Analyze the following invention text and extract its core technical features:

INVENTION DISCLOSURE:
"${cleanedText}"

INSTRUCTIONS:
Return a raw JSON object with the exact following schema:
{
  "coreTitle": "Refined technical title summarizing the invention",
  "technicalDomain": ["IPC_CODE_1", "IPC_CODE_2"],
  "extractedFeatures": [
    {
      "id": "F1",
      "name": "Feature Name (2-5 words)",
      "description": "Clear technical summary of what this component/step does",
      "category": "Hardware | Software | Process | Mechanical | Chemical",
      "importance": "CRITICAL | HIGH | MEDIUM | LOW"
    }
  ]
}

Ensure every extracted feature has a unique id ("F1", "F2", "F3"...).
Output raw JSON only.`;
  }

  /**
   * Robust parser converting raw LLM output into InventionDeconstructionResult.
   * Triggers heuristic fallback parser if LLM output cannot be parsed.
   */
  public static parseDeconstructionResponse(
    llmOutput: string,
    rawInventionText: string
  ): InventionDeconstructionResult {
    if (!llmOutput || !llmOutput.trim()) {
      return this.createFallbackResult(rawInventionText);
    }

    const trimmed = llmOutput.trim();

    try {
      const jsonCandidate = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(jsonCandidate);

      if (parsed && typeof parsed === 'object') {
        const coreTitle = String(
          parsed.coreTitle || parsed.title || this.extractFirstSentence(rawInventionText) || 'Invention Disclosure'
        ).trim();

        const technicalDomain = this.toStringArray(
          parsed.technicalDomain || parsed.ipcClassifications,
          ['G06F 16/30']
        );

        let extractedFeatures: ExtractedFeature[] = [];

        if (Array.isArray(parsed.extractedFeatures) && parsed.extractedFeatures.length > 0) {
          extractedFeatures = parsed.extractedFeatures.map((item: any, index: number) => {
            const importanceVal = String(item.importance || 'HIGH').toUpperCase();
            const validImportance: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
              importanceVal === 'CRITICAL' || importanceVal === 'HIGH' || importanceVal === 'MEDIUM' || importanceVal === 'LOW'
                ? (importanceVal as any)
                : 'HIGH';

            return {
              id: item.id ? String(item.id) : `F${index + 1}`,
              name: String(item.name || item.title || `Technical Feature ${index + 1}`).trim(),
              description: String(item.description || item.detail || 'Technical feature description.').trim(),
              category: String(item.category || 'Hardware/Software').trim(),
              importance: validImportance,
            };
          });
        }

        if (extractedFeatures.length > 0) {
          return {
            coreTitle,
            technicalDomain,
            extractedFeatures,
            isFallback: false,
          };
        }
      }
    } catch {
      // Fall through to heuristic fallback
    }

    return this.createFallbackResult(rawInventionText);
  }

  /**
   * Heuristic fallback generator when LLM is unavailable or fails to produce JSON.
   */
  public static createFallbackResult(rawInventionText: string): InventionDeconstructionResult {
    const text = rawInventionText ? rawInventionText.trim() : 'Invention Disclosure';
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const firstSentence = sentences[0] || text;
    const coreTitle =
      firstSentence.length > 60
        ? `${firstSentence.substring(0, 57)}...`
        : firstSentence;

    const extractedFeatures: ExtractedFeature[] = [];

    if (sentences.length >= 3) {
      sentences.slice(0, 5).forEach((sentence, index) => {
        const words = sentence.split(/\s+/);
        const featureName = words.slice(0, 4).join(' ');
        extractedFeatures.push({
          id: `F${index + 1}`,
          name: featureName.replace(/[^a-zA-Z0-9 ]/g, '') || `Feature Component ${index + 1}`,
          description: sentence,
          category: index % 2 === 0 ? 'Hardware / Architecture' : 'Software / Control Logic',
          importance: index === 0 ? 'CRITICAL' : index === 1 ? 'HIGH' : 'MEDIUM',
        });
      });
    } else {
      // Split by clauses or commas
      const clauses = text
        .split(/[,;]\s+/)
        .map((c) => c.trim())
        .filter((c) => c.length > 5);

      clauses.slice(0, 4).forEach((clause, index) => {
        extractedFeatures.push({
          id: `F${index + 1}`,
          name: `Core Component ${index + 1}`,
          description: clause,
          category: 'General Invention Element',
          importance: index === 0 ? 'CRITICAL' : 'HIGH',
        });
      });
    }

    if (extractedFeatures.length === 0) {
      extractedFeatures.push({
        id: 'F1',
        name: 'Primary Invention Implementation',
        description: text,
        category: 'System / Process',
        importance: 'CRITICAL',
      });
    }

    return {
      coreTitle,
      technicalDomain: ['G06F 16/30'],
      extractedFeatures,
      isFallback: true,
    };
  }

  private static extractFirstSentence(text: string): string {
    if (!text) return '';
    const match = text.match(/^[^.!?]+/);
    return match ? match[0].trim() : text.trim();
  }

  private static toStringArray(input: any, fallback: string[]): string[] {
    if (Array.isArray(input)) {
      const items = input.map((i) => String(i).trim()).filter((i) => i.length > 0);
      return items.length > 0 ? items : fallback;
    }
    if (typeof input === 'string' && input.trim()) {
      return [input.trim()];
    }
    return fallback;
  }
}
