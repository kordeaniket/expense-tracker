import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Book } from "@/models/Book";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    const body = await req.json();
    const { title, author, status, rating, keyPoints, notes, startDate, completedDate } = body;

    await connectDB();

    const book = await Book.findOne({ _id: id, user: userId });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (status) book.status = status;
    if (rating !== undefined) book.rating = Number(rating);
    if (keyPoints !== undefined) {
      book.keyPoints = Array.isArray(keyPoints) ? keyPoints.map((kp: string) => kp.trim()).filter(Boolean) : [];
    }
    if (notes !== undefined) book.notes = notes?.trim();
    
    if (startDate !== undefined) {
      book.startDate = startDate ? new Date(startDate) : undefined;
    }
    if (completedDate !== undefined) {
      book.completedDate = completedDate ? new Date(completedDate) : undefined;
    }

    await book.save();

    return NextResponse.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error: any) {
    console.error("PUT Book error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update book." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = await params;

    await connectDB();

    const deletedBook = await Book.findOneAndDelete({ _id: id, user: userId });
    
    if (!deletedBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Book deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Book error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete book." },
      { status: 500 }
    );
  }
}
