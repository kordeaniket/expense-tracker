import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IIncome extends Document {
  user: Types.ObjectId;
  amount: number;
  category: string;
  note?: string;
  mode?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    note: { type: String },
    mode: { type: String, default: "Bank" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Income = models.Income || model<IIncome>("Income", IncomeSchema);
