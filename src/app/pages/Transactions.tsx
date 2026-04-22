import { useMemo, useState, useEffect, useRef } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import {
  Plus,
  Paperclip,
  Sparkles,
  X,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
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
    time: new Date().toTimeString().slice(0, 5),
    notes: "",
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Track which row is expanded (notes visible) on mobile
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Set loading to false once data is available
  useEffect(() => {
    if (transactions !== undefined && categories !== undefined) {
      const timer = setTimeout(() => setLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [transactions, categories]);

  // Filtered category options for the filter dropdown (depends on selected type)
  const filteredCategoryOptions = useMemo(() => {
    let filtered = categories;
    if (filters.type !== "all") {
      filtered = categories.filter(
        (cat: any) => cat.type?.toLowerCase() === filters.type,
      );
    }
    const opts = filtered.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    }));
    return [{ value: "all", label: "All Categories" }, ...opts];
  }, [categories, filters.type]);

  // When the type filter changes, ensure the selected category is still valid.
  useEffect(() => {
    if (filters.category === "all") return;
    const isValid = filteredCategoryOptions.some(
      (opt) => opt.value === filters.category,
    );
    if (!isValid) {
      setFilters((prev) => ({ ...prev, category: "all" }));
    }
  }, [filters.type, filteredCategoryOptions, filters.category]);

  // Category options for the Add Transaction form – filtered by selected type
  const addFormCategoryOptions = useMemo(() => {
    const filtered = categories.filter(
      (cat: any) => cat.type?.toLowerCase() === newTransaction.type,
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
          typeof tx.categoryId === "object"
            ? tx.categoryId?._id
            : tx.categoryId;
        if (txCategoryId !== filters.category) return false;
      }
      if (filters.dateFrom && txDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && txDate > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [transactions, filters]);

  const resetForm = () => {
    setNewTransaction({
      amount: "",
      type: "expense",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      notes: "",
    });
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.categoryId) {
      toast.error(`Please select an ${newTransaction.type} category`);
      return;
    }

    try {
      setSubmitting(true);

      // Combine date + time into a single ISO datetime string
      const combinedDate = newTransaction.time
        ? `${newTransaction.date}T${newTransaction.time}:00`
        : newTransaction.date;

      // Build a FormData payload so the file travels as multipart/form-data
      const formData = new FormData();
      formData.append("amount", newTransaction.amount);
      formData.append("type", newTransaction.type);
      formData.append("categoryId", newTransaction.categoryId);
      formData.append("date", combinedDate);
      formData.append("notes", newTransaction.notes);
      if (attachmentFile) {
        formData.append("attachment", attachmentFile);
      }

      await createTransaction(formData as any);
      setIsAddModalOpen(false);
      resetForm();
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

  // ─── Beautiful Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center px-1">
          <div className="relative max-w-5xl w-full">
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
                {/* Animated transactions icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <RefreshCw className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text animate-spin-slow" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading Transactions
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
                      Fetching your transaction records...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing your financial timeline
                  </p>
                </div>

                {/* Filters skeleton */}
                <div className="w-full bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-3 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
                    <div className="h-4 w-16 bg-slate-700/50 rounded" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-slate-700/30 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                </div>

                {/* Table skeleton */}
                <div className="w-full bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-0.5 h-3 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
                    <div className="h-4 w-32 bg-slate-700/50 rounded" />
                  </div>
                  <div className="space-y-2">
                    {/* Table header */}
                    <div className="grid grid-cols-5 gap-4 px-4 py-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-3 bg-slate-700/50 rounded" />
                      ))}
                    </div>
                    {/* Table rows */}
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="grid grid-cols-5 gap-4 px-4 py-3 border-t border-slate-700/30"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className="h-4 bg-slate-700/40 rounded" />
                        <div className="h-4 bg-slate-700/40 rounded" />
                        <div className="h-4 bg-slate-700/40 rounded" />
                        <div className="h-4 bg-slate-700/40 rounded" />
                        <div className="h-4 bg-slate-700/40 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Loading your transaction history</span>
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
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-shimmer {
            animation: shimmer 3s linear infinite;
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
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
                Manage Records
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Transactions
              </h1>
            </div>
            {/* ── Add Transaction Button ── always shows full label ── */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="add-txn-btn group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0 whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-4 h-4 relative z-10 flex-shrink-0" />
              <span className="relative z-10">Add Transaction</span>
            </Button>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Track all your income and expenses
          </p>
        </div>

        {/* ── Filters Card ────────────────────────────────────────── */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
            <h3 className="text-sm font-semibold text-white">Filters</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {/* Category filter – scrollable on mobile */}
            <div className="col-span-1 relative overflow-hidden filter-select-wrap">
              <Select
                label="Category"
                options={filteredCategoryOptions}
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full"
                style={{ maxWidth: "100%" }}
              />
            </div>
            <div className="col-span-1">
              <Select
                label="Type"
                options={typeOptions}
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Input
                label="From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>
            <div className="col-span-1">
              <Input
                label="To"
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>
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
                  {/* Desktop-only columns */}
                  <th className="desktop-col text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Txn ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Date & Time
                  </th>
                  {/* Notes hidden on mobile */}
                  <th className="desktop-col text-left py-3 px-4 text-slate-500 text-xs font-medium">
                    Notes
                  </th>
                  <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium">
                    Amount
                  </th>
                  <th className="text-center py-3 px-4 text-slate-500 text-xs font-medium">
                    {/* Show a paperclip icon as header on mobile */}
                    <span className="desktop-col">Attachment</span>
                    <Paperclip className="mobile-col w-3.5 h-3.5 text-slate-500 mx-auto" />
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
                    const isExpanded = expandedRow === transaction._id;
                    return (
                      <>
                        <tr
                          key={transaction._id}
                          className="group border-b border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200 mobile-row"
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : transaction._id)
                          }
                        >
                          {/* Txn ID – desktop only */}
                          <td className="desktop-col py-4 px-4">
                            <span className="font-mono text-xs text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-1 rounded-lg tracking-wider">
                              #{transaction._id?.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          {/* Date & Time */}
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
                          {/* Notes – desktop only */}
                          <td className="desktop-col py-4 px-4 text-slate-300 text-sm max-w-xs truncate">
                            {transaction.notes || "—"}
                          </td>
                          {/* Amount */}
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
                          {/* Attachment */}
                          <td className="py-4 px-4 text-center">
                            {Boolean(transaction.attachmentUrl) ? (
                              <a
                                href={transaction.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View attachment"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-violet-400 transition-colors mx-auto" />
                              </a>
                            ) : (
                              /* Mobile expand chevron when no attachment */
                              <ChevronDown
                                className={`mobile-col w-3.5 h-3.5 text-slate-600 mx-auto transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            )}
                          </td>
                        </tr>
                        {/* Mobile notes expansion row */}
                        {isExpanded && transaction.notes && (
                          <tr
                            key={`${transaction._id}-notes`}
                            className="mobile-col border-b border-slate-700/20 bg-slate-800/20"
                          >
                            <td colSpan={5} className="px-4 py-2.5">
                              <p className="text-slate-400 text-xs leading-relaxed">
                                <span className="text-slate-600 mr-1">
                                  Notes:
                                </span>
                                {transaction.notes}
                              </p>
                            </td>
                          </tr>
                        )}
                      </>
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
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
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
                <Select
                  value={newTransaction.categoryId}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all appearance-none cursor-pointer"
                  style={{ colorScheme: "dark" }}
                  options={addFormCategoryOptions}
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
                </Select>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 text-xs mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      date: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs mb-1.5">
                  Time
                </label>
                <input
                  type="time"
                  value={newTransaction.time}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                  style={{ colorScheme: "dark" }}
                />
              </div>
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

            {/* Attachment upload */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Attachment
              </label>

              {/* Hidden real file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setAttachmentFile(file);
                }}
              />

              {attachmentFile ? (
                /* Selected file preview */
                <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-violet-500/40 bg-violet-500/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-4 h-4 text-violet-400 shrink-0" />
                    <span className="text-slate-200 text-sm truncate">
                      {attachmentFile.name}
                    </span>
                    <span className="text-slate-500 text-xs shrink-0">
                      ({(attachmentFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Drop-zone trigger */
                <label
                  className="flex flex-col items-center gap-2 px-4 py-5 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/80 text-slate-400 text-sm cursor-pointer transition-all hover:border-violet-500/40 hover:text-slate-300 hover:bg-violet-500/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                  Click to upload or drag &amp; drop
                  <span className="text-slate-600 text-xs">
                    Images &amp; PDFs up to 5 MB
                  </span>
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
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

      <style>{`
  /* ─── Desktop: .mobile-col hidden, .desktop-col visible ─── */
  .mobile-col { display: none; }
  .desktop-col { display: table-cell; }

  /* ─── Custom breakpoint xs ─── */
  @media (min-width: 480px) {
    .xs\\:inline { display: inline !important; }
  }
  @media (max-width: 479px) {
    .xs\\:hidden { display: none !important; }
  }

  /* ══════════════════════════════════════════════════════════
     MOBILE OVERRIDES  (≤ 640 px)
  ══════════════════════════════════════════════════════════ */
  @media (max-width: 640px) {

    /* ── 1. Add Transaction button – always full label ── */
    .add-txn-btn {
      padding: 0.5rem 0.875rem !important;
      font-size: 0.75rem !important;
      gap: 0.375rem !important;
    }
    .add-txn-btn svg {
      width: 0.875rem !important;
      height: 0.875rem !important;
    }

    /* ── 2. Category dropdown – fixed height + scrollable ── */
    .filter-select-wrap select,
    .filter-select-wrap select:focus {
      max-height: 180px !important;
      overflow-y: auto !important;
    }
    /* Native selects open a system picker on iOS/Android –
       size attribute makes it a listbox on capable browsers */
    .filter-select-wrap select {
      /* Show ~4 options before scrolling on desktop-webview */
      size: 1;
    }

    /* ── 3. Table: hide desktop-only columns, show mobile helpers ── */
    .desktop-col { display: none !important; }
    .mobile-col  { display: table-cell !important; }

    /* Make rows tappable */
    .mobile-row { cursor: pointer; }

    /* Tighten table cells */
    table td, table th {
      padding-top: 0.625rem !important;
      padding-bottom: 0.625rem !important;
      padding-left: 0.5rem !important;
      padding-right: 0.5rem !important;
    }

    /* ── General spacing / typography reductions ── */
    .space-y-6 { --tw-space-y-reverse:0; margin-top:calc(0.75rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom:calc(0.75rem * var(--tw-space-y-reverse)); }
    .space-y-4 { --tw-space-y-reverse:0; margin-top:calc(0.5rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom:calc(0.5rem * var(--tw-space-y-reverse)); }
    .gap-4 { gap: 0.5rem; }
    .gap-3 { gap: 0.375rem; }
    .gap-2 { gap: 0.375rem; }

    .p-5   { padding: 0.75rem; }
    .p-4   { padding: 0.5rem; }
    .md\\:p-5 { padding: 0.5rem; }
    .px-4  { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3  { padding-left: 0.375rem; padding-right: 0.375rem; }
    .px-2  { padding-left: 0.25rem; padding-right: 0.25rem; }
    .py-5  { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4  { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3  { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-2\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-2  { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-12 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .pt-1  { padding-top: 0.125rem; }

    .mb-6  { margin-bottom: 0.75rem; }
    .mb-4  { margin-bottom: 0.5rem; }
    .mb-3  { margin-bottom: 0.375rem; }
    .md\\:mb-4 { margin-bottom: 0.375rem; }
    .mb-2  { margin-bottom: 0.25rem; }
    .mb-1\\.5 { margin-bottom: 0.125rem; }
    .mb-1  { margin-bottom: 0.125rem; }
    .mt-6  { margin-top: 0.75rem; }
    .mt-1  { margin-top: 0.125rem; }
    .mt-0\\.5 { margin-top: 0.0625rem; }
    .mr-1  { margin-right: 0.125rem; }

    .text-3xl { font-size: 1.5rem; line-height: 1.875rem; }
    .text-sm  { font-size: 0.75rem; line-height: 1rem; }
    .text-xs  { font-size: 0.625rem; line-height: 0.875rem; }

    .w-12 { width: 2rem; }  .h-12 { height: 2rem; }
    .w-8  { width: 1.25rem; } .h-8  { height: 1.25rem; }
    .w-4  { width: 0.75rem; } .h-4  { height: 0.75rem; }
    .w-3\\.5 { width: 0.75rem; } .h-3\\.5 { height: 0.75rem; }
    .w-3  { width: 0.625rem; } .h-3  { height: 0.625rem; }

    .max-w-xs { max-width: 6rem; }
    .h-10 { height: 2rem; }

    .rounded-2xl { border-radius: 0.75rem; }
    .rounded-xl  { border-radius: 0.5rem; }
    .rounded-lg  { border-radius: 0.375rem; }

    select {
      max-width: 100% !important;
      width: 100% !important;
      font-size: 0.75rem !important;
      padding: 0.375rem 0.5rem !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    select option {
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      padding: 0.5rem 0.75rem !important;
      font-size: 0.75rem !important;
    }
    input[type="date"] {
      font-size: 0.75rem !important;
      padding: 0.375rem 0.5rem !important;
    }
    label {
      font-size: 0.625rem !important;
      margin-bottom: 0.125rem !important;
    }
    .relative select { position: relative; z-index: 10; }
  }

  /* ── Ensure select never overflows on any screen ── */
  select { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
`}</style>
    </MainLayout>
  );
}
