import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { fetchAdminStats, syncMatches } from "../lib/api";
import StatCard from "../components/StatCard";
import AdminActionPanel from "../components/AdminActionPanel";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    completedMatches: 0,
    totalPredictions: 0,
    totalUsers: 0
  });
  const [syncing, setSyncing] = useState(false);

  const loadStats = async () => {
    const data = await fetchAdminStats();
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncMatches();
      toast.success(`Synced ${result?.upserted ?? 0} matches`);
      await loadStats();
    } catch (error: any) {
      toast.error(error.message ?? "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display">Admin Dashboard</h2>
          <p className="text-sm text-slate-300 mt-1">
            Manage matches, results, and leaderboards.
          </p>
        </div>
        <button
          onClick={handleSync}
          className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] bg-accent-gradient text-ink"
        >
          {syncing ? "Syncing..." : "Sync Matches"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Matches" value={stats.totalMatches} />
        <StatCard label="Active Matches" value={stats.liveMatches} />
        <StatCard label="Completed" value={stats.completedMatches} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Total Predictions" value={stats.totalPredictions} />
        <StatCard label="Total Users" value={stats.totalUsers} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminActionPanel
          title="Sync Fixtures"
          description="Pull upcoming IPL matches from your connected API."
          actionLabel="Run Sync"
          onAction={handleSync}
          busy={syncing}
        />
        <AdminActionPanel
          title="Manual Import"
          description="Paste a JSON array of fixtures in Match Management."
          actionLabel="Open Matches"
          onAction={() => navigate("/admin/matches")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/admin/matches"
          className="card-sheen rounded-3xl p-6 hover:bg-white/10 transition"
        >
          <h3 className="text-xl font-display">Match Management</h3>
          <p className="text-sm text-slate-300 mt-2">
            Edit fixtures, lock times, and status.
          </p>
        </Link>
        <Link
          to="/admin/results"
          className="card-sheen rounded-3xl p-6 hover:bg-white/10 transition"
        >
          <h3 className="text-xl font-display">Result Management</h3>
          <p className="text-sm text-slate-300 mt-2">
            Set winners and handle no-result games.
          </p>
        </Link>
        <Link
          to="/admin/predictions"
          className="card-sheen rounded-3xl p-6 hover:bg-white/10 transition"
        >
          <h3 className="text-xl font-display">Prediction Overview</h3>
          <p className="text-sm text-slate-300 mt-2">
            Review all predictions across users.
          </p>
        </Link>
        <Link
          to="/admin/leaderboard"
          className="card-sheen rounded-3xl p-6 hover:bg-white/10 transition"
        >
          <h3 className="text-xl font-display">Leaderboard Overview</h3>
          <p className="text-sm text-slate-300 mt-2">
            Monitor standings and tie-breakers.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
