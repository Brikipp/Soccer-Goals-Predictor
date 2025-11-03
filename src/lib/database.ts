import { supabase, Prediction, ModelStats } from './supabase';

export async function savePrediction(userId: string, prediction: Prediction) {
  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: userId,
      fixture_id: prediction.id,
      home_team: prediction.homeTeam,
      away_team: prediction.awayTeam,
      league: prediction.league,
      match_date: prediction.date,
      match_time: prediction.time,
      prediction: prediction.prediction,
      expected_goals: parseFloat(prediction.expectedGoals),
      reasoning: prediction.reasoning,
      is_derby: prediction.isDerby,
      is_rivalry: prediction.isRivalry,
      home_stats: prediction.homeStats,
      away_stats: prediction.awayStats,
      h2h_data: prediction.h2h,
      motivation: prediction.motivation,
      injuries: prediction.injuries,
      confidence: prediction.confidence,
      actual_goals: prediction.actual_goals,
      result: prediction.result,
    },
    { onConflict: 'user_id, fixture_id' }
  );

  if (error) throw error;
}

export async function getPredictions(userId: string) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', userId)
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updatePredictionResult(
  predictionId: string,
  actualGoals: number,
  result: 'correct' | 'incorrect'
) {
  const { error } = await supabase
    .from('predictions')
    .update({ actual_goals: actualGoals, result })
    .eq('id', predictionId);

  if (error) throw error;
}

export async function getModelStats(userId: string) {
  const { data, error } = await supabase
    .from('model_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateModelStats(
  userId: string,
  totalPredictions: number,
  correctPredictions: number
) {
  const accuracy = totalPredictions > 0
    ? ((correctPredictions / totalPredictions) * 100).toFixed(2)
    : '0';

  const { error } = await supabase.from('model_stats').upsert(
    {
      user_id: userId,
      total_predictions: totalPredictions,
      correct_predictions: correctPredictions,
      accuracy_percentage: parseFloat(accuracy),
    },
    { onConflict: 'user_id' }
  );

  if (error) throw error;
}

export async function saveApiKey(userId: string, apiKey: string) {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: userId,
      api_key: apiKey,
    });

  if (error) throw error;
}

export async function getApiKeyExists(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('api_key')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return !!data?.api_key;
}

export async function deleteHistoricalData(userId: string) {
  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('user_id', userId)
    .not('actual_goals', 'is', null);

  if (error) throw error;
}
