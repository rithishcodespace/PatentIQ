import React, { useState } from 'react';
import { ExternalLink, Sparkles, ChevronDown, ChevronUp, HelpCircle, Tag } from 'lucide-react';

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
  const shouldTruncate = rawAbstract.length > 260;
  const displayedAbstract = isExpanded || !shouldTruncate ? rawAbstract : `${rawAbstract.substring(0, 260)}...`;

  const displayPatentId = patent.publicationNumber || patent.patentId;
  const patentIdFormatted = displayPatentId
    ? (displayPatentId.startsWith('US') ? displayPatentId : `US${displayPatentId}`)
    : `PAT-${rank}`;

  const officialUrl = getGooglePatentsUrl(patent);

  // Requirement: Display Key Matching Features
  const keyFeatures = patent.keyMatchingFeatures && patent.keyMatchingFeatures.length > 0
    ? patent.keyMatchingFeatures
    : ['Prior-Art Claim Overlap', 'Technical Specification Match'];

  // Requirement: Display Why it is relevant
  const relevanceReasonText = patent.relevanceReason || 
    'Discloses prior-art claim structure and technical specifications overlapping with core invention limitations.';

  return (
    <div className={`group relative rounded-2xl border bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md font-body ${isSelected ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' : 'border-slate-200 hover:border-indigo-300'}`}>
      
      {/* 1. Header Row: Selection Checkbox, Rank, Patent ID, and Technical Details Toggle */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onToggleSelect(patent.patentId)}
              title="Select patent for evidence analysis"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}
          <span className="inline-flex h-6 px-2 items-center justify-center rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-800 border border-slate-200">
            #{rank}
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
            {patentIdFormatted}
          </span>
        </div>

        {/* Optional Collapsible Technical Details Toggle */}
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition cursor-pointer"
        >
          Technical Details
          {showTechnicalDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* 2. Main Content: Patent Title & Relevance Explanation */}
      <div className="mt-3.5 space-y-2.5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {patent.title || `Patent Reference ${patentIdFormatted}`}
        </h3>

        {/* Requirement: Why it is relevant */}
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            Why it is relevant
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal pl-5">
            {relevanceReasonText}
          </p>
        </div>

        {/* Patent Abstract */}
        <p className="text-xs text-slate-600 leading-relaxed font-normal pt-0.5">
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

      {/* 3. Requirement: Key Matching Features */}
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Key Matching Features
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {keyFeatures.map((feat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70"
            >
              <Tag className="h-3 w-3 text-indigo-500" />
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Requirement: Only 2 Actions (Primary: View Patent, Secondary: Analyze Match) */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Publication Date: <strong className="text-slate-800 font-semibold">{patent.publicationDate || 'N/A'}</strong>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Secondary Action: [Analyze Match] */}
          {onAnalyzeEvidence && (
            <button
              onClick={() => onAnalyzeEvidence(patent)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Analyze Match
            </button>
          )}

          {/* Primary Action: [View Patent] */}
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
          >
            View Patent
            <ExternalLink className="h-3.5 w-3.5 text-white/90" />
          </a>
        </div>
      </div>

      {/* 5. Requirement: Optional Technical Details Section (hides vector scores by default) */}
      {showTechnicalDetails && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs font-mono space-y-2 text-slate-600 animate-in fade-in duration-150">
          <div className="font-sans font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Vector Search & Algorithmic Scoring</span>
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

          <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-3xs font-sans text-slate-500">
            <span>IPC Classification: <strong>{patent.ipc || 'General'}</strong></span>
            <span>Assignee: <strong>{patent.owner || patent.assignee || 'Undisclosed'}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentCard;

