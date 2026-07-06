import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { DailyPlan } from "@/models/DailyPlan";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const plans = await DailyPlan.find({ user: userId }).sort({ createdAt: -1 });

    return NextResponse.json({ plans });
  } catch (error: any) {
    console.error("GET Daily Plans error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve plans." },
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
    const { title, description, frequency, date, time } = body;

    if (!title || !frequency) {
      return NextResponse.json(
        { error: "Title and frequency are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newPlan = await DailyPlan.create({
      user: userId,
      title: title.trim(),
      description: description?.trim(),
      frequency,
      date: date ? new Date(date) : undefined,
      time: time || undefined,
      completions: [],
    });

    return NextResponse.json({
      message: "Plan created successfully",
      plan: newPlan,
    });
  } catch (error: any) {
    console.error("POST Daily Plan error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create plan." },
      { status: 500 }
    );
  }
}
