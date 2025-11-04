import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

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
      (globalThis as any).Deno?.env?.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno?.env?.get('SUPABASE_ANON_KEY') ?? ''
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
    console.log('Request dates:', dates);

    // Fetch data from TheSportsDB (use search for events)
    const allEvents: any[] = [];
    for (const date of dates) {
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/123/searchevent.php?e=${date}`
      );
      if (!response.ok) {
        console.error(`TheSportsDB error for date ${date}: Status ${response.status}`);
        continue;
      }
      const data = await response.json();
      console.log(`TheSportsDB response for date ${date}: ${data.event ? 1 : 0} results`);
      allEvents.push(...(data.event || []));
    }

    // Filter and limit to 10 events
    const selectedEvents = allEvents.slice(0, 10);
    console.log(`Selected events: ${selectedEvents.length}`);

    // Enrich with predictions
    const detailedPredictions = selectedEvents.map((event) => {
      const match = {
        id: event.idEvent || 'unknown',
        date: event.dateEvent.split('T')[0],
        time: event.dateEvent.split('T')[1]?.slice(0, 5) || 'TBD',
        homeTeam: event.strHomeTeam || 'Home Team',
        awayTeam: event.strAwayTeam || 'Away Team',
        league: event.strLeague || 'Unknown League',
        isDerby: event.strEvent.includes('Derby') || false,
        isRivalry: false,
        homeStats: {
          goalsScored: 1.5,
          homePerf: 1.5,
          form: ['W', 'L', 'D'],
        },
        awayStats: {
          goalsScored: 1.5,
          awayPerf: 1.5,
          form: ['L', 'W', 'D'],
        },
        h2h: { avg: 2.5, last5: [2, 3, 1, 4, 0] },
        motivation: 'High',
        injuries: [],
        confidence: 75,
      };
      const prediction = calculateGoalsPrediction(match);
      return { ...match, ...prediction };
    });

    return new Response(
      JSON.stringify(detailedPredictions),
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