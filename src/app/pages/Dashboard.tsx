import { Card } from "../components/ui/Card";
import { MainLayout } from "../components/layout/MainLayout";
import {
  PiggyBank,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Activity,
  DollarSign,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from "recharts";
import { useFinance } from "../contexts/FinanceContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

// ── Custom Tooltip Components ──────────────────────────────────────────────────

const CustomBarTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-3 shadow-2xl text-xs min-w-[160px]">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-400 capitalize">{p.name}</span>
          </div>
          <span className="text-white font-semibold">
            {Number(p.value).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomLineTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-3 shadow-2xl text-xs min-w-[160px]">
      <p className="text-slate-400 font-medium mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-400 capitalize">{p.name}</span>
          </div>
          <span className="text-white font-semibold">
            {Number(p.value).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-3 shadow-2xl text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: item.payload?.color }}
        />
        <span className="text-white font-semibold">{item.name}</span>
      </div>
      <p className="text-slate-400">
        {Number(item.value).toLocaleString("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        })}
      </p>
      <p className="text-slate-500">
        {(item.payload?.percent * 100).toFixed(1)}% of total
      </p>
    </div>
  );
};

// ── Custom Legend ──────────────────────────────────────────────────────────────
const CustomLegend = ({ payload }: any) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
    {payload?.map((entry: any, i: number) => (
      <div key={i} className="flex items-center gap-1.5">
        <span
          className="w-2.5 h-2 rounded-sm"
          style={{ background: entry.color }}
        />
        <span className="text-slate-400 text-xs capitalize">{entry.value}</span>
      </div>
    ))}
  </div>
);

// ── Axis tick formatter ────────────────────────────────────────────────────────
const formatYAxis = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
};

