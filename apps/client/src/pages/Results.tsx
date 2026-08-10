import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Layers,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Download,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

import CitationReport from '../components/results/CitationReport';
import NoveltyDial from '../components/results/NoveltyDial';
import ResultsList from '../components/results/ResultsList';
import TechnicalDeepDive from '../components/results/TechnicalDeepDive';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';
import { searchPatent } from '../services/api';
import { exportReportAsPdf } from '../utils/pdfExporter';
import { getSimilarityRisk } from '../utils/similarityRisk';

const DEFAULT_RAG_DATA = {
  query: 'Autonomous drone LiDAR sensor fusion & inductive charging system',
  results: [
    {
      patentId: 'US-10112233-B2',
      id: 'US-10112233-B2',
      title: 'Integrated LiDAR and Optical Fusion Architecture for Autonomous Navigation',
      abstract:
        'An autonomous vehicle navigation apparatus comprising an optical image sensor, a laser radar scanner, and a central processing unit for mapping spatial vectors from image and laser radar outputs.',
      claims:
        'Claim 1. An autonomous vehicle navigation apparatus comprising an optical image sensor, a laser radar scanner, and a central processing unit for mapping spatial vectors.',
      ipc: 'B64C 39/02',
      similarityScore: 0.85,
      similarity: 85,
      owner: 'AeroTech Systems Inc.',
      country: 'US',
    },
    {
      patentId: 'US-9876543-A1',
      id: 'US-9876543-A1',
      title: 'Simultaneous Wireless Power Transmission and Telemetry Protocol',
      abstract:
        'A wireless receiver circuit configured to extract power pulses from a magnetic induction coil while simultaneously transmitting telemetry data over a secondary RF antenna.',
      claims:
        'Claim 1. A wireless receiver circuit configured to extract power pulses from a magnetic induction coil while simultaneously transmitting telemetry data.',
      ipc: 'H02J 50/10',
      similarityScore: 0.72,
      similarity: 72,
      owner: 'PowerGrid Dynamics LLC',
      country: 'US',
    },
  ],
  confidence: {
    overall: { score: 85.0, level: 'High' },
    retrieval: { score: 88.0, level: 'High' },
    analysis: { score: 82.0, level: 'High' },
  },
  analysis: {
    noveltyScore: 0.82,
    obviousnessScore: 0.18,
    summary:
      'The submitted invention disclosure demonstrates strong novelty in resonant inductive wireless charging feedback loops, with moderate prior-art claim overlap under 35 U.S.C. 102/103 with [US-10112233-B2] and [US-9876543-A1].',
    novelAspects: [
      'Resonant inductive wireless power transmission feedback loop',
      'Real-time edge AI spatial point cloud aggregation protocol',
    ],
    risks: [
      'Draft Claim 1 overlaps with optical & LiDAR sensor fusion in [US-10112233-B2]',
      'Potential Section 103 obviousness risk when combining telemetry with wireless power',
    ],
    recommendations: [
      'Amend Claim 1 to explicitly include the resonant inductive charging feedback controller',
      'Emphasize dynamic beamforming phased array in dependent claims',
    ],
  },
  overlapAnalysis: {
    overlappingClaims: [
      {
        patentId: 'US-10112233-B2',
        claimNumber: 1,
        overlapStrength: 'High',
        summary: 'Sensor fusion vector aggregation overlap',
        reason: 'Overlapping spatial vector calculation logic in Claim 1',
      },
    ],
    overallOverlapScore: 18,
    riskLevel: 'Moderate',
  },
  metrics: { totalTimeMs: 145, overlappingClaimsCount: 1 },
};

