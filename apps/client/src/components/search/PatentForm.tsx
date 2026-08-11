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

const PRESET_EXAMPLES = [
  {
    label: "🚁 Autonomous Drone LiDAR",
    title: "Autonomous Drone Optical LiDAR & Inductive Wireless Charging",
    abstract: "An autonomous aerial vehicle navigation apparatus comprising a pulsed optical laser scanner, localized edge DSP Doppler mapping, and resonant inductive power receiver.",
    claims: "1. An autonomous navigation system comprising an optical sensor, a laser radar scanner, and an inductive charging feedback loop.",
    keywords: "LiDAR, Drone, Inductive Charging, Optical Sensor",
  },
  {
    label: "⚡ Medical Implant Wireless Charger",
    title: "Resonant Inductive Power Transfer for Medical Implants",
    abstract: "A resonant inductive wireless power transfer apparatus with dynamic impedance tuning and localized thermal monitoring.",
    claims: "1. A wireless power transfer system comprising a primary transmitter coil and a secondary resonant implant receiver.",
    keywords: "Resonant Inductive, Wireless Power, Medical Implants",
  },
  {
    label: "🤖 MEMS Ultrasonic Sensor",
    title: "Low Power MEMS Ultrasonic Transducer Velocity Array",
    abstract: "Ultrasonic Doppler transducer array with dynamic beamforming for fluid velocity measurement in low power embedded systems.",
    claims: "1. A MEMS ultrasonic transducer array configured for localized spatial Doppler velocity beamforming.",
    keywords: "MEMS, Ultrasonic Transducer, Beamforming, Doppler",
  },
];

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
        {/* Try Sample Inventions Quick Action Bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="font-body text-[11px] font-bold tracking-wider text-slate-600 uppercase">Try Sample:</span>
          {PRESET_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => {
                setMethod("form");
                setFormValues({
                  title: ex.title,
                  abstract: ex.abstract,
                  claims: ex.claims,
                  keywords: ex.keywords,
                });
              }}
              className="rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-body text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-600 transition shadow-2xs"
            >
              {ex.label}
            </button>
          ))}
        </div>

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
