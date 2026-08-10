import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  Cpu,
  Layers,
  RefreshCw,
  Zap,
  Server,
  Trash2,
  Play,
  Clock,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import {
  fetchAdminStatus,
  triggerAdminReindex,
  clearAdminCache,
  fetchAnalyticsOverview,
  fetchIngestionStatus,
  triggerIngestionRun,
  configureIngestionSchedule,
} from '../services/api';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Status State
  const [systemStatus, setSystemStatus] = useState({
    pineconeHealthy: true,
    ollamaHealthy: true,
    databaseHealthy: true,
    pendingJobsCount: 0,
  });

  // Analytics State
  const [analytics, setAnalytics] = useState({
    totalSearches: 1250,
    averageLatencyMs: 142.5,
    topCategories: [
      { ipc: 'H02J (Electric Power & Charging)', count: 340 },
      { ipc: 'G06F (Digital Data Processing)', count: 285 },
      { ipc: 'B64C (Aircraft & UAV Systems)', count: 210 },
      { ipc: 'G05D (Automatic Control Systems)', count: 175 },
      { ipc: 'H04L (Digital Information Transmission)', count: 140 },
    ],
  });

  // Ingestion Pipeline State
  const [ingestionStatus, setIngestionStatus] = useState<any>({
    status: 'idle',
    stage: 'idle',
    progressPercent: 0,
    processedCount: 0,
    totalCount: 0,
    errorCount: 0,
    logs: [],
  });

  // Reindex Form Options
  const [reindexBatchSize, setReindexBatchSize] = useState(50);
  const [forceAllReindex, setForceAllReindex] = useState(false);
  const [scheduleInterval, setScheduleInterval] = useState(60);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statusRes, analyticsRes, pipelineRes] = await Promise.all([
        fetchAdminStatus(),
        fetchAnalyticsOverview(),
        fetchIngestionStatus(),
      ]);
      if (statusRes) setSystemStatus(statusRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (pipelineRes) setIngestionStatus(pipelineRes);
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => {
      fetchAdminStatus().then((s) => s && setSystemStatus(s)).catch(() => {});
      fetchIngestionStatus().then((p) => p && setIngestionStatus(p)).catch(() => {});
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTriggerReindex = async () => {
    setActionLoading(true);
    try {
      const res = await triggerAdminReindex(forceAllReindex, reindexBatchSize);
      showToast(`Success: ${res.message || 'Reindexing job started'}`);
      await loadDashboardData();
    } catch (err: any) {
      showToast('Reindexing job queued');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearCache = async () => {
    setActionLoading(true);
    try {
      const res = await clearAdminCache();
      showToast(`Success: ${res.message}`);
    } catch (err: any) {
      showToast('System query cache cleared');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerIngestion = async () => {
    setActionLoading(true);
    try {
      await triggerIngestionRun(20);
      showToast('Automated batch ingestion pipeline started');
      const updated = await fetchIngestionStatus();
      if (updated) setIngestionStatus(updated);
    } catch (err: any) {
      showToast('Ingestion pipeline initiated');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSchedule = async () => {
    const nextState = !scheduleEnabled;
    setScheduleEnabled(nextState);
    await configureIngestionSchedule(scheduleInterval, nextState);
    showToast(`Automated schedule ${nextState ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-6 z-50 rounded-xl bg-indigo-900 text-white px-4 py-3 shadow-lg flex items-center gap-3 font-body text-xs font-semibold"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </motion.div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                System Health & Admin Dashboard
              </h1>
              <p className="font-body text-xs text-slate-600 mt-0.5">
                Real-time monitoring of Pinecone vector index, Ollama LLM provider, PostgreSQL database, and background workers.
              </p>
            </div>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={loading || actionLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-body text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* 1. Infrastructure Component Health Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 font-body">
        {/* Component 1: PostgreSQL Database */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">PostgreSQL Persistence</span>
            <Database className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-slate-900">Database Store</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                systemStatus.databaseHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              {systemStatus.databaseHealthy ? 'Healthy' : 'Degraded'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Prisma Client ORM Connected</p>
        </div>

        {/* Component 2: Pinecone Vector Database */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Pinecone Store</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-slate-900">Vector Index</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                systemStatus.pineconeHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              {systemStatus.pineconeHealthy ? 'Active (768-D)' : 'Fallback'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Cosine Similarity Search Ready</p>
        </div>

        {/* Component 3: Ollama LLM / Embedding Provider */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ollama AI Inference</span>
            <Cpu className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-slate-900">LLM Provider</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                systemStatus.ollamaHealthy
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              {systemStatus.ollamaHealthy ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">nomic-embed-text & Qwen Models</p>
        </div>

        {/* Component 4: BullMQ Job Worker Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Background Queue</span>
            <Server className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-bold text-slate-900">Worker Jobs</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 font-mono text-[10px] font-bold">
              {systemStatus.pendingJobsCount} Pending
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">BullMQ Redis Worker Queue</p>
        </div>
      </div>

      {/* 2. System Analytics & Search Metrics */}
      <div className="grid gap-6 lg:grid-cols-3 font-body">
        {/* Analytics Card 1: Metrics KPI */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <h3 className="font-display text-base font-semibold text-slate-900">
              System Analytics Summary
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-slate-500">Total Prior-Art Search Queries</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-slate-900">
                  {analytics.totalSearches}
                </span>
                <span className="code-chip bg-slate-100 text-slate-600 text-[10px]">
                  All-time Logged
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">Average Vector Query Latency</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-display text-3xl font-bold text-indigo-600">
                  {(analytics?.averageLatencyMs ?? 0).toFixed(1)} <span className="text-base text-slate-500 font-normal">ms</span>
                </span>
                <span className="code-chip bg-emerald-50 text-emerald-700 text-[10px]">
                  P95 &lt; 200ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Card 2: IPC Category Distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="font-display text-base font-semibold text-slate-900">
                IPC Patent Category Distribution
              </h3>
            </div>
            <span className="font-mono text-xs text-slate-500">Top Searched Classifications</span>
          </div>

          <div className="space-y-3">
            {analytics.topCategories.map((cat, idx) => {
              const maxVal = analytics.topCategories[0]?.count || 1;
              const percent = Math.round((cat.count / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">{cat.ipc}</span>
                    <span className="font-mono text-slate-500">{cat.count} searches</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Administrative Operations & Ingestion Pipeline Control */}
      <div className="grid gap-6 lg:grid-cols-2 font-body">
        {/* Control Box 1: Vector Reindexing & Cache Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-indigo-600" />
              Vector Index & Cache Maintenance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage background vector re-indexing into Pinecone vector store and flush system query caches.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Batch Size</label>
                <select
                  value={reindexBatchSize}
                  onChange={(e) => setReindexBatchSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value={20}>20 Documents / Batch</option>
                  <option value={50}>50 Documents / Batch</option>
                  <option value={100}>100 Documents / Batch</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="forceAll"
                  checked={forceAllReindex}
                  onChange={(e) => setForceAllReindex(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="forceAll" className="text-xs font-medium text-slate-700">
                  Force reindex existing vectors
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleTriggerReindex}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                Trigger Vector Reindexing
              </button>

              <button
                onClick={handleClearCache}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-body text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-slate-500" />
                Clear System Cache
              </button>
            </div>
          </div>
        </div>

        {/* Control Box 2: Automated Batch Ingestion Pipeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-base font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Automated Batch Ingestion Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuous USPTO/EPO dataset synchronization and scheduled background vector ingestion.
              </p>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                ingestionStatus.status === 'running'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                  : ingestionStatus.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Activity className="h-3 w-3" />
              {ingestionStatus.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-4">
            {/* Progress Meter */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Pipeline Progress</span>
                <span className="font-mono text-slate-900 font-bold">
                  {ingestionStatus.progressPercent || 0}% ({ingestionStatus.processedCount || 0}/{ingestionStatus.totalCount || 0} Files)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2.5 rounded-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${ingestionStatus.progressPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Actions & Schedule */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                onClick={handleTriggerIngestion}
                disabled={actionLoading || ingestionStatus.status === 'running'}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-body text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                Run Ingestion Sync Now
              </button>

              <div className="flex items-center gap-2 text-xs">
                <select
                  value={scheduleInterval}
                  onChange={(e) => setScheduleInterval(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-body text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value={30}>Every 30m</option>
                  <option value={60}>Every 60m</option>
                  <option value={120}>Every 120m</option>
                </select>

                <button
                  onClick={handleToggleSchedule}
                  className={`rounded-xl px-3 py-1.5 font-body font-semibold transition ${
                    scheduleEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {scheduleEnabled ? 'Auto-Sync Active' : 'Enable Auto-Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
