"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  Loader2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  CheckCircle2,
  ListTodo,
} from "lucide-react";

interface DailyPlan {
  _id: string;
  title: string;
  description?: string;
  frequency: "daily" | "once";
  date?: string;
  time?: string;
  completions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function DailyPlansPage() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DailyPlan | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "once">("daily");
  const [targetDate, setTargetDate] = useState("");
  const [time, setTime] = useState("");

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/daily-plans");
      const data = await response.json();
      if (response.ok && data.plans) {
        setPlans(data.plans);
      } else {
        throw new Error(data.error || "Failed to load daily plans.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to retrieve plans.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setTitle("");
    setDescription("");
    setFrequency("daily");
    setTargetDate(selectedDate.toISOString().split("T")[0]);
    setTime("");
    setShowModal(true);
  };

  const handleOpenEditModal = (plan: DailyPlan, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent calendar change
    setEditingPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description || "");
    setFrequency(plan.frequency);
    setTargetDate(plan.date ? new Date(plan.date).toISOString().split("T")[0] : "");
    setTime(plan.time || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Plan title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingPlan ? `/api/daily-plans/${editingPlan._id}` : "/api/daily-plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          frequency,
          date: frequency === "once" ? targetDate : undefined,
          time: time || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save daily plan.");
      }

      toast.success(editingPlan ? "Daily plan updated!" : "Daily plan added!");
      setShowModal(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, planName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${planName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/daily-plans/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Plan deleted.");
        fetchPlans();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete plan.");
      }
    } catch (error: any) {
      toast.error(error.message || "Could not remove daily plan.");
    }
  };

