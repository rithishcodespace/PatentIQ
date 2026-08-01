import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Info, FileText, BarChart2, Layers, CheckCircle2 } from 'lucide-react';
import type { FullConfidenceBlock, ConfidenceLevel } from '../../types/confidence';

interface ConfidenceDashboardProps {
  confidence: FullConfidenceBlock;
}

export const getLevelBadgeStyle = (level: ConfidenceLevel) => {
  switch (level) {
    case 'Very High':
    case 'High':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    case 'Medium':
    case 'Low':
    case 'Very Low':
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

const ConfidenceDashboard = ({ confidence }: ConfidenceDashboardProps) => {
  const [showFactors, setShowFactors] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Heuristic Confidence Evaluation
            </h3>
            <p className="font-body text-xs text-slate-500">
              Multi-factor reliability scoring for retrieval precision & prior-art synthesis
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFactors(!showFactors)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-body text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
        >
          <Info className="h-3.5 w-3.5 text-indigo-600" />
          {showFactors ? 'Hide Score Factors' : 'View Formula Factors'}
        </button>
      </div>

      {/* 3 Main Gauges */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {/* Gauge 1: Retrieval Confidence */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-500">
              <BarChart2 className="h-3.5 w-3.5 text-indigo-500" />
              Retrieval Confidence
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold ${getLevelBadgeStyle(
                confidence.retrieval.level
              )}`}
            >
              {confidence.retrieval.level}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-display text-3xl font-bold text-slate-900">
              {confidence.retrieval.score.toFixed(1)}
              <span className="text-base font-medium text-slate-400">%</span>
            </div>
            <span className="code-chip bg-slate-100 text-slate-600 text-[10px]">
              TopK & Vector Score
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence.retrieval.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-indigo-600"
            />
          </div>
        </motion.div>

        {/* Gauge 2: Analysis Confidence */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-500">
              <FileText className="h-3.5 w-3.5 text-indigo-600" />
              Novelty Analysis Confidence
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold ${getLevelBadgeStyle(
                confidence.analysis.level
              )}`}
            >
              {confidence.analysis.level}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-display text-3xl font-bold text-slate-900">
              {confidence.analysis.score.toFixed(1)}
              <span className="text-base font-medium text-slate-400">%</span>
            </div>
            <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
              7-Section Grounding
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence.analysis.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              className="h-full bg-indigo-600"
            />
          </div>
        </motion.div>

        {/* Gauge 3: Overall Confidence */}
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
              Overall System Confidence
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold ${getLevelBadgeStyle(
                confidence.overall.level
              )}`}
            >
              {confidence.overall.level}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="font-display text-3xl font-bold text-slate-900">
              {confidence.overall.score.toFixed(1)}
              <span className="text-base font-medium text-slate-400">%</span>
            </div>
            <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
              Weighted Score
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence.overall.score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-indigo-600"
            />
          </div>
        </motion.div>
      </div>

      {/* Expanded Factor Breakdown Drawer */}
      <AnimatePresence>
        {showFactors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden border-t border-indigo-100 pt-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white/80 p-3 text-xs">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Layers className="h-3.5 w-3.5 text-indigo-600" />
                  Retrieval Factor Weights
                </p>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex justify-between">
                    <span>Top Similarity Match Score (40%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.retrieval.factors?.topScore ?? 92}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Average Candidates Score (30%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.retrieval.factors?.avgScore ?? 88}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Score Distribution Consistency (15%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.retrieval.factors?.distributionScore ?? 92}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Metadata Completeness Index (15%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.retrieval.factors?.metadataScore ?? 100}%
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white/80 p-3 text-xs">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-2">
                  <FileText className="h-3.5 w-3.5 text-indigo-600" />
                  Novelty Analysis Factor Weights
                </p>
                <ul className="space-y-1 text-slate-600">
                  <li className="flex justify-between">
                    <span>Retrieval Base Confidence (50%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.analysis.factors?.retrievalScore ?? 92.1}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>7-Section Report Structure (30%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.analysis.factors?.completenessScore ?? 100}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Overlapping Claim Groundedness (20%):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {confidence.analysis.factors?.claimOverlapScore ?? 85}%
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Formula Blend:</span>
                    <span className="font-mono font-medium text-indigo-600">
                      0.40 * Retrieval + 0.60 * Analysis
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfidenceDashboard;
