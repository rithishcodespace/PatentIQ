/**
 * Similarity → risk mapping.
 *
 * Important: in a prior-art context, HIGH similarity to an existing patent
 * is a warning sign (possible novelty conflict), not a good outcome — so
 * this intentionally does NOT use "green = good, high score" logic.
 */
export type RiskLevel = "high" | "moderate" | "low";

export const getSimilarityRisk = (similarity: number) => {
  if (similarity >= 90) {
    return {
      label: "Very High",
      bg: "bg-green-100",
      text: "text-green-700",
      fill: "bg-green-500",
    };
  }

  if (similarity >= 80) {
    return {
      label: "High",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      fill: "bg-yellow-500",
    };
  }

  if (similarity >= 70) {
    return {
      label: "Moderate",
      bg: "bg-orange-100",
      text: "text-orange-700",
      fill: "bg-orange-500",
    };
  }

  return {
    label: "Low",
    bg: "bg-red-100",
    text: "text-red-700",
    fill: "bg-red-500",
  };
};