import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { fetchLeaderboardRow } from "../lib/api";
import type { LeaderboardRow } from "../types";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import LoadingSkeleton from "../components/LoadingSkeleton";

const Profile = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await fetchLeaderboardRow(user.id);
        setStats(data);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load profile stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card-sheen rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Profile
          </p>
          <h2 className="text-3xl font-display mt-2">
            {profile?.full_name ?? "IPL Player"}
          </h2>
          <p className="text-sm text-slate-300 mt-1">{profile?.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-400">
            Rank
            <div className="text-3xl font-display text-glow">
              #{stats?.rank ?? "--"}
            </div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div className="text-sm text-slate-400">
            Points
            <div className="text-3xl font-display text-glow">
              {stats?.total_points ?? 0}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/notifications"
          className="px-4 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em]"
        >
          Notifications
        </Link>
        <Link
          to="/predictions"
          className="px-4 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em]"
        >
          My Picks
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Correct Picks"
          value={stats?.correct_predictions ?? 0}
          helper="1 point per correct prediction."
        />
        <StatCard
          label="Total Picks"
          value={stats?.total_predictions ?? 0}
          helper="Make your picks early to break ties."
        />
        <StatCard
          label="Win Rate"
          value={`${stats?.win_rate?.toFixed(1) ?? "0"}%`}
          helper="Based on completed matches."
        />
      </div>
    </div>
  );
};

export default Profile;
