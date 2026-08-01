import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  ListOrdered,
  Layers,
  ChevronRight,
} from 'lucide-react';
import type { NoveltyAnalysisData, OverlapAnalysisPayload } from '../../types/rag';

interface CitationReportProps {
  analysis: NoveltyAnalysisData;
  overlapAnalysis: OverlapAnalysisPayload[];
  onSelectPatent?: (patentId: string) => void;
}

export const renderTextWithCitations = (text: string, onSelectPatent?: (patentId: string) => void) => {
  // Regex to match patent citation patterns like [US-10112233-B2] or [EP-99887766-A1]
  const regex = /\[([A-Z]{2}-[\w-]+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const patentId = match[1];
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <button
        key={`${patentId}-${match.index}`}
        onClick={() => onSelectPatent?.(patentId)}
        className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/60 transition"
      >
        <span>{patentId}</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
      </button>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
};

const CitationReport = ({ analysis, overlapAnalysis, onSelectPatent }: CitationReportProps) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'claims' | 'features' | 'risks'>('summary');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-xs font-medium transition ${
            activeTab === 'summary'
              ? 'bg-white text-indigo-600 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          AI Novelty Synthesis
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-xs font-medium transition ${
            activeTab === 'claims'
              ? 'bg-white text-indigo-600 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
          Claim Overlap Matrix ({overlapAnalysis.length})
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-xs font-medium transition ${
            activeTab === 'features'
              ? 'bg-white text-indigo-600 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          Feature Comparison
        </button>

        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-body text-xs font-medium transition ${
            activeTab === 'risks'
              ? 'bg-white text-amber-700 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Prior Art Risks ({analysis.risks.length})
        </button>
      </div>

      {/* Tab Content 1: Executive Novelty Summary & Citation Paragraphs */}
      {activeTab === 'summary' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h4 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900 mb-3">
              <SparklesIcon className="h-4 w-4 text-amber-500" />
              Executive Citation-Aware Novelty Summary
            </h4>
            <div className="font-body text-sm leading-relaxed text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {renderTextWithCitations(analysis.summary, onSelectPatent)}
            </div>

            {/* Novel Aspects List */}
            <div className="mt-6">
              <h5 className="font-body text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3">
                Validated Patentable Novel Aspects
              </h5>
              <div className="grid gap-2.5">
                {analysis.novelAspects.map((aspect, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-emerald-900"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{renderTextWithCitations(aspect, onSelectPatent)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 2: Overlapping Claims Matrix */}
      {activeTab === 'claims' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="mb-4">
              <h4 className="font-display text-base font-semibold text-slate-900">
                Overlapping Claims Breakdown
              </h4>
              <p className="font-body text-xs text-slate-500">
                Claim-level conflict inspection with severity strength rating
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left font-body text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Cited Patent</th>
                    <th className="py-3 px-4">Claim #</th>
                    <th className="py-3 px-4">Overlap Severity</th>
                    <th className="py-3 px-4">Claim Summary</th>
                    <th className="py-3 px-4">Detailed Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overlapAnalysis.flatMap((item) =>
                    item.overlappingClaims.map((claim, idx) => (
                      <tr key={`${item.patentId}-${idx}`} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onSelectPatent?.(item.patentId)}
                            className="font-mono font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {item.patentId}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                          Claim {claim.claimNumber}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 font-semibold text-[10px] ${
                              claim.overlapStrength === 'High'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : claim.overlapStrength === 'Medium'
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {claim.overlapStrength} Overlap
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{claim.summary}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs">{claim.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 3: Feature Comparison */}
      {activeTab === 'features' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h5 className="font-body text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
              Common Technical Features
            </h5>
            <ul className="space-y-2 text-xs text-slate-600">
              {analysis.featureComparison.commonFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
            <h5 className="font-body text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-3">
              Unique Patentable Features
            </h5>
            <ul className="space-y-2 text-xs text-emerald-900 font-medium">
              {analysis.featureComparison.uniqueFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4">
            <h5 className="font-body text-xs font-semibold text-amber-800 uppercase tracking-wider mb-3">
              Partial Overlaps
            </h5>
            <ul className="space-y-2 text-xs text-amber-900">
              {analysis.featureComparison.partialOverlap.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Tab Content 4: Risks & Recommendations */}
      {activeTab === 'risks' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-5">
            <h5 className="flex items-center gap-2 font-display text-sm font-semibold text-rose-900 mb-3">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              Identified Rejection Risks
            </h5>
            <div className="space-y-2.5">
              {analysis.risks.map((risk, idx) => (
                <div key={idx} className="rounded-lg bg-white p-3 text-xs text-rose-950 border border-rose-100 shadow-xs">
                  {renderTextWithCitations(risk, onSelectPatent)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5">
            <h5 className="flex items-center gap-2 font-display text-sm font-semibold text-indigo-900 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Strategic Claim Amendment Advice
            </h5>
            <div className="space-y-2.5">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-lg bg-white p-3 text-xs text-indigo-950 border border-indigo-100 shadow-xs">
                  {renderTextWithCitations(rec, onSelectPatent)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
  </svg>
);

export default CitationReport;
