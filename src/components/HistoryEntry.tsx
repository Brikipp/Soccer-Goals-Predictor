import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Prediction } from '../lib/supabase';

interface HistoryEntryProps {
  entry: Prediction;
}

export function HistoryEntry({ entry }: HistoryEntryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {entry.home_team} vs {entry.away_team}
          </div>
          <div className="text-sm text-gray-600">
            {entry.match_date} • {entry.league}
          </div>
          <div className="text-xs text-gray-500 mt-1">{entry.reasoning}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">Predicted</div>
            <div className="text-lg font-bold text-blue-600">
              {entry.prediction}
            </div>
            <div className="text-xs text-gray-400">({entry.expected_goals})</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Actual</div>
            <div className="text-lg font-bold text-gray-800">
              {entry.actual_goals}
            </div>
          </div>
          <div>
            {entry.result === 'correct' ? (
              <CheckCircle className="text-green-600" size={32} />
            ) : (
              <XCircle className="text-red-600" size={32} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
