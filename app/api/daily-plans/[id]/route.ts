import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { DailyPlan } from "@/models/DailyPlan";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { title, description, frequency, date, time } = body;

    if (!title || !frequency) {
      return NextResponse.json(
        { error: "Title and frequency are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const plan = await DailyPlan.findOne({ _id: id, user: userId });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    plan.title = title.trim();
    plan.description = description?.trim() || "";
    plan.frequency = frequency;
    plan.date = date ? new Date(date) : undefined;
    plan.time = time || undefined;

    await plan.save();

    return NextResponse.json({
      message: "Plan updated successfully",
      plan,
    });
  } catch (error: any) {
    console.error("PUT Daily Plan error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update plan." },
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

    const result = await DailyPlan.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Plan deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Daily Plan error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete plan." },
      { status: 500 }
    );
  }
}
