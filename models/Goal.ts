import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IGoal extends Document {
  user: Types.ObjectId;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: Date;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    targetDate: { type: Date },
    icon: { type: String },
  },
  { timestamps: true }
);

export const Goal = models.Goal || model<IGoal>("Goal", GoalSchema);
