import React from 'react';
import { History } from 'lucide-react';
import { HistoryEntry } from './HistoryEntry';
import type { Prediction } from '../lib/supabase';

interface HistoryTabProps {
  historicalData: Prediction[];
  onClearHistory: () => void;
}

export function HistoryTab({ historicalData, onClearHistory }: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Historical Data
          </h3>
          <p className="text-sm text-gray-600">
            Model learns from these results to improve accuracy
          </p>
        </div>
        {historicalData.length > 0 && (
          <button
            onClick={onClearHistory}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition"
          >
            Clear History
          </button>
        )}
      </div>

      {historicalData.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <History size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Historical Data
          </h3>
          <p className="text-gray-600">Add actual results to build learning data</p>
        </div>
      ) : (
        historicalData.map((entry) => (
          <HistoryEntry key={entry.id} entry={entry} />
        ))
      )}
    </div>
  );
}
