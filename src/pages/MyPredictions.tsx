import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { fetchUserPredictions } from "../lib/api";
import type { Prediction } from "../types";
import { formatMatchTime } from "../utils/date";
import { predictionLabel } from "../utils/format";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

const MyPredictions = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await fetchUserPredictions(user.id);
        setPredictions(data);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (predictions.length === 0) {
    return (
      <EmptyState
        title="No predictions yet"
        description="Start with the upcoming matches and lock in your first pick."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">My Predictions</h2>
        <p className="text-sm text-slate-300 mt-1">All your picks.</p>
      </div>
      <div className="space-y-4">
        {predictions.map((prediction) => (
          <div
            key={prediction.id}
            className="card-sheen rounded-3xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="text-lg font-semibold">
                {prediction.match?.team1} vs {prediction.match?.team2}
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {prediction.match?.venue ?? "Venue TBA"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {prediction.match?.match_time
                  ? formatMatchTime(prediction.match.match_time)
                  : "Time TBA"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                {predictionLabel(prediction.prediction_status)}
              </div>
              <div className="text-lg font-semibold mt-2">
                Picked {prediction.selected_team}
              </div>
              <div className="text-sm text-slate-300 mt-1">
                Points: {prediction.points_awarded}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPredictions;
