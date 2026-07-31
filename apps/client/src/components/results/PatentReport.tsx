interface ReportProps {
  report: {
    novelty: number;
    inventiveStep: number;
    industrialApplicability: number;
    overall: number;
  };
}

const PatentReport = ({ report }: ReportProps) => {

  const Row = ({
    title,
    value,
  }: {
    title: string;
    value: number;
  }) => (
    <div>

      <div className="flex justify-between mb-2">

        <span>{title}</span>

        <span>{value}/5</span>

      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">

        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{
            width: `${value * 20}%`,
          }}
        />

      </div>

    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">

      <h2 className="text-2xl font-bold mb-6">
        Patentability Report
      </h2>

      <div className="space-y-6">

        <Row
          title="Novelty"
          value={report.novelty}
        />

        <Row
          title="Inventive Step"
          value={report.inventiveStep}
        />

        <Row
          title="Industrial Applicability"
          value={report.industrialApplicability}
        />

        <hr />

        <div className="text-center">

          <h1 className="text-5xl font-bold text-blue-600">

            {report.overall}%

          </h1>

          <p className="text-gray-500 mt-2">
            Overall Patentability Score
          </p>

        </div>

      </div>

    </div>
  );
};

export default PatentReport;