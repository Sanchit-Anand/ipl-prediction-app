import { Link } from "react-router-dom";
import type { Match, Prediction } from "../types";
import { formatShortTime, isLocked, isMatchDayInIndia } from "../utils/date";
import { statusLabel } from "../utils/format";
import CountdownTimer from "./CountdownTimer";
import PredictionButton from "./PredictionButton";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict: (match: Match, team: string) => void;
}

const MatchCard = ({ match, prediction, onPredict }: MatchCardProps) => {
  const locked = isLocked(match.lock_time);
  const isMatchDay = isMatchDayInIndia(match.match_time);
  const predictedTeam = prediction?.selected_team;

  return (
    <div className="card-sheen rounded-3xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">
            {match.season ?? "IPL Season"}
          </p>
          <h3 className="text-xl font-semibold mt-2">
            {match.team1} vs {match.team2}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {match.venue ?? "Venue TBA"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {statusLabel(match.status)}
          </div>
          <div className="text-sm text-slate-200 mt-2">
            {formatShortTime(match.match_time)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Locks <CountdownTimer lockTime={match.lock_time} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <PredictionButton
          team={match.team1}
          selected={predictedTeam === match.team1}
          disabled={locked || Boolean(predictedTeam) || !isMatchDay}
          onClick={() => onPredict(match, match.team1)}
        />
        <PredictionButton
          team={match.team2}
          selected={predictedTeam === match.team2}
          disabled={locked || Boolean(predictedTeam) || !isMatchDay}
          onClick={() => onPredict(match, match.team2)}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {locked
            ? "Predictions closed"
            : isMatchDay
            ? "1 point on win"
            : "Opens at midnight"}
        </span>
        <Link
          to={`/matches/${match.id}`}
          className="text-slate-200 hover:text-white transition"
        >
          Details →
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
