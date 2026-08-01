import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Card } from "../ui/Card";

const EmptyResults = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo/5">
          <SearchX size={22} className="text-indigo" strokeWidth={1.8} />
        </div>

        <h2 className="font-display text-2xl font-semibold text-ink">
          No overlapping patents found
        </h2>
        <p className="max-w-sm font-body text-sm text-slate">
          That's a good sign for novelty — but try broadening or rephrasing
          your abstract and claims to double-check the index caught every
          relevant angle.
        </p>

        <Link
          to="/search"
          className="mt-2 inline-block rounded-lg bg-indigo px-5 py-2.5 font-body text-sm font-medium text-paper transition hover:bg-indigo-soft"
        >
          Search again
        </Link>
      </Card>
    </motion.div>
  );
};

export default EmptyResults;
