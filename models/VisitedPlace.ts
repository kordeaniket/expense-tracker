import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVisitedPlace extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  location?: string;
  dateVisited: Date;
  rating: number;
  notes?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitedPlaceSchema = new Schema<IVisitedPlace>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide the name of the place"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    dateVisited: {
      type: Date,
      required: [true, "Please provide the date visited"],
      default: Date.now,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
      default: 3,
    },
    notes: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VisitedPlace: Model<IVisitedPlace> =
  mongoose.models.VisitedPlace || mongoose.model<IVisitedPlace>("VisitedPlace", visitedPlaceSchema);
