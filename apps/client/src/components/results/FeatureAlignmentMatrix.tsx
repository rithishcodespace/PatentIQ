import React from 'react';
import { FileText, CheckCircle2, AlertTriangle, XCircle, Search, ExternalLink, Quote } from 'lucide-react';

export interface FeatureOverlapItem {
  featureId: string;
  featureName: string;
  featureDescription?: string;
  status: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'NO_MATCH' | string;
  matchConfidence?: number;
  citationEvidence?: string;
  explanation?: string;
}

export interface PatentNoveltyMatrixItem {
  patentId: string;
  title: string;
  ipc?: string;
  similarityScore?: number;
  overallPatentOverlapScore?: number;
  featureOverlaps: FeatureOverlapItem[];
}

const getGooglePatentsUrl = (id: string | number): string => {
  if (!id) return 'https://patents.google.com';
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
  return `https://patents.google.com/patent/${formattedId}/en`;
};

interface FeatureAlignmentMatrixProps {
  matrix?: PatentNoveltyMatrixItem[];
  onSelectPatent?: (patentId: string) => void;
}

export const FeatureAlignmentMatrix: React.FC<FeatureAlignmentMatrixProps> = ({
  matrix = [],
  onSelectPatent: _onSelectPatent,
}) => {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 font-body">
        <Search className="h-8 w-8 text-indigo-500 mx-auto" />
        <h3 className="font-display text-base font-bold text-slate-900">Feature Alignment Matrix Ready</h3>
        <p className="font-body text-xs text-slate-500 max-w-md mx-auto">
          No direct feature conflicts detected against the retrieved prior art dataset. Your extracted invention features exhibit strong standalone novelty.
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    if (s.includes('EXACT')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          Direct Conflict (Exact Match)
        </span>
      );
    }
    if (s.includes('PARTIAL')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          Partial Overlap
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        Novel (No Overlap)
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Element-Level Feature Alignment & Prior-Art Overlap Matrix
          </h3>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            Feature-by-feature comparison mapping your extracted invention limitations against cited prior-art disclosures
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Green = Novel
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Amber = Partial
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Red = Direct Conflict
          </span>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="space-y-6">
        {matrix.map((patentItem) => (
          <div key={patentItem.patentId} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden space-y-3">
            {/* Patent Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100/80 px-4 py-3 border-b border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={getGooglePatentsUrl(patentItem.patentId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-indigo-600 hover:underline hover:text-indigo-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs"
                >
                  #{patentItem.patentId}
                  <ExternalLink className="h-3 w-3 text-indigo-600" />
                </a>
                <span className="font-semibold text-slate-900 truncate max-w-md">
                  {patentItem.title}
                </span>
                {patentItem.ipc && (
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    IPC: {patentItem.ipc}
                  </span>
                )}
              </div>

              {typeof patentItem.overallPatentOverlapScore === 'number' && (
                <span className="font-mono text-[11px] font-semibold text-slate-700">
                  Patent Overlap Score: <span className="font-bold text-rose-700">{patentItem.overallPatentOverlapScore}%</span>
                </span>
              )}
            </div>

            {/* Overlap Feature Rows Table */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3 font-semibold w-1/4">Invention Feature</th>
                    <th className="py-2 px-3 font-semibold w-1/4">Overlap Status</th>
                    <th className="py-2 px-3 font-semibold w-1/2">Cited Prior-Art Citation Evidence & Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80">
                  {patentItem.featureOverlaps.map((fo) => (
                    <tr key={fo.featureId} className="hover:bg-white transition">
                      {/* Feature Name & Description */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {fo.featureId}
                          </span>
                          {fo.featureName}
                        </div>
                        {fo.featureDescription && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                            {fo.featureDescription}
                          </p>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 align-top">
                        {renderStatusBadge(fo.status)}
                        {typeof fo.matchConfidence === 'number' && (
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            Confidence: {Math.round(fo.matchConfidence * 100)}%
                          </div>
                        )}
                      </td>

                      {/* Citation Evidence & Explanation */}
                      <td className="py-3 px-3 align-top space-y-1.5">
                        {fo.citationEvidence && (
                          <div className="flex items-start gap-1.5 text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono leading-relaxed">
                            <Quote className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span>{fo.citationEvidence}</span>
                          </div>
                        )}
                        {fo.explanation && (
                          <p className="text-[11px] text-slate-600 font-normal">
                            <span className="font-semibold text-slate-800">Legal Note:</span> {fo.explanation}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureAlignmentMatrix;
