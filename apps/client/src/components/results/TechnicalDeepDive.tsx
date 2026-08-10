import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layers, ShieldCheck, Database } from 'lucide-react';
import ConfidenceDashboard from './ConfidenceDashboard';

interface TechnicalDeepDiveProps {
  confidence: any;
  metrics: any;
  query: string;
}

export const TechnicalDeepDive = ({ confidence, metrics, query }: TechnicalDeepDiveProps) => {
  const [subTab, setSubTab] = useState<'rag' | 'confidence' | 'vectors'>('rag');

  return (
    <div className="space-y-6 font-body">
      {/* Sub-Tab Navigation Segmented Control */}
      <div className="flex border border-slate-200 bg-slate-100/80 p-1.5 rounded-2xl shadow-2xs">
        <button
          onClick={() => setSubTab('rag')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'rag' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4" />
          RAG Pipeline Mechanics
        </button>

        <button
          onClick={() => setSubTab('confidence')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'confidence' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Heuristic Formula Weights
        </button>

        <button
          onClick={() => setSubTab('vectors')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'vectors' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          Vector Embedding Metadata
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'rag' && (
          <motion.div
            key="rag"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-600" />
                Underlying Grounded RAG Pipeline Execution
              </h3>
              <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Latency: {metrics?.totalTimeMs || 145}ms
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 01</span>
                <h4 className="font-semibold text-slate-900">Dense Vector Query Embedding</h4>
                <p className="text-slate-600 leading-relaxed">
                  Converts invention query into 768-dimensional float32 vector using Ollama nomic-embed-text.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 02</span>
                <h4 className="font-semibold text-slate-900">Pinecone Hybrid Cosine Search</h4>
                <p className="text-slate-600 leading-relaxed">
                  Queries Top-10 nearest neighbor vectors with PostgreSQL IPC classification metadata masks.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 03</span>
                <h4 className="font-semibold text-slate-900">Citation-Grounded LLM Prompt</h4>
                <p className="text-slate-600 leading-relaxed">
                  Synthesizes novelty analysis enforcing strict inline citations [US-XXXXXXX-B2] from retrieved snippets.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {subTab === 'confidence' && (
          <motion.div
            key="confidence"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ConfidenceDashboard confidence={confidence} />
          </motion.div>
        )}

        {subTab === 'vectors' && (
          <motion.div
            key="vectors"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                Pinecone Vector Store Metadata
              </h3>
              <span className="font-mono text-xs text-slate-500">768-Dim Dense Vectors</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-indigo-200 overflow-x-auto">
                <p className="text-slate-400 font-body mb-2">// Query Vector Transformation Payload</p>
                <pre>
{`{
  "query": "${query || 'Drone sensor fusion'}",
  "vectorDimensions": 768,
  "metric": "cosine",
  "topK": 10,
  "ipcFilter": "B64C, G06F, H02J"
}`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TechnicalDeepDive;
