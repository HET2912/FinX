import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export function GroupExpense() {
  const navigate = useNavigate();
  const {
    groups,
    createGroup,
    deleteGroup,
    formatCurrency,
    getGroupBalanceSheet,
    getGroupExpenses,
  } = useFinance();
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

  // Aggregated balance data across all groups
  const [aggregated, setAggregated] = useState<{
    youOwe: number;
    youAreOwed: number;
    totalExpenses: number;
    groupData: Record<string, { totalExpenses: number; yourBalance: number }>;
  }>({
    youOwe: 0,
    youAreOwed: 0,
    totalExpenses: 0,
    groupData: {},
  });
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?._id || user?.id || "";

  // Set loading to false once groups is defined
  useEffect(() => {
    if (groups !== undefined) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [groups]);

  // Fetch balance sheets + expenses for all groups
  useEffect(() => {
    if (!groups.length || !currentUserId) return;

    const fetchAll = async () => {
      setLoadingBalances(true);
      try {
        const results = await Promise.allSettled(
          groups.map(async (group: any) => {
            const [balanceSheet, expenses] = await Promise.allSettled([
              getGroupBalanceSheet(group._id),
              getGroupExpenses(group._id),
            ]);

            const bs =
              balanceSheet.status === "fulfilled" ? balanceSheet.value : null;
            const exps = expenses.status === "fulfilled" ? expenses.value : [];

            const settlements: any[] = bs?.settlements || [];

            const youOwe = settlements.reduce(
              (sum: number, s: any) =>
                String(s.from) === String(currentUserId)
                  ? sum + Number(s.amount)
                  : sum,
              0,
            );
            const youAreOwed = settlements.reduce(
              (sum: number, s: any) =>
                String(s.to) === String(currentUserId)
                  ? sum + Number(s.amount)
                  : sum,
              0,
            );
            const totalExpenses = (exps as any[]).reduce(
              (sum: number, e: any) => sum + Number(e.amount),
              0,
            );

            return {
              groupId: group._id,
              youOwe,
              youAreOwed,
              totalExpenses,
              yourBalance: youAreOwed - youOwe,
            };
          }),
        );

        let totalYouOwe = 0;
        let totalYouAreOwed = 0;
        let totalExp = 0;
        const groupData: Record<
          string,
          { totalExpenses: number; yourBalance: number }
        > = {};

        results.forEach((r) => {
          if (r.status === "fulfilled") {
            const d = r.value;
            totalYouOwe += d.youOwe;
            totalYouAreOwed += d.youAreOwed;
            totalExp += d.totalExpenses;
            groupData[d.groupId] = {
              totalExpenses: d.totalExpenses,
              yourBalance: d.yourBalance,
            };
          }
        });

        setAggregated({
          youOwe: totalYouOwe,
          youAreOwed: totalYouAreOwed,
          totalExpenses: totalExp,
          groupData,
        });
      } catch (err) {
        console.error("Failed to fetch group balances", err);
      } finally {
        setLoadingBalances(false);
      }
    };

    fetchAll();
  }, [groups, currentUserId]);

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

  const netBalance = aggregated.youAreOwed - aggregated.youOwe;

  // ─── Beautiful Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-1">
          <div className="relative max-w-4xl w-full">
            {/* Animated background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Main loading card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/20">
              {/* Decorative corner gradients */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-transparent rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated group icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <Users className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading Groups
                </h2>

                {/* Progress bar with glow */}
                <div className="w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2" />
                </div>

                {/* Dynamic loading messages */}
                <div className="space-y-1 mb-6">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="animate-pulse">
                      Fetching your groups...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing shared expense dashboard
                  </p>
                </div>

                {/* Group card skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-slate-700/50 rounded mb-2" />
                          <div className="h-3 w-16 bg-slate-700/30 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-10 bg-slate-700/30 rounded-lg" />
                        <div className="h-10 bg-slate-700/30 rounded-lg" />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-slate-700/40 rounded-lg" />
                        <div className="w-8 h-8 bg-slate-700/40 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* KPI cards skeleton row */}
                <div className="grid grid-cols-4 gap-3 w-full mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Loading your groups</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom keyframe animations */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes progress {
            0% { width: 30%; margin-left: -15%; }
            50% { width: 70%; margin-left: 15%; }
            100% { width: 30%; margin-left: -15%; }
          }
          .animate-shimmer {
            animation: shimmer 3s linear infinite;
          }
        `}</style>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Row 1: Heading + Button */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                Shared Expenses
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Groups
              </h1>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden xs:inline">
                Create Group
              </span>
              <span className="relative z-10 xs:hidden">Create</span>
            </Button>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Split bills effortlessly with friends & roommates
          </p>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <KpiCard
            label="Active Groups"
            value={groups.length}
            icon={Users}
            accent="violet"
            loading={false}
            delta={`${groups.length} group${groups.length !== 1 ? "s" : ""}`}
          />
          <KpiCard
            label="You Owe"
            value={formatCurrency(aggregated.youOwe)}
            icon={TrendingDown}
            accent="rose"
            loading={loadingBalances}
            delta={aggregated.youOwe > 0 ? "Outstanding" : "All clear ✓"}
          />
          <KpiCard
            label="You Are Owed"
            value={formatCurrency(aggregated.youAreOwed)}
            icon={TrendingUp}
            accent="emerald"
            loading={loadingBalances}
            delta={aggregated.youAreOwed > 0 ? "Receivable" : "Nothing due"}
          />
          <KpiCard
            label="Total Expenses"
            value={formatCurrency(aggregated.totalExpenses)}
            icon={Wallet}
            accent="cyan"
            loading={loadingBalances}
            delta="Across all groups"
          />
        </div>

        {/* ── Groups Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {groups.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 md:mb-4">
                    <Users className="w-7 h-7 md:w-8 md:h-8 text-violet-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm max-w-md mb-5 md:mb-6">
                    Create your first group to start splitting expenses with
                    friends and keep everyone on the same page.
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg shadow-violet-500/30 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first group
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            groups.map((group: any) => {
              const gd = aggregated.groupData[group._id];
              return (
                <div
                  key={group._id}
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="group relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-800/60"
                >
                  {/* Header with icon, title, and owner tag */}
                  <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl md:text-2xl shrink-0">
                      👥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm md:text-base font-semibold text-white truncate">
                          {group.name}
                        </h3>
                        {String(group.createdBy?._id || group.createdBy) ===
                        String(currentUserId) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] md:text-xs text-violet-400 shrink-0">
                            <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            Owner
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs md:text-xs mt-1">
                        <Users className="w-3.5 h-3.5 md:w-1.5 md:h-1.5" />
                        <span>{group.members?.length || 0} members</span>
                      </div>
                      {String(group.createdBy?._id || group.createdBy) !==
                        String(currentUserId) && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-slate-500 text-[10px] md:text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {group.createdBy?.name || "Group creator"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats cards - more compact */}
                  <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-800/40 border border-slate-700/30">
                      <span className="text-slate-400 text-[10px] md:text-xs">
                        Total Expenses
                      </span>
                      {loadingBalances ? (
                        <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500 animate-spin" />
                      ) : (
                        <span className="text-white text-xs md:text-sm font-medium">
                          {formatCurrency(gd?.totalExpenses ?? 0)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-800/40 border border-slate-700/30">
                      <span className="text-slate-400 text-[10px] md:text-xs">
                        Your Balance
                      </span>
                      {loadingBalances ? (
                        <Loader2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-500 animate-spin" />
                      ) : (
                        <span
                          className={`text-xs md:text-sm font-medium font-mono ${
                            (gd?.yourBalance ?? 0) > 0
                              ? "text-emerald-400"
                              : (gd?.yourBalance ?? 0) < 0
                                ? "text-rose-400"
                                : "text-cyan-400"
                          }`}
                        >
                          {(gd?.yourBalance ?? 0) > 0 ? "+" : ""}
                          {formatCurrency(gd?.yourBalance ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 md:gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 md:py-2 rounded-md md:rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-[10px] md:text-xs hover:bg-slate-700/60 hover:text-white transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    {String(group.createdBy?._id || group.createdBy) ===
                      String(currentUserId) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(group._id, group.name);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-2 md:py-1.5 rounded-md md:rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs md:text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
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

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
      /* Custom breakpoint for extra small screens */
@media (min-width: 480px) {
  .xs\:inline {
    display: inline !important;
  }
}
@media (max-width: 479px) {
  .xs\:hidden {
    display: none !important;
  }
}
      /* Custom breakpoint for extra small screens */
@media (min-width: 480px) {
  .xs\:inline {
    display: inline !important;
  }
}
@media (max-width: 479px) {
  .xs\:hidden {
    display: none !important;
  }
}
        @media (max-width: 640px) {
          /* Container spacing */
          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
          }
          .space-y-5 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }
          .space-y-4 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }
          .space-y-2 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
          }
          .gap-5 {
            gap: 0.75rem;
          }
          .gap-4 {
            gap: 0.5rem;
          }
          .gap-3 {
            gap: 0.375rem;
          }
          .gap-2 {
            gap: 0.25rem;
          }
          .gap-1 {
            gap: 0.125rem;
          }
          
          /* Padding adjustments */
          .p-5 {
            padding: 0.75rem;
          }
          .p-4 {
            padding: 0.625rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .p-2 {
            padding: 0.25rem;
          }
          .p-12 {
            padding: 1.5rem;
          }
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .px-2 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          .py-2\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-2 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .py-0\.5 {
            padding-top: 0.0625rem;
            padding-bottom: 0.0625rem;
          }
          .pt-2 {
            padding-top: 0.25rem;
          }
          .pt-1 {
            padding-top: 0.125rem;
          }
          
          /* Margin adjustments */
          .mb-6 {
            margin-bottom: 0.75rem;
          }
          .mb-4 {
            margin-bottom: 0.5rem;
          }
          .mb-3 {
            margin-bottom: 0.375rem;
          }
          .mb-2 {
            margin-bottom: 0.25rem;
          }
          .mb-1 {
            margin-bottom: 0.125rem;
          }
          .mt-6 {
            margin-top: 0.75rem;
          }
          .mt-4 {
            margin-top: 0.5rem;
          }
          .mt-1\.5 {
            margin-top: 0.125rem;
          }
          .mt-1 {
            margin-top: 0.125rem;
          }
          
          /* Typography scaling */
          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.875rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .text-xl {
            font-size: 1.125rem;
            line-height: 1.5rem;
          }
          .text-lg {
            font-size: 1rem;
            line-height: 1.375rem;
          }
          .text-base {
            font-size: 0.875rem;
            line-height: 1.25rem;
          }
          .text-sm {
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .text-xs {
            font-size: 0.625rem;
            line-height: 0.875rem;
          }
          
          /* Icon sizing */
          .w-16 {
            width: 2.5rem;
          }
          .h-16 {
            height: 2.5rem;
          }
          .w-12 {
            width: 2rem;
          }
          .h-12 {
            height: 2rem;
          }
          .w-10 {
            width: 1.75rem;
          }
          .h-10 {
            height: 1.75rem;
          }
          .w-8 {
            width: 1.25rem;
          }
          .h-8 {
            height: 1.25rem;
          }
          .w-5 {
            width: 0.875rem;
          }
          .h-5 {
            height: 0.875rem;
          }
          .w-4 {
            width: 0.75rem;
          }
          .h-4 {
            height: 0.75rem;
          }
          .w-3\.5 {
            width: 0.75rem;
          }
          .h-3\.5 {
            height: 0.75rem;
          }
          .w-3 {
            width: 0.625rem;
          }
          .h-3 {
            height: 0.625rem;
          }
          .w-1\.5 {
            width: 0.25rem;
          }
          .h-1\.5 {
            height: 0.25rem;
          }
          
          /* Height adjustments */
          .h-20 {
            height: 3.5rem;
          }
          .h-10 {
            height: 2.5rem;
          }
          .h-8 {
            height: 1.75rem;
          }
          .h-3 {
            height: 0.375rem;
          }
          
          /* Max width adjustments */
          .max-w-md {
            max-width: 14rem;
          }
          
          /* Border radius */
          .rounded-2xl {
            border-radius: 0.75rem;
          }
          .rounded-xl {
            border-radius: 0.5rem;
          }
          .rounded-lg {
            border-radius: 0.375rem;
          }
          .rounded-full {
            border-radius: 9999px;
          }
          
          /* Group card specific */
          .text-2xl {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}

// ── Helper Component ──────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
  loading,
}: {
  label: string;
  value: string | number;
  icon: any;
  accent: "violet" | "rose" | "emerald" | "cyan";
  delta?: string;
  loading?: boolean;
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
    cyan: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      grad: "from-cyan-500/10 to-transparent",
    },
  };
  const c = accentMap[accent];

  return (
    <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 hover:border-slate-700/80 transition-all duration-200">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs mb-2 truncate">{label}</p>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
              <span className="text-slate-600 text-sm">Loading…</span>
            </div>
          ) : (
            <p className="text-xl font-bold text-white truncate">{value}</p>
          )}
          {delta && !loading && (
            <p className={`text-xs mt-1 ${c.text}`}>{delta}</p>
          )}
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
