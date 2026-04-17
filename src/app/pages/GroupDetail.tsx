import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  Plus,
  User,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Users,
  Wallet,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Receipt,
  CreditCard,
  Shield,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useFinance } from "../contexts/FinanceContext";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    getGroupDetails,
    getGroupExpenses,
    getGroupBalanceSheet,
    addGroupExpense,
    updateGroupExpense,
    deleteGroupExpense,
    settleGroupExpense,
    deleteGroup,
    addGroupMember,
    formatCurrency,
  } = useFinance();
  const { user } = useAuth();

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: [] as string[],
  });

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [g, e, b] = await Promise.all([
        getGroupDetails(id),
        getGroupExpenses(id),
        getGroupBalanceSheet(id),
      ]);
      setGroup(g);
      setExpenses(e);
      setBalanceSheet(b);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const share =
        Number(expenseForm.amount) / expenseForm.splitBetween.length;
      const payload = editingExpense
        ? {
            description: expenseForm.description,
            amount: Number(expenseForm.amount),
            splitBetween: expenseForm.splitBetween.map((userId) => ({
              userId,
              share,
              settled: false,
            })),
          }
        : {
            description: expenseForm.description,
            amount: Number(expenseForm.amount),
            paidBy: expenseForm.paidBy,
            splitBetween: expenseForm.splitBetween.map((userId) => ({
              userId,
              share,
              settled: false,
            })),
          };

      if (editingExpense) {
        await updateGroupExpense(editingExpense._id, payload);
        toast.success("Expense updated");
      } else {
        await addGroupExpense(id, payload);
        toast.success("Expense added");
      }

      setIsExpenseModalOpen(false);
      setEditingExpense(null);
      setExpenseForm({
        description: "",
        amount: "",
        paidBy: "",
        splitBetween: [],
      });
      fetchDetails();
    } catch (err) {
      toast.error("Failed to save expense");
    }
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      paidBy: expense.paidBy?._id || expense.paidBy,
      splitBetween:
        expense.splitBetween?.map((s: any) => s.userId._id || s.userId) || [],
    });
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteGroupExpense(expenseId);
      toast.success("Expense deleted");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleSettleExpense = async (expenseId: string, userId: string) => {
    try {
      await settleGroupExpense(expenseId, userId);
      toast.success("Marked as settled");
      fetchDetails();
    } catch (err) {
      toast.error("Failed to settle");
    }
  };

  const toggleMemberSelection = (memberId: string) => {
    setExpenseForm((prev) => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(memberId)
        ? prev.splitBetween.filter((id) => id !== memberId)
        : [...prev.splitBetween, memberId],
    }));
  };

  const currentUserId = user?._id || user?.id || "";
  const creatorId = group?.createdBy?._id || group?.createdBy || "";
  const isCreator = Boolean(
    currentUserId && creatorId && String(currentUserId) === String(creatorId),
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !memberEmail.trim()) return;
    try {
      setAddingMember(true);
      await addGroupMember(id, { email: memberEmail.trim().toLowerCase() });
      toast.success("Member added");
      setMemberEmail("");
      fetchDetails();
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to add member";
      toast.error(apiError);
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!id || !group) return;
    if (!window.confirm(`Delete group "${group.name}"?`)) return;
    try {
      await deleteGroup(id);
      toast.success("Group deleted");
      navigate("/groups");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to delete";
      toast.error(apiError);
    }
  };

  if (loading)
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
            <span className="text-slate-500 text-sm tracking-wide">
              Loading group
            </span>
          </div>
        </div>
      </MainLayout>
    );

  if (!group)
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-rose-400 text-sm">Group not found</div>
        </div>
      </MainLayout>
    );

  const getNetForUser = (userId: string) =>
    Number(balanceSheet?.netByUser?.[userId] || 0);

  const memberOwes = (balanceSheet?.settlements || []).filter(
    (s: any) => String(s.from) === String(currentUserId),
  );
  const memberToReceive = (balanceSheet?.settlements || []).filter(
    (s: any) => String(s.to) === String(currentUserId),
  );
  const getMemberName = (userId: string) =>
    group.members?.find((m: any) => String(m._id) === String(userId))?.name ||
    "Member";

  const youOweAmount = (balanceSheet?.settlements || []).reduce(
    (sum: number, s: any) =>
      String(s.from) === String(currentUserId) ? sum + Number(s.amount) : sum,
    0,
  );
  const youAreOwedAmount = (balanceSheet?.settlements || []).reduce(
    (sum: number, s: any) =>
      String(s.to) === String(currentUserId) ? sum + Number(s.amount) : sum,
    0,
  );

  const netBalance = youAreOwedAmount - youOweAmount;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/groups")}
              className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                Group Details
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {group.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isCreator
                      ? "bg-violet-500/10 border border-violet-500/20 text-violet-400"
                      : "bg-slate-800/60 border border-slate-700/60 text-slate-400"
                  }`}
                >
                  {isCreator ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {isCreator ? "Owner" : "Member"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>{group.members?.length || 0} members</span>
                <span className="text-slate-600">•</span>
                <span>{expenses.length} expenses</span>
                <span className="text-slate-600">•</span>
                <span>{formatCurrency(totalExpenses)} total</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCreator && (
              <button
                onClick={handleDeleteGroup}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Group
              </button>
            )}
            {isCreator ? (
              <Button
                onClick={() => {
                  setEditingExpense(null);
                  setExpenseForm((prev) => ({
                    ...prev,
                    paidBy:
                      group.createdBy?._id || group.members?.[0]?._id || "",
                    splitBetween: group.members?.map((m: any) => m._id) || [],
                  }));
                  setIsExpenseModalOpen(true);
                }}
                className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Plus className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Add Expense</span>
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                Only owner can add expenses
              </div>
            )}
          </div>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="You Owe"
            value={formatCurrency(youOweAmount)}
            icon={ArrowUpRight}
            accent="rose"
            delta={youOweAmount > 0 ? "Outstanding" : "All clear"}
          />
          <KpiCard
            label="You're Owed"
            value={formatCurrency(youAreOwedAmount)}
            icon={ArrowDownLeft}
            accent="emerald"
            delta={youAreOwedAmount > 0 ? "Receivable" : "Nothing due"}
          />
          <KpiCard
            label="Net Balance"
            value={formatCurrency(netBalance)}
            icon={TrendingUp}
            accent={netBalance >= 0 ? "emerald" : "rose"}
            delta={
              netBalance > 0
                ? "Positive"
                : netBalance < 0
                  ? "Negative"
                  : "Neutral"
            }
          />
          <KpiCard
            label="Group Total"
            value={formatCurrency(totalExpenses)}
            icon={Wallet}
            accent="violet"
            delta={`${expenses.length} transaction${expenses.length !== 1 ? "s" : ""}`}
          />
        </div>

        {/* ── Alert Banners ───────────────────────────────────────── */}
        {(!isCreator && memberOwes.length > 0) ||
        (isCreator && memberToReceive.length > 0) ? (
          <div className="space-y-2">
            {!isCreator && memberOwes.length > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-2">
                      Payments Due
                    </p>
                    <div className="space-y-1">
                      {memberOwes.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs text-rose-300"
                        >
                          <span>Pay to {getMemberName(item.to)}</span>
                          <span className="font-mono font-medium text-rose-400">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCreator && memberToReceive.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 w-full">
                <div className="flex gap-4">
                  {/* Icon */}
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />

                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Title */}
                    <p className="text-white font-semibold text-base sm:text-lg">
                      Pending Collections
                    </p>

                    {/* List */}
                    <div className="space-y-3">
                      {memberToReceive.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-4"
                        >
                          {/* Left text */}
                          <span className="text-sm text-emerald-200 truncate">
                            {getMemberName(item.from)} owes you
                          </span>

                          {/* Amount (properly aligned) */}
                          <span
                            className="
                font-mono 
                text-lg sm:text-xl 
                font-bold 
                text-emerald-400 
                tracking-tight 
                text-right 
                min-w-[90px]
              "
                          >
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ── Main Content Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Members Panel */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Members" />
            <p className="text-slate-500 text-xs mb-4">
              {group.members?.length || 0} members in this group
            </p>

            {isCreator && (
              <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
                <Input
                  type="email"
                  placeholder="Add by email..."
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={addingMember}
                  className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0"
                >
                  {addingMember ? "..." : <Plus className="w-4 h-4" />}
                </Button>
              </form>
            )}

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {group.members?.map((member: any) => {
                const net = getNetForUser(member._id);
                const isCurrentUser =
                  String(member._id) === String(currentUserId);
                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isCurrentUser
                            ? "bg-gradient-to-br from-violet-500/30 to-cyan-500/30 border border-violet-500/40 text-violet-300"
                            : "bg-slate-700/50 border border-slate-600/40 text-slate-300"
                        }`}
                      >
                        {(member.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-white truncate max-w-[100px]">
                            {member.name || "Member"}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-[120px]">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {Math.abs(net) < 0.01 ? (
                        <span className="text-xs text-slate-500">Settled</span>
                      ) : net > 0 ? (
                        <div>
                          <p className="text-[10px] text-slate-500">owes</p>
                          <p className="text-sm font-mono font-medium text-emerald-400">
                            {formatCurrency(net)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-[10px] text-slate-500">you owe</p>
                          <p className="text-sm font-mono font-medium text-rose-400">
                            {formatCurrency(Math.abs(net))}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expenses Panel */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <SectionTitle title="Expenses" />
            <p className="text-slate-500 text-xs mb-4">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""}{" "}
              recorded
            </p>

            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-white font-medium mb-1">No expenses yet</p>
                <p className="text-slate-500 text-xs mb-5">
                  {isCreator
                    ? "Add the first expense to get started"
                    : "Waiting for the owner to add expenses"}
                </p>
                {isCreator && (
                  <Button
                    onClick={() => {
                      setEditingExpense(null);
                      setExpenseForm((prev) => ({
                        ...prev,
                        paidBy:
                          group.createdBy?._id || group.members?.[0]?._id || "",
                        splitBetween:
                          group.members?.map((m: any) => m._id) || [],
                      }));
                      setIsExpenseModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add First Expense
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto">
                {expenses.map((expense) => {
                  const userSplit = expense.splitBetween?.find(
                    (s: any) =>
                      String(s.userId._id || s.userId) ===
                      String(currentUserId),
                  );
                  const isSettled = userSplit?.settled || false;
                  const isPending = userSplit && !isSettled;

                  return (
                    <div
                      key={expense._id}
                      className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isPending
                                ? "bg-rose-500/10 border border-rose-500/20"
                                : isSettled
                                  ? "bg-emerald-500/10 border border-emerald-500/20"
                                  : "bg-slate-700/40 border border-slate-600/40"
                            }`}
                          >
                            <CreditCard
                              className={`w-4 h-4 ${
                                isPending
                                  ? "text-rose-400"
                                  : isSettled
                                    ? "text-emerald-400"
                                    : "text-slate-400"
                              }`}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-white truncate">
                                {expense.description}
                              </p>
                              {isPending && (
                                <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                  Pending
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-xs text-slate-400">
                                Paid by{" "}
                                <span className="text-slate-300">
                                  {expense.paidBy?.name || "User"}
                                </span>
                              </span>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-xs text-slate-400">
                                Split {expense.splitBetween?.length || 0} ways
                              </span>
                              <span className="text-slate-600 text-xs">•</span>
                              <span className="text-xs text-slate-500">
                                {new Date(expense.date).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            </div>
                            {isPending && (
                              <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400">
                                Your share:{" "}
                                <span className="font-mono font-medium">
                                  {formatCurrency(userSplit.share)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-mono font-semibold text-white">
                            {formatCurrency(expense.amount)}
                          </p>
                          <p className="text-xs text-cyan-400">
                            <span className="font-mono">
                              {formatCurrency(
                                expense.amount /
                                  (expense.splitBetween?.length || 1),
                              )}
                            </span>{" "}
                            each
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-slate-700/40 to-transparent my-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isCreator && (
                            <>
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense._id)}
                                className="flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-medium bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </>
                          )}
                        </div>

                        {userSplit &&
                          (isSettled ? (
                            <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> Paid
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleSettleExpense(expense._id, currentUserId)
                              }
                              className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-500/30 to-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:from-emerald-500/40 hover:to-emerald-500/30 transition-all"
                            >
                              <Clock className="w-3 h-3" /> Mark Paid
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Settle Up Footer ────────────────────────────────────── */}
        <div>
          {youOweAmount > 0 || youAreOwedAmount > 0 ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900/60 to-cyan-950/50 border border-violet-800/30 p-5">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(124,58,237,0.1),transparent_60%)]" />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      Ready to settle up?
                    </p>
                    <p className="text-slate-400 text-xs">
                      Clear all outstanding balances and keep your group tidy.
                    </p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-500/30 transition-all">
                  <CheckCircle className="w-4 h-4" />
                  Settle All
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">
                  All settled up — no outstanding balances
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Add/Edit Expense Modal ───────────────────────────────── */}
        <Modal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
            setExpenseForm({
              description: "",
              amount: "",
              paidBy: "",
              splitBetween: [],
            });
          }}
          title={editingExpense ? "Edit Expense" : "New Expense"}
          size="sm"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            <Input
              label="Description"
              type="text"
              placeholder="e.g., Team dinner"
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
              required
            />

            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, amount: e.target.value })
              }
              required
            />

            {!editingExpense && (
              <div>
                <label className="block text-slate-500 text-xs mb-1.5">
                  Paid By
                </label>
                <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 text-sm">
                  {group.createdBy?.name || "Group creator"}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-slate-500 text-xs">
                  Split Between
                </label>
                <span className="text-xs text-slate-500">
                  {expenseForm.splitBetween.length} selected
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto">
                {group.members?.map((member: any) => {
                  const selected = expenseForm.splitBetween.includes(
                    member._id,
                  );
                  return (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => toggleMemberSelection(member._id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                        selected
                          ? "bg-gradient-to-r from-violet-500/30 to-cyan-500/30 border border-violet-500/40 text-white"
                          : "bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:bg-slate-800/60 hover:text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-slate-700/50 text-slate-400"
                        }`}
                      >
                        {(member.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="text-xs truncate">
                        {member.name || member.email}
                      </span>
                    </button>
                  );
                })}
              </div>
              {expenseForm.splitBetween.length === 0 && (
                <p className="text-xs text-rose-400 mt-1.5">
                  Select at least one member
                </p>
              )}
            </div>

            {expenseForm.amount && expenseForm.splitBetween.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-xs text-slate-400">Each member pays</span>
                <span className="font-mono text-sm font-semibold text-cyan-400">
                  {formatCurrency(
                    Number(expenseForm.amount) /
                      expenseForm.splitBetween.length,
                  )}
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !expenseForm.description ||
                  !expenseForm.amount ||
                  expenseForm.splitBetween.length === 0
                }
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {editingExpense ? "Update" : "Add Expense"}
              </button>
            </div>
          </form>
        </Modal>
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
  accent: "emerald" | "rose" | "violet";
  delta: string;
}) {
  const accentMap = {
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
    <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 hover:border-slate-700/80 transition-all duration-200">
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
