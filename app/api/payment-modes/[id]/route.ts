import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PaymentMode } from "@/models/PaymentMode";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { name, type, color } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the payment mode and ensure it belongs to the user
    const mode = await PaymentMode.findOne({ _id: id, user: userId });
    if (!mode) {
      return NextResponse.json({ error: "Payment mode not found." }, { status: 404 });
    }

    // Check if new name conflicts with another payment mode
    const duplicate = await PaymentMode.findOne({
      user: userId,
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Another payment mode named "${name}" already exists.` },
        { status: 400 }
      );
    }

    // Update
    mode.name = name.trim();
    mode.type = type;
    mode.color = color || mode.color;

    await mode.save();

    return NextResponse.json({
      message: "Payment mode updated successfully",
      paymentMode: mode,
    });
  } catch (error: any) {
    console.error("PUT PaymentMode ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update payment mode." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;

    await connectDB();

    const result = await PaymentMode.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Payment mode not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Payment mode deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE PaymentMode ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete payment mode." },
      { status: 500 }
    );
  }
}
