import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import PatentForm from "../components/search/PatentForm";
import Loader from "../components/common/Loader";
import SearchProgress from "../components/search/SearchProgress";
import Alert from "../components/ui/Alert";
import { useSearch } from "../hooks/useSearch";
import type { PatentSearchPayload } from "../types/search";

const Search = () => {
  const navigate = useNavigate();
  const { loading, error, runSearch, resetError } = useSearch();
  const [step, setStep] = useState(0);

  const handleSearch = async (data: PatentSearchPayload) => {
    setStep(0);
    const stepTimer1 = setTimeout(() => setStep(1), 300);
    const stepTimer2 = setTimeout(() => setStep(2), 600);
    const stepTimer3 = setTimeout(() => setStep(3), 900);
    const stepTimer4 = setTimeout(() => setStep(4), 1200);

    try {
      const response = await runSearch(data);

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      if (response) {
        navigate("/results", { state: response });
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="text-center space-y-2"
      >
        <h1 className="font-display text-3xl font-bold text-slate-900">
          Prior-Art & Patent Novelty Search
        </h1>
        <p className="font-body text-xs text-slate-600 max-w-xl mx-auto">
          Specify your invention draft using structured fields, raw text, or document uploads to retrieve ranked prior art candidates.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs space-y-6"
          >
            <Loader />
            <SearchProgress step={step} />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert message={error} onRetry={resetError} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <PatentForm onSearch={handleSearch} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
