import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchLeaderboard } from "../lib/api";
import type { LeaderboardRow as Row } from "../types";
import LeaderboardRow from "../components/LeaderboardRow";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

const AdminLeaderboard = () => {
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
        title="Leaderboard empty"
        description="Predictions will populate this list."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">Leaderboard Overview</h2>
        <p className="text-sm text-slate-300 mt-1">
          Tie-breaks are applied by earliest prediction time.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <LeaderboardRow key={row.user_id} row={row} />
        ))}
      </div>
    </div>
  );
};

export default AdminLeaderboard;
