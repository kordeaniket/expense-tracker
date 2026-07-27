import mongoose, { Schema, Document } from "mongoose";

export interface IRetailerSaleItem {
  name: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  subtotal: number;
}

export interface IRetailerSale extends Document {
  user: mongoose.Types.ObjectId;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: IRetailerSaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: string;
  status: "Paid" | "Partially Paid" | "Unpaid";
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
}

const RetailerSaleItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 }, // percentage or flat amount based on frontend calculation, we'll store the effective amount or percent, but typically we store amount or just rely on frontend for now. Let's assume percentage for consistency if needed, but since it's just data we trust the calculation.
  tax: { type: Number, default: 0 }, // percentage
  subtotal: { type: Number, required: true },
});

const RetailerSaleSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String },
    customerPhone: { type: String },
    customerEmail: { type: String },
    items: { type: [RetailerSaleItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    paymentMode: { type: String, required: true }, // e.g. "Cash", "UPI"
    status: {
      type: String,
      enum: ["Paid", "Partially Paid", "Unpaid"],
      required: true,
    },
    invoiceNumber: { type: String, required: true, unique: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

// We need to ensure we don't redefine the model if it's already compiled in a serverless environment
export const RetailerSale =
  mongoose.models.RetailerSale ||
  mongoose.model<IRetailerSale>("RetailerSale", RetailerSaleSchema);
