import ResultCard from "./ResultCard";

interface Patent {
  id: number;
  title: string;
  similarity: number;
  ipc: string;
}

interface ResultsListProps {
  results: Patent[];
}

const ResultsList = ({ results }: ResultsListProps) => {
  return (
    <div className="space-y-6">
      {results.map((patent) => (
        <ResultCard
          key={patent.id}
          patent={patent}
        />
      ))}
    </div>
  );
};

export default ResultsList;