import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { PaymentMode } from "@/models/PaymentMode";

const DEFAULT_PAYMENT_MODES = [
  {
    name: "Cash",
    type: "Cash",
    color: "#00B894",
  },
  {
    name: "UPI",
    type: "UPI",
    color: "#6C5CE7",
  },
  {
    name: "Card",
    type: "Card",
    color: "#FDCB6E",
  },
  {
    name: "Bank",
    type: "Bank",
    color: "#54A0FF",
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    let modes = await PaymentMode.find({ user: userId });

    // Seed default payment modes if user doesn't have any
    if (modes.length === 0) {
      const seeded = DEFAULT_PAYMENT_MODES.map((mode) => ({
        ...mode,
        user: userId,
      }));
      await PaymentMode.insertMany(seeded);
      modes = await PaymentMode.find({ user: userId });
    }

    return NextResponse.json({ paymentModes: modes });
  } catch (error: any) {
    console.error("GET PaymentModes error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve payment modes." },
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
    const { name, type, color } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if payment mode name already exists for this user (case-insensitive)
    const existing = await PaymentMode.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A payment mode named "${name}" already exists.` },
        { status: 400 }
      );
    }

    const newMode = await PaymentMode.create({
      user: userId,
      name: name.trim(),
      type,
      color: color || "#6C5CE7",
    });

    return NextResponse.json({
      message: "Payment mode created successfully",
      paymentMode: newMode,
    });
  } catch (error: any) {
    console.error("POST PaymentMode error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment mode." },
      { status: 500 }
    );
  }
}
