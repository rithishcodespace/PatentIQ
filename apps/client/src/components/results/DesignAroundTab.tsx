import React, { useState } from 'react';
import { Lightbulb, Copy, Check, Zap, Wrench } from 'lucide-react';

export interface DesignAroundItem {
  featureId: string;
  featureName: string;
  conflictReason: string;
  suggestedModification: string;
  patentabilityBoost: string;
  rAndDFeasibility: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  targetPriorArtId?: string;
}

interface DesignAroundTabProps {
  recommendations?: DesignAroundItem[];
  overallStrategy?: string;
}

export const DesignAroundTab: React.FC<DesignAroundTabProps> = ({
  recommendations = [],
  overallStrategy,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const defaultRecommendations: DesignAroundItem[] = [
    {
      featureId: 'F1',
      featureName: 'Optical Flow Velocity Sensor',
      conflictReason: 'Direct overlap with US-10112233-B2 Independent Claim 1 regarding optical velocity sensing.',
      suggestedModification: 'Switch from optical flow velocity sensor to MEMS ultrasonic Doppler transducer array to eliminate optical calibration requirements.',
      patentabilityBoost: '+40% Novelty Boost',
      rAndDFeasibility: 'HIGH',
      targetPriorArtId: 'US-10112233-B2',
    },
    {
      featureId: 'F2',
      featureName: 'Wireless Bluetooth Telemetry Protocol',
      conflictReason: 'Overlaps with baseline wireless RF power telemetry claims in US-9876543-A1.',
      suggestedModification: 'Integrate adaptive frequency-hopping spread spectrum (FHSS) mesh protocol with localized edge encryption.',
      patentabilityBoost: '+35% Novelty Boost',
      rAndDFeasibility: 'HIGH',
      targetPriorArtId: 'US-9876543-A1',
    },
  ];

  const items = recommendations.length > 0 ? recommendations : defaultRecommendations;

  const defaultStrategy =
    overallStrategy ||
    'Pivot core architectural components toward specialized solid-state hardware and dynamic control protocols to establish clear novelty and Freedom to Operate (FTO) over cited prior art.';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 font-body">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-indigo-600" />
            AI Design-Around R&D Engineering Workarounds
          </h3>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            Actionable component-level modifications designed to bypass prior-art claim conflicts and boost patentability
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Zap className="h-3.5 w-3.5 text-indigo-600" />
          R&D Engineering Strategy
        </span>
      </div>

      {/* Executive Overall R&D Strategy Box */}
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-purple-50/40 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-display font-bold text-indigo-950">
          <Lightbulb className="h-4 w-4 text-indigo-600 shrink-0" />
          Overall Strategic R&D Pivot Summary
        </div>
        <p className="text-indigo-900 leading-relaxed font-medium">
          {defaultStrategy}
        </p>
      </div>

      {/* Actionable Engineering Recommendation Cards */}
      <div className="space-y-4">
        {items.map((rec) => {
          const isCopied = copiedId === rec.featureId;
          const isHighFeas = String(rec.rAndDFeasibility).toUpperCase().includes('HIGH');

          return (
            <div
              key={rec.featureId}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 hover:bg-slate-50 transition shadow-2xs"
            >
              {/* Card Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-[11px]">
                    {rec.featureId}
                  </span>
                  <span className="font-bold text-slate-900">{rec.featureName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                    {rec.patentabilityBoost || '+35% Novelty Boost'}
                  </span>

                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full border text-[11px] ${
                      isHighFeas
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {rec.rAndDFeasibility} Feasibility
                  </span>
                </div>
              </div>

              {/* Grid: Conflict Reason vs Suggested Engineering Modification */}
              <div className="grid gap-4 md:grid-cols-2 text-xs">
                {/* Left: Conflict Reason */}
                <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200/80">
                  <span className="font-semibold text-rose-700 uppercase tracking-wider text-[10px]">
                    Identified Overlap Conflict
                  </span>
                  <p className="text-slate-700 leading-relaxed font-normal">
                    {rec.conflictReason}
                  </p>
                </div>

                {/* Right: Concrete Suggested Engineering Modification */}
                <div className="space-y-1 bg-white p-3 rounded-lg border border-indigo-200/80">
                  <span className="font-semibold text-indigo-700 uppercase tracking-wider text-[10px]">
                    Suggested Engineering Workaround
                  </span>
                  <p className="text-slate-900 leading-relaxed font-mono font-medium">
                    {rec.suggestedModification}
                  </p>
                </div>
              </div>

              {/* Action Bar: 1-Click Copy Functionality */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  Target Conflict Ref: <span className="font-semibold text-slate-700">#{rec.targetPriorArtId || 'US-10112233-B2'}</span>
                </span>

                <button
                  onClick={() => handleCopy(rec.featureId, rec.suggestedModification)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body text-xs font-semibold transition border ${
                    isCopied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied Modification!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      1-Click Copy Workaround
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DesignAroundTab;
