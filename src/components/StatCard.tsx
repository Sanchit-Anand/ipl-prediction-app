interface StatCardProps {
  label: string;
  value: string | number;
  helper?: string;
}

const StatCard = ({ label, value, helper }: StatCardProps) => {
  return (
    <div className="card-sheen rounded-2xl p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="text-3xl font-display mt-3">{value}</div>
      {helper && <p className="text-xs text-slate-400 mt-2">{helper}</p>}
    </div>
  );
};

export default StatCard;
