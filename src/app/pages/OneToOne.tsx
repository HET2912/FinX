import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { api } from "../lib/api";
import { useFinance } from "../contexts/FinanceContext";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  RefreshCw,
  Handshake,
  Sparkles,
} from "lucide-react";

type OneToOneEntry = {
  _id: string;
  value: number; // signed: + means you owe, - means they owe you
  reason: string;
  owe: boolean;
  date: string;
};

type OneToOneSplit = {
  _id: string;
  name: string;
  amount: OneToOneEntry[];
  net: number;
};

const normalizeName = (name: string) => name.trim().toLowerCase();

const toDateInputValue = (d: Date) => d.toISOString().split("T")[0];

export function OneToOne() {
  const { formatCurrency } = useFinance();

  const [loading, setLoading] = useState(true);
  const [splits, setSplits] = useState<OneToOneSplit[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [addForm, setAddForm] = useState({
    name: "",
    owe: true,
    amount: "",
    reason: "",
    date: toDateInputValue(new Date()),
  });

  const [editTarget, setEditTarget] = useState<{
    name: string;
    entry: OneToOneEntry;
  } | null>(null);

  const [editForm, setEditForm] = useState({
    owe: true,
    amount: "",
    reason: "",
    date: toDateInputValue(new Date()),
  });

  const fetchSplits = async () => {
    const res = await api.get("/one-to-one-split");
    setSplits(res.data.splits || []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchSplits();
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load 1-to-1 splits";
        toast.error(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    let youOwe = 0; // sum of positive values
    let theyOwe = 0; // abs sum of negative values

    splits.forEach((s) => {
      (s.amount || []).forEach((e) => {
        const v = Number(e.value) || 0;
        if (v > 0) youOwe += v;
        if (v < 0) theyOwe += Math.abs(v);
      });
    });

    const net = theyOwe - youOwe; // + means you will receive overall
    return { youOwe, theyOwe, net };
  }, [splits]);

  const openEdit = (name: string, entry: OneToOneEntry) => {
    setEditTarget({ name, entry });
    setEditForm({
      owe: Boolean(entry.owe),
      amount: String(Math.abs(Number(entry.value) || 0)),
      reason: entry.reason || "",
      date: toDateInputValue(new Date(entry.date)),
    });
    setIsEditOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = normalizeName(addForm.name);
    if (!name) {
      toast.error("Please enter a name");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/one-to-one-split", {
        name,
        owe: addForm.owe,
        amount: Number(addForm.amount),
        reason: addForm.reason,
        date: addForm.date,
      });
      await fetchSplits();
      setIsAddOpen(false);
      setAddForm({
        name: "",
        owe: true,
        amount: "",
        reason: "",
        date: toDateInputValue(new Date()),
      });
      toast.success("Added to 1-to-1 split");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add split entry";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setSubmitting(true);
      await api.patch(
        `/one-to-one-split/${encodeURIComponent(editTarget.name)}/entries/${editTarget.entry._id}`,
        {
          owe: editForm.owe,
          amount: Number(editForm.amount),
          reason: editForm.reason,
          date: editForm.date,
        },
      );
      await fetchSplits();
      setIsEditOpen(false);
      setEditTarget(null);
      toast.success("Updated entry");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update entry";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (name: string, entryId: string) => {
    try {
      await api.delete(
        `/one-to-one-split/${encodeURIComponent(name)}/entries/${entryId}`,
      );
      await fetchSplits();
      toast.success("Deleted entry");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete entry";
      toast.error(msg);
    }
  };

  const handleDeleteFriend = async (name: string) => {
    try {
      await api.delete(`/one-to-one-split/${encodeURIComponent(name)}`);
      await fetchSplits();
      toast.success("Deleted record");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete record";
      toast.error(msg);
    }
  };

  const handleSettle = async (name: string) => {
    try {
      await api.post(`/one-to-one-split/${encodeURIComponent(name)}/settle`);
      await fetchSplits();
      toast.success("Settled");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to settle";
      toast.error(msg);
    }
  };

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
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-cyan-500/10 to-transparent rounded-br-3xl pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                {/* Animated handshake icon */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-xl opacity-40 animate-pulse" />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-xl">
                    <Handshake className="w-12 h-12 text-transparent bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text animate-pulse" />
                    {/* Orbiting dots */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-emerald-400 animate-[ping_2s_ease-in-out_infinite]" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-cyan-400 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite_1s]" />
                  </div>
                </div>

                {/* Loading text with shimmer effect */}
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 mb-3 animate-shimmer bg-[length:200%_100%]">
                  Loading 1-to-1 Splits
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
                      Fetching your split records...
                    </span>
                  </p>
                  <p className="text-slate-500 text-xs">
                    Preparing your balance summary
                  </p>
                </div>

                {/* Summary cards skeleton */}
                <div className="grid grid-cols-3 gap-3 w-full mb-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 bg-slate-800/30 rounded-xl border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>

                {/* Friend card skeletons */}
                <div className="space-y-3 w-full">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
                          <div>
                            <div className="h-4 w-24 bg-slate-700/50 rounded mb-1" />
                            <div className="h-3 w-16 bg-slate-700/30 rounded" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-16 bg-slate-700/40 rounded-lg" />
                          <div className="h-7 w-16 bg-slate-700/40 rounded-lg" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="h-3 bg-slate-700/50 rounded" />
                          <div className="h-3 bg-slate-700/50 rounded" />
                          <div className="h-3 bg-slate-700/50 rounded" />
                          <div className="h-3 bg-slate-700/50 rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Refresh hint */}
                <div className="mt-6 flex items-center gap-1.5 text-slate-600 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span>Loading your split dashboard</span>
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
        {/* Header */}
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          {/* Row 1: Heading + Button */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
                Split Management
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                1-to-1 split
              </h1>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] flex-shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden xs:inline">Add Entry</span>
              <span className="relative z-10">Add New Entry</span>
            </Button>
          </div>

          {/* Row 2: Description paragraph */}
          <p className="text-slate-400 text-sm">
            Track who owes whom — with reasons for every entry
          </p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 bg-gradient-to-b from-rose-500 to-violet-500 rounded-full" />
              <h3 className="text-sm font-semibold text-white">You Pay</h3>
            </div>
            <p className="text-2xl font-bold text-rose-400">
              −{formatCurrency(totals.youOwe)}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              (entries that <span className="text-rose-400">you pay</span>)
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 bg-gradient-to-b from-emerald-500 to-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-white">You Receive</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              +{formatCurrency(totals.theyOwe)}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              (entries that{" "}
              <span className="text-emerald-400">you receive</span>)
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
              <h3 className="text-sm font-semibold text-white">Grand Total</h3>
            </div>
            <p
              className={`text-2xl font-bold ${
                totals.net >= 0 ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {totals.net >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totals.net))}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Overall (Receive − Pay)
            </p>
          </div>
        </div>

        {/* Friend groups */}
        <div className="space-y-4">
          {splits.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-10 text-center">
              <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-300 font-semibold">No entries yet</p>
              <p className="text-slate-500 text-sm mt-1">
                Add your first 1-to-1 split entry.
              </p>
            </div>
          ) : (
            splits.map((s) => {
              const youPay = (s.amount || [])
                .filter((e) => (Number(e.value) || 0) > 0)
                .reduce((acc, e) => acc + (Number(e.value) || 0), 0);
              const youReceive = (s.amount || [])
                .filter((e) => (Number(e.value) || 0) < 0)
                .reduce((acc, e) => acc + Math.abs(Number(e.value) || 0), 0);
              const friendNet = youReceive - youPay;

              const entries = [...(s.amount || [])].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

              return (
                <div
                  key={s._id}
                  className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center">
                        <Handshake className="w-5 h-5 text-cyan-300" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg capitalize">
                          {s.name}
                        </h3>
                        <p className="text-slate-500 text-xs">
                          {entries.length} entr
                          {entries.length === 1 ? "y" : "ies"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        −{formatCurrency(youPay)}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                        +{formatCurrency(youReceive)}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          friendNet >= 0
                            ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-200"
                            : "bg-violet-500/10 border-violet-500/20 text-violet-200"
                        }`}
                      >
                        Net {friendNet >= 0 ? "+" : "−"}
                        {formatCurrency(Math.abs(friendNet))}
                      </span>

                      <button
                        onClick={() => handleSettle(s.name)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/70 border border-slate-700/60 text-slate-200 hover:bg-slate-800/70 transition-all"
                        title="Settle (clear entries)"
                      >
                        Settle
                      </button>
                      <button
                        onClick={() => handleDeleteFriend(s.name)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/70 border border-slate-700/60 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all inline-flex items-center gap-1.5"
                        title="Delete this friend record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700/40">
                          <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium">
                            Reason
                          </th>
                          <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((e) => {
                          const date = new Date(e.date);
                          const showMinus = Boolean(e.owe);
                          const abs = Math.abs(Number(e.value) || 0);
                          return (
                            <tr
                              key={e._id}
                              className="group border-b border-slate-700/30 hover:bg-slate-800/40 transition-all duration-200"
                            >
                              <td className="py-4 px-4 text-slate-300 text-sm whitespace-nowrap">
                                {date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-4 px-4 text-slate-300 text-sm w-full">
                                <span
                                  className="block truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[200px] md:max-w-none"
                                  title={e.reason || "—"}
                                >
                                  {e.reason || "—"}
                                </span>
                              </td>
                              <td
                                className={`py-4 px-4 text-right font-bold text-sm whitespace-nowrap ${
                                  showMinus
                                    ? "text-rose-400"
                                    : "text-emerald-400"
                                }`}
                              >
                                {showMinus ? "−" : "+"}
                                {formatCurrency(abs)}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEdit(s.name, e)}
                                    className="w-9 h-9 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-center hover:bg-slate-800/70 transition-all"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4 text-slate-200" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteEntry(s.name, e._id)
                                    }
                                    className="w-9 h-9 rounded-xl bg-slate-900/70 border border-slate-700/60 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-300" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add modal */}
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add 1-to-1 entry"
          size="md"
        >
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Name
              </label>
              <input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                placeholder="john"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, owe: true })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    addForm.owe
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                      : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  − I owe
                </button>
                <button
                  type="button"
                  onClick={() => setAddForm({ ...addForm, owe: false })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    !addForm.owe
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  + They owe me
                </button>
              </div>
            </div>

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
                  value={addForm.amount}
                  onChange={(e) =>
                    setAddForm({ ...addForm, amount: e.target.value })
                  }
                  placeholder="0"
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Reason
              </label>
              <input
                value={addForm.reason}
                onChange={(e) =>
                  setAddForm({ ...addForm, reason: e.target.value })
                }
                placeholder="Dinner, Petrol, etc."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={addForm.date}
                onChange={(e) =>
                  setAddForm({ ...addForm, date: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
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
                {submitting ? "Adding…" : "Add"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit modal */}
        <Modal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditTarget(null);
          }}
          title="Edit entry"
          size="md"
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, owe: true })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    editForm.owe
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                      : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  − I owe
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, owe: false })}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    !editForm.owe
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                  }`}
                >
                  + They owe me
                </button>
              </div>
            </div>

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
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  required
                  className="w-full bg-transparent py-2.5 text-white text-sm placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Reason
              </label>
              <input
                value={editForm.reason}
                onChange={(e) =>
                  setEditForm({ ...editForm, reason: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm placeholder-slate-600 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white text-sm outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditTarget(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !editTarget}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      </div>

      {/* ── Responsive overrides for mobile (max-width: 640px) ── */}
      <style>{`
      /* Truncate long text on mobile, show full on hover */