export function Dashboard() {
  const { user } = useAuth();
  const { stats, transactions, aiInsights, investmentSummary, formatCurrency } =
    useFinance();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if essential data has loaded
    if (stats !== undefined && investmentSummary !== undefined && transactions !== undefined) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [stats, investmentSummary, transactions]);

  const savings = investmentSummary?.totals || {
    totalSaved: 0,
    totalUsed: 0,
    currentBalance: 0,
    entryCount: 0,
  };
  const currentMonthSavings = investmentSummary?.currentMonth || {
    totalIncome: 0,
    totalExpense: 0,
    savedAmount: 0,
    usedAmount: 0,
    netAmount: 0,
    remainingAmount: 0,
    monthLabel: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };

  const monthlyIncome = Number(currentMonthSavings.totalIncome || 0);
  const monthlyExpense = Number(currentMonthSavings.totalExpense || 0);
  const monthlyNet = Number(currentMonthSavings.netAmount || 0);
  const effectiveNetAfterSavings =
    monthlyNet -
    Number(currentMonthSavings.savedAmount || 0) +
    Number(currentMonthSavings.usedAmount || 0);
  const savingsActivity = investmentSummary?.monthlyActivity || [];

  const monthlyMap = new Map<string, any>();
  (stats?.monthlyTrends || []).forEach((row: any) => {
    const key = `${row.month}/${row.year}`;
    monthlyMap.set(key, {
      month: key,
      income: Number(row.income || 0),
      expenses: Number(row.expense || 0),
      savings: 0,
      savingsUsed: 0,
      net: Number(row.net || 0),
      netAfterSavings: Number(row.net || 0),
    });
  });
  savingsActivity.forEach((row: any) => {
    const key = row.label;
    const current = monthlyMap.get(key) || {
      month: key,
      income: 0,
      expenses: 0,
      savings: 0,
      savingsUsed: 0,
      net: 0,
      netAfterSavings: 0,
    };
    current.savings = Number(row.saved || 0);
    current.savingsUsed = Number(row.used || 0);
    current.netAfterSavings =
      Number(current.net || 0) - Number(row.saved || 0) + Number(row.used || 0);
    monthlyMap.set(key, current);
  });

  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
    const [mA, yA] = String(a.month).split("/").map(Number);
    const [mB, yB] = String(b.month).split("/").map(Number);
    return yA === yB ? mA - mB : yA - yB;
  });

  const CATEGORY_COLORS = [
    "#7C3AED",
    "#22D3EE",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
  ];

  const categoryData = (stats?.categoryBreakdown || [])
    .filter((row: any) => Number(row.expenseAmount || 0) > 0)
    .sort(
      (a: any, b: any) =>
        Number(b.expenseAmount || 0) - Number(a.expenseAmount || 0),
    )
    .slice(0, 6)
    .map((row: any, index: number) => ({
      name: row.categoryName,
      value: Number(row.expenseAmount),
      color: CATEGORY_COLORS[index % 6],
      percent: 0,
    }));

  const totalCategoryValue = categoryData.reduce(
    (s: number, d: any) => s + d.value,
    0,
  );
  categoryData.forEach((d: any) => {
    d.percent = totalCategoryValue > 0 ? d.value / totalCategoryValue : 0;
  });

  const topSpendingCategories = (stats?.categoryBreakdown || [])
    .filter((cat: any) => Number(cat.expenseAmount || 0) > 0)
    .sort(
      (a: any, b: any) =>
        Number(b.expenseAmount || 0) - Number(a.expenseAmount || 0),
    )
    .slice(0, 4);

  const trendData = monthlyData.map((row: any) => ({
    date: row.month,
    expenses: row.expenses,
    savings: row.savings,
    netAfterSavings: row.netAfterSavings,
  }));

  const recentTransactions = transactions.slice(0, 5).map((tx: any) => ({
    id: tx._id,
    name: tx.notes || "Transaction",
    amount: `${tx.type === "income" ? "+" : "-"}${formatCurrency(tx.amount || 0)}`,
    category: tx.categoryId?.name || "Category",
    date: new Date(tx.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    type: tx.type,
  }));

  const savingsRate =
    monthlyIncome > 0
      ? (
          (Number(currentMonthSavings.savedAmount || 0) / monthlyIncome) *
          100
        ).toFixed(1)
      : "0.0";

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
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-emerald-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated dashboard icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <BarChart3 className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading Dashboard
                </h2>

                {/* Progress bar with glow */}
                <div className="w-80 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2" />
                </div>

                {/* Dynamic loading messages */}
                <div className="space-y-1 mb-6">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    <span className="animate-pulse">
                      Crunching your financial data...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing your personalized overview
                  </p>
                </div>

                {/* KPI cards skeleton row */}
                <div className="grid grid-cols-5 gap-3 w-full mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Mini chart skeletons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {/* Pie chart skeleton */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-0.5 h-3 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
                      <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full bg-slate-700/30 border-4 border-slate-700/50 animate-pulse" />
                    </div>
                    <div className="space-y-2 mt-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-slate-700/50" />
                          <div className="h-3 w-20 bg-slate-700/30 rounded" />
                          <div className="flex-1 h-1.5 bg-slate-700/30 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bar chart skeleton */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-0.5 h-3 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
                      <div className="h-4 w-32 bg-slate-700/50 rounded animate-pulse" />
                    </div>
                    <div className="flex items-end justify-around h-32 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="w-8 bg-gradient-to-t from-slate-700/50 to-slate-700/30 rounded-t-md animate-pulse"
                          style={{ height: `${30 + i * 10}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Fetching latest insights</span>
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
        <div className="flex flex-row items-start justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              {currentMonthSavings.monthLabel}
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Financial Overview
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back,{" "}
              <span className="text-violet-300 font-medium">
                {user?.name || "User"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">
              Live Data
            </span>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard
              label="Income"
              value={formatCurrency(monthlyIncome)}
              icon={TrendingUp}
              accent="emerald"
              delta="+this month"
            />
            <KpiCard
              label="Expenses"
              value={formatCurrency(monthlyExpense)}
              icon={TrendingDown}
              accent="rose"
              delta="spending"
            />
            <KpiCard
              label="Net Balance"
              value={formatCurrency(monthlyNet)}
              icon={Wallet}
              accent="slate"
              delta="income − exp"
            />
            <KpiCard
              label="Saved"
              value={formatCurrency(currentMonthSavings.savedAmount || 0)}
              icon={PiggyBank}
              accent="green"
              delta={`${savingsRate}% rate`}
            />
            <KpiCard
              label="Net After Saving"
              value={formatCurrency(effectiveNetAfterSavings)}
              icon={Activity}
              accent={effectiveNetAfterSavings >= 0 ? "violet" : "rose"}
              delta="spendable"
            />
          </div>
        </div>

        {/* ── Savings Snapshot ────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-900/60 to-cyan-950/50 border border-emerald-800/30 p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-semibold">Savings Snapshot</p>
                <p className="text-slate-400 text-sm">
                  Track your savings activity this month
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:min-w-[480px]">
              {[
                {
                  label: "Current Balance",
                  value: formatCurrency(savings.currentBalance || 0),
                  color: "text-white",
                },
                {
                  label: "Used This Month",
                  value: formatCurrency(currentMonthSavings.usedAmount || 0),
                  color: "text-rose-300",
                },
                {
                  label: "Left to Save",
                  value: formatCurrency(
                    currentMonthSavings.remainingAmount || 0,
                  ),
                  color:
                    Number(currentMonthSavings.remainingAmount || 0) > 0
                      ? "text-emerald-300"
                      : "text-rose-300",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3.5 text-center min-w-0"
                >
                  <p className="text-slate-500 text-xs mb-1 truncate px-0.5">
                    {item.label}
                  </p>
                  <p className={`text-lg font-bold truncate ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Charts Row 1: Pie + Bar ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <SectionTitle title="Expenses by Category" />
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Breakdown of your spending categories
            </p>

            {categoryData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend below */}
                <div className="w-full mt-1 space-y-2">
                  {categoryData.map((cat: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ background: cat.color }}
                        />
                        <span className="text-slate-300 truncate max-w-[120px]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${cat.percent * 100}%`,
                              background: cat.color,
                            }}
                          />
                        </div>
                        <span className="text-slate-400 w-8 text-right">
                          {(cat.percent * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart message="No expense data available" height={220} />
            )}
          </div>

          {/* Bar Chart */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Income vs Expenses vs Savings" />
            <p className="text-slate-500 text-xs mb-4">
              Monthly comparison across all financial flows
            </p>

            {monthlyData.length > 0 &&
            monthlyData.some((d) => d.income > 0 || d.expenses > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyData} barGap={3} barCategoryGap="30%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148,163,184,0.07)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
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
                    tickFormatter={formatYAxis}
                    width={52}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgba(148,163,184,0.04)", radius: 4 }}
                  />
                  <Legend content={<CustomLegend />} />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="savings"
                    name="Saved"
                    fill="#22C55E"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="savingsUsed"
                    name="Used"
                    fill="#F59E0B"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart
                message="Add transactions to see monthly comparison"
                height={280}
              />
            )}
          </div>
        </div>

        {/* ── Line Chart ──────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <SectionTitle title="Trend Analysis" />
          <p className="text-slate-500 text-xs mb-5">
            Expenses, savings & net-after-saving over time
          </p>

          {trendData.length > 0 && trendData.some(d => d.expenses > 0 || d.savings > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
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
                  tickFormatter={formatYAxis}
                  width={52}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend content={<CustomLegend />} />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  dot={{ fill: "#EF4444", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Savings"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  dot={{ fill: "#22C55E", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="netAfterSavings"
                  name="Net After Saving"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={{ fill: "#7C3AED", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add more transactions to see trends" height={240} />
          )}
        </div>

        {/* ── Bottom Grid: Top Spending + Recent Transactions ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Top Spending Categories */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 sm:p-5">
            <SectionTitle title="Top Spending" />
            <p className="text-slate-500 text-sm sm:text-sm mb-4 sm:mb-4">
              Highest expense categories this period
            </p>

            <div className="space-y-2 sm:space-y-2.5">
              {topSpendingCategories.length > 0 ? (
                topSpendingCategories.map((cat: any, idx: number) => {
                  const maxAmt = Number(
                    topSpendingCategories[0]?.expenseAmount || 1,
                  );
                  const pct = (Number(cat.expenseAmount || 0) / maxAmt) * 100;
                  const colors = [
                    "text-violet-400",
                    "text-cyan-400",
                    "text-emerald-400",
                    "text-amber-400",
                  ];
                  const bars = [
                    "from-violet-600 to-violet-400",
                    "from-cyan-600 to-cyan-400",
                    "from-emerald-600 to-emerald-400",
                    "from-amber-600 to-amber-400",
                  ];
                  return (
                    <div
                      key={cat.categoryId}
                      className="group p-3 sm:p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <span
                            className={`text-xs sm:text-sm font-bold w-5 ${colors[idx]}`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-slate-200 text-sm sm:text-base font-medium">
                            {cat.categoryName}
                          </span>
                        </div>
                        <span className="text-rose-400 text-sm sm:text-base font-bold">
                          {formatCurrency(cat.expenseAmount || 0)}
                        </span>
                      </div>
                      <div className="h-1.5 sm:h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${bars[idx]} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-slate-500 text-sm text-center">
                  <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-slate-700 mb-2" />
                  <p className="text-xs sm:text-sm">
                    No expense transactions yet
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Recent Transactions" />
            <p className="text-slate-500 text-base sm:text-xs mb-5 sm:mb-4">
              Latest 5 recorded entries
            </p>

            <div className="space-y-3 sm:space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 sm:p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4 sm:gap-3">
                      <div
                        className={`w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 sm:w-4 sm:h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-200 text-base sm:text-sm font-medium leading-tight">
                          {tx.name}
                        </p>
                        <p className="text-slate-500 text-sm sm:text-xs mt-1 sm:mt-0.5">
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-base sm:text-sm font-bold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-10 text-slate-500 text-center">
                  <Activity className="w-10 h-10 sm:w-8 sm:h-8 text-slate-700 mb-3" />
                  <span className="text-base sm:text-sm">
                    No transactions yet
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── AI Insights ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900/60 to-cyan-950/50 border border-violet-800/30 p-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.1),transparent_60%)]" />
          <div className="relative flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-semibold">AI Insights</p>
                <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  Powered by AI
                </span>
              </div>
              <p className="text-slate-400 text-xs mb-4">
                Personalized suggestions based on your spending patterns
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  aiInsights?.topInsights || ["No AI insights available yet."]
                ).map((insight: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-violet-500/20 transition-colors"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">✨</span>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
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
          .gap-2\.5 {
            gap: 0.375rem;
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
          .p-3\.5 {
            padding: 0.5rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-2 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .px-3 {
            padding-left: 0.375rem;
            padding-right: 0.375rem;
          }
          .py-10 {
            padding-top: 1.25rem;
            padding-bottom: 1.25rem;
          }
          
          /* Margin adjustments */
          .mb-6 {
            margin-bottom: 0.75rem;
          }
          .mb-5 {
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
          .mt-1 {
            margin-top: 0.125rem;
          }
          .mt-0\.5 {
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
          .text-lg {
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
          }
          .text-base {
            font-size: 0.75rem;
            line-height: 1rem;
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
          .w-11 {
            width: 1.75rem;
          }
          .h-11 {
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
          .w-3\.5 {
            width: 0.75rem;
          }
          .h-3\.5 {
            height: 0.75rem;
          }
          .w-2\.5 {
            width: 0.5rem;
          }
          .h-2\.5 {
            height: 0.5rem;
          }
          .w-2 {
            width: 0.25rem;
          }
          .h-2 {
            height: 0.25rem;
          }
          .w-1\.5 {
            width: 0.25rem;
          }
          .h-1\.5 {
            height: 0.25rem;
          }
          .w-0\.5 {
            width: 0.125rem;
          }
          .h-4 {
            height: 0.5rem;
          }
          
          /* Chart height adjustments */
          .h-32 {
            height: 5rem;
          }
          .h-36 {
            height: 5.5rem;
          }
          .h-20 {
            height: 3.5rem;
          }
          .h-3 {
            height: 0.375rem;
          }
          
          /* Specific adjustments for ResponsiveContainer overrides */
          .recharts-responsive-container {
            font-size: 0.625rem;
          }
          
          /* KPI card specific */
          .p-4 {
            padding: 0.5rem;
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
          
          /* Savings snapshot adjustments */
          .lg\\:min-w-\\[480px\\] {
            min-width: 100%;
          }
          
          /* AI insights adjustments */
          .gap-4 {
            gap: 0.5rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 sm:gap-2 mb-3 sm:mb-1">
      <div className="w-1.5 sm:w-0.5 h-6 sm:h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
      <h3 className="text-lg sm:text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function EmptyChart({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-slate-500 text-sm"
      style={{ height }}
    >
      <Activity className="w-8 h-8 text-slate-700 mb-2" />
      {message}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  icon: any;
  accent: "emerald" | "rose" | "slate" | "green" | "violet";
  delta: string;
}) {
  const accentMap: Record<
    string,
    { icon: string; value: string; delta: string }
  > = {
    emerald: {
      icon: "text-emerald-400",
      value: "text-emerald-300",
      delta: "text-emerald-400",
    },
    rose: {
      icon: "text-rose-400",
      value: "text-rose-300",
      delta: "text-rose-400",
    },
    slate: {
      icon: "text-slate-300",
      value: "text-white",
      delta: "text-slate-400",
    },
    green: {
      icon: "text-green-400",
      value: "text-green-300",
      delta: "text-green-400",
    },
    violet: {
      icon: "text-violet-400",
      value: "text-violet-300",
      delta: "text-violet-400",
    },
  };
  const c = accentMap[accent];

  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${c.icon} flex-shrink-0`} />
        <p className="text-slate-500 text-xs truncate">{label}</p>
      </div>
      <p className={`text-m font-bold ${c.value} truncate mb-0.5`}>{value}</p>
      <p className={`text-[10px] ${c.delta}`}>{delta}</p>
    </div>
  );
}