import { useEffect, useState } from 'react';
import HistoryView from '../components/history/HistoryView';
import type { SearchHistoryRecord } from '../types/history';
import { useNavigate } from 'react-router-dom';
import { fetchSearchHistory, deleteSearchHistoryRecord } from '../services/api';
import Loader from '../components/common/Loader';

const HistoryPage = () => {
  const [historyRecords, setHistoryRecords] = useState<SearchHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      setLoading(true);
      const records = await fetchSearchHistory(1, 50);
      if (isMounted) {
        setHistoryRecords(records);
        setLoading(false);
      }
    }
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectRecord = (record: SearchHistoryRecord) => {
    navigate('/results', {
      state: {
        query: record.searchQuery,
        results: record.retrievedPatents,
        confidence: record.confidence,
        analysis: record.noveltyAnalysis,
      },
    });
  };

  const handleDeleteRecord = async (id: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
    await deleteSearchHistoryRecord(id);
  };

  if (loading) {
    return (
      <div className="py-12 text-center space-y-4">
        <Loader />
        <p className="font-body text-xs font-semibold text-slate-500">Loading search history from PostgreSQL database...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <HistoryView
        historyRecords={historyRecords}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
};

export default HistoryPage;
