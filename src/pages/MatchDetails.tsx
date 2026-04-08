import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { fetchMatchById, createPrediction } from "../lib/api";
import { supabase } from "../lib/supabaseClient";
import type { Match, Prediction } from "../types";
import { formatMatchTime, isLocked, isMatchDayInIndia } from "../utils/date";
import { statusLabel } from "../utils/format";
import PredictionButton from "../components/PredictionButton";
import LoadingSkeleton from "../components/LoadingSkeleton";

const MatchDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatch = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const matchData = await fetchMatchById(id);
        setMatch(matchData);
        if (user) {
          const { data } = await supabase
            .from("predictions")
            .select("*")
            .eq("user_id", user.id)
            .eq("match_id", id)
            .maybeSingle();
          setPrediction((data as Prediction) ?? null);
        }
      } catch (error: any) {
        toast.error(error.message ?? "Could not load match");
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [id, user]);

  const handlePredict = async (team: string) => {
    if (!match || !user) return;
    if (prediction) {
      toast("You already predicted this match.");
      return;
    }
    if (!isMatchDayInIndia(match.match_time)) {
      toast("Predictions open at 12:00 AM on match day.");
      return;
    }
    if (isLocked(match.lock_time)) {
      toast.error("Predictions are locked.");
      return;
    }
    try {
      const newPrediction = await createPrediction(match.id, user.id, team);
      setPrediction(newPrediction);
      toast.success("Prediction saved!");
    } catch (error: any) {
      toast.error(error.message ?? "Could not save prediction");
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!match) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card-sheen rounded-3xl p-6">
          <p className="text-slate-300">Match not found.</p>
          <Link to="/dashboard" className="text-white mt-4 inline-block">
            Back to matches
          </Link>
        </div>
      </div>
    );
  }

  const locked = isLocked(match.lock_time);
  const isMatchDay = isMatchDayInIndia(match.match_time);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/dashboard" className="text-sm text-slate-300">
        ← Back to matches
      </Link>
      <div className="card-sheen rounded-3xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {match.season ?? "IPL Season"}
            </p>
            <h2 className="text-3xl font-display mt-2">
              {match.team1} vs {match.team2}
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              {match.venue ?? "Venue TBA"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {statusLabel(match.status)}
            </div>
            <div className="text-sm text-slate-200 mt-2">
              {formatMatchTime(match.match_time)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Lock time: {formatMatchTime(match.lock_time)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PredictionButton
            team={match.team1}
            selected={prediction?.selected_team === match.team1}
            disabled={locked || Boolean(prediction) || !isMatchDay}
            onClick={() => handlePredict(match.team1)}
          />
          <PredictionButton
            team={match.team2}
            selected={prediction?.selected_team === match.team2}
            disabled={locked || Boolean(prediction) || !isMatchDay}
            onClick={() => handlePredict(match.team2)}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-slate-300">
          <span>
            {prediction
              ? `You picked ${prediction.selected_team}`
              : "No prediction yet."}
          </span>
          <span>
            {locked ? "Locked" : isMatchDay ? "1 point on win" : "Opens at midnight"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
