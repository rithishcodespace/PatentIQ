import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, XCircle, Quote } from 'lucide-react';

export interface EvidenceOffset {
  start: number;
  end: number;
}

export interface EvidenceData {
  text: string;
  section: 'Claim' | 'Abstract' | 'Description' | string;
  claimNumber?: number;
  paragraphNumber?: number | string;
  sourceUrl?: string;
  highlightTerms?: string[];
  highlightOffsets?: EvidenceOffset[];
}

export interface SupportingEvidenceCardProps {
  featureName: string;
  status: 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND' | string;
  evidence: EvidenceData | null;
  patentId?: string;
  className?: string;
}

// Stop words set to prevent over-highlighting common words
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'it', 'its', 'this', 'that', 'these', 'those', 'use', 'uses', 'used', 'using',
  'system', 'method', 'apparatus', 'device', 'configured', 'comprising', 'includes', 'including',
  'detect', 'detects', 'detected'
]);

export const SupportingEvidenceCard: React.FC<SupportingEvidenceCardProps> = ({
  featureName,
  status,
  evidence,
  patentId,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Requirement 4, 5, 6, 7: Pure qualitative status badge without exposed scores, raw JSON, or vectors
  const getStatusBadge = () => {
    switch (status?.toUpperCase()) {
      case 'MATCH':
      case 'DIRECT_MATCH':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            Match
          </span>
        );
      case 'PARTIAL_MATCH':
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            Partial match
          </span>
        );
      case 'NOT_FOUND':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            Not found
          </span>
        );
    }
  };

  // Requirement 3 & 4: Smart text highlighter for offsets or terms without over-highlighting
  const renderTextWithHighlights = (textSegment: string, terms?: string[], offsets?: EvidenceOffset[]) => {
    if (!textSegment) return null;

    // 1. Highlight via exact character offsets if provided by backend
    if (offsets && offsets.length > 0) {
      const sortedOffsets = [...offsets].sort((a, b) => a.start - b.start);
      const elements: React.ReactNode[] = [];
      let currentIndex = 0;

      sortedOffsets.forEach((offset, idx) => {
        if (offset.start > currentIndex) {
          elements.push(textSegment.slice(currentIndex, offset.start));
        }
        elements.push(
          <mark key={`offset-${idx}`} className="bg-amber-100 text-amber-950 font-medium px-1 py-0.5 rounded border-b-2 border-amber-300">
            {textSegment.slice(offset.start, offset.end)}
          </mark>
        );
        currentIndex = offset.end;
      });

      if (currentIndex < textSegment.length) {
        elements.push(textSegment.slice(currentIndex));
      }
      return elements;
    }

    // 2. Highlight via matching key terms (with stop-words filtering)
    if (terms && terms.length > 0) {
      const validTerms = terms
        .map((t) => t.trim())
        .filter((t) => t.length >= 3 && !STOP_WORDS.has(t.toLowerCase()))
        .sort((a, b) => b.length - a.length); // match longest phrases first

      if (validTerms.length === 0) return textSegment;

      try {
        const pattern = new RegExp(`(${validTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
        const parts = textSegment.split(pattern);

        return parts.map((part, i) =>
          validTerms.some((vt) => vt.toLowerCase() === part.toLowerCase()) ? (
            <mark key={`term-${i}`} className="bg-amber-100 text-amber-950 font-medium px-1 py-0.5 rounded border-b-2 border-amber-300">
              {part}
            </mark>
          ) : (
            part
          )
        );
      } catch {
        return textSegment;
      }
    }

    return textSegment;
  };

  // Requirement 8: Collapsible for long evidence snippets
  const TEXT_THRESHOLD = 260;
  const isLong = Boolean(evidence?.text && evidence.text.length > TEXT_THRESHOLD);

  const getDisplayedText = () => {
    if (!evidence || !evidence.text) return '';
    if (isExpanded || !isLong) return evidence.text;

    // Truncate cleanly at a space boundary
    const truncated = evidence.text.slice(0, TEXT_THRESHOLD);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${truncated.slice(0, lastSpace > 180 ? lastSpace : TEXT_THRESHOLD)}...`;
  };

  // Requirement 2: Preserve paragraph structure
  const renderParagraphs = (text: string) => {
    if (!text) return null;
    const rawParagraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    if (rawParagraphs.length === 0) {
      return (
        <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-normal font-sans">
          "{renderTextWithHighlights(text, evidence?.highlightTerms, evidence?.highlightOffsets)}"
        </p>
      );
    }

    return rawParagraphs.map((para, idx) => (
      <p key={`para-${idx}`} className="text-slate-800 leading-relaxed text-sm sm:text-base font-normal font-sans mb-3 last:mb-0">
        {idx === 0 && <span className="text-slate-400 font-serif text-lg leading-none mr-0.5">“</span>}
        {renderTextWithHighlights(para, evidence?.highlightTerms, evidence?.highlightOffsets)}
        {idx === rawParagraphs.length - 1 && <span className="text-slate-400 font-serif text-lg leading-none ml-0.5">”</span>}
      </p>
    ));
  };

  // Requirement 9: Visually secondary source information
  const formatSourceLabel = () => {
    if (!evidence) return 'Patent Text';
    if (evidence.section === 'Claim' && evidence.claimNumber) {
      return `Claim ${evidence.claimNumber}`;
    }
    if (evidence.paragraphNumber) {
      return `${evidence.section} (¶ ${evidence.paragraphNumber})`;
    }
    return evidence.section || 'Specification';
  };

  // Requirement 10: Source / Google Patent link opening in a new tab
  const cleanPatentId = patentId ? String(patentId).replace(/[^a-zA-Z0-9]/g, '') : '';
  const formattedPatentId = /^[a-zA-Z]{2}/.test(cleanPatentId) ? cleanPatentId : `US${cleanPatentId}`;
  const targetUrl =
    evidence?.sourceUrl ||
    (patentId ? `https://patents.google.com/patent/${formattedPatentId}/en` : '#');

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6 font-body ${className}`}>
      {/* 1. Feature Title & Match Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Feature
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            "{featureName}"
          </h3>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
            Match:
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* 2. Supporting Evidence Display */}
      {evidence && evidence.text ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Quote className="h-3.5 w-3.5 text-indigo-600 rotate-180" />
              Supporting Evidence
            </span>

            {/* Requirement 1: Highly readable text box with paragraph preservation */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5 relative overflow-hidden transition-all">
              <div className="pl-1">
                {renderParagraphs(getDisplayedText())}
              </div>

              {/* Requirement 8: Collapsible Toggle */}
              {isLong && (
                <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <>
                        <span>Show less</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Read full snippet</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    {isExpanded ? 'Full snippet' : 'Truncated view'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Secondary Source Information & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Requirement 9: Visually secondary source metadata */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Source:
              </span>
              <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200/80 font-medium">
                {formatSourceLabel()}
              </span>
            </div>

            {/* Requirement 10: Open Patent link in new tab */}
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.98] transition cursor-pointer"
            >
              Actions: Open Patent
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

