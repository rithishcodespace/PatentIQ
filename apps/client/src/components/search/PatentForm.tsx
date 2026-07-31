import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";

interface PatentFormProps {
  onSearch: (data: {
    title: string;
    abstract: string;
    claims: string;
  }) => void;
}

const fieldClass =
  "w-full rounded-lg border border-slate-100 bg-paper px-4 py-3 font-body text-ink placeholder:text-slate/60 transition focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/15";

const FieldLabel = ({ index, children }: { index: string; children: string }) => (
  <label className="mb-2 flex items-baseline gap-2 font-body text-sm font-semibold text-ink">
    <span className="font-mono text-xs text-amber">{index}</span>
    {children}
  </label>
);

const PatentForm = ({ onSearch }: PatentFormProps) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [claims, setClaims] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ title, abstract, claims });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="space-y-7 rounded-2xl border border-slate-100 bg-white p-8 shadow-[0_1px_2px_rgba(11,17,32,0.04),0_12px_32px_-16px_rgba(11,17,32,0.12)]"
    >
      <div>
        <FieldLabel index="01">Patent title</FieldLabel>
        <input
          type="text"
          placeholder="e.g. Solar-assisted grain dryer for small farms"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <FieldLabel index="02">Abstract</FieldLabel>
        <textarea
          rows={5}
          placeholder="Summarize the invention in plain terms — what it does and the problem it solves."
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          className={`${fieldClass} resize-none`}
          required
        />
      </div>

      <div>
        <FieldLabel index="03">Claims</FieldLabel>
        <textarea
          rows={7}
          placeholder="List what's novel — the specific mechanism, method, or configuration you're claiming."
          value={claims}
          onChange={(e) => setClaims(e.target.value)}
          className={`${fieldClass} resize-none`}
          required
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-3.5 font-body text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        Search patents
      </button>
    </motion.form>
  );
};

export default PatentForm;
