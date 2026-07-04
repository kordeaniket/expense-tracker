"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2, Calendar, CreditCard, Notebook, Tag, Loader2, X, Filter } from "lucide-react";

interface CategoryData {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  subcategories: string[];
}

interface ExpenseData {
  _id: string;
  amount: number;
  category: string;
  subCategory?: string;
  note?: string;
  date: string;
  mode: "UPI" | "Card" | "Cash" | "Bank" | "Other";
}

const FALLBACK_CATEGORIES: CategoryData[] = [
  { _id: "1", name: "Food & Dining", type: "expense", color: "#6C5CE7", subcategories: ["Swiggy", "Zomato", "Restaurants", "Groceries"] },
  { _id: "2", name: "Shopping", type: "expense", color: "#00B894", subcategories: ["Amazon", "Myntra", "Flipkart", "Clothing", "Electronics"] },
  { _id: "3", name: "Travel & Transport", type: "expense", color: "#FD79A8", subcategories: ["Uber", "Ola", "Metro", "Petrol/Fuel", "Flight"] },
  { _id: "4", name: "Bills & Utilities", type: "expense", color: "#FF6B81", subcategories: ["Electricity", "WiFi", "Water", "Mobile Recharge"] },
  { _id: "5", name: "Entertainment", type: "expense", color: "#00CEC9", subcategories: ["Netflix", "Spotify", "Cinema", "Gaming"] },
  { _id: "6", name: "Investment", type: "expense", color: "#FFA000", subcategories: ["Mutual Funds", "Stocks", "Gold", "FD/RD"] }
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>(FALLBACK_CATEGORIES);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mode, setMode] = useState<"UPI" | "Card" | "Cash" | "Bank" | "Other">("UPI");

  // Filtering states
  const [filterCategory, setFilterCategory] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories & expenses in parallel
      const [catRes, expRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/expenses"),
      ]);

      const catData = await catRes.json();
      const expData = await expRes.json();

      if (catRes.ok && catData.categories) {
        // Only load expense-type categories for expense logging
        const expCats = catData.categories.filter((c: any) => c.type === "expense");
        setCategories(expCats);
      }

      if (expRes.ok && expData.expenses) {
        setExpenses(expData.expenses);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cascading Flow: Find subcategories for the selected category
  const activeCategoryObject = categories.find((cat) => cat.name === selectedCategoryName);
  const subcategoryOptions = activeCategoryObject?.subcategories || [];

  // Reset Subcategory selection whenever Category changes
  useEffect(() => {
    setSelectedSubCategory("");
  }, [selectedCategoryName]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!selectedCategoryName) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category: selectedCategoryName,
          subCategory: selectedSubCategory || undefined,
          note: note || undefined,
          date: new Date(date),
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to record expense.");
      }

      toast.success("Expense added successfully!");
      setShowAddModal(false);

      // Clear form
      setAmount("");
      setSelectedCategoryName("");
      setSelectedSubCategory("");
      setNote("");
      setDate(new Date().toISOString().split("T")[0]);
      setMode("UPI");

      // Reload log
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense log?")) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete expense.");
      }

      toast.success("Expense log deleted successfully!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    }
  };

  // Filtered Expenses
  const filteredExpenses = filterCategory === "all"
    ? expenses
    : expenses.filter(exp => exp.category === filterCategory);

  return (
    <DashboardShell>
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">All Expenses</h2>
            <p className="text-xs text-muted-foreground">Manage and track your detailed transaction logs.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>

        {/* Filters and List */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Expense History
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                {filteredExpenses.length} total
              </span>
            </h3>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-input bg-background py-1.5 px-3 text-xs font-semibold outline-none text-foreground cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="text-center py-12 text-xs text-muted-foreground font-medium italic">
              No expenses recorded yet. Click &quot;Add Expense&quot; above to log your first transaction.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 pt-1">S.N</th>
                    <th className="pb-3 pt-1">Date</th>
                    <th className="pb-3 pt-1">Category</th>
                    <th className="pb-3 pt-1">Sub Category</th>
                    <th className="pb-3 pt-1">Amount</th>
                    <th className="pb-3 pt-1">Mode</th>
                    <th className="pb-3 pt-1">Note</th>
                    <th className="pb-3 pt-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredExpenses.map((exp, index) => {
                    const matchedCat = categories.find(c => c.name === exp.category);
                    return (
                      <tr key={exp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 font-medium text-muted-foreground">{index + 1}.</td>
                        <td className="py-3.5 font-medium text-muted-foreground">
                          {new Date(exp.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 font-bold">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: matchedCat?.color || "#6C5CE7" }}
                            />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground font-semibold">
                          {exp.subCategory ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-secondary text-[10px]">
                              <Tag className="h-2.5 w-2.5" />
                              {exp.subCategory}
                            </span>
                          ) : (
                            <span className="text-[10px] italic opacity-60">-</span>
                          )}
                        </td>
                        <td className="py-3.5 font-extrabold text-foreground text-sm">₹{exp.amount.toFixed(2)}</td>
                        <td className="py-3.5 font-bold">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase ${exp.mode === "UPI" ? "bg-primary-50 text-primary border border-primary/10" :
                              exp.mode === "Bank" ? "bg-info/10 text-info border border-info/10" :
                                exp.mode === "Card" ? "bg-warning/10 text-warning border border-warning/10" :
                                  "bg-slate-100 text-muted-foreground"
                            }`}>
                            {exp.mode}
                          </span>
                        </td>
                        <td className="py-3.5 text-muted-foreground font-medium max-w-[150px] truncate" title={exp.note}>
                          {exp.note || <span className="opacity-55 italic">None</span>}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-danger hover:bg-danger/5 transition-all"
                            title="Delete Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        {/* ADD EXPENSE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl rounded-md border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">

              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">Record Expense</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-5">

                {/* Row 1: Amount, Category, Sub Category */}
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
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <Select
                      required
                      value={selectedCategoryName}
                      onChange={(e) => setSelectedCategoryName(e.target.value)}
                    >
                      <option value="" className="bg-card text-foreground">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name} className="bg-card text-foreground">
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Cascading Subcategory Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sub Category</label>
                    <Select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      disabled={!selectedCategoryName || subcategoryOptions.length === 0}
                    >
                      <option value="" className="bg-card text-foreground">
                        {!selectedCategoryName
                          ? "Select a category first"
                          : subcategoryOptions.length === 0
                            ? "No subcategories available"
                            : "Select Sub Category"}
                      </option>
                      {subcategoryOptions.map((sub, idx) => (
                        <option key={idx} value={sub} className="bg-card text-foreground">
                          {sub}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Row 2: Date, Payment Mode, Note */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <Input
                    type="date"
                    label="Date"
                    required
                    icon={Calendar}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />

                  {/* Payment Mode */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment Mode</label>
                    <Select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                    >
                      <option value="UPI" className="bg-card text-foreground">UPI</option>
                      <option value="Card" className="bg-card text-foreground">Card</option>
                      <option value="Cash" className="bg-card text-foreground">Cash</option>
                      <option value="Bank" className="bg-card text-foreground">Bank Transfer</option>
                      <option value="Other" className="bg-card text-foreground">Other</option>
                    </Select>
                  </div>

                  {/* Note */}
                  <Input
                    type="text"
                    label="Note / Memo"
                    icon={Notebook}
                    placeholder="Describe this expense..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2.5 rounded-md border border-border bg-card text-xs font-bold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Record Expense"
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
