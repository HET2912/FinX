import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  TrendingUp,
  Target,
  Users,
  MessageCircle,
  Bell,
  Settings,
  Sparkles,
  Handshake,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useFinance } from "../../contexts/FinanceContext";
import { useUI } from "../../contexts/UIContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Savings", href: "/investments", icon: TrendingUp },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "AI Advisor", href: "/ai", icon: Sparkles },
  { name: "Group Expense", href: "/groups", icon: Users },
  { name: "1-to-1 split", href: "/onetoone", icon: Handshake },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { unreadNotificationsCount } = useFinance();
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72
        bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-indigo-950/95
        backdrop-blur-2xl
        border-r border-slate-700/40
        shadow-2xl shadow-black/30
        flex flex-col
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Logo + mobile close button */}
      <div className="relative px-7 py-5 border-b border-slate-700/40 flex items-center justify-between">
        {/* Animated background glow behind logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-cyan-400/10 blur-2xl -z-10" />

        <Link
          to="/dashboard"
          className="group flex items-center gap-1 transition-transform hover:scale-[1.02]"
        >
          <div className="h-9 w-full flex items-center">
            <img
              src="/FinX_Logo.png"
              alt="Finx Logo"
              className="
      h-full
      w-auto
      object-contain
      scale-125
      origin-left
    "
            />
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-0 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const isNotifications = item.name === "Notifications";

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => {
                // close sidebar on mobile after navigation
                if (window.innerWidth < 768) closeSidebar();
              }}
              className={`
                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 to-cyan-400/10 text-white shadow-lg shadow-violet-900/20 border-l-2 border-violet-400"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                }
              `}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/0 via-violet-600/0 to-cyan-400/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

              <item.icon
                className={`w-5 h-5 transition-all duration-200 ${
                  isActive
                    ? "text-violet-300"
                    : "text-slate-400 group-hover:text-violet-300"
                }`}
              />
              <span className="flex-1 font-medium tracking-wide md:text-sm">
                {item.name}
              </span>

              {/* Notification badge */}
              {isNotifications && user && unreadNotificationsCount > 0 && (
                <span className="relative flex items-center justify-center">
                  <span className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-60" />
                  <span className="relative min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
                    {unreadNotificationsCount > 99
                      ? "99+"
                      : unreadNotificationsCount}
                  </span>
                </span>
              )}

              {/* Active indicator dot (alternative to border-left on desktop) */}
              {isActive && (
                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-slate-700/40 bg-gradient-to-t from-slate-950/50 to-transparent">
        <div className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/60 transition-all duration-300">
          {/* Glow effect on hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />

          {user?.profilePicture ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <img
                src={user.profilePicture}
                alt={user.name}
                className="relative w-10 h-10 rounded-full object-cover border-2 border-violet-400/60 group-hover:border-violet-300 transition-colors"
              />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white/20">
                {user?.name?.slice(0, 2).toUpperCase() || "JD"}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.name || "Guest User"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {user?.email || "guest@finx.app"}
            </p>
          </div>

          {/* Subtle edit/expand icon */}
          <div className="w-5 h-5 rounded-full bg-slate-700/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] text-slate-300">▼</span>
          </div>
        </div>
      </div>

      {/* Only mobile-specific adjustments - just the sidebar width and close button visibility */}
      <style>{`
        @media (max-width: 768px) {
          /* Keep sidebar readable on mobile - no text size reduction */
          .w-72 {
            width: 14rem;
          }
        }
      `}</style>
    </aside>
  );
}
