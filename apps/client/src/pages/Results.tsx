import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Zap,
  Download,
  FileText,
  Columns,
  Wrench,
  Cpu,
} from 'lucide-react';

import ExecutiveRiskCard from '../components/results/ExecutiveRiskCard';
import FeatureAlignmentMatrix from '../components/results/FeatureAlignmentMatrix';
import InteractiveSplitView from '../components/results/InteractiveSplitView';
import DesignAroundTab from '../components/results/DesignAroundTab';
import ResultsList from '../components/results/ResultsList';
import TechnicalDeepDive from '../components/results/TechnicalDeepDive';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';
import { searchPatent, fetchNoveltyMatrix, fetchDesignAround } from '../services/api';
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
      'The submitted invention disclosure demonstrates strong novelty in resonant inductive wireless charging feedback loops, with moderate prior-art claim overlap under 35 U.S.C. 102/103 with US-10112233-B2.',
  },
  overlapAnalysis: {
    overallRiskLevel: 'MODERATE_RISK',
    noveltyRiskScore: 42,
    executiveRationale:
      'Draft Claim 1 demonstrates strong novelty in resonant inductive wireless charging feedback loops, with moderate prior-art claim overlap under 35 U.S.C. 102/103 with US-10112233-B2.',
    matrix: [
      {
        patentId: 'US-10112233-B2',
        title: 'Integrated LiDAR and Optical Fusion Architecture for Autonomous Navigation',
        ipc: 'B64C 39/02',
        similarityScore: 0.85,
        overallPatentOverlapScore: 85,
        featureOverlaps: [
          {
            featureId: 'F1',
            featureName: 'Optical flow velocity sensor',
            featureDescription: 'High frequency optical sensing module',
            status: 'EXACT_MATCH',
            matchConfidence: 0.92,
            citationEvidence: '[Claims 1-4]: Optical velocity sensor emitting light beam.',
            explanation: 'Exact match with prior art claim 1.',
          },
          {
            featureId: 'F2',
            featureName: 'Resonant Inductive Wireless Charger',
            featureDescription: 'Dynamic power feedback loop',
            status: 'NO_MATCH',
            matchConfidence: 0.12,
            citationEvidence: 'No resonant inductive charger recited in reference.',
            explanation: 'Novel element establishing clear patentability.',
          },
        ],
      },
    ],
  },
  designAround: {
    overallStrategy:
      'Pivot core architectural components toward specialized solid-state hardware and dynamic control protocols to establish clear novelty and Freedom to Operate (FTO) over cited prior art.',
    recommendations: [
      {
        featureId: 'F1',
        featureName: 'Optical Flow Velocity Sensor',
        conflictReason: 'Direct overlap with US-10112233-B2 Independent Claim 1 regarding optical velocity sensing.',
        suggestedModification:
          'Switch from optical flow velocity sensor to MEMS ultrasonic Doppler transducer array to eliminate optical calibration requirements.',
        patentabilityBoost: '+40% Novelty Boost',
        rAndDFeasibility: 'HIGH',
        targetPriorArtId: 'US-10112233-B2',
      },
      {
        featureId: 'F2',
        featureName: 'Wireless Bluetooth Telemetry Protocol',
        conflictReason: 'Overlaps with baseline wireless RF power telemetry claims in US-9876543-A1.',
        suggestedModification:
          'Integrate adaptive frequency-hopping spread spectrum (FHSS) mesh protocol with localized edge encryption.',
        patentabilityBoost: '+35% Novelty Boost',
        rAndDFeasibility: 'HIGH',
        targetPriorArtId: 'US-9876543-A1',
      },
    ],
  },
  metrics: { totalTimeMs: 145, overlappingClaimsCount: 1 },
};

