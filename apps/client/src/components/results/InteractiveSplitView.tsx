import React, { useState } from 'react';
import { Columns, FileText, Bookmark, Lightbulb } from 'lucide-react';

interface InteractiveSplitViewProps {
  userQuery: string;
  features?: Array<{ id: string; name: string; description: string }>;
  patents?: Array<{
    patentId: string;
    title: string;
    claims?: string;
    abstract?: string;
    ipc?: string;
    similarityScore?: number;
    owner?: string;
  }>;
}

export const InteractiveSplitView: React.FC<InteractiveSplitViewProps> = ({
  userQuery,
  features = [],
  patents = [],
}) => {
  const [selectedPatentId, setSelectedPatentId] = useState<string>(
    patents[0]?.patentId || 'US-10112233-B2'
  );

  const activePatent = patents.find((p) => p.patentId === selectedPatentId) || patents[0];

  const defaultFeatures = [
    {
      id: 'F1',
      name: 'Resonant Inductive Wireless Charger',
      description: 'Multi-coil inductive transmitter with dynamic impedance matching feedback loop.',
    },
    {
      id: 'F2',
      name: 'Autonomous LiDAR & Optical Sensor Fusion',
      description: 'Real-time spatial point cloud aggregation protocol for edge AI obstacle mapping.',
    },
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 font-body">
      {/* Top Header & Patent Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Columns className="h-4 w-4 text-indigo-600" />
            Interactive Side-by-Side Limitation & Claim Split Inspector
          </h3>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            Compare user disclosure features side-by-side with prior-art claim text and matching snippets
          </p>
        </div>

        {/* Prior-Art Patent Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
          {patents.map((p) => (
            <button
              key={p.patentId}
              onClick={() => setSelectedPatentId(p.patentId)}
              className={`rounded-lg px-3 py-1 font-body text-xs font-semibold transition shrink-0 ${
                selectedPatentId === p.patentId
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              #{p.patentId}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Pane Side-by-Side Grid */}
      <div className="grid gap-6 md:grid-cols-2 text-xs">
        {/* LEFT PANE: User Invention Disclosure & Extracted Features */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-display font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" />
              Your Invention Disclosure
            </span>
            <span className="code-chip text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
              Submitted Query
            </span>
          </div>

          {/* User Query Box */}
          <div className="bg-white p-3 rounded-lg border border-slate-200/80 font-mono text-slate-800 leading-relaxed">
            "{userQuery || 'Autonomous drone sensor fusion and wireless inductive charging system'}"
          </div>

          {/* Extracted Technical Limitations / Features */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              Extracted Technical Limitations ({displayFeatures.length})
            </span>

            <div className="space-y-2">
              {displayFeatures.map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 font-mono text-[11px]">
                      [{f.id}] {f.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                      Element Limitation
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Selected Prior-Art Patent Claims & Snippets */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="font-display font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-indigo-600" />
              Cited Patent Reference
            </span>
            {activePatent && (
              <span className="font-mono font-bold text-indigo-700 text-[11px]">
                #{activePatent.patentId}
              </span>
            )}
          </div>

          {activePatent ? (
            <div className="space-y-3">
              {/* Patent Title & IPC */}
              <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
                <h4 className="font-bold text-slate-900 text-xs">
                  {activePatent.title}
                </h4>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {activePatent.ipc && (
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      IPC: {activePatent.ipc}
                    </span>
                  )}
                  {activePatent.owner && (
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                      Assignee: {activePatent.owner}
                    </span>
                  )}
                </div>
              </div>

              {/* Patent Claims Box with Highlighted Snippets */}
              <div className="space-y-1">
                <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
                  Recited Independent Claim Disclosures
                </span>
                <div className="bg-white p-3 rounded-lg border border-slate-200/80 font-mono text-slate-800 leading-relaxed text-[11px] max-h-60 overflow-y-auto">
                  {activePatent.claims || activePatent.abstract || '1. An apparatus comprising a sensing array and processing unit configured to process telemetry data.'}
                </div>
              </div>

              {/* Claim Comparison Highlights */}
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  Matching Snippet Highlight:
                </div>
                <p className="text-amber-800 text-[11px] font-mono leading-relaxed">
                  "[Claims 1-3]: ...optical image sensor, laser radar scanner, and central processing unit mapping spatial vectors..."
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500">
              Select a prior-art patent to inspect claims side-by-side.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSplitView;
