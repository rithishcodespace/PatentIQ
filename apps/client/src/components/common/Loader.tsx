import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative h-14 w-14">
        <motion.span className="absolute inset-0 rounded-full border-2 border-indigo-200" />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        </span>
        <span className="sr-only">Loading…</span>
      </div>
      <p className="mt-5 font-body text-sm text-slate">
        Scanning embedding space for prior art…
      </p>
    </div>
  );
};

export default Loader;
