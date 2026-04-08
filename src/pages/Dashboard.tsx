import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import {
  createPrediction,
  fetchMatches,
  fetchUserPredictionMap
} from "../lib/api";
import type { Match, Prediction } from "../types";
import MatchCard from "../components/MatchCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";
import { isMatchDayInIndia } from "../utils/date";

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Map<string, Prediction>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchData, predictionMap] = await Promise.all([
        fetchMatches(["upcoming", "live"]),
        user ? fetchUserPredictionMap(user.id) : Promise.resolve(new Map())
      ]);
      setMatches(matchData);
      setPredictions(predictionMap);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handlePredict = async (match: Match, team: string) => {
    if (!user) return;
    if (predictions.get(match.id)) {
      toast("You already predicted this match.");
      return;
    }
    if (!isMatchDayInIndia(match.match_time)) {
      toast("Predictions open at 12:00 AM on match day.");
      return;
    }
    if (new Date(match.lock_time).getTime() <= Date.now()) {
      toast.error("Predictions are locked.");
      return;
    }
    try {
      const newPrediction = await createPrediction(match.id, user.id, team);
      setPredictions((prev) => new Map(prev).set(match.id, newPrediction));
      toast.success("Prediction saved!");
    } catch (error: any) {
      toast.error(error.message ?? "Could not save prediction");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display">Upcoming Matches</h2>
          <p className="text-sm text-slate-300 mt-1">
            Picks open at midnight.
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No matches loaded"
          description="Matches will appear once fixtures are synced."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions.get(match.id)}
              onPredict={handlePredict}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
