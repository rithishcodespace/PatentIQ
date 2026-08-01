import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Database,
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
import { getLevelBadgeStyle } from '../results/ConfidenceDashboard';

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
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 backdrop-blur">
              <History className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-semibold">Search & Novelty Persistence</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                  <Database className="h-3 w-3" /> PostgreSQL Prisma Store
                </span>
              </div>
              <p className="font-body text-xs text-indigo-200 mt-0.5">
                Every semantic vector search and AI novelty report is atomically persisted in relational tables
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-l border-indigo-800/80 pl-6 hidden sm:flex">
            <div>
              <p className="font-display text-xl font-bold">{historyRecords.length}</p>
              <p className="font-body text-[11px] text-indigo-300">Saved Searches</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold">100%</p>
              <p className="font-body text-[11px] text-indigo-300">Reusable Reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search past queries by keyword..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedIpc}
            onChange={(e) => setSelectedIpc(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">All IPC Classifications</option>
            <option value="B64C 39/02">B64C (Unmanned Aerial Vehicles)</option>
            <option value="G06V 20/00">G06V (Computer Vision)</option>
          </select>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
              <History className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="font-body text-sm font-medium">No saved search history matches your filter.</p>
            </div>
          ) : (
            filteredHistory.map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-slate-400">
                        #{rec.id}
                      </span>
                      <span className="inline-flex items-center gap-1 font-body text-[11px] text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(rec.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1 font-body text-[11px] text-slate-500">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        {rec.searchLatency}ms
                      </span>
                    </div>

                    <h4 className="font-display text-base font-semibold text-slate-900 leading-snug">
                      "{rec.searchQuery}"
                    </h4>

                    {/* Applied Filters Tags */}
                    {rec.appliedFilters && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {rec.appliedFilters.ipc && (
                          <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
                            IPC: {rec.appliedFilters.ipc}
                          </span>
                        )}
                        {rec.appliedFilters.country && (
                          <span className="code-chip bg-slate-100 text-slate-700 text-[10px]">
                            Country: {rec.appliedFilters.country}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confidence Pill & Action */}
                  <div className="flex items-center gap-3">
                    {rec.confidence && (
                      <div className="text-right">
                        <p className="font-body text-[10px] text-slate-400 uppercase tracking-wider">
                          Confidence
                        </p>
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 font-body text-xs font-bold ${getLevelBadgeStyle(
                            rec.confidence.overall.level
                          )}`}
                        >
                          {rec.confidence.overall.score.toFixed(1)}% · {rec.confidence.overall.level}
                        </span>
                      </div>
                    )}

                    {onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete search history record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Retrieved Patent Badges */}
                <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-600 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-500" />
                      Top Candidates ({rec.retrievedPatents.length}):
                    </span>
                    {rec.retrievedPatents.map((pat) => (
                      <span
                        key={pat.patentId}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-700 border border-slate-200"
                      >
                        {pat.patentId} ({(pat.similarityScore * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>

                  {rec.noveltyAnalysis && (
                    <button
                      onClick={() => onSelectRecord?.(rec)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 font-body text-xs font-semibold text-indigo-700 hover:bg-slate-100 transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      Open Persisted Report
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryView;
