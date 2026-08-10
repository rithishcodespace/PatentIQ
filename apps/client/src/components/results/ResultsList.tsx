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
  // Cap to Top 5 most relevant candidates, sorted descending by hybrid relevance score
  const top5Candidates = [...(results || [])]
    .sort((a, b) => {
      const scoreA = typeof a.similarityScore === 'number' ? a.similarityScore : (a.score || 0.85);
      const scoreB = typeof b.similarityScore === 'number' ? b.similarityScore : (b.score || 0.85);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {top5Candidates.map((patent, index) => (
        <motion.div key={patent.patentId || patent.id || index} variants={item}>
          <ResultCard patent={patent} onView={onView} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ResultsList;
