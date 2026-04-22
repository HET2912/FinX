import { useMemo, useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import {
  CheckCircle2,
  Plus,
  Target,
  Trash2,
  Trophy,
  Wallet,
  Calendar,
  Sparkles,
  Goal,
} from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";

const goalEmojis = [
  "🏠",
  "🚗",
  "✈️",
  "💻",
  "📱",
  "🎓",
  "💍",
  "🏖️",
  "🎮",
  "💪",
  "🛍️",
  "🎯",
];

export function Goals() {
  const {
    goals,
    investmentSummary,
    createGoal,
    addSavings,
    deleteGoal,
    completeGoal,
    formatCurrency,
  } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [goalFundingTarget, setGoalFundingTarget] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [newGoal, setNewGoal] = useState({
    itemName: "",
    target: "",
    emoji: "🏠",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if essential data has loaded
    if (goals !== undefined && investmentSummary !== undefined) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [goals, investmentSummary]);

  const availableSavings = Number(investmentSummary?.availableBalance || 0);
  const totalLockedInGoals = Number(investmentSummary?.lockedGoalSavings || 0);

  const goalSummary = useMemo(
    () => ({
      totalGoals: goals.length,
      totalTarget: goals.reduce(
        (sum: number, goal: any) => sum + Number(goal.targetAmount || 0),
        0,
      ),
      totalSaved: goals.reduce(
        (sum: number, goal: any) => sum + Number(goal.savedAmount || 0),
        0,
      ),
    }),
    [goals],
  );

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGoal({
        itemName: `${newGoal.emoji} ${newGoal.itemName}`,
        targetAmount: Number(newGoal.target),
        deadline: newGoal.dueDate,
      });
      setIsAddModalOpen(false);
      setNewGoal({ itemName: "", target: "", emoji: "🏠", dueDate: "" });
      toast.success("Goal created successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create goal");
    }
  };

  const handleFundGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalFundingTarget) return;

    try {
      await addSavings(goalFundingTarget._id, Number(fundAmount));
      toast.success("Goal funded from savings");
      setGoalFundingTarget(null);
      setFundAmount("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fund goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete goal");
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    try {
      await completeGoal(goalId);
      toast.success("Goal marked as completed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to complete goal");
    }
  };

  // ─── Beautiful Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-1">
          <div className="relative max-w-3xl w-full">
            {/* Animated background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Main loading card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/20">
              {/* Decorative corner gradients */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated goal icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-amber-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <Target className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-amber-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-amber-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading Goals
                </h2>

                {/* Progress bar with glow */}
                <div className="w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-amber-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2" />
                </div>

                {/* Dynamic loading messages */}
                <div className="space-y-1 mb-6">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="animate-pulse">
                      Fetching your savings goals...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing your financial targets
                  </p>
                </div>

                {/* Goal card skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex flex-col items-center mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-700/50 mb-2" />
                        <div className="h-4 w-24 bg-slate-700/50 rounded" />
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between">
                          <div className="h-3 w-10 bg-slate-700/50 rounded" />
                          <div className="h-3 w-16 bg-slate-700/30 rounded" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-3 w-10 bg-slate-700/50 rounded" />
                          <div className="h-3 w-16 bg-slate-700/30 rounded" />
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full mb-3" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-8 bg-slate-700/50 rounded-lg" />
                        <div className="h-8 bg-slate-700/50 rounded-lg" />
                        <div className="h-8 bg-slate-700/50 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Loading your financial goals</span>
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
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Row 1: Heading + Button */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                Plan Ahead
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Savings Goals
              </h1>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden xs:inline">Add Goal</span>
              <span className="relative z-10 xs:hidden">Add Goal</span>
            </Button>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Lock savings into dedicated goals and track your progress
          </p>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Total Goals"
            value={goalSummary.totalGoals}
            icon={Target}
            accent="violet"
          />
          <KpiCard
            label="Total Target"
            value={formatCurrency(goalSummary.totalTarget)}
            icon={Trophy}
            accent="cyan"
          />
          <KpiCard
            label="Locked In Goals"
            value={formatCurrency(totalLockedInGoals)}
            icon={CheckCircle2}
            accent="emerald"
          />
          <KpiCard
            label="Available Savings"
            value={formatCurrency(availableSavings)}
            icon={Wallet}
            accent="amber"
          />
        </div>

        {/* ── Goals Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {goals.map((goal: any) => {
            const progress =
              (Number(goal.savedAmount || 0) / Number(goal.targetAmount || 1)) *
              100;
            const isCompleted = goal.status === "completed" || progress >= 100;
            const remaining =
              Number(goal.targetAmount || 0) - Number(goal.savedAmount || 0);
            const dueDate = goal.deadline
              ? new Date(goal.deadline).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : null;
            const isOverdue =
              !isCompleted &&
              goal.deadline &&
              new Date(goal.deadline) < new Date();

            return (
              <div
                key={goal._id}
                className={`group relative overflow-hidden bg-slate-900/60 border rounded-xl md:rounded-2xl p-3 md:p-5 transition-all duration-200 ${
                  isCompleted
                    ? "border-emerald-500/30"
                    : isOverdue
                      ? "border-rose-500/30"
                      : "border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/60"
                }`}
              >
                {/* Header with icon and title */}
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <div className="flex-shrink-0 p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-400/20 group-hover:scale-110 transition-transform">
                    <span className="text-2xl md:text-5xl">
                      {goal.itemName?.split(" ")[0] || "🎯"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-white truncate">
                      {goal.itemName?.split(" ").slice(1).join(" ") ||
                        goal.itemName}
                    </h3>
                    {dueDate && (
                      <div className="flex items-center gap-1 text-[10px] md:text-xs mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span
                          className={`truncate ${
                            isOverdue ? "text-rose-400" : "text-slate-400"
                          }`}
                        >
                          Due: {dueDate}
                          {isOverdue && " (Overdue)"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount details - more compact */}
                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] md:text-xs">
                      Locked
                    </span>
                    <span className="text-white text-xs md:text-sm font-medium">
                      {formatCurrency(goal.savedAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] md:text-xs">
                      Target
                    </span>
                    <span className="text-slate-300 text-xs md:text-sm">
                      {formatCurrency(goal.targetAmount || 0)}
                    </span>
                  </div>
                </div>

                {/* Progress bar - more compact */}
                <div className="mb-3 md:mb-4">
                  <div className="relative w-full h-1 md:h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-violet-500 to-cyan-400"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 md:mt-2">
                    <span className="text-slate-500 text-[10px] md:text-xs">
                      {Math.round(progress)}% completed
                    </span>
                    <span className="text-slate-500 text-[10px] md:text-xs">
                      {formatCurrency(remaining)} left
                    </span>
                  </div>
                </div>

                {/* Remaining amount box - more compact */}
                <div
                  className={`rounded-lg md:rounded-xl p-2 md:p-3 mb-3 md:mb-4 text-center ${
                    isCompleted
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-slate-800/40 border border-slate-700/30"
                  }`}
                >
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-1.5 md:gap-2 text-emerald-300">
                      <Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="font-medium text-xs md:text-sm">
                        Goal Achieved! 🎉
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-wider">
                        Remaining to lock
                      </p>
                      <p className="text-base md:text-lg font-bold text-white">
                        {formatCurrency(remaining)}
                      </p>
                    </>
                  )}
                </div>

                {/* Action buttons - more compact */}
                <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                  <button
                    onClick={() => {
                      setGoalFundingTarget(goal);
                      setFundAmount("");
                    }}
                    disabled={isCompleted}
                    className="py-1 md:py-1.5 rounded-md md:rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white text-[10px] md:text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Fund
                  </button>
                  <button
                    onClick={() => handleCompleteGoal(goal._id)}
                    disabled={isCompleted}
                    className="py-1 md:py-1.5 rounded-md md:rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-[10px] md:text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="py-1 md:py-1.5 rounded-md md:rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[10px] md:text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Empty State ─────────────────────────────────────────── */}
        {goals.length === 0 && (
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center text-slate-500 text-sm">
              <Target className="w-8 h-8 text-slate-700 mb-2" />
              <p>No savings goals yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Create your first goal to start locking savings
              </p>
            </div>
          </div>
        )}

        {/* ── Add Goal Modal ──────────────────────────────────────── */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create Savings Goal"
          size="md"
        >
          <form onSubmit={handleAddGoal} className="space-y-4">
            <Input
              label="Goal Name"
              type="text"
              placeholder="e.g., New Laptop"
              value={newGoal.itemName}
              onChange={(e) =>
                setNewGoal({ ...newGoal, itemName: e.target.value })
              }
              required
            />
            <Input
              label="Target Amount"
              type="number"
              placeholder="5000"
              value={newGoal.target}
              onChange={(e) =>
                setNewGoal({ ...newGoal, target: e.target.value })
              }
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={newGoal.dueDate}
              onChange={(e) =>
                setNewGoal({ ...newGoal, dueDate: e.target.value })
              }
              required
            />
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Choose an Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {goalEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNewGoal({ ...newGoal, emoji })}
                    className={`text-3xl p-2 rounded-xl transition-all duration-200 ${
                      newGoal.emoji === emoji
                        ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 scale-105"
                        : "bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800/80"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                Create Goal
              </button>
            </div>
          </form>
        </Modal>

        {/* ── Fund Goal Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={Boolean(goalFundingTarget)}
          onClose={() => setGoalFundingTarget(null)}
          title={
            goalFundingTarget
              ? `Fund ${goalFundingTarget.itemName}`
              : "Fund Goal"
          }
          size="sm"
        >
          <form onSubmit={handleFundGoal} className="space-y-4">
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                  <Wallet className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-300 text-xs mb-0.5">
                    Available savings to lock:{" "}
                    <span className="text-amber-300 font-medium">
                      {formatCurrency(availableSavings)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Money moved into a goal stays locked and cannot be used from
                    the savings page.
                  </p>
                </div>
              </div>
            </div>
            <Input
              label="Amount to move into goal"
              type="number"
              min="0"
              max={String(availableSavings)}
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              required
            />
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setGoalFundingTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Lock Funds
                </span>
              </button>
            </div>
          </form>
        </Modal>
      </div>

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Container spacing */
          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
          }
          .gap-5 {
            gap: 0.75rem;
          }
          .gap-3 {
            gap: 0.5rem;
          }
          .gap-2 {
            gap: 0.25rem;
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
          .py-2\.5 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .py-1\.5 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
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
          .mt-2 {
            margin-top: 0.25rem;
          }
          .mt-1 {
            margin-top: 0.125rem;
          }
          .mb-0\.5 {
            margin-bottom: 0.0625rem;
          }
          
          /* Typography scaling */
          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.875rem;
          }
          .text-5xl {
            font-size: 2.25rem;
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
          .w-12 {
            width: 2rem;
          }
          .h-12 {
            height: 2rem;
          }
          .w-9 {
            width: 1.5rem;
          }
          .h-9 {
            height: 1.5rem;
          }
          .w-8 {
            width: 1.25rem;
          }
          .h-8 {
            height: 1.25rem;
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
          
          /* Goal card emoji container */
          .p-3 {
            padding: 0.375rem;
          }
          
          /* Progress bar */
          .h-1\.5 {
            height: 0.25rem;
          }
          
          /* Button sizing */
          .py-1\.5 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
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
          
          /* Modal emoji grid */
          .text-3xl {
            font-size: 1.5rem;
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
}: {
  label: string;
  value: string | number;
  icon: any;
  accent: "violet" | "cyan" | "emerald" | "amber";
}) {
  const accentMap = {
    violet: {
      icon: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      grad: "from-violet-500/10 to-transparent",
    },
    cyan: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      text: "text-cyan-400",
      grad: "from-cyan-500/10 to-transparent",
    },
    emerald: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      grad: "from-emerald-500/10 to-transparent",
    },
    amber: {
      icon: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      grad: "from-amber-500/10 to-transparent",
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
          <p className="text-xl font-bold text-white truncate">{value}</p>
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
