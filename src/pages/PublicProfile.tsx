import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchLeaderboardRow, fetchPublicProfile } from "../lib/api";
import StatCard from "../components/StatCard";
import LoadingSkeleton from "../components/LoadingSkeleton";

type PublicProfileData = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

const PublicProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [profileData, statsData] = await Promise.all([
          fetchPublicProfile(id),
          fetchLeaderboardRow(id)
        ]);
        setProfile(profileData);
        setStats(statsData);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card-sheen rounded-3xl p-6">
          <p className="text-slate-300">Profile not found.</p>
          <Link to="/chat" className="text-white mt-4 inline-block">
            Back to chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/chat" className="text-sm text-slate-300">
        ← Back to chat
      </Link>
      <div className="card-sheen rounded-3xl p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Player
        </div>
        <h2 className="text-3xl font-display mt-2">
          {profile.full_name ?? "IPL Fan"}
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Joined: {new Date(profile.created_at).toDateString()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Rank" value={`#${stats?.rank ?? "--"}`} />
        <StatCard label="Points" value={stats?.total_points ?? 0} />
        <StatCard
          label="Correct Picks"
          value={stats?.correct_predictions ?? 0}
        />
      </div>
    </div>
  );
};

export default PublicProfile;
