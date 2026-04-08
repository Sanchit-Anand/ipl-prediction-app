import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchMatches, setMatchResult } from "../lib/api";
import type { Match } from "../types";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

interface ResultDraft {
  winner_team: string | null;
  result_type: string;
}

const AdminResults = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ResultDraft>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchMatches();
      setMatches(data);
      const initialDrafts: Record<string, ResultDraft> = {};
      data.forEach((match) => {
        initialDrafts[match.id] = {
          winner_team: match.winner_team,
          result_type: match.result_type ?? "normal"
        };
      });
      setDrafts(initialDrafts);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (match: Match) => {
    const draft = drafts[match.id];
    if (!draft) return;
    try {
      await setMatchResult({
        matchId: match.id,
        winnerTeam:
          draft.result_type === "normal" ? draft.winner_team : null,
        resultType: draft.result_type
      });
      toast.success("Result saved");
      await load();
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update result");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (matches.length === 0) {
    return (
      <EmptyState
        title="No matches"
        description="Sync or create matches before setting results."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">Result Management</h2>
        <p className="text-sm text-slate-300 mt-1">
          Set winners or mark matches as no result.
        </p>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const draft = drafts[match.id];
          return (
            <div
              key={match.id}
              className="card-sheen rounded-3xl p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">
                    {match.team1} vs {match.team2}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Status: {match.status}
                  </p>
                </div>
                <button
                  onClick={() => handleSave(match)}
                  className="px-4 py-2 rounded-full bg-accent-gradient text-ink text-xs uppercase tracking-[0.2em]"
                >
                  Save Result
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Result Type
                  </label>
                  <select
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    value={draft?.result_type ?? "normal"}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [match.id]: {
                          winner_team: prev[match.id]?.winner_team ?? null,
                          result_type: event.target.value
                        }
                      }))
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="abandoned">Abandoned</option>
                    <option value="no_result">No Result</option>
                    <option value="tie">Tie</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Winner
                  </label>
                  <select
                    className="mt-2 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
                    value={draft?.winner_team ?? ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [match.id]: {
                          winner_team: event.target.value,
                          result_type: prev[match.id]?.result_type ?? "normal"
                        }
                      }))
                    }
                    disabled={draft?.result_type !== "normal"}
                  >
                    <option value="">Select winner</option>
                    <option value={match.team1}>{match.team1}</option>
                    <option value={match.team2}>{match.team2}</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminResults;
