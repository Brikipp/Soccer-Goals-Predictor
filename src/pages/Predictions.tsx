import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { TrendingUp, Calendar, Trophy, Users, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { fetchUpcomingFixturesByLeague, fetchAllFixtures, call, testAlternativeAPI } from '@/lib/footballApi';
import { savePrediction } from '@/lib/predictionService';
import { useAuth } from '@/hooks/useAuth';

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
    };
  };
  league: {
    name: string;
    country: string;
  };
  teams: {
    home: {
      name: string;
      logo: string;
    };
    away: {
      name: string;
      logo: string;
    };
  };
}

interface PredictionInput {
  homeGoals: string;
  awayGoals: string;
}

interface GroupedFixtures {
  [date: string]: Fixture[];
}

export default function Predictions() {
  const { user } = useAuth();
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<number, PredictionInput>>({});
  const [savingPrediction, setSavingPrediction] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>('39');

  const majorLeagues = [
    { id: 39, name: 'Premier League', country: 'England' },
    { id: 140, name: 'La Liga', country: 'Spain' },
    { id: 135, name: 'Serie A', country: 'Italy' },
    { id: 78, name: 'Bundesliga', country: 'Germany' },
    { id: 61, name: 'Ligue 1', country: 'France' },
  ];

  const fetchFixtures = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch fixtures from the selected league
      const fixtures = await fetchUpcomingFixturesByLeague(parseInt(selectedLeague), new Date().getFullYear(), {
        limit: 50
      }).catch(err => {
        console.error('Failed to fetch fixtures:', err);
        throw err;
      });
      
      // Filter for upcoming matches in the next 7 days
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      const upcomingFixtures = fixtures.filter((fixture: Fixture) => {
        const matchDate = new Date(fixture.fixture.date);
        return matchDate >= now && matchDate <= weekFromNow;
      });
      
      // Sort fixtures by date and time
      upcomingFixtures.sort((a: Fixture, b: Fixture) => {
        return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      });
      
      setFixtures(upcomingFixtures);
    } catch (err) {
      console.error('Error fetching fixtures:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch fixtures');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionChange = (fixtureId: number, type: 'home' | 'away', value: string) => {
    setPredictions(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [type === 'home' ? 'homeGoals' : 'awayGoals']: value
      }
    }));
  };

  const handleSavePrediction = async (fixture: Fixture) => {
    if (!user) {
      setError('You must be logged in to save predictions');
      return;
    }

    const prediction = predictions[fixture.fixture.id];
    if (!prediction?.homeGoals || !prediction?.awayGoals) {
      setError('Please enter both home and away goals');
      return;
    }

    setSavingPrediction(fixture.fixture.id);
    
    try {
      await savePrediction({
        user_id: user.id,
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        predicted_home_goals: parseInt(prediction.homeGoals),
        predicted_away_goals: parseInt(prediction.awayGoals),
        match_date: fixture.fixture.date,
        fixture_id: fixture.fixture.id
      });
      
      // Clear the prediction for this fixture after saving
      setPredictions(prev => {
        const newPredictions = { ...prev };
        delete newPredictions[fixture.fixture.id];
        return newPredictions;
      });
      
    } catch (err) {
      console.error('Error saving prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to save prediction');
    } finally {
      setSavingPrediction(null);
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Match Predictions
          </h1>
          <p className="text-muted-foreground">
            AI-powered soccer goal predictions for upcoming matches
          </p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Get Predictions
              </CardTitle>
              <CardDescription>
                Select a league and fetch upcoming matches
              </CardDescription>
            </div>
            <Badge variant="default" className="shadow-glow">
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-center">
            <Button 
              onClick={fetchFixtures}
              disabled={loading}
              size="lg" 
              className="shadow-md hover:shadow-glow transition-all"
            >
              {loading ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Fetching...</>
              ) : (
                'Fetch Latest Matches'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {fixtures.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Matches
          </h2>
          {Object.entries(
            fixtures.reduce((groups: GroupedFixtures, fixture) => {
              const date = new Date(fixture.fixture.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              });
              if (!groups[date]) {
                groups[date] = [];
              }
              groups[date].push(fixture);
              return groups;
            }, {})
          ).map(([date, dateFixtures]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">
                {date}
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dateFixtures.map((fixture) => (
              <Card key={fixture.fixture.id} className="hover:shadow-md transition-shadow animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {fixture.league.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {fixture.fixture.status.long}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      Match
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {formatMatchDate(fixture.fixture.date)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={fixture.teams.home.logo} 
                        alt={fixture.teams.home.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="font-medium">{fixture.teams.home.name}</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">VS</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fixture.teams.away.name}</span>
                      <img 
                        src={fixture.teams.away.logo} 
                        alt={fixture.teams.away.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor={`home-${fixture.fixture.id}`} className="text-xs">
                            Home Goals
                          </Label>
                          <Input
                            id={`home-${fixture.fixture.id}`}
                            type="number"
                            min="0"
                            max="10"
                            placeholder="0"
                            value={predictions[fixture.fixture.id]?.homeGoals || ''}
                            onChange={(e) => handlePredictionChange(fixture.fixture.id, 'home', e.target.value)}
                            className="text-center"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`away-${fixture.fixture.id}`} className="text-xs">
                            Away Goals
                          </Label>
                          <Input
                            id={`away-${fixture.fixture.id}`}
                            type="number"
                            min="0"
                            max="10"
                            placeholder="0"
                            value={predictions[fixture.fixture.id]?.awayGoals || ''}
                            onChange={(e) => handlePredictionChange(fixture.fixture.id, 'away', e.target.value)}
                            className="text-center"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSavePrediction(fixture)}
                        disabled={savingPrediction === fixture.fixture.id || !predictions[fixture.fixture.id]?.homeGoals || !predictions[fixture.fixture.id]?.awayGoals}
                        size="sm"
                        className="w-full"
                      >
                        {savingPrediction === fixture.fixture.id ? (
                          <><RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
                        ) : (
                          'Save Prediction'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 px-3 bg-muted rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Users className="h-3 w-3" />
                        Login to make predictions
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {fixtures.length === 0 && !loading && !error && (
        <Card className="border-border">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Matches Found</h3>
            <p className="text-sm text-muted-foreground">
              Select a league and click "Fetch Latest Matches" to see upcoming fixtures.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
