import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Zap, Layers } from 'lucide-react';

interface ExecutiveRiskCardProps {
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | string;
  riskScore: number; // 0 - 100
  executiveRationale: string;
  evaluatedFeaturesCount?: number;
  evaluatedPatentsCount?: number;
}

export const ExecutiveRiskCard: React.FC<ExecutiveRiskCardProps> = ({
  riskLevel,
  riskScore,
  executiveRationale,
  evaluatedFeaturesCount = 3,
  evaluatedPatentsCount = 2,
}) => {
  const normRisk = String(riskLevel).toUpperCase();
  const isHigh = normRisk.includes('HIGH');
  const isMod = normRisk.includes('MODERATE') || normRisk.includes('MEDIUM');

  let levelText = 'Low Novelty Risk';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let gaugeColor = '#10b981'; // emerald-500
  let Icon = ShieldCheck;
  let ftoStatus = 'Strong Freedom to Operate (FTO)';
  let ftoBadge = 'bg-emerald-100 text-emerald-800';

  if (isHigh) {
    levelText = 'High Overlap Risk';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
    gaugeColor = '#f43f5e'; // rose-500
    Icon = ShieldAlert;
    ftoStatus = 'High Prior-Art Conflict Risk';
    ftoBadge = 'bg-rose-100 text-rose-800';
  } else if (isMod) {
    levelText = 'Moderate Overlap Risk';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    gaugeColor = '#f59e0b'; // amber-500
    Icon = AlertTriangle;
    ftoStatus = 'Obviousness Review Advised';
    ftoBadge = 'bg-amber-100 text-amber-800';
  }

  // Ensure 2-sentence rationale summary
  let formattedRationale = executiveRationale;
  if (!formattedRationale || formattedRationale.trim().length < 10) {
    formattedRationale =
      'The submitted invention disclosure demonstrates strong novelty with low prior-art claim overlap across database matches. Further dependent claim refinement is recommended prior to filing.';
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 p-6 shadow-xs space-y-5 font-body">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border shadow-2xs ${badgeBg}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              Executive Patentability & Novelty Verdict
            </h2>
            <p className="font-body text-xs text-slate-500">
              Citation-grounded analysis across global prior art databases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: gaugeColor }} />
            {levelText} ({riskScore}% Overlap Risk)
          </span>
          <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold ${ftoBadge}`}>
            {ftoStatus}
          </span>
        </div>
      </div>

      {/* Grid: Left Gauge & Right Executive Rationale */}
      <div className="grid gap-6 md:grid-cols-12 items-center">
        {/* Left Column: Radial Risk Score Dial */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-2">
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${riskScore}, 100`}
                strokeLinecap="round"
                stroke={gaugeColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-2xl font-black text-slate-900">{riskScore}%</span>
              <span className="font-body text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
            </div>
          </div>

          <span className="font-body text-xs font-medium text-slate-600">
            {isHigh ? 'Anticipation Risk (35 U.S.C. 102)' : isMod ? 'Obviousness Risk (35 U.S.C. 103)' : 'Distinct Patentable Features'}
          </span>
        </div>

        {/* Right Column: 2-Sentence Executive Rationale */}
        <div className="md:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2 shadow-2xs">
            <span className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-indigo-600" />
              Executive Rationale Summary
            </span>
            <p className="font-body text-xs text-slate-700 leading-relaxed font-normal">
              {formattedRationale}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 font-body text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">{evaluatedFeaturesCount} Features</div>
                <div className="text-[10px] text-slate-500 font-medium">Deconstructed</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">{evaluatedPatentsCount} Prior Art</div>
                <div className="text-[10px] text-slate-500 font-medium font-mono">Patents Matched</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900">35 U.S.C. 102/103</div>
                <div className="text-[10px] text-slate-500 font-medium">Statutory Check</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveRiskCard;
