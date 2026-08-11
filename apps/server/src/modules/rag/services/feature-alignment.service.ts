import type { InventionFeature } from './feature-extractor.service.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';

export type FeatureOverlapStatus = 'DIRECT_OVERLAP' | 'PARTIAL_OVERLAP' | 'NOVEL' | 'UNKNOWN';

export interface FeatureOverlapItem {
  featureId: string;
  featureName: string;
  featureDescription: string;
  status: FeatureOverlapStatus;
  matchConfidence: number;
  citationEvidence: string;
  explanation: string;
}

export interface PatentFeatureAlignment {
  patentId: string;
  title: string;
  ipc: string;
  similarityScore: number;
  overallPatentOverlapScore: number;
  weightedCoverage: number;
  featureCoverage: {
    direct: number;
    partial: number;
    novel: number;
    unknown: number;
  };
  featureOverlaps: FeatureOverlapItem[];
}

export class FeatureAlignmentService {
  constructor(private readonly llmProvider?: ILLMProvider | undefined) {}

  /**
   * Aligns extracted invention features against retrieved prior-art candidate patents using LLM analysis and real text extraction.
   */
  async alignFeaturesWithPatents(
    features: InventionFeature[],
    candidatePatents: Array<{ patentId: string; title: string; abstract?: string; claims?: string; ipc?: string; score?: number }>
  ): Promise<PatentFeatureAlignment[]> {
    if (!candidatePatents || candidatePatents.length === 0 || !features || features.length === 0) {
      return [];
    }

    const alignments: PatentFeatureAlignment[] = [];

    for (const patent of candidatePatents) {
      let featureOverlaps: FeatureOverlapItem[] = [];

      if (this.llmProvider) {
        try {
          const prompt = `Perform feature-by-feature prior art claim comparison under 35 U.S.C. 102/103.

Target Prior Art Patent #${patent.patentId}:
Title: "${patent.title || 'Prior Art Patent'}"
Abstract: "${patent.abstract || 'N/A'}"
Claims: "${patent.claims || 'N/A'}"

Invention Claim Features:
${features.map((f) => `- [${f.id}]: ${f.text} (Category: ${f.category}, Importance: ${f.importance})`).join('\n')}

For EVERY feature listed above, classify its overlap against the patent abstract/claims:
- "DIRECT_OVERLAP": The patent explicitly recites the identical technical feature.
- "PARTIAL_OVERLAP": The patent recites a related mechanism establishing obviousness risk.
- "NOVEL": The patent does not disclose or teach this feature.
- "UNKNOWN": Insufficient patent text to determine alignment.

IMPORTANT: The "citationEvidence" MUST contain a direct quote or passage from the target patent's Title, Abstract, or Claims above. If status is NOVEL, set citationEvidence to "[Reference Disclosure]: No equivalent feature recited in target reference."

Respond ONLY with a JSON array:
[
  {
    "featureId": "F1",
    "status": "DIRECT_OVERLAP",
    "matchConfidence": 0.9,
    "citationEvidence": "[Claims]: Direct quote from text above",
    "explanation": "Technical reasoning"
  }
]
No preamble, no markdown.`;

          const response = await this.llmProvider.generateCompletion(prompt, {
            temperature: 0.1,
            systemPrompt: 'You are a USPTO Patent Examiner conducting strict claim limitation comparisons based exclusively on provided patent text.',
          });

          const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const parsedMap = new Map(parsed.map((p) => [p.featureId, p]));

            featureOverlaps = features.map((feat) => {
              const matched = parsedMap.get(feat.id);
              const status: FeatureOverlapStatus = matched?.status && ['DIRECT_OVERLAP', 'PARTIAL_OVERLAP', 'NOVEL', 'UNKNOWN'].includes(matched.status)
                ? matched.status
                : 'NOVEL';

              return {
                featureId: feat.id,
                featureName: feat.text,
                featureDescription: `Category: ${feat.category} (Importance: ${feat.importance})`,
                status,
                matchConfidence: typeof matched?.matchConfidence === 'number' ? Math.min(1.0, Math.max(0.1, matched.matchConfidence)) : (status === 'NOVEL' ? 0.85 : 0.75),
                citationEvidence: matched?.citationEvidence || (status === 'NOVEL' ? '[Reference Disclosure]: No equivalent feature recited in target reference.' : `[Abstract]: ${patent.title}`),
                explanation: matched?.explanation || `Feature ${feat.id} evaluated under 35 U.S.C. 102/103.`,
              };
            });
          }
        } catch (err) {
          console.warn(`[FeatureAlignmentService] LLM alignment failed for patent #${patent.patentId}, falling back to dynamic text match:`, err);
        }
      }

      // Dynamic text matching fallback if LLM omitted or failed
      if (featureOverlaps.length === 0) {
        featureOverlaps = this.alignFeaturesDeterministic(features, patent);
      }

      // Calculate weighted patent overlap score and breakdown
      let totalWeightedMatch = 0;
      let totalImportance = 0;
      let directCount = 0;
      let partialCount = 0;
      let novelCount = 0;
      let unknownCount = 0;

      featureOverlaps.forEach((fo) => {
        const featObj = features.find((f) => f.id === fo.featureId);
        const weight = featObj?.importance ?? 0.8;
        totalImportance += weight;

        if (fo.status === 'DIRECT_OVERLAP') {
          totalWeightedMatch += weight * 1.0;
          directCount++;
        } else if (fo.status === 'PARTIAL_OVERLAP') {
          totalWeightedMatch += weight * 0.5;
          partialCount++;
        } else if (fo.status === 'NOVEL') {
          novelCount++;
        } else {
          unknownCount++;
        }
      });

      const weightedCoverage = totalImportance > 0 ? Math.round((totalWeightedMatch / totalImportance) * 100) : 0;
      const overallPatentOverlapScore = weightedCoverage;

      alignments.push({
        patentId: patent.patentId,
        title: patent.title,
        ipc: patent.ipc || 'G06F',
        similarityScore: patent.score ?? 0.5,
        overallPatentOverlapScore,
        weightedCoverage,
        featureCoverage: {
          direct: directCount,
          partial: partialCount,
          novel: novelCount,
          unknown: unknownCount,
        },
        featureOverlaps,
      });
    }

