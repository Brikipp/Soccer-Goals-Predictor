import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  dates: string[];
}

interface FixtureResponse {
  fixture: { id: number; date: string };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  league: { id: number; name: string; season: number };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(
      token
    );

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    const { data: userData2, error: getUserError } = await supabase
      .from("users")
      .select("api_key")
      .eq("id", userId)
      .maybeSingle();

    if (getUserError || !userData2?.api_key) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = userData2.api_key;
    const { dates }: RequestBody = await req.json();

    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid dates parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const allFixtures: FixtureResponse[] = [];

    for (const date of dates) {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?date=${date}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      allFixtures.push(...(data.response || []));
    }

    const majorLeagues = [
      "Premier League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
      "Champions League",
      "Europa League",
      "Championship",
      "Eredivisie",
      "Primeira Liga",
      "Liga MX",
      "MLS",
      "Brasileirão Serie A",
    ];

    const filteredFixtures = allFixtures.filter((f) =>
      majorLeagues.some(
        (league) =>
          f.league.name.includes(league) || league.includes(f.league.name)
      )
    );

    const selectedFixtures = filteredFixtures.slice(0, 10);

    const detailedPredictions = await Promise.all(
      selectedFixtures.map((fixture) => enrichFixtureData(fixture, apiKey))
    );

    return new Response(JSON.stringify(detailedPredictions.filter((p) => p)), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function enrichFixtureData(
  fixture: FixtureResponse,
  apiKey: string
) {
  try {
    const homeTeamId = fixture.teams.home.id;
    const awayTeamId = fixture.teams.away.id;
    const leagueId = fixture.league.id;
    const season = fixture.league.season;

    const [homeStats, awayStats, h2hData] = await Promise.all([
      fetchTeamStats(homeTeamId, leagueId, season, apiKey),
      fetchTeamStats(awayTeamId, leagueId, season, apiKey),
      fetchH2H(homeTeamId, awayTeamId, apiKey),
    ]);

    if (!homeStats || !awayStats) return null;

    const injuries = await fetchInjuries(homeTeamId, awayTeamId, apiKey);
    const isDerby = checkIfDerby(fixture.teams.home.name, fixture.teams.away.name);
    const isRivalry = checkIfRivalry(fixture.teams.home.name, fixture.teams.away.name);
    const motivation = determineMotivation(homeStats, awayStats, fixture.league.name);

    const matchData = {
      id: fixture.fixture.id,
      date: fixture.fixture.date.split("T")[0],
      time: fixture.fixture.date.split("T")[1].substring(0, 5),
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      league: fixture.league.name,
      isDerby,
      isRivalry,
      homeStats,
      awayStats,
      h2h: h2hData,
      motivation,
      injuries,
      confidence: 75,
    };

    const prediction = calculateGoalsPrediction(matchData);
    return { ...matchData, ...prediction };
  } catch (err) {
    console.error("Error enriching fixture:", err);
    return null;
  }
}

async function fetchTeamStats(
  teamId: number,
  leagueId: number,
  season: number,
  apiKey: string
) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }
    );

    const data = await response.json();
    const stats = data.response;

    if (!stats || !stats.fixtures) return null;

    const form = stats.form
      ? stats.form
          .split("")
          .slice(0, 5)
          .map((f: string) => (f === "" ? "?" : f))
      : ["?", "?", "?", "?", "?"];

    return {
      goalsScored: parseFloat(((stats.goals?.for?.average?.total as number) || 1.5).toFixed(1)),
      goalsConceded: parseFloat(((stats.goals?.against?.average?.total as number) || 1.5).toFixed(1)),
      form: form,
      homePerf: parseFloat(((stats.goals?.for?.average?.home as number) || 1.5).toFixed(1)),
      awayPerf: parseFloat(((stats.goals?.for?.average?.away as number) || 1.5).toFixed(1)),
      played: (stats.fixtures.played?.total as number) || 0,
    };
  } catch (err) {
    console.error("Error fetching team stats:", err);
    return null;
  }
}

async function fetchH2H(
  team1: number,
  team2: number,
  apiKey: string
) {
  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${team1}-${team2}`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }
    );

    const data = await response.json();
    const matches = data.response || [];

    if (matches.length === 0) {
      return { avg: 2.5, last5: [3, 2, 3, 2, 3] };
    }

    const last5 = matches
      .slice(0, 5)
      .map(
        (m: { goals?: { home?: number; away?: number } }) =>
          (m.goals?.home || 0) + (m.goals?.away || 0)
      );

    const avg = last5.reduce((a: number, b: number) => a + b, 0) / last5.length;

    return {
      avg: parseFloat(avg.toFixed(1)),
      last5: last5.length > 0 ? last5 : [3, 2, 3, 2, 3],
    };
  } catch (err) {
    console.error("Error fetching H2H:", err);
    return { avg: 2.5, last5: [3, 2, 3, 2, 3] };
  }
}

async function fetchInjuries(
  homeTeamId: number,
  awayTeamId: number,
  apiKey: string
) {
  try {
    const [homeResponse, awayResponse] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/injuries?team=${homeTeamId}`, {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }),
      fetch(`https://v3.football.api-sports.io/injuries?team=${awayTeamId}`, {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      }),
    ]);

    const homeData = await homeResponse.json();
    const awayData = await awayResponse.json();

    const injuries: string[] = [];

    if (Array.isArray(homeData.response) && homeData.response.length > 0) {
      injuries.push(`${homeData.response.length} player(s) injured (home)`);
    }
    if (Array.isArray(awayData.response) && awayData.response.length > 0) {
      injuries.push(`${awayData.response.length} player(s) injured (away)`);
    }

    return injuries.length > 0 ? injuries : ["No major injury concerns"];
  } catch (err) {
    return ["Injury data unavailable"];
  }
}

