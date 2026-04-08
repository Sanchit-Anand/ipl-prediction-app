import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const linkClass =
  "text-sm uppercase tracking-[0.2em] text-slate-300 hover:text-white transition";
const activeClass = "text-white";

const Navbar = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 px-4 sm:px-8 lg:px-16 py-4 glass">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center font-display text-xl text-ink">
            IPL
          </div>
          <div>
            <div className="font-display text-2xl tracking-wide">
              IPL ProPick
            </div>
            <p className="text-xs text-slate-400">Predict. Score. Lead.</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Matches
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Leaderboard
          </NavLink>
          <NavLink
            to="/predictions"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            My Picks
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Chat
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Alerts
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Profile
          </NavLink>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm text-slate-300">
            Hey, {profile?.full_name ?? "Player"}
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-xs uppercase tracking-[0.2em] rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
