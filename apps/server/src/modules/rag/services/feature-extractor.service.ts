import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';

export interface InventionFeature {
  id: string;
  text: string;
  category: string;
  importance: number;
}

export class FeatureExtractorService {
  constructor(private readonly llmProvider?: ILLMProvider | undefined) {}

  /**
   * Deconstructs an invention title, abstract, or full description into atomic technical features via Qwen LLM.
   */
  async extractFeatures(inventionText: string): Promise<InventionFeature[]> {
    const trimmed = inventionText ? inventionText.trim() : '';
    if (!trimmed) {
      return this.getFallbackFeatures(inventionText);
    }

    if (this.llmProvider) {
      try {
        const prompt = `Deconstruct the following patent invention disclosure into concrete, atomic technical features (F1, F2, F3...).
Each feature must represent a specific technical component, sensor, algorithm, measurement, process step, control rule, database storage, or user interface limitation described in the text.
Do NOT force a fixed number of features. Extract all distinct technical features that are present in the invention disclosure.

Invention Disclosure:
"${trimmed}"

Respond ONLY with a valid JSON array of objects matching this exact structure:
[
  {
    "id": "F1",
    "text": "Specific technical limitation extracted from text",
    "category": "component",
    "importance": 0.9
  }
]
No preamble, no markdown surrounding the JSON.`;

        const response = await this.llmProvider.generateCompletion(prompt, {
          temperature: 0.1,
          systemPrompt: 'You are a senior patent attorney expert in patent claim limitation deconstruction under 35 U.S.C. 112.',
        });

        const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length >= 1) {
          return parsed.map((item, idx) => ({
            id: item.id || `F${idx + 1}`,
            text: item.text || item.name || `Feature ${idx + 1}`,
            category: item.category || 'technical',
            importance: typeof item.importance === 'number' ? Math.min(1.0, Math.max(0.1, item.importance)) : 0.85,
          }));
        }
      } catch (err) {
        console.warn('[FeatureExtractorService] LLM extraction failed or timed out. Falling back to dynamic NLP clause extractor:', err);
      }
    }

    return this.getFallbackFeatures(trimmed);
  }

  /**
   * Purely dynamic NLP Feature Extractor parsing clauses directly from the input disclosure text without any keyword checks.
   */
  public getFallbackFeatures(text: string): InventionFeature[] {
    const cleanText = text ? text.trim() : 'System limitation';

    // Dynamic clause splitting by punctuation and technical conjunctions
    const clauses = cleanText
      .split(/[,;\-\.\n]| and | with | using | for | configured to | comprising | including /i)
      .map((c) => c.trim())
      .filter((c) => c.length > 5);

    const features: InventionFeature[] = [];

    clauses.forEach((clause, idx) => {
      features.push({
        id: `F${idx + 1}`,
        text: clause.charAt(0).toUpperCase() + clause.slice(1),
        category: idx % 2 === 0 ? 'component' : 'process',
        importance: Number((0.95 - Math.min(0.3, idx * 0.04)).toFixed(2)),
      });
    });

    if (features.length === 0) {
      features.push({
        id: 'F1',
        text: cleanText,
        category: 'core_invention',
        importance: 0.95,
      });
    }

    return features;
  }
}