function checkIfDerby(home: string, away: string): boolean {
  const derbies = [
    ["Manchester United", "Manchester City"],
    ["Barcelona", "Real Madrid"],
    ["Arsenal", "Tottenham"],
    ["Liverpool", "Everton"],
    ["Milan", "Inter"],
    ["Celtic", "Rangers"],
    ["Boca Juniors", "River Plate"],
  ];

  return derbies.some(
    (derby) =>
      (home.includes(derby[0]) && away.includes(derby[1])) ||
      (home.includes(derby[1]) && away.includes(derby[0]))
  );
}

function checkIfRivalry(home: string, away: string): boolean {
  const rivalries = [
    ["Liverpool", "Manchester United"],
    ["Arsenal", "Manchester United"],
    ["Chelsea", "Arsenal"],
    ["Real Madrid", "Atletico Madrid"],
    ["Bayern Munich", "Borussia Dortmund"],
  ];

  return rivalries.some(
    (rivalry) =>
      (home.includes(rivalry[0]) && away.includes(rivalry[1])) ||
      (home.includes(rivalry[1]) && away.includes(rivalry[0]))
  );
}

function determineMotivation(homeStats: { goalsScored: number }, awayStats: { goalsScored: number }, league: string): string {
  if (league.includes("Champions") || league.includes("Europa")) {
    return "European competition";
  }

  const avgGoals = (homeStats.goalsScored + awayStats.goalsScored) / 2;
  if (avgGoals > 2.5) return "title race potential";
  if (avgGoals < 1.5) return "relegation battle";
  return "mid-table clash";
}

function calculateGoalsPrediction(match: any) {
  let expectedGoals =
    (match.homeStats.goalsScored + match.homeStats.homePerf) / 2 +
    (match.awayStats.goalsScored + match.awayStats.awayPerf) / 2;

  const homeFormScore = match.homeStats.form.filter((r: string) => r === "W").length * 0.3;
  const awayFormScore = match.awayStats.form.filter((r: string) => r === "W").length * 0.2;
  expectedGoals += (homeFormScore + awayFormScore) * 0.5;

  expectedGoals = expectedGoals * 0.6 + match.h2h.avg * 0.4;

  if (match.isDerby) expectedGoals *= 1.15;
  if (match.isRivalry) expectedGoals *= 1.1;

  if (
    match.motivation.includes("title race") ||
    match.motivation.includes("European")
  ) {
    expectedGoals *= 1.05;
  }
  if (match.motivation.includes("relegation")) expectedGoals *= 1.08;
  if (match.motivation.includes("mid-table")) expectedGoals *= 0.95;

  if (match.injuries.some((i: string) => i.includes("injured"))) {
    const injuryCount = match.injuries.reduce((sum: number, i: string) => {
      const m = i.match(/(\d+) player/);
      return sum + (m ? parseInt(m[1]) : 0);
    }, 0);

    if (injuryCount > 3) expectedGoals *= 0.9;
    else if (injuryCount > 0) expectedGoals *= 0.95;
  }

  let prediction;
  if (expectedGoals >= 6.5) prediction = "7+";
  else if (expectedGoals >= 5.5) prediction = "6+";
  else if (expectedGoals >= 4.5) prediction = "5+";
  else if (expectedGoals >= 3.5) prediction = "4+";
  else prediction = "3+";

  const reasoning = generateReasoning(match, expectedGoals);

  return {
    prediction,
    expectedGoals: expectedGoals.toFixed(2),
    reasoning,
  };
}

function generateReasoning(match: any, expected: number): string {
  const reasons = [];

  if (match.homeStats.goalsScored > 2.5) reasons.push("Strong home attack");
  if (match.awayStats.goalsScored > 2.3) reasons.push("Potent away offense");
  if (match.h2h.avg > 4) reasons.push("High-scoring H2H history");
  if (match.isDerby || match.isRivalry) reasons.push("Derby/Rivalry intensity");
  if (
    match.motivation.includes("title") ||
    match.motivation.includes("European")
  ) {
    reasons.push("High stakes motivation");
  }

  return reasons.length > 0
    ? reasons.join(" • ")
    : "Standard match expectations";
}
