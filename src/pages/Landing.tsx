import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen px-6 py-12 flex flex-col">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-gradient flex items-center justify-center font-display text-2xl text-ink">
            IPL
          </div>
          <div>
            <div className="font-display text-3xl tracking-wide">
              IPL ProPick
            </div>
            <p className="text-xs text-slate-400">Predict. Score. Lead.</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-white/10 text-sm uppercase tracking-[0.2em] text-slate-200 hover:bg-white/10"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full bg-accent-gradient text-ink text-sm uppercase tracking-[0.2em]"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              IPL Predictions
            </p>
            <h1 className="text-5xl sm:text-6xl font-display mt-4 text-glow">
              Pick winners. Stack points. Lead the board.
            </h1>
            <p className="text-base text-slate-200 mt-5 max-w-xl">
              One pick per match. One point per win. Simple and fast.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                to="/register"
                className="px-6 py-3 rounded-2xl bg-accent-gradient text-ink font-semibold uppercase tracking-[0.2em] text-sm"
              >
                Start Predicting
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl border border-white/10 text-slate-200 text-sm uppercase tracking-[0.2em]"
              >
                I already play
              </Link>
            </div>
          </div>
          <div className="card-sheen rounded-3xl p-6 space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              How it works
            </div>
            <h3 className="text-2xl font-display">Two taps per match.</h3>
            <p className="text-sm text-slate-300">
              Predictions open at 12:00 AM on match day and lock at start time.
            </p>
          </div>
        </div>
      </main>

      <div className="sm:hidden mt-8 flex gap-3 justify-center">
        <Link
          to="/login"
          className="px-5 py-2 rounded-full border border-white/10 text-sm uppercase tracking-[0.2em] text-slate-200 hover:bg-white/10"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 rounded-full bg-accent-gradient text-ink text-sm uppercase tracking-[0.2em]"
        >
          Register
        </Link>
      </div>
    </div>
  );
};

export default Landing;
