import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBook extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  author: string;
  status: "to-read" | "reading" | "completed";
  rating: number;
  keyPoints: string[];
  notes?: string;
  startDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide the book title"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Please provide the author's name"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["to-read", "reading", "completed"],
      default: "to-read",
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: 3,
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for query optimization
bookSchema.index({ user: 1, status: 1, updatedAt: -1 });

export const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", bookSchema);
