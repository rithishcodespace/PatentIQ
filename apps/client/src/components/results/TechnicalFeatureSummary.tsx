import React from 'react';
import { CheckCircle2, AlertCircle, MinusCircle } from 'lucide-react';

export interface TechnicalFeatureItem {
  id: string;
  name: string;
  description?: string;
  status: 'MATCH' | 'PARTIAL_MATCH' | 'NOT_FOUND';
  confidence?: number;
}

export interface TechnicalFeatureSummaryProps {
  features: TechnicalFeatureItem[];
  selectedFeatureId?: string | null;
  onSelectFeature?: (featureId: string) => void;
  className?: string;
  title?: string;
}

export const TechnicalFeatureSummary: React.FC<TechnicalFeatureSummaryProps> = ({
  features,
  selectedFeatureId,
  onSelectFeature,
  className = '',
  title = 'Technical Features',
}) => {
  if (!features || features.length === 0) {
    return (
      <div className={`p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-body ${className}`}>
        No technical features available.
      </div>
    );
  }

  const matchCount = features.filter((f) => f.status === 'MATCH').length;
  const partialCount = features.filter((f) => f.status === 'PARTIAL_MATCH').length;
  const totalMatched = matchCount + partialCount;

  return (
    <div className={`space-y-3 font-body ${className}`}>
      {/* Header & Match Count */}
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/70">
          {totalMatched} of {features.length} matched
        </span>
      </div>

      {/* Clean Single-Column Feature Checklist */}
      <div
        className="space-y-2"
        role="tablist"
        aria-label="Technical feature summary checklist"
      >
        {features.map((feature) => {
          const isSelected = selectedFeatureId === feature.id;

          const getStatusConfig = () => {
            switch (feature.status) {
              case 'MATCH':
                return {
                  label: 'Match',
                  icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                };
              case 'PARTIAL_MATCH':
                return {
                  label: 'Partial match',
                  icon: <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
                };
              case 'NOT_FOUND':
              default:
                return {
                  label: 'Not found',
                  icon: <MinusCircle className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-slate-100 text-slate-600 border-slate-200/80',
                };
            }
          };

          const config = getStatusConfig();

          return (
            <button
              key={feature.id}
              onClick={() => onSelectFeature?.(feature.id)}
              role="tab"
              aria-selected={isSelected}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs ring-1 ring-indigo-500/20'
                  : 'border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1 min-w-0 pr-1">
                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {feature.name}
                </div>

                {feature.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 font-normal leading-relaxed">
                    {feature.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                {config.icon}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeClass}`}
                >
                  {config.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TechnicalFeatureSummary;

