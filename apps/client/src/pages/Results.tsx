import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  SlidersHorizontal,
  FileText,
  RefreshCw,
  Layers,
} from 'lucide-react';
import PatentCard, { type PatentItem } from '../components/results/PatentCard';
import PatentDetailsModal from '../components/results/PatentDetailsModal';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPatent, setSelectedPatent] = useState<PatentItem | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [selectedIpc, setSelectedIpc] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'relevance' | 'date-newest' | 'date-oldest'>('relevance');
  const [topKLimit, setTopKLimit] = useState<number>(20);

  // Read live state from router location OR sessionStorage
  const [liveSearchData] = useState<any>(() => {
    if (location.state) return location.state;
    try {
      const stored = sessionStorage.getItem('patentiq_latest_result');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  if (!liveSearchData) {
    return (
      <div className="mx-auto w-full max-w-2xl py-20 text-center space-y-6 font-body">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
          <Search className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">No Active Prior-Art Search Session</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Please enter your invention description on the search workstation to execute a prior-art patent retrieval search.
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition cursor-pointer"
        >
          <Search className="h-4 w-4" />
          Go to Search Workstation
        </Link>
      </div>
    );
  }

  const queryText = liveSearchData.query || liveSearchData.text || 'Submitted Invention Query';
  const rawResults: any[] = liveSearchData.results || liveSearchData.retrievedPatents || [];

  // Normalize results list into PatentItem DTOs
  const mappedPatents: PatentItem[] = useMemo(() => {
    return rawResults.map((item: any, idx: number) => ({
      rank: item.rank || idx + 1,
      patentId: item.patentId || item.id || `PAT-${idx + 1}`,
      publicationNumber: item.publicationNumber || item.patentId,
      title: item.title || `Prior-Art Patent #${item.patentId || idx + 1}`,
      abstract: item.abstract || item.summary || 'No abstract description available for this prior-art patent.',
      publicationDate: item.publicationDate || item.date || item.pubDate || 'N/A',
      filingDate: item.filingDate,
      priorityDate: item.priorityDate || item.filingDate,
      ipc: item.ipc || 'G06F',
      cpc: item.cpc,
      owner: item.owner || item.assignee || item.applicant || 'Undisclosed',
      assignee: item.assignee,
      applicant: item.applicant,
      inventors: item.inventors || [],
      score: item.score ?? item.similarityScore ?? item.similarity,
      denseScore: item.denseScore,
      bm25Score: item.bm25Score,
      retrievalRelevanceScore: item.retrievalRelevanceScore,
      relevanceReason: item.relevanceReason,
      sourceUrl: item.sourceUrl,
      section: item.section,
    }));
  }, [rawResults]);

  // Extract unique IPC classifications for filtering dropdown
  const availableIpcClasses = useMemo(() => {
    const classes = new Set<string>();
    mappedPatents.forEach((p) => {
      if (p.ipc) {
        const clean = p.ipc.split(' ')[0];
        if (clean) classes.add(clean);
      }
    });
    return Array.from(classes);
  }, [mappedPatents]);

  // Filter and sort matching patents
  const filteredPatents = useMemo(() => {
    let result = [...mappedPatents];

    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.patentId.toLowerCase().includes(q) ||
          p.abstract?.toLowerCase().includes(q) ||
          p.owner?.toLowerCase().includes(q)
      );
    }

    if (selectedIpc !== 'ALL') {
      result = result.filter((p) => p.ipc?.startsWith(selectedIpc));
    }

    if (sortBy === 'date-newest') {
      result.sort((a, b) => (b.publicationDate || '').localeCompare(a.publicationDate || ''));
    } else if (sortBy === 'date-oldest') {
      result.sort((a, b) => (a.publicationDate || '').localeCompare(b.publicationDate || ''));
    }

    return result.slice(0, topKLimit);
  }, [mappedPatents, filterText, selectedIpc, sortBy, topKLimit]);

  const handleModifySearch = () => {
    navigate('/search', { state: { initialQuery: queryText } });
  };

  const handleNewSearch = () => {
    sessionStorage.removeItem('patentiq_latest_result');
    navigate('/search');
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 font-body pb-16">
      {/* 1. Industry Standard Search Header */}
      <div className="space-y-4 font-body">
        {/* Top Search Input Bar (Google Patents / Legal Workstation Style) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-slate-200 shadow-2xs">
          {/* Active Query Input Display */}
          <div className="relative flex-1 min-w-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-indigo-600" />
            </div>
            <input
              type="text"
              readOnly
              value={queryText}
              onClick={handleModifySearch}
              title="Click to refine search query"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2.5 pl-10 pr-24 text-sm font-medium text-slate-900 shadow-inner focus:outline-hidden cursor-pointer hover:bg-slate-100/80 transition truncate"
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <button
                onClick={handleModifySearch}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
              >
                <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                Refine
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 justify-end">
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-slate-500" />
              Back
            </Link>
            <button
              onClick={handleNewSearch}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              New Search
            </button>
          </div>
        </div>

        {/* 2. Sub-Toolbar: Metrics & Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            {/* Results Count Summary */}
            <span className="font-semibold text-slate-800">
              Found <strong className="text-indigo-600 font-bold">{mappedPatents.length}</strong> prior-art patent references
            </span>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Keyword Filter inside results */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Filter retrieved patents..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* IPC Filter Dropdown */}
            {availableIpcClasses.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <select
                  value={selectedIpc}
                  onChange={(e) => setSelectedIpc(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All IPC Classes</option>
                  {availableIpcClasses.map((ipc) => (
                    <option key={ipc} value={ipc}>
                      IPC: {ipc}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort & Limit Options */}
          <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value="relevance">Retrieval Relevance</option>
                <option value="date-newest">Publication Date (Newest)</option>
                <option value="date-oldest">Publication Date (Oldest)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-500">Show:</span>
              <select
                value={topKLimit}
                onChange={(e) => setTopKLimit(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-hidden cursor-pointer"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Matching Patents Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            Matching Patents ({filteredPatents.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing top {filteredPatents.length} of {mappedPatents.length} retrieved references
          </span>
        </div>

        {filteredPatents.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No matching patents found for the selected filter.</p>
            <button
              onClick={() => {
                setFilterText('');
                setSelectedIpc('ALL');
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
            >
              Clear filters and view all results
            </button>
          </div>
        ) : (
          filteredPatents.map((patent, index) => (
            <PatentCard
              key={patent.patentId || index}
              patent={patent}
              rank={patent.rank || index + 1}
              onInspectDetails={(p) => setSelectedPatent(p)}
            />
          ))
        )}
      </div>

      {/* Patent Details Modal */}
      <PatentDetailsModal
        patent={selectedPatent}
        isOpen={!!selectedPatent}
        onClose={() => setSelectedPatent(null)}
      />
    </div>
  );
};

export default Results;