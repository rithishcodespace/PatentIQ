import { motion, type Variants } from "framer-motion";  
import ResultCard from "./ResultCard";

interface ResultsListProps {
  results: any[];
  onView?: (patent: any) => void;
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
      duration: 0.3,
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
      className="space-y-4"
    >
      {results.map((patent, index) => (
        <motion.div key={patent.patentId || patent.id || index} variants={item}>
          <ResultCard patent={patent} onView={onView} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ResultsList;
