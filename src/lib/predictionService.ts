import { supabase } from "./supabaseClient";

export async function savePrediction(payload: {
  user_id: string | null;
  home_team: string;
  away_team: string;
  predicted_home_goals: number;
  predicted_away_goals: number;
  match_date: string; // ISO
  fixture_id?: number | null; // optional if you map to a provider fixture id
}) {
  const { data, error } = await supabase
    .from("predictions")
    .insert([payload])
    .select()
    .single();

  return { data, error };
}

export async function fetchUserPredictions(userId: string) {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .order("match_date", { ascending: false });

  return { data, error };
}

export async function fetchAllPendingPredictions() {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("result", "pending")
    .lt("match_date", new Date().toISOString()); // optionally filter
  return { data, error };
}

export async function updatePredictionResult(predictionId: string, updates: Partial<Record<string, any>>) {
  const { data, error } = await supabase
    .from("predictions")
    .update(updates)
    .eq("id", predictionId)
    .select()
    .single();
  return { data, error };
}
