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

      <p className="mt-2.5 flex items-start gap-1.5 font-body text-xs text-slate-600">
        <Info size={14} className="mt-0.5 shrink-0 text-indigo-600" />
        Paste your complete invention draft. PatentIQ will extract technical features and search across USPTO prior-art patents to find supporting evidence.
      </p>

      {/* 1-Click Sample Prompts */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 block mb-2">
          Try a sample invention draft:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onChange(
                'Autonomous drone LiDAR sensor fusion apparatus comprising optical velocity camera, pulsed laser scanner, and inductive charging feedback loop.'
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            🚁 Drone LiDAR Fusion
          </button>

          <button
            type="button"
            onClick={() =>
              onChange(
                'Resonant inductive wireless charging receiver circuit with real-time impedance feedback loop and magnetic pulse telemetry for medical implants.'
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            🔋 Inductive Wireless Charger
          </button>

          <button
            type="button"
            onClick={() =>
              onChange(
                'MEMS ultrasonic Doppler transducer array with dynamic spatial beamforming and localized edge DSP for sub-millimeter fluid flow measurement.'
              )
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
          >
            📡 MEMS Ultrasonic Transducer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasteTextField;
