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
  Zap,
  Code2,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const pipelineSteps = [
  {
    step: '01',
    id: 'extraction',
    title: 'Ingestion & Text Extraction',
    icon: FileText,
    badge: 'PDF · DOCX · TXT',
    summary:
      'Parses unstructured patent specifications or manual invention drafts into structured sections (Title, Abstract, Claims, Keywords, and IPC candidate classifications).',
    technicalDetails: {
      model: 'PDF/DOCX Document Parser',
      output: 'Structured JSON Payload',
      latency: '~25ms',
      features: ['Abstract chunking', 'Independent claim identification', 'Section metadata tags'],
    },
    codeSnippet: `{
  "title": "Autonomous Drone LiDAR & Optical Flow Navigation",
  "ipc": "B64C 39/02",
  "charCount": 14820,
  "claims": ["Claim 1: Flight control sensor fusion apparatus..."]
}`,
  },
  {
    step: '02',
    id: 'embedding',
    title: '768-Dim Vector Embedding Generation',
    icon: Cpu,
    badge: 'nomic-embed-text',
    summary:
      'Converts extracted patent text into a 768-dimensional dense vector space using Ollama nomic-embed-text embeddings to capture deep semantic intent rather than shallow keyword matching.',
    technicalDetails: {
      model: 'nomic-embed-text (Ollama)',
      vectorDimensions: 768,
      latency: '~32ms',
      features: ['Dense semantic vectorization', 'Contextual patent vocabulary alignment'],
    },
    codeSnippet: `const queryVector = await ollama.embeddings({
  model: 'nomic-embed-text',
  prompt: structuredInventionText,
});
// Result: 768-dimensional float32 vector array [0.0123, -0.0456, ...]` ,
  },
  {
    step: '03',
    id: 'retrieval',
    title: 'Pinecone Vector Top-K Retrieval',
    icon: Layers,
    badge: 'Pinecone Cosine Distance',
    summary:
      'Queries millions of patent vector indices in Pinecone using Cosine similarity. Supports metadata filtering by IPC section, date range, ownership, and jurisdiction.',
    technicalDetails: {
      model: 'Pinecone Serverless Index',
      distanceMetric: 'Cosine Similarity',
      latency: '~95ms',
      features: ['Top-K ranked retrieval', 'Native IPC & Country metadata filtering'],
    },
    codeSnippet: `const matches = await pineconeIndex.query({
  vector: queryVector,
  topK: 10,
  filter: { ipc: { $eq: "B64C 39/02" } },
  includeMetadata: true
});`,
  },
  {
    step: '04',
    id: 'rag',
    title: 'Citation-Grounded Novelty Analysis',
    icon: FileText,
    badge: 'Grounded RAG',
    summary:
      'Synthesizes a 7-section novelty assessment comparing your draft against top retrieved candidates. Injects inline citation pills [US-10112233-B2] and computes claim overlap strength.',
    technicalDetails: {
      model: 'Qwen2.5:3b (Ollama RAG)',
      output: 'Citation-Grounded Novelty Report',
      latency: '~1,140ms',
      features: ['Inline patent citations', 'Claim-level overlap matrix', 'Section-by-section comparison'],
    },
    codeSnippet: `const analysis = await ragService.generateNoveltyAnalysis({
  queryText,
  retrievedPatents: matches
});
// Generates grounded executive summary with [US-10112233-B2] citations`,
  },
  {
    step: '05',
    id: 'confidence',
    title: 'Heuristic Confidence Evaluation',
    icon: ShieldCheck,
    badge: '3-Gauge Reliability Score',
    summary:
      'Computes multi-factor heuristic confidence scores for Retrieval Precision, Analysis Groundedness, and Overall System Reliability to give innovators clear trust metrics.',
    technicalDetails: {
      model: 'PatentIQ Confidence Framework',
      metrics: 'Retrieval, Analysis, Overall',
      features: ['Distribution consistency', 'Metadata quality index', '7-section LLM completeness'],
    },
    codeSnippet: `const confidence = confidenceService.calculateConfidenceScore({
  topSimilarityScore: 0.92,
  candidateScores: [0.92, 0.88, 0.81],
  hasFull7Sections: true
});
// Returns { retrieval: 92.1%, analysis: 87.3%, overall: 89.2% }`,
  },
  {
    step: '06',
    id: 'persistence',
    title: 'PostgreSQL Relational Persistence',
    icon: Database,
    badge: 'Prisma Atomic DB Store',
    summary:
      'Atomically persists search queries, vector match metadata, confidence ratings, and AI novelty reports in PostgreSQL to allow instant history browsing and report reuse.',
    technicalDetails: {
      model: 'PostgreSQL + Prisma ORM',
      tables: 'SearchHistory, NoveltyAnalysis, RetrievedPatent',
      features: ['Atomic Prisma transactions', 'Reusable cached analysis reports', 'History filtering'],
    },
    codeSnippet: `await prisma.$transaction(async (tx) => {
  const searchRecord = await tx.searchHistory.create({ ... });
  await tx.noveltyAnalysis.create({ searchHistoryId: searchRecord.id, ... });
});`,
  },
];

