import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Expense } from "@/models/Expense";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    return NextResponse.json({ expenses });
  } catch (error: any) {
    console.error("GET Expenses error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve expenses." },
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
    const {
      amount,
      category,
      subCategory,
      note,
      date,
      mode,
      isRecurring,
      recurrenceInterval,
    } = body;

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Amount and Category are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newExpense = await Expense.create({
      user: userId,
      amount: parseFloat(amount),
      category: category.trim(),
      subCategory: subCategory?.trim() || undefined,
      note: note?.trim() || undefined,
      date: date ? new Date(date) : new Date(),
      mode: mode || "UPI",
      isRecurring: !!isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
    });

    return NextResponse.json({
      message: "Expense recorded successfully",
      expense: newExpense,
    });
  } catch (error: any) {
    console.error("POST Expense error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record expense." },
      { status: 500 }
    );
  }
}
