import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Goal } from "@/models/Goal";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { title, targetAmount, savedAmount, targetDate, icon } = body;

    if (!title || !targetAmount) {
      return NextResponse.json(
        { error: "Title and target amount are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const goal = await Goal.findOne({ _id: id, user: userId });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    goal.title = title.trim();
    goal.targetAmount = parseFloat(targetAmount);
    
    // If the saved amount is updated directly, we check if we need to log a contribution difference
    const diff = parseFloat(savedAmount || 0) - goal.savedAmount;
    if (diff !== 0) {
      goal.contributions.push({
        amount: diff,
        date: new Date(),
        note: `Adjustment update (direct modification)`,
      });
      goal.savedAmount = parseFloat(savedAmount);
    }

    goal.targetDate = targetDate ? new Date(targetDate) : undefined;
    goal.icon = icon || goal.icon;

    await goal.save();

    return NextResponse.json({
      message: "Goal updated successfully",
      goal,
    });
  } catch (error: any) {
    console.error("PUT Goal ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update goal." },
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

    const result = await Goal.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Goal deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Goal ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete goal." },
      { status: 500 }
    );
  }
}
