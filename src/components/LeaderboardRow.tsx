import clsx from "clsx";
import { Link } from "react-router-dom";
import type { LeaderboardRow as Row } from "../types";
import RankBadge from "./RankBadge";
import { initials } from "../utils/format";

const LeaderboardRow = ({
  row,
  highlight,
  linkTo
}: {
  row: Row;
  highlight?: boolean;
  linkTo?: string;
}) => {
  const Wrapper = linkTo ? Link : "div";
  const wrapperProps = linkTo ? { to: linkTo } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={clsx(
        "flex items-center justify-between gap-4 px-4 py-3 rounded-2xl",
        highlight ? "bg-white/10" : "bg-white/5"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <RankBadge rank={row.rank} />
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
          {initials(row.full_name ?? row.email)}
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">
            {row.full_name ?? row.email ?? "Anonymous"}
          </div>
          <div className="text-xs text-slate-400">
            {row.correct_predictions} correct / {row.total_predictions} picks
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-display text-glow">
          {row.total_points}
        </div>
        <div className="text-xs text-slate-400">points</div>
      </div>
    </Wrapper>
  );
};

export default LeaderboardRow;
