import type { SearchResponse } from "../types/api";

export const dummyData: SearchResponse = {
  results: [
     {
      id: 1,
      title: "AI Based Crop Monitoring",
      similarity: 94,
      ipc: "G06F",
      abstract: "An AI-powered crop monitoring system that analyzes plant health using drone imagery and machine learning algorithms.",
      claims: "A method comprising capturing crop images, processing them using AI models, and generating health reports."
    },
    {
      id: 2,
      title: "Smart Irrigation System",
      similarity: 91,
      ipc: "A01G",
      abstract: "An IoT-based irrigation system that optimizes water usage through soil moisture sensors.",
      claims: "A system comprising soil sensors, a control unit, and automated water valves."
    },
    {
      id: 3,
      title: "Autonomous Pest Detection",
      similarity: 88,
      ipc: "A01M",
      abstract: "A computer vision-based system for detecting pests in agricultural fields using deep learning.",
      claims: "A method comprising capturing field images, identifying pests, and notifying farmers."
    },
    {
      id: 4,
      title: "Blockchain Food Supply Chain",
      similarity: 82,
      ipc: "G06Q",
      abstract: "A blockchain-enabled platform for ensuring traceability and transparency in food supply chains.",
      claims: "A system comprising distributed ledger technology for recording agricultural product transactions."
    },
    {
      id: 5,
      title: "Solar Powered Greenhouse Automation",
      similarity: 76,
      ipc: "A01G",
      abstract: "A greenhouse automation system powered by solar energy with automated climate control.",
      claims: "A greenhouse system comprising solar panels, environmental sensors, and automated ventilation mechanisms."
    }
  ],

  report: {
    novelty: 5,
    inventiveStep: 4,
    industrialApplicability: 5,
    overall: 89
  }
};