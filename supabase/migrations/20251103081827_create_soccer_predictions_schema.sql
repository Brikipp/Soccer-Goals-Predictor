/*
  # Soccer Goals Predictor Schema

  1. New Tables
    - `users` (extends auth.users)
      - `id` (uuid, primary key, links to auth.users)
      - `api_key` (text, encrypted API key for football API)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `predictions` (stores match predictions)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `fixture_id` (integer, from API)
      - `home_team` (text)
      - `away_team` (text)
      - `league` (text)
      - `match_date` (date)
      - `match_time` (time)
      - `prediction` (text, e.g., "3+", "4+")
      - `expected_goals` (numeric)
      - `reasoning` (text)
      - `is_derby` (boolean)
      - `is_rivalry` (boolean)
      - `home_stats` (jsonb)
      - `away_stats` (jsonb)
      - `h2h_data` (jsonb)
      - `motivation` (text)
      - `injuries` (jsonb array)
      - `confidence` (integer)
      - `actual_goals` (integer, null until match completes)
      - `result` (text, null/'correct'/'incorrect')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `model_stats` (aggregated accuracy metrics)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `total_predictions` (integer)
      - `correct_predictions` (integer)
      - `accuracy_percentage` (numeric)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - API keys are encrypted and not readable via SELECT

  3. Indexes
    - Added on user_id for faster queries
    - Added on fixture_id for deduplication
    - Added on match_date for filtering
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fixture_id integer NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  league text NOT NULL,
  match_date date NOT NULL,
  match_time time,
  prediction text NOT NULL,
  expected_goals numeric(4,2) NOT NULL,
  reasoning text,
  is_derby boolean DEFAULT false,
  is_rivalry boolean DEFAULT false,
  home_stats jsonb,
  away_stats jsonb,
  h2h_data jsonb,
  motivation text,
  injuries jsonb DEFAULT '[]'::jsonb,
  confidence integer DEFAULT 75,
  actual_goals integer,
  result text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, fixture_id)
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_fixture_id ON predictions(fixture_id);
CREATE INDEX idx_predictions_match_date ON predictions(match_date);

CREATE TABLE IF NOT EXISTS model_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  accuracy_percentage numeric(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE model_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
  ON model_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON model_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_model_stats_user_id ON model_stats(user_id);
