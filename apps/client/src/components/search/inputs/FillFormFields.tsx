import type { ChangeEvent } from "react";
import { fieldClass, labelClass } from "../formStyles";

export interface FillFormValues {
  title: string;
  abstract: string;
  claims: string;
  keywords: string;
}

interface FillFormFieldsProps {
  values: FillFormValues;
  onChange: (values: FillFormValues) => void;
}

const FieldLabel = ({
  index,
  children,
}: {
  index: string;
  children: string;
}) => (
  <label className={labelClass}>
    <span className="font-mono text-amber">{index}</span>
    {children}
  </label>
);

const FillFormFields = ({ values, onChange }: FillFormFieldsProps) => {
  const set = (key: keyof FillFormValues) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => onChange({ ...values, [key]: e.target.value });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel index="01">Patent title</FieldLabel>
        <input
          id="patent-title"
          type="text"
          placeholder="e.g. Solar-assisted grain dryer for small farms"
          value={values.title}
          onChange={set("title")}
          className={fieldClass}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col">
          <FieldLabel index="02">Abstract</FieldLabel>
          <textarea
            id="patent-abstract"
            placeholder="Summarize the invention — what it does and the problem it solves."
            value={values.abstract}
            onChange={set("abstract")}
            className={`${fieldClass} min-h-[7.5rem] flex-1 resize-none sm:min-h-[9rem]`}
            required
          />
        </div>

        <div className="flex flex-col">
          <FieldLabel index="03">Claims / novel features</FieldLabel>
          <textarea
            id="patent-claims"
            placeholder="What's novel — the specific mechanism, method, or configuration you're claiming."
            value={values.claims}
            onChange={set("claims")}
            className={`${fieldClass} min-h-[7.5rem] flex-1 resize-none sm:min-h-[9rem]`}
            required
          />
        </div>
      </div>

      <div>
        <FieldLabel index="04">
          Keywords <span className="normal-case text-slate">(optional)</span>
        </FieldLabel>
        <input
          id="patent-keywords"
          type="text"
          placeholder="e.g. solar dryer, grain moisture, IoT sensor, agri-tech"
          value={values.keywords}
          onChange={set("keywords")}
          className={fieldClass}
        />
        <p className="mt-1.5 font-body text-xs text-slate">
          Comma-separated. Helps sharpen the match when your abstract is brief.
        </p>
      </div>
    </div>
  );
};

export default FillFormFields;
