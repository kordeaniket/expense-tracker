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
  Edit2,
  Calendar,
  X,
  Loader2,
  CalendarDays,
  CreditCard,
  Tag,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  category: string;
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDueDate: string;
  paymentMode: string;
  status: "active" | "paused" | "cancelled";
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentMode {
  _id: string;
  name: string;
}

const CATEGORY_OPTIONS = [
  "Entertainment",
  "Utilities",
  "Rent",
  "Software & Tools",
  "Insurance",
  "Gym & Fitness",
  "Other",
];

const CYCLE_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly" | "quarterly" | "yearly">("monthly");
  const [nextDueDate, setNextDueDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("Card");
  const [status, setStatus] = useState<"active" | "paused" | "cancelled">("active");
  const [note, setNote] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subRes, pmRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/payment-modes"),
      ]);

      const subData = await subRes.json();
      const pmData = await pmRes.json();

      if (subRes.ok && subData.subscriptions) {
        setSubscriptions(subData.subscriptions);
      }
      if (pmRes.ok && pmData.paymentModes) {
        setPaymentModes(pmData.paymentModes);
        if (pmData.paymentModes.length > 0) {
          setPaymentMode(pmData.paymentModes[0].name);
        }
      }
    } catch (error) {
      toast.error("Failed to load subscription data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSub(null);
    setName("");
    setAmount("");
    setCategory("Entertainment");
    setBillingCycle("monthly");
    setNextDueDate("");
    if (paymentModes.length > 0) {
      setPaymentMode(paymentModes[0].name);
    } else {
      setPaymentMode("Card");
    }
    setStatus("active");
    setNote("");
    setShowModal(true);
  };

  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setCategory(sub.category);
    setBillingCycle(sub.billingCycle);
    setNextDueDate(new Date(sub.nextDueDate).toISOString().split("T")[0]);
    setPaymentMode(sub.paymentMode);
    setStatus(sub.status);
    setNote(sub.note || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !nextDueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingSub ? `/api/subscriptions/${editingSub._id}` : "/api/subscriptions";
      const method = editingSub ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          amount: parseFloat(amount),
          category,
          billingCycle,
          nextDueDate,
          paymentMode,
          status,
          note,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save subscription.");
      }

      toast.success(editingSub ? "Subscription updated!" : "Subscription added!");
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, subName: string) => {
    setDeleteId(id);
    setDeleteName(subName);
  };

  const confirmDeleteSubscription = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/subscriptions/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Subscription removed successfully.");
        setDeleteId(null);
        fetchData();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete.");
      }
    } catch (error: any) {
      toast.error(error.message || "Could not delete subscription.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (sub: Subscription) => {
    const nextStatus = sub.status === "active" ? "paused" : "active";
    try {
      const response = await fetch(`/api/subscriptions/${sub._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sub,
          status: nextStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Subscription status set to ${nextStatus}!`);
        fetchData();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to toggle status.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status.");
    }
  };

  // Mark as Paid: advances the nextDueDate dynamically by cycle duration
  const handleMarkAsPaid = async (sub: Subscription) => {
    const oldDueDate = new Date(sub.nextDueDate);
    const newDueDate = new Date(oldDueDate);

    if (sub.billingCycle === "weekly") {
      newDueDate.setDate(oldDueDate.getDate() + 7);
    } else if (sub.billingCycle === "monthly") {
      newDueDate.setMonth(oldDueDate.getMonth() + 1);
    } else if (sub.billingCycle === "quarterly") {
      newDueDate.setMonth(oldDueDate.getMonth() + 3);
    } else if (sub.billingCycle === "yearly") {
      newDueDate.setFullYear(oldDueDate.getFullYear() + 1);
    }

    try {
      // 1. Log the expense transaction automatically
      const expResponse = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: sub.amount,
          category: sub.category,
          subCategory: "Recurring Bill",
          date: oldDueDate.toISOString().split("T")[0],
          mode: sub.paymentMode,
          note: `${sub.name} subscription payment`,
          isRecurring: true,
        }),
      });

      if (!expResponse.ok) {
        toast.warning("Logged payment but failed to log transaction.");
      }

      // 2. Advance the due date in subscription
      const subResponse = await fetch(`/api/subscriptions/${sub._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sub,
          nextDueDate: newDueDate.toISOString().split("T")[0],
        }),
      });

      if (subResponse.ok) {
        toast.success(`Bill marked as paid! Next due date advanced to ${newDueDate.toLocaleDateString("en-IN")}`);
        fetchData();
      } else {
        throw new Error("Failed to advance due date.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete transaction.");
    }
  };

  // Helper: calculate monthly commitment value
  const getMonthlyEquivalent = (sub: Subscription) => {
    if (sub.status !== "active") return 0;
    switch (sub.billingCycle) {
      case "weekly":
        return sub.amount * 4.33;
      case "monthly":
        return sub.amount;
      case "quarterly":
        return sub.amount / 3;
      case "yearly":
        return sub.amount / 12;
      default:
        return sub.amount;
    }
  };

  // Helper: calculate days remaining
  const getDaysRemainingText = (dueDateStr: string) => {
    const due = new Date(dueDateStr);
    const today = new Date();
    // clear time details
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { text: `${Math.abs(days)} days overdue`, status: "overdue" };
    } else if (days === 0) {
      return { text: "Due today", status: "today" };
    } else {
      return { text: `Due in ${days} days`, status: "upcoming" };
    }
  };

  const monthlyCommitment = subscriptions.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
  const activeSubs = subscriptions.filter((s) => s.status === "active").length;
  
  // Calculate upcoming bills count (due in next 7 days or overdue)
  const upcomingBillsCount = subscriptions.filter((s) => {
    if (s.status !== "active") return false;
    const due = new Date(s.nextDueDate);
    const today = new Date();
    due.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  return (
    <DashboardShell>
      <div className="space-y-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Bills & Subscriptions</h2>
            <p className="text-xs text-muted-foreground">Keep tabs on recurring invoices, track renewal due dates, and audit commitments.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </button>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Monthly Commitment */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Commitment</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">₹{monthlyCommitment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-semibold mt-1">Sum value of active subscriptions normalized monthly.</p>
          </div>

          {/* Active Subscriptions */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Services</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{activeSubs} <span className="text-muted-foreground text-xs font-normal">/ {subscriptions.length} Profiles</span></h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-semibold mt-1">Number of current running recurring plans.</p>
          </div>

          {/* Urgent Deadlines */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming Deadlines</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{upcomingBillsCount} <span className="text-muted-foreground text-xs font-normal">due in 7 days</span></h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-semibold mt-1">Overdue or expiring recurring cycles requiring settlement.</p>
          </div>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border rounded-2xl bg-card">
            No active subscription profiles registered. Click &quot;Add Subscription&quot; to log your first bill.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {subscriptions.map((sub) => {
              const dueInfo = getDaysRemainingText(sub.nextDueDate);
              const progressLetter = sub.name.charAt(0).toUpperCase() || "?";
              const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];
              const charSum = progressLetter.charCodeAt(0) || 0;
              const avatarBg = colors[charSum % colors.length];

              return (
                <div
                  key={sub._id}
                  className={`group relative rounded-lg border bg-card p-3 shadow-sm hover:shadow transition-all duration-300 flex flex-col ${
                    sub.status !== "active" ? "border-slate-200 dark:border-slate-800 opacity-75" : "border-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full min-w-0">
                    
                    {/* Header: Icon, Title, Billing Cycle & Category */}
                    <div className="flex items-center gap-3 md:w-1/4 shrink-0 min-w-0">
                      <div className={`h-10 w-10 shrink-0 rounded-md text-white font-bold flex items-center justify-center text-sm ${avatarBg}`}>
                        {progressLetter}
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-xs truncate">{sub.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {sub.billingCycle}
                          </span>
                          <span className="text-[9px] text-muted-foreground/80 font-medium flex items-center gap-0.5 truncate">
                            <Tag className="h-2.5 w-2.5 shrink-0" />
                            {sub.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Due Date & Cost */}
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Amount</span>
                        <p className="font-bold text-foreground text-xs truncate">
                          ₹{sub.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      
                      {sub.status === "active" ? (
                        <div className="flex flex-col items-end text-right">
                          <span className={`text-[9px] font-bold ${
                            dueInfo.status === "overdue" ? "text-danger animate-pulse" : dueInfo.status === "today" ? "text-warning" : "text-primary"
                          }`}>
                            {dueInfo.text}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate">
                            Due: {new Date(sub.nextDueDate).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end text-right">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                            sub.status === "paused" ? "bg-warning/10 text-warning border-warning/20" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground border-border"
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 mt-2 md:mt-0">
                      
                      {sub.status === "active" && (
                        <button
                          onClick={() => handleMarkAsPaid(sub)}
                          className="px-2 py-1 text-[9px] font-bold uppercase text-white bg-primary hover:bg-primary-600 rounded flex items-center transition-all active:scale-[0.98] cursor-pointer"
                          title="Click to pay and advance due date cycle"
                        >
                          Mark Paid
                        </button>
                      )}

                      <div className="flex items-center gap-1 xl:opacity-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-wrap justify-end">
                        <button
                          onClick={() => handleStatusToggle(sub)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${
                            sub.status === "active" ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"
                          }`}
                          title={sub.status === "active" ? "Pause Subscription" : "Resume Subscription"}
                        >
                          {sub.status === "active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        </button>
                        
                        <div className="hidden md:block h-4 w-px bg-border mx-1" />

                        <button
                          onClick={() => handleOpenEditModal(sub)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-secondary hover:text-primary transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id, sub.name)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info log */}
                  <div className="mt-2 text-[9px] text-muted-foreground/80 flex items-center gap-1.5 p-1 rounded-md">
                    <CreditCard className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{sub.paymentMode}</span>
                    {sub.note && (
                      <span className="italic border-l border-border/50 pl-1.5 truncate max-w-[200px]" title={sub.note}>
                        "{sub.note}"
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {editingSub ? "Edit Subscription" : "Log New Subscription"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Name, Cost */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Service Name"
                    placeholder="E.g., Netflix, electricity, rent pool..."
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <NumberInput
                    label="Cycle Billing Amount (INR)"
                    step="1"
                    placeholder="0.00"
                    required
                    prefix="₹"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Row 2: Category, Cycle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Billing Cycle</label>
                    <Select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                    >
                      {CYCLE_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Row 3: Due Date, Payment Account */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Upcoming Due Date"
                    required
                    icon={Calendar}
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment Account (Mode)</label>
                    <Select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      {paymentModes.length > 0 ? (
                        paymentModes.map((pm) => (
                          <option key={pm._id} value={pm.name}>{pm.name}</option>
                        ))
                      ) : (
                        <option value="Card">Card</option>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Row 4: Status, Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </Select>
                  </div>

                  <Input
                    label="Notes / Description (Optional)"
                    placeholder="E.g., dynamic premium family sharing plan..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 rounded-lg border border-border bg-card text-xs font-bold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : editingSub ? (
                      "Save Changes"
                    ) : (
                      "Log Subscription"
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        <DeleteConfirmModal
          isOpen={deleteId !== null}
          onClose={() => {
            setDeleteId(null);
            setDeleteName("");
          }}
          onConfirm={confirmDeleteSubscription}
          isDeleting={isDeleting}
          title="Delete Subscription"
          message={`Are you sure you want to delete "${deleteName}"?`}
        />

      </div>
    </DashboardShell>
  );
}
