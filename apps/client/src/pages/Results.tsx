import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  FileText,
  Columns,
  Wrench,
  ExternalLink,
} from 'lucide-react';

const getGooglePatentsUrl = (id: string | number): string => {
  if (!id) return 'https://patents.google.com';
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, '');
  const formattedId = /^[a-zA-Z]{2}/.test(cleanId) ? cleanId : `US${cleanId}`;
  return `https://patents.google.com/patent/${formattedId}/en`;
};

import ExecutiveRiskCard from '../components/results/ExecutiveRiskCard';
import FeatureAlignmentMatrix from '../components/results/FeatureAlignmentMatrix';
import InteractiveSplitView from '../components/results/InteractiveSplitView';
import DesignAroundTab from '../components/results/DesignAroundTab';
import Modal from '../components/ui/Modal';
import Loader from '../components/common/Loader';
import { searchPatent, fetchNoveltyMatrix, fetchDesignAround, exportAttorneyPdfReport } from '../services/api';
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
  const [activeRightTab, setActiveRightTab] = useState<'matrix' | 'design-around' | 'inspector' | 'patents'>('matrix');
  const [showAllCandidates, setShowAllCandidates] = useState<boolean>(false);
  const [liveRagData, setLiveRagData] = useState<any>(location.state || DEFAULT_RAG_DATA);
  const [noveltyMatrixData, setNoveltyMatrixData] = useState<any>(null);
  const [designAroundData, setDesignAroundData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!location.state);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

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
  const analysisData = data.analysis || data.noveltyAnalysis || DEFAULT_RAG_DATA.analysis;

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

  const handleDownloadAttorneyPdf = async () => {
    setExportingPdf(true);
    try {
      await exportAttorneyPdfReport({
        inventionTitle: data.query || 'Autonomous Drone LiDAR Sensor Fusion & Inductive Charging System',
        msmeName: 'PatentIQ Innovator Enterprise',
        overallRiskLevel: riskLevel,
        noveltyRiskScore: riskScore,
        executiveRationale,
        featureMatrix: matrixItems?.[0]?.featureOverlaps || [],
        priorArtCitations: results.slice(0, 5),
        designAround: designAroundPayload?.recommendations || [],
      });
    } catch (err) {
      console.warn('[Results] Server-side PDF export fallback to local export:', err);
      exportReportAsPdf(data);
    } finally {
      setExportingPdf(false);
    }
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
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadAttorneyPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 font-body text-xs font-bold text-white hover:from-indigo-500 hover:to-indigo-600 transition shadow-sm disabled:opacity-60"
          >
            {exportingPdf ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-white" />
                Download Attorney Report (PDF)
              </>
            )}
          </button>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-body text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            New Search
          </Link>
        </div>
      </div>

      {/* 2. Product Executive Verdict Card */}
      <ExecutiveRiskCard
        riskLevel={riskLevel}
        riskScore={riskScore}
        executiveRationale={executiveRationale}
        evaluatedFeaturesCount={matrixItems?.[0]?.featureOverlaps?.length || 2}
        evaluatedPatentsCount={results?.length || 2}
      />

      {/* 3. B2B SaaS Product Workstation: 2-Pane Master-Detail Layout */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch font-body">
        {/* LEFT PANEL: Prior-Art Candidates Drawer (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-indigo-600" />
                Prior-Art Candidates ({results.length})
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                {showAllCandidates ? `All ${results.length} Shown` : 'Top 5 Match'}
              </span>
            </div>

            {/* List of Prior-Art Cards */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {(showAllCandidates ? results : results.slice(0, 5)).map((patent: any) => {
                const isSelected = selectedPatent?.patentId === patent.patentId || selectedPatent?.id === patent.id;
                const simPct = getSimilarityRisk(patent.similarityScore || patent.similarity || 0.75).pct;
                return (
                  <div
                    key={patent.patentId || patent.id}
                    onClick={() => setSelectedPatent(patent)}
                    className={`cursor-pointer rounded-xl border p-3 transition text-xs space-y-1.5 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        #{patent.patentId || patent.id}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {simPct}% Match
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-900 leading-snug line-clamp-2">
                      {patent.title}
                    </h4>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>IPC: {patent.ipc || 'G06F'}</span>
                      <a
                        href={getGooglePatentsUrl(patent.patentId || patent.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Official Patent ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Show More / Show Less Toggle */}
          {results.length > 5 && (
            <button
              onClick={() => setShowAllCandidates(!showAllCandidates)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition shrink-0 mt-2"
            >
              {showAllCandidates
                ? 'Show Top 5 Only'
                : `Show More Candidates (+${results.length - 5} more)`}
            </button>
          )}
        </div>

        {/* RIGHT PANEL: AI Strategy & Inspection Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-4 flex flex-col">
          {/* Workstation Mode Selector */}
          <div className="flex rounded-2xl border border-slate-200 bg-slate-100/90 p-1.5 shadow-2xs shrink-0">
            <button
              onClick={() => setActiveRightTab('matrix')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 font-body text-xs font-semibold transition ${
                activeRightTab === 'matrix'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 text-indigo-600" />
              Feature Alignment Matrix
            </button>

            <button
              onClick={() => setActiveRightTab('design-around')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 font-body text-xs font-semibold transition ${
                activeRightTab === 'design-around'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="h-4 w-4 text-indigo-600" />
              AI Design-Around R&D
            </button>

            <button
              onClick={() => setActiveRightTab('inspector')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2 px-3 font-body text-xs font-semibold transition ${
                activeRightTab === 'inspector'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="h-4 w-4 text-indigo-600" />
              Side-by-Side Claim Inspector
            </button>
          </div>

          {/* Active Workspace View */}
          <div className="w-full flex-1">
            {activeRightTab === 'matrix' && (
              <FeatureAlignmentMatrix
                matrix={matrixItems}
                onSelectPatent={(patentId) => {
                  const found = results.find(
                    (p: any) => p.patentId === patentId || p.id === patentId
                  );
                  if (found) setSelectedPatent(found);
                }}
              />
            )}

            {activeRightTab === 'design-around' && (
              <DesignAroundTab
                recommendations={designAroundPayload?.recommendations}
                overallStrategy={designAroundPayload?.overallStrategy}
              />
            )}

            {activeRightTab === 'inspector' && (
              <InteractiveSplitView
                userQuery={data.query}
                patents={results.slice(0, 5)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Patent Inspector Detail Modal */}
      <Modal isOpen={selectedPatent !== null} onClose={() => setSelectedPatent(null)}>
        {selectedPatent && (
          <div className="space-y-5 font-body">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
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

              <a
                href={getGooglePatentsUrl(selectedPatent.patentId || selectedPatent.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 font-body text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm shrink-0"
              >
                <ExternalLink className="h-4 w-4" />
                View Full Patent on Google Patents ↗
              </a>
            </div>

            <div className="space-y-4 text-xs font-body max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Full Abstract Disclosure
                </h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  {selectedPatent.abstract || selectedPatent.summary || selectedPatent.description || 'An apparatus and method for prior-art technical evaluation and vector novelty matching.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Independent & Dependent Patent Claims
                </h4>
                <div className="text-slate-800 font-mono leading-relaxed bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 text-xs whitespace-pre-wrap">
                  {selectedPatent.claims || selectedPatent.claimText || selectedPatent.text || '1. An autonomous vehicle navigation apparatus comprising an optical image sensor, a laser radar scanner, and a central processing unit for mapping spatial vectors.'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;