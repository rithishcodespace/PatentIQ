import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { fetchFeatureEvidenceAnalysis, fetchEvidenceAnalysis, exportAttorneyPdfReport } from '../../services/api';
import { TechnicalFeatureSummary } from './TechnicalFeatureSummary';
import { SupportingEvidenceCard } from './SupportingEvidenceCard';
import type { PatentItem } from './PatentCard';
import axios from 'axios';

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

// Requirement: Clear progression steps (Analyzing technical features -> Checking selected patent -> Finding supporting evidence -> Preparing comparison)
const PROGRESSION_STEPS = [
  {
    id: 1,
    title: 'Analyzing technical features',
    description: 'Extracting key technical limitations & element claims from invention disclosure',
  },
  {
    id: 2,
    title: 'Checking the selected patent',
    description: 'Scanning claim structure, specification, and abstract of target reference',
  },
  {
    id: 3,
    title: 'Finding supporting evidence',
    description: 'Mapping extracted feature limitations to verbatim patent section snippets',
  },
  {
    id: 4,
    title: 'Preparing the comparison',
    description: 'Synthesizing feature-level overlap matrix & supporting citations',
  },
];

export const EvidenceAnalysisWorkspace: React.FC<EvidenceAnalysisWorkspaceProps> = ({
  query,
  selectedPatentIds,
  availablePatents = [],
}) => {
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCanceled, setIsCanceled] = useState(false);
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

  // Target Patent selector state
  const [targetPatentId, setTargetPatentId] = useState<string>(() => {
    if (selectedPatentIds.length > 0) return selectedPatentIds[0];
    if (availablePatents.length > 0) return availablePatents[0].patentId;
    return 'US1001';
  });

  // Request deduplication & cancellation refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const inProgressKeyRef = useRef<string | null>(null);

  // Find detailed patent info from availablePatents prop
  const activePatentInfo = availablePatents.find(
    (p) => p.patentId === targetPatentId || p.publicationNumber === targetPatentId
  ) || null;

  const runAnalysis = async () => {
    const requestKey = `${query}::${targetPatentId}`;

    // Prevent duplicate analyze requests if identical target request is already active
    if (inProgressKeyRef.current === requestKey && loading) {
      return;
    }

    // Cancel any existing pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    inProgressKeyRef.current = requestKey;

    setLoading(true);
    setIsCanceled(false);
    setError(null);
    setCurrentStep(1);

    // Timed step progression (no fake progress percentages)
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 700);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 1500);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 2300);

    try {
      // First try direct feature evidence API (/api/analyze)
      let res: any = null;
      try {
        res = await fetchFeatureEvidenceAnalysis(
          {
            invention: query,
            patentId: targetPatentId,
          },
          { signal: controller.signal }
        );
      } catch (err: any) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
          throw err;
        }
        // Fallback to /api/rag/evidence-analysis endpoint
      }

      if (res && res.features) {
        setPatentMetadata(
          res.patent || {
            id: targetPatentId,
            title: activePatentInfo?.title || `Prior-Art Patent ${targetPatentId}`,
            sourceUrl: `https://patents.google.com/patent/${targetPatentId}/en`,
          }
        );

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

      // Fallback execution path
      const fallbackRes = await fetchEvidenceAnalysis(
        {
          query,
          selectedPatentIds: [targetPatentId],
          strictMode: true,
        },
        { signal: controller.signal }
      );

      if (fallbackRes?.featureEvidenceMatrix) {
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
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        setIsCanceled(true);
      } else {
        setError(err?.message || 'Failed to execute evidence analysis for selected patent.');
      }
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      inProgressKeyRef.current = null;
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, targetPatentId]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    inProgressKeyRef.current = null;
    setIsCanceled(true);
    setLoading(false);
  };

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

  const getGooglePatentsUrl = (patId: string) => {
    if (patentMetadata?.sourceUrl) return patentMetadata.sourceUrl;
    const cleanId = String(patId).replace(/[^a-zA-Z0-9]/g, '');
    const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
    return `https://patents.google.com/patent/${formattedId}/en`;
  };

  // Requirement: Preserve patent title and basic info while analysis is running
  const currentTitle = patentMetadata?.title || activePatentInfo?.title || `Prior-Art Patent Document (${targetPatentId})`;

  /* -------------------------------------------------------------------------- */
  /* 1. Loading State UI: Progression Stepper + Skeleton UI + Header Preservation */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="space-y-8 font-body max-w-6xl mx-auto">
        {/* Preserved Header Block */}
        <div className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
                  Analyzing Prior Art
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                {currentTitle}
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

            {/* Patent Selector & Cancel Action */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {availablePatents.length > 1 && (
                <select
                  value={targetPatentId}
                  disabled={loading}
                  onChange={(e) => setTargetPatentId(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 opacity-70 cursor-not-allowed"
                >
                  {availablePatents.map((p) => (
                    <option key={p.patentId} value={p.patentId}>
                      {p.publicationNumber || p.patentId} - {p.title ? (p.title.length > 30 ? `${p.title.slice(0, 30)}...` : p.title) : 'Patent'}
                    </option>
                  ))}
                </select>
              )}

              {/* Requirement: Allow user to cancel/back out */}
              <button
                onClick={handleCancel}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer shadow-2xs"
              >
                <XCircle className="h-3.5 w-3.5 text-slate-400" />
                Cancel Analysis
              </button>
            </div>
          </div>
        </div>

        {/* 4-Step Progression Tracker (Analyzing technical features -> Checking patent -> Finding evidence -> Preparing comparison) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Evidence Analysis Progression
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspecting patent claims and matching verbatim evidence snippets
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PROGRESSION_STEPS.map((step) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500/20 shadow-2xs'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-slate-200/70 bg-slate-50/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    {isCompleted ? (
                      <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : isActive ? (
                      <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 text-xs font-bold">
                        {step.id}
                      </div>
                    )}

                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-indigo-950' : isCompleted ? 'text-emerald-950' : 'text-slate-600'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pl-8">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skeleton UI for Technical Features & Evidence Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
          {/* Left Column: Technical Features Summary Skeleton */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-4 w-16 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-3 w-5/6 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Supporting Evidence Card Skeleton */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 animate-pulse">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-5 w-64 bg-slate-200 rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>

              <div className="space-y-3">
                <div className="h-3 w-32 bg-slate-200 rounded" />
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 space-y-2.5">
                  <div className="h-3.5 w-full bg-slate-200 rounded" />
                  <div className="h-3.5 w-11/12 bg-slate-200 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-200 rounded" />
                  <div className="h-3.5 w-2/3 bg-slate-200 rounded" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-28 bg-slate-200 rounded" />
                <div className="h-8 w-28 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 2. Canceled or Error State                                                 */
  /* -------------------------------------------------------------------------- */
  if (isCanceled) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center space-y-4 max-w-xl mx-auto font-body shadow-xs">
        <XCircle className="h-8 w-8 text-slate-400 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Evidence Analysis Canceled</h3>
          <p className="text-xs text-slate-500">
            Analysis for patent document <strong className="text-slate-800 font-semibold">{targetPatentId}</strong> was canceled.
          </p>
        </div>
        <button
          onClick={runAnalysis}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Resume / Retry Analysis
        </button>
      </div>
    );
  }

  if (error || features.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3 font-body max-w-xl mx-auto">
        <AlertCircle className="h-7 w-7 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Evidence Analysis Could Not Be Loaded</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error || 'No technical features extracted for analysis.'}</p>
        <button
          onClick={runAnalysis}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry Analysis
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. Complete Loaded View                                                    */
  /* -------------------------------------------------------------------------- */
  const activeFeature = features.find((f) => f.id === selectedFeatureId) || features[0];

  const matchCount = features.filter((f) => f.status === 'MATCH').length;
  const partialCount = features.filter((f) => f.status === 'PARTIAL_MATCH').length;
  const notFoundCount = features.filter((f) => f.status === 'NOT_FOUND').length;
  const totalMatched = matchCount + partialCount;

  return (
    <div className="space-y-8 font-body max-w-6xl mx-auto">
      {/* Header Block */}
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {currentTitle}
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

      {/* Relevance Rationale */}
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

      {/* Technical Features List & Progressive Evidence View */}
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
              }}
            />
          </div>

          {/* Right Column: Supporting Evidence Detail */}
          <div className="lg:col-span-7">
            <SupportingEvidenceCard
              featureName={activeFeature?.text || 'Selected Feature'}
              status={activeFeature?.status || 'NOT_FOUND'}
              evidence={
                activeFeature?.evidence
                  ? {
                      text: activeFeature.evidence.text,
                      section: activeFeature.evidence.section,
                      claimNumber: activeFeature.evidence.claimNumber,
                      sourceUrl: activeFeature.evidence.sourceUrl || getGooglePatentsUrl(targetPatentId),
                      highlightTerms: activeFeature.text.split(' '),
                    }
                  : null
              }
              patentId={targetPatentId}
            />
          </div>
        </div>
      </div>

      {/* Summary Block */}
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

