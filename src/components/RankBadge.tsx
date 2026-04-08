const RankBadge = ({ rank }: { rank: number }) => {
  const colors = ["bg-amber-400 text-ink", "bg-slate-300 text-ink", "bg-rose-300 text-ink"];
  if (rank <= 3) {
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-xl ${
          colors[rank - 1]
        }`}
      >
        {rank}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-semibold text-sm">
      {rank}
    </div>
  );
};

export default RankBadge;
