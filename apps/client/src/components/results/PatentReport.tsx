import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { Card } from "../ui/Card";
import { exportReportAsPdf } from "../../utils/pdfExporter";

interface ReportProps {
  report: {
    novelty: number;
    inventiveStep: number;
    industrialApplicability: number;
    overall: number;
  };
  query?: string;
  onDownloadPdf?: () => void;
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

const PatentReport = ({ report, query, onDownloadPdf }: ReportProps) => {
  const handlePdfExport = () => {
    if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      exportReportAsPdf({
        query: query || 'Patentability & Prior-Art Assessment',
        confidence: { overall: { score: report.overall, level: 'High' } },
        analysis: {
          noveltyScore: report.novelty / 5,
          obviousnessScore: (5 - report.inventiveStep) / 5,
          summary: `Overall Patentability Assessment score: ${report.overall}%. High technical novelty in claims.`,
        },
      });
    }
  };

  return (
    <Card className="sticky top-24 h-fit">
      <div className="flex items-center justify-between">
        <p className="code-chip inline-block bg-indigo/5 text-indigo">
          AI ASSESSMENT
        </p>
        <button
          onClick={handlePdfExport}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 font-body text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition"
          title="Download Legal PDF Report"
        >
          <Download className="h-3 w-3" />
          <span>Download PDF</span>
        </button>
      </div>

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
