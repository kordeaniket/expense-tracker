import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { VisitedPlace } from "@/models/VisitedPlace";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = params;

    const body = await req.json();
    const { name, location, dateVisited, rating, notes, imageUrl } = body;

    await connectDB();

    const place = await VisitedPlace.findOne({ _id: id, userId });
    if (!place) {
      return NextResponse.json({ error: "Visited place not found" }, { status: 404 });
    }

    if (name) place.name = name.trim();
    if (location !== undefined) place.location = location?.trim();
    if (dateVisited) place.dateVisited = new Date(dateVisited);
    if (rating !== undefined) place.rating = Number(rating);
    if (notes !== undefined) place.notes = notes?.trim();
    if (imageUrl !== undefined) place.imageUrl = imageUrl?.trim();

    await place.save();

    return NextResponse.json({
      message: "Visited place updated successfully",
      visitedPlace: place,
    });
  } catch (error: any) {
    console.error("PUT Visited Place error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update visited place." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const { id } = params;

    await connectDB();

    const deletedPlace = await VisitedPlace.findOneAndDelete({ _id: id, userId });
    
    if (!deletedPlace) {
      return NextResponse.json({ error: "Visited place not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Visited place deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE Visited Place error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete visited place." },
      { status: 500 }
    );
  }
}
