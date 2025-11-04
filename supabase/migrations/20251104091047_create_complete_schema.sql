/*
  # Complete Soccer Predictions Schema

  ## Overview
  Creates a comprehensive database schema for the soccer goals predictor application
  with proper authentication integration, match tracking, predictions, and statistics.

  ## Tables Created

  ### 1. users
  Stores user profile information linked to Supabase Auth
  - `id` (uuid, FK to auth.users) - User identifier
  - `email` (text) - User email
  - `username` (text) - Display name
  - `prediction_accuracy` (real) - Overall prediction accuracy percentage
  - `total_predictions` (int) - Count of all predictions made
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 2. matches
  Stores match data for predictions
  - `id` (uuid) - Match identifier
  - `home_team`, `away_team` (text) - Team names
  - `league` (text) - League/competition name
  - `match_date` (timestamptz) - When the match occurs
  - `home_avg_goals`, `away_avg_goals` (real) - Average goals scored
  - `home_form`, `away_form` (int[]) - Recent form (wins/losses as 1/0)
  - `h2h_history` (int[]) - Historical goal totals
  - `api_match_id` (text) - External API reference
  - `status` (text) - upcoming/completed/cancelled
  - `home_score`, `away_score` (int) - Final scores (null if not completed)

  ### 3. predictions
  Stores user predictions for matches
  - `id` (uuid) - Prediction identifier
  - `user_id`, `match_id` (uuid, FKs) - References to users and matches
  - `predicted_total_goals` (real) - Main prediction
  - `predicted_home_goals`, `predicted_away_goals` (real) - Individual team predictions
  - `confidence` (real) - Confidence level (0-1)
  - `prediction_range_min`, `prediction_range_max` (real) - Prediction range
  - `actual_total_goals` (int) - Actual result (null until match completes)
  - `accuracy_percentage` (real) - How accurate the prediction was
  - Unique constraint on (user_id, match_id)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - Authentication required for all operations
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS model_stats CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text,
  prediction_accuracy real DEFAULT 0,
  total_predictions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team text NOT NULL,
  away_team text NOT NULL,
  league text NOT NULL,
  match_date timestamptz NOT NULL,
  home_avg_goals real DEFAULT 0,
  away_avg_goals real DEFAULT 0,
  home_form integer[] DEFAULT '{}',
  away_form integer[] DEFAULT '{}',
  h2h_history integer[] DEFAULT '{}',
  api_match_id text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  home_score integer,
  away_score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  predicted_total_goals real NOT NULL,
  predicted_home_goals real,
  predicted_away_goals real,
  confidence real CHECK (confidence >= 0 AND confidence <= 1),
  prediction_range_min real,
  prediction_range_max real,
  actual_total_goals integer,
  accuracy_percentage real,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_match ON predictions(match_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for matches (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view all matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for predictions
CREATE POLICY "Users can view own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own predictions"
  ON predictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
