import type { SearchResponse } from "../types/api";

export const dummyResults: SearchResponse["results"] = [
   {
    id: 1,
    title: "AI Based Crop Monitoring",
    similarity: 94,
    ipc: "G06F",
    abstract:
      "An AI-powered crop monitoring system that analyzes plant health using drone imagery and machine learning algorithms.",
    claims:
      "A method comprising capturing crop images, processing them using AI models, and generating health reports.",
  },
  {
    id: 2,
    title: "Smart Irrigation System",
    similarity: 91,
    ipc: "A01G",
    abstract:
      "An IoT-based irrigation system that optimizes water usage through soil moisture sensors.",
    claims:
      "A system comprising soil sensors, a control unit, and automated water valves.",
  },
  {
    id: 3,
    title: "Autonomous Pest Detection",
    similarity: 88,
    ipc: "A01M",
    abstract:
      "A computer vision-based system for detecting pests in agricultural fields using deep learning.",
    claims:
      "A method comprising capturing field images, identifying pests, and notifying farmers.",
  },
  {
    id: 4,
    title: "Blockchain Food Supply Chain",
    similarity: 82,
    ipc: "G06Q",
    abstract:
      "A blockchain-enabled platform for ensuring traceability and transparency in food supply chains.",
    claims:
      "A system comprising distributed ledger technology for recording agricultural product transactions.",
  },
  {
    id: 5,
    title: "Solar Powered Greenhouse Automation",
    similarity: 76,
    ipc: "A01G",
    abstract:
      "A greenhouse automation system powered by solar energy with automated climate control.",
    claims:
      "A greenhouse system comprising solar panels, environmental sensors, and automated ventilation mechanisms.",
  },
  {
    id: 6,
    title: "AI Livestock Health Monitoring",
    similarity: 93,
    ipc: "A01K",
    abstract:
      "An AI-driven livestock monitoring system that detects health anomalies using wearable sensors.",
    claims:
      "A method comprising collecting biometric data from livestock and predicting diseases using machine learning.",
  },
  {
    id: 7,
    title: "Precision Fertilizer Recommendation",
    similarity: 90,
    ipc: "A01C",
    abstract:
      "A recommendation engine that suggests fertilizer quantities based on soil analysis and weather data.",
    claims:
      "A system comprising soil sensors, weather forecasting, and AI-based fertilizer recommendations.",
  },
  {
    id: 8,
    title: "Automated Weed Detection Robot",
    similarity: 87,
    ipc: "A01B",
    abstract:
      "A robotic platform equipped with computer vision for identifying and removing weeds.",
    claims:
      "A robot comprising image processing, weed classification, and automated weed removal mechanisms.",
  },
  {
    id: 9,
    title: "IoT Soil Nutrient Monitoring",
    similarity: 85,
    ipc: "G01N",
    abstract:
      "A sensor network for continuously monitoring soil nutrient levels and transmitting data to the cloud.",
    claims:
      "A system comprising nutrient sensors, wireless communication, and cloud-based analytics.",
  },
  {
    id: 10,
    title: "Weather Adaptive Farming Assistant",
    similarity: 84,
    ipc: "G06N",
    abstract:
      "An AI assistant that provides farming recommendations based on weather forecasts and crop conditions.",
    claims:
      "A method comprising weather analysis, crop prediction, and personalized farming recommendations.",
  },
  {
    id: 11,
    title: "Drone Based Seed Sowing",
    similarity: 83,
    ipc: "A01C",
    abstract:
      "A drone-enabled seed sowing system for efficient plantation across large agricultural fields.",
    claims:
      "A drone system comprising seed dispensing mechanisms and GPS-guided navigation.",
  },
  {
    id: 12,
    title: "Hydroponic Farm Automation",
    similarity: 81,
    ipc: "A01G",
    abstract:
      "An automated hydroponic farming system that regulates nutrient supply and environmental conditions.",
    claims:
      "A hydroponic system comprising nutrient dosing units, pH sensors, and automated controllers.",
  },
  {
    id: 13,
    title: "AI Fruit Ripeness Detection",
    similarity: 80,
    ipc: "G06V",
    abstract:
      "A computer vision system for determining fruit ripeness using image analysis.",
    claims:
      "A method comprising image acquisition, ripeness classification, and quality grading.",
  },
  {
    id: 14,
    title: "Farm Equipment Predictive Maintenance",
    similarity: 79,
    ipc: "G05B",
    abstract:
      "A predictive maintenance platform for agricultural machinery using IoT sensors.",
    claims:
      "A system comprising vibration sensors, predictive analytics, and maintenance scheduling.",
  },
  {
    id: 15,
    title: "Smart Harvesting Robot",
    similarity: 78,
    ipc: "A01D",
    abstract:
      "A robotic harvesting system capable of identifying and picking ripe crops autonomously.",
    claims:
      "A robot comprising vision sensors, robotic arms, and autonomous navigation.",
  },
  {
    id: 16,
    title: "AI Plant Disease Diagnosis",
    similarity: 77,
    ipc: "G06N",
    abstract:
      "An AI-based diagnostic platform for identifying plant diseases from leaf images.",
    claims:
      "A method comprising image preprocessing, disease classification, and treatment recommendations.",
  },
  {
    id: 17,
    title: "Smart Water Quality Monitoring",
    similarity: 75,
    ipc: "G01N",
    abstract:
      "An IoT-enabled water quality monitoring system for agricultural irrigation sources.",
    claims:
      "A system comprising water quality sensors, cloud storage, and alert generation.",
  },
  {
    id: 18,
    title: "Agricultural Yield Prediction",
    similarity: 74,
    ipc: "G06Q",
    abstract:
      "A machine learning model for predicting crop yield using satellite imagery and historical data.",
    claims:
      "A method comprising satellite image analysis, weather integration, and yield estimation.",
  },
  {
    id: 19,
    title: "Autonomous Field Mapping",
    similarity: 73,
    ipc: "G01C",
    abstract:
      "A GPS-enabled autonomous vehicle for creating high-resolution agricultural field maps.",
    claims:
      "A system comprising GPS, LiDAR sensors, and automated terrain mapping algorithms.",
  },
  {
    id: 20,
    title: "AI Controlled Vertical Farming",
    similarity: 72,
    ipc: "A01G",
    abstract:
      "An AI-controlled vertical farming system optimizing lighting, irrigation, and nutrient delivery.",
    claims:
      "A system comprising AI controllers, LED lighting, automated irrigation, and nutrient management.",
  },
];

export const dummyReport: SearchResponse["report"] = {
  novelty: 5,
  inventiveStep: 4,
  industrialApplicability: 5,
  overall: 89,
};

// Kept for any existing callers of the original combined shape.
export const dummyData: SearchResponse = {
  results: dummyResults,
  report: dummyReport,
};
