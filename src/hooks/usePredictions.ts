import { useState, useCallback } from 'react';
import { supabase, Prediction } from '../lib/supabase';
import * as db from '../lib/database';

export function usePredictions(userId: string | undefined) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadPredictions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');
      const data = await db.getPredictions(userId);
      setPredictions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load predictions');
      console.error('Error loading predictions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchPredictions = useCallback(
    async (dates: string[]) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const token = (await supabase.auth.getSession()).data.session?.access_token;
        if (!token) throw new Error('No access token');

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-predictions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dates }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch predictions');
        }

        const newPredictions = await response.json();

        for (const pred of newPredictions) {
          await db.savePrediction(userId, pred);
        }

        setPredictions((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = prev.filter((p) => !existingIds.has(p.id));
          return [...newPredictions, ...filtered];
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch predictions';
        setError(message);
        console.error('Error fetching predictions:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const recordResult = useCallback(
    async (predictionId: string, actualGoals: number) => {
      if (!userId) return;

      try {
        const prediction = predictions.find((p) => p.id === predictionId);
        if (!prediction) return;

        const predictedMin = parseInt(prediction.prediction);
        const result = actualGoals >= predictedMin ? 'correct' : 'incorrect';

        await db.updatePredictionResult(
          predictionId,
          actualGoals,
          result as 'correct' | 'incorrect'
        );

        setPredictions((prev) =>
          prev.map((p) =>
            p.id === predictionId
              ? { ...p, actual_goals: actualGoals, result }
              : p
          )
        );

        const completed = predictions.filter((p) => p.result !== null);
        const correct = predictions.filter((p) => p.result === 'correct').length;
        await db.updateModelStats(userId, completed.length, correct);
      } catch (err) {
        console.error('Error recording result:', err);
      }
    },
    [predictions, userId]
  );

  return {
    predictions,
    loading,
    error,
    loadPredictions,
    fetchPredictions,
    recordResult,
    setPredictions,
    setError,
  };
}