    return alignments;
  }

  /**
   * Deterministic fallback matching extracting verbatim passages from patent text.
   */
  private alignFeaturesDeterministic(
    features: InventionFeature[],
    patent: { patentId: string; title: string; abstract?: string; claims?: string; ipc?: string }
  ): FeatureOverlapItem[] {
    const fullText = `${patent.title || ''}. ${patent.abstract || ''}. ${patent.claims || ''}`;
    const sentences = fullText.split(/(?<=[.!?])\s+/).filter((s) => s.length > 10);

    return features.map((feat) => {
      const keywords = feat.text.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      
      // Find sentence in actual patent text with highest keyword overlap
      let bestSentence = '';
      let maxMatches = 0;

      sentences.forEach((sentence) => {
        const lowerSent = sentence.toLowerCase();
        let matches = 0;
        keywords.forEach((kw) => {
          if (lowerSent.includes(kw)) matches++;
        });
        if (matches > maxMatches) {
          maxMatches = matches;
          bestSentence = sentence;
        }
      });

      const matchRatio = keywords.length > 0 ? maxMatches / keywords.length : 0;
      let status: FeatureOverlapStatus = 'NOVEL';
      let citationEvidence = '[Reference Disclosure]: No equivalent feature recited in target reference.';
      let explanation = 'Distinct technical feature establishing novelty under 35 U.S.C. 102.';
      let matchConfidence = 0.85;

      if (matchRatio >= 0.6) {
        status = 'DIRECT_OVERLAP';
        citationEvidence = bestSentence ? `[Patent Snippet]: "${bestSentence.trim()}"` : `[Abstract]: Reference recites ${feat.text}.`;
        explanation = `Direct claim limitation overlap identified in cited patent text.`;
        matchConfidence = Number(Math.min(0.95, Math.max(0.70, matchRatio)).toFixed(2));
      } else if (matchRatio >= 0.3) {
        status = 'PARTIAL_OVERLAP';
        citationEvidence = bestSentence ? `[Description Snippet]: "${bestSentence.trim()}"` : `[Abstract]: Related disclosure matching key terms.`;
        explanation = `Partial technical overlap indicating obviousness risk under 35 U.S.C. 103.`;
        matchConfidence = Number(Math.min(0.85, Math.max(0.50, matchRatio)).toFixed(2));
      }

      return {
        featureId: feat.id,
        featureName: feat.text,
        featureDescription: `Category: ${feat.category} (Importance: ${feat.importance})`,
        status,
        matchConfidence,
        citationEvidence,
        explanation,
      };
    });
  }
}
