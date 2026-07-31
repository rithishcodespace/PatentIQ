import { Navigate, useLocation } from "react-router-dom";

import ResultsList from "../components/results/ResultsList";
import PatentReport from "../components/results/PatentReport";

const Results = () => {

  const location = useLocation();

  const data = location.state;

  if (!data) {
    return <Navigate to="/search" replace />;
  }

  return (
    <div>

      <h1 className="text-4xl font-bold mb-8">
        Search Results
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">

          <ResultsList
            results={data.results}
          />

        </div>

        <PatentReport
          report={data.report}
        />

      </div>

    </div>
  );
};

export default Results;