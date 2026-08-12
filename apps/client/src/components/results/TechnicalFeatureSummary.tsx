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
    <div className={`space-y-4 font-body ${className}`}>
      {/* Header & Match Count */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
          {totalMatched} of {features.length} matched
        </span>
      </div>

      {/* Feature List (Grid: 1-col on mobile, 2-col on large screens if > 4 items) */}
      <div
        className={`grid gap-3 ${
          features.length > 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
        role="list"
        aria-label="Technical feature summary checklist"
      >
        {features.map((feature) => {
          const isSelected = selectedFeatureId === feature.id;

          const getStatusConfig = () => {
            switch (feature.status) {
              case 'MATCH':
                return {
                  symbol: '✓',
                  label: 'Found in this patent',
                  ariaText: 'Match: Found in this patent',
                  icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  symbolClass: 'text-emerald-600 font-bold',
                };
              case 'PARTIAL_MATCH':
                return {
                  symbol: '◐',
                  label: 'Partially supported',
                  ariaText: 'Partial match: Partially supported',
                  icon: <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
                  symbolClass: 'text-amber-600 font-bold',
                };
              case 'NOT_FOUND':
              default:
                return {
                  symbol: '—',
                  label: 'Not found',
                  ariaText: 'Not found: Feature not identified in patent',
                  icon: <MinusCircle className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />,
                  badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
                  symbolClass: 'text-slate-400 font-bold',
                };
            }
          };

          const config = getStatusConfig();

          return (
            <button
              key={feature.id}
              onClick={() => onSelectFeature?.(feature.id)}
              aria-label={`${feature.name} - ${config.ariaText}`}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${config.symbolClass}`} aria-hidden="true">
                    {config.symbol}
                  </span>
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {feature.name}
                  </span>
                </div>

                {feature.description && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 pl-5 font-normal">
                    {feature.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                {config.icon}
                <span
                  role="status"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
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
