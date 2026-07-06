import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Goal } from "@/models/Goal";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { amount, note, date } = body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount === 0) {
      return NextResponse.json(
        { error: "A valid positive (deposit) or negative (withdraw) amount is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: id, user: userId });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    // Add contribution
    goal.contributions.push({
      amount: parsedAmount,
      date: date ? new Date(date) : new Date(),
      note: note?.trim() || (parsedAmount > 0 ? "Deposit" : "Withdrawal"),
    });

    // Update parent savedAmount
    goal.savedAmount = Math.max(0, goal.savedAmount + parsedAmount);

    await goal.save();

    return NextResponse.json({
      message: parsedAmount > 0 ? "Deposit logged successfully!" : "Withdrawal logged successfully!",
      goal,
    });
  } catch (error: any) {
    console.error("POST Goal Contribution error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record contribution." },
      { status: 500 }
    );
  }
}
