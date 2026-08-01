import { getSimilarityRisk } from "../../utils/similarityRisk";

type SimilarityBadgeProps = {
  score: number;
};

export function SimilarityBadge({ score }: SimilarityBadgeProps) {
  const risk = getSimilarityRisk(score);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold ${risk.bg} ${risk.text}`}
    >
      {Math.round(score)}%
      <span className="opacity-70">· {risk.label}</span>
    </span>
  );
}
