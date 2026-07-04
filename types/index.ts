export interface Expense {
  _id: string;
  amount: number;
  category: string;
  subCategory?: string;
  note?: string;
  date: string;
  mode: "UPI" | "Card" | "Cash" | "Bank" | "Other";
  receiptUrl?: string;
  isRecurring: boolean;
}

export interface Income {
  _id: string;
  amount: number;
  category: string;
  note?: string;
  date: string;
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

export interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  icon?: string;
}

export interface DashboardSummary {
  accountBalance: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalInvestment: number;
  categoryBreakdown: { category: string; total: number; color: string }[];
  monthlyTrend: { month: string; amount: number }[];
}
