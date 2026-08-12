export interface HardBenchmarkTestCase {
  id: string;
  category: string;
  inventionQuery: string;
  difficultyReason: string;
  expectedRelevantPatentIds: string[];
}

export const HARD_BENCHMARK_DATASET: HardBenchmarkTestCase[] = [
  {
    id: 'HARD-AG-01',
    category: 'agriculture',
    inventionQuery: 'Unmanned quadcopter aerial surveillance and remote field scanning using multi-band infrared and thermal payload to detect plant water stress and disease vectors across large acreage',
    difficultyReason: 'Synonym heavy: uses "quadcopter aerial surveillance", "multi-band infrared", "plant water stress" instead of "drone crop inspection multispectral".',
    expectedRelevantPatentIds: ['US1001', 'US1003', 'US-9876501', 'US-9876503'],
  },
  {
    id: 'HARD-AG-02',
    category: 'agriculture',
    inventionQuery: 'Subterranean micro-emitter fertigation loop with closed-loop telemetry measuring hydrogen ion concentration and volumetric water content',
    difficultyReason: 'Term mismatch: uses "subterranean micro-emitter fertigation" and "hydrogen ion concentration" for drip irrigation and soil pH.',
    expectedRelevantPatentIds: ['US1005', 'US1006', 'US-9876505'],
  },
  {
    id: 'HARD-ROB-01',
    category: 'robotics',
    inventionQuery: 'Unmanned ground vehicle spatial localization fusing optical rangefinding laser scanning with feature tracking spatial mapping in dense indoor facilities',
    difficultyReason: 'Vocabulary shift: uses "optical rangefinding laser scanning" and "unmanned ground vehicle" instead of "LiDAR visual SLAM mobile robot".',
    expectedRelevantPatentIds: ['US2001', 'US2002', 'US-8876501', 'US-8876502'],
  },
  {
    id: 'HARD-ROB-02',
    category: 'robotics',
    inventionQuery: 'Human-centric collaborative manipulator joint mechanism incorporating strain gauge torque transduction and compliant back-drivable gearing',
    difficultyReason: 'Complex phrase variation: uses "manipulator joint mechanism incorporating strain gauge torque transduction" for cobot joint actuator.',
    expectedRelevantPatentIds: ['US2003', 'US2004', 'US-8876503'],
  },
  {
    id: 'HARD-ROB-03',
    category: 'robotics',
    inventionQuery: 'Wearable motorized lower-body orthotic brace responsive to surface myoelectric potential signals extracted from quadriceps muscle activation',
    difficultyReason: 'Synonym shift: "myoelectric potential signals" and "motorized lower-body orthotic brace" instead of "electromyographic sEMG exoskeleton".',
    expectedRelevantPatentIds: ['US2005', 'US2006', 'US-8876505'],
  },
  {
    id: 'HARD-SEC-01',
    category: 'cybersecurity',
    inventionQuery: 'Perimeterless access protocol utilizing micro-attestation claims validated inside SGX memory enclaves to enforce least-privilege security',
    difficultyReason: 'Acronym shift: uses "SGX memory enclaves" and "micro-attestation claims" instead of "zero-trust dynamic identity tokens hardware enclave".',
    expectedRelevantPatentIds: ['US3001', 'US3002', 'US-7876501', 'US-7876502'],
  },
  {
    id: 'HARD-SEC-02',
    category: 'cybersecurity',
    inventionQuery: 'Real-time network packet payload binary classification via deep convolutional neural layers to isolate zero-day exploit patterns',
    difficultyReason: 'Conceptual shift: "zero-day exploit patterns" and "binary classification via convolutional neural layers" instead of "malware signature detection".',
    expectedRelevantPatentIds: ['US3003', 'US3004', 'US-7876503'],
  },
  {
    id: 'HARD-SEC-03',
    category: 'cybersecurity',
    inventionQuery: 'Privacy-preserving mathematical evaluation over encrypted polynomial ciphertext without revealing plaintext keys to remote compute nodes',
    difficultyReason: 'Abstract description: uses "mathematical evaluation over encrypted polynomial ciphertext" for homomorphic encryption cloud processing.',
    expectedRelevantPatentIds: ['US3005', 'US3006', 'US-7876505'],
  },
  {
    id: 'HARD-ENG-01',
    category: 'energy',
    inventionQuery: 'Electrochemical energy storage pack protection module monitoring AC impedance spectroscopy to suppress catastrophic thermal breakdown in solid lithium polymer cells',
    difficultyReason: 'Technical phrase shift: "AC impedance spectroscopy" and "catastrophic thermal breakdown" for BMS thermal runaway prevention.',
    expectedRelevantPatentIds: ['US4001', 'US4002', 'US-6876501', 'US-6876502'],
  },
  {
    id: 'HARD-ENG-02',
    category: 'energy',
    inventionQuery: 'Dual-junction photovoltaic collector integrating organometallic halide top absorber layer with nanostructured photon trapping anti-reflection surface',
    difficultyReason: 'Chemical name shift: "organometallic halide top absorber" instead of "perovskite tandem solar cell".',
    expectedRelevantPatentIds: ['US4003', 'US4004', 'US-6876503'],
  },
  {
    id: 'HARD-ENG-03',
    category: 'energy',
    inventionQuery: 'Nacelle laser optical velocity sensor projecting coherent light forward to modulate rotor blade attack angles prior to incoming atmospheric turbulence',
    difficultyReason: 'Descriptive shift: "laser optical velocity sensor" and "rotor blade attack angles" instead of "Doppler LiDAR pitch control".',
    expectedRelevantPatentIds: ['US4005', 'US4006', 'US-6876505'],
  },
  {
    id: 'HARD-ELE-01',
    category: 'electronics',
    inventionQuery: 'Wide bandgap semiconductor gate switching driver incorporating dv/dt suppression clamp circuits for high frequency power inverters',
    difficultyReason: 'Technical shift: "wide bandgap semiconductor" instead of "GaN power MOSFET transistor".',
    expectedRelevantPatentIds: ['US5001', 'US5002', 'US-5876501', 'US-5876502'],
  },
  {
    id: 'HARD-ELE-02',
    category: 'electronics',
    inventionQuery: 'Bendable electroluminescent display matrix coated with nanometer-scale inorganic barrier film deposited via gas-phase atomic layer growth to inhibit moisture degradation',
    difficultyReason: 'Long descriptive text: "nanometer-scale inorganic barrier film deposited via gas-phase atomic layer growth" for flexible OLED ALD encapsulation.',
    expectedRelevantPatentIds: ['US5003', 'US5004', 'US-5876503'],
  },
  {
    id: 'HARD-ELE-03',
    category: 'electronics',
    inventionQuery: 'Non-contact inductive power transmission assembly with planar ferrite cores and resonant frequency tuning for high-power electric vehicle battery replenishment',
    difficultyReason: 'Synonym shift: "non-contact inductive power transmission assembly" instead of "wireless resonant inductive power transfer pad".',
    expectedRelevantPatentIds: ['US5005', 'US5006', 'US-5876505'],
  },
  {
    id: 'HARD-MFG-01',
    category: 'manufacturing',
    inventionQuery: 'Direct metal laser sintering printer featuring coaxial optical pyrometry focused on molten metal pools to regulate thermal deposition parameters in real time',
    difficultyReason: 'Manufacturing terminology shift: "direct metal laser sintering" and "molten metal pools" instead of "laser powder bed melt pool monitoring".',
    expectedRelevantPatentIds: ['US6001', 'US6002', 'US-4876501', 'US-4876502'],
  },
  {
    id: 'HARD-MFG-02',
    category: 'manufacturing',
    inventionQuery: 'CNC machining center health diagnostic unit analyzing spindle acoustic emissions and tri-axial acceleration signals to mitigate machine tool chatter',
    difficultyReason: 'Phrase variation: "tri-axial acceleration signals" and "spindle acoustic emissions" instead of "MEMS accelerometer tool vibration".',
    expectedRelevantPatentIds: ['US6003', 'US6004', 'US-4876503'],
  },
  {
    id: 'HARD-CS-01',
    category: 'computer_systems',
    inventionQuery: 'Distributed key-value memory store coordinating fault-tolerant state machine log replication across geographically separated cloud instances using Raft leader election',
    difficultyReason: 'Multi-sentence complex query: "geographically separated cloud instances using Raft leader election".',
    expectedRelevantPatentIds: ['US7001', 'US7002', 'US-3876501', 'US-3876502'],
  },
  {
    id: 'HARD-CS-02',
    category: 'computer_systems',
    inventionQuery: 'Specialized deep learning coprocessor containing two-dimensional matrix multiply-accumulate execution grid for high throughput neural network tensor arithmetic',
    difficultyReason: 'Architectural shift: "matrix multiply-accumulate execution grid" and "deep learning coprocessor" instead of "TPU Systolic array".',
    expectedRelevantPatentIds: ['US7003', 'US7004', 'US-3876503'],
  },
  {
    id: 'HARD-TEL-01',
    category: 'telecommunications',
    inventionQuery: 'Multi-element active antenna array for 5G cellular basestation executing digital phase shifters and spatial precoding to form directed RF beams',
    difficultyReason: 'Phased array jargon: "digital phase shifters and spatial precoding" for massive MIMO beamforming.',
    expectedRelevantPatentIds: ['US9001', 'US9002', 'US-1876501', 'US-1876502'],
  },
  {
    id: 'HARD-MED-01',
    category: 'medical_devices',
    inventionQuery: 'Transdermal enzymatic biosensor patch providing continuous interstitial glucose concentration measurements coupled to short-range wireless telemetry and hypoglycemia forecasting',
    difficultyReason: 'Medical terminology shift: "transdermal enzymatic biosensor patch" and "hypoglycemia forecasting" instead of "CGM continuous glucose monitor".',
    expectedRelevantPatentIds: ['US10001', 'US10002', 'US-0876501', 'US-0876502'],
  },
];
