import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Asset } from "@/models/Asset";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { name, type, amount, note } = body;

    if (!name || !type || amount === undefined) {
      return NextResponse.json(
        { error: "Name, type, and amount are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    const asset = await Asset.findOne({ _id: id, user: userId });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    asset.name = name.trim();
    asset.type = type;
    asset.amount = parseFloat(amount);
    asset.note = note?.trim() || undefined;

    await asset.save();

    return NextResponse.json({
      message: "Asset updated successfully",
      asset,
    });
  } catch (error: any) {
    console.error("PUT Asset ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update asset." },
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

    const result = await Asset.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Asset not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Asset deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Asset ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete asset." },
      { status: 500 }
    );
  }
}
