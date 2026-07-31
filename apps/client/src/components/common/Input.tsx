import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-slate-100 bg-paper px-4 py-3 font-body text-ink placeholder:text-slate/70 transition focus:border-indigo focus:outline-none focus:ring-2 focus:ring-indigo/20 ${className}`}
    />
  );
};

export default Input;
