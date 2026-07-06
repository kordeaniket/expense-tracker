import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const subscriptions = await Subscription.find({ user: userId }).sort({ nextDueDate: 1 });

    return NextResponse.json({ subscriptions });
  } catch (error: any) {
    console.error("GET Subscriptions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve subscriptions." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, amount, category, billingCycle, nextDueDate, paymentMode, note, status } = body;

    if (!name || !amount || !category || !billingCycle || !nextDueDate) {
      return NextResponse.json(
        { error: "Name, amount, category, billing cycle, and next due date are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newSub = await Subscription.create({
      user: userId,
      name: name.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
      billingCycle,
      nextDueDate: new Date(nextDueDate),
      paymentMode: paymentMode || "Card",
      status: status || "active",
      note: note?.trim(),
    });

    return NextResponse.json({
      message: "Subscription created successfully",
      subscription: newSub,
    });
  } catch (error: any) {
    console.error("POST Subscription error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create subscription." },
      { status: 500 }
    );
  }
}
