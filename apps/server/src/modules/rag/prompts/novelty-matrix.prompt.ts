import type {
  ExtractedFeatureInput,
  NoveltyMatrixResult,
  PatentNoveltyMatrix,
  FeatureOverlapItem,
  FeatureOverlapStatus,
  NoveltyRiskLevel,
} from '../interfaces/novelty-matrix.interface.js';

export class NoveltyMatrixPromptBuilder {
  public static getSystemPrompt(): string {
    return `You are a senior patent attorney and legal-tech AI specialized in 35 U.S.C. 102/103 novelty and non-obviousness evaluations.
Your task is to conduct an element-by-element prior-art overlap analysis comparing extracted invention features against retrieved prior-art patents.

Guidelines:
1. Compare EVERY feature against EVERY prior-art patent.
2. Classify feature overlap status strictly as:
   - EXACT_MATCH: The prior-art explicitly discloses the identical technical limitation.
   - PARTIAL_MATCH: The prior-art discloses a similar or generic alternative serving the same function.
   - NO_MATCH: The prior-art contains no disclosure of this feature limitation.
3. Provide direct citation evidence quoting text snippets from abstract/claims with section/column/paragraph references (e.g. "[Claims 1-3 / Abstract]: '...'").
4. Determine overall Novelty Risk Score (0-100) and Level (LOW_RISK, MODERATE_RISK, HIGH_RISK):
   - HIGH_RISK (70-100): One or more patents contain EXACT_MATCH for all primary/critical features (Anticipation under 35 U.S.C. 102).
   - MODERATE_RISK (40-69): Features are partially matched across multiple patents (Obviousness under 35 U.S.C. 103).
   - LOW_RISK (0-39): Unique/distinct feature combination with mostly NO_MATCH status across prior-art.
5. Provide a clear, plain-English executive rationale explaining why the invention is or isn't novel.

Respond strictly in valid JSON format without markdown preamble or commentary.`;
  }

  public static buildPrompt(
    features: ExtractedFeatureInput[],
    patents: Array<{ patentId: string; title: string; abstract: string; claims?: string | undefined; ipc?: string | undefined; score?: number | undefined }>
  ): string {
    const formattedFeatures = features
      .map((f, idx) => `Feature F${idx + 1} [ID: ${f.id}]: ${f.name}\n  Description: ${f.description}\n  Importance: ${f.importance || 'IMPORTANT'}`)
      .join('\n\n');

    const formattedPatents = patents
      .map(
        (p, idx) =>
          `Patent #${idx + 1} [ID: ${p.patentId}] - ${p.title} (IPC: ${p.ipc || 'N/A'})\n  Abstract: ${p.abstract}\n  Claims: ${p.claims ? p.claims.slice(0, 400) : 'N/A'}`
      )
      .join('\n\n---\n\n');

    return `INVENTION Extracted Technical Features:
${formattedFeatures}

RETRIEVED PRIOR-ART PATENTS:
${formattedPatents}

Please evaluate the element-level overlap matrix and output JSON conforming strictly to this structure:
{
  "overallRiskLevel": "LOW_RISK" | "MODERATE_RISK" | "HIGH_RISK",
  "noveltyRiskScore": 0-100,
  "executiveRationale": "Detailed legal executive rationale...",
  "matrix": [
    {
      "patentId": "string",
      "title": "string",
      "ipc": "string",
      "similarityScore": 0.00-1.00,
      "overallPatentOverlapScore": 0-100,
      "featureOverlaps": [
        {
          "featureId": "string",
          "featureName": "string",
          "featureDescription": "string",
          "status": "EXACT_MATCH" | "PARTIAL_MATCH" | "NO_MATCH",
          "matchConfidence": 0.00-1.00,
          "citationEvidence": "[Section/Claim Reference]: Direct quote snippet",
          "explanation": "Brief legal overlap explanation"
        }
      ]
    }
  ]
}`;
  }

