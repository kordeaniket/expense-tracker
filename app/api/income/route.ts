import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Income } from "@/models/Income";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const incomes = await Income.find({ user: userId }).sort({ date: -1 });

    return NextResponse.json({ incomes });
  } catch (error: any) {
    console.error("GET Incomes error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve income records." },
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
    const { amount, category, note, mode, date } = body;

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Amount and Category are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newIncome = await Income.create({
      user: userId,
      amount: parseFloat(amount),
      category: category.trim(),
      note: note?.trim() || undefined,
      mode: mode?.trim() || "Bank",
      date: date ? new Date(date) : new Date(),
    });

    return NextResponse.json({
      message: "Income logged successfully",
      income: newIncome,
    });
  } catch (error: any) {
    console.error("POST Income error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to log income." },
      { status: 500 }
    );
  }
}
