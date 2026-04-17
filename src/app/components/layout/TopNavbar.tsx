import { Search, Bell, Settings, Menu } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useUI } from "../../contexts/UIContext";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { unreadNotificationsCount } = useFinance();
  const { toggleSidebar } = useUI();

  return (
    <header className="h-20 fixed top-0 left-0 right-0 md:left-72 z-40 flex items-center justify-between px-4 md:px-8 gap-4 bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-indigo-950/80 backdrop-blur-2xl border-b border-slate-700/40 shadow-lg shadow-black/10">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile hamburger - enhanced with Lucide icon */}
        <button
          onClick={toggleSidebar}
          className="md:hidden shrink-0 w-10 h-10 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 flex items-center justify-center hover:bg-slate-700/70 hover:border-slate-600/70 transition-all duration-200 group"
        >
          <Menu className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </button>

        {/* Search - with animated focus glow */}
        {/* Search - with flex container for icon + input */}
        <div className="relative flex-1 group">
          {/* Focus glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-400/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

          {/* Flex container for icon and input */}
          <div
            className="flex items-center gap-3 
  bg-[#0F172A] 
  border border-[#2E3A59] 
  rounded-lg px-4 py-2.5 
  transition-all duration-200 ease-out
  focus-within:ring-2 focus-within:ring-[#7C3AED]/25
  focus-within:border-[#7C3AED]
  hover:border-[#6366F1]
"
          >
            <Search
              className="
    w-4 h-4 
    text-[#6B7280] 
    transition-colors duration-200 
    flex-shrink-0
    group-focus-within:text-[#7C3AED]
  "
            />

            <input
              type="text"
              placeholder="Search transactions, categories..."
              className="
      w-full bg-transparent 
      border-none outline-none 
      text-[#F1F5F9] 
      placeholder-[#6B7280] 
      text-sm font-medium
    "
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifications button with enhanced badge */}
        <Link
          to="/notifications"
          className="relative w-11 h-11 bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl flex items-center justify-center hover:bg-slate-700/70 hover:border-slate-600/70 hover:scale-105 transition-all duration-200 group"
        >
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-red-500/30 ring-2 ring-slate-900">
              {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Settings button */}
        <Link
          to="/settings"
          className="w-11 h-11 bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl flex items-center justify-center hover:bg-slate-700/70 hover:border-slate-600/70 hover:scale-105 transition-all duration-200 group"
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
        </Link>

        {/* Profile - hidden on mobile, visible on md+ */}
        <Link
          to="/settings"
          className="hidden md:flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 rounded-xl px-3 py-1.5 hover:bg-slate-700/70 hover:border-slate-600/70 transition-all duration-200 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="relative w-8 h-8 rounded-full object-cover border-2 border-violet-400/60 group-hover:border-violet-300 transition-colors"
              />
            ) : (
              <div className="relative w-8 h-8 bg-gradient-to-br from-violet-600 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white/20">
                {user?.name?.slice(0, 2).toUpperCase() || "JD"}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
            {user?.name || "Guest User"}
          </span>
        </Link>

        {/* Logout button - subtle but clear */}
        <button
          type="button"
          onClick={logout}
          className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/60"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
