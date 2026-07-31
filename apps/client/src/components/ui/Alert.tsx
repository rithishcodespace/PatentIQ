import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AlertProps {
  message: string;
  onRetry?: () => void;
}

const Alert = ({ message, onRetry }: AlertProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-amber/30 bg-amber/5 px-8 py-10 text-center"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/15">
        <AlertTriangle size={18} className="text-amber" strokeWidth={2.2} />
      </div>

      <p className="max-w-sm font-body text-sm text-ink">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-slate-100 px-5 py-2.5 font-body text-sm font-medium text-indigo transition hover:border-indigo"
        >
          Try again
        </button>
      )}
    </motion.div>
  );
};

export default Alert;