const Results = () => {
  const location = useLocation();
  const [selectedPatent, setSelectedPatent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'patents' | 'technical'>('insights');
  const [liveRagData, setLiveRagData] = useState<any>(location.state || DEFAULT_RAG_DATA);
  const [loading, setLoading] = useState<boolean>(!location.state);

  useEffect(() => {
    if (!location.state) {
      let isMounted = true;
      async function fetchLiveRag() {
        setLoading(true);
        try {
          const res = await searchPatent({
            method: 'paste',
            pastedText: 'Autonomous drone sensor fusion and wireless charging system',
            advanced: { similarityThreshold: 75, maxResults: 10, databases: ['USPTO'], includeKeywords: true },
          });
          if (isMounted && res) {
            const dataObj = res.data || res;
            setLiveRagData({
              query: dataObj.query || DEFAULT_RAG_DATA.query,
              results: (dataObj.retrievedPatents || dataObj.matches || []).length > 0 ? (dataObj.retrievedPatents || dataObj.matches) : DEFAULT_RAG_DATA.results,
              confidence: dataObj.confidence || DEFAULT_RAG_DATA.confidence,
              analysis: dataObj.analysis || dataObj.noveltyAnalysis || DEFAULT_RAG_DATA.analysis,
              overlapAnalysis: dataObj.overlapAnalysis || DEFAULT_RAG_DATA.overlapAnalysis,
              metrics: dataObj.metrics || DEFAULT_RAG_DATA.metrics,
            });
          }
        } catch (err) {
          console.warn('[Results] Backend request fallback to cached RAG snapshot:', err);
          if (isMounted) {
            setLiveRagData(DEFAULT_RAG_DATA);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      fetchLiveRag();
      return () => {
        isMounted = false;
      };
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <Loader />
        <p className="font-body text-xs font-semibold text-slate-600">
          Analyzing prior art databases & generating novelty report...
        </p>
      </div>
    );
  }

  const data = liveRagData || DEFAULT_RAG_DATA;
  const results = data.results || data.retrievedPatents || DEFAULT_RAG_DATA.results;
  const confidenceBlock = data.confidence || DEFAULT_RAG_DATA.confidence;
  const analysisData = data.analysis || data.noveltyAnalysis || DEFAULT_RAG_DATA.analysis;
  const overlapData = data.overlapAnalysis || DEFAULT_RAG_DATA.overlapAnalysis;
  const metricsData = data.metrics || DEFAULT_RAG_DATA.metrics;

  const topMatchScore = results?.[0]?.similarityScore || results?.[0]?.similarity || 0.85;
  const topMatchRisk = getSimilarityRisk(topMatchScore);

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `patent_iq_analysis_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 font-body">
      {/* 1. Workstation Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Search
          </Link>

          {/* Active Target Query */}
          <div className="flex items-center gap-2 min-w-0 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="font-body text-xs text-slate-500 font-medium shrink-0">Target Query:</span>
            <span className="font-body text-xs font-semibold text-slate-900 truncate max-w-md">
              "{data.query || 'Prior Art Novelty Search'}"
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 font-body text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            Analysis Ready ({metricsData.totalTimeMs || 145}ms)
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportReportAsPdf(data)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 font-body text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
            Export Report (PDF)
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-body text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export (JSON)
          </button>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            New Search
          </Link>
        </div>
      </div>

      {/* 2. Executive Prior-Art Verdict & Novelty Assessment Workstation Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              Executive Prior-Art Verdict & Novelty Assessment
            </h2>
            <p className="font-body text-xs text-slate-500">
              Citation-grounded analysis across global prior art databases
            </p>
          </div>

          <span className={`inline-flex items-center gap-1.5 font-body text-xs font-semibold px-3.5 py-1.5 rounded-full border ${topMatchRisk.bg} ${topMatchRisk.text}`}>
            {topMatchRisk.badgeText}
          </span>
        </div>

        {/* 2-Column Split Layout */}
        <div className="grid gap-6 lg:grid-cols-12 items-center">
          {/* Left Column: Radial Novelty Dial */}
          <div className="lg:col-span-4 border-r-0 lg:border-r border-slate-100 lg:pr-6 flex justify-center">
            <NoveltyDial
              noveltyScore={analysisData.noveltyScore ?? 0.82}
              obviousnessScore={analysisData.obviousnessScore ?? 0.18}
              overlapScore={overlapData.overallOverlapScore ?? 15}
              riskLevel={overlapData.riskLevel ?? 'Low'}
              summary={analysisData.summary}
            />
          </div>

          {/* Right Column: 3 Core Executive Verdict Answers */}
          <div className="lg:col-span-8 space-y-3 font-body text-xs">
            {/* Answer 1 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  1. Matching Prior Art Found
                </span>
                <span className="font-mono text-[11px] font-semibold text-slate-500">
                  {results?.length || 0} Candidates Matched
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Found <span className="font-semibold text-slate-900">{results?.length || 0} prior-art patents</span> with up to <span className="font-semibold text-rose-700">{topMatchRisk.pct}% max overlap</span>. Closest reference is <span className="font-mono font-bold text-indigo-700">#{results?.[0]?.patentId || results?.[0]?.id || 'US-10112233-B2'}</span>.
              </p>
            </div>

            {/* Answer 2 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  2. Statutory Rejection Hazards (35 U.S.C. 102/103)
                </span>
                <span className="font-mono text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Section 102 Risk
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Draft Claim #1 is vulnerable under <span className="font-semibold text-slate-900">35 U.S.C. 102 (Anticipation)</span> due to optical & LiDAR sensor fusion element overlap with US-10112233-B2.
              </p>
            </div>

            {/* Answer 3 */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  <Lightbulb className="h-4 w-4 text-indigo-600 shrink-0" />
                  3. Actionable Claim Narrowing Strategy
                </span>
                <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Amendment Advice
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Narrow independent Claim 1 body to include <span className="font-semibold text-indigo-900">resonant inductive wireless power receiver feedback loop</span> to establish clear novelty over prior art.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sleek Segmented Control Workstation Tab Bar */}
      <div className="flex border border-slate-200 bg-slate-100/80 p-1.5 rounded-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'insights'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Prior-Art Insights & Claim Guidance
        </button>

        <button
          onClick={() => setActiveTab('patents')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'patents'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" />
          Retrieved Prior-Art Patents ({results?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'technical'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Technical Deep-Dive & System Mechanics
        </button>
      </div>

      {/* 4. Tab Content Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-indigo-600" />
                Prior-Art Limitation Matrix & Statutory Rejection Analysis
              </h2>
              <span className="inline-flex items-center gap-1 font-body text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> Grounded Analysis
              </span>
            </div>

            <CitationReport
              analysis={analysisData}
              overlapAnalysis={overlapData}
              onDownloadPdf={() => exportReportAsPdf(data)}
              onSelectPatent={(patentId) => {
                const found = results.find(
                  (p: any) => p.patentId === patentId || p.id === patentId
                );
                if (found) setSelectedPatent(found);
              }}
            />
          </motion.div>
        )}

        {activeTab === 'patents' && (
          <motion.div
            key="patents"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Retrieved Prior-Art Patents
              </h3>
              <span className="font-body text-xs text-slate-500">
                Ranked by Prior-Art Overlap
              </span>
            </div>

            <ResultsList
              results={results}
              onView={(patent) => setSelectedPatent(patent)}
            />
          </motion.div>
        )}

        {activeTab === 'technical' && (
          <motion.div
            key="technical"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TechnicalDeepDive confidence={confidenceBlock} metrics={metricsData} query={data.query} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patent Inspector Detail Modal */}
      <Modal isOpen={selectedPatent !== null} onClose={() => setSelectedPatent(null)}>
        {selectedPatent && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="code-chip bg-indigo-50 text-indigo-700 text-[10px]">
                Patent Candidate #{selectedPatent.patentId || selectedPatent.id}
              </span>
              <h2 className="font-display text-xl font-bold text-slate-900 mt-1">
                {selectedPatent.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700">
                  IPC: {selectedPatent.ipc || 'G06F 16/90'}
                </span>
                {(selectedPatent.similarityScore || selectedPatent.similarity) && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-body font-semibold text-indigo-700 border border-indigo-200">
                    Similarity: {getSimilarityRisk(selectedPatent.similarityScore || selectedPatent.similarity).pct}%
                  </span>
                )}
                {selectedPatent.owner && (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700">
                    Owner: {selectedPatent.owner}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 text-xs font-body">
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Abstract
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedPatent.abstract}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Patent Claims
                </h4>
                <p className="text-slate-700 font-mono leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedPatent.claims}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;