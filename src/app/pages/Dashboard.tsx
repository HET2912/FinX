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

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
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
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">
              Live Data
            </span>
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
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
            colSpanFull
          />
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
                  className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3.5 text-center"
                >
                  <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                  <p className={`text-lg font-bold ${item.color}`}>
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
        </div>

        {/* ── Bottom Grid: Top Spending + Recent Transactions ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Top Spending Categories */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Top Spending" />
            <p className="text-slate-500 text-xs mb-4">
              Highest expense categories this period
            </p>

            <div className="space-y-2.5">
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
                      className="group p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-xs font-bold w-5 ${colors[idx]}`}
                          >
                            #{idx + 1}
                          </span>
                          <span className="text-slate-200 text-sm font-medium">
                            {cat.categoryName}
                          </span>
                        </div>
                        <span className="text-rose-400 text-sm font-bold">
                          {formatCurrency(cat.expenseAmount || 0)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${bars[idx]} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm text-center">
                  <DollarSign className="w-8 h-8 text-slate-700 mb-2" />
                  No expense transactions yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Recent Transactions" />
            <p className="text-slate-500 text-xs mb-4">
              Latest 5 recorded entries
            </p>

            <div className="space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "income" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}
                      >
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium leading-tight">
                          {tx.name}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {tx.category} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm text-center">
                  <Activity className="w-8 h-8 text-slate-700 mb-2" />
                  No transactions yet
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
    </MainLayout>
  );
}

// ── Helper Components ──────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
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
  colSpanFull,
}: {
  label: string;
  value: string;
  icon: any;
  accent: "emerald" | "rose" | "slate" | "green" | "violet";
  delta: string;
  colSpanFull?: boolean;
}) {
  const accentMap: Record<
    string,
    { icon: string; bg: string; border: string; text: string; grad: string }
  > = {
    emerald: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      grad: "from-emerald-500/10 to-transparent",
    },
    rose: {
      icon: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      text: "text-rose-400",
      grad: "from-rose-500/10 to-transparent",
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
    violet: {
      icon: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      text: "text-violet-400",
      grad: "from-violet-500/10 to-transparent",
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
          <p className={`text-xs mt-1 ${c.text}`}>{delta}</p>
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