const HowItWorksPage = () => {
  const [activeStep, setActiveStep] = useState<string>('extraction');

  const selectedPipeline = pipelineSteps.find((s) => s.id === activeStep) || pipelineSteps[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 py-6 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="code-chip bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              PATENTIQ ARCHITECTURE & RAG PIPELINE
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
              <Zap className="h-3 w-3" /> End-to-End &lt;1.5s
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl leading-tight">
            How PatentIQ Prior-Art Search & RAG Works
          </h1>

          <p className="font-body text-sm text-indigo-200 leading-relaxed sm:text-base">
            PatentIQ evaluates inventions the way a patent examiner does — combining dense vector embedding search with retrieval-augmented LLM reasoning and citation-aware overlap analysis.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/30"
            >
              <Search className="h-4 w-4" />
              Try Live Search Engine
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="http://localhost:3000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-white/10 px-5 py-3 font-body text-xs font-semibold text-indigo-200 hover:bg-white/20 transition"
            >
              <Code2 className="h-4 w-4 text-indigo-300" />
              Explore OpenAPI Swagger Specs (/docs)
            </a>
          </div>
        </div>
      </div>

      {/* Pipeline Step Selector Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            6-Step AI Retrieval & RAG Pipeline
          </h2>
          <span className="font-body text-xs text-slate-500">Click any step to view execution details</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex flex-col items-start p-4 rounded-2xl border transition text-left ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded">
                    {step.step}
                  </span>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                </div>
                <h4 className="font-display text-xs font-semibold text-slate-900 leading-tight">
                  {step.title}
                </h4>
                <span className="font-mono text-[10px] text-slate-500 mt-1 truncate max-w-full">
                  {step.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detailed View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPipeline.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-display font-bold text-lg shadow-md shadow-indigo-600/20">
                {selectedPipeline.step}
              </div>
              <div>
                <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
                  {selectedPipeline.badge}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {selectedPipeline.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="code-chip bg-slate-100 text-slate-700 text-[11px]">
                Avg. Latency: {selectedPipeline.technicalDetails.latency}
              </span>
            </div>
          </div>

          <p className="font-body text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {selectedPipeline.summary}
          </p>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Technical Highlights */}
            <div className="space-y-3">
              <h4 className="font-body text-xs font-semibold text-slate-800 uppercase tracking-wider">
                Technical Highlights & Engine Specs
              </h4>
              <div className="space-y-2 font-body text-xs">
                {selectedPipeline.technicalDetails.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="font-medium text-slate-800">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Code Implementation Snippet */}
            <div className="space-y-2">
              <h4 className="font-body text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Clean Architecture Code Flow</span>
                <span className="font-mono text-[10px] text-indigo-600">TypeScript Backend Service</span>
              </h4>
              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 text-indigo-200 font-mono text-xs overflow-x-auto shadow-inner">
                <pre>{selectedPipeline.codeSnippet}</pre>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* System Specifications Matrix */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="font-display text-xl font-bold text-slate-900">
            PatentIQ Engine Technical Specifications
          </h3>
          <p className="font-body text-xs text-slate-500 mt-1">
            Production-ready tech stack built on Clean Architecture and Fastify
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-body text-xs">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Embedding Vectorizer</span>
            <p className="font-display text-base font-semibold text-slate-900 mt-1">nomic-embed-text</p>
            <p className="text-slate-500 mt-0.5">768 Dimensions via Ollama API</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="text-slate-400 font-mono text-[10px] uppercase">RAG Inference Engine</span>
            <p className="font-display text-base font-semibold text-slate-900 mt-1">Qwen2.5:3b LLM</p>
            <p className="text-slate-500 mt-0.5">7-Section Grounded Novelty Reports</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Vector Search Database</span>
            <p className="font-display text-base font-semibold text-slate-900 mt-1">Pinecone Serverless</p>
            <p className="text-slate-500 mt-0.5">Ranked Top-K Cosine Similarity</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Relational Storage Layer</span>
            <p className="font-display text-base font-semibold text-slate-900 mt-1">PostgreSQL + Prisma</p>
            <p className="text-slate-500 mt-0.5">Atomic Search & Report Persistence</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