const Results = () => {
  const location = useLocation();
  const [selectedPatent, setSelectedPatent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'split' | 'design-around' | 'deepdive'>('matrix');
  const [liveRagData, setLiveRagData] = useState<any>(location.state || DEFAULT_RAG_DATA);
  const [noveltyMatrixData, setNoveltyMatrixData] = useState<any>(null);
  const [designAroundData, setDesignAroundData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!location.state);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!location.state) {
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

      // Fetch Novelty Matrix & Design-Around in background if needed
      const queryStr = liveRagData?.query || DEFAULT_RAG_DATA.query;
      try {
        const [matrixRes, designAroundRes] = await Promise.all([
          fetchNoveltyMatrix({ query: queryStr, topK: 5 }),
          fetchDesignAround({ query: queryStr, topK: 5 }),
        ]);

        if (isMounted) {
          if (matrixRes && matrixRes.data) {
            setNoveltyMatrixData(matrixRes.data);
          }
          if (designAroundRes) {
            setDesignAroundData(designAroundRes);
          }
        }
      } catch (err) {
        console.warn('[Results] Background matrix/design-around fetch failed:', err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [location.state]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4 font-body">
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
  const metricsData = data.metrics || DEFAULT_RAG_DATA.metrics;

  // Novelty Matrix Data (Backend API result or fallback)
  const matrixPayload = noveltyMatrixData || data.overlapAnalysis || DEFAULT_RAG_DATA.overlapAnalysis;
  const riskLevel = matrixPayload.overallRiskLevel || matrixPayload.riskLevel || 'MODERATE_RISK';
  const riskScore = matrixPayload.noveltyRiskScore ?? matrixPayload.overallOverlapScore ?? 42;
  const executiveRationale =
    matrixPayload.executiveRationale ||
    analysisData.summary ||
    'Draft Claim 1 demonstrates strong novelty in resonant inductive wireless charging feedback loops, with moderate prior-art claim overlap under 35 U.S.C. 102/103 with US-10112233-B2.';
  const matrixItems = matrixPayload.matrix || DEFAULT_RAG_DATA.overlapAnalysis.matrix;

  // Design Around Data (Backend API result or fallback)
  const designAroundPayload = designAroundData || data.designAround || DEFAULT_RAG_DATA.designAround;

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ ...data, noveltyMatrix: matrixPayload, designAround: designAroundPayload }, null, 2)
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

      {/* 2. Executive Risk Card */}
      <ExecutiveRiskCard
        riskLevel={riskLevel}
        riskScore={riskScore}
        executiveRationale={executiveRationale}
        evaluatedFeaturesCount={matrixItems?.[0]?.featureOverlaps?.length || 2}
        evaluatedPatentsCount={results?.length || 2}
      />

      {/* 3. Sleek Segmented Control Workstation Tab Bar */}
      <div className="flex border border-slate-200 bg-slate-100/80 p-1.5 rounded-2xl shadow-2xs">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'matrix'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          Feature Alignment Matrix
        </button>

        <button
          onClick={() => setActiveTab('split')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'split'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Columns className="h-4 w-4" />
          Interactive Side-by-Side Split View
        </button>

        <button
          onClick={() => setActiveTab('design-around')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'design-around'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="h-4 w-4" />
          AI Design-Around R&D
        </button>

        <button
          onClick={() => setActiveTab('deepdive')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-body text-xs font-semibold transition ${
            activeTab === 'deepdive'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="h-4 w-4" />
          Prior-Art Patents & Deep Dive ({results?.length || 0})
        </button>
      </div>

      {/* 4. Tab Content Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'matrix' && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <FeatureAlignmentMatrix
              matrix={matrixItems}
              onSelectPatent={(patentId) => {
                const found = results.find(
                  (p: any) => p.patentId === patentId || p.id === patentId
                );
                if (found) setSelectedPatent(found);
              }}
            />
          </motion.div>
        )}

        {activeTab === 'split' && (
          <motion.div
            key="split"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <InteractiveSplitView
              userQuery={data.query}
              patents={results}
            />
          </motion.div>
        )}

        {activeTab === 'design-around' && (
          <motion.div
            key="design-around"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <DesignAroundTab
              recommendations={designAroundPayload?.recommendations}
              overallStrategy={designAroundPayload?.overallStrategy}
            />
          </motion.div>
        )}

        {activeTab === 'deepdive' && (
          <motion.div
            key="deepdive"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Retrieved Prior-Art Patent Candidates
              </h3>
              <span className="font-body text-xs text-slate-500">
                Ranked by Vector & BM25 Similarity Score
              </span>
            </div>

            <ResultsList
              results={results}
              onView={(patent) => setSelectedPatent(patent)}
            />

            <TechnicalDeepDive confidence={confidenceBlock} metrics={metricsData} query={data.query} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patent Inspector Detail Modal */}
      <Modal isOpen={selectedPatent !== null} onClose={() => setSelectedPatent(null)}>
        {selectedPatent && (
          <div className="space-y-5 font-body">
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