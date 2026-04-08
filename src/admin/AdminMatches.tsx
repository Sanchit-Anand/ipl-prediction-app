import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { deleteMatch, fetchMatches, upsertMatch } from "../lib/api";
import type { Match } from "../types";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import { supabase } from "../lib/supabaseClient";

const emptyForm = {
  id: "",
  season: "",
  team1: "",
  team2: "",
  team1_short: "",
  team2_short: "",
  match_time: "",
  lock_time: "",
  venue: "",
  status: "upcoming",
  winner_team: "",
  result_type: "normal",
  source: "manual"
};

const toLocalInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const AdminMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm });
  const [importText, setImportText] = useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await fetchMatches();
      setMatches(data);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleEdit = (match: Match) => {
    setForm({
      id: match.id,
      season: match.season ?? "",
      team1: match.team1,
      team2: match.team2,
      team1_short: match.team1_short ?? "",
      team2_short: match.team2_short ?? "",
      match_time: toLocalInputValue(match.match_time),
      lock_time: toLocalInputValue(match.lock_time),
      venue: match.venue ?? "",
      status: match.status,
      winner_team: match.winner_team ?? "",
      result_type: match.result_type ?? "normal",
      source: match.source ?? "manual"
    });
  };

  const resetForm = () => setForm({ ...emptyForm });

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!form.team1 || !form.team2 || !form.match_time || !form.lock_time) {
        toast.error("Teams, match time, and lock time are required.");
        return;
      }
      const payload = {
        id: form.id || undefined,
        season: form.season || null,
        team1: form.team1,
        team2: form.team2,
        team1_short: form.team1_short || null,
        team2_short: form.team2_short || null,
        match_time: new Date(form.match_time).toISOString(),
        lock_time: new Date(form.lock_time).toISOString(),
        venue: form.venue || null,
        status: form.status,
        winner_team: form.winner_team || null,
        result_type: form.result_type || null,
        source: form.source || "manual"
      };
      await upsertMatch(payload as Partial<Match>);
      toast.success("Match saved");
      resetForm();
      await loadMatches();
    } catch (error: any) {
      toast.error(error.message ?? "Failed to save match");
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await deleteMatch(matchId);
      toast.success("Match deleted");
      await loadMatches();
    } catch (error: any) {
      toast.error(error.message ?? "Failed to delete match");
    }
  };

  const handleImport = async () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        toast.error("Paste a JSON array of matches");
        return;
      }
      const payload = parsed.map((item) => ({
        season: item.season ?? null,
        team1: item.team1 ?? item.teamA ?? "",
        team2: item.team2 ?? item.teamB ?? "",
        team1_short: item.team1_short ?? null,
        team2_short: item.team2_short ?? null,
        match_time: item.match_time
          ? new Date(item.match_time).toISOString()
          : null,
        lock_time: item.lock_time
          ? new Date(item.lock_time).toISOString()
          : item.match_time
          ? new Date(item.match_time).toISOString()
          : null,
        venue: item.venue ?? null,
        status: item.status ?? "upcoming",
        result_type: item.result_type ?? null,
        winner_team: item.winner_team ?? null,
        source: "manual"
      }));

      const { error } = await supabase.from("matches").upsert(payload);
      if (error) throw error;
      toast.success(`Imported ${payload.length} matches`);
      setImportText("");
      await loadMatches();
    } catch (error: any) {
      toast.error(error.message ?? "Import failed");
    }
  };

  const sortedMatches = useMemo(
    () =>
      [...matches].sort(
        (a, b) => new Date(a.match_time).getTime() - new Date(b.match_time).getTime()
      ),
    [matches]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">Match Management</h2>
        <p className="text-sm text-slate-300 mt-1">
          Create, edit, and lock fixtures.
        </p>
      </div>

      <form onSubmit={handleSave} className="card-sheen rounded-3xl p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Team 1
            </label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.team1}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, team1: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Team 2
            </label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.team2}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, team2: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Match Time
            </label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.match_time}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  match_time: event.target.value
                }))
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Lock Time
            </label>
            <input
              type="datetime-local"
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.lock_time}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  lock_time: event.target.value
                }))
              }
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Season
            </label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.season}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, season: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Venue
            </label>
            <input
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.venue}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, venue: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Status
            </label>
            <select
              className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
              <option value="no_result">No Result</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="px-5 py-2 rounded-full bg-accent-gradient text-ink text-xs uppercase tracking-[0.2em]"
          >
            {form.id ? "Update Match" : "Create Match"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em]"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="card-sheen rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-xl font-display">Manual Import</h3>
          <p className="text-xs text-slate-400 mt-1">
            Paste a JSON array of match objects to import quickly.
          </p>
        </div>
        <textarea
          className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-xs min-h-[140px]"
          placeholder='[{"team1":"MI","team2":"CSK","match_time":"2026-04-10T14:00:00Z","lock_time":"2026-04-10T13:45:00Z"}]'
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
        />
        <button
          type="button"
          onClick={handleImport}
          className="px-5 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em]"
        >
          Import Matches
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Use the form above to add fixtures."
        />
      ) : (
        <div className="space-y-4">
          {sortedMatches.map((match) => (
            <div
              key={match.id}
              className="card-sheen rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div className="text-lg font-semibold">
                  {match.team1} vs {match.team2}
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  {match.venue ?? "Venue TBA"}
                </p>
                <p className="text-xs text-slate-400 mt-1">{match.status}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(match)}
                  className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] bg-rose-500/20 text-rose-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
