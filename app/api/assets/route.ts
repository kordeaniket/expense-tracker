import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Asset } from "@/models/Asset";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const assets = await Asset.find({ user: userId }).sort({ type: 1, name: 1 });

    return NextResponse.json({ assets });
  } catch (error: any) {
    console.error("GET Assets error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve assets." },
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
    const { name, type, amount, note } = body;

    if (!name || !type || amount === undefined) {
      return NextResponse.json(
        { error: "Name, type, and amount are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const newAsset = await Asset.create({
      user: userId,
      name: name.trim(),
      type,
      amount: parseFloat(amount),
      note: note?.trim() || undefined,
    });

    return NextResponse.json({
      message: "Asset created successfully",
      asset: newAsset,
    });
  } catch (error: any) {
    console.error("POST Asset error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create asset." },
      { status: 500 }
    );
  }
}
