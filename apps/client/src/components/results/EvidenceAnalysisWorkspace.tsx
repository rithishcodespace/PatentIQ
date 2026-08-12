import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Download,
  Loader2,
  Search,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { fetchEvidenceAnalysis, exportAttorneyPdfReport } from '../../services/api';
import type { PatentItem } from './PatentCard';

interface EvidenceAnalysisWorkspaceProps {
  query: string;
  selectedPatentIds: string[];
  availablePatents?: PatentItem[];
}

export const EvidenceAnalysisWorkspace: React.FC<EvidenceAnalysisWorkspaceProps> = ({
  query,
  selectedPatentIds,
  availablePatents = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Target Patent selector
  const [targetPatentId, setTargetPatentId] = useState<string>(() => {
    if (selectedPatentIds.length > 0) return selectedPatentIds[0];
    if (availablePatents.length > 0) return availablePatents[0].patentId;
    return '';
  });

  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const activeIds = targetPatentId ? [targetPatentId] : selectedPatentIds;
        const res = await fetchEvidenceAnalysis({
          query,
          selectedPatentIds: activeIds.length > 0 ? activeIds : undefined,
          strictMode: true,
        });

        if (isMounted) {
          setData(res);
          if (res?.featureEvidenceMatrix?.length > 0) {
            setSelectedFeatureId(res.featureEvidenceMatrix[0].featureId);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to execute evidence analysis');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [query, selectedPatentIds, targetPatentId]);

  const handleExportPdf = async () => {
    if (!data) return;
    setExportingPdf(true);
    try {
      await exportAttorneyPdfReport({
        inventionTitle: query,
        overallRiskLevel: data.evidenceSummary?.overallStatutoryRisk,
        noveltyRiskScore: Math.round((data.evidenceSummary?.confidenceScore || 0.8) * 100),
        executiveRationale: data.statutoryAnalysis?.statutoryBasis,
        featureMatrix: data.featureEvidenceMatrix,
        priorArtCitations: data.featureEvidenceMatrix.flatMap((f: any) => f.citedPatents || []),
        designAround: data.statutoryAnalysis?.recommendations?.map((r: string) => ({ text: r })),
      });
    } catch {
      // Handled inside api.ts
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-2xs font-body">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Analyzing Invention Features & Prior-Art Evidence</h3>
          <p className="text-xs text-slate-500 mt-1">
            Breaking disclosure into technical features and matching supporting evidence from patent references...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3 font-body">
        <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Evidence Analysis Could Not Be Completed</h3>
        <p className="text-xs text-rose-700">{error || 'Unable to retrieve evidence matrix'}</p>
      </div>
    );
  }

  const { evidenceSummary, featureEvidenceMatrix, statutoryAnalysis } = data;
  const activeFeature =
    featureEvidenceMatrix.find((f: any) => f.featureId === selectedFeatureId) ||
    featureEvidenceMatrix[0];

  // Helper for non-expert Status Badges
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'DIRECT_OVERLAP':
      case 'MATCH':
      case 'FULL':
        return {
          label: 'Matching Feature',
          badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotStyle: 'bg-emerald-500',
        };
      case 'PARTIAL_OVERLAP':
      case 'PARTIAL':
        return {
          label: 'Partial Match',
          badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
          dotStyle: 'bg-amber-500',
        };
      default:
        return {
          label: 'Not Found',
          badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200',
          dotStyle: 'bg-slate-400',
        };
    }
  };

  // Helper for non-expert Match Strength
  const getMatchStrength = (score?: number) => {
    const s = score ?? 0.7;
    if (s >= 0.75) return { label: 'High', style: 'text-emerald-700 font-bold' };
    if (s >= 0.45) return { label: 'Medium', style: 'text-amber-700 font-bold' };
    return { label: 'Low', style: 'text-slate-600 font-medium' };
  };

  // Find patent info for active target patent
  const selectedPatentInfo = availablePatents.find(p => p.patentId === targetPatentId) || null;

  return (
    <div className="space-y-6 font-body">
      {/* 1. Top Control Bar & Overview Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                Evidence Analysis Workstation
              </span>

              {/* Patent Selector Dropdown if available */}
              {availablePatents.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 font-medium">Selected Patent:</span>
                  <select
                    value={targetPatentId}
                    onChange={(e) => setTargetPatentId(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    {availablePatents.map((p) => (
                      <option key={p.patentId} value={p.patentId}>
                        {p.publicationNumber || p.patentId} - {p.title ? (p.title.length > 40 ? `${p.title.slice(0, 40)}...` : p.title) : 'Prior Art'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Evidence-Based Prior-Art Analysis
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              PatentIQ breaks your invention into technical features and checks whether prior-art patents contain supporting evidence.
            </p>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Prior-Art Brief (PDF)
          </button>
        </div>

        {/* Selected Patent Details Banner */}
        {selectedPatentInfo && (
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-3xs uppercase">Analyzed Patent Reference</span>
              <span className="font-bold text-slate-900">{selectedPatentInfo.title}</span>
              <span className="font-mono text-slate-500 ml-2">({selectedPatentInfo.patentId})</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>Owner: <strong className="text-slate-800">{selectedPatentInfo.owner || selectedPatentInfo.assignee || 'Undisclosed'}</strong></span>
              <span>Pub Date: <strong className="text-slate-800">{selectedPatentInfo.publicationDate || 'N/A'}</strong></span>
            </div>
          </div>
        )}

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="text-xs font-semibold text-slate-500">Technical Features</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{evidenceSummary?.totalFeaturesAnalyzed || featureEvidenceMatrix.length}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3">
            <div className="text-xs font-semibold text-emerald-700">Matching Features</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{evidenceSummary?.directOverlapCount ?? 0}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
            <div className="text-xs font-semibold text-amber-700">Partial Matches</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">{evidenceSummary?.partialOverlapCount ?? 0}</div>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3">
            <div className="text-xs font-semibold text-indigo-700">Not Found (Unique)</div>
            <div className="text-lg font-bold text-indigo-900 mt-0.5">
              {(evidenceSummary?.totalFeaturesAnalyzed || featureEvidenceMatrix.length) -
                ((evidenceSummary?.directOverlapCount || 0) + (evidenceSummary?.partialOverlapCount || 0))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Technical Features Breakdown & Evidence View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Technical Features Breakdown (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-600" />
              Technical Features ({featureEvidenceMatrix.length})
            </h3>
            <span className="text-[10px] text-slate-400">Click to view evidence</span>
          </div>

          <div className="space-y-2">
            {featureEvidenceMatrix.map((item: any) => {
              const isSelected = item.featureId === activeFeature?.featureId;
              const status = getStatusDisplay(item.status);
              const strength = getMatchStrength(item.confidence);

              return (
                <button
                  key={item.featureId}
                  onClick={() => setSelectedFeatureId(item.featureId)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{item.featureId}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.badgeStyle}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotStyle}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 mt-1.5 truncate">
                    {item.featureName}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100">
                    <span className="truncate max-w-[180px]">{item.description}</span>
                    <span className="shrink-0 text-[10px]">
                      Strength: <strong className={strength.style}>{strength.label}</strong>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Supporting Evidence View (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-5">
          {activeFeature ? (
            <>
              {/* Feature Header Details */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {activeFeature.featureId}
                    </span>
                    {(() => {
                      const status = getStatusDisplay(activeFeature.status);
                      return (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.badgeStyle}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dotStyle}`} />
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{activeFeature.featureName}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{activeFeature.description}</p>
                </div>

                <div className="text-right bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Match Strength</span>
                  <div className={`text-sm font-bold ${getMatchStrength(activeFeature.confidence).style}`}>
                    {getMatchStrength(activeFeature.confidence).label}
                  </div>
                </div>
              </div>

              {/* Why This Patent Matches (Narrative Rationale) */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
                  Why This Patent Matches
                </h4>
                <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                  {activeFeature.citedPatents && activeFeature.citedPatents.length > 0 ? (
                    `The analyzed patent reference directly discloses or covers "${activeFeature.featureName}". The prior-art text below provides verbatim evidence corresponding to this technical feature.`
                  ) : (
                    `No direct matching evidence for "${activeFeature.featureName}" was identified in the evaluated sections of this patent. This indicates this feature may be novel or distinct relative to this document.`
                  )}
                </div>
              </div>

              {/* Supporting Evidence Snippets List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-indigo-600" />
                  Supporting Evidence ({activeFeature.citedPatents?.length || 0})
                </h4>

                {activeFeature.citedPatents && activeFeature.citedPatents.length > 0 ? (
                  activeFeature.citedPatents.map((citation: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700">
                            {citation.patentId}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {citation.claimNumber ? `Claim ${citation.claimNumber}` : citation.section || 'Description'}
                          </span>
                        </div>

                        {citation.sourceUrl && (
                          <a
                            href={citation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Source Document <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="rounded-lg bg-amber-50/40 p-3 border border-amber-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                          Supporting Excerpt:
                        </span>
                        <p className="text-xs font-mono text-slate-900 leading-relaxed italic">
                          "{citation.verbatimSnippet}"
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
                    No supporting evidence snippets found in this patent for this feature.
                  </div>
                )}
              </div>

              {/* Design Strategy / Recommendations */}
              {statutoryAnalysis?.recommendations && statutoryAnalysis.recommendations.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Recommended Next Steps & Technical Focus
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 pl-5 list-disc">
                    {statutoryAnalysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Select a technical feature from the left list to view supporting evidence.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceAnalysisWorkspace;
