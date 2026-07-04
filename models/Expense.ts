import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IExpense extends Document {
  user: Types.ObjectId;
  amount: number;
  category: string;
  subCategory?: string;
  note?: string;
  date: Date;
  mode: "UPI" | "Card" | "Cash" | "Bank" | "Other";
  receiptUrl?: string;
  isRecurring: boolean;
  recurrenceInterval?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    note: { type: String },
    date: { type: Date, required: true, default: Date.now },
    mode: { type: String, enum: ["UPI", "Card", "Cash", "Bank", "Other"], default: "UPI" },
    receiptUrl: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurrenceInterval: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, date: -1 });

export const Expense = models.Expense || model<IExpense>("Expense", ExpenseSchema);
