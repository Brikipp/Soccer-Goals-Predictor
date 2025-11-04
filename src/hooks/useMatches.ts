// src/hooks/useMatches.ts
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Match } from '../services/predictionEngine';

interface UseMatchesResult {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage matches
 */
export function useMatches(league?: string): UseMatchesResult {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('matches')
        .select('*')
        .eq('status', 'upcoming')
        .gte('match_date', new Date().toISOString())
        .order('match_date', { ascending: true })
        .limit(20);

      // Filter by league if specified
      if (league && league !== 'All') {
        query = query.eq('league', league);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setMatches(data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [league]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
  };
}