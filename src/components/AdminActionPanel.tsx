interface AdminActionPanelProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
}

const AdminActionPanel = ({
  title,
  description,
  actionLabel,
  onAction,
  busy
}: AdminActionPanelProps) => {
  return (
    <div className="card-sheen rounded-3xl p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-display">{title}</h3>
        <p className="text-sm text-slate-300 mt-2">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="px-5 py-2 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em] self-start"
      >
        {busy ? "Working..." : actionLabel}
      </button>
    </div>
  );
};

export default AdminActionPanel;
