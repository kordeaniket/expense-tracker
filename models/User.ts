import { Schema, model, models, type Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  currency: string;
  theme: "light" | "dark" | "system";
  username?: string;
  phone?: string;
  timezone?: string;
  country?: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    image: { type: String },
    currency: { type: String, default: "INR" },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    username: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    timezone: { type: String, trim: true },
    country: { type: String, trim: true },
    language: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
