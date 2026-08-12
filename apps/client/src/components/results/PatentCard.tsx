import React, { useState } from 'react';
import { ExternalLink, Calendar, Tag, User, ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';

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
  retrievalRelevanceScore?: number;
  relevanceReason?: string;
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

const getMatchStrengthLabel = (patent: PatentItem, rank: number): { label: string; badgeStyle: string } => {
  const relScore = patent.retrievalRelevanceScore ?? patent.score;

  if (typeof relScore === 'number') {
    if (relScore >= 0.70 || rank <= 3) {
      return { label: 'High', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (relScore >= 0.40 || rank <= 7) {
      return { label: 'Medium', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Low', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200' };
  }

  if (rank <= 3) return { label: 'High', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (rank <= 7) return { label: 'Medium', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { label: 'Low', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200' };
};

export const PatentCard: React.FC<PatentCardProps> = ({
  patent,
  rank,
  onInspectDetails,
  onAnalyzeEvidence,
  isSelected,
  onToggleSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawAbstract = patent.abstract || 'No abstract description available for this prior-art document.';
  const shouldTruncate = rawAbstract.length > 280;
  const displayedAbstract = isExpanded || !shouldTruncate ? rawAbstract : `${rawAbstract.substring(0, 280)}...`;

  const displayPatentId = patent.publicationNumber || patent.patentId;
  const patentIdFormatted = displayPatentId
    ? (displayPatentId.startsWith('US') ? displayPatentId : `US${displayPatentId}`)
    : `PAT-${rank}`;

  const ownerName = patent.owner || patent.assignee || patent.applicant || 'Undisclosed';
  const pubDate = patent.publicationDate || 'N/A';
  const priorityDate = patent.priorityDate || patent.filingDate || 'N/A';
  const ipcClass = patent.ipc || 'General Classification';
  const officialUrl = getGooglePatentsUrl(patent);

  const { label: strengthLabel, badgeStyle } = getMatchStrengthLabel(patent, rank);

  return (
    <div className={`group relative rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md font-body ${isSelected ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' : 'border-slate-200 hover:border-indigo-300'}`}>
      {/* Header Row: Checkbox, Rank, Patent ID, and Match Strength Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
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
          <span className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700">
            #{rank}
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
            {patentIdFormatted}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${badgeStyle}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Match Strength: {strengthLabel}
          </span>
        </div>
      </div>

      {/* Main Content: Title and Abstract */}
      <div className="mt-3.5 space-y-2">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
          {patent.title || `Patent Reference ${patentIdFormatted}`}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          {displayedAbstract}
        </p>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition pt-1 cursor-pointer"
          >
            {isExpanded ? (
              <>
                Show less <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Read full abstract <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Metadata Row: Publication Date, Priority Date, IPC/CPC, Assignee */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Publication Date: <strong className="text-slate-700 font-medium">{pubDate}</strong></span>
          </div>

          {priorityDate !== 'N/A' && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Priority Date: <strong className="text-slate-700 font-medium">{priorityDate}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>IPC/CPC: <strong className="text-slate-700 font-mono font-medium">{ipcClass}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">Applicant/Assignee: <strong className="text-slate-700 font-medium">{ownerName}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onAnalyzeEvidence && (
            <button
              onClick={() => onAnalyzeEvidence(patent)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              Analyze Evidence
            </button>
          )}

          {onInspectDetails && (
            <button
              onClick={() => onInspectDetails(patent)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Patent Details
            </button>
          )}

          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Source <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatentCard;
