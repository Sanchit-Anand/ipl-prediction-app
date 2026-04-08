const { createClient } = require("@supabase/supabase-js");

const DEFAULT_API_URL = "https://api.cricapi.com/v1";

const buildUrl = (base, path, params) => {
  const cleaned = base.replace(/\/+$/, "");
  const url = new URL(`${cleaned}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
};

const normalize = (value) => (value ?? "").toString().toLowerCase();

const mapResultType = (raw = "") => {
  const text = normalize(raw);
  if (text.includes("abandon") || text.includes("cancel")) return "abandoned";
  if (text.includes("no result") || text.includes("nr")) return "no_result";
  if (text.includes("tie") || text.includes("tied")) return "tie";
  return "normal";
};

const mapStatus = ({ statusText = "", matchStarted, matchEnded }) => {
  const text = normalize(statusText);
  if (text.includes("abandon") || text.includes("cancel")) return "abandoned";
  if (text.includes("no result") || text.includes("nr")) return "no_result";
  if (matchEnded || text.includes("result") || text.includes("won")) return "completed";
  if (matchStarted || text.includes("live") || text.includes("in progress")) return "live";
  return "upcoming";
};

const parseTeamsFromName = (name = "") => {
  const normalized = name.replace(/\s+/g, " ").trim();
  const separators = [" vs ", " v ", " vs. ", " v. "];
  for (const sep of separators) {
    if (normalize(normalized).includes(sep.trim())) {
      const parts = normalized.split(new RegExp(sep, "i"));
      if (parts.length === 2) {
        return [parts[0].trim(), parts[1].trim()];
      }
    }
  }
  return [null, null];
};

const extractTeams = (match) => {
  const teamInfo = Array.isArray(match.teamInfo) ? match.teamInfo : [];
  const teamsFromInfo = teamInfo
    .map((team) => team.name || team.teamName || team.shortname || team.shortName)
    .filter(Boolean);
  const teamsFromList = Array.isArray(match.teams) ? match.teams.filter(Boolean) : [];

  let team1 = teamsFromList[0] || teamsFromInfo[0];
  let team2 = teamsFromList[1] || teamsFromInfo[1];

  if (!team1 || !team2) {
    const [nameTeam1, nameTeam2] = parseTeamsFromName(match.name || "");
    team1 = team1 || nameTeam1;
    team2 = team2 || nameTeam2;
  }

  const team1Short =
    teamInfo[0]?.shortname || teamInfo[0]?.shortName || null;
  const team2Short =
    teamInfo[1]?.shortname || teamInfo[1]?.shortName || null;

  return { team1, team2, team1Short, team2Short };
};

const guessWinnerFromStatus = (statusText, team1, team2, team1Short, team2Short) => {
  const text = normalize(statusText);
  const t1 = normalize(team1);
  const t2 = normalize(team2);
  const s1 = normalize(team1Short);
  const s2 = normalize(team2Short);

  if (text.includes("won") || text.includes("beat") || text.includes("defeated")) {
    if (t1 && text.includes(t1)) return team1;
    if (t2 && text.includes(t2)) return team2;
    if (s1 && text.includes(s1)) return team1;
    if (s2 && text.includes(s2)) return team2;
  }
  return null;
};

const buildMatchPayload = (match, lockOffsetMinutes = 0) => {
  const { team1, team2, team1Short, team2Short } = extractTeams(match);
  const matchTime =
    match.dateTimeGMT || match.dateTime || match.date || match.startDate || match.startTime;

  if (!team1 || !team2 || !matchTime || !match.id) return null;

  const matchDate = new Date(matchTime);
  if (Number.isNaN(matchDate.getTime())) return null;

  const lockDate = new Date(matchDate.getTime());
  if (Number.isFinite(lockOffsetMinutes) && lockOffsetMinutes > 0) {
    lockDate.setMinutes(lockDate.getMinutes() - lockOffsetMinutes);
  }

  const statusText = match.status || match.statusText || match.matchStatus || "";
  const resultType = mapResultType(statusText);
  const status = mapStatus({
    statusText,
    matchStarted: match.matchStarted,
    matchEnded: match.matchEnded
  });
  const explicitWinner =
    match.winner || match.winningTeam || match.winner_team || match.winnerTeam;
  const winner =
    resultType === "normal"
      ? explicitWinner ||
        guessWinnerFromStatus(statusText, team1, team2, team1Short, team2Short)
      : null;

  return {
    external_match_id: String(match.id),
    season: match.series_name || match.seriesName || match.series || "IPL",
    team1,
    team2,
    team1_short: team1Short,
    team2_short: team2Short,
    match_time: matchDate.toISOString(),
    lock_time: lockDate.toISOString(),
    venue: match.venue || null,
    status,
    winner_team: winner,
    result_type: resultType,
    source: "cricketdata"
  };
};

const filterIplMatches = (matches, seriesName, seriesYear) => {
  const nameLower = normalize(seriesName || "Indian Premier League");
  const year = String(seriesYear || "2026");

  return matches.filter((match) => {
    const combined = `${match.series_name ?? ""} ${match.seriesName ?? ""} ${
      match.series ?? ""
    } ${match.name ?? ""}`.toLowerCase();
    const dateText = `${match.dateTimeGMT ?? ""} ${match.date ?? ""}`;
    const hasName = combined.includes(nameLower) || combined.includes("ipl");
    const hasYear = combined.includes(year) || dateText.includes(year);
    return hasName && hasYear;
  });
};

const fetchSeriesMatches = async ({ apiBase, apiKey, seriesId }) => {
  const url = buildUrl(apiBase, "series_info", {
    apikey: apiKey,
    id: seriesId,
    offset: 0
  });
  const response = await fetchJson(url);
  const data = response?.data || {};
  const list =
    data.matchList ||
    data.match_list ||
    data.matches ||
    response?.matchList ||
    response?.matches ||
    [];
  return Array.isArray(list) ? list : [];
};

const fetchMatchesList = async ({ apiBase, apiKey }) => {
  const url = buildUrl(apiBase, "matches", {
    apikey: apiKey,
    offset: 0
  });
  const response = await fetchJson(url);
  const list = response?.data || response?.matches || response || [];
  return Array.isArray(list) ? list : [];
};

const fetchMatchInfo = async ({ apiBase, apiKey, matchId }) => {
  const url = buildUrl(apiBase, "match_info", {
    apikey: apiKey,
    offset: 0,
    id: matchId
  });
  const response = await fetchJson(url);
  return response?.data || null;
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  if (process.env.SYNC_SECRET) {
    const incomingSecret = event.headers["x-sync-secret"];
    if (!incomingSecret || incomingSecret !== process.env.SYNC_SECRET) {
      return { statusCode: 401, body: "Unauthorized" };
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.CRICKET_API_KEY;
  const apiBase = (process.env.CRICKET_API_URL || DEFAULT_API_URL).trim();
  const seriesId = process.env.CRICKET_SERIES_ID;
  const seriesYear = process.env.CRICKET_SERIES_YEAR || "2026";
  const seriesName = process.env.CRICKET_SERIES_NAME || "Indian Premier League";
  const lockOffset = Number(process.env.PREDICTION_LOCK_MINUTES || "0");
  const maxInfoCalls = Number(process.env.CRICKET_MAX_INFO_CALLS || "25");

  if (!supabaseUrl || !supabaseServiceKey) {
    return { statusCode: 500, body: "Missing Supabase service credentials" };
  }
  if (!apiKey) {
    return { statusCode: 500, body: "Missing cricket API key" };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let matches = [];

    if (seriesId) {
      matches = await fetchSeriesMatches({ apiBase, apiKey, seriesId });
    }

    if (!matches.length) {
      const list = await fetchMatchesList({ apiBase, apiKey });
      matches = filterIplMatches(list, seriesName, seriesYear);
    }

    if (!matches.length) {
      return {
        statusCode: 404,
        body:
          "No IPL matches found. Set CRICKET_SERIES_ID or check CRICKET_SERIES_NAME/YEAR."
      };
    }

    let infoCalls = 0;
    const mapped = [];

    for (const match of matches) {
      let current = match;
      const payload = buildMatchPayload(current, lockOffset);
      const needsInfo =
        (!payload || (!payload.winner_team && payload.status === "completed")) &&
        infoCalls < maxInfoCalls;

      if (needsInfo && match.id) {
        const info = await fetchMatchInfo({
          apiBase,
          apiKey,
          matchId: match.id
        });
        if (info) {
          infoCalls += 1;
          current = { ...current, ...info };
        }
      }

      const finalPayload = buildMatchPayload(current, lockOffset);
      if (finalPayload) {
        mapped.push(finalPayload);
      }
    }

    const { data: upserted, error } = await supabase
      .from("matches")
      .upsert(mapped, { onConflict: "external_match_id" })
      .select();
    if (error) {
      return { statusCode: 500, body: error.message };
    }

    const toScore = (upserted || []).filter((row) => {
      const original = mapped.find(
        (item) => item.external_match_id === row.external_match_id
      );
      return (
        original &&
        (original.result_type !== "normal" || Boolean(original.winner_team))
      );
    });

    for (const row of toScore) {
      const original = mapped.find(
        (item) => item.external_match_id === row.external_match_id
      );
      if (!original) continue;
      await supabase.rpc("set_match_result", {
        p_match_id: row.id,
        p_winner_team: original.winner_team,
        p_result_type: original.result_type
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        upserted: mapped.length,
        scored: toScore.length,
        infoCalls
      })
    };
  } catch (error) {
    return { statusCode: 500, body: error.message || "Sync error" };
  }
};
