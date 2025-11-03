import { useState, useCallback, useEffect } from 'react';
import * as db from '../lib/database';
import type { ModelStats } from '../lib/supabase';

export function useModelStats(userId: string | undefined) {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await db.getModelStats(userId);
      setStats(
        data || {
          id: '',
          user_id: userId,
          total_predictions: 0,
          correct_predictions: 0,
          accuracy_percentage: 0,
        }
      );
    } catch (err) {
      console.error('Error loading model stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, loadStats };
}
