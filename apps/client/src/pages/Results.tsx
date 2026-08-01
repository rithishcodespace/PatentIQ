import { Navigate, useLocation } from "react-router-dom";

import ResultsList from "../components/results/ResultsList";
import PatentReport from "../components/results/PatentReport";

import { useState } from "react";
import Modal from "../components/ui/Modal";
import { Link } from "react-router-dom";
import EmptyResults from "../components/results/EmptyResults";

const Results = () => {

  const location = useLocation();
  const [selectedPatent, setSelectedPatent] = useState<any>(null);

  const data = location.state;

  if (!data) {
    return <Navigate to="/search" replace />;
  }

  if (data.results.length === 0) {
    return <EmptyResults />;
}

  return (
    <div>

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
            Search Results
        </h1>
      
        <Link
            to="/search"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
            New Search
        </Link>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2">

          

          <ResultsList
            results={data.results}
            onView={setSelectedPatent}
          />

          <Modal
           isOpen={selectedPatent !== null}
           onClose={() => setSelectedPatent(null)}
        >
        
           {selectedPatent && (

               <div>

                   <h1 className="text-3xl font-bold mb-6">

                       {selectedPatent.title}

                   </h1>

                   <div className="space-y-4">

                       <p>

                           <strong>Patent ID :</strong>

                           #{selectedPatent.id}

                       </p>

                       <p>

                           <strong>IPC :</strong>

                           {selectedPatent.ipc}

                       </p>

                       <p>

                           <strong>Similarity :</strong>

                           {selectedPatent.similarity}%

                       </p>

                       <div>

                           <h2 className="font-semibold text-lg">

                               Abstract

                           </h2>

                           <p className="text-gray-600">

                               {selectedPatent.abstract}

                           </p>

                       </div>

                       <div>

                           <h2 className="font-semibold text-lg">

                               Claims

                           </h2>

                           <p className="text-gray-600">

                               {selectedPatent.claims}

                           </p>

                       </div>

                       <div className="bg-blue-50 rounded-xl p-4">

                           <h2 className="font-semibold mb-2">

                               AI Similarity Explanation

                           </h2>

                           <p className="text-gray-700">

                               This patent is considered similar because the
                               invention focuses on AI-assisted monitoring,
                               semantic image analysis and automated
                               decision-making. The retrieved document shares
                               common technical concepts and functional
                               objectives.

                           </p>

                       </div>

                   </div>

               </div>

            )}

        </Modal>

        </div>

        <PatentReport
          report={data.report}
        />

      </div>

    </div>
  );
};

export default Results;