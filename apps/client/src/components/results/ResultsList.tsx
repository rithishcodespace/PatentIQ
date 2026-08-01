import { motion, type Variants } from "framer-motion";  
import ResultCard from "./ResultCard";

interface Patent {
  id: number;
  title: string;
  similarity: number;
  ipc: string;
}

interface ResultsListProps {
  results: Patent[];
  onView?: (patent: Patent) => void;
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const ResultsList = ({ results, onView }: ResultsListProps) => {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {results.map((patent) => (
        <motion.div key={patent.id} variants={item}>
          <ResultCard patent={patent} onView={onView} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ResultsList;
