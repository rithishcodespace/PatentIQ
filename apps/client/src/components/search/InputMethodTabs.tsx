import { motion } from "framer-motion";
import { FileText, ClipboardPaste, UploadCloud, type LucideIcon } from "lucide-react";
import type { InputMethod } from "../../types/search";

const tabs: { id: InputMethod; label: string; icon: LucideIcon }[] = [
  { id: "form", label: "Fill Form", icon: FileText },
  { id: "paste", label: "Paste Text", icon: ClipboardPaste },
  { id: "upload", label: "Upload PDF", icon: UploadCloud },
];

interface InputMethodTabsProps {
  active: InputMethod;
  onChange: (method: InputMethod) => void;
}

const InputMethodTabs = ({ active, onChange }: InputMethodTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Patent input method"
      className="inline-flex w-full gap-1 rounded-full bg-slate-100 p-1 sm:w-auto"
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className="relative flex-1 rounded-full px-3.5 py-2 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40 sm:flex-none sm:px-4"
          >
            {isActive && (
              <motion.span
                layoutId="input-method-pill"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center justify-center gap-1.5 ${
                isActive ? "text-indigo" : "text-slate"
              }`}
            >
              <Icon size={14} strokeWidth={2.2} />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default InputMethodTabs;
