import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Zap, Info } from 'lucide-react';

interface ExecutiveRiskCardProps {
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | string;
  riskScore: number; // 0 - 100
  executiveRationale: string;
  evaluatedFeaturesCount?: number;
  evaluatedPatentsCount?: number;
  singleReferenceCoverageLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  singleReferenceCoverageScore?: number;
  distributedOverlapLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  distributedOverlapScore?: number;
  distinctFeatures?: string[];
  evidenceConfidenceLevel?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

export const ExecutiveRiskCard: React.FC<ExecutiveRiskCardProps> = ({
  riskLevel,
  riskScore,
  executiveRationale,
  evaluatedFeaturesCount = 0,
  evaluatedPatentsCount = 0,
  singleReferenceCoverageLevel = 'LOW',
  singleReferenceCoverageScore = 0,
  distributedOverlapLevel = 'LOW',
  distributedOverlapScore = 0,
  distinctFeatures = [],
  evidenceConfidenceLevel = 'LOW',
}) => {
  const normRisk = String(riskLevel).toUpperCase();
  const isHigh = normRisk.includes('HIGH');
  const isMod = normRisk.includes('MODERATE') || normRisk.includes('MEDIUM');

  let riskLabel = 'LOW';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let gaugeColor = '#10b981'; // emerald-500
  let Icon = CheckCircle2;

  if (isHigh) {
    riskLabel = 'HIGH';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
    gaugeColor = '#f43f5e'; // rose-500
    Icon = ShieldAlert;
  } else if (isMod) {
    riskLabel = 'MEDIUM';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    gaugeColor = '#f59e0b'; // amber-500
    Icon = AlertTriangle;
  }

  let formattedRationale = executiveRationale;
  if (!formattedRationale || formattedRationale.trim().length < 10) {
    formattedRationale = `Evaluation of ${evaluatedFeaturesCount} extracted technical claim limitations against ${evaluatedPatentsCount} retrieved prior-art disclosures indicates element-level overlap across cited references.`;
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
              AI Prior-Art Assessment
            </h2>
            <p className="font-body text-xs text-slate-500">
              Element-level claim limitation & evidence analysis across cited prior-art references
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badgeBg}`}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: gaugeColor }} />
            AI Prior-Art Risk: {riskLabel} ({riskScore}%)
          </span>
        </div>
      </div>

      {/* Grid: Left Radial Score & Right Metrics Breakdown */}
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

          <span className="font-body text-xs font-semibold text-slate-700">
            {isHigh ? 'High Prior-Art Conflict (35 U.S.C. 102)' : isMod ? 'Moderate Overlap (35 U.S.C. 103)' : 'Low Overlap Risk'}
          </span>
        </div>

        {/* Right Column: Structured Assessment Metrics */}
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

          {/* 4-Item Assessment Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-body text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Single-Reference</div>
              <div className="font-bold text-slate-900">{singleReferenceCoverageLevel} ({singleReferenceCoverageScore}%)</div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Distributed Overlap</div>
              <div className="font-bold text-slate-900">{distributedOverlapLevel} ({distributedOverlapScore}%)</div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Distinct Features</div>
              <div className="font-bold text-indigo-600">{distinctFeatures.length > 0 ? `${distinctFeatures.length} (${distinctFeatures.slice(0, 3).join(', ')})` : '0 Features'}</div>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-200 bg-white/80 space-y-0.5">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Evidence Confidence</div>
              <div className="font-bold text-emerald-600">{evidenceConfidenceLevel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-[11px] text-amber-900 font-body">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <strong>Legal Disclaimer:</strong> This AI-generated assessment is for prior-art research and technical overlap analysis. It does not constitute legal advice or a legal determination of patentability or freedom to operate.
        </p>
      </div>
    </div>
  );
};

export default ExecutiveRiskCard;
