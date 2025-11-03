import React, { useState, useEffect } from 'react';
import { Calendar, History } from 'lucide-react';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { SettingsPanel } from './components/SettingsPanel';
import { PredictionsTab } from './components/PredictionsTab';
import { HistoryTab } from './components/HistoryTab';
import { usePredictions } from './hooks/usePredictions';
import { useModelStats } from './hooks/useModelStats';
import * as db from './lib/database';

function SoccerGoalsPredictorContent() {
  const { user, loading: authLoading, signOut, error: authError } =
    useAuthContext();
  const [activeTab, setActiveTab] = useState<'predictions' | 'history'>(
    'predictions'
  );
  const [showSettings, setShowSettings] = useState(false);

  const {
    predictions,
    loading: predictionsLoading,
    error: predictionsError,
    fetchPredictions,
    recordResult,
    loadPredictions, // Added for initial load
  } = usePredictions(user?.id);

  const { stats } = useModelStats(user?.id);

  const historicalData = predictions.filter((p) => p.actual_goals !== null);

  useEffect(() => {
    if (user?.id) {
      loadPredictions(); // Load existing predictions
      handleFetchPredictions(); // Fetch new predictions
    }
  }, [user?.id, loadPredictions]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    const { signUp, signIn } = useAuthContext();
    return (
      <AuthForm onSignUp={signUp} onSignIn={signIn} loading={false} error={authError} />
    );
  }

  async function handleFetchPredictions() {
    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);

    const todayStr = today.toISOString().split('T')[0];
    const twoDaysStr = twoDaysLater.toISOString().split('T')[0];

    await fetchPredictions([todayStr, twoDaysStr]);
  }

  async function handleRecordResult(
    predictionId: string,
    actualGoals: number
  ) {
    await recordResult(predictionId, actualGoals);
  }

  async function handleClearHistory() {
    if (user?.id) {
      await db.deleteHistoricalData(user.id);
      // Refresh data
      window.location.reload();
    }
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Header
          onSettingsClick={() => setShowSettings(!showSettings)}
          onSignOut={handleSignOut}
        />

        {showSettings && user && (
          <SettingsPanel userId={user.id} onClose={() => setShowSettings(false)} />
        )}

        {predictionsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {predictionsError}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Model Accuracy"
            value={stats ? `${stats.accuracy_percentage.toFixed(1)}%` : '0%'}
            color="blue"
          />
          <StatsCard
            title="Correct Predictions"
            value={stats?.correct_predictions || 0}
            color="green"
          />
          <StatsCard
            title="Total Predictions"
            value={stats?.total_predictions || 0}
            color="orange"
          />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'predictions'
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/60 text-gray-600 hover:bg-white'
            }`}
          >
            <Calendar size={20} />
            Predictions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white text-green-600 shadow-lg'
                : 'bg-white/60 text-gray-600 hover:bg-white'
            }`}
          >
            <History size={20} />
            History ({historicalData.length})
          </button>
        </div>

        {activeTab === 'predictions' && (
          <PredictionsTab
            predictions={predictions}
            loading={predictionsLoading}
            onFetchPredictions={handleFetchPredictions}
            onRecordResult={handleRecordResult}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            historicalData={historicalData}
            onClearHistory={handleClearHistory}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SoccerGoalsPredictorContent />
    </AuthProvider>
  );
}

export default App;