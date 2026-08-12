import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Download,
  Loader2,
  Search,
} from 'lucide-react';
import { fetchEvidenceAnalysis, exportAttorneyPdfReport } from '../../services/api';

interface EvidenceAnalysisWorkspaceProps {
  query: string;
  selectedPatentIds: string[];
}

export const EvidenceAnalysisWorkspace: React.FC<EvidenceAnalysisWorkspaceProps> = ({
  query,
  selectedPatentIds,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEvidenceAnalysis({
          query,
          selectedPatentIds: selectedPatentIds.length > 0 ? selectedPatentIds : undefined,
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
  }, [query, selectedPatentIds]);

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
      // Export handled defensively inside api.ts
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-2xs font-body">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Executing Evidence-Based Prior-Art Analysis</h3>
          <p className="text-xs text-slate-500 mt-1">
            Extracting feature limitations, verifying verbatim claim text snippets, and auditing 35 U.S.C. 102/103 statutory risks...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center space-y-3 font-body">
        <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
        <h3 className="text-sm font-bold text-rose-900">Evidence Analysis Failed</h3>
        <p className="text-xs text-rose-700">{error || 'Unable to retrieve evidence matrix'}</p>
      </div>
    );
  }

  const { evidenceSummary, featureEvidenceMatrix, statutoryAnalysis } = data;
  const activeFeature =
    featureEvidenceMatrix.find((f: any) => f.featureId === selectedFeatureId) ||
    featureEvidenceMatrix[0];

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH_ANTICIPATION_RISK':
        return {
          label: '35 U.S.C. 102 Anticipation Risk (High)',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <ShieldAlert className="h-4 w-4 text-rose-600" />,
        };
      case 'HIGH_OBVIOUSNESS_RISK':
        return {
          label: '35 U.S.C. 103 Obviousness Risk (High)',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        };
      default:
        return {
          label: 'Low Statutory Rejection Risk',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
        };
    }
  };

  const riskBadge = getRiskBadge(evidenceSummary.overallStatutoryRisk);

  return (
    <div className="space-y-6 font-body">
      {/* 1. Header Card with Statutory Risk & Summary Counters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${riskBadge.bg}`}>
                {riskBadge.icon}
                {riskBadge.label}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Confidence: <strong>{Math.round((evidenceSummary.confidenceScore || 0.8) * 100)}%</strong>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Evidence-Based Prior-Art & Statutory Legal Analysis
            </h2>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Attorney Brief (PDF)
          </button>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
          <strong>Statutory Basis:</strong> {statutoryAnalysis.statutoryBasis}
        </p>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-center">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="text-xs font-semibold text-slate-500">Features Analyzed</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{evidenceSummary.totalFeaturesAnalyzed}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3">
            <div className="text-xs font-semibold text-emerald-700">Direct Overlap</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">{evidenceSummary.directOverlapCount}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3">
            <div className="text-xs font-semibold text-amber-700">Partial Overlap</div>
            <div className="text-lg font-bold text-amber-800 mt-0.5">{evidenceSummary.partialOverlapCount}</div>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-3">
            <div className="text-xs font-semibold text-indigo-700">Evaluated Patents</div>
            <div className="text-lg font-bold text-indigo-900 mt-0.5">{selectedPatentIds.length || 'Top References'}</div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Split-Screen Workstation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Feature Limitations List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 px-1">
            <FileText className="h-4 w-4 text-indigo-600" />
            Disclosure Limitations ({featureEvidenceMatrix.length})
          </h3>

          <div className="space-y-2">
            {featureEvidenceMatrix.map((item: any) => {
              const isSelected = item.featureId === activeFeature?.featureId;
              return (
                <button
                  key={item.featureId}
                  onClick={() => setSelectedFeatureId(item.featureId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{item.featureId}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        item.status === 'DIRECT_OVERLAP'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'PARTIAL_OVERLAP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 truncate">{item.featureName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Verbatim Cited Evidence Snippets (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          {activeFeature ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-600">{activeFeature.featureId}</span>
                  <h3 className="text-base font-bold text-slate-900">{activeFeature.featureName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeFeature.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500">Overlap Confidence</span>
                  <div className="text-sm font-bold text-indigo-700">
                    {Math.round((activeFeature.confidence || 0.5) * 100)}%
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-indigo-600" />
                  Verbatim Prior-Art Snippet Evidence ({activeFeature.citedPatents?.length || 0})
                </h4>

                {activeFeature.citedPatents && activeFeature.citedPatents.length > 0 ? (
                  activeFeature.citedPatents.map((citation: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700">
                            {citation.patentId}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {citation.claimNumber || 'Claim 1'} ({citation.section || 'claims'})
                          </span>
                        </div>
                        {citation.sourceUrl && (
                          <a
                            href={citation.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            View Source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <p className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                        {citation.verbatimSnippet}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500 font-medium">
                    No verbatim overlapping claim snippets detected for this limitation.
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {statutoryAnalysis.recommendations && statutoryAnalysis.recommendations.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Recommended Legal & Engineering Strategy
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-600 pl-5 list-disc">
                    {statutoryAnalysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">Select a feature limitation to inspect evidence.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceAnalysisWorkspace;
