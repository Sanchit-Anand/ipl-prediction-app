import type { Match, Prediction } from "../types";
import { formatMatchTime, isLocked } from "../utils/date";
import PredictionButton from "./PredictionButton";

interface TodayMatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict: (match: Match, team: string) => void;
}

const TodayMatchCard = ({ match, prediction, onPredict }: TodayMatchCardProps) => {
  const locked = isLocked(match.lock_time);
  const predictedTeam = prediction?.selected_team;

  return (
    <div className="card-sheen rounded-3xl p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Today
          </p>
          <h3 className="text-2xl font-semibold mt-2">
            {match.team1} vs {match.team2}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {match.venue ?? "Venue TBA"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-200">
            {formatMatchTime(match.match_time)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {locked ? "Locked" : "Open now"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PredictionButton
          team={match.team1}
          selected={predictedTeam === match.team1}
          disabled={locked || Boolean(predictedTeam)}
          onClick={() => onPredict(match, match.team1)}
        />
        <PredictionButton
          team={match.team2}
          selected={predictedTeam === match.team2}
          disabled={locked || Boolean(predictedTeam)}
          onClick={() => onPredict(match, match.team2)}
        />
      </div>
    </div>
  );
};

export default TodayMatchCard;
