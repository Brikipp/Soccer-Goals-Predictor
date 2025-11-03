import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { Prediction } from '../lib/supabase';

interface PredictionCardProps {
  prediction: Prediction;
  onRecordResult: (goalCount: number) => void;
}

export function PredictionCard({
  prediction,
  onRecordResult,
}: PredictionCardProps) {
  const formColors: Record<string, string> = {
    W: 'bg-green-500 text-white',
    D: 'bg-gray-400 text-white',
    L: 'bg-red-500 text-white',
    '?': 'bg-gray-300 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-500">
              {prediction.league}
            </span>
            <span className="text-xs text-gray-400">{prediction.time}</span>
            {prediction.is_derby && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                DERBY
              </span>
            )}
            {prediction.is_rivalry && !prediction.is_derby && (
              <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-semibold">
                RIVALRY
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {prediction.home_team} vs {prediction.away_team}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{prediction.match_date}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-green-600 mb-1">
            {prediction.prediction}
          </div>
          <div className="text-sm text-gray-500">
            Expected: {prediction.expected_goals}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            {prediction.home_team}
          </div>
          <div className="text-sm text-gray-700">
            Avg Goals: {prediction.home_stats?.goalsScored} | Conceded:{' '}
            {prediction.home_stats?.goalsConceded}
          </div>
          <div className="flex gap-1 mt-2">
            {prediction.home_stats?.form?.map((f, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  formColors[f] || formColors['?']
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded">
          <div className="text-xs font-semibold text-gray-600 mb-2">
            {prediction.away_team}
          </div>
          <div className="text-sm text-gray-700">
            Avg Goals: {prediction.away_stats?.goalsScored} | Conceded:{' '}
            {prediction.away_stats?.goalsConceded}
          </div>
          <div className="flex gap-1 mt-2">
            {prediction.away_stats?.form?.map((f, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  formColors[f] || formColors['?']
                }`}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded mb-3">
        <div className="text-xs font-semibold text-gray-600 mb-1">Analysis</div>
        <div className="text-sm text-gray-700 mb-2">{prediction.reasoning}</div>
        <div className="text-xs text-gray-500">
          Motivation: {prediction.motivation}
        </div>
        {prediction.injuries && prediction.injuries.length > 0 && (
          <div className="text-xs text-orange-600 mt-2 flex items-center gap-1">
            <AlertCircle size={14} />
            {Array.isArray(prediction.injuries)
              ? prediction.injuries.join(', ')
              : 'Injury data available'}
          </div>
        )}
      </div>

      {!prediction.actual_goals && (
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 mb-2 font-semibold">
            Record Actual Result:
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((goals) => (
              <button
                key={goals}
                onClick={() => onRecordResult(goals)}
                className="flex-1 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 py-2 px-2 rounded text-sm font-medium transition"
              >
                {goals}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
