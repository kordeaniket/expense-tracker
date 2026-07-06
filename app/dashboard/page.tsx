"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { MoreVertical, Wallet, TrendingUp, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, ListFilter, Play, Sparkles, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ExpenseData {
  _id: string;
  amount: number;
  category: string;
  subCategory?: string;
  note?: string;
  date: string;
  mode: string;
  isRecurring?: boolean;
}

interface IncomeData {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  mode?: string;
  date: string;
}

interface AssetData {
  _id: string;
  name: string;
  type: string;
  amount: number;
}

interface CategoryData {
  _id: string;
  name: string;
  type: string;
  color: string;
}

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [incomes, setIncomes] = useState<IncomeData[]>([]);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expRes, incRes, astRes, catRes] = await Promise.all([
          fetch("/api/expenses"),
          fetch("/api/income"),
          fetch("/api/assets"),
          fetch("/api/categories"),
        ]);

        const expData = await expRes.json();
        const incData = await incRes.json();
        const astData = await astRes.json();
        const catData = await catRes.json();

        if (expRes.ok && expData.expenses) setExpenses(expData.expenses);
        if (incRes.ok && incData.incomes) setIncomes(incData.incomes);
        if (astRes.ok && astData.assets) setAssets(astData.assets);
        if (catRes.ok && catData.categories) setCategories(catData.categories);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#08070d]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Loading dashboard summary...</p>
        </div>
      </div>
    );
  }

  // Aggregate Calculations
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const accountBalance = totalIncome - totalExpenses;

  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYearNum = now.getFullYear();

  // Current Month Expenses
  const currentMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Last Month Expenses
  const lastMonthNum = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
  const lastMonthYear = currentMonthNum === 0 ? currentYearNum - 1 : currentYearNum;
  const lastMonthExpenses = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  let expensesChangePercent = 0;
  let expensesChangeText = "First tracked month";
  let isExpensesIncrease = false;
  if (lastMonthExpenses > 0) {
    expensesChangePercent = ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    isExpensesIncrease = expensesChangePercent >= 0;
    expensesChangeText = `${Math.abs(expensesChangePercent).toFixed(0)}% ${
      isExpensesIncrease ? "more" : "less"
    } than last month`;
  }

  // Total Investment Valuation
  const totalInvestments = assets.reduce((sum, a) => sum + a.amount, 0);

  // Emergency Fund Savings Goal Calculation
  const totalSavingsAndFD = assets
    .filter((a) => a.type === "Savings" || a.type === "FD")
    .reduce((sum, a) => sum + a.amount, 0);
  const goalTarget = 500000;
  const progressPercent = Math.min((totalSavingsAndFD / goalTarget) * 100, 100);

  // Last 6 Months Expenses trend
  const monthlyTrendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthLabel = d.toLocaleString("default", { month: "short" });
    const mNum = d.getMonth();
    const yNum = d.getFullYear();
    const amt = expenses
      .filter((e) => {
        const date = new Date(e.date);
        return date.getMonth() === mNum && date.getFullYear() === yNum;
      })
      .reduce((sum, e) => sum + e.amount, 0);
    monthlyTrendData.push({ name: monthLabel, amount: amt });
  }

  // Top Categories (Doughnut Chart)
  const categoryTotals: Record<string, { name: string; value: number; color: string }> = {};
  expenses.forEach((e) => {
    const catName = e.category;
    const catObj = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    const color = catObj?.color || "#6C5CE7";
    if (!categoryTotals[catName]) {
      categoryTotals[catName] = { name: catName, value: 0, color };
    }
    categoryTotals[catName].value += e.amount;
  });

  const displayCategoryData = Object.values(categoryTotals)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Recent Expenses
  const recentExpenses = expenses.slice(0, 5).map((e, idx) => ({
    sn: idx + 1,
    amount: `₹${e.amount.toFixed(2)}`,
    category: e.category,
    subCategory: e.subCategory || "-",
    date: new Date(e.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    mode: e.mode || "UPI",
  }));

  // Recurring Subscriptions
  const subscriptionBills = expenses
    .filter((e) => e.isRecurring)
    .slice(0, 5)
    .map((e) => {
      const firstLetter = e.note ? e.note.charAt(0).toUpperCase() : e.category.charAt(0).toUpperCase();
      const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-pink-500"];
      const charCodeSum = firstLetter.charCodeAt(0) || 0;
      const logoColor = colors[charCodeSum % colors.length];

      return {
        name: e.note || e.category,
        date: new Date(e.date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        amount: `₹${e.amount.toFixed(2)}`,
        logoColor,
        logoText: firstLetter,
      };
    });

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* TOP ROW: METRIC CARDS */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          
          {/* Account Balance Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Account Balance
              </p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                ₹{accountBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <span>Calculated Net Balance</span>
              </div>
            </div>
          </div>

          {/* Monthly Expenses Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-light text-danger">
                <TrendingUp className="h-5 w-5" />
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Monthly Expenses
              </p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                ₹{currentMonthExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <div className={`mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                isExpensesIncrease 
                  ? "bg-danger-light text-danger border border-danger/10" 
                  : "bg-success/10 text-success border border-success/20"
              }`}>
                {isExpensesIncrease ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{expensesChangeText}</span>
              </div>
            </div>
          </div>

          {/* Total Investment Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-info-light text-info">
                <PiggyBank className="h-5 w-5" />
              </span>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Investments
              </p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                ₹{totalInvestments.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-info-light text-info border border-info/10">
                <span>Dynamic Asset Portfolio</span>
              </div>
            </div>
          </div>

          {/* Savings Goal Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card relative flex items-center gap-4">
            {/* Progress Circular Doughnut */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-warning"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent.toFixed(0)}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Target Symbol center */}
              <div className="absolute flex flex-col items-center">
                <Target className="h-4.5 w-4.5 text-warning" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Emergency Goal
                </p>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
              <h4 className="mt-1 text-[13px] font-bold text-foreground truncate">
                Emergency Fund
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Target: ₹{goalTarget.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Saved: ₹{totalSavingsAndFD.toLocaleString("en-IN")} ({progressPercent.toFixed(0)}%)
              </p>
            </div>
          </div>

        </div>

        {/* MIDDLE ROW: CHARTS */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          
          {/* Monthly Expenses Rounded Bar Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-7 flex flex-col">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-foreground flex items-center gap-2">
                  Expense Trends
                  <span className="inline-flex items-center text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                    Last 6 Months
                  </span>
                </h3>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            
            {/* Recharts Bar Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8A8D9F", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#8A8D9F", fontSize: 11 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "var(--foreground)",
                    }}
                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#6C5CE7"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Category Doughnut Chart */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-[15px] font-bold text-foreground">
                Top Categories
              </h3>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
              {/* Doughnut Pie */}
              {displayCategoryData.length > 0 ? (
                <>
                  <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {displayCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legends with Custom Grid Layout */}
                  <div className="flex-1 space-y-2.5 w-full">
                    {displayCategoryData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground font-medium truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-foreground">₹{item.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground/60 italic font-medium py-12">
                  No expense records logged.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: TABLES & LISTS */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          
          {/* Recent Expenses Table */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-[15px] font-bold text-foreground">
                Recent Expenses
              </h3>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto w-full">
              {recentExpenses.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3 pt-1">S.N</th>
                      <th className="pb-3 pt-1">Amount</th>
                      <th className="pb-3 pt-1">Category</th>
                      <th className="pb-3 pt-1">Sub Category</th>
                      <th className="pb-3 pt-1">Date</th>
                      <th className="pb-3 pt-1">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recentExpenses.map((expense) => (
                      <tr key={expense.sn} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5 font-medium text-muted-foreground">{expense.sn}.</td>
                        <td className="py-3.5 font-bold text-foreground">{expense.amount}</td>
                        <td className="py-3.5 font-medium text-foreground">{expense.category}</td>
                        <td className="py-3.5 text-muted-foreground font-medium">{expense.subCategory}</td>
                        <td className="py-3.5 text-muted-foreground font-medium">{expense.date}</td>
                        <td className="py-3.5 font-bold">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase bg-secondary text-muted-foreground font-bold border border-border">
                            {expense.mode}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground font-medium italic">
                  No expense records logged.
                </div>
              )}
            </div>
          </div>

          {/* Bill & Subscription List */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-[15px] font-bold text-foreground">
                Bill & Subscription
              </h3>
              <button className="text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1 mt-2">
              {subscriptionBills.length > 0 ? (
                subscriptionBills.map((sub, index) => (
                  <div key={index} className="flex items-center justify-between hover:bg-slate-50/30 dark:hover:bg-slate-900/10 p-1.5 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${sub.logoColor}`}>
                        {sub.logoText}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{sub.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{sub.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-foreground">{sub.amount}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-muted-foreground font-medium italic">
                  No recurring bills active.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
