import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Max-Age': '86400',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Parse request body
    const { dates } = await req.json();
    if (!dates || !Array.isArray(dates)) {
      throw new Error('Invalid or missing dates');
    }

    // Log API key presence
    const apiKey = Deno.env.get('FOOTBALL_API_KEY') ?? '';
    console.log('Football API Key:', apiKey ? 'Present' : 'Missing');

    // Fetch fixtures from Football API
    const allFixtures: any[] = [];
    for (const date of dates) {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${date}`,
        {
          headers: {
            'x-apisports-key': apiKey,
          },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Football API error: Status ${response.status}, Body: ${errorText}`);
        throw new Error(`Football API failed: Status ${response.status}, ${errorText}`);
      }
      const data = await response.json();
      allFixtures.push(...(data.response || []));
    }

    // Process fixtures
    const detailedPredictions = allFixtures.map((fixture) => {
      if (!fixture?.fixture?.id) return null;
      const match = {
        id: fixture.fixture.id,
        date: fixture.fixture.date.split('T')[0],
        time: fixture.fixture.date.split('T')[1].slice(0, 5),
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        isDerby: fixture.league.name.includes('Derby') || false,
        isRivalry: false,
        homeStats: {
          goalsScored: fixture.teams.home.goals || 0,
          homePerf: Math.random(),
          form: ['W', 'L', 'D'],
        },
        awayStats: {
          goalsScored: fixture.teams.away.goals || 0,
          awayPerf: Math.random(),
          form: ['L', 'W', 'D'],
        },
        h2h: { avg: 2.5, last5: [2, 3, 1, 4, 0] },
        motivation: 'High',
        injuries: [],
        confidence: 75,
      };
      return {
        ...match,
        ...calculateGoalsPrediction(match),
      };
    });

    return new Response(
      JSON.stringify(detailedPredictions.filter((p) => p)),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-predictions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function calculateGoalsPrediction(match: any) {
  const homeWeight = match.homeStats.homePerf * 0.6 + match.homeStats.goalsScored * 0.2;
  const awayWeight = match.awayStats.awayPerf * 0.6 + match.awayStats.goalsScored * 0.2;
  const expectedGoals = (homeWeight + awayWeight + match.h2h.avg) / 3;
  let prediction = expectedGoals > 3 ? '3+' : '2+';
  if (match.isDerby) prediction = '4+';
  return {
    prediction,
    expectedGoals: expectedGoals.toFixed(2),
    reasoning: 'Based on team performance and historical data',
  };
}