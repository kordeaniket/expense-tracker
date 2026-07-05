import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IAsset extends Document {
  user: Types.ObjectId;
  name: string;
  type: "Savings" | "Stocks" | "Mutual Funds" | "FD" | "Gold" | "Other";
  amount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Savings", "Stocks", "Mutual Funds", "FD", "Gold", "Other"],
      required: true,
    },
    amount: { type: Number, required: true },
    note: { type: String },
  },
  { timestamps: true }
);

export const Asset = models.Asset || model<IAsset>("Asset", AssetSchema);
