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
  Target,
  Car,
  Home,
  Laptop,
  GraduationCap,
  Palmtree,
  Wallet,
  PiggyBank,
  Check,
  TrendingUp,
  AlertTriangle,
  History,
  MinusCircle,
  PlusCircle,
} from "lucide-react";

interface Contribution {
  _id?: string;
  amount: number;
  date: string;
  note?: string;
}

interface GoalData {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  icon?: string;
  contributions?: Contribution[];
  createdAt?: string;
  updatedAt?: string;
}

const ICON_OPTIONS = [
  { name: "Target", icon: Target },
  { name: "Car", icon: Car },
  { name: "Home", icon: Home },
  { name: "Gadget", icon: Laptop },
  { name: "Education", icon: GraduationCap },
  { name: "Vacation", icon: Palmtree },
  { name: "Savings", icon: PiggyBank },
];

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Target: Target,
  Car: Car,
  Home: Home,
  Gadget: Laptop,
  Education: GraduationCap,
  Vacation: Palmtree,
  Savings: PiggyBank,
};

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function GoalsPage() {
  const { data, isLoading, mutate } = useSWR("/api/goals", fetcher);
  const goals: GoalData[] = data?.goals || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modals toggle
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  // Selection/Editing states
  const [editingGoal, setEditingGoal] = useState<GoalData | null>(null);
  const [contributingGoal, setContributingGoal] = useState<GoalData | null>(null);
  const [contributionType, setContributionType] = useState<"deposit" | "withdraw">("deposit");
  const [activeHistoryGoalId, setActiveHistoryGoalId] = useState<string | null>(null);

  // Goal Form states
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [icon, setIcon] = useState("Target");

  // Contribution Form states
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNote, setContributeNote] = useState("");

  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setTitle("");
    setTargetAmount("");
    setSavedAmount("0");
    setTargetDate("");
    setIcon("Target");
    setShowGoalModal(true);
  };

  const handleOpenEditModal = (goal: GoalData) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().split("T")[0] : "");
    setIcon(goal.icon || "Target");
    setShowGoalModal(true);
  };

  const handleOpenContributeModal = (goal: GoalData, type: "deposit" | "withdraw") => {
    setContributingGoal(goal);
    setContributionType(type);
    setContributeAmount("");
    setContributeNote("");
    setShowContributeModal(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) {
      toast.error("Please enter a title and target amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingGoal ? `/api/goals/${editingGoal._id}` : "/api/goals";
      const method = editingGoal ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          targetAmount: parseFloat(targetAmount),
          savedAmount: parseFloat(savedAmount || "0"),
          targetDate: targetDate || undefined,
          icon,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save savings goal.");
      }

      toast.success(editingGoal ? "Savings goal updated!" : "Savings goal created!");
      setShowGoalModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingGoal || !contributeAmount || parseFloat(contributeAmount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    const amountVal = parseFloat(contributeAmount);
    // Dynamic sign mapping: deposit is positive, withdraw is negative
    const signedAmount = contributionType === "deposit" ? amountVal : -amountVal;

    try {
      const response = await fetch(`/api/goals/${contributingGoal._id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: signedAmount,
          note: contributeNote.trim() || (contributionType === "deposit" ? "Deposit" : "Withdrawal"),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to log contribution.");
      }

      toast.success(contributionType === "deposit" ? "Deposit credited!" : "Funds withdrawn!");
      setShowContributeModal(false);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the savings goal "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete savings goal.");
      }

      toast.success("Goal deleted successfully.");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete savings goal.");
    }
  };

  // Helper: Calculate pacing metrics
  const getPacingDetails = (goal: GoalData) => {
    const remainingAmount = Math.max(0, goal.targetAmount - goal.savedAmount);
    if (remainingAmount <= 0) {
      return { status: "completed", message: "Goal Achieved! 🎉" };
    }

    if (!goal.targetDate) {
      return { status: "flexible", message: "Flexible savings target." };
    }

    const tDate = new Date(goal.targetDate);
    const today = new Date();
    const diffTime = tDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { status: "overdue", message: "Target date passed. Behind schedule." };
    }

    const remainingMonths = diffDays / 30.4;
    const monthlyRate = remainingMonths > 0.1 ? remainingAmount / remainingMonths : remainingAmount;

    return {
      status: "active",
      daysLeft: diffDays,
      monthlyRate,
      message: `Save ₹${Math.ceil(monthlyRate).toLocaleString("en-IN")} / month to hit target on time.`,
    };
  };

  // Calculations for page headers
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const aggregateProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <DashboardShell>
      <div className="space-y-4">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Savings Goals</h2>
            <p className="text-xs text-muted-foreground">Define, fund, and hit targets for your future purchase milestones.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Goal
          </button>
        </div>

        {/* Global Progress metric cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Total Target */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Goals Target</p>
              <h3 className="mt-0.5 text-lg font-black text-foreground truncate">₹{totalTarget.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-primary/5 blur-xl" />
          </div>

          {/* Total Saved */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm relative overflow-hidden flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <PiggyBank className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate">Combined Savings</p>
              <h3 className="mt-0.5 text-lg font-black text-foreground truncate">₹{totalSaved.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</h3>
            </div>
            <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-success/5 blur-xl" />
          </div>

          {/* Aggregate Completion */}
          <div className="rounded-xl border border-border bg-card p-3 shadow-sm flex flex-col justify-center gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Combined Progress</span>
              <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded md bg-primary/10">
                {aggregateProgress.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accentPink transition-all duration-500" 
                style={{ width: `${aggregateProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Goals Grid Cards */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border rounded-2xl bg-card">
            No savings goals logged yet. Click &quot;Create Goal&quot; above to set up your first milestone target.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {goals.map((goal) => {
              const GoalIcon = ICON_MAP[goal.icon || "Target"] || Target;
              const progress = goal.targetAmount > 0 ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
              const pacing = getPacingDetails(goal);
              const isHistoryOpen = activeHistoryGoalId === goal._id;

              return (
                <div
                  key={goal._id}
                  className="group relative rounded-lg border border-border bg-card p-3 shadow-sm hover:shadow transition-all duration-300 flex flex-col"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full min-w-0">
                    
                    {/* Header: Icon, Title, Date */}
                    <div className="flex items-center gap-3 md:w-1/4 shrink-0 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <GoalIcon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-xs truncate">{goal.title}</h3>
                        {goal.targetDate && (
                          <p className="text-[9px] text-muted-foreground font-medium mt-0.5 flex items-center gap-1 truncate">
                            <Calendar className="h-2.5 w-2.5 shrink-0" />
                            {new Date(goal.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex items-end justify-between text-[10px] mb-1">
                        <p className="font-bold text-foreground truncate">
                          ₹{goal.savedAmount.toLocaleString("en-IN")} <span className="text-muted-foreground font-medium text-[9px]">/ ₹{goal.targetAmount.toLocaleString("en-IN")}</span>
                        </p>
                        <span className="font-bold text-primary text-[9px]">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary via-accentPink to-accentTeal transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 mt-2 md:mt-0">
                      
                      {/* Pacing Advice Alert (Small icon only) */}
                      <div className={`p-1.5 rounded-md border flex items-center justify-center shrink-0 ${
                        pacing.status === "completed" 
                          ? "bg-success/5 border-success/15 text-success"
                          : pacing.status === "overdue"
                            ? "bg-danger/5 border-danger/10 text-danger animate-pulse"
                            : "bg-slate-50 dark:bg-slate-900/40 border-border text-primary"
                      }`} title={pacing.message}>
                        {pacing.status === "overdue" ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : pacing.status === "completed" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 xl:opacity-100 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-wrap justify-end">
                        <button
                          onClick={() => handleOpenContributeModal(goal, "withdraw")}
                          disabled={goal.savedAmount <= 0}
                          className="p-1.5 rounded text-muted-foreground hover:bg-secondary hover:text-danger transition-all cursor-pointer disabled:opacity-50"
                          title="Withdraw Funds"
                        >
                          <MinusCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenContributeModal(goal, "deposit")}
                          disabled={progress >= 100}
                          className="p-1.5 rounded text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer disabled:opacity-50"
                          title="Add Savings"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setActiveHistoryGoalId(isHistoryOpen ? null : goal._id)}
                          className={`p-1.5 rounded transition-all cursor-pointer ${isHistoryOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                          title="Show History"
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="hidden md:block h-4 w-px bg-border mx-1" />
                        
                        <button
                          onClick={() => handleOpenEditModal(goal)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-secondary hover:text-primary transition-all cursor-pointer"
                          title="Edit Goal"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal._id, goal.title)}
                          className="p-1.5 rounded text-muted-foreground hover:bg-danger/10 hover:text-danger transition-all cursor-pointer"
                          title="Delete Goal"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expand Timeline Feed */}
                  {isHistoryOpen && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                        {goal.contributions && goal.contributions.length > 0 ? (
                          goal.contributions.map((c, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-1 text-[10px] border-b border-border/30 pb-1.5 last:border-b-0 last:pb-0">
                              <div>
                                <span className={`font-bold ${c.amount > 0 ? "text-success" : "text-danger"}`}>
                                  {c.amount > 0 ? "+" : ""}₹{c.amount.toLocaleString()}
                                </span>
                                <p className="text-[9px] text-muted-foreground italic mt-0.5">{c.note || "Adjustment"}</p>
                              </div>
                              <span className="text-[8px] text-muted-foreground/60">
                                {new Date(c.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[9px] text-muted-foreground/60 italic text-center py-2">No timeline contributions logged.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT SAVINGS GOAL MODAL */}
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {editingGoal ? "Modify Savings Goal" : "Create Savings Goal"}
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleGoalSubmit} className="space-y-5">
                {/* Row 1: Title, Icon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Goal Milestone Title"
                    placeholder="E.g. Apple Macbook, Vacation fund, emergency pool..."
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  {/* Icon Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Select Icon Class</label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {ICON_OPTIONS.map((opt) => {
                        const IconComponent = opt.icon;
                        const isSelected = icon === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setIcon(opt.name)}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all border cursor-pointer ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-soft"
                                : "bg-card border-border hover:bg-secondary text-muted-foreground"
                            }`}
                            title={opt.name}
                          >
                            <IconComponent className="h-4 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Row 2: Target Amount, Initial Savings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput
                    label="Target savings amount (INR)"
                    step="1"
                    placeholder="0.00"
                    required
                    prefix="₹"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />

                  {!editingGoal ? (
                    <NumberInput
                      label="Initial Savings Allocation (INR)"
                      step="1"
                      placeholder="0.00"
                      prefix="₹"
                      value={savedAmount}
                      onChange={(e) => setSavedAmount(e.target.value)}
                    />
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Current Allocation</label>
                      <div className="py-2 px-3 bg-secondary text-sm font-semibold rounded-md border border-border/60 text-muted-foreground">
                        ₹{parseFloat(savedAmount || "0").toLocaleString("en-IN")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Target Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Target Achievement Date (Optional)"
                    icon={Calendar}
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                  
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed self-center mt-4">
                    💡 target date computes savings rates dynamic recommendations. Leave empty for flexible goals.
                  </p>
                </div>

                {/* Modal Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(false)}
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
                    ) : editingGoal ? (
                      "Save Changes"
                    ) : (
                      "Create Goal"
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* DEPOSIT / WITHDRAWAL SAVINGS MODAL */}
        {showContributeModal && contributingGoal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {contributionType === "deposit" ? "Deposit to Goal" : "Withdraw from Goal"}
                </h3>
                <button
                  onClick={() => setShowContributeModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="mb-4 bg-slate-50 dark:bg-slate-900/35 border border-border p-3.5 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold">Goal Name</span>
                  <p className="font-bold text-foreground mt-0.5">{contributingGoal.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground font-semibold">Saved Allocation</span>
                  <p className="font-black text-foreground mt-0.5">₹{contributingGoal.savedAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <form onSubmit={handleContributeSubmit} className="space-y-5">
                <NumberInput
                  label={`${contributionType === "deposit" ? "Deposit" : "Withdraw"} Amount (INR)`}
                  step="1"
                  placeholder="0.00"
                  required
                  prefix="₹"
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                />

                <Input
                  label="Description / Comments (Optional)"
                  placeholder={contributionType === "deposit" ? "E.g. Bonus allocation, monthly saving..." : "E.g. milestone purchase..."}
                  value={contributeNote}
                  onChange={(e) => setContributeNote(e.target.value)}
                />

                {/* Modal Footer Actions */}
                <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setShowContributeModal(false)}
                    className="px-6 py-2.5 rounded-lg border border-border bg-card text-xs font-bold hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2.5 rounded-lg text-white text-xs font-bold transition-all shadow-soft active:scale-[0.98] flex items-center justify-center gap-1 disabled:opacity-75 cursor-pointer ${
                      contributionType === "deposit" ? "bg-success hover:bg-success/90" : "bg-danger hover:bg-danger/90"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : contributionType === "deposit" ? (
                      "Complete Deposit"
                    ) : (
                      "Complete Withdrawal"
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
