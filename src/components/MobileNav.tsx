import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const linkStyle =
  "flex flex-col items-center text-[10px] uppercase tracking-[0.2em] text-slate-400";
const activeStyle = "text-white";

const MobileNav = () => {
  const { signOut } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 glass rounded-2xl px-4 py-3 flex items-center justify-between">
      {[
        { label: "Matches", path: "/dashboard" },
        { label: "Board", path: "/leaderboard" },
        { label: "Picks", path: "/predictions" },
        { label: "Chat", path: "/chat" },
        { label: "Profile", path: "/profile" }
      ].map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : ""}`
          }
        >
          <span className="font-display text-base">{item.label[0]}</span>
          {item.label}
        </NavLink>
      ))}
      <button onClick={signOut} className={`${linkStyle} text-rose-200`}>
        <span className="font-display text-base">X</span>
        Logout
      </button>
    </nav>
  );
};

export default MobileNav;
