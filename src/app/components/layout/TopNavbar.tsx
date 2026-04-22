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

        {/* Search - with flex container for icon + input */}
        <div className="relative flex-1 group">
          {/* Focus glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-400/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

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

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Header sizing */
          .h-20 {
            height: 3.5rem;
          }
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .gap-4 {
            gap: 0.5rem;
          }
          .gap-3 {
            gap: 0.375rem;
          }
          
          /* Hamburger button */
          .w-10 {
            width: 2rem;
          }
          .h-10 {
            height: 2rem;
          }
          
          /* Search container */
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-2\\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .gap-3 {
            gap: 0.375rem;
          }
          
          /* Icon sizing */
          .w-4 {
            width: 0.75rem;
          }
          .h-4 {
            height: 0.75rem;
          }
          .w-5 {
            width: 0.875rem;
          }
          .h-5 {
            height: 0.875rem;
          }
          .w-8 {
            width: 1.25rem;
          }
          .h-8 {
            height: 1.25rem;
          }
          .w-11 {
            width: 2rem;
          }
          .h-11 {
            height: 2rem;
          }
          
          /* Typography */
          .text-sm {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .text-xs {
            font-size: 0.625rem;
            line-height: 0.875rem;
          }
          .text-\\[11px\\] {
            font-size: 0.5625rem;
          }
          
          /* Notification badge */
          .min-w-\\[22px\\] {
            min-width: 1rem;
          }
          .h-\\[22px\\] {
            height: 1rem;
          }
          .px-1\\.5 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          .-top-1\\.5 {
            top: -0.25rem;
          }
          .-right-1\\.5 {
            right: -0.25rem;
          }
          
          /* Profile section (hidden on mobile anyway, but adjusted if ever shown) */
          .px-3 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-1\\.5 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          
          /* Logout button */
          .px-2 {
            padding-left: 0.375rem;
            padding-right: 0.375rem;
          }
          .py-1 {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
          }
          
          /* Border radius adjustments */
          .rounded-xl {
            border-radius: 0.5rem;
          }
          .rounded-lg {
            border-radius: 0.375rem;
          }
        }
      `}</style>
    </header>
  );
}
