import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import {
  Plus,
  Users,
  DollarSign,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function GroupExpense() {
  const navigate = useNavigate();
  const { groups, createGroup, deleteGroup, formatCurrency } = useFinance();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    groupId: string | null;
    groupName: string;
  }>({
    isOpen: false,
    groupId: null,
    groupName: "",
  });
  const currentUserId = user?._id || user?.id || "";

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      setCreating(true);
      await createGroup({ name, members: [] });

      setName("");
      setIsCreateModalOpen(false);
    } catch (err) {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };
  const handleDeleteClick = (groupId: string, groupName: string) => {
    setDeleteModal({ isOpen: true, groupId, groupName });
  };

  const confirmDelete = async () => {
    const { groupId, groupName } = deleteModal;
    if (!groupId) return;

    try {
      await deleteGroup(groupId);
      toast.success(`Group "${groupName}" deleted successfully`);
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to delete group";
      toast.error(apiError);
    } finally {
      setDeleteModal({ isOpen: false, groupId: null, groupName: "" });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Shared Expenses
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Groups
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Split bills effortlessly with friends & roommates
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Create Group</span>
          </Button>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <KpiCard
            label="Active Groups"
            value={groups.length}
            icon={Users}
            accent="violet"
            delta="+2 this month"
          />
          <KpiCard
            label="You Owe"
            value={formatCurrency(0)}
            icon={TrendingDown}
            accent="rose"
            delta="-$42.50 total"
          />
          <KpiCard
            label="You Are Owed"
            value={formatCurrency(0)}
            icon={TrendingUp}
            accent="emerald"
            delta="+$128.30 total"
            colSpanFull
          />
        </div>

        {/* ── Groups Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.length === 0 ? (
            <div className="md:col-span-2">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mb-6">
                    Create your first group to start splitting expenses with
                    friends and keep everyone on the same page.
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg shadow-violet-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first group
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            groups.map((group: any) => (
              <div
                key={group._id}
                onClick={() => navigate(`/groups/${group._id}`)}
                className="group relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-800/60"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl shrink-0">
                    👥
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{group.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      {String(group.createdBy?._id || group.createdBy) ===
                      String(currentUserId) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400">
                          <Sparkles className="w-3 h-3" />
                          Owner
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {group.createdBy?.name || "Group creator"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-slate-400 text-xs">
                      Total Expenses
                    </span>
                    <span className="text-white text-sm font-medium">
                      {formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <span className="text-slate-400 text-xs">Your Balance</span>
                    <span className="text-cyan-400 text-sm font-medium">
                      {formatCurrency(0)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs hover:bg-slate-700/60 hover:text-white transition-colors">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {String(group.createdBy?._id || group.createdBy) ===
                    String(currentUserId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(group._id, group.name);
                      }}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Quick Tip ───────────────────────────────────────────── */}
        <div className="text-center">
          <p className="inline-flex items-center gap-2 text-slate-500 text-xs bg-slate-900/60 border border-slate-800/60 px-4 py-2 rounded-full">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            Pro tip: Add members to a group to start splitting expenses
            instantly.
          </p>
        </div>

        {/* ── Create Group Modal ──────────────────────────────────── */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Group"
          size="sm"
        >
          <form onSubmit={onCreate} className="space-y-4">
            <Input
              label="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Trip to Goa, Apartment Rent"
            />
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── Delete Confirmation Modal ───────────────────────────── */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, groupId: null, groupName: "" })
          }
          title="Delete Group"
          size="sm"
        >
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium mb-1">
                  Are you absolutely sure?
                </p>
                <p className="text-slate-400 text-sm">
                  This will permanently delete the group{" "}
                  <span className="text-white font-medium">
                    "{deleteModal.groupName}"
                  </span>{" "}
                  and all associated expenses. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal({
                    isOpen: false,
                    groupId: null,
                    groupName: "",
                  })
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"
              >
                Yes, Delete Group
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}

// ── Helper Component (Dashboard KpiCard style) ────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
  colSpanFull,
}: {
  label: string;
  value: string | number;
  icon: any;
  accent: "violet" | "rose" | "emerald" | "slate" | "green";
  delta?: string;
  colSpanFull?: boolean;
}) {
  const accentMap: Record<
    string,
    { icon: string; bg: string; border: string; text: string; grad: string }
  > = {
    violet: {
      icon: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      grad: "from-violet-500/10 to-transparent",
    },
    rose: {
      icon: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-400",
      grad: "from-rose-500/10 to-transparent",
    },
    emerald: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      grad: "from-emerald-500/10 to-transparent",
    },
    slate: {
      icon: "text-slate-300",
      bg: "bg-slate-700/30",
      border: "border-slate-600/30",
      text: "text-slate-400",
      grad: "from-slate-700/20 to-transparent",
    },
    green: {
      icon: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      text: "text-green-400",
      grad: "from-green-500/10 to-transparent",
    },
  };
  const c = accentMap[accent];

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 hover:border-slate-700/80 transition-all duration-200 ${colSpanFull ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs mb-2 truncate">{label}</p>
          <p className="text-xl font-bold text-white truncate">{value}</p>
          {delta && <p className={`text-xs mt-1 ${c.text}`}>{delta}</p>}
        </div>
        <div
          className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
}
