import { useMemo, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  PiggyBank,
  Trash2,
  Wallet,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";

const entryTypeOptions = [
  { value: "deposit", label: "Add Savings" },
  { value: "withdrawal", label: "Use Savings" },
];

const defaultForm = {
  entryType: "deposit",
  name: "",
  amount: "",
  durationMonths: "1",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export function Investments() {
  const {
    investments,
    investmentSummary,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    formatCurrency,
  } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [editingInvestmentId, setEditingInvestmentId] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const totals = investmentSummary?.totals || {
    totalSaved: 0,
    totalUsed: 0,
    currentBalance: 0,
    entryCount: 0,
  };
  const availableBalance = Number(investmentSummary?.availableBalance || 0);
  const lockedGoalSavings = Number(investmentSummary?.lockedGoalSavings || 0);
  const currentMonthSummary = investmentSummary?.currentMonth || {
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    savedAmount: 0,
    usedAmount: 0,
    remainingAmount: 0,
    monthLabel: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    shouldWarnSavingsUse: false,
    warningMessage: "",
  };
  const activityData = investmentSummary?.monthlyActivity || [];

  const editingEntry = editingInvestmentId
    ? investments.find((entry: any) => entry._id === editingInvestmentId)
    : null;

  const isCurrentMonth = (dateValue?: string | Date) => {
    const date = new Date(dateValue || new Date());
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  };

  const allowedToSave = useMemo(() => {
    if (form.entryType !== "deposit") {
      return 0;
    }

    if (editingEntry?.entryType === "deposit" && isCurrentMonth(form.date)) {
      return (
        Number(currentMonthSummary.remainingAmount || 0) +
        Number(editingEntry.amount ?? editingEntry.investedAmount ?? 0)
      );
    }

    return isCurrentMonth(form.date)
      ? Number(currentMonthSummary.remainingAmount || 0)
      : 0;
  }, [
    currentMonthSummary.remainingAmount,
    editingEntry,
    form.date,
    form.entryType,
  ]);

  const availableSavingsToUse = useMemo(() => {
    if (editingEntry?.entryType === "withdrawal") {
      return (
        Number(availableBalance || 0) +
        Number(editingEntry.amount ?? editingEntry.investedAmount ?? 0)
      );
    }

    return Number(availableBalance || 0);
  }, [availableBalance, editingEntry]);

  const openModal = (entryType: "deposit" | "withdrawal", entry?: any) => {
    setEditingInvestmentId(entry?._id || null);
    setForm(
      entry
        ? {
            entryType: entry.entryType || "deposit",
            name: entry.name || "",
            amount: String(entry.amount ?? entry.investedAmount ?? ""),
            durationMonths: String(entry.durationMonths || 1),
            date: entry.date
              ? new Date(entry.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            notes: entry.notes || "",
          }
        : {
            ...defaultForm,
            entryType,
          },
    );
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingInvestmentId(null);
    setForm(defaultForm);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const amount = Number(form.amount);

      if (form.entryType === "deposit" && amount > allowedToSave) {
        toast.error(
          `You can only save ${formatCurrency(allowedToSave)} from this month's remaining net amount.`,
        );
        return;
      }

      if (form.entryType === "withdrawal" && amount > availableSavingsToUse) {
        toast.error(
          `You only have ${formatCurrency(availableSavingsToUse)} available in savings.`,
        );
        return;
      }

      const payload = {
        entryType: form.entryType,
        name: form.name,
        amount,
        durationMonths: Number(form.durationMonths || 1),
        date: form.date,
        notes: form.notes,
      };

      if (editingInvestmentId) {
        await updateInvestment(editingInvestmentId, payload);
        toast.success(
          form.entryType === "deposit"
            ? "Savings entry updated"
            : "Savings usage updated",
        );
      } else {
        await addInvestment(payload);
        toast.success(
          form.entryType === "deposit"
            ? "Savings added successfully"
            : "Savings used successfully",
        );
      }

      closeModal();
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to save entry";
      toast.error(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (entryId: string) => {
    try {
      await deleteInvestment(entryId);
      toast.success("Savings entry deleted successfully");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to delete entry";
      toast.error(apiError);
    }
  };

  const chartTooltipStyle = {
    backgroundColor: "#0F172A",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "12px",
    color: "#F8FAFC",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    fontSize: "12px",
  };

  const stats = [
    {
      title: "Savings Balance",
      value: formatCurrency(totals.currentBalance),
      icon: PiggyBank,
      accent: "emerald" as const,
    },
    {
      title: "Available To Use",
      value: formatCurrency(availableBalance),
      icon: Wallet,
      accent: "amber" as const,
    },
    {
      title: "Total Saved",
      value: formatCurrency(totals.totalSaved),
      icon: TrendingUp,
      accent: "violet" as const,
    },
    {
      title: "Locked In Goals",
      value: formatCurrency(lockedGoalSavings),
      icon: Sparkles,
      accent: "cyan" as const,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              {currentMonthSummary.monthLabel}
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Savings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Save from this month's net and manage your savings balance
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => openModal("deposit")}
              disabled={Number(currentMonthSummary.remainingAmount) <= 0}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <ArrowUpCircle className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Add Savings</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => openModal("withdrawal")}
              disabled={Number(availableBalance) <= 0}
              className="inline-flex items-center justify-center gap-2 bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700/60 hover:text-white disabled:opacity-50 transition-all"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Use Savings</span>
            </Button>
          </div>
        </div>

        {/* ── Monthly Capacity Card ───────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-emerald-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">
              Monthly Savings Capacity
            </h3>
          </div>
          <p className="text-slate-400 text-xs mb-4">
            Savings can only come from this month's remaining net amount. Using
            savings reduces your saved balance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MiniStat
              label="Net This Month"
              value={formatCurrency(currentMonthSummary.netAmount)}
              tone="slate"
            />
            <MiniStat
              label="Saved This Month"
              value={formatCurrency(currentMonthSummary.savedAmount)}
              tone="emerald"
            />
            <MiniStat
              label="Used This Month"
              value={formatCurrency(currentMonthSummary.usedAmount)}
              tone="rose"
            />
            <MiniStat
              label="Left to Save"
              value={formatCurrency(currentMonthSummary.remainingAmount)}
              tone={
                Number(currentMonthSummary.remainingAmount) > 0
                  ? "emerald"
                  : "rose"
              }
            />
          </div>
        </div>

        {/* ── Locked Goal Savings Card ────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full" />
            <h3 className="text-sm font-semibold text-white">
              Locked Goal Savings
            </h3>
          </div>
          <p className="text-slate-400 text-xs mb-4">
            Funds moved into goals stay inside savings but cannot be used from
            here until the goal is deleted.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MiniStat
              label="Locked In Goals"
              value={formatCurrency(lockedGoalSavings)}
              tone="cyan"
            />
            <MiniStat
              label="Available To Use"
              value={formatCurrency(availableBalance)}
              tone="amber"
            />
          </div>
        </div>

        {/* ── Warning Card (if applicable) ────────────────────────── */}
        {currentMonthSummary.shouldWarnSavingsUse &&
          Number(availableBalance) > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900/60 to-amber-950/50 border border-amber-800/30 p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">
                    Savings Warning
                  </p>
                  <p className="text-amber-200 text-xs mt-0.5">
                    {currentMonthSummary.warningMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <KpiCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* ── Savings Activity Chart ───────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">
              Savings Activity
            </h3>
          </div>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="transparent"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="transparent"
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => {
                    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
                    return `₹${val}`;
                  }}
                  width={52}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  cursor={{ fill: "rgba(148,163,184,0.04)" }}
                />
                <Line
                  type="monotone"
                  dataKey="saved"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10B981", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  name="Saved"
                />
                <Line
                  type="monotone"
                  dataKey="used"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ fill: "#EF4444", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  name="Used"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex flex-col items-center justify-center text-slate-500 text-sm">
              <Activity className="w-8 h-8 text-slate-700 mb-2" />
              Start saving to see monthly activity
            </div>
          )}
        </div>

        {/* ── Savings Entries List ────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">
              Savings Entries
            </h3>
          </div>
          <div className="space-y-2">
            {investments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm text-center">
                <PiggyBank className="w-8 h-8 text-slate-700 mb-2" />
                <p>No savings entries yet</p>
                <p className="text-slate-500 text-xs mt-1">
                  Start by adding savings from your monthly net amount
                </p>
              </div>
            ) : (
              investments.map((entry: any) => {
                const amount = Number(
                  entry.amount ?? entry.investedAmount ?? 0,
                );
                const isWithdrawal = entry.entryType === "withdrawal";

                return (
                  <div
                    key={entry._id}
                    className="group flex flex-col gap-4 rounded-xl bg-slate-800/40 border border-slate-700/30 p-4 transition-all hover:border-slate-600/50 hover:bg-slate-800/60 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isWithdrawal
                            ? "bg-rose-500/10 border border-rose-500/20"
                            : "bg-emerald-500/10 border border-emerald-500/20"
                        }`}
                      >
                        {isWithdrawal ? (
                          <Wallet className="w-5 h-5 text-rose-400" />
                        ) : (
                          <PiggyBank className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="text-slate-200 text-sm font-medium">
                            {entry.name}
                          </h4>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              isWithdrawal
                                ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {isWithdrawal ? "Used Savings" : "Added to Savings"}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {!isWithdrawal &&
                            ` • ${entry.durationMonths || 1} month plan`}
                        </p>
                        {entry.notes && (
                          <p className="text-slate-400 text-xs mt-1.5 italic">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-slate-500 text-xs">Amount</p>
                        <p
                          className={`text-sm font-bold ${
                            isWithdrawal ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {isWithdrawal ? "-" : "+"}
                          {formatCurrency(amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            openModal(entry.entryType || "deposit", entry)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/40 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(entry._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Add/Edit Modal ──────────────────────────────────────── */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={
            form.entryType === "withdrawal"
              ? "Use Savings"
              : editingInvestmentId
                ? "Edit Savings Entry"
                : "Add Savings"
          }
          size="md"
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <Select
              label="Entry Type"
              options={entryTypeOptions}
              value={form.entryType}
              onChange={(e) => setForm({ ...form, entryType: e.target.value })}
            />
            <Input
              label={
                form.entryType === "withdrawal" ? "Used For" : "Saving Purpose"
              }
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={
                form.entryType === "withdrawal"
                  ? "Rent, emergency, travel..."
                  : "Emergency fund, bike, buffer..."
              }
              required
            />
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3">
              {form.entryType === "withdrawal" ? (
                <>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    Available to use:{" "}
                    <span className="text-amber-300 font-medium">
                      {formatCurrency(availableSavingsToUse)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Goal-locked money is excluded from this amount.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Available to save this month:{" "}
                    <span className="text-emerald-300 font-medium">
                      {formatCurrency(allowedToSave)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    From remaining monthly net after income & expenses.
                  </p>
                </>
              )}
            </div>
            <Input
              label="Amount"
              type="number"
              min="0"
              max={
                form.entryType === "withdrawal"
                  ? String(availableSavingsToUse)
                  : String(allowedToSave)
              }
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            {form.entryType === "deposit" && (
              <Input
                label="For How Many Months"
                type="number"
                min="1"
                value={form.durationMonths}
                onChange={(e) =>
                  setForm({ ...form, durationMonths: e.target.value })
                }
                required
              />
            )}
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              label="Comment"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional note"
            />
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {submitting
                  ? "Saving..."
                  : form.entryType === "withdrawal"
                    ? "Use Savings"
                    : "Save Entry"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "slate" | "emerald" | "rose" | "cyan" | "amber";
}) {
  const toneMap = {
    slate: "text-white",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    cyan: "text-cyan-300",
    amber: "text-amber-300",
  };
  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className={`text-base font-bold ${toneMap[tone]}`}>{value}</p>
    </div>
  );
}

function KpiCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  icon: any;
  accent: "emerald" | "amber" | "violet" | "cyan";
}) {
  const accentMap = {
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
  };
  const c = accentMap[accent];

  return (
    <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 hover:border-slate-700/80 transition-all duration-200">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-60`}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs mb-2 truncate">{title}</p>
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

// Add missing Activity icon import (if used in empty state)
import { Activity } from "lucide-react";
