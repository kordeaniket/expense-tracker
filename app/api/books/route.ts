import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Book } from "@/models/Book";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const books = await Book.find({ user: userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ books });
  } catch (error: any) {
    console.error("GET Books error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve books." },
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
    const { title, author, status, rating, keyPoints, notes, startDate, completedDate } = body;

    if (!title || !author) {
      return NextResponse.json(
        { error: "Title and author are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const newBook = await Book.create({
      user: userId,
      title: title.trim(),
      author: author.trim(),
      status: status || "to-read",
      rating: rating ? Number(rating) : 3,
      keyPoints: Array.isArray(keyPoints) ? keyPoints.map((kp: string) => kp.trim()).filter(Boolean) : [],
      notes: notes?.trim(),
      startDate: startDate ? new Date(startDate) : undefined,
      completedDate: completedDate ? new Date(completedDate) : undefined,
    });

    return NextResponse.json({
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error: any) {
    console.error("POST Book error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create book." },
      { status: 500 }
    );
  }
}
