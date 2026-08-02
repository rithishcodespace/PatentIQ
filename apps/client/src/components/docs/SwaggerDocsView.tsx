import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Code2, Check, Copy, Shield, FileText } from 'lucide-react';
import { mockApiEndpoints } from '../../data/mockData';

const SwaggerDocsView = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* Clean Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">API Documentation & Swagger Specs</h2>
              <p className="font-body text-xs text-slate-600 mt-0.5">
                Interactive API specifications and endpoint documentation for PatentIQ.
              </p>
            </div>
          </div>

          <a
            href="http://localhost:5000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-body text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition"
          >
            Launch Interactive Swagger UI
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* OpenAPI Specs Info Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="font-body text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-blue-600" />
            OpenAPI Specification
          </span>
          <p className="font-display text-lg font-bold text-slate-900 mt-2">OpenAPI 3.1.0</p>
          <p className="font-body text-[11px] text-slate-500 mt-0.5">JSON Schema Request Validation</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="font-body text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-blue-600" />
            Authentication Scheme
          </span>
          <p className="font-display text-lg font-bold text-slate-900 mt-2">JWT Bearer Auth</p>
          <p className="font-body text-[11px] text-slate-500 mt-0.5">Role-Based Access Control</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="font-body text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-blue-600" />
            Schema Export
          </span>
          <p className="font-display text-lg font-bold text-slate-900 mt-2">GET /docs/json</p>
          <p className="font-body text-[11px] text-slate-500 mt-0.5">Exportable raw JSON schema definition</p>
        </div>
      </div>

      {/* Endpoint Explorer List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Documented REST API Endpoints
            </h3>
            <p className="font-body text-xs text-slate-500">
              Interactive routes exposed on PatentIQ engine
            </p>
          </div>
          <span className="code-chip text-[10px]">
            {mockApiEndpoints.length} Active Routes
          </span>
        </div>

        <div className="space-y-3">
          {mockApiEndpoints.map((ep, idx) => (
            <motion.div
              key={idx}
              whileHover={{ x: 2 }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-200 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${
                    ep.method === 'POST'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : ep.method === 'GET'
                      ? 'bg-slate-100 text-slate-800 border border-slate-200'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-900">{ep.path}</span>
                <span className="font-body text-xs text-slate-600 hidden sm:inline">— {ep.summary}</span>
              </div>

              <button
                onClick={() => handleCopy(`http://localhost:5000${ep.path}`, idx)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-body text-xs text-slate-600 hover:bg-slate-50 transition"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    Copied URL
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy Endpoint
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwaggerDocsView;
