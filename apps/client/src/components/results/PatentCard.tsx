import React, { useState } from 'react';
import { ExternalLink, Calendar, Tag, User, Layers, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export interface PatentItem {
  rank: number;
  patentId: string;
  title: string;
  abstract?: string;
  publicationDate?: string;
  priorityDate?: string;
  ipc?: string;
  cpc?: string;
  owner?: string;
  assignee?: string;
  applicant?: string;
  inventors?: string[];
  score?: number;
  similarityScore?: number;
  section?: string;
  sourceUrl?: string;
}

interface PatentCardProps {
  patent: PatentItem;
  rank: number;
  onInspectDetails?: (patent: PatentItem) => void;
}

const getGooglePatentsUrl = (patent: PatentItem): string => {
  if (patent.sourceUrl && patent.sourceUrl.startsWith('http')) {
    return patent.sourceUrl;
  }
  const id = patent.patentId || '';
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
  return `https://patents.google.com/patent/${formattedId}/en`;
};

export const PatentCard: React.FC<PatentCardProps> = ({ patent, rank, onInspectDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawAbstract = patent.abstract || 'No abstract text available for this prior-art document.';
  const shouldTruncate = rawAbstract.length > 280;
  const displayedAbstract = isExpanded || !shouldTruncate ? rawAbstract : `${rawAbstract.substring(0, 280)}...`;

  const patentIdFormatted = patent.patentId ? (patent.patentId.startsWith('US') ? patent.patentId : `US${patent.patentId}`) : `PAT-${rank}`;
  const ownerName = patent.owner || patent.assignee || patent.applicant || 'Individual / Undisclosed';
  const pubDate = patent.publicationDate || 'Date Not Listed';
  const ipcClass = patent.ipc || 'General Patent Index';
  const officialUrl = getGooglePatentsUrl(patent);

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-md">
      {/* Header Row: Rank, Patent ID, and Search Relevance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 px-2.5 items-center justify-center rounded-lg bg-indigo-50 font-mono text-xs font-bold text-indigo-700">
            #{rank}
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
            {patentIdFormatted}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {patent.section && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-3xs font-semibold text-slate-600 uppercase tracking-wider">
              <Layers className="h-3 w-3 text-slate-400" />
              {patent.section}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Rank #{rank} Match
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

      {/* Metadata Badges Footer */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Published: <strong className="text-slate-700 font-medium">{pubDate}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>IPC/CPC: <strong className="text-slate-700 font-mono font-medium">{ipcClass}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[200px]">Assignee: <strong className="text-slate-700 font-medium">{ownerName}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onInspectDetails && (
            <button
              onClick={() => onInspectDetails(patent)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Inspect
            </button>
          )}

          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            View Patent
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatentCard;
