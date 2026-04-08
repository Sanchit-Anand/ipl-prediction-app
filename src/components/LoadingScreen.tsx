const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-200">
      <div className="card-sheen rounded-3xl px-8 py-6">
        <div className="text-2xl font-display text-glow">Loading...</div>
        <p className="text-sm text-slate-300 mt-2">
          Restoring your session.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
