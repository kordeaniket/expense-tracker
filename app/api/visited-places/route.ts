import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VisitedPlace } from "@/models/VisitedPlace";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const visitedPlaces = await VisitedPlace.find({ userId }).sort({ dateVisited: -1, createdAt: -1 });

    return NextResponse.json({ visitedPlaces });
  } catch (error: any) {
    console.error("GET Visited Places error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve visited places." },
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
    const { name, location, dateVisited, rating, notes, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name of the place is required." },
        { status: 400 }
      );
    }

    await connectDB();

    const newPlace = await VisitedPlace.create({
      userId,
      name: name.trim(),
      location: location?.trim(),
      dateVisited: dateVisited ? new Date(dateVisited) : new Date(),
      rating: rating ? Number(rating) : 3,
      notes: notes?.trim(),
      imageUrl: imageUrl?.trim(),
    });

    return NextResponse.json({
      message: "Visited place added successfully",
      visitedPlace: newPlace,
    });
  } catch (error: any) {
    console.error("POST Visited Place error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create visited place." },
      { status: 500 }
    );
  }
}
