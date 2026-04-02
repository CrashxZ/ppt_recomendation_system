export const demoUser = {
  email: "stakeholder@pair-demo.org",
  password: "pair-demo-2026",
  name: "Maya Chen",
  role: "Agency Data Owner",
  organization: "Metro ITS Data Office",
};

export const metrics = [
  { id: "up", label: "User-Level Privacy", short: "U-P" },
  { id: "sp", label: "Site-Level Privacy", short: "S-P" },
  { id: "utility", label: "Utility", short: "U" },
  { id: "efficiency", label: "Efficiency", short: "E" },
  { id: "auditability", label: "Privacy Auditability", short: "P-A" },
  { id: "compliance", label: "Policy Compliance", short: "P-C" },
];

export const datasets = [
  {
    id: "ngsim-i80",
    label: "NGSIM I-80 Trajectory Sample",
    type: "Vehicle trajectories",
    cadence: "10 Hz snapshots",
    records: "45,000 trips",
    sensitivity: "High",
    useCases: ["Traffic flow analysis", "Lane change modeling", "Congestion studies"],
  },
  {
    id: "ngsim-us101",
    label: "NGSIM US-101 Segment",
    type: "Vehicle trajectories",
    cadence: "10 Hz snapshots",
    records: "38,500 trips",
    sensitivity: "High",
    useCases: ["Shockwave analysis", "Safety proxy studies", "Operational planning"],
  },
];

export const applications = [
  "Traffic flow analysis",
  "Safety analytics",
  "Behavior modeling",
  "Planning and operations",
];

export const pptCatalog = [
  {
    id: "dp-synthetic",
    name: "Differentially Private Synthetic Trajectories",
    category: "Centralized DP",
    bestFor: ["Traffic flow analysis", "Planning and operations"],
    dataTypes: ["Vehicle trajectories"],
    summary:
      "Builds a sanitized synthetic dataset that preserves macro traffic patterns while reducing direct re-identification risk.",
    strengths: ["Strong user privacy", "Shareable outputs", "Good dashboard utility"],
    cautions: ["Rare-event fidelity may drop", "Runtime increases with tighter privacy budgets"],
    scores: {
      up: 0.92,
      sp: 0.72,
      utility: 0.74,
      efficiency: 0.58,
      auditability: 0.84,
      compliance: 0.83,
    },
  },
  {
    id: "ppfl",
    name: "Privacy-Preserving Federated Learning",
    category: "Distributed PP-FL",
    bestFor: ["Behavior modeling", "Safety analytics"],
    dataTypes: ["Vehicle trajectories"],
    summary:
      "Keeps sensitive raw data at each site and supports collaborative model training when datasets should not be pooled.",
    strengths: ["Strong site protection", "Good modeling utility", "Fits multi-agency collaboration"],
    cautions: ["Higher coordination overhead", "Less suitable for simple open-data release"],
    scores: {
      up: 0.78,
      sp: 0.9,
      utility: 0.86,
      efficiency: 0.49,
      auditability: 0.76,
      compliance: 0.8,
    },
  },
  {
    id: "mpc-tee",
    name: "Secure Multi-Party Computation with TEE Assist",
    category: "Protected computation",
    bestFor: ["Safety analytics", "Planning and operations"],
    dataTypes: ["Vehicle trajectories"],
    summary:
      "Supports tightly controlled collaborative analysis when sites prioritize leakage resistance over ease of deployment.",
    strengths: ["Very strong site privacy", "High compliance posture", "Good for controlled computation"],
    cautions: ["Operationally heavy", "Lower usability for rapid data publishing workflows"],
    scores: {
      up: 0.84,
      sp: 0.95,
      utility: 0.69,
      efficiency: 0.34,
      auditability: 0.88,
      compliance: 0.91,
    },
  },
  {
    id: "deidentification",
    name: "Structured De-identification Pipeline",
    category: "Anonymization",
    bestFor: ["Traffic flow analysis", "Planning and operations"],
    dataTypes: ["Vehicle trajectories"],
    summary:
      "Removes direct identifiers and coarsens sensitive fields for lower-friction sharing when utility and speed matter most.",
    strengths: ["Efficient", "Easy to explain", "Fastest path to publishable outputs"],
    cautions: ["Weaker formal privacy guarantees", "Requires careful auditing for linkability"],
    scores: {
      up: 0.56,
      sp: 0.63,
      utility: 0.87,
      efficiency: 0.92,
      auditability: 0.61,
      compliance: 0.68,
    },
  },
];

export const defaultProfile = {
  datasetId: "ngsim-i80",
  application: "Traffic flow analysis",
  sharingGoal: "Release a sanitized dataset for partner agencies and researchers.",
  siteContext: "Single agency data owner",
};

export const defaultWeights = {
  up: 20,
  sp: 15,
  utility: 25,
  efficiency: 10,
  auditability: 15,
  compliance: 15,
};

export const trafficSeries = [
  { minute: "08:00", rawVolume: 120, safeVolume: 116, avgSpeed: 58, safeSpeed: 56 },
  { minute: "08:05", rawVolume: 148, safeVolume: 142, avgSpeed: 54, safeSpeed: 52 },
  { minute: "08:10", rawVolume: 168, safeVolume: 160, avgSpeed: 47, safeSpeed: 46 },
  { minute: "08:15", rawVolume: 181, safeVolume: 171, avgSpeed: 42, safeSpeed: 40 },
  { minute: "08:20", rawVolume: 174, safeVolume: 166, avgSpeed: 43, safeSpeed: 41 },
  { minute: "08:25", rawVolume: 158, safeVolume: 151, avgSpeed: 49, safeSpeed: 47 },
];

export const trajectoryPreview = [
  { lane: "Lane 1", raw: 88, protected: 84 },
  { lane: "Lane 2", raw: 112, protected: 104 },
  { lane: "Lane 3", raw: 126, protected: 120 },
  { lane: "Lane 4", raw: 91, protected: 87 },
];
