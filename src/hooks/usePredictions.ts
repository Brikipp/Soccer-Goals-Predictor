// src/hooks/usePredictions.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_total_goals: number;
  predicted_home_goals: number | null;
  predicted_away_goals: number | null;
  confidence: number | null;
  prediction_range_min: number | null;
  prediction_range_max: number | null;
  actual_total_goals: number | null;
  accuracy_percentage: number | null;
  created_at: string;
  matches?: {
    home_team: string;
    away_team: string;
    league: string;
    match_date: string;
    status: string;
    home_score: number | null;
    away_score: number | null;
  };
}

interface UsePredictionsResult {
  predictions: Prediction[];
  loading: boolean;
  error: string | null;
  savePrediction: (data: SavePredictionData) => Promise<{ success: boolean; error?: string }>;
  refetch: () => Promise<void>;
}

interface SavePredictionData {
  match_id: string;
  predicted_total_goals: number;
  predicted_home_goals: number;
  predicted_away_goals: number;
  confidence: number;
  prediction_range_min: number;
  prediction_range_max: number;
}

/**
 * Custom hook to manage user predictions
 */
export function usePredictions(userId: string | undefined): UsePredictionsResult {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('predictions')
        .select(`
          *,
          matches (
            home_team,
            away_team,
            league,
            match_date,
            status,
            home_score,
            away_score
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPredictions(data || []);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const savePrediction = async (data: SavePredictionData) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data: newPrediction, error: saveError } = await supabase
        .from('predictions')
        .insert([
          {
            user_id: userId,
            ...data,
          },
        ])
        .select(`
          *,
          matches (
            home_team,
            away_team,
            league,
            match_date,
            status,
            home_score,
            away_score
          )
        `)
        .single();

      if (saveError) {
        throw saveError;
      }

      // Add to local state
      setPredictions([newPrediction, ...predictions]);

      return { success: true };
    } catch (err) {
      console.error('Error saving prediction:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save prediction',
      };
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, [userId]);

  return {
    predictions,
    loading,
    error,
    savePrediction,
    refetch: fetchPredictions,
  };
}