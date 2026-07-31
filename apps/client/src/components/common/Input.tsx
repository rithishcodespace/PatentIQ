import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${className}`}
    />
  );
};

export default Input;