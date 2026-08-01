import { motion } from "framer-motion";
import { Card } from "../ui/Card";

interface ReportProps {
  report: {
    novelty: number;
    inventiveStep: number;
    industrialApplicability: number;
    overall: number;
  };
}

const Row = ({ title, value }: { title: string; value: number }) => {
  const getBarColor = (score: number) => {
    if (score >= 4.5) return "bg-green-500";
    if (score >= 3) return "bg-yellow-500";
    if (score >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-body text-sm text-slate">{title}</span>
        <span className="font-mono text-sm text-ink">{value}/5</span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 5) * 100}%` }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
          className={`h-2 rounded-full ${getBarColor(value)}`}
        />
      </div>
    </div>
  );
};

const PatentReport = ({ report }: ReportProps) => {
  return (
    <Card className="sticky top-24 h-fit">
      <p className="code-chip mb-1 inline-block bg-indigo/5 text-indigo">
        AI ASSESSMENT
      </p>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">
        Patentability report
      </h2>

      <div className="mt-6 space-y-5">
        <Row title="Novelty" value={report.novelty} />
        <Row title="Inventive step" value={report.inventiveStep} />
        <Row
          title="Industrial applicability"
          value={report.industrialApplicability}
        />

        <div className="border-t border-slate-100 pt-6 text-center">
          <p className="font-display text-5xl font-semibold text-indigo">
            {report.overall}
            <span className="text-2xl text-slate">%</span>
          </p>
          <p className="mt-2 font-body text-sm text-slate">
            Overall patentability score
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PatentReport;
