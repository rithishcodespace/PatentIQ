import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
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

export interface UserFriendlyError {
  title: string;
  message: string;
  type: 'PATENT_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'NO_EVIDENCE' | 'TIMEOUT' | 'INVALID_PATENT' | 'NETWORK' | 'UNKNOWN';
}

export function classifyEvidenceError(error: any): UserFriendlyError {
  // Technical error details logged exclusively to developer console
  console.error('[PatentIQ Developer Log - Evidence Analysis Failure Detail]:', error);

  const rawMessage = String(
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    ''
  ).toLowerCase();
  const status = error?.response?.status;
  const code = error?.code;

  // 1. Invalid patent identifier or malformed request parameters
  if (
    status === 400 ||
    rawMessage.includes('invalid patent') ||
    rawMessage.includes('malformed') ||
    rawMessage.includes('bad request')
  ) {
    return {
      type: 'INVALID_PATENT',
      title: "We couldn't analyze this patent right now.",
      message: 'The selected patent identifier appears to be invalid or formatted incorrectly.',
    };
  }

  // 2. Requested patent document unavailable in index
  if (
    status === 404 ||
    rawMessage.includes('not found') ||
    rawMessage.includes('unavailable in index')
  ) {
    return {
      type: 'PATENT_UNAVAILABLE',
      title: "We couldn't analyze this patent right now.",
      message: 'The requested patent document is currently unavailable in the index.',
    };
  }

  // 3. Network or request timeout
  if (
    code === 'ECONNABORTED' ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('timed out')
  ) {
    return {
      type: 'TIMEOUT',
      title: "We couldn't analyze this patent right now.",
      message: 'The analysis request took longer than expected to complete. Please try again.',
    };
  }

  // 4. Network connection failure or server unreachable
  if (
    code === 'ERR_NETWORK' ||
    code === 'ECONNREFUSED' ||
    rawMessage.includes('network error') ||
    rawMessage.includes('econnrefused') ||
    rawMessage.includes('failed to fetch')
  ) {
    return {
      type: 'NETWORK',
      title: "We couldn't analyze this patent right now.",
      message: 'Network connectivity was interrupted during the analysis request. Please try again.',
    };
  }

  // 5. Backend analysis service, vector database, or embedding failure
  if (
    (status && status >= 500) ||
    rawMessage.includes('pinecone') ||
    rawMessage.includes('embedding') ||
    rawMessage.includes('ollama') ||
    rawMessage.includes('500') ||
    rawMessage.includes('internal server error') ||
    rawMessage.includes('service')
  ) {
    return {
      type: 'SERVICE_UNAVAILABLE',
      title: "We couldn't analyze this patent right now.",
      message: 'The AI analysis service is temporarily busy. Please try again in a few moments.',
    };
  }

  // Default fallback user-friendly message
  return {
    type: 'UNKNOWN',
    title: "We couldn't analyze this patent right now.",
    message: 'An unexpected issue occurred while analyzing feature evidence. Please try again.',
  };
}

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
  const [errorState, setErrorState] = useState<UserFriendlyError | null>(null);
  const [isPartial, setIsPartial] = useState(false);
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

  // Automatically sync targetPatentId when selectedPatentIds prop changes from user action
  useEffect(() => {
    if (selectedPatentIds.length > 0 && selectedPatentIds[0] !== targetPatentId) {
      setTargetPatentId(selectedPatentIds[0]);
    }
  }, [selectedPatentIds]);

  // Request deduplication & cancellation refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const inProgressKeyRef = useRef<string | null>(null);
  const userCanceledRef = useRef<boolean>(false);

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
    userCanceledRef.current = false;

    setLoading(true);
    setIsCanceled(false);
    setErrorState(null);
    setIsPartial(false);
    setCurrentStep(1);

    // Timed step progression
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
        console.error('[PatentIQ Developer Log - Primary /api/analyze Endpoint Error]:', err);
        // Fallback to /api/rag/evidence-analysis endpoint
      }

      if (res && res.features && res.features.length > 0) {
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
        setErrorState(null);
        setIsPartial(false);
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

      if (fallbackRes?.featureEvidenceMatrix && fallbackRes.featureEvidenceMatrix.length > 0) {
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
        setErrorState(null);
        setIsPartial(false);
        return;
      }

      // 3. Evidence could not be found failure state
      setErrorState({
        type: 'NO_EVIDENCE',
        title: "We couldn't analyze this patent right now.",
        message: 'No direct evidence matching your technical features was identified in this patent document.',
      });
    } catch (err: any) {
      if (axios.isCancel(err) || err.name === 'CanceledError') {
        if (userCanceledRef.current) {
          setIsCanceled(true);
        }
      } else {
        // Requirement: Do NOT expose raw technical errors. Classify into user-friendly message
        const classified = classifyEvidenceError(err);
        setErrorState(classified);

        // Requirement: If partial results exist, show them rather than throwing away the entire analysis
        if (features.length > 0) {
          setIsPartial(true);
        }
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
    userCanceledRef.current = true;
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

  const currentTitle = patentMetadata?.title || activePatentInfo?.title || `Prior-Art Patent Document (${targetPatentId})`;

  /* -------------------------------------------------------------------------- */
  /* 1. Loading State UI                                                         */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="space-y-8 font-body w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
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
  /* 2. Canceled State                                                           */
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
          Try again
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 3. Full Error State (When NO features could be loaded)                      */
  /* -------------------------------------------------------------------------- */
  if (errorState && features.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-10 text-center space-y-5 max-w-xl mx-auto font-body shadow-xs">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 border border-slate-200">
          <AlertCircle className="h-6 w-6 text-slate-500" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">
            {errorState.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            {errorState.message}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 4. Complete Loaded View (with optional Partial Results Warning Banner)     */
  /* -------------------------------------------------------------------------- */
  const activeFeature = features.find((f) => f.id === selectedFeatureId) || features[0];

  const matchCount = features.filter((f) => f.status === 'MATCH').length;
  const partialCount = features.filter((f) => f.status === 'PARTIAL_MATCH').length;
  const notFoundCount = features.filter((f) => f.status === 'NOT_FOUND').length;
  const totalMatched = matchCount + partialCount;

  const getOverlapRating = () => {
    const ratio = features.length > 0 ? totalMatched / features.length : 0;
    if (ratio >= 0.7) {
      return {
        title: 'Strong technical overlap',
        description: 'This patent contains evidence for most of the technical features identified in your invention.',
      };
    }
    if (ratio >= 0.4) {
      return {
        title: 'Moderate technical overlap',
        description: 'Several technical features appear in this patent, while other features remain distinct.',
      };
    }
    return {
      title: 'Limited technical overlap',
      description: 'Some technical information overlaps, but the available evidence is limited.',
    };
  };

  const overlapRating = getOverlapRating();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="space-y-6 font-body w-full"
    >
      {/* Partial Results Banner (Only when needed) */}
      {isPartial && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 flex items-center justify-between gap-3 text-xs font-body shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Showing partial evidence analysis results ({features.length} feature{features.length > 1 ? 's' : ''} loaded).
            </span>
          </div>
          <button
            onClick={runAnalysis}
            className="inline-flex items-center gap-1 font-bold text-amber-900 hover:text-amber-950 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-100/60 transition cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}

      {/* Ultra-Minimal Single-Line Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 font-body">
        {/* Left: Patent ID + Title + View Patent Link */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 text-xs shrink-0">
            {targetPatentId}
          </span>
          <h1 className="text-base font-bold text-slate-900 truncate">
            {currentTitle}
          </h1>
          <a
            href={getGooglePatentsUrl(targetPatentId)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition shrink-0 ml-1"
          >
            View Patent
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Right Actions: Target Patent Switcher & PDF Export */}
        <div className="flex items-center gap-2 shrink-0">
          {availablePatents.length > 1 && (
            <select
              value={targetPatentId}
              onChange={(e) => setTargetPatentId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer hover:bg-slate-50 transition shadow-2xs"
            >
              {availablePatents.map((p) => (
                <option key={p.patentId} value={p.patentId}>
                  {p.publicationNumber || p.patentId}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 shrink-0"
          >
            {exportingPdf ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export Brief
          </button>
        </div>
      </div>

      {/* Analysis Summary Card */}
      <div className="rounded-2xl bg-slate-50/90 p-5 border border-slate-200/90 space-y-4 font-body shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Analysis Summary
            </h2>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {totalMatched} of {features.length} technical features match
            </div>
            <div className="text-xs text-slate-600 leading-relaxed pt-0.5">
              <strong className="text-slate-900 font-semibold">{overlapRating.title}</strong> — {overlapRating.description}
            </div>
          </div>

          {/* Stat Breakdown Counters */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 text-center min-w-[76px] shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matched</div>
              <div className="text-lg font-extrabold text-emerald-700">{matchCount}</div>
            </div>

            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 text-center min-w-[76px] shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partial</div>
              <div className="text-lg font-extrabold text-amber-700">{partialCount}</div>
            </div>

            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 text-center min-w-[76px] shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not found</div>
              <div className="text-lg font-extrabold text-slate-500">{notFoundCount}</div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-200/60 pt-2.5">
          This analysis is intended to support prior-art research.
        </div>
      </div>

      {/* Technical Features & Supporting Evidence Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
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
    </motion.div>
  );
};

export default EvidenceAnalysisWorkspace;


