import { useMemo, useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { Plus, Paperclip, Filter, Download, Sparkles, X } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export function Transactions() {
  const { transactions, categories, createTransaction, formatCurrency } =
    useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    type: "expense",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filtered category options for the filter dropdown (depends on selected type)
  const filteredCategoryOptions = useMemo(() => {
    let filtered = categories;
    if (filters.type !== "all") {
      filtered = categories.filter(
        (cat: any) => cat.type?.toLowerCase() === filters.type
      );
    }
    const opts = filtered.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    }));
    return [{ value: "all", label: "All Categories" }, ...opts];
  }, [categories, filters.type]);

  // When the type filter changes, ensure the selected category is still valid.
  // If not, reset to "all".
  useEffect(() => {
    if (filters.category === "all") return;
    const isValid = filteredCategoryOptions.some(
      (opt) => opt.value === filters.category
    );
    if (!isValid) {
      setFilters((prev) => ({ ...prev, category: "all" }));
    }
  }, [filters.type, filteredCategoryOptions, filters.category]);

  // Category options for the Add Transaction form – filtered by selected type
  const addFormCategoryOptions = useMemo(() => {
    const filtered = categories.filter(
      (cat: any) => cat.type?.toLowerCase() === newTransaction.type
    );
    return filtered.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    }));
  }, [categories, newTransaction.type]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: any) => {
      const txDate = new Date(tx.date);
      if (filters.type !== "all" && tx.type !== filters.type) return false;

      if (filters.category !== "all") {
        const txCategoryId =
          typeof tx.categoryId === "object" ? tx.categoryId?._id : tx.categoryId;
        if (txCategoryId !== filters.category) return false;
      }

      if (filters.dateFrom && txDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && txDate > new Date(filters.dateTo)) return false;

      return true;
    });
  }, [transactions, filters]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.categoryId) {
      toast.error(`Please select an ${newTransaction.type} category`);
      return;
    }

    try {
      setSubmitting(true);
      await createTransaction({
        amount: Number(newTransaction.amount),
        type: newTransaction.type,
        categoryId: newTransaction.categoryId,
        date: newTransaction.date,
        notes: newTransaction.notes,
      });
      setIsAddModalOpen(false);
      setNewTransaction({
        amount: "",
        type: "expense",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      toast.success("Transaction added successfully");
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to add transaction";
      toast.error(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Manage Records
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Transactions
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Track all your income and expenses
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add Transaction</span>
          </Button>
        </div>

        {/* ── Filters Card ────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Category"
              options={filteredCategoryOptions}
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            />
            <Select
              label="Type"
              options={typeOptions}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            />
            <Input
              label="From Date"
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
            <Input
              label="To Date"
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* ── Transactions Table Card ─────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">
              Transaction History
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/40">
                  <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Txn ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Notes
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 text-xs font-medium">
                    Attachment
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center text-slate-500 text-sm">
                        <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                        <p>No transactions found</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction: any) => {
                    const txDate = new Date(transaction.date);
                    return (
                      <tr
                        key={transaction._id}
                        className="group border-b border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200"
                      >
                        <td className="py-4 px-4">
                          <span className="font-mono text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-1 rounded-lg tracking-wider">
                            #{transaction._id?.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-200 text-sm font-medium">
                            {txDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="block text-slate-500 text-xs mt-0.5">
                            {txDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-300 text-sm max-w-xs truncate">
                          {transaction.notes || "—"}
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-bold text-sm ${
                            transaction.type === "income"
                              ? "text-emerald-400"
                              : "text-rose-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "−"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {Boolean(transaction.attachmentUrl) && (
                            <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Add Transaction Modal ───────────────────────────────── */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Transaction"
          size="md"
        >
          <form onSubmit={handleAddTransaction} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Amount
              </label>
              <div className="flex items-center rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 transition-all focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                <span className="text-slate-400 text-sm font-medium mr-1">
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      const first = categories.find((c: any) => c.type === t);
                      setNewTransaction({
                        ...newTransaction,
                        type: t,
                        categoryId: first?._id || "",
                      });
                    }}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                      ${
                        newTransaction.type === t
                          ? t === "expense"
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                            : "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                      }`}
                  >
                    {t === "expense" ? "− Expense" : "+ Income"}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Category
              </label>
              {addFormCategoryOptions.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  No {newTransaction.type} categories. Create one in Categories
                  first.
                </div>
              ) : (
                <select
                  value={newTransaction.categoryId}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
                  style={{ colorScheme: "dark" }}
                >
                  {addFormCategoryOptions.map((opt: any) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      className="bg-slate-900"
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={newTransaction.date}
                onChange={(e) =>
                  setNewTransaction({ ...newTransaction, date: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                style={{ colorScheme: "dark" }}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Notes
              </label>
              <textarea
                rows={3}
                value={newTransaction.notes}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    notes: e.target.value,
                  })
                }
                placeholder="Add notes about this transaction..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none"
              />
            </div>

            {/* Upload */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Attachment
              </label>
              <label className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/80 text-slate-400 text-sm cursor-pointer transition-all hover:border-violet-500/40 hover:text-slate-300 hover:bg-violet-500/5">
                <Paperclip className="w-4 h-4" />
                Click to upload or drag & drop
              </label>
            </div>

            {/* Actions */}
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
                disabled={submitting || !newTransaction.categoryId}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {submitting ? "Adding…" : "Add Transaction"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}