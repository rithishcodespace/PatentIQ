export class ConfidenceCalculatorUtil {
    /**
     * Maps a numeric score (0–100) to a qualitative confidence level.
     * Thresholds:
     * 90-100: Very High
     * 75-89:  High
     * 60-74:  Medium
     * 40-59:  Low
     * 0-39:   Very Low
     */
    static mapScoreToLevel(score) {
        const clamped = Math.max(0, Math.min(100, score));
        if (clamped >= 90)
            return 'Very High';
        if (clamped >= 75)
            return 'High';
        if (clamped >= 60)
            return 'Medium';
        if (clamped >= 40)
            return 'Low';
        return 'Very Low';
    }
    /**
     * Clamps a value between 0 and 100 rounded to 1 decimal place.
     */
    static clampScore(score) {
        if (isNaN(score) || !isFinite(score))
            return 0;
        const clamped = Math.max(0, Math.min(100, score));
        return Math.round(clamped * 10) / 10;
    }
    /**
     * Calculates metadata completeness score (0–100) across retrieved patents.
     */
    static calculateMetadataCompleteness(patents) {
        if (!patents || patents.length === 0)
            return 0;
        let totalFields = 0;
        let filledFields = 0;
        const fieldsToCheck = [
            'patentId',
            'title',
            'abstract',
            'ipc',
            'country',
            'owner',
            'publicationDate',
            'claims',
        ];
        for (const patent of patents) {
            for (const field of fieldsToCheck) {
                totalFields++;
                const val = patent[field];
                if (val !== undefined && val !== null && String(val).trim().length > 0 && String(val).trim() !== 'N/A') {
                    filledFields++;
                }
            }
        }
        return (filledFields / totalFields) * 100;
    }
    /**
     * Evaluates similarity score distribution consistency (0–100).
     * Rewards tight score clustering or clear top-tier separation over random scatter.
     */
    static calculateScoreDistribution(scores) {
        if (!scores || scores.length === 0)
            return 0;
        if (scores.length === 1)
            return 100;
        const topScore = scores[0] ?? 0;
        const lastScore = scores[scores.length - 1] ?? 0;
        const scoreRange = topScore - lastScore;
        // Small drop-off (0.0 - 0.25) implies strong relevance consistency among candidates
        const dropOffPenalty = Math.min(scoreRange * 100, 50);
        return Math.max(0, 100 - dropOffPenalty);
    }
    /**
     * Evaluates section completeness (0–100) of AI-generated 7-section novelty analysis.
     */
    static calculateAnalysisCompleteness(novelty) {
        if (!novelty)
            return 0;
        const insufficientMsg = 'The retrieved patents do not provide sufficient information to determine this.';
        let score = 0;
        const maxSections = 7;
        const pointsPerSection = 100 / maxSections;
        // 1. Summary
        if (novelty.summary && novelty.summary.trim() && !novelty.summary.includes('No analysis generated')) {
            score += pointsPerSection;
        }
        // 2. Similar Patents
        if (novelty.similarPatents && novelty.similarPatents.length > 0) {
            score += pointsPerSection;
        }
        // 3. Feature Comparison
        if (novelty.featureComparison) {
            const fc = novelty.featureComparison;
            const validCommon = (fc.commonFeatures || []).filter((f) => !f.includes(insufficientMsg)).length > 0;
            const validUnique = (fc.uniqueFeatures || []).filter((f) => !f.includes(insufficientMsg)).length > 0;
            if (validCommon || validUnique) {
                score += pointsPerSection;
            }
        }
        // 4. Novel Aspects
        if (novelty.novelAspects && novelty.novelAspects.length > 0) {
            score += pointsPerSection;
        }
        // 5. Overlapping Claims
        if (novelty.overlappingClaims && novelty.overlappingClaims.length > 0) {
            score += pointsPerSection;
        }
        // 6. Risks
        if (novelty.risks && novelty.risks.length > 0) {
            score += pointsPerSection;
        }
        // 7. Recommendations
        if (novelty.recommendations && novelty.recommendations.length > 0) {
            score += pointsPerSection;
        }
        return Math.min(100, score);
    }
}
//# sourceMappingURL=confidence-calculator.util.js.map