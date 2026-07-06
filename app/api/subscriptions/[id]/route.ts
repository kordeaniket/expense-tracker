import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    
    const { name, amount, category, billingCycle, nextDueDate, paymentMode, status, note } = body;

    if (!name || !amount || !category || !billingCycle || !nextDueDate) {
      return NextResponse.json(
        { error: "Name, amount, category, billing cycle, and next due date are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const sub = await Subscription.findOne({ _id: id, user: userId });
    if (!sub) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    sub.name = name.trim();
    sub.amount = parseFloat(amount);
    sub.category = category.trim();
    sub.billingCycle = billingCycle;
    sub.nextDueDate = new Date(nextDueDate);
    sub.paymentMode = paymentMode || sub.paymentMode;
    sub.status = status || sub.status;
    sub.note = note !== undefined ? note.trim() : sub.note;

    await sub.save();

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription: sub,
    });
  } catch (error: any) {
    console.error("PUT Subscription error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update subscription." },
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

    const result = await Subscription.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Subscription not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Subscription deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Subscription error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete subscription." },
      { status: 500 }
    );
  }
}
