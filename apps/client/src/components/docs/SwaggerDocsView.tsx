import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Code2, Check, Copy, Shield, FileText, RefreshCw } from 'lucide-react';
import { fetchOpenApiRoutes } from '../../services/api';

interface ApiRouteItem {
  method: string;
  path: string;
  summary: string;
}

const SwaggerDocsView = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [apiEndpoints, setApiEndpoints] = useState<ApiRouteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const routes = await fetchOpenApiRoutes();
      setApiEndpoints(routes);
    } catch (err) {
      console.error('[SwaggerDocsView] Failed to fetch Fastify route definitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      setLoading(true);
      const routes = await fetchOpenApiRoutes();
      if (isMounted) {
        setApiEndpoints(routes);
        setLoading(false);
      }
    }
    initFetch();
    return () => {
      isMounted = false;
    };
  }, []);

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
                Interactive API specifications and live route definitions dynamically fetched from Fastify.
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
          <p className="font-body text-[11px] text-slate-500 mt-0.5">Single User Session Security</p>
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
              Live Fastify route definitions registered on PatentIQ server
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRoutes}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Reload Routes
            </button>
            <span className="code-chip text-[10px]">
              {apiEndpoints.length} Active Routes
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center font-body text-xs text-slate-500">
            Fetching OpenAPI route definitions from /docs/json...
          </div>
        ) : (
          <div className="space-y-3">
            {apiEndpoints.map((ep, idx) => (
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
                        : ep.method === 'DELETE'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
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
        )}
      </div>
    </div>
  );
};

export default SwaggerDocsView;
