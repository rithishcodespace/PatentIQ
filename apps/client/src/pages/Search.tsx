import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import PatentForm from "../components/search/PatentForm";
import Loader from "../components/common/Loader";
import { searchPatent } from "../services/api";
import SearchProgress from "../components/search/SearchProgress";
import Alert from "../components/ui/Alert";

const Search = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const handleSearch = async (data: {
    title: string;
    abstract: string;
    claims: string;
  }) => {
    try {
      setLoading(true);
      setError("");

      setStep(0);

      setTimeout(() => setStep(1), 400);
      setTimeout(() => setStep(2), 800);
      setTimeout(() => setStep(3), 1200);
      setTimeout(() => setStep(4), 1700);

      const response = await searchPatent(data);

      navigate("/results", {
        state: response,
      });
    } catch (err) {
      setError(
        "We couldn't reach the search index. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="mb-10 text-center"
      >
        <p className="code-chip mb-4 inline-block bg-indigo-50 text-indigo-600">
          STEP 01 · DESCRIBE THE INVENTION
        </p>
        <h1 className="font-display text-4xl font-semibold text-ink">
          Search prior art
        </h1>
        <p className="mt-3 font-body text-slate">
          The more specific your abstract and claims, the sharper the match.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
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
            <Alert message={error} onRetry={() => setError("")} />
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
