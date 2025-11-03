import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MatchData = {
  id: number;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  isDerby: boolean;
  isRivalry: boolean;
  homeStats: TeamStats;
  awayStats: TeamStats;
  h2h: H2HData;
  motivation: string;
  injuries: string[];
  confidence: number;
  prediction: string;
  expectedGoals: string;
  reasoning: string;
};

export type TeamStats = {
  goalsScored: number;
  goalsConceded: number;
  form: string[];
  homePerf: number;
  awayPerf: number;
  played: number;
};

export type H2HData = {
  avg: number;
  last5: number[];
};

export type Prediction = MatchData & {
  user_id?: string;
  fixture_id?: number;
  actual_goals: number | null;
  result: 'correct' | 'incorrect' | null;
  created_at?: string;
  updated_at?: string;
};

export type ModelStats = {
  id: string;
  user_id: string;
  total_predictions: number;
  correct_predictions: number;
  accuracy_percentage: number;
};
