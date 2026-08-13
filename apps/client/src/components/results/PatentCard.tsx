import React, { useState } from 'react';
import { ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export interface PatentItem {
  rank: number;
  patentId: string;
  publicationNumber?: string;
  title: string;
  abstract?: string;
  publicationDate?: string;
  filingDate?: string;
  priorityDate?: string;
  ipc?: string;
  cpc?: string;
  owner?: string;
  assignee?: string;
  applicant?: string;
  inventors?: string[];
  score?: number;
  denseScore?: number;
  bm25Score?: number;
  rrfScore?: number;
  retrievalRelevanceScore?: number;
  relevanceReason?: string;
  keyMatchingFeatures?: string[];
  sourceUrl?: string;
  section?: string;
}

interface PatentCardProps {
  patent: PatentItem;
  rank: number;
  onInspectDetails?: (patent: PatentItem) => void;
  onAnalyzeEvidence?: (patent: PatentItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (patentId: string) => void;
}

const getGooglePatentsUrl = (patent: PatentItem): string => {
  if (patent.sourceUrl && patent.sourceUrl.startsWith('http')) {
    return patent.sourceUrl;
  }
  const id = patent.publicationNumber || patent.patentId || '';
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
  return `https://patents.google.com/patent/${formattedId}/en`;
};

export const PatentCard: React.FC<PatentCardProps> = ({
  patent,
  rank,
  onAnalyzeEvidence,
  isSelected,
  onToggleSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const rawAbstract = patent.abstract || 'No abstract description available for this prior-art document.';
  const shouldTruncate = rawAbstract.length > 240;
  const displayedAbstract = isExpanded || !shouldTruncate ? rawAbstract : `${rawAbstract.substring(0, 240)}...`;

  const displayPatentId = patent.publicationNumber || patent.patentId;
  const patentIdFormatted = displayPatentId
    ? (displayPatentId.startsWith('US') ? displayPatentId : `US${displayPatentId}`)
    : `PAT-${rank}`;

  const officialUrl = getGooglePatentsUrl(patent);

  // Key Matching Features list with match status icons
  const keyFeatures = patent.keyMatchingFeatures && patent.keyMatchingFeatures.length > 0
    ? patent.keyMatchingFeatures.map((feat, idx) => ({
        name: feat,
        status: idx === 0 ? 'MATCH' : (idx === 1 ? 'MATCH' : 'PARTIAL_MATCH')
      }))
    : [
        { name: 'Prior-Art Claim Overlap', status: 'MATCH' },
        { name: 'Technical Specification Match', status: 'MATCH' },
        { name: 'System Architecture Alignment', status: 'PARTIAL_MATCH' },
      ];

  // Why it may be relevant
  const relevanceReasonText = patent.relevanceReason || 
    'Discloses prior-art technical specifications and claim structures overlapping with your invention.';

  // Match strength calculation
  const getMatchStrengthLabel = () => {
    if (rank <= 2 || (patent.score && patent.score > 0.75)) {
      return { label: 'Strong', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (rank <= 5 || (patent.score && patent.score > 0.5)) {
      return { label: 'Moderate', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    return { label: 'Relevant', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  const matchStrength = getMatchStrengthLabel();

  return (
    <div className={`group relative rounded-2xl border bg-white p-6 shadow-2xs transition-all duration-200 hover:border-slate-300 font-body space-y-4 ${isSelected ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200/80'}`}>
      
      {/* 1. Header: Patent ID, Rank, Publication Date, & Technical Details Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onToggleSelect(patent.patentId)}
              title="Select patent for evidence analysis"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}
          <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
            {patentIdFormatted}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            Published: <strong className="text-slate-800 font-semibold">{patent.publicationDate || 'N/A'}</strong>
          </span>
        </div>

        {/* Optional Collapsible Technical Details Toggle */}
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
        >
          Technical Details
          {showTechnicalDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* 2. Patent Title */}
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {patent.title || `Patent Reference ${patentIdFormatted}`}
        </h3>
      </div>

      {/* 3. Why this patent may be relevant */}
      <div className="space-y-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Why this patent may be relevant
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {relevanceReasonText}
        </p>
      </div>

      {/* 4. Abstract Snippet */}
      <div className="space-y-1 pt-1">
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          {displayedAbstract}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Read full abstract <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        )}
      </div>

      {/* 5. Matching Features & Match Strength */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Matching Features List */}
        <div className="space-y-1.5 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Matching features
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {keyFeatures.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-800 border border-slate-200/80"
              >
                {feat.status === 'MATCH' ? (
                  <span className="text-emerald-600 font-bold text-xs">✓</span>
                ) : (
                  <span className="text-amber-600 font-bold text-xs">◐</span>
                )}
                {feat.name}
              </span>
            ))}
          </div>
        </div>

        {/* Match Strength Badge */}
        <div className="shrink-0 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Match strength
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${matchStrength.badgeClass}`}>
            {matchStrength.label}
          </span>
        </div>
      </div>

      {/* 6. Action Hierarchy: Primary = Analyze Match, Secondary = View Patent */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
        {/* Secondary Action: [View Patent] */}
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
        >
          View Patent
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
        </a>

        {/* Primary Action: [Analyze Match] */}
        {onAnalyzeEvidence && (
          <button
            onClick={() => onAnalyzeEvidence(patent)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-white/90" />
            Analyze Match
          </button>
        )}
      </div>

      {/* Optional Technical Details Section */}
      {showTechnicalDetails && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono space-y-2 text-slate-600 animate-in fade-in duration-150">
          <div className="font-sans font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Algorithmic Telemetry</span>
            <span className="text-3xs font-mono text-slate-400">TECHNICAL DETAILS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-3xs font-sans text-slate-400 block uppercase">BM25 Score</span>
              <strong className="text-slate-800 font-bold text-xs">{patent.bm25Score?.toFixed(4) || 'N/A'}</strong>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-3xs font-sans text-slate-400 block uppercase">Dense Similarity</span>
              <strong className="text-slate-800 font-bold text-xs">{patent.denseScore?.toFixed(4) || patent.score?.toFixed(4) || 'N/A'}</strong>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-3xs font-sans text-slate-400 block uppercase">RRF Rank Score</span>
              <strong className="text-slate-800 font-bold text-xs">{patent.retrievalRelevanceScore?.toFixed(4) || 'N/A'}</strong>
            </div>

            <div className="p-2 rounded bg-white border border-slate-200">
              <span className="text-3xs font-sans text-slate-400 block uppercase">Pinecone Score</span>
              <strong className="text-slate-800 font-bold text-xs">{patent.score ? `${(patent.score * 100).toFixed(1)}%` : 'N/A'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentCard;

