import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("GET Profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve profile." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      username,
      phone,
      image,
      currency,
      timezone,
      country,
      language,
    } = body;

    await connectDB();

    // Verify username uniqueness if provided and changed
    if (username && username.trim()) {
      const trimmedUsername = username.trim();
      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken by another account." },
          { status: 400 }
        );
      }
    }

    // Verify phone uniqueness if provided and changed
    if (phone && phone.trim()) {
      const trimmedPhone = phone.trim();
      const existingUser = await User.findOne({
        phone: trimmedPhone,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Mobile number is already registered to another account." },
          { status: 400 }
        );
      }
    }

    // Update user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: name?.trim() || undefined,
          username: username?.trim() || undefined,
          phone: phone?.trim() || undefined,
          image: image || undefined,
          currency: currency || "INR",
          timezone: timezone || undefined,
          country: country || undefined,
          language: language || undefined,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("PUT Profile error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
