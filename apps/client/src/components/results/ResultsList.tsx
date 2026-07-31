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

const ResultsList = ({ results, onView }: ResultsListProps) => {
  return (
    <div className="space-y-6">
      {results.map((patent) => (
       <ResultCard
        key={patent.id}
        patent={patent}
        onView={onView}
/>
      ))}
    </div>
  );
};

export default ResultsList;