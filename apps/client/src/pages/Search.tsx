import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PatentForm from "../components/search/PatentForm";
import Loader from "../components/common/Loader";
import { searchPatent } from "../services/api";
import SearchProgress from "../components/search/SearchProgress";
import Alert from "../components/ui/Alert";


const Search = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);  
  const [error, setError] = useState("");

  const handleSearch = async (data: {
    title: string;
    abstract: string;
    claims: string;
  }) => {

    try {

      setLoading(true);
      setError("");

        setStep(0);
        
        setTimeout(() => setStep(1), 400);
        setTimeout(() => setStep(2), 800);
        setTimeout(() => setStep(3), 1200);
        setTimeout(() => setStep(4), 1700);

      const response = await searchPatent(data);

      console.log(response);

      navigate("/results", {
        state: response,
      });

    } catch (err) {

        setError("Unable to retrieve patents. Please try again.");

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="max-w-5xl mx-auto py-10">

      <h1 className="text-4xl font-bold text-center">
        Patent Search
      </h1>

      <p className="text-center text-gray-600 mt-2 mb-8">
        Enter patent details to search similar patents.
      </p>

      {loading ? (
            <div className="space-y-8">
                <Loader />
                <SearchProgress step={step} />
            </div>
        ) : error ? (
            <Alert
                message={error}
                onRetry={() => setError("")}
            />
        ) : (
            <PatentForm onSearch={handleSearch} />
        )}

    </div>
  );
};

export default Search;