"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import {
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Notebook,
  Tag,
  Loader2,
  X,
  ArrowUpRight,
  TrendingUp,
  Briefcase,
  Edit2,
} from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
}

interface PaymentModeData {
  _id: string;
  name: string;
  type: string;
  color: string;
}

interface IncomeData {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  mode?: string;
  date: string;
}

const FALLBACK_INCOME_CATEGORIES = [
  { _id: "inc_1", name: "Salary", type: "income" as const, color: "#0984e3" },
  { _id: "inc_2", name: "Bonus", type: "income" as const, color: "#00B894" },
  { _id: "inc_3", name: "Freelance", type: "income" as const, color: "#FD79A8" },
  { _id: "inc_4", name: "Interest", type: "income" as const, color: "#FFA000" },
];

export default function IncomeTrackerPage() {
  const [incomes, setIncomes] = useState<IncomeData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentModeData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeData | null>(null);

  // Form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incRes, catRes, payRes] = await Promise.all([
        fetch("/api/income"),
        fetch("/api/categories"),
        fetch("/api/payment-modes"),
      ]);

      const incData = await incRes.json();
      const catData = await catRes.json();
      const payData = await payRes.json();

      if (incRes.ok && incData.incomes) {
        setIncomes(incData.incomes);
      }

      if (catRes.ok && catData.categories) {
        const incomeCats = catData.categories.filter((c: any) => c.type === "income");
        setCategories(incomeCats.length > 0 ? incomeCats : FALLBACK_INCOME_CATEGORIES);
      } else {
        setCategories(FALLBACK_INCOME_CATEGORIES);
      }

      if (payRes.ok && payData.paymentModes) {
        setPaymentModes(payData.paymentModes);
      }
    } catch (error) {
      toast.error("Failed to load income data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pre-fill states for adding
  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setAmount("");
    setCategory(categories[0]?.name || "Salary");
    setNote("");
    setMode(paymentModes[0]?.name || "Cash");
    setDate(new Date().toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  // Pre-fill states for editing
  const handleOpenEditModal = (inc: IncomeData) => {
    setEditingIncome(inc);
    setAmount(inc.amount.toString());
    setCategory(inc.category);
    setNote(inc.note || "");
    setMode(inc.mode || paymentModes[0]?.name || "Cash");
    setDate(new Date(inc.date).toISOString().split("T")[0]);
    setShowAddModal(true);
  };

  const handleAddOrEditIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingIncome ? `/api/income/${editingIncome._id}` : "/api/income";
      const method = editingIncome ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          note: note || undefined,
          mode: mode || undefined,
          date: new Date(date),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save income log.");
      }

      toast.success(editingIncome ? "Income updated successfully!" : "Income logged successfully!");
      setShowAddModal(false);
      
      // Clear form
      setAmount("");
      setNote("");
      
      // Reload logs
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income log?")) return;

    try {
      const response = await fetch(`/api/income/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete income log.");
      }

      toast.success("Income record deleted successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  // Calculations for Metrics
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  
  // Calculate current month's income
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthIncome = incomes
    .filter((inc) => {
      const d = new Date(inc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, inc) => sum + inc.amount, 0);

  // Salary category total
  const salaryTotal = incomes
    .filter((inc) => inc.category.toLowerCase() === "salary")
    .reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <DashboardShell>
      <div className="space-y-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Income Tracker</h2>
            <p className="text-[11px] text-muted-foreground">Log and manage your salaries, freelancing payments, and earnings.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 self-start px-3.5 py-2 rounded-lg bg-primary text-white text-[11px] font-semibold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Log Income
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total Lifetime Income */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-card relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">Total Income Logged</p>
              <h3 className="text-base font-semibold text-foreground truncate">₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-success/5 blur-xl" />
          </div>

          {/* Current Month Income */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-card relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">This Month's Earnings</p>
              <h3 className="text-base font-semibold text-foreground truncate">₹{currentMonthIncome.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-primary/5 blur-xl" />
          </div>

          {/* Aggregate Salary Earning */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-card relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info shrink-0">
              <Briefcase className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">Total Salary Credited</p>
              <h3 className="text-base font-semibold text-foreground truncate">₹{salaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-info/5 blur-xl" />
          </div>
        </div>

        {/* Income History List */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-card space-y-3.5">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Income Log
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {incomes.length} records
              </span>
            </h3>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : incomes.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground font-medium italic">
              No incomes logged yet. Click &quot;Log Income&quot; above to log your monthly salary or deposits.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="pb-1.5 pt-0.5">S.N</th>
                    <th className="pb-1.5 pt-0.5">Date</th>
                    <th className="pb-1.5 pt-0.5">Category</th>
                    <th className="pb-1.5 pt-0.5">Amount</th>
                    <th className="pb-1.5 pt-0.5">Received In</th>
                    <th className="pb-1.5 pt-0.5">Note</th>
                    <th className="pb-1.5 pt-0.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {incomes.map((inc, index) => {
                    const matchedCat = categories.find((c) => c.name.toLowerCase() === inc.category.toLowerCase());
                    const matchedMode = paymentModes.find((pm) => pm.name.toLowerCase() === (inc.mode || "").toLowerCase());
                    const modeColor = matchedMode?.color || "#8A8D9F";
                    
                    return (
                      <tr key={inc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-1.5 font-medium text-muted-foreground">{index + 1}.</td>
                        <td className="py-1.5 font-medium text-muted-foreground">
                          {new Date(inc.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-1.5 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: matchedCat?.color || "#0984e3" }}
                            />
                            {inc.category}
                          </span>
                        </td>
                        <td className="py-1.5 font-semibold text-success">₹{inc.amount.toFixed(2)}</td>
                        <td className="py-1.5 font-semibold">
                          {inc.mode ? (
                            <span
                              className="inline-flex px-1.5 py-0.5 rounded text-[9px] tracking-wide uppercase border font-semibold"
                              style={{
                                backgroundColor: `${modeColor}12`,
                                color: modeColor,
                                borderColor: `${modeColor}25`,
                              }}
                            >
                              {inc.mode}
                            </span>
                          ) : (
                            <span className="text-[9px] text-muted-foreground/60 italic">-</span>
                          )}
                        </td>
                        <td className="py-1.5 text-muted-foreground font-medium max-w-[200px] truncate" title={inc.note}>
                          {inc.note || <span className="opacity-55 italic">None</span>}
                        </td>
                        <td className="py-1.5 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(inc)}
                            className="p-1 rounded border border-border text-muted-foreground hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all cursor-pointer"
                            title="Edit Log"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(inc._id)}
                            className="p-1 rounded border border-border text-muted-foreground hover:text-danger hover:bg-danger/5 transition-all cursor-pointer"
                            title="Delete Log"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* LOG / EDIT INCOME MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-5 shadow-card animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3.5">
                <h3 className="text-sm font-semibold text-foreground">
                  {editingIncome ? "Modify Income Log" : "Log Income"}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddOrEditIncome} className="space-y-4">
                {/* Row 1: Amount, Category, Received Mode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Amount */}
                  <NumberInput
                    label="Amount (INR)"
                    step="0.01"
                    placeholder="0.00"
                    required
                    prefix="₹"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                    <Select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name} className="bg-card text-foreground">
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Received Mode */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Received In (Account)</label>
                    <Select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                    >
                      {paymentModes.map((pm) => (
                        <option key={pm._id} value={pm.name} className="bg-card text-foreground">
                          {pm.name}
                        </option>
                      ))}
                      {paymentModes.length === 0 && (
                        <option value="Bank" className="bg-card text-foreground">Bank Account</option>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Row 2: Date, Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <Input
                    type="date"
                    label="Credited Date"
                    required
                    icon={Calendar}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />

                  {/* Note */}
                  <Input
                    type="text"
                    label="Notes / Comments"
                    icon={Notebook}
                    placeholder="E.g. June month salary slip..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-5 flex justify-end gap-2.5 pt-2.5 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4.5 py-2 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4.5 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingIncome ? (
                      "Save Changes"
                    ) : (
                      "Log Earning"
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
