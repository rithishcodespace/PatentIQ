import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Cpu,
  ArrowRightLeft,
  Layers,
  Zap,
} from 'lucide-react';
import { mockExtractedDocument, mockRagResponse } from '../../data/mockData';
import CitationReport from '../results/CitationReport';
import ConfidenceDashboard from '../results/ConfidenceDashboard';

const UploadCompareView = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<typeof mockExtractedDocument | null>(null);
  const [compareResults, setCompareResults] = useState<typeof mockRagResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'extracted' | 'compare'>('upload');

  const handleSimulatedUpload = (_file: File) => {
    setIsProcessing(true);
    setUploadProgress(20);

    setTimeout(() => setUploadProgress(50), 300);
    setTimeout(() => setUploadProgress(85), 600);

    setTimeout(() => {
      setUploadProgress(100);
      setIsProcessing(false);
      setExtractedData(mockExtractedDocument);
      setCompareResults(mockRagResponse);
      setActiveTab('extracted');
    }, 900);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="code-chip bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PATENT DOCUMENT INGESTION & COMPARISON
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                PDF · DOCX · TXT Supported
              </span>
            </div>
            <h2 className="font-display text-2xl font-semibold mt-2">
              Upload Invention Draft & Compare Prior Art
            </h2>
            <p className="font-body text-xs text-indigo-200 mt-1 max-w-2xl">
              Extract structured sections (Abstract, Claims, Description), generate 768-dim embeddings via nomic-embed-text, and run similarity comparison against vector database.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur">
            <button
              onClick={() => setActiveTab('upload')}
              className={`rounded-lg px-3 py-1.5 font-body text-xs font-medium transition ${
                activeTab === 'upload' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-indigo-200'
              }`}
            >
              1. Upload File
            </button>
            <button
              onClick={() => extractedData && setActiveTab('extracted')}
              disabled={!extractedData}
              className={`rounded-lg px-3 py-1.5 font-body text-xs font-medium transition ${
                activeTab === 'extracted'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-indigo-200 opacity-60'
              }`}
            >
              2. Extracted Text
            </button>
            <button
              onClick={() => compareResults && setActiveTab('compare')}
              disabled={!compareResults}
              className={`rounded-lg px-3 py-1.5 font-body text-xs font-medium transition ${
                activeTab === 'compare'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-indigo-200 opacity-60'
              }`}
            >
              3. Prior Art Comparison
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Tab 1: File Upload Dropzone */}
        {activeTab === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  handleSimulatedUpload(e.dataTransfer.files[0]);
                }
              }}
              className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/20 p-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <UploadCloud className="h-8 w-8" />
              </div>

              <h3 className="font-display text-xl font-semibold text-slate-900">
                Drag & Drop your Patent Specification file
              </h3>
              <p className="font-body text-xs text-slate-500 mt-1">
                Supports PDF, DOCX, or TXT format up to 25MB
              </p>

              <div className="mt-6">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-body text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition">
                  <FileText className="h-4 w-4" />
                  Select File from Computer
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleSimulatedUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Demo Fast Preset Trigger */}
              <div className="mt-8 pt-6 border-t border-indigo-100 flex items-center justify-center gap-3">
                <span className="font-body text-xs text-slate-500">Quick Test Preset:</span>
                <button
                  onClick={() =>
                    handleSimulatedUpload(
                      new File(['sample text'], 'Invention_Draft_Drone_Sensor_Fusion_2026.pdf', {
                        type: 'application/pdf',
                      })
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 font-body text-xs font-semibold text-indigo-700 hover:bg-indigo-50 shadow-xs"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Load Sample Patent PDF Document
                </button>
              </div>
            </div>

            {/* Uploading Progress State */}
            {isProcessing && (
              <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-indigo-600 animate-spin" />
                    Extracting Sections & Computing 768-dim Embeddings...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Extracted Text & Vector Embedding Card */}
        {activeTab === 'extracted' && extractedData && (
          <motion.div
            key="extracted"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Vector Status Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-emerald-950 flex items-center gap-2">
                    768-Dimensional Embedding Generated
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </h4>
                  <p className="font-mono text-xs text-emerald-700">
                    Model: {extractedData.embeddingStatus.model} · Latency: {extractedData.embeddingStatus.latencyMs}ms
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('compare')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Compare Against Patent Database
              </button>
            </div>

            {/* Extracted Document Metadata */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="code-chip bg-slate-100 text-slate-700 text-[10px]">
                    Extracted Specification
                  </span>
                  <h3 className="font-display text-lg font-semibold text-slate-900 mt-1">
                    {extractedData.sections.title}
                  </h3>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>File: <span className="font-mono font-medium text-slate-800">{extractedData.filename}</span></p>
                  <p>Length: {extractedData.wordCount} words ({extractedData.charCount} chars)</p>
                </div>
              </div>

              <div className="space-y-3 font-body text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                    Candidate IPC Classification:
                  </span>
                  <p className="font-mono font-semibold text-indigo-700 mt-0.5">
                    {extractedData.sections.ipcCandidate}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                    Extracted Abstract:
                  </span>
                  <p className="text-slate-700 leading-relaxed mt-1">{extractedData.sections.abstract}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                    Parsed Claim 1:
                  </span>
                  <p className="text-slate-700 font-mono leading-relaxed mt-1">{extractedData.sections.claims}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Side-by-side Prior Art Comparison & RAG Report */}
        {activeTab === 'compare' && compareResults && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Confidence Gauges */}
            <ConfidenceDashboard confidence={compareResults.confidence} />

            {/* Side-by-side Document vs Prior Art Cards */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column: Uploaded Invention Document */}
              <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="flex items-center gap-2 font-display text-sm font-semibold text-indigo-900">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    Uploaded Invention Specification
                  </span>
                  <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">Target Draft</span>
                </div>
                <h4 className="font-display text-base font-semibold text-slate-900 mb-2">
                  {mockExtractedDocument.sections.title}
                </h4>
                <p className="font-body text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {mockExtractedDocument.sections.abstract}
                </p>
              </div>

              {/* Right Column: Top Retrived Prior Art Patent */}
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
                    <Layers className="h-4 w-4 text-amber-500" />
                    Top Prior Art Match [US-10112233-B2]
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    92% Similarity Match
                  </span>
                </div>
                <h4 className="font-display text-base font-semibold text-slate-900 mb-2">
                  {mockRagResponse.retrievedPatents[0]?.title}
                </h4>
                <p className="font-body text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {mockRagResponse.retrievedPatents[0]?.abstract}
                </p>
              </div>
            </div>

            {/* Citation-Aware RAG Novelty Report */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900 mb-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                Comparison Novelty & Overlap Analysis
              </h3>
              <CitationReport
                analysis={compareResults.analysis}
                overlapAnalysis={compareResults.overlapAnalysis}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadCompareView;
