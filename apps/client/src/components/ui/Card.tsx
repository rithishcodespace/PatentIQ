import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_1px_2px_rgba(11,17,32,0.04),0_12px_32px_-16px_rgba(11,17,32,0.12)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
