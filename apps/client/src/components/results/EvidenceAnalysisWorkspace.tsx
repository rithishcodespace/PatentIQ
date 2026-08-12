import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
  HelpCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchFeatureEvidenceAnalysis, fetchEvidenceAnalysis, exportAttorneyPdfReport } from '../../services/api';
import { TechnicalFeatureSummary } from './TechnicalFeatureSummary';
import type { PatentItem } from './PatentCard';

interface EvidenceAnalysisWorkspaceProps {
  query: string;
  selectedPatentIds: string[];
  availablePatents?: PatentItem[];
}

export interface NormalizedEvidenceItem {
  id: string;
  text: string;
  description?: string;
  status: 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND';
  matchStrength: number;
  evidence: {
    text: string;
    section: 'Claim' | 'Abstract' | 'Description';
    claimNumber?: number | undefined;
    sourceUrl: string;
  } | null;
}

export const EvidenceAnalysisWorkspace: React.FC<EvidenceAnalysisWorkspaceProps> = ({
  query,
  selectedPatentIds,
  availablePatents = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<NormalizedEvidenceItem[]>([]);
  const [patentMetadata, setPatentMetadata] = useState<{
    id: string;
    patentNumber?: string;
    title: string;
    sourceUrl: string;
  } | null>(null);

  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [isEvidenceExpanded, setIsEvidenceExpanded] = useState(false);

  // Target Patent selector state
  const [targetPatentId, setTargetPatentId] = useState<string>(() => {
    if (selectedPatentIds.length > 0) return selectedPatentIds[0];
    if (availablePatents.length > 0) return availablePatents[0].patentId;
    return 'US1001';
  });

  // Find detailed patent info from availablePatents prop
  const activePatentInfo = availablePatents.find(
    (p) => p.patentId === targetPatentId || p.publicationNumber === targetPatentId
  ) || null;

  useEffect(() => {
    let isMounted = true;
    const runAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try direct feature evidence API (/api/analyze)
        try {
          const res = await fetchFeatureEvidenceAnalysis({
            invention: query,
            patentId: targetPatentId,
          });

          if (isMounted && res && res.features) {
            setPatentMetadata(res.patent || {
              id: targetPatentId,
              title: activePatentInfo?.title || `Prior-Art Patent ${targetPatentId}`,
              sourceUrl: `https://patents.google.com/patent/${targetPatentId}/en`,
            });

            const mapped: NormalizedEvidenceItem[] = res.features.map((f: any) => ({
              id: f.id,
              text: f.text,
              description: f.description,
              status: f.status,
              matchStrength: f.matchStrength ?? 0.5,
              evidence: f.evidence
                ? {
                    text: f.evidence.text,
                    section: f.evidence.section || 'Claim',
                    claimNumber: f.evidence.claimNumber,
                    sourceUrl: f.evidence.sourceUrl || `https://patents.google.com/patent/${targetPatentId}/en`,
                  }
                : null,
            }));

            setFeatures(mapped);
            if (mapped.length > 0) {
              setSelectedFeatureId(mapped[0].id);
            }
            return;
          }
        } catch {
          // Fallback to /api/rag/evidence-analysis endpoint
        }

        // Fallback execution path
        const fallbackRes = await fetchEvidenceAnalysis({
          query,
          selectedPatentIds: [targetPatentId],
          strictMode: true,
        });

        if (isMounted && fallbackRes?.featureEvidenceMatrix) {
          setPatentMetadata({
            id: targetPatentId,
            title: activePatentInfo?.title || `Prior-Art Patent ${targetPatentId}`,
            sourceUrl: `https://patents.google.com/patent/${targetPatentId}/en`,
          });

          const mapped: NormalizedEvidenceItem[] = fallbackRes.featureEvidenceMatrix.map((f: any) => {
            let status: 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND' = 'NOT_FOUND';
            if (f.status === 'DIRECT_OVERLAP' || f.status === 'MATCH') status = 'MATCH';
            else if (f.status === 'PARTIAL_OVERLAP' || f.status === 'PARTIAL') status = 'PARTIAL_MATCH';

            const citation = f.citedPatents && f.citedPatents.length > 0 ? f.citedPatents[0] : null;

            return {
              id: f.featureId || f.id,
              text: f.featureName || f.text,
              description: f.description,
              status,
              matchStrength: f.confidence || 0.5,
              evidence: citation
                ? {
                    text: citation.verbatimSnippet,
                    section: (citation.section === 'claims' ? 'Claim' : citation.section) || 'Claim',
                    claimNumber: 1,
                    sourceUrl: citation.sourceUrl || `https://patents.google.com/patent/${targetPatentId}/en`,
                  }
                : null,
            };
          });

          setFeatures(mapped);
          if (mapped.length > 0) {
            setSelectedFeatureId(mapped[0].id);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to execute evidence analysis for selected patent.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    runAnalysis();
    return () => {
      isMounted = false;
    };
  }, [query, targetPatentId, activePatentInfo]);

  const handleExportPdf = async () => {
    if (features.length === 0) return;
    setExportingPdf(true);
    try {
      await exportAttorneyPdfReport({
        inventionTitle: query,
        overallRiskLevel: 'EVIDENCE_ANALYSIS_SUMMARY',
        noveltyRiskScore: 85,
        executiveRationale: `Evidence-based feature analysis comparing invention disclosure against prior-art reference ${targetPatentId}.`,
        featureMatrix: features.map((f) => ({
          featureId: f.id,
          featureName: f.text,
          status: f.status,
          confidence: f.matchStrength,
          citedPatents: f.evidence ? [{ verbatimSnippet: f.evidence.text, patentId: targetPatentId }] : [],
        })),
      });
    } catch {
      // Handled inside api.ts
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center space-y-4 shadow-2xs font-body">
        <Loader2 className="h-7 w-7 text-indigo-600 animate-spin mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900">Deconstructing Technical Features & Inspecting Prior Art</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting feature limitations and searching indexed patent text sections for supporting citations...
          </p>
        </div>
      </div>
    );
  }

  if (error || features.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 font-body">
        <AlertCircle className="h-7 w-7 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Evidence Analysis Could Not Be Loaded</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'No technical features extracted for analysis.'}</p>
        <button
          onClick={() => setTargetPatentId(targetPatentId)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  const activeFeature = features.find((f) => f.id === selectedFeatureId) || features[0];

  const matchCount = features.filter((f) => f.status === 'MATCH').length;
  const partialCount = features.filter((f) => f.status === 'PARTIAL_MATCH').length;
  const notFoundCount = features.filter((f) => f.status === 'NOT_FOUND').length;
  const totalMatched = matchCount + partialCount;

  const getGooglePatentsUrl = (patId: string) => {
    if (patentMetadata?.sourceUrl) return patentMetadata.sourceUrl;
    const cleanId = String(patId).replace(/[^a-zA-Z0-9]/g, '');
    const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
    return `https://patents.google.com/patent/${formattedId}/en`;
  };

  return (
    <div className="space-y-8 font-body max-w-6xl mx-auto">
      {/* ------------------------------------------------------------------ */}
      {/* 1. Header Block: Patent Title & Metadata                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {patentMetadata?.title || activePatentInfo?.title || `Prior-Art Patent Document (${targetPatentId})`}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {targetPatentId}
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Publication Date: <strong className="text-slate-800 font-semibold">{activePatentInfo?.publicationDate || 'N/A'}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <a
                href={getGooglePatentsUrl(targetPatentId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition"
              >
                Source Document
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Controls: Target Patent Selector & Export */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {availablePatents.length > 1 && (
              <select
                value={targetPatentId}
                onChange={(e) => setTargetPatentId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer hover:bg-slate-100 transition shadow-2xs"
              >
                {availablePatents.map((p) => (
                  <option key={p.patentId} value={p.patentId}>
                    {p.publicationNumber || p.patentId} - {p.title ? (p.title.length > 30 ? `${p.title.slice(0, 30)}...` : p.title) : 'Patent'}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
            >
              {exportingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Export Brief (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. Relevance Rationale: Why this patent may be relevant            */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-2 pb-6 border-b border-slate-200">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <HelpCircle className="h-4 w-4 text-indigo-600" />
          Why this patent may be relevant
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl font-normal">
          This prior-art patent document discloses or overlaps with <strong>{totalMatched} of your {features.length} technical features</strong>. 
          {notFoundCount > 0
            ? ` The remaining ${notFoundCount} feature${notFoundCount > 1 ? 's were' : ' was'} not found, highlighting your core technical novelty points.`
            : ' All technical features of your disclosure are covered in this reference.'}
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. Technical Features List & Progressive Evidence View              */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-600" />
            Technical Features
          </h2>
          <span className="text-xs text-slate-400 font-medium">Click a feature to inspect supporting evidence</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
          {/* Left Column: Technical Features Summary */}
          <div className="lg:col-span-5">
            <TechnicalFeatureSummary
              features={features.map((f) => ({
                id: f.id,
                name: f.text,
                description: f.description,
                status: f.status,
                confidence: f.matchStrength,
              }))}
              selectedFeatureId={activeFeature?.id}
              onSelectFeature={(id) => {
                setSelectedFeatureId(id);
                setIsEvidenceExpanded(false);
              }}
            />
          </div>

          {/* Right Column: Supporting Evidence Detail */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5">
            {activeFeature ? (
              <>
                <div className="pb-3 border-b border-slate-100 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Supporting Evidence</span>
                    <span className="font-mono text-indigo-600">{activeFeature.id}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{activeFeature.text}</h3>
                </div>

                {activeFeature.evidence ? (
                  <div className="space-y-4">
                    {/* Collapsible Verbatim Evidence Snippet */}
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                        Evidence Text:
                      </span>
                      <p className="text-xs sm:text-sm font-mono text-slate-900 leading-relaxed italic">
                        "{isEvidenceExpanded || activeFeature.evidence.text.length <= 220
                          ? activeFeature.evidence.text
                          : `${activeFeature.evidence.text.slice(0, 220)}...`}"
                      </p>

                      {activeFeature.evidence.text.length > 220 && (
                        <button
                          onClick={() => setIsEvidenceExpanded(!isEvidenceExpanded)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer pt-1"
                        >
                          {isEvidenceExpanded ? (
                            <>
                              Collapse text <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              Expand text <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Source Indicator & Open Patent Link */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        Source: {activeFeature.evidence.section === 'Claim' && activeFeature.evidence.claimNumber ? `Claim ${activeFeature.evidence.claimNumber}` : activeFeature.evidence.section}
                      </div>

                      <a
                        href={activeFeature.evidence.sourceUrl || getGooglePatentsUrl(targetPatentId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
                      >
                        Open Patent
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-50 p-8 text-center space-y-2 border border-slate-200/80">
                    <XCircle className="h-6 w-6 text-slate-400 mx-auto" />
                    <div className="text-xs font-bold text-slate-700">No Supporting Evidence Found</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      This feature was not found in the evaluated sections of this patent, indicating potential structural novelty for your invention.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a feature from the list to inspect supporting evidence.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 4. Summary Block: Matched count summary                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Summary</span>
          <span className="font-semibold text-slate-900">
            Matched: <strong className="text-emerald-700 font-bold">{totalMatched}</strong> of <strong className="text-slate-900 font-bold">{features.length}</strong> features
          </span>
          <span className="text-xs text-slate-500 ml-2">
            ({matchCount} direct match{matchCount !== 1 ? 'es' : ''}, {partialCount} partial match{partialCount !== 1 ? 'es' : ''})
          </span>
        </div>

        {notFoundCount > 0 && (
          <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200/80">
            {notFoundCount} Unique Feature{notFoundCount > 1 ? 's' : ''} Identified
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceAnalysisWorkspace;
