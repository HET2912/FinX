import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { toast } from "sonner";
import { useFinance } from "../contexts/FinanceContext";
import {
  Plus,
  Edit,
  Trash2,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Heart,
  Plane,
  Film,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

const iconOptions = [
  { icon: ShoppingBag, name: "ShoppingBag" },
  { icon: Coffee, name: "Coffee" },
  { icon: Car, name: "Car" },
  { icon: Home, name: "Home" },
  { icon: Zap, name: "Zap" },
  { icon: Heart, name: "Heart" },
  { icon: Plane, name: "Plane" },
  { icon: Film, name: "Film" },
  { icon: Briefcase, name: "Briefcase" },
  { icon: TrendingUp, name: "TrendingUp" },
];

export function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory } =
    useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#7C3AED",
    type: "expense",
  });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createCategory({
        ...newCategory,
        icon: iconOptions[selectedIcon].name,
      });
      toast.success("Category created successfully");
      setIsAddModalOpen(false);
      setNewCategory({ name: "", color: "#7C3AED", type: "expense" });
      setSelectedIcon(0);
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to create category";
      toast.error(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      setSubmitting(true);
      await updateCategory(editingCategory._id, {
        ...newCategory,
        icon: iconOptions[selectedIcon].name,
      });
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setNewCategory({ name: "", color: "#7C3AED", type: "expense" });
      setSelectedIcon(0);
    } catch (err: any) {
      const apiError =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        "Failed to update category";
      toast.error(apiError);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      color: category.color,
      type: category.type,
    });
    const iconIndex = iconOptions.findIndex(
      (opt) => opt.name === category.icon,
    );
    setSelectedIcon(iconIndex >= 0 ? iconIndex : 0);
    setIsEditModalOpen(true);
  };

  const getIcon = (iconName: string) => {
    const opt = iconOptions.find((o) => o.name === iconName);
    return opt ? opt.icon : ShoppingBag;
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto px-1">
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Organize
            </p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Categories
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize your income and expense categories
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="group relative overflow-hidden inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white border-0 shadow-xl shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Add Category</span>
          </Button>
        </div>

        {/* ── Expense Categories Section ──────────────────────────── */}
        <Section
          title="Expense Categories"
          icon={ArrowDownRight}
          accentColor="rose"
          categories={categories.filter((cat) => cat.type === "expense")}
          getIcon={getIcon}
          onEdit={openEditModal}
          deleteCategory={deleteCategory}
        />

        {/* ── Income Categories Section ───────────────────────────── */}
        <Section
          title="Income Categories"
          icon={ArrowUpRight}
          accentColor="emerald"
          categories={categories.filter((cat) => cat.type === "income")}
          getIcon={getIcon}
          onEdit={openEditModal}
          deleteCategory={deleteCategory}
        />

        {/* ── Add Category Modal ──────────────────────────────────── */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create Category"
          size="md"
        >
          <form onSubmit={handleAddCategory} className="space-y-4">
            <Input
              label="Category Name"
              type="text"
              placeholder="e.g., Groceries"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
            />

            {/* Type Selector */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory({ ...newCategory, type: "expense" })
                  }
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${
                      newCategory.type === "expense"
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                        : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowDownRight className="w-4 h-4" />
                    Expense
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory({ ...newCategory, type: "income" })
                  }
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${
                      newCategory.type === "income"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </span>
                </button>
              </div>
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Choose Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((option, index) => {
                  const IconComp = option.icon;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIcon(index)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                        selectedIcon === index
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/25 scale-105"
                          : "bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Choose Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {[
                  "#7C3AED",
                  "#22D3EE",
                  "#10B981",
                  "#F59E0B",
                  "#EF4444",
                  "#EC4899",
                  "#8B5CF6",
                  "#F97316",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`aspect-square rounded-xl transition-all duration-200 hover:scale-110 ${
                      newCategory.color === color
                        ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-lg"
                        : "hover:ring-1 hover:ring-white/30"
                    }`}
                    style={{ backgroundColor: color }}
                  />
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
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                }}
              >
                {submitting ? "Creating…" : "Create Category"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ── Edit Category Modal ─────────────────────────────────── */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
            setNewCategory({ name: "", color: "#7C3AED", type: "expense" });
            setSelectedIcon(0);
          }}
          title="Edit Category"
          size="md"
        >
          <form onSubmit={handleEditCategory} className="space-y-4">
            <Input
              label="Category Name"
              type="text"
              placeholder="e.g., Groceries"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
            />

            {/* Type Selector */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory({ ...newCategory, type: "expense" })
                  }
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${
                      newCategory.type === "expense"
                        ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                        : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowDownRight className="w-4 h-4" />
                    Expense
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewCategory({ ...newCategory, type: "income" })
                  }
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                    ${
                      newCategory.type === "income"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-300 hover:border-slate-600"
                    }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <ArrowUpRight className="w-4 h-4" />
                    Income
                  </span>
                </button>
              </div>
            </div>

            {/* Icon Selector */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Choose Icon
              </label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((option, index) => {
                  const IconComp = option.icon;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIcon(index)}
                      className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                        selectedIcon === index
                          ? "bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/30 scale-105"
                          : "bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-slate-500 text-xs mb-1.5">
                Choose Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {[
                  "#7C3AED",
                  "#22D3EE",
                  "#10B981",
                  "#F59E0B",
                  "#EF4444",
                  "#EC4899",
                  "#8B5CF6",
                  "#F97316",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`aspect-square rounded-xl transition-all duration-200 hover:scale-110 ${
                      newCategory.color === color
                        ? "ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110 shadow-lg"
                        : "hover:ring-1 hover:ring-white/30"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategory(null);
                  setNewCategory({
                    name: "",
                    color: "#7C3AED",
                    type: "expense",
                  });
                  setSelectedIcon(0);
                }}
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
                {submitting ? "Updating…" : "Update Category"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}

// ── Reusable Section Component ─────────────────────────────────────────────────
function Section({
  title,
  icon: IconComponent,
  accentColor,
  categories,
  getIcon,
  onEdit,
  deleteCategory,
}: {
  title: string;
  icon: any;
  accentColor: "rose" | "emerald";
  categories: any[];
  getIcon: (name: string) => any;
  onEdit: (category: any) => void;
  deleteCategory: (id: string) => void;
}) {
  const accentText = accentColor === "rose" ? "text-rose-400" : "text-emerald-400";
  const accentBorder = accentColor === "rose" ? "border-rose-500/20" : "border-emerald-500/20";
  const accentBg = accentColor === "rose" ? "bg-rose-500/10" : "bg-emerald-500/10";

  return (
    <div className="space-y-4">
      {/* Section Header with Dashboard style divider */}
      <div className="flex items-center gap-2">
        <div className="w-0.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-400 rounded-full" />
        <div className={`p-1.5 rounded-lg ${accentBg} border ${accentBorder}`}>
          <IconComponent className={`w-3.5 h-3.5 ${accentText}`} />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="text-slate-500 text-xs ml-1">({categories.length})</span>
      </div>

      {categories.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-12 text-center">
          <div className="flex flex-col items-center text-slate-500 text-sm">
            <Plus className="w-8 h-8 text-slate-700 mb-2" />
            <p>No {title.toLowerCase()} yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Create your first category to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((category) => {
            const IconComponent = getIcon(category.icon);
            return (
              <div
                key={category._id || category.id}
                className="group relative overflow-hidden bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 hover:border-slate-700/80 hover:bg-slate-800/60 transition-all duration-200"
              >
                <div className="flex flex-col h-full">
                  {/* Header: Icon + Name + Transaction count */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <IconComponent
                        className="w-6 h-6"
                        style={{ color: category.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-white truncate">
                        {category.name}
                      </h3>
                      <p className="text-slate-500 text-xs">
                        {category.transactions || 0} transactions
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-700/40 mt-auto">
                    <button
                      onClick={() => onEdit(category)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/40 text-xs transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category._id)}
                      className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}