@media (max-width: 640px) {
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  /* Show full text on hover/tap for mobile */
  td span.truncate:hover {
    overflow: visible;
    white-space: normal;
    word-break: break-word;
    background-color: #1e293b;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    position: relative;
    z-index: 10;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }
}
      /* Custom breakpoint for extra small screens */
@media (min-width: 480px) {
  .xs\\:inline {
    display: inline !important;
  }
}
@media (max-width: 479px) {
  .xs\\:hidden {
    display: none !important;
  }
}
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
          .gap-4 {
            gap: 0.5rem;
          }
          .gap-3 {
            gap: 0.375rem;
          }
          .gap-2 {
            gap: 0.25rem;
          }
          .gap-1\\.5 {
            gap: 0.125rem;
          }
          
          /* Padding adjustments */
          .p-5 {
            padding: 0.75rem;
          }
          .p-10 {
            padding: 1.25rem;
          }
          .px-4 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .px-3 {
            padding-left: 0.375rem;
            padding-right: 0.375rem;
          }
          .py-4 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .py-3 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-2\\.5 {
            padding-top: 0.375rem;
            padding-bottom: 0.375rem;
          }
          .py-1\\.5 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .pt-1 {
            padding-top: 0.125rem;
          }
          
          /* Margin adjustments */
          .mb-4 {
            margin-bottom: 0.5rem;
          }
          .mb-2 {
            margin-bottom: 0.25rem;
          }
          .mb-1\\.5 {
            margin-bottom: 0.125rem;
          }
          .mb-1 {
            margin-bottom: 0.125rem;
          }
          .mt-1 {
            margin-top: 0.125rem;
          }
          .mr-1 {
            margin-right: 0.125rem;
          }
          
          /* Typography scaling */
          .text-3xl {
            font-size: 1.5rem;
            line-height: 1.875rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .text-lg {
            font-size: 1rem;
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
          .w-6 {
            width: 1rem;
          }
          .h-6 {
            height: 1rem;
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
          .w-0\\.5 {
            width: 0.125rem;
          }
          .h-4 {
            height: 0.5rem;
          }
          
          /* Table cell adjustments */
          .max-w-\\[520px\\] {
            max-width: 150px;
          }
          
          /* Border radius */
          .rounded-2xl {
            border-radius: 0.75rem;
          }
          .rounded-xl {
            border-radius: 0.5rem;
          }
        }
      `}</style>
    </MainLayout>
  );
}
