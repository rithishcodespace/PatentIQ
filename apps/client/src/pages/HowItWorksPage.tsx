import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  ArrowRight,
  Search,
  Code2,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const pipelineSteps = [
  {
    step: '01',
    id: 'extraction',
    title: 'Text Extraction & Processing',
    icon: FileText,
    badge: 'Document Parsing',
    summary:
      'Parses unstructured patent specifications or manual invention drafts into structured sections (Title, Abstract, Claims, Keywords).',
    technicalDetails: {
      model: 'Document Processing Engine',
      output: 'Structured Section Payload',
      latency: '~25ms',
      features: ['Abstract chunking', 'Independent claim identification', 'Section metadata tags'],
    },
    codeSnippet: `{
  "title": "Autonomous Drone LiDAR Navigation",
  "ipc": "B64C 39/02",
  "claims": ["Claim 1: Flight control sensor fusion apparatus..."]
}`,
  },
  {
    step: '02',
    id: 'embedding',
    title: 'Vector Embedding Generation',
    icon: Cpu,
    badge: 'Dense Semantic Vector',
    summary:
      'Converts extracted patent text into a dense vector space to capture deep technical meaning rather than shallow keyword matching.',
    technicalDetails: {
      model: 'Embedding Vectorizer',
      vectorDimensions: 768,
      latency: '~32ms',
      features: ['Dense semantic vectorization', 'Contextual patent vocabulary alignment'],
    },
    codeSnippet: `const queryVector = await embeddingService.generateVector(structuredText);
// Returns dense vector float array`,
  },
  {
    step: '03',
    id: 'retrieval',
    title: 'Vector Prior-Art Retrieval',
    icon: Layers,
    badge: 'Ranked Similarity',
    summary:
      'Queries millions of patent vector indices using Cosine similarity. Supports filtering by section, date range, ownership, and jurisdiction.',
    technicalDetails: {
      model: 'Vector Search Index',
      distanceMetric: 'Cosine Similarity',
      latency: '~95ms',
      features: ['Top-K ranked retrieval', 'IPC & Country metadata filtering'],
    },
    codeSnippet: `const matches = await searchService.querySimilarPatents({
  vector: queryVector,
  topK: 10
});`,
  },
  {
    step: '04',
    id: 'rag',
    title: 'Grounded Novelty Analysis',
    icon: FileText,
    badge: 'Citation Report',
    summary:
      'Synthesizes a detailed novelty assessment comparing your draft against top retrieved candidates with inline patent citations and claim overlap matrix.',
    technicalDetails: {
      model: 'Grounded Analysis Engine',
      output: 'Citation Novelty Report',
      latency: '~1,140ms',
      features: ['Inline patent citations', 'Claim-level overlap matrix', 'Section-by-section comparison'],
    },
    codeSnippet: `const report = await noveltyService.analyzeOverlap({
  queryText,
  retrievedPatents: matches
});`,
  },
  {
    step: '05',
    id: 'confidence',
    title: 'Confidence & Reliability Rating',
    icon: ShieldCheck,
    badge: 'Multi-Factor Rating',
    summary:
      'Computes multi-factor confidence scores for Retrieval Precision, Analysis Groundedness, and Overall System Reliability.',
    technicalDetails: {
      model: 'Confidence Metric Engine',
      metrics: 'Retrieval, Analysis, Overall',
      features: ['Distribution consistency', 'Metadata quality index', 'Report completeness'],
    },
    codeSnippet: `const confidence = confidenceService.calculateScore(matches, report);`,
  },
  {
    step: '06',
    id: 'persistence',
    title: 'History & Report Persistence',
    icon: Database,
    badge: 'Database Storage',
    summary:
      'Atomically persists search queries, vector match metadata, confidence ratings, and novelty reports for instant browsing and re-export.',
    technicalDetails: {
      model: 'Relational Database Store',
      tables: 'SearchHistory, NoveltyAnalysis',
      features: ['Atomic database transactions', 'Reusable cached reports', 'Search history management'],
    },
    codeSnippet: `await historyService.saveSearchRecord({ query, results, analysis });`,
  },
];

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState<string>('extraction');

  const selectedPipeline = pipelineSteps.find((s) => s.id === activeStep) || pipelineSteps[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 py-4 px-4 sm:px-6">
      {/* Clean Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            How Prior-Art Search & Analysis Works
          </h1>

          <p className="font-body text-sm text-slate-600 leading-relaxed">
            PatentIQ evaluates inventions by combining dense vector similarity retrieval with citation-grounded claim overlap analysis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-body text-xs font-semibold text-white hover:bg-blue-500 transition shadow-xs"
            >
              <Search className="h-4 w-4" />
              Try Search Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="http://localhost:5000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Code2 className="h-4 w-4 text-blue-600" />
              API Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Pipeline Step Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900">
            End-to-End Processing Steps
          </h2>
          <span className="font-body text-xs text-slate-500">Select step to view execution flow</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex flex-col items-start p-4 rounded-xl border transition text-left ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded">
                    {step.step}
                  </span>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="font-display text-xs font-semibold text-slate-900 leading-tight">
                  {step.title}
                </h4>
                <span className="font-body text-[11px] text-slate-500 mt-1 truncate max-w-full">
                  {step.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPipeline.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-display font-bold text-base">
                {selectedPipeline.step}
              </div>
              <div>
                <span className="code-chip text-[10px]">
                  {selectedPipeline.badge}
                </span>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
                  {selectedPipeline.title}
                </h3>
              </div>
            </div>

            <span className="font-body text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Latency: {selectedPipeline.technicalDetails.latency}
            </span>
          </div>

          <p className="font-body text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {selectedPipeline.summary}
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-body text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Key Features
              </h4>
              <div className="space-y-2 font-body text-xs">
                {selectedPipeline.technicalDetails.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-body text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Execution Flow
              </h4>
              <div className="rounded-xl border border-slate-900 bg-slate-950 p-4 text-blue-200 font-mono text-xs overflow-x-auto">
                <pre>{selectedPipeline.codeSnippet}</pre>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HowItWorksPage;
