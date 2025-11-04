// browser-friendly fetch wrapper for football API
const API_BASE = import.meta.env.VITE_FOOTBALL_API_URL || "https://v3.football.api-sports.io/";
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || import.meta.env.FOOTBALL_API_KEY;

type Fixture = any;

async function call(path: string, params?: Record<string,string|number>) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": url.host,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Football API error ${res.status}: ${body}`);
  }
  const json = await res.json();
  // Many API-Football responses put data in json.response
  return json.response ?? json;
}

export async function fetchUpcomingFixturesByLeague(leagueId:number, season:number, params?: Record<string,string|number>) {
  return call("/fixtures", { league: leagueId, season, ...params });
}

export async function fetchFixtureById(fixtureId:number) {
  return call("/fixtures", { id: fixtureId });
}

export default { fetchUpcomingFixturesByLeague, fetchFixtureById };
