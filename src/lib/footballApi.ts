// browser-friendly fetch wrapper for football API
const API_BASE = import.meta.env.VITE_FOOTBALL_API_URL || "https://v3.football.api-sports.io/";
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || import.meta.env.FOOTBALL_API_KEY;

type Fixture = any;

async function call(path: string, params?: Record<string,string|number>) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  console.log('🔍 API Request:', url.toString());
  console.log('🔑 API Key exists:', !!API_KEY);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": API_KEY,
      "x-rapidapi-host": url.host,
    },
  });

  console.log('📊 API Response Status:', res.status);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Football API error ${res.status}: ${body}`);
  }
  const json = await res.json();
  const data = json.response ?? json;
  console.log('📋 API Response Data:', data);
  console.log('📊 Number of fixtures:', Array.isArray(data) ? data.length : 'Not an array');
  return data;
}

export async function fetchUpcomingFixturesByLeague(leagueId:number, season:number, params?: Record<string,string|number>) {
  return call("/fixtures", { league: leagueId, season, ...params });
}

export async function fetchFixtureById(fixtureId:number) {
  return call("/fixtures", { id: fixtureId });
}

export async function fetchAllFixtures(season:number, params?: Record<string,string|number>) {
  return call("/fixtures", { season, ...params });
}

export { call };

// Alternative API - TheSportsDB (completely free)
export async function testAlternativeAPI() {
  const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4328&s=2024');
  const data = await response.json();
  console.log('Alternative API response:', data);
  return data;
}

export default { fetchUpcomingFixturesByLeague, fetchFixtureById, fetchAllFixtures, testAlternativeAPI };
