import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export interface EvidenceData {
  text: string;
  section: 'Claim' | 'Abstract' | 'Description' | string;
  claimNumber?: number;
  sourceUrl?: string;
  highlightTerms?: string[];
}

export interface SupportingEvidenceCardProps {
  featureName: string;
  status: 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND';
  evidence: EvidenceData | null;
  patentId?: string;
  className?: string;
}

export const SupportingEvidenceCard: React.FC<SupportingEvidenceCardProps> = ({
  featureName,
  status,
  evidence,
  patentId,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Status configuration
  const getStatusBadge = () => {
    switch (status) {
      case 'MATCH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Match
          </span>
        );
      case 'PARTIAL_MATCH':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            Partial match
          </span>
        );
      case 'NOT_FOUND':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="h-3.5 w-3.5 text-slate-400" />
            Not found
          </span>
        );
    }
  };

  // Helper to render text with highlighted terms
  const renderTextWithHighlights = (text: string, terms: string[]) => {
    if (!terms || terms.length === 0) {
      return text;
    }

    // Filter terms longer than 2 chars to avoid matching 'a', 'in', etc.
    const validTerms = terms.filter((t) => t && t.trim().length > 2);
    if (validTerms.length === 0) return text;

    try {
      const pattern = new RegExp(`(${validTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
      const parts = text.split(pattern);

      return parts.map((part, i) =>
        validTerms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-amber-200/80 text-amber-950 font-semibold px-1 py-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  // Truncate text if collapsible
  const textThreshold = 240;
  const isLong = evidence && evidence.text.length > textThreshold;
  const displayText = evidence
    ? isExpanded || !isLong
      ? evidence.text
      : `${evidence.text.slice(0, textThreshold)}...`
    : '';

  // Format source text
  const sourceLabel = evidence
    ? evidence.section === 'Claim' && evidence.claimNumber
      ? `Source: Claim ${evidence.claimNumber}`
      : `Source: ${evidence.section}`
    : 'Source: Patent Text';

  // Construct target URL
  const targetUrl =
    evidence?.sourceUrl ||
    (patentId ? `https://patents.google.com/patent/${patentId.replace(/[^a-zA-Z0-9]/g, '')}/en` : '#');

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5 font-body ${className}`}>
      {/* Feature Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Selected Technical Feature
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{featureName}</h3>
        </div>
        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Supporting Evidence Display */}
      {evidence && evidence.text ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Supporting Evidence
            </span>

            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-2">
              <div className="text-xs sm:text-sm font-body text-slate-800 leading-relaxed whitespace-pre-line">
                "{renderTextWithHighlights(displayText, evidence.highlightTerms || [])}"
              </div>

              {isLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer pt-1"
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Read full snippet <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Secondary Source Meta & Open Patent Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {sourceLabel}
            </span>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
            >
              Open Patent
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ) : (
        /* Empty / Not Found State */
        <div className="rounded-xl bg-slate-50 p-8 text-center space-y-2 border border-slate-200/80">
          <XCircle className="h-6 w-6 text-slate-400 mx-auto" />
          <div className="text-xs font-bold text-slate-700">No Supporting Evidence Found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This technical feature was not identified in the patent's Claims, Abstract, or Description.
          </p>
        </div>
      )}
    </div>
  );
};

export default SupportingEvidenceCard;
