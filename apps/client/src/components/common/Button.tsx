import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, className = "", ...props }: ButtonProps) => {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;