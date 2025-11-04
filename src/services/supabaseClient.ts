// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing');
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and restart the dev server.'
  );
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          prediction_accuracy: number;
          total_predictions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username?: string | null;
          prediction_accuracy?: number;
          total_predictions?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string | null;
          prediction_accuracy?: number;
          total_predictions?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          home_team: string;
          away_team: string;
          league: string;
          match_date: string;
          home_avg_goals: number;
          away_avg_goals: number;
          home_form: number[];
          away_form: number[];
          h2h_history: number[];
          api_match_id: string | null;
          status: string;
          home_score: number | null;
          away_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          home_team: string;
          away_team: string;
          league: string;
          match_date: string;
          home_avg_goals?: number;
          away_avg_goals?: number;
          home_form?: number[];
          away_form?: number[];
          h2h_history?: number[];
          api_match_id?: string | null;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          home_team?: string;
          away_team?: string;
          league?: string;
          match_date?: string;
          home_avg_goals?: number;
          away_avg_goals?: number;
          home_form?: number[];
          away_form?: number[];
          h2h_history?: number[];
          api_match_id?: string | null;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      predictions: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          predicted_total_goals: number;
          predicted_home_goals?: number | null;
          predicted_away_goals?: number | null;
          confidence?: number | null;
          prediction_range_min?: number | null;
          prediction_range_max?: number | null;
          actual_total_goals?: number | null;
          accuracy_percentage?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          predicted_total_goals?: number;
          predicted_home_goals?: number | null;
          predicted_away_goals?: number | null;
          confidence?: number | null;
          prediction_range_min?: number | null;
          prediction_range_max?: number | null;
          actual_total_goals?: number | null;
          accuracy_percentage?: number | null;
          created_at?: string;
        };
      };
    };
  };
};

// Helper function to check if user is authenticated
export async function checkAuth() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Helper function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}