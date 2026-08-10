import { motion } from "framer-motion";
import { Card } from "../ui/Card";
import { getSimilarityRisk } from "../../utils/similarityRisk";
import { ExternalLink, Layers, Award } from "lucide-react";

interface ResultCardProps {
  patent: any;
  onView?: (patent: any) => void;
}

const ResultCard = ({ patent, onView }: ResultCardProps) => {
  const patentId = patent.patentId || patent.id;
  const similarityScore = typeof patent.similarityScore === 'number' 
    ? (patent.similarityScore <= 1 ? Math.round(patent.similarityScore * 100) : Math.round(patent.similarityScore))
    : (typeof patent.similarity === 'number' ? patent.similarity : 85);

  const risk = getSimilarityRisk(similarityScore);

  return (
    <Card className="transition-all duration-300 hover:shadow-md hover:border-indigo-200 bg-white rounded-2xl border border-slate-200/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="code-chip bg-slate-100 text-slate-700 font-mono text-[11px]">
              #{patentId}
            </span>
            <span className="code-chip bg-indigo-50 text-indigo-700 font-mono text-[11px]">
              IPC: {patent.ipc || 'G06F 16/90'}
            </span>
            {patent.country && (
              <span className="code-chip bg-slate-50 text-slate-600 text-[10px]">
                {patent.country}
              </span>
            )}
            {patent.owner && (
              <span className="font-body text-[11px] text-slate-500 truncate max-w-[200px]">
                Assignee: {patent.owner}
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-semibold leading-snug text-slate-900 hover:text-indigo-600 transition">
            {patent.title}
          </h3>
        </div>

        <span
          className="shrink-0 rounded-full px-3 py-1 font-mono text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
        >
          {risk.label} ({similarityScore}%)
        </span>
      </div>

      {patent.abstract && (
        <p className="mt-3 font-body text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {patent.abstract}
        </p>
      )}

      {/* Similarity meter */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between font-body text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-indigo-600" />
            Semantic Similarity Match
          </span>
          <span className="font-mono font-semibold text-slate-900">{similarityScore}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${similarityScore}%` }}
            transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
            className="h-2 rounded-full bg-indigo-600"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="font-body text-slate-500 text-[11px] flex items-center gap-1">
          <Layers className="h-3 w-3 text-indigo-600" />
          Candidate Patent ID: <strong className="font-mono text-slate-900">{patentId}</strong>
        </span>
        <button
          onClick={() => onView?.(patent)}
          disabled={!onView}
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 font-body text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 transition shadow-2xs"
        >
          1-Click Claim Inspector
          <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
        </button>
      </div>  
    </Card>
  );
};

export default ResultCard;
