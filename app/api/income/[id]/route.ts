import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Income } from "@/models/Income";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { amount, category, note, mode, date } = body;

    if (!amount || !category) {
      return NextResponse.json(
        { error: "Amount and Category are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const income = await Income.findOne({ _id: id, user: userId });
    if (!income) {
      return NextResponse.json({ error: "Income record not found." }, { status: 404 });
    }

    income.amount = parseFloat(amount);
    income.category = category.trim();
    income.note = note?.trim() || undefined;
    income.mode = mode?.trim() || income.mode || "Bank";
    income.date = date ? new Date(date) : income.date;

    await income.save();

    return NextResponse.json({
      message: "Income record updated successfully",
      income,
    });
  } catch (error: any) {
    console.error("PUT Income ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update income record." },
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

    const result = await Income.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Income record not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Income record deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Income ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete income record." },
      { status: 500 }
    );
  }
}
