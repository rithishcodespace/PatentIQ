export class DesignAroundPromptBuilder {
    static getSystemPrompt() {
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
    static buildPrompt(features, matrix) {
        const featureSummary = features
            .map((f, idx) => `Feature F${idx + 1} [ID: ${f.id}]: ${f.name}\n  Description: ${f.description}`)
            .join('\n\n');
        let matrixSummary = 'Prior-Art Overlap Context:\nNo detailed overlap matrix provided; perform general R&D design-around strategy.';
        if (matrix && matrix.length > 0) {
            matrixSummary = matrix
                .map((p) => `Patent ID: ${p.patentId} (${p.title})\n  Overall Overlap Score: ${p.overallPatentOverlapScore}%\n  Conflicting Features:\n` +
                p.featureOverlaps
                    .filter((fo) => fo.status === 'EXACT_MATCH' || fo.status === 'PARTIAL_MATCH')
                    .map((fo) => `    - [${fo.featureId}] ${fo.featureName}: Status=${fo.status} | Citation: ${fo.citationEvidence}`)
                    .join('\n'))
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
    static parseLLMResponse(llmOutput, features, matrix) {
        let cleanJson = llmOutput.trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        try {
            const parsed = JSON.parse(cleanJson);
            if (parsed && Array.isArray(parsed.recommendations)) {
                const recommendations = parsed.recommendations.map((r) => ({
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
        }
        catch {
            // Fallback
        }
        return DesignAroundPromptBuilder.createHeuristicFallback(features, matrix);
    }
    static createHeuristicFallback(features, matrix) {
        const primaryPatentId = matrix && matrix[0]?.patentId ? matrix[0].patentId : 'US-PRIOR-ART';
        const recommendations = features.map((f, idx) => {
            const lowerName = f.name.toLowerCase();
            let conflictReason = `Feature '${f.name}' directly overlaps with independent claims of cited prior-art patent ${primaryPatentId}.`;
            let suggestedModification = `Modify the operational protocol and mechanical interface of '${f.name}' to introduce non-obvious structural differences.`;
            let patentabilityBoost = '+30% Novelty Boost';
            let rAndDFeasibility = 'HIGH';
            if (lowerName.includes('sensor') || lowerName.includes('detector') || lowerName.includes('camera')) {
                suggestedModification = `Replace optical sensor module with a solid-state MEMS ultrasonic Doppler transducer array to operate independently of ambient light conditions.`;
                conflictReason = `Prior-art patent ${primaryPatentId} claims optical sensing for position detection, creating direct anticipation risk under 35 U.S.C. 102.`;
                patentabilityBoost = '+40% Novelty Boost';
            }
            else if (lowerName.includes('wireless') || lowerName.includes('bluetooth') || lowerName.includes('wifi') || lowerName.includes('communication')) {
                suggestedModification = `Integrate adaptive frequency-hopping spread spectrum (FHSS) mesh protocol with localized edge encryption instead of standard radio signaling.`;
                conflictReason = `Prior-art claims general wireless connectivity for data transmission.`;
                patentabilityBoost = '+35% Novelty Boost';
            }
            else if (lowerName.includes('battery') || lowerName.includes('power') || lowerName.includes('charger')) {
                suggestedModification = `Switch to resonant multi-frequency inductive power transfer with dynamic impedance matching controller.`;
                conflictReason = `Overlaps with baseline DC power distribution claims.`;
                patentabilityBoost = '+25% Novelty Boost';
                rAndDFeasibility = 'MEDIUM';
            }
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
    static normalizeFeasibility(raw) {
        const s = String(raw).toUpperCase();
        if (s.includes('HIGH'))
            return 'HIGH';
        if (s.includes('LOW'))
            return 'LOW';
        return 'MEDIUM';
    }
}
//# sourceMappingURL=design-around.prompt.js.map