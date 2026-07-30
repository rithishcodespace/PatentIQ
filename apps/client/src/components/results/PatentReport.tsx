interface ReportProps {
  report: {
    novelty: number;
    inventiveStep: number;
    industrialApplicability: number;
    overall: number;
  };
}

const PatentReport = ({ report }: ReportProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">

      <h2 className="text-2xl font-bold mb-6">
        Patentability Report
      </h2>

      <div className="space-y-5">

        <div>
          <p className="font-medium">Novelty</p>
          <p>{"⭐".repeat(report.novelty)}</p>
        </div>

        <div>
          <p className="font-medium">Inventive Step</p>
          <p>{"⭐".repeat(report.inventiveStep)}</p>
        </div>

        <div>
          <p className="font-medium">
            Industrial Applicability
          </p>
          <p>{"⭐".repeat(report.industrialApplicability)}</p>
        </div>

        <hr />

        <div>

          <p className="text-gray-500">
            Overall Score
          </p>

          <h1 className="text-4xl font-bold text-blue-600">
            {report.overall}%
          </h1>

        </div>

      </div>

    </div>
  );
};

export default PatentReport;