/**
 * Similarity -> Risk Mapping for PatentIQ Prior-Art Engine
 * High similarity to prior art indicates high novelty risk / statutory conflict under Section 102.
 */
export type RiskLevel = 'high' | 'moderate' | 'low';

export const getSimilarityRisk = (rawScore: number | string = 0.85) => {
  let num = typeof rawScore === 'number' ? rawScore : parseFloat(rawScore) || 0.85;
  // If score is a float <= 1.0 (e.g. 0.85), scale to percentage (85)
  if (num > 0 && num <= 1) {
    num = num * 100;
  }

  const pct = Math.round(num);

  if (pct >= 85) {
    return {
      pct,
      label: 'High Overlap Risk',
      badgeText: 'High Prior-Art Conflict (35 U.S.C. 102)',
      bg: 'bg-rose-50/90 border-rose-200/80',
      text: 'text-rose-700 font-semibold',
      fill: 'bg-rose-500',
    };
  }

  if (pct >= 70) {
    return {
      pct,
      label: 'Moderate Overlap',
      badgeText: 'Moderate Prior-Art Conflict (35 U.S.C. 103)',
      bg: 'bg-amber-50/90 border-amber-200/80',
      text: 'text-amber-800 font-semibold',
      fill: 'bg-amber-500',
    };
  }

  return {
    pct,
    label: 'Low Overlap Risk',
    badgeText: 'High Novelty (Low Prior-Art Overlap)',
    bg: 'bg-emerald-50/90 border-emerald-200/80',
    text: 'text-emerald-800 font-semibold',
    fill: 'bg-emerald-500',
  };
};