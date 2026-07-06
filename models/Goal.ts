import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IContribution {
  amount: number;
  date: Date;
  note?: string;
}

export interface IGoal extends Document {
  user: Types.ObjectId;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: Date;
  icon?: string;
  contributions: IContribution[];
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema<IContribution>({
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String },
});

const GoalSchema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    targetDate: { type: Date },
    icon: { type: String },
    contributions: { type: [ContributionSchema], default: [] },
  },
  { timestamps: true }
);

export const Goal = models.Goal || model<IGoal>("Goal", GoalSchema);
