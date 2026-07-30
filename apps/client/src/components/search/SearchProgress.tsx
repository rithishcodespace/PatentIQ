import { Check } from "lucide-react";

interface SearchProgressProps {
  step: number;
}

const steps = [
  "Extracting Patent Sections",
  "Generating Embeddings",
  "Searching Similar Patents",
  "Ranking Results",
  "Generating Report",
];

const SearchProgress = ({ step }: SearchProgressProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      <h2 className="text-xl font-semibold mb-6">
        Search Progress
      </h2>

      <div className="space-y-4">

        {steps.map((item, index) => {
          const completed = index <= step;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 ${
                completed ? "text-green-600" : "text-gray-400"
              }`}
            >

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  completed
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                {completed && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="text-white"
                  />
                )}
              </div>

              <p>{item}</p>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default SearchProgress;