  public static parseLLMResponse(
    llmOutput: string,
    features: ExtractedFeatureInput[],
    patents: Array<{ patentId: string; title: string; abstract: string; claims?: string | undefined; ipc?: string | undefined; score?: number | undefined }>
  ): NoveltyMatrixResult {
    let cleanJson = llmOutput.trim();

    // Strip markdown code fences if present
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.matrix)) {
        return {
          overallRiskLevel: NoveltyMatrixPromptBuilder.normalizeRiskLevel(parsed.overallRiskLevel, parsed.noveltyRiskScore),
          noveltyRiskScore: typeof parsed.noveltyRiskScore === 'number' ? parsed.noveltyRiskScore : 50,
          executiveRationale: parsed.executiveRationale || 'Analysis completed based on feature-by-feature prior art comparison.',
          matrix: parsed.matrix.map((p: any) => ({
            patentId: p.patentId || 'UNKNOWN',
            title: p.title || `Patent ${p.patentId}`,
            ipc: p.ipc || '',
            similarityScore: typeof p.similarityScore === 'number' ? p.similarityScore : 0.8,
            overallPatentOverlapScore: typeof p.overallPatentOverlapScore === 'number' ? p.overallPatentOverlapScore : 50,
            featureOverlaps: Array.isArray(p.featureOverlaps)
              ? p.featureOverlaps.map((fo: any) => ({
                  featureId: fo.featureId || 'F1',
                  featureName: fo.featureName || 'Feature',
                  featureDescription: fo.featureDescription || '',
                  status: NoveltyMatrixPromptBuilder.normalizeStatus(fo.status),
                  matchConfidence: typeof fo.matchConfidence === 'number' ? fo.matchConfidence : 0.5,
                  citationEvidence: fo.citationEvidence || 'No specific snippet cited.',
                  explanation: fo.explanation || 'Overlap assessed.',
                }))
              : [],
          })),
        };
      }
    } catch {
      // Fall through to heuristic fallback
    }

    return NoveltyMatrixPromptBuilder.createHeuristicFallback(features, patents);
  }

  public static createHeuristicFallback(
    features: ExtractedFeatureInput[],
    patents: Array<{ patentId: string; title: string; abstract: string; claims?: string | undefined; ipc?: string | undefined; score?: number | undefined }>
  ): NoveltyMatrixResult {
    let maxExactMatchesInSinglePatent = 0;
    let totalExactMatches = 0;
    let totalPartialMatches = 0;

    const matrix: PatentNoveltyMatrix[] = patents.map((p) => {
      const combinedDocText = `${p.title} ${p.abstract} ${p.claims || ''}`.toLowerCase();
      let patentExactMatches = 0;
      let patentPartialMatches = 0;

      const featureOverlaps: FeatureOverlapItem[] = features.map((f) => {
        const featureTokens = f.name
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 2);
        
        let status: FeatureOverlapStatus = 'NO_MATCH';
        let matchConfidence = 0.1;
        let citationEvidence = `[Abstract]: No matching keywords disclosed for ${f.name}.`;
        let explanation = `Prior art patent ${p.patentId} does not mention ${f.name}.`;

        const exactPhraseMatch = combinedDocText.includes(f.name.toLowerCase());
        const matchingTokensCount = featureTokens.filter((token) => combinedDocText.includes(token)).length;
        const matchRatio = featureTokens.length > 0 ? matchingTokensCount / featureTokens.length : 0;

        if (exactPhraseMatch || matchRatio >= 0.8) {
          status = 'EXACT_MATCH';
          matchConfidence = 0.92;
          patentExactMatches++;
          totalExactMatches++;
          citationEvidence = `[Abstract / Claims]: Explicit disclosure of '${f.name}' in patent ${p.patentId}.`;
          explanation = `Direct element overlap found in prior-art patent disclosures.`;
        } else if (matchRatio >= 0.35) {
          status = 'PARTIAL_MATCH';
          matchConfidence = 0.65;
          patentPartialMatches++;
          totalPartialMatches++;
          citationEvidence = `[Abstract]: Discloses related technical keywords matching ${matchingTokensCount}/${featureTokens.length} terms of '${f.name}'.`;
          explanation = `Partial functionality overlap identified; potential obviousness reference.`;
        }

        return {
          featureId: f.id,
          featureName: f.name,
          featureDescription: f.description,
          status,
          matchConfidence,
          citationEvidence,
          explanation,
        };
      });

      if (patentExactMatches > maxExactMatchesInSinglePatent) {
        maxExactMatchesInSinglePatent = patentExactMatches;
      }

      const totalFeatures = features.length || 1;
      const patentScore = Math.min(100, Math.round(((patentExactMatches * 1.0 + patentPartialMatches * 0.5) / totalFeatures) * 100));

      return {
        patentId: p.patentId,
        title: p.title,
        ipc: p.ipc || 'N/A',
        similarityScore: p.score ?? 0.85,
        overallPatentOverlapScore: patentScore,
        featureOverlaps,
      };
    });

    let overallRiskLevel: NoveltyRiskLevel = 'LOW_RISK';
    let noveltyRiskScore = 25;
    let executiveRationale = 'Low novelty risk identified. The extracted technical feature combination shows strong individual distinction across retrieved prior art.';

    if (maxExactMatchesInSinglePatent >= Math.ceil((features.length || 1) * 0.75)) {
      overallRiskLevel = 'HIGH_RISK';
      noveltyRiskScore = 85;
      executiveRationale = 'High novelty risk (Anticipation Risk under 35 U.S.C. 102). Primary prior-art patent discloses substantially all core technical features.';
    } else if (totalExactMatches > 0 || totalPartialMatches >= features.length) {
      overallRiskLevel = 'MODERATE_RISK';
      noveltyRiskScore = 55;
      executiveRationale = 'Moderate novelty risk (Obviousness Risk under 35 U.S.C. 103). Multiple prior-art patents disclose individual sub-features that could be combined by one skilled in the art.';
    }

    return {
      overallRiskLevel,
      noveltyRiskScore,
      executiveRationale,
      matrix,
    };
  }

  private static normalizeStatus(raw: any): FeatureOverlapStatus {
    const s = String(raw).toUpperCase();
    if (s.includes('EXACT')) return 'EXACT_MATCH';
    if (s.includes('PARTIAL')) return 'PARTIAL_MATCH';
    return 'NO_MATCH';
  }

  private static normalizeRiskLevel(raw: any, score?: number): NoveltyRiskLevel {
    const r = String(raw).toUpperCase();
    if (r.includes('HIGH')) return 'HIGH_RISK';
    if (r.includes('MODERATE') || r.includes('MEDIUM')) return 'MODERATE_RISK';
    if (r.includes('LOW')) return 'LOW_RISK';
    if (typeof score === 'number') {
      if (score >= 70) return 'HIGH_RISK';
      if (score >= 40) return 'MODERATE_RISK';
    }
    return 'LOW_RISK';
  }
}
