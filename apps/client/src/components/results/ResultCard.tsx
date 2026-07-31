interface ResultCardProps {
  patent: {
    id: number;
    title: string;
    similarity: number;
    ipc: string;
  };
}

const ResultCard = ({ patent }: ResultCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {patent.title}
          </h2>

          <p className="text-gray-500 mt-2">
            IPC: {patent.ipc}
          </p>
        </div>

        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
          {patent.similarity}%
        </span>

      </div>

      <button className="mt-6 text-blue-600 font-medium hover:underline">
        View Details →
      </button>

    </div>
  );
};

export default ResultCard;