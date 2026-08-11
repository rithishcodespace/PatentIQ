export interface BenchmarkTestCase {
  id: string;
  category: string;
  inventionQuery: string;
  expectedRelevantPatentIds: string[];
}

export const BENCHMARK_DATASET: BenchmarkTestCase[] = [
  // 1. AGRICULTURE (3 queries)
  {
    id: 'AG-01',
    category: 'agriculture',
    inventionQuery: 'Autonomous drone agricultural crop inspection system using multispectral cameras',
    expectedRelevantPatentIds: ['US1001', 'US1003', 'US-9876501', 'US-9876503'],
  },
  {
    id: 'AG-02',
    category: 'agriculture',
    inventionQuery: 'Automated drip irrigation system with soil moisture and pH sensors',
    expectedRelevantPatentIds: ['US1005', 'US1006', 'US-9876505'],
  },
  {
    id: 'AG-03',
    category: 'agriculture',
    inventionQuery: 'Robotic fruit harvesting apparatus with soft robotic gripper and computer vision',
    expectedRelevantPatentIds: ['US1007', 'US1008', 'US-9876507'],
  },

  // 2. ROBOTICS (3 queries)
  {
    id: 'ROB-01',
    category: 'robotics',
    inventionQuery: 'Autonomous mobile robot navigation with LiDAR and visual SLAM spatial mapping',
    expectedRelevantPatentIds: ['US2001', 'US2002', 'US-8876501', 'US-8876502'],
  },
  {
    id: 'ROB-02',
    category: 'robotics',
    inventionQuery: 'Industrial robotic arm torque feedback joint actuator for human-robot collaboration',
    expectedRelevantPatentIds: ['US2003', 'US2004', 'US-8876503'],
  },
  {
    id: 'ROB-03',
    category: 'robotics',
    inventionQuery: 'Exoskeleton leg joint actuation system with electromyographic muscle sensors',
    expectedRelevantPatentIds: ['US2005', 'US2006', 'US-8876505'],
  },

  // 3. CYBERSECURITY (3 queries)
  {
    id: 'SEC-01',
    category: 'cybersecurity',
    inventionQuery: 'Zero-trust network access control with dynamic identity tokens and hardware enclave',
    expectedRelevantPatentIds: ['US3001', 'US3002', 'US-7876501', 'US-7876502'],
  },
  {
    id: 'SEC-02',
    category: 'cybersecurity',
    inventionQuery: 'Automated malware signature detection using deep neural network packet inspection',
    expectedRelevantPatentIds: ['US3003', 'US3004', 'US-7876503'],
  },
  {
    id: 'SEC-03',
    category: 'cybersecurity',
    inventionQuery: 'Homomorphic encryption data processing pipeline for secure cloud computations',
    expectedRelevantPatentIds: ['US3005', 'US3006', 'US-7876505'],
  },

  // 4. ENERGY (3 queries)
  {
    id: 'ENG-01',
    category: 'energy',
    inventionQuery: 'BMS battery management system for solid-state lithium battery thermal runaway prevention',
    expectedRelevantPatentIds: ['US4001', 'US4002', 'US-6876501', 'US-6876502'],
  },
  {
    id: 'ENG-02',
    category: 'energy',
    inventionQuery: 'Perovskite tandem solar cell with micro-textured anti-reflective coating',
    expectedRelevantPatentIds: ['US4003', 'US4004', 'US-6876503'],
  },
  {
    id: 'ENG-03',
    category: 'energy',
    inventionQuery: 'Offshore wind turbine pitch control with lidars for aerodynamic load reduction',
    expectedRelevantPatentIds: ['US4005', 'US4006', 'US-6876505'],
  },

  // 5. ELECTRONICS (3 queries)
  {
    id: 'ELE-01',
    category: 'electronics',
    inventionQuery: 'GaN power MOSFET transistor gate driver circuit with ultra-fast switching',
    expectedRelevantPatentIds: ['US5001', 'US5002', 'US-5876501', 'US-5876502'],
  },
  {
    id: 'ELE-02',
    category: 'electronics',
    inventionQuery: 'Flexible OLED display panel with encapsulation layer against moisture ingress',
    expectedRelevantPatentIds: ['US5003', 'US5004', 'US-5876503'],
  },
  {
    id: 'ELE-03',
    category: 'electronics',
    inventionQuery: 'Wireless resonant inductive power transfer pad for electric vehicle charging',
    expectedRelevantPatentIds: ['US5005', 'US5006', 'US-5876505'],
  },

  // 6. MANUFACTURING (3 queries)
  {
    id: 'MFG-01',
    category: 'manufacturing',
    inventionQuery: 'Additive manufacturing laser powder bed fusion system with real-time melt pool monitoring',
    expectedRelevantPatentIds: ['US6001', 'US6002', 'US-4876501', 'US-4876502'],
  },
  {
    id: 'MFG-02',
    category: 'manufacturing',
    inventionQuery: 'High-speed automated CNC milling tool vibration monitoring using MEMS accelerometers',
    expectedRelevantPatentIds: ['US6003', 'US6004', 'US-4876503'],
  },
  {
    id: 'MFG-03',
    category: 'manufacturing',
    inventionQuery: 'Composite material resin transfer molding apparatus with vacuum pressure regulation',
    expectedRelevantPatentIds: ['US6005', 'US6006', 'US-4876505'],
  },

  // 7. COMPUTER SYSTEMS (3 queries)
  {
    id: 'CS-01',
    category: 'computer systems',
    inventionQuery: 'Distributed key-value database cache replication using Raft consensus protocol',
    expectedRelevantPatentIds: ['US7001', 'US7002', 'US-3876501', 'US-3876502'],
  },
  {
    id: 'CS-02',
    category: 'computer systems',
    inventionQuery: 'Tensor processing unit Systolic array matrix multiplication hardware accelerator',
    expectedRelevantPatentIds: ['US7003', 'US7004', 'US-3876503'],
  },
  {
    id: 'CS-03',
    category: 'computer systems',
    inventionQuery: 'NVMe flash storage controller with wear levelling and garbage collection firmware',
    expectedRelevantPatentIds: ['US7005', 'US7006', 'US-3876505'],
  },

  // 8. TRANSPORTATION (3 queries)
  {
    id: 'TRN-01',
    category: 'transportation',
    inventionQuery: 'Electric vehicle regenerative braking torque vectoring controller for stability',
    expectedRelevantPatentIds: ['US8001', 'US8002', 'US-2876501', 'US-2876502'],
  },
  {
    id: 'TRN-02',
    category: 'transportation',
    inventionQuery: 'Maglev train electromagnetic levitation guidance system with active cooling',
    expectedRelevantPatentIds: ['US8003', 'US8004', 'US-2876503'],
  },
  {
    id: 'TRN-03',
    category: 'transportation',
    inventionQuery: 'Autonomous flight control system for VTOL tilt-rotor eVTOL aircraft',
    expectedRelevantPatentIds: ['US8005', 'US8006', 'US-2876505'],
  },

  // 9. TELECOMMUNICATIONS (3 queries)
  {
    id: 'TEL-01',
    category: 'telecommunications',
    inventionQuery: 'Massive MIMO 5G beamforming antenna array with spatial division multiplexing',
    expectedRelevantPatentIds: ['US9001', 'US9002', 'US-1876501', 'US-1876502'],
  },
  {
    id: 'TEL-02',
    category: 'telecommunications',
    inventionQuery: 'Self-healing fiber optic cable with backscatter strain sensing and microcapsule healing',
    expectedRelevantPatentIds: ['US9003', 'US9004', 'US-9876501', 'US-1876503'],
  },
  {
    id: 'TEL-03',
    category: 'telecommunications',
    inventionQuery: 'Low Earth Orbit (LEO) satellite constellation laser inter-satellite optical link',
    expectedRelevantPatentIds: ['US9005', 'US9006', 'US-1876505'],
  },

  // 10. MEDICAL DEVICES (3 queries)
  {
    id: 'MED-01',
    category: 'medical devices',
    inventionQuery: 'Wearable continuous glucose monitor (CGM) with transdermal electrochemical sensor',
    expectedRelevantPatentIds: ['US10001', 'US10002', 'US-0876501', 'US-0876502'],
  },
  {
    id: 'MED-02',
    category: 'medical devices',
    inventionQuery: 'Implantable cardiac pacemaker with wireless inductive charging and telemetry',
    expectedRelevantPatentIds: ['US10003', 'US10004', 'US-0876503'],
  },
  {
    id: 'MED-03',
    category: 'medical devices',
    inventionQuery: 'Laparoscopic surgical robotic instrument with force feedback haptic control',
    expectedRelevantPatentIds: ['US10005', 'US10006', 'US-0876505'],
  },
];
