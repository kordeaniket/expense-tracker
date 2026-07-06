import { Schema, model, models, type Document, type Types } from "mongoose";

export interface ISubscription extends Document {
  user: Types.ObjectId;
  name: string;
  amount: number;
  category: string;
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly";
  nextDueDate: Date;
  paymentMode: string;
  status: "active" | "paused" | "cancelled";
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    billingCycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: true,
      default: "monthly",
    },
    nextDueDate: { type: Date, required: true },
    paymentMode: { type: String, required: true, default: "Card" },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      required: true,
      default: "active",
    },
    note: { type: String },
  },
  { timestamps: true }
);

export const Subscription =
  models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);
