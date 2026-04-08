const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="card-sheen rounded-3xl p-6 animate-pulse"
        >
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-6 w-1/2 bg-white/10 rounded mt-4" />
          <div className="h-4 w-2/3 bg-white/10 rounded mt-2" />
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="h-10 bg-white/10 rounded-2xl" />
            <div className="h-10 bg-white/10 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
