import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function HistoryTab() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      if (!userId) {
        setPredictions([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", userId)
        .order("match_date", { ascending: false });

      if (error) {
        console.error("History load failed:", error);
        setPredictions([]);
      } else {
        setPredictions(data || []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading history...</div>;

  if (predictions.length === 0) return <div>No history found.</div>;

  return (
    <div>
      <h2 className="text-xl mb-4">Prediction History</h2>
      <div className="space-y-3">
        {predictions.map(p => (
          <div key={p.id} className="p-3 border rounded bg-white dark:bg-gray-900">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{p.home_team} vs {p.away_team}</div>
                <div className="text-sm text-gray-500">Predicted: {p.predicted_home_goals} - {p.predicted_away_goals}</div>
                <div className="text-sm text-gray-500">Match date: {new Date(p.match_date).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded ${p.result === 'win' ? 'bg-green-100 text-green-700' : p.result === 'lose' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {p.result ?? 'pending'}
                </div>
                <div className="text-xs text-gray-400 mt-1">Saved: {new Date(p.created_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
