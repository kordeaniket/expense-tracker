import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IBudget extends Document {
  user: Types.ObjectId;
  category: string;
  monthlyLimit: number;
  month: number; // 1-12
  year: number;
  alertThreshold: number; // percentage, e.g. 80
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    monthlyLimit: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    alertThreshold: { type: Number, default: 80 },
  },
  { timestamps: true }
);

BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget = models.Budget || model<IBudget>("Budget", BudgetSchema);
