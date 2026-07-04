"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/shared/DashboardShell";
import { MoreVertical, Wallet, TrendingUp, PiggyBank, Target, ArrowUpRight, ArrowDownRight, Filter, ChevronDown, ListFilter, Play, Sparkles } from "lucide-react";
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

// Data for Bar Chart
const monthlyData = [
  { name: "Dec", amount: 17000 },
  { name: "Feb", amount: 26000 },
  { name: "Mar", amount: 10000 },
  { name: "Apr", amount: 15000 },
  { name: "May", amount: 25000 },
  { name: "Jun", amount: 22000 },
];

// Data for Doughnut Chart
const categoryData = [
  { name: "Food & Grocery", value: 8156, color: "#54A0FF" },
  { name: "Investment", value: 5000, color: "#FFA000" },
  { name: "Shopping", value: 0.00, color: "#00B894", displayVal: 4356 }, // Adjust to match green slice
  { name: "Travelling", value: 3670, color: "#9C27B0" },
  { name: "Miscellaneous", value: 2749, color: "#FF6B81" },
  { name: "Bill & Subscription", value: 2162, color: "#00CEC9" },
];

// Real data matching legend amounts
const displayCategoryData = [
  { name: "Food & Grocery", value: 8156, color: "#6C5CE7" }, // Blue-indigo
  { name: "Investment", value: 5000, color: "#FFA000" }, // Orange-yellow
  { name: "Shopping", value: 4356, color: "#00B894" }, // Green
  { name: "Travelling", value: 3670, color: "#FD79A8" }, // Pink
  { name: "Miscellaneous", value: 2749, color: "#FF6B81" }, // Red
  { name: "Bill & Subscription", value: 2162, color: "#00CEC9" }, // Teal
];

// Recent Expenses Data
const recentExpenses = [
  { sn: 1, amount: "₹2,100.00", category: "Shopping", subCategory: "Amazon", date: "31 May 2025", mode: "UPI" },
  { sn: 2, amount: "₹299.00", category: "Movie", subCategory: "PVR", date: "28 May 2025", mode: "UPI" },
  { sn: 3, amount: "₹5,000.00", category: "Investment", subCategory: "Groww", date: "24 May 2025", mode: "Bank" },
  { sn: 4, amount: "₹2,460.00", category: "Travel", subCategory: "IRCTC", date: "20 May 2025", mode: "Card" },
  { sn: 5, amount: "₹678.00", category: "Food", subCategory: "Swiggy", date: "15 May 2025", mode: "UPI" },
];

// Subscription Bills Data
const subscriptionBills = [
  { name: "Netflix", date: "15 June 2025", amount: "₹149.00", logoColor: "bg-red-500", logoText: "N" },
  { name: "Spotify", date: "24 Aug 2025", amount: "₹149.00", logoColor: "bg-green-500", logoText: "S" },
  { name: "Figma", date: "01 June 2025", amount: "₹3,999.00", logoColor: "bg-slate-900", logoText: "F" },
  { name: "WiFi", date: "28 June 2025", amount: "₹399.00", logoColor: "bg-orange-500", logoText: "W" },
  { name: "Electricity", date: "10 June 2025", amount: "₹1,265.00", logoColor: "bg-blue-500", logoText: "E" },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#08070d]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <select className="bg-transparent border-none text-[10px] text-muted-foreground outline-none font-semibold cursor-pointer">
                  <option>Q2 2025</option>
                  <option>Q1 2025</option>
                </select>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Account Balance
              </p>
              <h3 className="mt-1 text-2xl font-bold text-foreground">
                ₹8,98,450.00
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/10 text-success border border-success/20">
                <ArrowUpRight className="h-3 w-3" />
                <span>6% more than last month</span>
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
                ₹24,093.00
              </h3>
              <div className="mt-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-danger-light text-danger border border-danger/10">
                <ArrowDownRight className="h-3 w-3" />
                <span>2% less than last month</span>
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
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Investment
                </p>
                <h3 className="mt-1 text-2xl font-bold text-foreground">
                  ₹1,45,555.00
                </h3>
              </div>
              
              {/* Mini Sparkline Chart */}
              <div className="shrink-0 mb-1">
                <svg className="w-20 h-10 text-primary-500" viewBox="0 0 100 40" fill="none">
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 35 C 10 32, 20 28, 30 18 C 40 8, 50 18, 60 12 C 70 6, 80 15, 90 8 C 95 4, 100 2, 100 2"
                    stroke="#6C5CE7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 0 35 C 10 32, 20 28, 30 18 C 40 8, 50 18, 60 12 C 70 6, 80 15, 90 8 C 95 4, 100 2, 100 2 L 100 40 L 0 40 Z"
                    fill="url(#purpleGradient)"
                  />
                </svg>
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
                  className="text-warning-500"
                  strokeWidth="3.5"
                  strokeDasharray="51, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              {/* Target / Diamond Symbol center */}
              <div className="absolute flex flex-col items-center">
                <Target className="h-4.5 w-4.5 text-warning" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Goal
                </p>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
              <h4 className="mt-1 text-[13px] font-bold text-foreground truncate">
                Apple iPhone 17 Pro
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Required: ₹1,45,000
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Collect: ₹75,000
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
                  Monthly Expenses
                  <span className="inline-flex items-center text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                    6% more than last month
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <span>Recent</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Recharts Bar Chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
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
                    tickFormatter={(value) => `${value / 1000}k`}
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
                Top Category
              </h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <span>Recent</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 flex-1">
              {/* Doughnut Pie */}
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
                    <span className="font-bold text-foreground">₹{item.value.toLocaleString("en-IN")}.00</span>
                  </div>
                ))}
              </div>
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
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:text-foreground">
                  <span>Recent</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
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
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase ${
                          expense.mode === "UPI" ? "bg-primary-50 text-primary border border-primary/10" :
                          expense.mode === "Bank" ? "bg-info/10 text-info border border-info/10" :
                          "bg-warning/10 text-warning border border-warning/10"
                        }`}>
                          {expense.mode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

            <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1">
              {subscriptionBills.map((sub, index) => (
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
              ))}
            </div>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
