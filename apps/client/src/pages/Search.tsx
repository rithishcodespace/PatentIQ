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
    setTimeout(() => setStep(1), 400);
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1200);
    setTimeout(() => setStep(4), 1700);

    const response = await runSearch(data);

    if (response) {
      navigate("/results", { state: response });
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="mb-6 text-center"
      >
        <p className="code-chip mb-2 inline-block bg-indigo/5 text-indigo">
          STEP 01 · DESCRIBE THE INVENTION
        </p>
        <p className="mt-1.5 font-body text-sm text-slate">
          Fill in the details, paste a draft, or upload a PDF — however your
          invention is documented right now.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
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
