import { useMemo, useState } from "react";
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

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Plan Ahead
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Savings Goals
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Lock savings into dedicated goals and track your progress
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add Goal</span>
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className={`group relative overflow-hidden bg-slate-900/60 border rounded-2xl p-5 transition-all duration-200 ${
                  isCompleted
                    ? "border-emerald-500/30"
                    : isOverdue
                      ? "border-rose-500/30"
                      : "border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/60"
                }`}
              >
                <div className="text-center mb-4">
                  <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-400/20 mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-5xl">
                      {goal.itemName?.split(" ")[0] || "🎯"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1 line-clamp-1">
                    {goal.itemName}
                  </h3>
                  {dueDate && (
                    <div className="flex items-center justify-center gap-1 text-xs">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span
                        className={
                          isOverdue ? "text-rose-400" : "text-slate-400"
                        }
                      >
                        Due: {dueDate}
                        {isOverdue && " (Overdue)"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Locked</span>
                    <span className="text-white text-sm font-medium">
                      {formatCurrency(goal.savedAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-xs">Target</span>
                    <span className="text-slate-300 text-sm">
                      {formatCurrency(goal.targetAmount || 0)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="relative w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                        isCompleted
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-gradient-to-r from-violet-500 to-cyan-400"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-slate-500 text-xs">
                      {Math.round(progress)}% completed
                    </span>
                    <span className="text-slate-500 text-xs">
                      {formatCurrency(remaining)} left
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-xl p-3 mb-4 text-center ${
                    isCompleted
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-slate-800/40 border border-slate-700/30"
                  }`}
                >
                  {isCompleted ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-300">
                      <Trophy className="w-4 h-4" />
                      <span className="font-medium text-sm">
                        Goal Achieved! 🎉
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-500 text-xs uppercase tracking-wider">
                        Remaining to lock
                      </p>
                      <p className="text-lg font-bold text-white">
                        {formatCurrency(remaining)}
                      </p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      setGoalFundingTarget(goal);
                      setFundAmount("");
                    }}
                    disabled={isCompleted}
                    className="py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Fund
                  </button>
                  <button
                    onClick={() => handleCompleteGoal(goal._id)}
                    disabled={isCompleted}
                    className="py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal._id)}
                    className="py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition-colors"
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
