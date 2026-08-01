import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { getSimilarityRisk } from "../../utils/similarityRisk";

interface ResultCardProps {
  patent: {
    id: number;
    title: string;
    similarity: number;
    ipc: string;
  };
  onView?: (patent: ResultCardProps["patent"]) => void;
}

const ResultCard = ({ patent, onView }: ResultCardProps) => {
  const risk = getSimilarityRisk(patent.similarity);

  return (
    <Card className="transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(11,17,32,0.06),0_20px_40px_-16px_rgba(11,17,32,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold leading-snug text-ink">
            {patent.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="code-chip">#{patent.id}</span>
            <span className="code-chip">{patent.ipc}</span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs font-semibold ${risk.bg} ${risk.text}`}
        >
          {risk.label}
        </span>
      </div>

      {/* Similarity meter */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between font-body text-sm text-slate">
          <span>Semantic similarity</span>
          <span className="font-mono text-ink">{patent.similarity}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${patent.similarity}%` }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className={`h-2 rounded-full ${risk.fill}`}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
  <button
    onClick={() => onView?.(patent)}
    disabled={!onView}
    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition-all duration-200 transform hover:scale-105 hover:gap-2 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:scale-100"
  >
    View Details
    <span className="text-base">{">>"}</span>
  </button>
</div>  
    </Card>
  );
};

export default ResultCard;
