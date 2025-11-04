// src/App.tsx
import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Filter,
  Moon,
  Sun,
  Check,
  LogOut,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';

import { useAuth } from './hooks/useAuth';
import { useMatches } from './hooks/useMatches';
import { usePredictions } from './hooks/usePredictions';
import {
  calculatePrediction,
  getConfidenceColor,
  formatConfidence,
} from './services/predictionEngine';

function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');
  
  // Auth form state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading2, setAuthLoading2] = useState(false);

  const { matches, loading: matchesLoading } = useMatches(selectedLeague);
  const { predictions, savePrediction, loading: predictionsLoading } = usePredictions(user?.id);

  // Calculate predictions for all matches
  const matchPredictions = useMemo(() => {
    const predictions: Record<string, any> = {};
    matches.forEach((match) => {
      predictions[match.id] = calculatePrediction(match);
    });
    return predictions;
  }, [matches]);

  // Get unique leagues
  const leagues = useMemo(() => {
    const uniqueLeagues = ['All', ...new Set(matches.map((m) => m.league))];
    return uniqueLeagues;
  }, [matches]);

  // Calculate user stats
  const userStats = useMemo(() => {
    const completedPredictions = predictions.filter(
      (p) => p.accuracy_percentage !== null
    );
    const avgAccuracy = completedPredictions.length
      ? completedPredictions.reduce((sum, p) => sum + (p.accuracy_percentage || 0), 0) /
        completedPredictions.length
      : 0;

    return {
      totalPredictions: predictions.length,
      accuracy: Math.round(avgAccuracy),
      completedMatches: completedPredictions.length,
    };
  }, [predictions]);

  // Handle authentication
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading2(true);

    try {
      const result =
        authMode === 'signin'
          ? await signIn(email, password)
          : await signUp(email, password);

      if (result.success) {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
    } finally {
      setAuthLoading2(false);
    }
  };

  // Handle save prediction
  const handleSavePrediction = async (matchId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const prediction = matchPredictions[matchId];
    const result = await savePrediction({
      match_id: matchId,
      predicted_total_goals: prediction.totalGoals,
      predicted_home_goals: prediction.homeGoals,
      predicted_away_goals: prediction.awayGoals,
      confidence: prediction.confidence,
      prediction_range_min: prediction.range.min,
      prediction_range_max: prediction.range.max,
    });

    if (!result.success) {
      alert(result.error || 'Failed to save prediction');
    }
  };

  // Check if prediction is already saved
  const isPredictionSaved = (matchId: string) => {
    return predictions.some((p) => p.match_id === matchId);
  };

  if (authLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="text-blue-500" size={32} />
              <h1 className="text-2xl font-bold">Soccer Goals Predictor</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <LogIn size={18} />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          {user && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <Target size={18} />
                  <span className="text-sm font-medium">Accuracy</span>
                </div>
                <p className="text-2xl font-bold">{userStats.accuracy}%</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <div className="flex items-center gap-2 text-green-500 mb-1">
                  <TrendingUp size={18} />
                  <span className="text-sm font-medium">Predictions</span>
                </div>
                <p className="text-2xl font-bold">{userStats.totalPredictions}</p>
              </div>
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                <div className="flex items-center gap-2 text-purple-500 mb-1">
                  <BarChart3 size={18} />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <p className="text-2xl font-bold">{userStats.completedMatches}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'predictions'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Predictions
            </button>
            {user && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'saved'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                My Predictions ({predictions.length})
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'predictions' && (
          <>
            {/* Filters */}
            <div className="mb-6 flex items-center gap-3">
              <Filter size={20} className="text-gray-400" />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                }`}
              >
                {leagues.map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading State */}
            {matchesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            ) : matches.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center`}>
                <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Upcoming Matches</h3>
                <p className="text-gray-500">Check back later for new matches</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {matches.map((match) => {
                  const prediction = matchPredictions[match.id];
                  const isSaved = isPredictionSaved(match.id);
                  const confidenceColor = getConfidenceColor(prediction.confidence);

                  return (
                    <div
                      key={match.id}
                      className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                              {match.league}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(match.match_date).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold">
                            {match.home_team} vs {match.away_team}
                          </h3>
                        </div>
                        <div className={`text-${confidenceColor}-500 text-right`}>
                          <p className="text-sm font-medium">Confidence</p>
                          <p className="text-2xl font-bold">{formatConfidence(prediction.confidence)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-lg p-4`}>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Total Goals Prediction
                          </h4>
                          <p className="text-4xl font-bold text-blue-500 mb-2">
                            {prediction.totalGoals}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Range: {prediction.range.min} - {prediction.range.max}
                          </p>
                          <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                            <div className="flex justify-between text-sm">
                              <span>Home: {prediction.homeGoals}</span>
                              <span>Away: {prediction.awayGoals}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Recent Form</p>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm w-20">Home:</span>
                              <div className="flex gap-1">
                                {match.home_form.map((result, i) => (
                                  <div
                                    key={i}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                      result === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}
                                  >
                                    {result === 1 ? 'W' : 'L'}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm w-20">Away:</span>
                              <div className="flex gap-1">
                                {match.away_form.map((result, i) => (
                                  <div
                                    key={i}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                      result === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}
                                  >
                                    {result === 1 ? 'W' : 'L'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSavePrediction(match.id)}
                        disabled={isSaved || !user}
                        className={`w-full py-3 rounded-lg font-medium ${
                          isSaved
                            ? darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isSaved ? (
                          <span className="flex items-center justify-center gap-2">
                            <Check size={18} /> Saved
                          </span>
                        ) : user ? (
                          'Save Prediction'
                        ) : (
                          'Sign In to Save'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && user && (
          <div className="space-y-4">
            {predictionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={48} />
              </div>
            ) : predictions.length === 0 ? (
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center`}>
                <Target size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Saved Predictions</h3>
                <p className="text-gray-500">Save predictions to track them here</p>
              </div>
            ) : (
              predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {pred.matches?.home_team} vs {pred.matches?.away_team}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pred.matches?.league} • {new Date(pred.matches?.match_date || '').toLocaleDateString()}
                      </p>
                      {pred.accuracy_percentage !== null && (
                        <div className="mt-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              pred.accuracy_percentage >= 80
                                ? 'bg-green-100 text-green-700'
                                : pred.accuracy_percentage >= 60
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            Accuracy: {pred.accuracy_percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Predicted</p>
                      <p className="text-3xl font-bold text-blue-500">{pred.predicted_total_goals}</p>
                      {pred.actual_total_goals !== null && (
                        <p className="text-sm text-gray-500 mt-1">Actual: {pred.actual_total_goals}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}>
            <h2 className="text-2xl font-bold mb-4">
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                  required
                  minLength={6}
                />
              </div>

              {authError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading2}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2"
              >
                {authLoading2 ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : authMode === 'signin' ? (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Sign Up
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError('');
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                {authMode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>

            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
              }}
              className="mt-4 w-full py-2 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;