import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";

const DEFAULT_CATEGORIES = [
  {
    name: "Food & Dining",
    type: "expense",
    color: "#6C5CE7",
    subcategories: ["Swiggy", "Zomato", "Restaurants", "Groceries"],
  },
  {
    name: "Shopping",
    type: "expense",
    color: "#00B894",
    subcategories: ["Amazon", "Myntra", "Flipkart", "Clothing", "Electronics"],
  },
  {
    name: "Travel & Transport",
    type: "expense",
    color: "#FD79A8",
    subcategories: ["Uber", "Ola", "Metro", "Petrol/Fuel", "Flight"],
  },
  {
    name: "Bills & Utilities",
    type: "expense",
    color: "#FF6B81",
    subcategories: ["Electricity", "WiFi", "Water", "Mobile Recharge"],
  },
  {
    name: "Entertainment",
    type: "expense",
    color: "#00CEC9",
    subcategories: ["Netflix", "Spotify", "Cinema", "Gaming"],
  },
  {
    name: "Investment",
    type: "expense",
    color: "#FFA000",
    subcategories: ["Mutual Funds", "Stocks", "Gold", "FD/RD"],
  },
  {
    name: "Salary",
    type: "income",
    color: "#0984e3",
    subcategories: ["Monthly Salary", "Bonus", "Freelance", "Interest"],
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

    let categories = await Category.find({ user: userId });

    // Seed default categories if user doesn't have any
    if (categories.length === 0) {
      const seeded = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        user: userId,
      }));
      await Category.insertMany(seeded);
      categories = await Category.find({ user: userId });
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("GET Categories error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve categories." },
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
    const { name, type, color, subcategories } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required fields." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if category name already exists for this user (case-insensitive)
    const existing = await Category.findOne({
      user: userId,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type,
    });

    if (existing) {
      return NextResponse.json(
        { error: `A category named "${name}" already exists.` },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      user: userId,
      name: name.trim(),
      type,
      color: color || "#6C5CE7",
      subcategories: Array.isArray(subcategories)
        ? subcategories.map((sub) => sub.trim()).filter(Boolean)
        : [],
    });

    return NextResponse.json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error: any) {
    console.error("POST Category error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create category." },
      { status: 500 }
    );
  }
}
