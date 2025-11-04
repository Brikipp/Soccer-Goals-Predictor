import StatsCard from "./StatsCard";

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  <StatsCard title="Accuracy" value="72%" subtitle="Last 100 games" />
  <StatsCard title="Total Predictions" value="154" />
  <StatsCard title="Win Rate" value="68%" />
  <StatsCard title="ROI" value="+12.3%" />
</div>

import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { savePrediction } from "../lib/predictionService";
import PredictionCard from "./PredictionCard";

export default function PredictionsTab() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [phg, setPhg] = useState<number>(1.5);
  const [pag, setPag] = useState<number>(1.0);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("predictions").select("*").order("match_date", {ascending:false});
      setPredictions(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    // try to get user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    const matchDate = new Date().toISOString();

    const { data, error } = await savePrediction({
      user_id: userId,
      home_team: home,
      away_team: away,
      predicted_home_goals: phg,
      predicted_away_goals: pag,
      match_date: matchDate,
    });

    if (error) {
      alert("Save failed: " + error.message);
      return;
    }

    setPredictions(prev => [data, ...prev]);
    setHome(""); setAway(""); setPhg(1.5); setPag(1.0);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl">Make a prediction</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 my-4">
        <input value={home} onChange={e=>setHome(e.target.value)} placeholder="Home team" className="p-2 border rounded"/>
        <input value={away} onChange={e=>setAway(e.target.value)} placeholder="Away team" className="p-2 border rounded"/>
        <input value={phg} onChange={e=>setPhg(Number(e.target.value))} type="number" step="0.1" className="p-2 border rounded" />
        <input value={pag} onChange={e=>setPag(Number(e.target.value))} type="number" step="0.1" className="p-2 border rounded"/>
      </div>
      <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save prediction</button>

      <div className="mt-6">
        {predictions.map(p => <PredictionCard key={p.id} {...p} />)}
      </div>
    </div>
  );
}
