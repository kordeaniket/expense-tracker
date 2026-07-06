export interface Expense {
  _id: string;
  amount: number;
  category: string;
  subCategory?: string;
  note?: string;
  date: string;
  mode: string;
  receiptUrl?: string;
  isRecurring: boolean;
}

export interface Income {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  mode?: string;
  date: string;
}

export interface Asset {
  _id: string;
  name: string;
  type: "Savings" | "Stocks" | "Mutual Funds" | "FD" | "Gold" | "Other";
  amount: number;
  note?: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  icon?: string;
}

export interface Budget {
  _id: string;
  category: string;
  monthlyLimit: number;
  month: number;
  year: number;
  alertThreshold: number;
}

export interface GoalContribution {
  amount: number;
  date: string;
  note?: string;
}

export interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  icon?: string;
  contributions?: GoalContribution[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  accountBalance: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalInvestment: number;
  categoryBreakdown: { category: string; total: number; color: string }[];
  monthlyTrend: { month: string; amount: number }[];
}

export interface Subscription {
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

export interface DailyPlan {
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
