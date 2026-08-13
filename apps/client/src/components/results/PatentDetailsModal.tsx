import React from 'react';
import { X, ExternalLink, Calendar, Tag, User, Hash, FileText, Sparkles } from 'lucide-react';
import type { PatentItem } from './PatentCard';

interface PatentDetailsModalProps {
  patent: PatentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeEvidence?: (patent: PatentItem) => void;
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

export const PatentDetailsModal: React.FC<PatentDetailsModalProps> = ({ patent, isOpen, onClose, onAnalyzeEvidence }) => {
  if (!isOpen || !patent) return null;

  const officialUrl = getGooglePatentsUrl(patent);
  const patentIdFormatted = patent.patentId ? (patent.patentId.startsWith('US') ? patent.patentId : `US${patent.patentId}`) : 'US-PATENT';

  const handleAnalyzeClick = () => {
    if (onAnalyzeEvidence) {
      onAnalyzeEvidence(patent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 font-body space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 px-2 items-center justify-center rounded bg-indigo-50 font-mono text-xs font-bold text-indigo-700">
                Rank #{patent.rank}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">{patentIdFormatted}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{patent.title || 'Patent Document Details'}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-200/70">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-3xs uppercase font-medium">Patent Identifier</span>
              <strong className="font-mono text-slate-900 text-xs font-semibold">{patentIdFormatted}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-3xs uppercase font-medium">Publication Date</span>
              <strong className="text-slate-900 text-xs font-medium">{patent.publicationDate || 'Not Available'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-3xs uppercase font-medium">Classification (IPC/CPC)</span>
              <strong className="font-mono text-slate-900 text-xs font-medium">{patent.ipc || 'General Classification'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-3xs uppercase font-medium">Assignee / Applicant</span>
              <strong className="text-slate-900 text-xs font-medium">{patent.owner || patent.assignee || patent.applicant || 'Undisclosed'}</strong>
            </div>
          </div>
        </div>

        {/* Full Abstract Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-600" />
            Full Abstract & Technical Description
          </h3>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 leading-relaxed font-normal max-h-60 overflow-y-auto whitespace-pre-wrap">
            {patent.abstract || 'No abstract text available for this prior-art reference.'}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
          {onAnalyzeEvidence && (
            <button
              onClick={handleAnalyzeClick}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition cursor-pointer shadow-2xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Analyze Match
            </button>
          )}
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
          >
            View Patent
            <ExternalLink className="h-3.5 w-3.5 text-white/90" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatentDetailsModal;
