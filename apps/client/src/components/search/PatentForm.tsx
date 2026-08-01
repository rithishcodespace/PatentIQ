import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

import InputMethodTabs from "./InputMethodTabs";
import FillFormFields, { type FillFormValues } from "./inputs/FillFormFields";
import PasteTextField from "./inputs/PasteTextField";
import UploadPdfField from "./inputs/UploadPdfField";
import AdvancedOptionsPanel from "./AdvancedOptionsPanel";
import {
  DEFAULT_ADVANCED_OPTIONS,
  type InputMethod,
  type PatentSearchPayload,
} from "../../types/search";

interface PatentFormProps {
  onSearch: (data: PatentSearchPayload) => void;
}

const EMPTY_FORM: FillFormValues = {
  title: "",
  abstract: "",
  claims: "",
  keywords: "",
};

const PatentForm = ({ onSearch }: PatentFormProps) => {
  const [method, setMethod] = useState<InputMethod>("form");

  const [formValues, setFormValues] = useState<FillFormValues>(EMPTY_FORM);
  const [pastedText, setPastedText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [advanced, setAdvanced] = useState(DEFAULT_ADVANCED_OPTIONS);

  const isValid =
    method === "form"
      ? formValues.title.trim() &&
        formValues.abstract.trim() &&
        formValues.claims.trim()
      : method === "paste"
      ? pastedText.trim().length > 0
      : file !== null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const base = { method, advanced };

    if (method === "form") {
      onSearch({ ...base, ...formValues });
    } else if (method === "paste") {
      onSearch({ ...base, pastedText });
    } else {
      onSearch({ ...base, file: file! });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_1px_2px_rgba(11,17,32,0.04),0_12px_32px_-16px_rgba(11,17,32,0.12)] sm:p-6"
      >
        <div className="mb-5">
          <InputMethodTabs active={method} onChange={setMethod} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={method}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          >
            {method === "form" && (
              <FillFormFields values={formValues} onChange={setFormValues} />
            )}
            {method === "paste" && (
              <PasteTextField value={pastedText} onChange={setPastedText} />
            )}
            {method === "upload" && (
              <UploadPdfField file={file} onChange={setFile} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <AdvancedOptionsPanel value={advanced} onChange={setAdvanced} />

      <motion.button
        type="submit"
        disabled={!isValid}
        // whileTap={isValid ? { scale: 0.98 } : undefined}
        whileHover={isValid ? { y: -1 } : undefined}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="w-full rounded-lg bg-indigo-500 py-3 font-body text-sm font-semibold text-paper transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate"
      >
        Search prior art
      </motion.button>
    </form>
  );
};

export default PatentForm;
