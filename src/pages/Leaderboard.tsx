import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { fetchLeaderboard } from "../lib/api";
import type { LeaderboardRow as Row } from "../types";
import LeaderboardRow from "../components/LeaderboardRow";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import RankBadge from "../components/RankBadge";

const Leaderboard = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard();
        setRows(data);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No leaderboard yet"
        description="As predictions roll in, rankings will appear here."
      />
    );
  }

  const topThree = rows.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">Leaderboard</h2>
        <p className="text-sm text-slate-300 mt-1">Early picks win ties.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topThree.map((row) => (
          <div key={row.user_id} className="card-sheen rounded-3xl p-6">
            <RankBadge rank={row.rank} />
            <div className="mt-4">
              <div className="text-lg font-semibold">
                {row.full_name ?? row.email ?? "Anonymous"}
              </div>
              <div className="text-sm text-slate-400">
                {row.correct_predictions} correct picks
              </div>
              <div className="text-3xl font-display mt-4 text-glow">
                {row.total_points}
              </div>
              <p className="text-xs text-slate-400">points</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <LeaderboardRow
            key={row.user_id}
            row={row}
            highlight={row.user_id === user?.id}
            linkTo={`/users/${row.user_id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
