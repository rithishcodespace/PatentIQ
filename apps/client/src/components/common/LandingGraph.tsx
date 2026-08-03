import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface CandidatePoint {
  id: string;
  title: string;
  similarity: number;
  ipc: string;
  x: number;
  y: number;
  status: 'High Match' | 'Moderate' | 'Low Risk';
}

const CANDIDATES: CandidatePoint[] = [
  { id: 'US-10948372-B2', title: 'LiDAR Obstacle Avoidance', similarity: 94.8, ipc: 'G01S 17/89', x: 260, y: 70, status: 'High Match' },
  { id: 'US-10812944-B1', title: 'Autonomous Sensor Fusion', similarity: 89.2, ipc: 'G06V 20/58', x: 340, y: 120, status: 'High Match' },
  { id: 'US-10654321-A1', title: 'Optical Flow Motion Tracking', similarity: 82.5, ipc: 'G06T 7/20', x: 320, y: 210, status: 'Moderate' },
  { id: 'US-10498765-B2', title: 'Spatial Point Cloud Filter', similarity: 76.1, ipc: 'G06F 18/24', x: 180, y: 230, status: 'Moderate' },
  { id: 'US-10234567-B1', title: 'Multi-Radar Range Matrix', similarity: 68.4, ipc: 'G01S 13/93', x: 100, y: 160, status: 'Low Risk' },
  { id: 'US-10111222-A1', title: 'Ultrasonic Pulse Detector', similarity: 61.0, ipc: 'G01S 15/89', x: 130, y: 90, status: 'Low Risk' },
];

export default function LandingGraph({ className = '' }: { className?: string }) {
  const [activeNode, setActiveNode] = useState<CandidatePoint>(CANDIDATES[0]);
  const [activeTab, setActiveTab] = useState<'vector' | 'trend'>('vector');

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-5 shadow-lg ${className}`}>
      {/* Top Header Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Pinecone Prior-Art Vector Space
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </h4>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex rounded-lg bg-slate-100 p-0.5 font-body text-[11px] font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('vector')}
            className={`rounded-md px-2.5 py-1 transition ${
              activeTab === 'vector' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Vector Map
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`rounded-md px-2.5 py-1 transition ${
              activeTab === 'trend' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Similarity Curve
          </button>
        </div>
      </div>

      {/* GRAPH CANVAS AREA */}
      <div className="blueprint-grid relative mt-4 h-[330px] w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs overflow-hidden">
        {activeTab === 'vector' ? (
          /* SVG Vector Distance Map */
          <svg className="h-full w-full overflow-visible" viewBox="0 0 420 280">
            {/* Background Grid Circles */}
            <circle cx="210" cy="140" r="120" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" fill="none" />
            <circle cx="210" cy="140" r="75" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" fill="none" />
            <circle cx="210" cy="140" r="35" stroke="#94a3b8" strokeWidth="1" fill="none" />

            {/* Connecting Vector Distance Lines */}
            {CANDIDATES.map((c, i) => (
              <line
                key={i}
                x1="210"
                y1="140"
                x2={c.x}
                y2={c.y}
                stroke={activeNode.id === c.id ? '#2563eb' : '#cbd5e1'}
                strokeWidth={activeNode.id === c.id ? '2' : '1'}
                strokeDasharray={activeNode.id === c.id ? 'none' : '3 3'}
              />
            ))}

            {/* Central Query Vector Node */}
            <g transform="translate(210, 140)">
              <circle r="18" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
              <circle r="8" fill="#2563eb" className="animate-pulse" />
              <text x="0" y="30" textAnchor="middle" className="font-mono text-[10px] font-bold fill-slate-700">
                Target Disclosure Vector
              </text>
            </g>

            {/* Prior Art Candidate Nodes */}
            {CANDIDATES.map((c) => {
              const isSelected = activeNode.id === c.id;
              return (
                <g
                  key={c.id}
                  transform={`translate(${c.x}, ${c.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={() => setActiveNode(c)}
                  onMouseEnter={() => setActiveNode(c)}
                >
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill={isSelected ? '#2563eb' : '#475569'}
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="shadow-md"
                  />
                  <text
                    x="0"
                    y={c.y > 140 ? '24' : '-16'}
                    textAnchor="middle"
                    className={`font-mono text-[9px] font-semibold ${isSelected ? 'fill-blue-700 font-bold' : 'fill-slate-500'}`}
                  >
                    {c.id.split('-')[1]} ({c.similarity}%)
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          /* SVG Similarity Score Curve Graph */
          <div className="h-full w-full pt-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Similarity Score vs Candidate Rank</span>
              <span className="text-blue-600 font-bold">768-dim nomic-embed-text</span>
            </div>
            <svg className="h-[230px] w-full" viewBox="0 0 400 200" preserveAspectRatio="none">
              <path
                d="M 0,20 L 66,35 L 133,65 L 200,95 L 266,130 L 333,160 L 400,180"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />
              <path
                d="M 0,20 L 66,35 L 133,65 L 200,95 L 266,130 L 333,160 L 400,180 L 400,200 L 0,200 Z"
                fill="url(#blueGradientFill)"
                opacity="0.15"
              />
              {CANDIDATES.map((c, i) => (
                <circle
                  key={i}
                  cx={(i * 400) / (CANDIDATES.length - 1)}
                  cy={200 - (c.similarity / 100) * 180}
                  r="6"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
              <defs>
                <linearGradient id="blueGradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>

      {/* Selected Node Details Card Overlay (Light Mode) */}
      <motion.div 
        key={activeNode.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="code-chip font-mono text-[10px]">{activeNode.id}</span>
            <span className="font-mono text-[11px] font-semibold text-slate-500">IPC: {activeNode.ipc}</span>
          </div>
          <h5 className="font-display text-xs font-bold text-slate-900 truncate max-w-[240px]">
            {activeNode.title}
          </h5>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-[10px] text-slate-400 uppercase">Cosine Similarity</p>
            <p className="font-display text-base font-extrabold text-blue-600">{activeNode.similarity}%</p>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-body text-xs font-bold text-emerald-700 border border-emerald-200">
            {activeNode.status}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
