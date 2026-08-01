import { useState } from 'react';
import HistoryView from '../components/history/HistoryView';
import { mockSearchHistory } from '../data/mockData';
import type { SearchHistoryRecord } from '../types/history';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const [historyRecords, setHistoryRecords] = useState<SearchHistoryRecord[]>(mockSearchHistory);
  const navigate = useNavigate();

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

  const handleDeleteRecord = (id: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
  };

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
