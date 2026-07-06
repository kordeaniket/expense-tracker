import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { DailyPlan } from "@/models/DailyPlan";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { date } = body; // date string formatted as "YYYY-MM-DD"

    if (!date) {
      return NextResponse.json({ error: "Target date string is required." }, { status: 400 });
    }

    await connectDB();

    const plan = await DailyPlan.findOne({ _id: id, user: userId });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const index = plan.completions.indexOf(date);
    let isCompleted = false;

    if (index > -1) {
      // Remove completion
      plan.completions.splice(index, 1);
    } else {
      // Add completion
      plan.completions.push(date);
      isCompleted = true;
    }

    await plan.save();

    return NextResponse.json({
      message: isCompleted ? "Task marked completed!" : "Task marked incomplete!",
      isCompleted,
      plan,
    });
  } catch (error: any) {
    console.error("POST Toggle Completion error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to toggle completion status." },
      { status: 500 }
    );
  }
}
