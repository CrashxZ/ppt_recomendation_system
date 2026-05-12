export const demoUser = {
  email: "stakeholder@pair-demo.org",
  password: "pair-demo-2026",
  name: "Mainak Mondal",
  role: "Agency Data Owner",
  organization: "Metro ITS Data Office",
};

export const metrics = [
  { id: "up", label: "User-Level Privacy", short: "U-P" },
  { id: "sp", label: "Dataset-Level Privacy", short: "S-P" },
  { id: "utility", label: "Utility", short: "U" },
  { id: "efficiency", label: "Efficiency", short: "E" },
  { id: "auditability", label: "Privacy Auditability", short: "P-A" },
  { id: "compliance", label: "Policy Compliance", short: "P-C" },
];

export const metricGuideIntro =
  "Privacy protection techniques (PPTs) can include encryption and data obfuscation methods such as noise injection, blurring faces or vehicle plates, and generalizing or suppressing values.";

export const metricGuides = [
  {
    id: "up",
    title: "User-Level Privacy",
    short: "U-P",
    image: "/metric-images/user_level_v2.png",
    paragraphs: [
      "Individual level: aim to protect individual users' sensitive information (e.g., mobility activities, license plate, faces, etc.).",
    ],
  },
  {
    id: "sp",
    title: "Dataset-Level Privacy",
    short: "S-P",
    image: "/metric-images/site_level_v2.png",
    paragraphs: [
      "Dataset-level: Overall protection of all users' sensitive information in the dataset.",
      "Related site level view: Overall protection of all users' sensitive information hosted at the site.",
    ],
  },
  {
    id: "utility",
    title: "Utility Preservation",
    short: "U",
    image: "/metric-images/utility_v2.png",
    paragraphs: [
      "Utility preservation evaluates how much useful information remains after applying a privacy-preserving technology.",
      "This can be measured through:",
    ],
    bullets: [
      "Information loss, which quantifies how much original data information is removed, distorted, or anonymized.",
      "Accuracy loss of downstream tasks, which measures the performance degradation of downstream applications such as traffic prediction, object detection, re-identification, trajectory analysis, or safety monitoring.",
      "Preserved application performance, which evaluates whether the protected data can still support practical transportation applications with acceptable accuracy.",
    ],
  },
  {
    id: "efficiency",
    title: "Efficiency",
    short: "E",
    image: "/metric-images/efficiency_v2.png",
    paragraphs: [
      "Efficiency measures the computational and operational overhead introduced by the PPTs, including communication overheads and memory consumption.",
    ],
  },
  {
    id: "auditability",
    title: "Privacy Auditability",
    short: "P-A",
    image: "/metric-images/audit_v2.png",
    paragraphs: [
      "Privacy auditability measures whether the privacy claim of a PPT can be evaluated through a reproducible audit.",
      "This dimension focuses on whether researchers, agencies, or external auditors can practically verify the claimed privacy protection, including:",
    ],
    bullets: [
      "verifying the privacy risks under PPT",
      "translating the ensured privacy guarantees to practical risks",
    ],
  },
  {
    id: "compliance",
    title: "Privacy Policy Compliance",
    short: "P-C",
    image: "/metric-images/compliance_v2.png",
    paragraphs: [
      "Privacy policy compliance measures whether the protected data, model, protocol, recommendation, or workflow satisfies predefined privacy requirements, such as privacy laws and regulations, and the data governance guidelines by USDOT/FHWA or state/city DOTs.",
    ],
  },
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

export const predictionSeries = [
  { minute: "08:30", observed: 154, predicted: 159, confidence: "High" },
  { minute: "08:35", observed: 149, predicted: 153, confidence: "High" },
  { minute: "08:40", observed: 144, predicted: 148, confidence: "Medium" },
  { minute: "08:45", observed: 141, predicted: 146, confidence: "Medium" },
];

export const trajectorySampleRows = [
  {
    vehicleId: "V-1042",
    lane: "Lane 2",
    speedMph: 53,
    headwaySec: 1.7,
    nextState: "Maintain lane",
  },
  {
    vehicleId: "V-1178",
    lane: "Lane 3",
    speedMph: 47,
    headwaySec: 2.4,
    nextState: "Merge left",
  },
  {
    vehicleId: "V-1230",
    lane: "Lane 1",
    speedMph: 58,
    headwaySec: 1.4,
    nextState: "Maintain lane",
  },
  {
    vehicleId: "V-1306",
    lane: "Lane 4",
    speedMph: 41,
    headwaySec: 3.1,
    nextState: "Slowdown event",
  },
];
