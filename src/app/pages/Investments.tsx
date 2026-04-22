import { useMemo, useState, useEffect } from "react";
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
  Activity,
  Plus,
  Loader2,
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
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);

  // Set loading to false once data is available
  useEffect(() => {
    if (investments !== undefined && investmentSummary !== undefined) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [investments, investmentSummary]);

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
    // Show confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this savings entry? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingEntryId(entryId);
      await deleteInvestment(entryId);
      toast.success("Savings entry deleted successfully");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to delete entry";
      toast.error(apiError);
    } finally {
      setDeletingEntryId(null);
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

  // ─── Beautiful Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-1">
          <div className="relative max-w-4xl w-full">
            {/* Animated background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-600/20 via-cyan-500/20 to-violet-500/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Main loading card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/20">
              {/* Decorative corner gradients */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated savings icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-violet-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <PiggyBank className="w-12 h-12 text-transparent bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading Savings
                </h2>

                {/* Progress bar with glow */}
                <div className="w-72 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2" />
                </div>

                {/* Dynamic loading messages */}
                <div className="space-y-1 mb-6">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="animate-pulse">
                      Fetching your savings data...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing your financial overview
                  </p>
                </div>

                {/* KPI card skeletons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Chart skeleton */}
                <div className="w-full h-48 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse mb-4">
                  <div className="flex items-end justify-around h-full px-4 py-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-slate-700/50 to-slate-700/30 rounded-t-md"
                        style={{ height: `${20 + i * 8}px` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Entry list skeletons */}
                <div className="space-y-2 w-full">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Loading your savings dashboard</span>
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
          {/* Row 1: Heading + Combined Button */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                {currentMonthSummary.monthLabel}
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Savings
              </h1>
            </div>

            {/* Combined Dropdown Button */}
            <div className="relative flex-shrink-0">
              <Button
                onClick={() => openModal("deposit")}
                disabled={
                  Number(currentMonthSummary.remainingAmount) <= 0 &&
                  Number(availableBalance) <= 0
                }
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 hidden sm:inline">
                  Manage Savings
                </span>
                <span className="relative z-10 sm:hidden">Manage Savings</span>
              </Button>
            </div>
          </div>

          {/* Row 2: Description paragraph + Quick action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-slate-400 text-sm">
              Save from this month's net and manage your savings balance
            </p>
          </div>
        </div>

        {/* ── Monthly Capacity Card ───────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 mt-6 sm:mt-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
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
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <KpiCard key={stat.title} {...stat} />
            ))}
          </div>
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
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-base sm:text-sm font-semibold text-white">
              Savings Entries
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-3 sm:space-y-0 sm:divide-y sm:divide-slate-700/50">
            {investments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                <PiggyBank className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-base">No savings entries yet</p>
                <p className="text-sm mt-1.5">
                  Start by adding savings from your monthly net amount
                </p>
              </div>
            ) : (
              investments.map((entry: any) => {
                const amount = Number(
                  entry.amount ?? entry.investedAmount ?? 0,
                );
                const isWithdrawal = entry.entryType === "withdrawal";
                const isDeleting = deletingEntryId === entry._id;

                return (
                  <div
                    key={entry._id}
                    className={`group bg-slate-800/40 sm:bg-transparent border border-slate-800/50 sm:border-0 rounded-xl sm:rounded-none p-3 sm:p-4 transition-all duration-200 ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="grid grid-cols-[auto_1fr_auto] grid-rows-2 gap-x-3 gap-y-0 items-center">
                      {/* Icon */}
                      <div
                        className={`row-span-2 w-12 h-12 rounded-xl flex items-center justify-center ${
                          isWithdrawal
                            ? "bg-rose-500/10 border border-rose-500/20"
                            : "bg-emerald-500/10 border border-emerald-500/20"
                        }`}
                      >
                        {isWithdrawal ? (
                          <Wallet className="w-5 h-5 text-rose-400" />
                        ) : (
                          <PiggyBank className="w-6 h-7 text-emerald-400" />
                        )}
                      </div>

                      {/* Row 1 - Name */}
                      <h4 className="text-slate-200 text-base font-semibold truncate">
                        {entry.name}
                      </h4>

                      {/* Row 1 - Amount */}
                      <p
                        className={`text-base font-bold text-right ${
                          isWithdrawal ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {isWithdrawal ? "-" : "+"}
                        {formatCurrency(amount)}
                      </p>

                      {/* Row 2 - Meta */}
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            isWithdrawal
                              ? "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {isWithdrawal ? "Used" : "Saved"}
                        </span>

                        <span>
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Row 2 - Actions */}
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() =>
                            openModal(entry.entryType || "deposit", entry)
                          }
                          disabled={isDeleting}
                          className="p-2 rounded-lg border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-700/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Pencil className="h-5 w-4" />
                        </button>

                        <button
                          onClick={() => onDelete(entry._id)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400 transition disabled:opacity-50 disabled:cursor-not-allowed relative"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-5 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notes (optional, below grid) */}
                    {entry.notes && (
                      <p className="text-slate-400 text-xs italic mt-2 line-clamp-2 pl-12">
                        "{entry.notes}"
                      </p>
                    )}

                    {/* Loading overlay for deleting entry */}
                    {isDeleting && (
                      <div className="absolute inset-0 bg-slate-900/50 rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                        <div className="flex items-center gap-2 text-xs text-rose-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </div>
                      </div>
                    )}
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
          size="sm"
        >
          <form onSubmit={onSubmit} className="space-y-4 p-1">
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

            <div className="rounded-lg bg-slate-900/80 border border-slate-700/60 p-3">
              {form.entryType === "withdrawal" ? (
                <>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Available to use: </span>
                    <span className="text-amber-300 font-medium">
                      {formatCurrency(availableSavingsToUse)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                    Goal-locked money is excluded from this amount.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-300 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Available to save this month: </span>
                    <span className="text-emerald-300 font-medium">
                      {formatCurrency(allowedToSave)}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
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

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
        @media (max-width: 640px) {
          /* Container spacing */
          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.75rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.75rem * var(--tw-space-y-reverse));
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
          .p-1\\.5 {
            padding: 0.25rem;
          }
          .px-2 {
            padding-left: 0.25rem;
            padding-right: 0.25rem;
          }
          .py-2\\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-12 {
            padding-top: 1.5rem;
            padding-bottom: 1.5rem;
          }
          .py-0\\.5 {
            padding-top: 0.0625rem;
            padding-bottom: 0.0625rem;
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
          .mt-1\\.5 {
            margin-top: 0.125rem;
          }
          .mt-1 {
            margin-top: 0.125rem;
          }
          .mt-0\\.5 {
            margin-top: 0.0625rem;
          }
          
          /* Typography scaling */
          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.875rem;
          }
          .text-xl {
            font-size: 1.125rem;
            line-height: 1.5rem;
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
          .w-10 {
            width: 1.75rem;
          }
          .h-10 {
            height: 1.75rem;
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
          .w-3\\.5 {
            width: 0.75rem;
          }
          .h-3\\.5 {
            height: 0.75rem;
          }
          .w-3 {
            width: 0.625rem;
          }
          .h-3 {
            height: 0.625rem;
          }
          .w-1\\.5 {
            width: 0.25rem;
          }
          .h-1\\.5 {
            height: 0.25rem;
          }
          .w-0\\.5 {
            width: 0.125rem;
          }
          .h-4 {
            height: 0.5rem;
          }
          
          /* Height adjustments */
          .h-\\[280px\\] {
            height: 200px;
          }
          .h-48 {
            height: 8rem;
          }
          .h-24 {
            height: 4rem;
          }
          .h-16 {
            height: 3rem;
          }
          
          /* Chart specific */
          .recharts-responsive-container {
            font-size: 0.625rem;
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
          
          /* Mini stat card adjustments */
          .text-base {
            font-size: 0.875rem;
          }
        }
      `}</style>
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
      value: "text-emerald-300",
    },
    amber: {
      icon: "text-amber-400",
      value: "text-amber-300",
    },
    violet: {
      icon: "text-violet-400",
      value: "text-violet-300",
    },
    cyan: {
      icon: "text-cyan-400",
      value: "text-cyan-300",
    },
  };
  const c = accentMap[accent];

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${c.icon} flex-shrink-0`} />
        <p className="text-slate-500 text-xs truncate">{title}</p>
      </div>
      <p className={`text-base font-bold ${c.value}`}>{value}</p>
    </div>
  );
}
