import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Goal } from "@/models/Goal";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ goals });
  } catch (error: any) {
    console.error("GET Goals error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve goals." },
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
    const { title, targetAmount, savedAmount, targetDate, icon } = body;

    if (!title || !targetAmount) {
      return NextResponse.json(
        { error: "Title and target amount are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newGoal = await Goal.create({
      user: userId,
      title: title.trim(),
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount || 0),
      targetDate: targetDate ? new Date(targetDate) : undefined,
      icon: icon || "Target",
      contributions: savedAmount && parseFloat(savedAmount) > 0 ? [
        {
          amount: parseFloat(savedAmount),
          date: new Date(),
          note: "Initial savings log",
        }
      ] : [],
    });

    return NextResponse.json({
      message: "Goal created successfully",
      goal: newGoal,
    });
  } catch (error: any) {
    console.error("POST Goal error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create goal." },
      { status: 500 }
    );
  }
}
