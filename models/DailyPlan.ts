import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IDailyPlan extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  frequency: "daily" | "once";
  date?: Date; // Only used for "once"
  time?: string; // Optional time, e.g. "18:00"
  completions: string[]; // List of YYYY-MM-DD date strings when completed
  createdAt: Date;
  updatedAt: Date;
}

const DailyPlanSchema = new Schema<IDailyPlan>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    frequency: {
      type: String,
      enum: ["daily", "once"],
      required: true,
      default: "daily",
    },
    date: { type: Date },
    time: { type: String },
    completions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const DailyPlan =
  models.DailyPlan || model<IDailyPlan>("DailyPlan", DailyPlanSchema);
