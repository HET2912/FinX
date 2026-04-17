import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCheck,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";

type NotificationItem = {
  _id: string;
  type: "warning" | "info" | "success" | "group" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const getIcon = (type: string) => {
  switch (type) {
    case "warning":
      return AlertTriangle;
    case "info":
      return Info;
    case "success":
      return TrendingUp;
    case "group":
      return Users;
    case "error":
      return AlertTriangle;
    default:
      return Bell;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case "warning":
      return "#F59E0B";
    case "info":
      return "#22D3EE";
    case "success":
      return "#10B981";
    case "group":
      return "#7C3AED";
    case "error":
      return "#EF4444";
    default:
      return "#22D3EE";
  }
};

export function Notifications() {
  const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useFinance();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async (pageNum = 1) => {
    try {
      const data = await getNotifications(pageNum, 20);
      if (pageNum === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...data.notifications]);
      }
      setUnreadCount(data.unreadCount || 0);
      setHasMore(data.notifications.length === 20);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 10 seconds for new notifications
    const interval = setInterval(() => {
      loadNotifications(1);
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === notificationId);
        if (!target || target.read) {
          return prev;
        }

        setUnreadCount((count) => Math.max(0, count - 1));
        return prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n,
        );
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const target = notifications.find((n) => n._id === notificationId);
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      if (target && !target.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Stay Updated
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              {unreadCount > 0 ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                  </span>
                  {unreadCount} unread
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  All caught up!
                </>
              )}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* ── Notifications List ──────────────────────────────────── */}
        <div className="space-y-2">
          {notifications.map((notification) => {
            const IconComponent = getIcon(notification.type);
            const color = getColor(notification.type);
            const isUnread = !notification.read;

            return (
              <div
                key={notification._id}
                onClick={() => isUnread && handleMarkAsRead(notification._id)}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
                  isUnread
                    ? "bg-slate-900/60 border-violet-500/30 hover:border-violet-500/50"
                    : "bg-slate-900/60 border-slate-800/60 hover:border-slate-700/80"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${color}15`,
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-semibold truncate ${
                            isUnread ? "text-white" : "text-slate-300"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          {isUnread && (
                            <span className="relative flex h-2 w-2 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification._id);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-slate-500 text-[10px] flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
                          {new Date(notification.createdAt).toLocaleString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {isUnread && (
                          <span className="text-[10px] text-violet-400 font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Load More Button ────────────────────────────────────── */}
        {hasMore && (
          <div className="text-center pt-2">
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white disabled:opacity-50 px-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────── */}
        {!loading && notifications.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center text-slate-500 text-sm">
              <Bell className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-white font-medium mb-1">No Notifications</p>
              <p className="text-slate-500 text-xs">
                You're all caught up! Check back later.
              </p>
            </div>
          </div>
        )}

        {/* ── Loading State ───────────────────────────────────────── */}
        {loading && page === 1 && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center text-slate-500 text-sm">
              <svg
                className="animate-spin h-8 w-8 text-violet-500 mb-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-white font-medium mb-1">
                Loading notifications...
              </p>
              <p className="text-slate-500 text-xs">Just a moment</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
