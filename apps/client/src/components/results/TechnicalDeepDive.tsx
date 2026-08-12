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
  const [subTab, setSubTab] = useState<'pipeline' | 'factors' | 'details'>('pipeline');

  return (
    <div className="space-y-6 font-body">
      {/* Sub-Tab Navigation Segmented Control */}
      <div className="flex border border-slate-200 bg-slate-100/80 p-1.5 rounded-2xl shadow-2xs">
        <button
          onClick={() => setSubTab('pipeline')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'pipeline' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Search & Analysis Pipeline
        </button>

        <button
          onClick={() => setSubTab('factors')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'factors' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Match Strength Factors
        </button>

        <button
          onClick={() => setSubTab('details')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-semibold transition ${
            subTab === 'details' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          System Technical Details
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'pipeline' && (
          <motion.div
            key="pipeline"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-600" />
                PatentIQ Search & Evidence Pipeline
              </h3>
              <span className="font-mono text-xs text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Latency: {metrics?.totalTimeMs || 145}ms
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 01</span>
                <h4 className="font-semibold text-slate-900">Feature Extraction</h4>
                <p className="text-slate-600 leading-relaxed">
                  Extracts structured technical features from the invention description.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 02</span>
                <h4 className="font-semibold text-slate-900">Prior-Art Patent Search</h4>
                <p className="text-slate-600 leading-relaxed">
                  Queries USPTO prior-art patent index with IPC classification filters.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                <span className="font-mono font-bold text-indigo-600">STAGE 03</span>
                <h4 className="font-semibold text-slate-900">Supporting Evidence Analysis</h4>
                <p className="text-slate-600 leading-relaxed">
                  Matches feature limitations against patent claims and extracts supporting text snippets.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {subTab === 'factors' && (
          <motion.div
            key="factors"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ConfidenceDashboard confidence={confidence} />
          </motion.div>
        )}

        {subTab === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-600" />
                PatentIQ Index Architecture
              </h3>
              <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 font-semibold">
                High Precision Match Engine
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800 overflow-x-auto">
                <p className="text-slate-500 font-body mb-2 text-xs font-medium">// Search Context & Classification Filters</p>
                <pre className="font-mono text-xs text-indigo-700">
{`{
  "query": "${query || 'Autonomous LiDAR drone sensor fusion'}",
  "topK": 5,
  "ipcClassificationFilter": "B64C, G06F, H02J"
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
