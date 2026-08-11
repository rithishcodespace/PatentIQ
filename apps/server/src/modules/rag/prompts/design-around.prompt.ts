import type {
  DesignAroundResult,
  DesignAroundRecommendation,
  RandDFeasibility,
} from '../interfaces/design-around.interface.js';
import type { ExtractedFeatureInput, PatentNoveltyMatrix } from '../interfaces/novelty-matrix.interface.js';

export class DesignAroundPromptBuilder {
  public static getSystemPrompt(): string {
    return `You are a chief R&D engineer and senior patent attorney specializing in legal-tech design-around strategy.
Your task is to analyze an MSME's invention disclosure against conflicting prior-art patents and generate actionable, concrete engineering design-around recommendations.

Guidelines:
1. For every feature with prior-art overlap or conflict, provide:
   - conflictReason: Plain-English explanation of why this feature infringes/overlaps with prior-art claims.
   - suggestedModification: Concrete engineering tweak (e.g., "Replace optical flow sensor with ultrasonic Doppler transducer to eliminate optical calibration requirements").
   - patentabilityBoost: Estimated percentage boost in claim novelty (e.g., "+35% Novelty Increase").
   - rAndDFeasibility: HIGH | MEDIUM | LOW based on technical implementation complexity for MSMEs.
   - targetPriorArtId: ID of conflicting prior-art patent (e.g. "US-10112233-B2").
2. Provide an executive overallStrategy summarizing how to pivot the invention for maximum patentability and Freedom to Operate (FTO).

Output MUST be strictly valid JSON without markdown preamble.`;
  }

  public static buildPrompt(
    features: ExtractedFeatureInput[],
    matrix?: PatentNoveltyMatrix[] | undefined
  ): string {
    const featureSummary = features
      .map((f, idx) => `Feature F${idx + 1} [ID: ${f.id}]: ${f.name}\n  Description: ${f.description}`)
      .join('\n\n');

    let matrixSummary = 'Prior-Art Overlap Context:\nNo detailed overlap matrix provided; perform general R&D design-around strategy.';
    if (matrix && matrix.length > 0) {
      matrixSummary = matrix
        .map(
          (p) =>
            `Patent ID: ${p.patentId} (${p.title})\n  Overall Overlap Score: ${p.overallPatentOverlapScore}%\n  Conflicting Features:\n` +
            p.featureOverlaps
              .filter((fo) => fo.status === 'DIRECT_OVERLAP' || fo.status === 'PARTIAL_OVERLAP' || fo.status === 'EXACT_MATCH' || fo.status === 'PARTIAL_MATCH')
              .map((fo) => `    - [${fo.featureId}] ${fo.featureName}: Status=${fo.status} | Evidence Quote: ${fo.citationEvidence}`)
              .join('\n')
        )
        .join('\n\n---\n\n');
    }

    return `INVENTION FEATURES:
${featureSummary}

PRIOR-ART CONFLICT CONTEXT:
${matrixSummary}

Output JSON format strictly conforming to:
{
  "overallStrategy": "Executive summary design-around strategy...",
  "recommendations": [
    {
      "featureId": "string",
      "featureName": "string",
      "conflictReason": "Plain-English conflict explanation...",
      "suggestedModification": "Concrete engineering tweak...",
      "patentabilityBoost": "+X% Novelty Increase",
      "rAndDFeasibility": "HIGH" | "MEDIUM" | "LOW",
      "targetPriorArtId": "Patent ID"
    }
  ]
}`;
  }

  public static parseLLMResponse(
    llmOutput: string,
    features: ExtractedFeatureInput[],
    matrix?: PatentNoveltyMatrix[] | undefined
  ): DesignAroundResult {
    let cleanJson = llmOutput.trim();

    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.recommendations)) {
        const recommendations: DesignAroundRecommendation[] = parsed.recommendations.map((r: any) => ({
          featureId: r.featureId || 'F1',
          featureName: r.featureName || 'Extracted Feature',
          conflictReason: r.conflictReason || 'Prior-art overlap detected in claims.',
          suggestedModification: r.suggestedModification || 'Modify component parameters or operational protocol.',
          patentabilityBoost: r.patentabilityBoost || '+25% Novelty Increase',
          rAndDFeasibility: DesignAroundPromptBuilder.normalizeFeasibility(r.rAndDFeasibility),
          targetPriorArtId: r.targetPriorArtId || (matrix && matrix[0]?.patentId ? matrix[0].patentId : 'PRIOR-ART-1'),
        }));

        return {
          overallStrategy: parsed.overallStrategy || 'Adopt concrete component modifications to differentiate claims from cited prior art.',
          totalRecommendationsCount: recommendations.length,
          recommendations,
        };
      }
    } catch {
      // Fallback
    }

    return DesignAroundPromptBuilder.createHeuristicFallback(features, matrix);
  }

  public static createHeuristicFallback(
    features: ExtractedFeatureInput[],
    matrix?: PatentNoveltyMatrix[] | undefined
  ): DesignAroundResult {
    const primaryPatentId = matrix && matrix[0]?.patentId ? matrix[0].patentId : 'US-PRIOR-ART';

    const recommendations: DesignAroundRecommendation[] = features.map((f, idx) => {
      const conflictReason = `Feature '${f.name}' exhibits technical overlap with cited prior-art patent #${primaryPatentId}.`;
      const suggestedModification = `Re-architect implementation of '${f.name}' to introduce dynamic parameters, localized processing, or distinct operational control loops over cited disclosure.`;
      const patentabilityBoost = '+30% Novelty Boost';
      const rAndDFeasibility: RandDFeasibility = 'HIGH';

      return {
        featureId: f.id || `F${idx + 1}`,
        featureName: f.name,
        conflictReason,
        suggestedModification,
        patentabilityBoost,
        rAndDFeasibility,
        targetPriorArtId: primaryPatentId,
      };
    });

    return {
      overallStrategy: 'Pivot core architectural components toward specialized solid-state hardware and dynamic control protocols to establish clear novelty and non-obviousness over cited prior art.',
      totalRecommendationsCount: recommendations.length,
      recommendations,
    };
  }

  private static normalizeFeasibility(raw: any): RandDFeasibility {
    const s = String(raw).toUpperCase();
    if (s.includes('HIGH')) return 'HIGH';
    if (s.includes('LOW')) return 'LOW';
    return 'MEDIUM';
  }
}
