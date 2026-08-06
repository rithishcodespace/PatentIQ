import type { RagResponseData } from '../types/rag';
import type { SearchHistoryRecord } from '../types/history';
import type { UserProfile } from '../types/auth';

export const mockCurrentUser: UserProfile = {
  id: 'usr_882391023',
  email: 'analyst.rithish@patentiq.ai',
  fullName: 'Rithish (Patent Analyst)',
  role: 'User',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

export const mockRagResponse: RagResponseData = {
  success: true,
  query: 'Autonomous drone navigation using LiDAR depth mapping and optical flow sensor fusion in GPS-denied environments',
  confidence: {
    retrieval: {
      score: 92.1,
      level: 'Very High',
      factors: {
        topScore: 92.0,
        avgScore: 88.0,
        distributionScore: 92.0,
        countScore: 100.0,
        metadataScore: 100.0,
      },
    },
    analysis: {
      score: 87.3,
      level: 'High',
      factors: {
        retrievalScore: 92.1,
        completenessScore: 100.0,
        claimOverlapScore: 85.0,
        metadataQualityScore: 95.0,
      },
    },
    overall: {
      score: 89.2,
      level: 'High',
    },
  },
  retrievedPatents: [
    {
      patentId: 'US-10112233-B2',
      title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
      similarityScore: 0.92,
      ipc: 'B64C 39/02',
      country: 'US',
      publicationDate: '2023-05-12',
      owner: 'AeroTech Systems Inc.',
      abstract: 'An autonomous navigation method combining LiDAR depth mapping and optical flow velocity measurement for GPS-denied environments.',
      claims: '1. A flight navigation system comprising LiDAR and optical flow sensors configured to switch dynamically when optical reflection is lost...',
    },
    {
      patentId: 'EP-99887766-A1',
      title: 'Optical flow velocity estimation fused with laser range sensors',
      similarityScore: 0.88,
      ipc: 'G05D 1/02',
      country: 'EP',
      publicationDate: '2022-11-04',
      owner: 'DroneDynamics Corp.',
      abstract: 'A sensor fusion algorithm for micro aerial vehicles utilizing multi-camera optical flow and low-power infrared laser distance meters.',
      claims: '1. A method for velocity estimation using optical flow vectors synchronized with rangefinder pulses...',
    },
    {
      patentId: 'US-87654321-B1',
      title: 'Autonomous obstacle avoidance for micro unmanned aerial vehicles',
      similarityScore: 0.81,
      ipc: 'B64C 27/08',
      country: 'US',
      publicationDate: '2021-08-19',
      owner: 'RoboFlight Technologies',
      abstract: 'Real-time spatial point-cloud processing for obstacle detection using lightweight optical flow camera modules.',
      claims: '1. An aerial vehicle guidance apparatus comprising an onboard processor executing spatial point cloud alignment...',
    },
  ],
  analysis: {
    summary:
      'The proposed invention combines LiDAR depth estimation and optical flow velocity sensing to provide dual-sensor redundancy for autonomous drone navigation in GPS-denied environments. While prior art [US-10112233-B2] discloses combined LiDAR and optical flow sensors for obstacle detection, the present disclosure uniquely introduces real-time adaptive Kalman weight adjustment specifically during optical reflection loss.',
    similarPatents: [
      { patentId: 'US-10112233-B2', reason: 'Discloses combined LiDAR and optical flow hardware architecture for drone obstacle avoidance.' },
      { patentId: 'EP-99887766-A1', reason: 'Shares optical flow velocity estimation fused with laser range measurements.' },
    ],
    featureComparison: {
      commonFeatures: ['Optical flow velocity sensor integration', 'LiDAR 3D point-cloud depth mapping', 'GPS-denied flight navigation'],
      uniqueFeatures: ['Real-time adaptive weight fusion matrix during specular optical reflection loss', 'Sub-millisecond hardware clock synchronization between laser pulse and frame exposure'],
      partialOverlap: ['Low-altitude altitude hold fallback mode using infrared rangefinder'],
    },
    novelAspects: [
      'Dynamic real-time adaptive sensor switching matrix triggered by optical reflection degradation.',
      'Sub-millisecond clock synchronization between LiDAR pulse emissions and optical flow camera shutter triggers.',
    ],
    overlappingClaims: [
      'Claim 1 of [US-10112233-B2] directly overlaps with the primary sensor fusion architecture claim.',
      'Claim 3 of [EP-99887766-A1] partially overlaps with rangefinder velocity calculations.',
    ],
    risks: [
      'High risk of rejection under 35 U.S.C. 102 over [US-10112233-B2] unless claims 1-4 are amended.',
      'Moderate obviousness risk under 35 U.S.C. 103 combining [US-10112233-B2] and [EP-99887766-A1].',
    ],
    recommendations: [
      'Narrow independent Claim 1 to explicitly recite the adaptive reflection-loss kalman weight matrix.',
      'File dependent claims highlighting sub-millisecond shutter synchronization.',
    ],
  },
  overlapAnalysis: [
    {
      patentId: 'US-10112233-B2',
      title: 'Dual-sensor UAV obstacle detection system using LiDAR and optical flow',
      similarityScore: 0.92,
      relevantSections: [
        { section: 'abstract', reason: 'Discloses identical dual-sensor setup combining LiDAR and optical flow' },
        { section: 'claims', reason: 'Claim 1 covers flight navigation apparatus with LiDAR and optical flow' },
      ],
      overlappingClaims: [
        {
          claimNumber: 1,
          citedPatentId: 'US-10112233-B2',
          summary: 'Dual sensor flight control apparatus',
          overlapStrength: 'High',
          reason: 'Direct claim overlap on sensor fusion hardware arrangement and obstacle detection logic.',
        },
        {
          claimNumber: 4,
          citedPatentId: 'US-10112233-B2',
          summary: 'GPS-denied navigation fallback mode',
          overlapStrength: 'Medium',
          reason: 'Substantial overlap in state estimation when satellite navigation signals are unavailable.',
        },
      ],
    },
    {
      patentId: 'EP-99887766-A1',
      title: 'Optical flow velocity estimation fused with laser range sensors',
      similarityScore: 0.88,
      relevantSections: [
        { section: 'description', reason: 'Describes velocity vector calculation from optical flow frames' },
      ],
      overlappingClaims: [
        {
          claimNumber: 2,
          citedPatentId: 'EP-99887766-A1',
          summary: 'Optical flow frame velocity calculation',
          overlapStrength: 'Medium',
          reason: 'Partial overlap in optical flow vector calculation and rangefinder pulse synchronization.',
        },
      ],
    },
  ],
  metrics: {
    retrievalTimeMs: 95,
    promptTimeMs: 14,
    llmInferenceTimeMs: 1140,
    totalTimeMs: 1249,
    retrievedCount: 3,
    overlappingClaimsCount: 3,
  },
};

export const mockSearchHistory: SearchHistoryRecord[] = [
  {
    id: 'hist_99812401-a1',
    searchQuery: 'Autonomous drone navigation using LiDAR depth mapping and optical flow sensor fusion in GPS-denied environments',
    topK: 10,
    appliedFilters: { ipc: 'B64C 39/02', country: 'US' },
    totalResults: 3,
    searchLatency: 1249,
    createdAt: '2026-08-01T15:30:00Z',
    confidence: mockRagResponse.confidence,
    retrievedPatents: [
      { patentId: 'US-10112233-B2', title: 'Dual-sensor UAV obstacle detection system', similarityScore: 0.92 },
      { patentId: 'EP-99887766-A1', title: 'Optical flow velocity estimation fused with laser range sensors', similarityScore: 0.88 },
      { patentId: 'US-87654321-B1', title: 'Autonomous obstacle avoidance for micro unmanned aerial vehicles', similarityScore: 0.81 },
    ],
    noveltyAnalysis: {
      id: 'nov_1092348-b2',
      summary: mockRagResponse.analysis.summary,
      overallScore: 89,
      novelAspects: mockRagResponse.analysis.novelAspects,
      overlappingClaims: mockRagResponse.analysis.overlappingClaims,
      createdAt: '2026-08-01T15:30:05Z',
    },
  },
  {
    id: 'hist_77123984-c2',
    searchQuery: 'AI-assisted crop disease diagnostic neural network using multispectral camera sensors',
    topK: 20,
    appliedFilters: { ipc: 'G06V 20/00', country: 'US' },
    totalResults: 14,
    searchLatency: 980,
    createdAt: '2026-07-31T11:15:00Z',
    confidence: {
      retrieval: { score: 94.5, level: 'Very High' },
      analysis: { score: 91.0, level: 'Very High' },
      overall: { score: 92.4, level: 'Very High' },
    },
    retrievedPatents: [
      { patentId: 'US-10923841-B2', title: 'Multispectral crop health diagnostic system using convolutional neural networks', similarityScore: 0.95 },
      { patentId: 'US-10492811-A1', title: 'Automated leaf anomaly detection using mobile camera arrays', similarityScore: 0.89 },
    ],
  },
  {
    id: 'hist_44829103-d3',
    searchQuery: 'Solid-state battery electrolyte composition with lithium metal anode protection layer',
    topK: 10,
    totalResults: 8,
    searchLatency: 1420,
    createdAt: '2026-07-30T09:45:00Z',
    confidence: {
      retrieval: { score: 78.2, level: 'High' },
      analysis: { score: 74.0, level: 'Medium' },
      overall: { score: 75.7, level: 'High' },
    },
    retrievedPatents: [
      { patentId: 'EP-4019283-A1', title: 'Sulfide-based solid electrolyte for lithium secondary battery', similarityScore: 0.84 },
    ],
  },
];

export const mockExtractedDocument = {
  filename: 'Invention_Draft_Drone_Sensor_Fusion_2026.pdf',
  fileType: 'PDF Document (Application/PDF)',
  fileSize: '4.2 MB',
  charCount: 14820,
  wordCount: 2310,
  extractedAt: '2026-08-01T15:42:00Z',
  embeddingStatus: {
    model: 'nomic-embed-text (Ollama)',
    vectorDimensions: 768,
    status: 'Generated & Index Ready',
    latencyMs: 32,
    previewVector: [0.0123, -0.0456, 0.0892, 0.1204, -0.0034, 0.0567, 0.2319, -0.1102],
  },
  sections: {
    title: 'Autonomous Drone Navigation Using LiDAR Depth Mapping and Optical Flow Sensor Fusion',
    ipcCandidate: 'B64C 39/02 (Unmanned Aerial Vehicles)',
    abstract: 'An autonomous aerial navigation system designed for GPS-denied indoor and subterranean operations. The system fuses 3D LiDAR point-cloud depth measurements with high-speed optical flow velocity vectors via a real-time adaptive Kalman weighting matrix.',
    claims: '1. An autonomous aerial navigation system comprising: a 3D LiDAR sensor emitting pulse beams; an optical flow camera capturing sequential ground frames; and a main processing unit executing real-time adaptive weight fusion during specular optical reflection loss.',
  },
};

export const mockApiEndpoints = [
  { method: 'POST', path: '/api/search', summary: 'Execute Top-K semantic similarity vector search via Pinecone & Ollama' },
  { method: 'POST', path: '/api/rag/analyze', summary: 'Run grounded 7-section novelty analysis & overlap calculation via Qwen LLM' },
  { method: 'GET', path: '/api/history', summary: 'Retrieve paginated semantic search and AI analysis history from PostgreSQL' },
  { method: 'POST', path: '/api/upload', summary: 'Upload patent document (PDF, DOCX, TXT) and extract structured text' },
  { method: 'POST', path: '/api/embeddings', summary: 'Generate 768-dimensional vector embeddings using nomic-embed-text' },
  { method: 'GET', path: '/docs', summary: 'Interactive Swagger UI OpenAPI 3.1 documentation portal' },
  { method: 'GET', path: '/docs/json', summary: 'Export complete OpenAPI 3.1 JSON schema definition' },
];
