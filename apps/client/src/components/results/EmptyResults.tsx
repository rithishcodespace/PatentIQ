import { Link } from "react-router-dom";

const EmptyResults = () => {
  return (
    <div className="bg-white rounded-xl shadow p-10 text-center">

      <h2 className="text-2xl font-bold">

        No Similar Patents Found

      </h2>

      <p className="text-gray-500 mt-3">

        Try changing your patent description.

      </p>

      <Link
        to="/search"
        className="inline-block mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg"
      >
        Search Again
      </Link>

    </div>
  );
};

export default EmptyResults;