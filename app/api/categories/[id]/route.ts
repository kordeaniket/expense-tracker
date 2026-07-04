import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = await params;
    const body = await req.json();
    const { name, type, color, subcategories } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the category and ensure it belongs to the user
    const category = await Category.findOne({ _id: id, user: userId });
    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Check if new name conflicts with another category
    const duplicate = await Category.findOne({
      user: userId,
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Another category named "${name}" already exists.` },
        { status: 400 }
      );
    }

    // Update
    category.name = name.trim();
    category.type = type;
    category.color = color || category.color;
    category.subcategories = Array.isArray(subcategories)
      ? subcategories.map((sub) => sub.trim()).filter(Boolean)
      : [];

    await category.save();

    return NextResponse.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error: any) {
    console.error("PUT Category ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update category." },
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

    const result = await Category.findOneAndDelete({ _id: id, user: userId });
    if (!result) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Category ID error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete category." },
      { status: 500 }
    );
  }
}
