import { Schema, model, models, type Document, type Types } from "mongoose";

export interface ICategory extends Document {
  user: Types.ObjectId;
  name: string;
  type: "expense" | "income";
  color: string;
  icon?: string;
  subcategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["expense", "income"], default: "expense" },
    color: { type: String, default: "#6C5CE7" },
    icon: { type: String },
    subcategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Category = models.Category || model<ICategory>("Category", CategorySchema);
