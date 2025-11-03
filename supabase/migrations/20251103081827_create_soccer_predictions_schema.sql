CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  fixture_id integer NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  league text NOT NULL,
  match_date date NOT NULL,
  match_time text,
  prediction text NOT NULL,
  expected_goals real,
  reasoning text,
  is_derby boolean DEFAULT false,
  is_rivalry boolean DEFAULT false,
  home_stats jsonb,
  away_stats jsonb,
  h2h_data jsonb,
  motivation text,
  injuries jsonb,
  confidence real,
  actual_goals integer,
  result text CHECK (result IN ('correct', 'incorrect')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, fixture_id)
);

CREATE TABLE model_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_predictions integer DEFAULT 0,
  correct_predictions integer DEFAULT 0,
  accuracy_percentage real GENERATED ALWAYS AS (
    CASE
      WHEN total_predictions > 0 THEN (correct_predictions::real / total_predictions) * 100
      ELSE 0
    END
  ) STORED
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_access ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY user_predictions ON predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_model_stats ON model_stats FOR ALL USING (auth.uid() = user_id);