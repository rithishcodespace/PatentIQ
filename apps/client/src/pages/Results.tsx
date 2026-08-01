import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Layers,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Download,
  FileText,
  CheckCircle2,
} from 'lucide-react';

import ConfidenceDashboard from '../components/results/ConfidenceDashboard';
import CitationReport from '../components/results/CitationReport';
import ResultsList from '../components/results/ResultsList';
import Modal from '../components/ui/Modal';
import { mockRagResponse } from '../data/mockData';

const Results = () => {
  const location = useLocation();
  const [selectedPatent, setSelectedPatent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'novelty' | 'candidates' | 'confidence'>('novelty');

  // Router state or fallback mock data
  const data = location.state || {
    query: mockRagResponse.query,
    results: mockRagResponse.retrievedPatents,
    confidence: mockRagResponse.confidence,
    analysis: mockRagResponse.analysis,
    overlapAnalysis: mockRagResponse.overlapAnalysis,
    metrics: mockRagResponse.metrics,
  };

  const confidenceBlock = data.confidence || mockRagResponse.confidence;
  const analysisData = data.analysis || mockRagResponse.analysis;
  const overlapData = data.overlapAnalysis || mockRagResponse.overlapAnalysis;
  const metricsData = data.metrics || mockRagResponse.metrics;

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `patent_iq_analysis_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* 1. Streamlined Top Workstation Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Search
          </Link>

          {/* Active Query Pill */}
          <div className="flex items-center gap-2 min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="font-body text-xs text-slate-500 font-medium shrink-0">Target Query:</span>
            <span className="font-body text-xs font-semibold text-slate-900 truncate max-w-md">
              "{data.query || mockRagResponse.query}"
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 font-mono text-[11px] text-slate-500 bg-slate-100/70 px-2.5 py-1 rounded-lg">
            <Zap className="h-3 w-3 text-indigo-600" />
            {metricsData.totalTimeMs}ms
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-body text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export Report (JSON)
          </button>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            New Search
          </Link>
        </div>
      </div>

      {/* 2. Executive Metric Tiles KPI Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-body">
        {/* KPI 1: Overall Confidence */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overall Analysis Confidence</span>
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              {confidenceBlock.overall.score.toFixed(1)}%
            </span>
            <span className="code-chip bg-indigo-50 text-indigo-800 text-[10px]">
              {confidenceBlock.overall.level}
            </span>
          </div>
        </div>

        {/* KPI 2: Top Match Similarity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Top Prior-Art Match</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              {((data.results?.[0]?.similarityScore || 0.92) * 100).toFixed(0)}%
            </span>
            <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
              #{data.results?.[0]?.patentId || 'US-10112233-B2'}
            </span>
          </div>
        </div>

        {/* KPI 3: Total Retrieved Candidates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Retrieved Candidates</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              {data.results?.length || 3}
            </span>
            <span className="code-chip bg-slate-100 text-slate-600 text-[10px]">
              Top-K Ranked
            </span>
          </div>
        </div>

        {/* KPI 4: Overlapping Claims */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Overlapping Claim Conflicts</span>
            <FileText className="h-4 w-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold text-slate-900">
              {metricsData.overlappingClaimsCount || 3}
            </span>
            <span className="code-chip bg-slate-100 text-slate-700 text-[10px]">
              Verified Claims
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Workstation Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('novelty')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-body text-xs font-medium transition ${
            activeTab === 'novelty'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-4 w-4" />
          Prior-Art Novelty & Overlap Synthesis
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-body text-xs font-medium transition ${
            activeTab === 'candidates'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" />
          Retrieved Prior-Art Patents ({data.results?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('confidence')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-body text-xs font-medium transition ${
            activeTab === 'confidence'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Heuristic Confidence Evaluation
        </button>
      </div>

      {/* 4. Tab Contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'novelty' && (
          <motion.div
            key="novelty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-indigo-600" />
                Citation-Aware Novelty & Claim Overlap Analysis
              </h2>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                <CheckCircle2 className="h-3 w-3 text-indigo-600" /> Grounded Analysis
              </span>
            </div>

            <CitationReport
              analysis={analysisData}
              overlapAnalysis={overlapData}
              onSelectPatent={(patentId) => {
                const found = data.results.find(
                  (p: any) => p.patentId === patentId || p.id === patentId
                );
                if (found) setSelectedPatent(found);
              }}
            />
          </motion.div>
        )}

        {activeTab === 'candidates' && (
          <motion.div
            key="candidates"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Prior-Art Vector Search Candidates
              </h3>
              <span className="font-body text-xs text-slate-500">
                Ranked by Pinecone Cosine Similarity
              </span>
            </div>

            <ResultsList
              results={data.results}
              onView={(patent) => setSelectedPatent(patent)}
            />
          </motion.div>
        )}

        {activeTab === 'confidence' && (
          <motion.div
            key="confidence"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ConfidenceDashboard confidence={confidenceBlock} />
          </motion.div>
        )}
      </AnimatePresence>

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
                  IPC: {selectedPatent.ipc || 'G06F 16/90'}
                </span>
                {(selectedPatent.similarityScore || selectedPatent.similarity) && (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono font-semibold text-emerald-800">
                    Similarity: {
                      typeof selectedPatent.similarityScore === 'number'
                        ? (selectedPatent.similarityScore * 100).toFixed(1)
                        : selectedPatent.similarity
                    }%
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