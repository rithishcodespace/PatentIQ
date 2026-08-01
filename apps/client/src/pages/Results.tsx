import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Sparkles, Layers, ArrowLeft, CheckCircle2 } from 'lucide-react';

import ConfidenceDashboard from '../components/results/ConfidenceDashboard';
import CitationReport from '../components/results/CitationReport';
import ResultsList from '../components/results/ResultsList';
import Modal from '../components/ui/Modal';
import { mockRagResponse } from '../data/mockData';

const Results = () => {
  const location = useLocation();
  const [selectedPatent, setSelectedPatent] = useState<any>(null);

  // If state is passed via router state use it, else default to comprehensive mock data
  const data = location.state || {
    query: mockRagResponse.query,
    results: mockRagResponse.retrievedPatents,
    confidence: mockRagResponse.confidence,
    analysis: mockRagResponse.analysis,
    overlapAnalysis: mockRagResponse.overlapAnalysis,
  };

  const confidenceBlock = data.confidence || mockRagResponse.confidence;
  const analysisData = data.analysis || mockRagResponse.analysis;
  const overlapData = data.overlapAnalysis || mockRagResponse.overlapAnalysis;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="inline-flex items-center gap-1 font-body text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Search
            </Link>
            <span className="text-slate-300">•</span>
            <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
              Qwen2.5:3b RAG Engine
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
            Semantic Prior-Art Search & RAG Novelty Analysis
          </h1>
          <p className="font-body text-xs text-slate-500 mt-0.5 max-w-3xl truncate">
            Query: "{data.query || mockRagResponse.query}"
          </p>
        </div>

        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
        >
          <Search className="h-4 w-4" />
          New Search
        </Link>
      </div>

      {/* 1. Confidence Dashboard Gauges */}
      <ConfidenceDashboard confidence={confidenceBlock} />

      {/* 2. Citation-Aware RAG Novelty Analysis */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            AI Patent Novelty & Claim Overlap Report
          </h2>
          <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Citation Grounded
          </span>
        </div>

        <CitationReport
          analysis={analysisData}
          overlapAnalysis={overlapData}
          onSelectPatent={(patentId) => {
            const found = data.results.find((p: any) => p.patentId === patentId || p.id === patentId);
            if (found) setSelectedPatent(found);
          }}
        />
      </div>

      {/* 3. Retrieved Prior Art Patents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
            <Layers className="h-5 w-5 text-indigo-600" />
            Retrieved Prior-Art Patents ({data.results?.length || 0})
          </h3>
          <span className="font-body text-xs text-slate-500">Sorted by Pinecone Similarity Score</span>
        </div>

        <ResultsList
          results={data.results}
          onView={(patent) => setSelectedPatent(patent)}
        />
      </div>

      {/* Patent Inspector Detail Modal */}
      <Modal isOpen={selectedPatent !== null} onClose={() => setSelectedPatent(null)}>
        {selectedPatent && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
                Patent Candidate #{selectedPatent.patentId || selectedPatent.id}
              </span>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                {selectedPatent.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
                  IPC: {selectedPatent.ipc}
                </span>
                {selectedPatent.similarityScore && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono font-semibold text-emerald-800">
                    Similarity: {(selectedPatent.similarityScore * 100).toFixed(1)}%
                  </span>
                )}
                {selectedPatent.owner && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                    Owner: {selectedPatent.owner}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 text-xs font-body">
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Abstract
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedPatent.abstract}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Patent Claims
                </h4>
                <p className="text-slate-700 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedPatent.claims}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;