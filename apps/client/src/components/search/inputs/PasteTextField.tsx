import { Info } from "lucide-react";
import { fieldClass, labelClass } from "../formStyles";

interface PasteTextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const PasteTextField = ({ value, onChange }: PasteTextFieldProps) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="patent-paste" className={labelClass}>
        <span className="font-mono text-amber">01</span>
        Invention description
      </label>

      <textarea
        id="patent-paste"
        placeholder="Paste your invention description, research paper, or full patent draft here…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} min-h-[16rem] resize-none sm:min-h-[18rem]`}
        required
      />

      <p className="mt-2.5 flex items-start gap-1.5 font-body text-xs text-slate">
        <Info size={14} className="mt-0.5 shrink-0 text-indigo" />
        Paste your complete invention description. The system will
        automatically extract the important sections before performing
        semantic similarity search.
      </p>
    </div>
  );
};

export default PasteTextField;
