import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Brain,
  Clock,
  Wallet,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Zap,
  Shield,
  TrendingDown as TrendDown,
  Star,
  CheckCircle2,
  CircleDot,
  LayoutDashboard,
} from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { api } from "../lib/api";

const AI_INSIGHTS_CACHE_KEY = "finx.ai.comprehensive.cache";
const AI_INSIGHTS_SIGNATURE_KEY = "finx.ai.comprehensive.signature";

interface AIInsights {
  monthlyAnalysis: {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
    topCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    spendingTrends: Array<{ month: string; income: number; expenses: number }>;
  };
  futurePlanning: {
    projectedSavings: Array<{ month: string; amount: number }>;
    financialGoals: Array<{
      goal: string;
      timeline: string;
      monthlySavings: number;
    }>;
    riskAssessment: string;
    recommendations: string[];
  };
  personalizedAdvice: {
    immediateActions: string[];
    monthlyHabits: string[];
    longTermStrategies: string[];
  };
}

export function AI() {
  const { formatCurrency, transactions, investments, goals } = useFinance();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const dataSignature = JSON.stringify({
    transactions: (transactions || []).map((tx: any) => ({
      id: tx._id,
      amount: tx.amount,
      type: tx.type,
      categoryId:
        typeof tx.categoryId === "object" ? tx.categoryId?._id : tx.categoryId,
      date: tx.date,
      updatedAt: tx.updatedAt,
      createdAt: tx.createdAt,
    })),
    investments: (investments || []).map((entry: any) => ({
      id: entry._id,
      amount: entry.amount ?? entry.investedAmount,
      investedAmount: entry.investedAmount,
      entryType: entry.entryType,
      type: entry.type,
      date: entry.date,
      createdAt: entry.createdAt,
    })),
    goals: (goals || []).map((goal: any) => ({
      id: goal._id,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      status: goal.status,
      completedAt: goal.completedAt,
    })),
  });

  useEffect(() => {
    const cachedSignature = sessionStorage.getItem(AI_INSIGHTS_SIGNATURE_KEY);
    const cachedInsights = sessionStorage.getItem(AI_INSIGHTS_CACHE_KEY);

    if (cachedSignature === dataSignature && cachedInsights) {
      try {
        setInsights(JSON.parse(cachedInsights));
        setLoading(false);
        return;
      } catch (error) {
        sessionStorage.removeItem(AI_INSIGHTS_CACHE_KEY);
        sessionStorage.removeItem(AI_INSIGHTS_SIGNATURE_KEY);
      }
    }

    generateComprehensiveInsights();
  }, [dataSignature]);

  const generateComprehensiveInsights = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedSignature = sessionStorage.getItem(
          AI_INSIGHTS_SIGNATURE_KEY,
        );
        const cachedInsights = sessionStorage.getItem(AI_INSIGHTS_CACHE_KEY);
        if (cachedSignature === dataSignature && cachedInsights) {
          setInsights(JSON.parse(cachedInsights));
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      const response = await api.get("/ai/comprehensive-insights");
      if (response.data.success) {
        setInsights(response.data.insights);
        sessionStorage.setItem(
          AI_INSIGHTS_CACHE_KEY,
          JSON.stringify(response.data.insights),
        );
        sessionStorage.setItem(AI_INSIGHTS_SIGNATURE_KEY, dataSignature);
      }
    } catch (error) {
      console.error("Error fetching comprehensive insights:", error);
      setInsights({
        monthlyAnalysis: {
          income: 0,
          expenses: 0,
          savings: 0,
          savingsRate: 0,
          topCategories: [],
          spendingTrends: [],
        },
        futurePlanning: {
          projectedSavings: [],
          financialGoals: [],
          riskAssessment: "Error loading data",
          recommendations: ["Please check your connection and try again"],
        },
        personalizedAdvice: {
          immediateActions: ["Check your internet connection"],
          monthlyHabits: ["Ensure you're logged in"],
          longTermStrategies: ["Contact support if issues persist"],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskConfig = (assessment: string) => {
    const lower = assessment.toLowerCase();
    if (lower.includes("high"))
      return {
        color: "text-rose-400",
        bg: "bg-rose-500/10",
        border: "border-rose-500/25",
        dot: "bg-rose-400",
        label: "High Risk",
      };
    if (lower.includes("medium"))
      return {
        color: "text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/25",
        dot: "bg-amber-400",
        label: "Medium Risk",
      };
    return {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      dot: "bg-emerald-400",
      label: "Low Risk",
    };
  };

  const categoryColors = [
    {
      bar: "from-violet-500 to-purple-500",
      text: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      bar: "from-cyan-500 to-blue-500",
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    {
      bar: "from-emerald-500 to-teal-500",
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      bar: "from-amber-500 to-orange-500",
      text: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      bar: "from-rose-500 to-pink-500",
      text: "text-rose-400",
      bg: "bg-rose-500/10",
    },
  ];

  // ── Beautiful Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-1">
          <div className="relative max-w-2xl w-full">
            {/* Animated background glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-violet-600/20 via-cyan-500/20 to-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Main loading card */}
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-10 shadow-2xl shadow-black/20">
              {/* Decorative corner gradients */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-tl-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated AI brain icon */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <Brain className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Analyzing Your Finances
                </h2>

                {/* Progress bar with glow */}
                <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2" />
                </div>

                {/* Dynamic loading messages */}
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    <span className="animate-pulse">
                      Crunching numbers with AI...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    This may take a few moments
                  </p>
                </div>

                {/* Mini stat cards skeleton */}
                <div className="grid grid-cols-3 gap-3 w-full mt-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-800/40 rounded-xl border border-slate-700/30 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
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

  if (!insights) {
    return (
      <MainLayout>
        <div className="space-y-6 max-w-[1600px] mx-auto px-1">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No Insights Available
              </h2>
              <p className="text-slate-400 text-sm max-w-md mb-6">
                We couldn't load your financial insights. Add transactions or
                try refreshing.
              </p>
              <Button
                onClick={() => generateComprehensiveInsights(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const riskConfig = getRiskConfig(insights.futurePlanning.riskAssessment);
  const maxSavings = Math.max(
    ...insights.futurePlanning.projectedSavings.map((p) => p.amount),
    1,
  );

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Row 1: Heading + Button */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                AI Powered
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Financial Advisor
              </h1>
            </div>
            <button
              onClick={() => generateComprehensiveInsights(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-sm font-medium hover:bg-slate-700/60 hover:text-white transition-all disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden xs:inline">
                {loading ? "Analyzing..." : "Refresh Analysis"}
              </span>
              <span className="xs:hidden">{loading ? "..." : "Refresh"}</span>
            </button>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Personalized insights based on your financial data
          </p>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          <KpiCard
            label="Total Income"
            value={formatCurrency(insights.monthlyAnalysis.income)}
            icon={ArrowUpRight}
            accent="emerald"
            delta="This Month"
          />
          <KpiCard
            label="Total Expenses"
            value={formatCurrency(insights.monthlyAnalysis.expenses)}
            icon={ArrowDownRight}
            accent="rose"
            delta="This Month"
          />
          <KpiCard
            label="Net Savings"
            value={formatCurrency(insights.monthlyAnalysis.savings)}
            icon={PiggyBank}
            accent={insights.monthlyAnalysis.savings >= 0 ? "violet" : "rose"}
            delta={`${insights.monthlyAnalysis.savingsRate.toFixed(1)}% rate`}
            colSpanFull
          />
        </div>

        {/* ── Spending Breakdown + Projections ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Top Spending Categories */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Spending Breakdown" />
            <p className="text-slate-500 text-xs mb-4">
              Top expense categories this period
            </p>

            <div className="space-y-3">
              {insights.monthlyAnalysis.topCategories.length > 0 ? (
                insights.monthlyAnalysis.topCategories.map((cat, i) => {
                  const col = categoryColors[i % categoryColors.length];
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${col.bar}`}
                          />
                          <span className="text-slate-300 text-sm font-medium">
                            {cat.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">
                            {cat.percentage.toFixed(0)}%
                          </span>
                          <span className={`text-xs font-semibold ${col.text}`}>
                            {formatCurrency(cat.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${col.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyChart message="No spending data available" height={160} />
              )}
            </div>
          </div>

          {/* Projected Savings Chart */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <SectionTitle title="Projected Savings" />
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                +
                {formatCurrency(
                  insights.futurePlanning.projectedSavings[
                    insights.futurePlanning.projectedSavings.length - 1
                  ]?.amount ?? 0,
                )}{" "}
                total
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              12-month cumulative forecast
            </p>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-32 mb-4">
              {insights.futurePlanning.projectedSavings
                .slice(0, 12)
                .map((p, i) => {
                  const heightPct = (p.amount / maxSavings) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1 group"
                    >
                      <div
                        className="w-full relative"
                        style={{ height: "100px" }}
                      >
                        <div
                          className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-emerald-600/60 to-emerald-400/80 group-hover:from-emerald-500/80 group-hover:to-emerald-300 transition-all duration-200"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-[9px] font-medium">
                        {p.month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Monthly list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/40">
              {insights.futurePlanning.projectedSavings
                .slice(0, 6)
                .map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center px-3 py-2 bg-slate-800/40 rounded-lg"
                  >
                    <span className="text-slate-400 text-xs">{p.month}</span>
                    <span className="text-emerald-400 text-xs font-bold">
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── Goals + Risk + Recommendations ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Left column: Risk + Goals */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Risk Assessment */}
            <div
              className={`bg-slate-900/60 border rounded-2xl p-5 ${riskConfig.border}`}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
                <Shield className={`w-4 h-4 ${riskConfig.color}`} />
                <h3 className="text-sm font-semibold text-white">
                  Risk Assessment
                </h3>
              </div>
              <p className={`text-lg font-bold mb-1 ${riskConfig.color}`}>
                {insights.futurePlanning.riskAssessment}
              </p>
              <p className="text-slate-400 text-xs">
                Based on current savings rate & goals
              </p>
            </div>

            {/* Financial Goals */}
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex-1">
              <SectionTitle title="Financial Goals" />
              <p className="text-slate-500 text-xs mb-4">
                {insights.futurePlanning.financialGoals.length} active goals
              </p>
              <div className="space-y-2">
                {insights.futurePlanning.financialGoals.length > 0 ? (
                  insights.futurePlanning.financialGoals.map((goal, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-800/40 border border-slate-700/30 rounded-xl"
                    >
                      <h4 className="text-slate-200 text-sm font-medium mb-1.5">
                        {goal.goal}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-slate-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{goal.timeline}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400 text-xs font-bold">
                            {formatCurrency(goal.monthlySavings)}
                            <span className="text-slate-500 font-normal">
                              /mo
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No active goals
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Recommendations */}
          <div className="lg:col-span-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="AI Recommendations" />
            <p className="text-slate-500 text-xs mb-4">
              Actionable steps to improve your finances
            </p>
            <div className="space-y-2">
              {insights.futurePlanning.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3.5 bg-slate-800/40 border border-slate-700/30 rounded-xl hover:border-slate-600/50 hover:bg-slate-800/60 transition-all duration-200"
                >
                  <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-violet-400 text-xs font-bold">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
              {insights.futurePlanning.recommendations.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No recommendations
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Plan ───────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <SectionTitle title="Personalized Action Plan" />
          <p className="text-slate-500 text-xs mb-5">
            Step-by-step roadmap for financial growth
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700/40">
            {/* Immediate Actions */}
            <div className="py-4 md:py-0 md:pr-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Immediate
                </span>
                <span className="ml-auto text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  Now
                </span>
              </div>
              <div className="space-y-2">
                {insights.personalizedAdvice.immediateActions.map(
                  (action, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-400 text-[10px] font-bold">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{action}</p>
                    </div>
                  ),
                )}
                {insights.personalizedAdvice.immediateActions.length === 0 && (
                  <p className="text-slate-500 text-xs">No immediate actions</p>
                )}
              </div>
            </div>

            {/* Monthly Habits */}
            <div className="py-4 md:py-0 md:px-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Monthly Habits
                </span>
                <span className="ml-auto text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                  Recurring
                </span>
              </div>
              <div className="space-y-2">
                {insights.personalizedAdvice.monthlyHabits.map((habit, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-400 text-xs">{habit}</p>
                  </div>
                ))}
                {insights.personalizedAdvice.monthlyHabits.length === 0 && (
                  <p className="text-slate-500 text-xs">No monthly habits</p>
                )}
              </div>
            </div>

            {/* Long-term Strategies */}
            <div className="pt-4 md:pt-0 md:pl-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Long-term
                </span>
                <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Strategic
                </span>
              </div>
              <div className="space-y-2">
                {insights.personalizedAdvice.longTermStrategies.map(
                  (strategy, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-400 text-xs">{strategy}</p>
                    </div>
                  ),
                )}
                {insights.personalizedAdvice.longTermStrategies.length ===
                  0 && (
                  <p className="text-slate-500 text-xs">
                    No long-term strategies
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
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
        @media (max-width: 640px) {
          /* Reduce container spacing */
          .space-y-6 {
            --tw-space-y-reverse: 0;
            margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(1rem * var(--tw-space-y-reverse));
          }
          .gap-5 {
            gap: 0.75rem;
          }
          .gap-3 {
            gap: 0.5rem;
          }
          .gap-2 {
            gap: 0.375rem;
          }
          .p-5 {
            padding: 0.75rem;
          }
          .p-4 {
            padding: 0.625rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .p-3\.5 {
            padding: 0.625rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .py-2 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .px-3 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-1 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .mb-8 {
            margin-bottom: 1rem;
          }
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
          .mt-8 {
            margin-top: 1rem;
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
          .rounded-2xl {
            border-radius: 0.75rem;
          }
          .rounded-xl {
            border-radius: 0.625rem;
          }
          .rounded-lg {
            border-radius: 0.5rem;
          }
          
          /* Typography scaling */
          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.875rem;
          }
          .text-2xl {
            font-size: 1.25rem;
            line-height: 1.625rem;
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
          .text-\\[9px\\] {
            font-size: 0.5rem;
          }
          .text-\\[10px\\] {
            font-size: 0.5625rem;
          }
          
          /* Icon sizing */
          .w-4 {
            width: 0.875rem;
          }
          .h-4 {
            height: 0.875rem;
          }
          .w-5 {
            width: 1rem;
          }
          .h-5 {
            height: 1rem;
          }
          .w-6 {
            width: 1.125rem;
          }
          .h-6 {
            height: 1.125rem;
          }
          .w-8 {
            width: 1.25rem;
          }
          .h-8 {
            height: 1.25rem;
          }
          .w-12 {
            width: 1.75rem;
          }
          .h-12 {
            height: 1.75rem;
          }
          .w-16 {
            width: 2.25rem;
          }
          .h-16 {
            height: 2.25rem;
          }
          .w-24 {
            width: 3rem;
          }
          .h-24 {
            height: 3rem;
          }
          .w-64 {
            width: 10rem;
          }
          
          /* Bar chart adjustments */
          .h-32 {
            height: 6rem;
          }
          .h-1\.5 {
            height: 0.25rem;
          }
          
          /* Spacing for specific containers */
          .space-y-3 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.5rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.5rem * var(--tw-space-y-reverse));
          }
          .space-y-2 {
            --tw-space-y-reverse: 0;
            margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
          }
          
          /* Loading screen adjustments */
          .p-10 {
            padding: 1.25rem;
          }
        }
      `}</style>
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
      <BarChart3 className="w-8 h-8 text-slate-700 mb-2" />
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
