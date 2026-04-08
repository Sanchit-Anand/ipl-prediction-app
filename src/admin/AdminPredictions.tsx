import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchAdminPredictions } from "../lib/api";
import type { Prediction } from "../types";
import { predictionLabel } from "../utils/format";
import LoadingSkeleton from "../components/LoadingSkeleton";
import EmptyState from "../components/EmptyState";

const AdminPredictions = () => {
  const [predictions, setPredictions] = useState<
    (Prediction & { user?: { full_name: string | null; email: string | null } })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminPredictions();
        setPredictions(data);
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load predictions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (predictions.length === 0) {
    return (
      <EmptyState
        title="No predictions"
        description="Once users start picking, you will see them here."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-display">Prediction Overview</h2>
        <p className="text-sm text-slate-300 mt-1">
          All user predictions at a glance.
        </p>
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
                {prediction.user?.full_name ??
                  prediction.user?.email ??
                  "User"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                {predictionLabel(prediction.prediction_status)}
              </div>
              <div className="text-lg font-semibold mt-2">
                Picked {prediction.selected_team}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Points: {prediction.points_awarded}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPredictions;
