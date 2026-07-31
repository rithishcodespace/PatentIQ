interface ResultCardProps {
  patent: {
    id: number;
    title: string;
    similarity: number;
    ipc: string;
  };
  onView?: (patent: ResultCardProps["patent"]) => void;
}

const ResultCard = ({ patent, onView }: ResultCardProps) => {

  const getColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6">

      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-xl font-bold text-gray-800">
            {patent.title}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Patent ID : #{patent.id}
          </p>

          <p className="text-sm text-gray-500">
            IPC Classification : {patent.ipc}
          </p>

        </div>

        <div className="text-right">

          <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold">
            {patent.similarity}%
          </span>

        </div>

      </div>

      {/* Similarity Progress */}

      <div className="mt-6">

        <div className="flex justify-between text-sm mb-2">

          <span>Semantic Similarity</span>

          <span>{patent.similarity}%</span>

        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">

          <div
            className={`h-3 rounded-full ${getColor(
              patent.similarity
            )}`}
            style={{ width: `${patent.similarity}%` }}
          />

        </div>

      </div>

      <div className="mt-6 flex justify-end">

       <button
        onClick={() => onView?.(patent)}
        disabled={!onView}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg"
        >
          View Details
        </button>

      </div>

    </div>
  );
};

export default ResultCard;