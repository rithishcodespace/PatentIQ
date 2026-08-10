import { motion } from 'framer-motion';
import { ShieldCheck, Zap } from 'lucide-react';

interface NoveltyDialProps {
  noveltyScore?: number;
  obviousnessScore?: number;
  overlapScore?: number;
  riskLevel?: string;
  summary?: string;
}

export const NoveltyDial = ({
  noveltyScore = 0.82,
  overlapScore = 15,
  riskLevel = 'Low',
}: NoveltyDialProps) => {
  // Convert novelty score (0-1 float or 0-100 percentage) to percentage
  const pct = Math.round(noveltyScore <= 1 ? noveltyScore * 100 : noveltyScore);

  // SVG Semi-Circle Arc Calculation (r = 70, stroke-dasharray = Math.PI * 70 ≈ 220)
  const radius = 70;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const getDialColor = (score: number) => {
    if (score >= 80) return { stroke: '#4f46e5', text: 'text-indigo-600', label: 'High Novelty' };
    if (score >= 60) return { stroke: '#d97706', text: 'text-amber-600', label: 'Moderate Novelty' };
    return { stroke: '#e11d48', text: 'text-rose-600', label: 'Low Novelty' };
  };

  const dialTheme = getDialColor(pct);

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center font-body">
      {/* SVG Semi-Circle Radial Gauge */}
      <div className="relative flex items-center justify-center w-52 h-28 overflow-hidden">
        <svg className="w-52 h-52 -rotate-180 transform" viewBox="0 0 160 160">
          {/* Background Arc */}
          <path
            d="M 10,80 A 70,70 0 0,1 150,80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Active Animated Arc */}
          <motion.path
            d="M 10,80 A 70,70 0 0,1 150,80"
            fill="none"
            stroke={dialTheme.stroke}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute top-10 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`font-display text-4xl font-extrabold ${dialTheme.text}`}
          >
            {pct}%
          </motion.span>
          <span className="font-body text-[11px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
            Novelty Score
          </span>
        </div>
      </div>

      {/* Sub-Metric Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <div className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 border border-indigo-200/80">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
          <span>{dialTheme.label}</span>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 border border-slate-200/80">
          <Zap className="h-3.5 w-3.5 text-slate-500" />
          <span>{overlapScore}% Prior-Art Overlap ({riskLevel} Risk)</span>
        </div>
      </div>
    </div>
  );
};

export default NoveltyDial;
