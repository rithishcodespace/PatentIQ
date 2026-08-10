import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Lightbulb, ChevronRight } from 'lucide-react';

interface ClaimDiffMatrixProps {
  onSelectPatent?: (patentId: string) => void;
}

export const ClaimDiffMatrix = ({ onSelectPatent }: ClaimDiffMatrixProps) => {
  const [selectedClaim, setSelectedClaim] = useState<number>(1);

  const claimDiffs = [
    {
      claimNumber: 1,
      type: 'Independent Claim',
      status: 'High Conflict Risk (Section 102)',
      statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
      userDraft:
        'An autonomous aerial system comprising an optical camera array, a LiDAR vector scanner, and a processor for mapping spatial coordinates.',
      priorArtMatch: {
        patentId: 'US-10112233-B2',
        title: 'Integrated LiDAR and Optical Fusion Architecture for Autonomous Navigation',
        citedText:
          'A vehicle navigation unit comprising an optical camera sensor, a laser scanner, and a processing unit for aggregating spatial vector data.',
        overlapScore: 85,
      },
      amendmentAdvice:
        'Narrow Claim 1 by inserting: "...and a resonant inductive wireless power charging controller configured to dynamically modulate feedback loops during flight."',
    },
    {
      claimNumber: 2,
      type: 'Dependent Claim',
      status: 'Novel (No Direct Overlap)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      userDraft:
        'The system of claim 1, wherein the LiDAR scanner operates at a wavelength of 1550nm for eye-safe long-range atmospheric sensing.',
      priorArtMatch: {
        patentId: 'US-9876543-A1',
        title: 'Wireless Power Transmission Protocol',
        citedText: 'No identical laser wavelength limitation recited in cited references.',
        overlapScore: 18,
      },
      amendmentAdvice: 'Claim 2 exhibits strong patentable novelty as drafted.',
    },
  ];

  const currentDiff = claimDiffs.find((c) => c.claimNumber === selectedClaim) || claimDiffs[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 font-body">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Side-by-Side Claim Limitation Matrix & Amendment Recommendations
          </h4>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            Compare target draft claim limitations against cited prior-art text to resolve 35 U.S.C. 102/103 conflicts
          </p>
        </div>

        {/* Claim Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {claimDiffs.map((c) => (
            <button
              key={c.claimNumber}
              onClick={() => setSelectedClaim(c.claimNumber)}
              className={`rounded-lg px-3 py-1 font-body text-xs font-semibold transition ${
                selectedClaim === c.claimNumber
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Claim #{c.claimNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Claim Comparison Header Pill */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900">
            Target Draft Claim #{currentDiff.claimNumber} ({currentDiff.type})
          </span>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-[11px] ${currentDiff.statusColor}`}>
          {currentDiff.status}
        </span>
      </div>

      {/* Side-by-Side 2 Column Diff */}
      <div className="grid gap-4 md:grid-cols-2 text-xs">
        {/* Column 1: User's Target Claim */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <span>Your Submitted Claim Draft</span>
            <span className="code-chip text-[10px]">Target Draft</span>
          </div>
          <p className="text-slate-800 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200/80">
            {currentDiff.userDraft}
          </p>
        </div>

        {/* Column 2: Cited Prior Art Limitation */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <span>Cited Prior-Art Reference</span>
            <button
              onClick={() => onSelectPatent?.(currentDiff.priorArtMatch.patentId)}
              className="font-mono font-bold text-indigo-600 hover:underline flex items-center gap-1 text-[10px]"
            >
              #{currentDiff.priorArtMatch.patentId}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <p className="text-slate-800 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200/80">
            {currentDiff.priorArtMatch.citedText}
          </p>
        </div>
      </div>

      {/* Actionable Amendment Strategy Box */}
      <motion.div
        key={selectedClaim}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-1 text-xs"
      >
        <div className="flex items-center gap-2 font-display font-bold text-indigo-950">
          <Lightbulb className="h-4 w-4 text-indigo-600" />
          Recommended Strategic Claim Amendment to Bypass Prior Art:
        </div>
        <p className="text-indigo-900 leading-relaxed font-medium pt-1">
          {currentDiff.amendmentAdvice}
        </p>
      </motion.div>
    </div>
  );
};

export default ClaimDiffMatrix;
