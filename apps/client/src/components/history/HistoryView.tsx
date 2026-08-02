import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Layers,
  Clock,
  FileText,
} from 'lucide-react';
import type { SearchHistoryRecord } from '../../types/history';

interface HistoryViewProps {
  historyRecords: SearchHistoryRecord[];
  onSelectRecord?: (record: SearchHistoryRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

const HistoryView = ({ historyRecords, onSelectRecord, onDeleteRecord }: HistoryViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIpc, setSelectedIpc] = useState<string>('ALL');

  const filteredHistory = historyRecords.filter((rec) => {
    const matchesSearch = rec.searchQuery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIpc = selectedIpc === 'ALL' || rec.appliedFilters?.ipc === selectedIpc;
    return matchesSearch && matchesIpc;
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Search History
              </h2>
              <p className="font-body text-xs text-slate-600 mt-0.5">
                Browse and reopen your past patent prior-art searches and novelty reports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>{historyRecords.length} Saved Searches</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search query text or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 font-body text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={selectedIpc}
            onChange={(e) => setSelectedIpc(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-body text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none transition"
          >
            <option value="ALL">All Classifications</option>
            <option value="B64C 39/02">B64C 39/02 (Aviation)</option>
            <option value="G06V 20/00">G06V 20/00 (Vision)</option>
            <option value="H02J 50/10">H02J 50/10 (Power)</option>
          </select>
        </div>
      </div>

      {/* History Records */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <History className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="font-display text-base font-bold text-slate-800 mt-2">
              No Matching History Records
            </h3>
            <p className="font-body text-xs text-slate-500 mt-1">
              Try adjusting your search filter or start a new prior-art search.
            </p>
          </div>
        ) : (
          filteredHistory.map((rec) => {
            const dateStr = rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Recent';
            const timeStr = rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>{dateStr}</span>
                    {timeStr && (
                      <>
                        <Clock className="h-3.5 w-3.5 text-slate-400 ml-2" />
                        <span>{timeStr}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.confidence?.overall?.score !== undefined && (
                      <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 font-mono text-[10px] font-bold">
                        {rec.confidence.overall.score}% Confidence ({rec.confidence.overall.level})
                      </span>
                    )}
                    {onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="code-chip text-[10px]">
                    Search Query
                  </span>
                  <h4 className="font-display text-base font-bold text-slate-900 mt-1">
                    "{rec.searchQuery}"
                  </h4>
                </div>

                {rec.noveltyAnalysis?.summary && (
                  <p className="font-body text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    {rec.noveltyAnalysis.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      {rec.retrievedPatents?.length || 0} Matches
                    </span>
                    {rec.searchLatency && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {rec.searchLatency}ms
                      </span>
                    )}
                  </div>

                  {onSelectRecord && (
                    <button
                      onClick={() => onSelectRecord(rec)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-blue-500 transition shadow-2xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Reopen Search Report
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryView;
