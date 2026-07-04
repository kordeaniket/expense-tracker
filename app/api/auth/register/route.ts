import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      username,
      phone,
      image,
      currency,
      timezone,
      country,
      language,
    } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (username && username.trim()) {
      const existingUsername = await User.findOne({ username: username.trim() });
      if (existingUsername) {
        return NextResponse.json(
          { error: "Username is already taken." },
          { status: 400 }
        );
      }
    }

    // Check if phone already exists (if provided)
    if (phone && phone.trim()) {
      const existingPhone = await User.findOne({ phone: phone.trim() });
      if (existingPhone) {
        return NextResponse.json(
          { error: "Mobile number is already registered." },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username?.trim() || undefined,
      phone: phone?.trim() || undefined,
      image: image || undefined,
      currency: currency || "INR",
      timezone: timezone || undefined,
      country: country || undefined,
      language: language || undefined,
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          phone: newUser.phone,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
