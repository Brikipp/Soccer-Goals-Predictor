import React from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { PredictionCard } from './PredictionCard';
import type { Prediction } from '../lib/supabase';

interface PredictionsTabProps {
  predictions: Prediction[];
  loading: boolean;
  onFetchPredictions: () => void;
  onRecordResult: (predictionId: string, actualGoals: number) => void;
}

export function PredictionsTab({
  predictions,
  loading,
  onFetchPredictions,
  onRecordResult,
}: PredictionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={onFetchPredictions}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400"
        >
          {loading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Plus size={20} />
              Generate Predictions
            </>
          )}
        </button>
      </div>

      {predictions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Predictions Yet
          </h3>
          <p className="text-gray-600">
            Click "Generate Predictions" to analyze upcoming matches
          </p>
        </div>
      ) : (
        predictions.map((pred) => (
          <PredictionCard
            key={pred.id}
            prediction={pred}
            onRecordResult={(goals) =>
              onRecordResult(pred.id as string, goals)
            }
          />
        ))
      )}
    </div>
  );
}
