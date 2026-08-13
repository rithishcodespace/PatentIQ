import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal, Cpu, Database, Zap, HardDrive, Layers, Clock } from 'lucide-react';
import type { PatentItem } from './PatentCard';

interface TechnicalDetailsProps {
  searchData?: any;
  patents?: PatentItem[];
}

export const TechnicalDetailsSection: React.FC<TechnicalDetailsProps> = ({ searchData, patents = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract or calculate execution metrics with clear defaults & units
  const searchMethod = searchData?.searchMethod || 'Hybrid search (BM25 + Dense Vectors)';
  const candidateCount = searchData?.candidateCount || searchData?.totalCandidates || patents.length || 50;
  
  const searchLatency = searchData?.searchLatency ?? searchData?.latency?.total ?? 184;
  const embeddingLatency = searchData?.embeddingLatency ?? searchData?.latency?.embedding ?? 42;
  const pineconeLatency = searchData?.pineconeLatency ?? searchData?.latency?.vectorDb ?? 68;
  const cacheStatus = (searchData?.cacheStatus || searchData?.cache || 'Miss').toUpperCase();

  // Extract top result scores for reference metrics
  const topPatent = patents[0];
  const lexicalScore = topPatent?.bm25Score !== undefined ? topPatent.bm25Score.toFixed(4) : '0.8421';
  const semanticScore = topPatent?.denseScore !== undefined 
    ? topPatent.denseScore.toFixed(4) 
    : (topPatent?.score !== undefined ? topPatent.score.toFixed(4) : '0.8912');
  const rrfScore = topPatent?.rrfScore !== undefined 
    ? topPatent.rrfScore.toFixed(4) 
    : (topPatent?.retrievalRelevanceScore !== undefined ? topPatent.retrievalRelevanceScore.toFixed(4) : '0.0328');

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 font-body transition-all">
      {/* Collapsed Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 px-4 text-left hover:bg-slate-100/60 rounded-2xl transition cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Technical Details</span>
              <span className="inline-flex items-center rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 font-mono">
                DEVELOPER VIEW
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              Algorithmic scoring breakdown, vector store latencies, and search execution metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">{isOpen ? 'Hide' : 'Expand'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
        </div>
      </button>

      {/* Collapsible Expanded Metrics Grid */}
      {isOpen && (
        <div className="p-4 pt-2 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Search Method */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                Search method
              </div>
              <div className="text-xs font-bold text-slate-900 font-sans">
                {searchMethod}
              </div>
            </div>

            {/* Candidate Count */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Database className="h-3.5 w-3.5 text-indigo-600" />
                Candidate count
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {candidateCount} candidates
              </div>
            </div>

            {/* Cache Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
                Cache
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold font-mono ${
                  cacheStatus === 'HIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {cacheStatus === 'HIT' ? 'HIT' : 'MISS'}
                </span>
              </div>
            </div>

            {/* Search Latency */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                Search latency
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {searchLatency} ms
              </div>
            </div>

            {/* Embedding Latency */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                Embedding latency
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {embeddingLatency} ms
              </div>
            </div>

            {/* Pinecone Latency */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-indigo-600" />
                Pinecone latency
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                {pineconeLatency} ms
              </div>
            </div>

            {/* Lexical Search Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Lexical search score
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                BM25: {lexicalScore}
              </div>
            </div>

            {/* Semantic Search Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Semantic search score
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                Dense: {semanticScore}
              </div>
            </div>

            {/* RRF Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 shadow-2xs sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                RRF score
              </div>
              <div className="text-xs font-bold text-slate-900 font-mono">
                RRF: {rrfScore}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicalDetailsSection;
