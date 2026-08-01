import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import Toggle from "../ui/Toggle";
import { fieldClass } from "./formStyles";
import type { AdvancedSearchOptions } from "../../types/search";

const ALL_DATABASES = ["Google Patents", "USPTO", "WIPO"] as const;
const RESULT_OPTIONS = [10, 20, 50] as const;

interface AdvancedOptionsPanelProps {
  value: AdvancedSearchOptions;
  onChange: (value: AdvancedSearchOptions) => void;
}

const AdvancedOptionsPanel = ({ value, onChange }: AdvancedOptionsPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleDatabase = (db: string) => {
    const has = value.databases.includes(db);
    onChange({
      ...value,
      databases: has
        ? value.databases.filter((d) => d !== db)
        : [...value.databases, db],
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
      >
        <span className="flex items-center gap-2 font-body text-sm font-semibold text-ink">
          <SlidersHorizontal size={15} className="text-indigo" />
          Advanced options
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-slate" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-6 border-t border-slate-100 px-5 py-5 sm:grid-cols-2">
              {/* Similarity threshold */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="similarity-threshold"
                    className="font-body text-xs font-semibold uppercase tracking-wide text-ink"
                  >
                    Similarity threshold
                  </label>
                  <span className="font-mono text-xs text-indigo">
                    {value.similarityThreshold}%
                  </span>
                </div>
                <input
                  id="similarity-threshold"
                  type="range"
                  min={50}
                  max={100}
                  step={1}
                  value={value.similarityThreshold}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      similarityThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo"
                />
                <div className="mt-1 flex justify-between font-mono text-[10px] text-slate/70">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Max results */}
              <div>
                <label
                  htmlFor="max-results"
                  className="mb-2 block font-body text-xs font-semibold uppercase tracking-wide text-ink"
                >
                  Maximum results
                </label>
                <select
                  id="max-results"
                  value={value.maxResults}
                  onChange={(e) =>
                    onChange({ ...value, maxResults: Number(e.target.value) })
                  }
                  className={fieldClass}
                >
                  {RESULT_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n} results
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedOptionsPanel;
