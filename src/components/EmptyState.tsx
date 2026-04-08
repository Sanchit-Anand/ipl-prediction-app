interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className="card-sheen rounded-3xl p-8 text-center">
      <h3 className="text-2xl font-display">{title}</h3>
      <p className="text-sm text-slate-300 mt-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
