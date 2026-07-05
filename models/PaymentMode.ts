import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IPaymentMode extends Document {
  user: Types.ObjectId;
  name: string;
  type: "UPI" | "Card" | "Cash" | "Bank" | "Other";
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentModeSchema = new Schema<IPaymentMode>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["UPI", "Card", "Cash", "Bank", "Other"],
      required: true,
      default: "UPI",
    },
    color: { type: String, default: "#6C5CE7" },
  },
  { timestamps: true }
);

// User should not have duplicate payment mode names
PaymentModeSchema.index({ user: 1, name: 1 }, { unique: true });

export const PaymentMode = models.PaymentMode || model<IPaymentMode>("PaymentMode", PaymentModeSchema);