  const handleToggleCompletion = async (plan: DailyPlan) => {
    const formattedDate = formatDateString(selectedDate);
    try {
      const response = await fetch(`/api/daily-plans/${plan._id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: formattedDate }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        fetchPlans();
      } else {
        throw new Error(data.error || "Failed to toggle plan state.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating checklist.");
    }
  };

  // Date Formatting Helper: YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Calendar Math Helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Streak Calculation Engine
  const calculateStreak = () => {
    if (plans.length === 0) return 0;

    let streak = 0;
    const checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Look backward day by day
    while (true) {
      const dateStr = formatDateString(checkDate);
      // Check if at least one plan was completed on this date
      const hasCompleted = plans.some((p) => p.completions.includes(dateStr));

      if (hasCompleted) {
        streak++;
        // Go back 1 day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If nothing was completed today, we check if they completed yesterday to preserve streak
        const todayStr = formatDateString(new Date());
        if (dateStr === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const hasCompletedYesterday = plans.some((p) => p.completions.includes(formatDateString(checkDate)));
          if (hasCompletedYesterday) {
            // go to yesterday and continue count
            continue;
          }
        }
        break;
      }
    }
    return streak;
  };

  // Retrieve applicable plans for the selected date
  const getApplicablePlansForDate = (date: Date) => {
    const dateStr = formatDateString(date);
    return plans.filter((plan) => {
      if (plan.frequency === "daily") {
        // Daily plans are always active starting from creation date
        if (plan.createdAt) {
          const created = new Date(plan.createdAt);
          created.setHours(0, 0, 0, 0);
          const target = new Date(date);
          target.setHours(0, 0, 0, 0);
          return target >= created;
        }
        return true;
      } else if (plan.frequency === "once") {
        // Once plans only display on their scheduled date
        if (!plan.date) return false;
        return formatDateString(new Date(plan.date)) === dateStr;
      }
      return false;
    });
  };

  const selectedDateStr = formatDateString(selectedDate);
  const activePlansForSelectedDate = getApplicablePlansForDate(selectedDate);
  const completedPlansForSelectedDate = activePlansForSelectedDate.filter((p) =>
    p.completions.includes(selectedDateStr)
  );

  // Today progress metrics
  const todayStr = formatDateString(new Date());
  const todayPlans = getApplicablePlansForDate(new Date());
  const todayCompletedCount = todayPlans.filter((p) => p.completions.includes(todayStr)).length;
  const todayProgressPercent = todayPlans.length > 0 ? (todayCompletedCount / todayPlans.length) * 100 : 0;

  // Streak & Lifetime count
  const currentStreak = calculateStreak();
  const lifetimeCompletions = plans.reduce((sum, p) => sum + p.completions.length, 0);

  // Render Calendar Grid Details
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const calendarCells = [];

  // Previous month padding cells
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`pad-${i}`} className="h-14 border border-border/30 bg-slate-50/30 dark:bg-slate-900/5 rounded-lg opacity-40" />);
  }

  // Active month cells
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const yearNum = currentDate.getFullYear();

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const cellDateStr = formatDateString(cellDate);
    const isSelected = formatDateString(selectedDate) === cellDateStr;
    const isToday = formatDateString(new Date()) === cellDateStr;

    // Calculate completions on this date
    const plansForThisDate = getApplicablePlansForDate(cellDate);
    const completionsForThisDate = plansForThisDate.filter((p) => p.completions.includes(cellDateStr));
    const completionRatio = plansForThisDate.length > 0 ? completionsForThisDate.length / plansForThisDate.length : 0;

    calendarCells.push(
      <button
        key={`day-${day}`}
        onClick={() => setSelectedDate(cellDate)}
        className={`h-14 p-1.5 border border-border/40 rounded-lg flex flex-col justify-between items-start transition-all relative hover:bg-secondary cursor-pointer ${isSelected
            ? "ring-2 ring-primary bg-primary/5 border-primary"
            : isToday
              ? "border-primary/50 bg-secondary/30"
              : "bg-card"
          }`}
      >
        <span className={`text-[10px] font-bold ${isToday ? "text-primary bg-primary/10 px-1 rounded" : "text-muted-foreground"
          }`}>
          {day}
        </span>

        {/* Dynamic completion bullet dots */}
        {plansForThisDate.length > 0 && (
          <div className="w-full flex items-center gap-0.5 mt-auto">
            {completionsForThisDate.length > 0 ? (
              <div className="w-full flex items-center gap-0.5">
                {completionsForThisDate.map((_, idx) => (
                  <span key={idx} className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                ))}
                {/* Remaining uncompleted indicators */}
                {Array.from({ length: plansForThisDate.length - completionsForThisDate.length }).map((_, idx) => (
                  <span key={`un-${idx}`} className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                ))}
              </div>
            ) : (
              <span className="text-[8px] text-muted-foreground/45 font-medium leading-none truncate">{plansForThisDate.length} tasks</span>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Daily Plans & Rituals</h2>
            <p className="text-xs text-muted-foreground">Form positive habits, log chores, and track completions inside an interactive monthly calendar.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 self-start px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
        </div>

        {/* Statistics Metric cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Today Progress */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Today&apos;s Checklist Progress</span>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                {todayCompletedCount} / {todayPlans.length} done
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accentTeal transition-all duration-300"
                  style={{ width: `${todayProgressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold">Track goals completion rate for running daily routines.</p>
            </div>
          </div>

          {/* Habit Streaks */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Award className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Consecutive Streaks</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{currentStreak} <span className="text-muted-foreground text-xs font-normal">days streak</span></h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-semibold mt-1">Days with at least 1 ritual checked in sequence.</p>
          </div>

          {/* Lifetime Completions */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Life-time accomplishments</p>
              <h3 className="mt-1 text-2xl font-black text-foreground">{lifetimeCompletions} <span className="text-muted-foreground text-xs font-normal">checks logged</span></h3>
            </div>
            <p className="text-[10px] text-muted-foreground/60 font-semibold mt-1">Aggregate checkmarks across all logged plans.</p>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Calendar Segment (Left/8 Columns) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-7 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                <span>Monthly Calendar</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-foreground">
                  {monthName} {yearNum}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg border border-border hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells}
            </div>
          </div>

          {/* Focused Day Checklist Inspector (Right/5 Columns) */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Day Agenda</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/10">
                  {completedPlansForSelectedDate.length} / {activePlansForSelectedDate.length} checked
                </span>
              </div>

              {/* Checklist list */}
              {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : activePlansForSelectedDate.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground font-medium italic border border-border/40 rounded-xl bg-slate-50/20 dark:bg-slate-900/5">
                  No plans scheduled for this date.
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {activePlansForSelectedDate.map((plan) => {
                    const isCompleted = plan.completions.includes(selectedDateStr);

                    return (
                      <div
                        key={plan._id}
                        onClick={() => handleToggleCompletion(plan)}
                        className={`flex items-start justify-between p-3 border rounded-xl hover:bg-slate-50/60 dark:hover:bg-slate-900/10 transition-all cursor-pointer ${isCompleted
                            ? "border-success/30 bg-success/[0.02]"
                            : "border-border bg-card"
                          }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => { }} // toggling handled by click of row container
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-xs font-bold text-foreground truncate ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {plan.title}
                            </h4>
                            {plan.description && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{plan.description}</p>
                            )}
                            {plan.time && (
                              <div className="flex items-center gap-1 mt-1 text-[9px] text-muted-foreground/80 font-semibold">
                                <Clock className="h-3 w-3" />
                                <span>{plan.time}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edit/Delete control icons */}
                        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            onClick={(e) => handleOpenEditModal(plan, e)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-all cursor-pointer"
                            title="Edit plan"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(plan._id, plan.title, e)}
                            className="p-1 rounded hover:bg-danger-light text-muted-foreground hover:text-danger transition-all cursor-pointer"
                            title="Delete plan"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* CREATE / EDIT DAILY PLAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-28 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-card animate-in zoom-in-95 duration-200">

              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-4">
                <h3 className="text-base font-bold text-foreground">
                  {editingPlan ? "Edit Plan Profile" : "Create Plan Profile"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-all cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Row 1: Title */}
                <Input
                  label="Plan Title"
                  placeholder="E.g., Read 15 pages, drink water, gym session..."
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                {/* Row 2: Description */}
                <Input
                  label="Description / Instructions"
                  placeholder="Optional details, notes or guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                {/* Row 3: Frequency, Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Frequency</label>
                    <Select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                    >
                      <option value="daily">Everyday (Daily)</option>
                      <option value="once">Once (Single Instance)</option>
                    </Select>
                  </div>

                  <Input
                    type="time"
                    label="Scheduled Time (Optional)"
                    icon={Clock}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                {/* Row 4: Target Date (only visible for 'once') */}
                {frequency === "once" && (
                  <Input
                    type="date"
                    label="Scheduled Date"
                    required
                    icon={Calendar}
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                )}

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
                    ) : editingPlan ? (
                      "Save Changes"
                    ) : (
                      "Create Plan"
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
